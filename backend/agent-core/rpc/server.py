import grpc
import logging
from concurrent import futures
from rpc.generated import omniagent_pb2, omniagent_pb2_grpc
from db.supabase.connectDB import get_db_session
from db.supabase.crud.WhatshappAccount_crud import (
    create_whatshapp_account,
    get_whatshapp_account,
    update_whatshapp_account,
    update_whatshapp_account_by_phone,
    update_whatshapp_account_status_by_jid,
)

logger = logging.getLogger(__name__)

GRPC_PORT = 50051


class WhatsappServicer(omniagent_pb2_grpc.WhatsappServiceServicer):

    def SaveAccount(self, request: omniagent_pb2.SaveAccountRequest, context):
        logger.info(f"[SaveAccount] user_id={request.user_id} phone={request.phone_number} jid={request.jid}")
        try:
            with get_db_session() as db:
                existing = get_whatshapp_account(db, request.phone_number)

                if existing["status"] == "success":
                    result = update_whatshapp_account_by_phone(
                        db,
                        phone_number=request.phone_number,
                        user_id=request.user_id,
                        jid=request.jid,
                        status="active",
                    )
                    account = result["account"]
                    logger.info(f"[SaveAccount] updated existing account (phone={request.phone_number}) -> user_id={request.user_id} active")
                    return omniagent_pb2.SaveAccountResponse(
                        success=True,
                        message="Account updated to active",
                        phone_number=account.phone_number,
                        jid=account.jid,
                        status=account.status,
                    )
                else:
                    account = create_whatshapp_account(
                        db,
                        user_id=request.user_id,
                        phone_number=request.phone_number,
                        jid=request.jid,
                    )
                    logger.info(f"[SaveAccount] created new account for {request.user_id} phone={account['account'].phone_number} jid={account['account'].jid}")
                    return omniagent_pb2.SaveAccountResponse(
                        success=True,
                        message="Account created successfully",
                        phone_number=account["account"].phone_number,
                        jid=account["account"].jid,
                        status=account["account"].status,
                    )

        except Exception as e:
            logger.error(f"[SaveAccount] error: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return omniagent_pb2.SaveAccountResponse(success=False, message=str(e), phone_number="", jid="", status="")

    def UpdateAccountStatus(self, request: omniagent_pb2.UpdateStatusRequest, context):
        logger.info(f"[UpdateAccountStatus] user_id={request.user_id} status={request.status} jid={getattr(request, 'jid', '') or ''}")
        try:
            with get_db_session() as db:
                # Prefer jid when provided (logout: row may have been reassigned to another user_id)
                if getattr(request, "jid", None):
                    result = update_whatshapp_account_status_by_jid(
                        db, jid=request.jid, status=request.status
                    )
                else:
                    result = update_whatshapp_account(
                        db,
                        user_id=request.user_id,
                        status=request.status,
                    )
                if result["status"] == "success":
                    return omniagent_pb2.UpdateStatusResponse(
                        success=True,
                        message=f"Status updated to {request.status}",
                        phone_number=result["account"].phone_number,
                        jid=result["account"].jid,
                        status=result["account"].status,
                    )
                return omniagent_pb2.UpdateStatusResponse(
                    success=False,
                    phone_number="",
                    jid="",
                    status="",
                    message="Account not found",
                )

        except Exception as e:
            logger.error(f"[UpdateAccountStatus] error: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return omniagent_pb2.UpdateStatusResponse(success=False, message=str(e), phone_number="", jid="", status="")

  
    def GetAccount(self, request: omniagent_pb2.GetAccountRequest, context):
        logger.info(f"[GetAccount] phone_number={request.phone_number}")
        try:
            with get_db_session() as db:
                result = get_whatshapp_account(db, request.phone_number)
                if result["status"] == "success":
                    account = result["account"]
                    return omniagent_pb2.GetAccountResponse(
                        found=True,
                        user_id=account.user_id,
                        phone_number=account.phone_number,
                        jid=account.jid,
                        status=account.status,
                    )
                return omniagent_pb2.GetAccountResponse(found=False)

        except Exception as e:
            logger.error(f"[GetAccount] error: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return omniagent_pb2.GetAccountResponse(found=False)


def serve() -> grpc.Server:
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10),
        options=[
            ("grpc.max_send_message_length",    10 * 1024 * 1024),  # 10 MB
            ("grpc.max_receive_message_length", 10 * 1024 * 1024),
        ],
    )
    omniagent_pb2_grpc.add_WhatsappServiceServicer_to_server(WhatsappServicer(), server)
    server.add_insecure_port(f"0.0.0.0:{GRPC_PORT}")
    server.start()
    logger.info(f"gRPC server listening on port {GRPC_PORT}")
    return server


def stop(server: grpc.Server) -> None:
    server.stop(grace=5)
    logger.info("gRPC server stopped")
