import grpc
import logging
from concurrent import futures
from rpc.generated import omniagent_pb2, omniagent_pb2_grpc
from db.supabase.connectDB import get_db_session
from db.supabase.crud.WhatshappAccount_crud import (
    create_whatshapp_account,
    get_whatshapp_account,
    update_whatshapp_account,
)

logger = logging.getLogger(__name__)

GRPC_PORT = 50051


class WhatsappServicer(omniagent_pb2_grpc.WhatsappServiceServicer):

    def SaveAccount(self, request: omniagent_pb2.SaveAccountRequest, context):
        logger.info(f"[SaveAccount] user_id={request.user_id} jid={request.jid}")
        try:
            with get_db_session() as db:
                existing = get_whatshapp_account(db, request.user_id)

                if existing["status"] == "success":
                    update_whatshapp_account(
                        db,
                        user_id=request.user_id,
                        phone_number=request.phone_number,
                        jid=request.jid,
                        status="active",
                    )
                    logger.info(f"[SaveAccount] updated existing account for {request.user_id}")
                    return omniagent_pb2.SaveAccountResponse(
                        success=True,
                        message="Account updated to active",
                    )
                else:
                    account = create_whatshapp_account(
                        db,
                        user_id=request.user_id,
                        phone_number=request.phone_number,
                        jid=request.jid,
                    )
                    logger.info(f"[SaveAccount] created new account for {request.user_id} with phone number {account['account'].phone_number} and jid {account['account'].jid}")
                    return omniagent_pb2.SaveAccountResponse(
                        success=True,
                        message="Account created successfully",
                        account=account["account"].phone_number,
                        jid=account["account"].jid,
                        status=account["account"].status,
                    )

        except Exception as e:
            logger.error(f"[SaveAccount] error: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return omniagent_pb2.SaveAccountResponse(success=False, message=str(e), account=None, phone_number=None, jid=None, status=None)

    def UpdateAccountStatus(self, request: omniagent_pb2.UpdateStatusRequest, context):
        logger.info(f"[UpdateAccountStatus] user_id={request.user_id} status={request.status}")
        try:
            with get_db_session() as db:
                result = update_whatshapp_account(
                    db,
                    user_id=request.user_id,
                    status=request.status,
                )
                if result["status"] == "success":
                    return omniagent_pb2.UpdateStatusResponse(
                        success=True,
                        message=f"Status updated to {request.status}",
                        account=result["account"].phone_number,
                        jid=result["account"].jid,
                        status=result["account"].status,
                    )
                return omniagent_pb2.UpdateStatusResponse(
                    success=False,
                    account=None,
                    phone_number=None,
                    jid=None,
                    status=None,
                    message="Account not found",
                )

        except Exception as e:
            logger.error(f"[UpdateAccountStatus] error: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return omniagent_pb2.UpdateStatusResponse(success=False, message=str(e), account=None, phone_number=None, jid=None, status=None)

  
    def GetAccount(self, request: omniagent_pb2.GetAccountRequest, context):
        logger.info(f"[GetAccount] user_id={request.user_id}")
        try:
            with get_db_session() as db:
                result = get_whatshapp_account(db, request.user_id)
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
