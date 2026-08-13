import grpc
import logging
import re
from concurrent import futures
from rpc.generated import omniagent_pb2, omniagent_pb2_grpc
from rpc.generated import messaging_pb2_grpc
from messaging.service import MessagingServicer
from db.supabase.connectDB import get_db_session
from db.supabase.crud.WhatshappAccount_crud import (
    create_whatshapp_account,
    get_whatshapp_account,
    update_whatshapp_account,
    update_whatshapp_account_by_phone,
    update_whatshapp_account_status_by_jid,
    update_whatshapp_account_agent_mode,
    update_whatshapp_account_agent_tone,
)
from db.supabase.crud.agent_schedule_crud import (
    bulk_upsert_agent_schedule,
    get_agent_schedule,
)
from ai.tones import is_valid_tone

logger = logging.getLogger(__name__)

GRPC_PORT = 50051
TIME_RE = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")
VALID_DAYS = set(range(7))


def _is_valid_time(value: str) -> bool:
    return bool(TIME_RE.match(value or ""))


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
                        agent_mode=getattr(account, "agent_mode", "casual"),
                        agent_tone=getattr(account, "agent_tone", "casual_friendly"),
                    )
                else:
                    account = create_whatshapp_account(
                        db,
                        user_id=request.user_id,
                        phone_number=request.phone_number,
                        jid=request.jid,
                        agent_mode="casual",  # TODO: pass from frontend when ready
                    )
                    logger.info(f"[SaveAccount] created new account for {request.user_id} phone={account['account'].phone_number} jid={account['account'].jid}")
                    return omniagent_pb2.SaveAccountResponse(
                        success=True,
                        message="Account created successfully",
                        phone_number=account["account"].phone_number,
                        jid=account["account"].jid,
                        status=account["account"].status,
                        agent_mode=account["account"].agent_mode,
                        agent_tone=getattr(account["account"], "agent_tone", "casual_friendly"),
                    )

        except Exception as e:
            logger.error(f"[SaveAccount] error: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return omniagent_pb2.SaveAccountResponse(success=False, message=str(e), phone_number="", jid="", status="", agent_mode="", agent_tone="")

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
                    acc = result["account"]
                    return omniagent_pb2.UpdateStatusResponse(
                        success=True,
                        message=f"Status updated to {request.status}",
                        phone_number=acc.phone_number,
                        jid=acc.jid,
                        status=acc.status,
                        agent_mode=getattr(acc, "agent_mode", "casual"),
                        agent_tone=getattr(acc, "agent_tone", "casual_friendly"),
                    )
                return omniagent_pb2.UpdateStatusResponse(
                    success=False,
                    phone_number="",
                    jid="",
                    status="",
                    message="Account not found",
                    agent_mode="",
                    agent_tone="",
                )

        except Exception as e:
            logger.error(f"[UpdateAccountStatus] error: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return omniagent_pb2.UpdateStatusResponse(success=False, message=str(e), phone_number="", jid="", status="", agent_mode="", agent_tone="")

  
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
                        agent_mode=getattr(account, "agent_mode", "casual"),
                        agent_tone=getattr(account, "agent_tone", "casual_friendly"),
                    )
                return omniagent_pb2.GetAccountResponse(found=False)

        except Exception as e:
            logger.error(f"[GetAccount] error: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return omniagent_pb2.GetAccountResponse(found=False)

    def UpdateAgentMode(self, request: omniagent_pb2.UpdateAgentModeRequest, context):
        logger.info(f"[UpdateAgentMode] user_id={request.user_id} agent_mode={request.agent_mode}")
        try:
            with get_db_session() as db:
                result = update_whatshapp_account_agent_mode(db, request.user_id, request.agent_mode)
                if result["status"] == "success":
                    acc = result["account"]
                    return omniagent_pb2.UpdateAgentModeResponse(
                        success=True,
                        message=f"Agent mode updated to {request.agent_mode}",
                        agent_mode=acc.agent_mode,
                        agent_tone=getattr(acc, "agent_tone", "casual_friendly"),
                    )
                return omniagent_pb2.UpdateAgentModeResponse(success=False, message="Agent mode not found", agent_mode="", agent_tone="")
        except Exception as e:
            logger.error(f"[UpdateAgentMode] error: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return omniagent_pb2.UpdateAgentModeResponse(success=False, message=str(e), agent_mode="", agent_tone="")

    def UpdateAgentTone(self, request: omniagent_pb2.UpdateAgentToneRequest, context):
        logger.info(f"[UpdateAgentTone] user_id={request.user_id} agent_tone={request.agent_tone}")
        if not is_valid_tone(request.agent_tone):
            return omniagent_pb2.UpdateAgentToneResponse(success=False, message=f"Invalid agent_tone: {request.agent_tone}", agent_tone="")
        try:
            with get_db_session() as db:
                result = update_whatshapp_account_agent_tone(db, request.user_id, request.agent_tone)
                if result["status"] == "success":
                    acc = result["account"]
                    return omniagent_pb2.UpdateAgentToneResponse(
                        success=True,
                        message=f"Agent tone updated to {request.agent_tone}",
                        agent_tone=getattr(acc, "agent_tone", "casual_friendly"),
                    )
                return omniagent_pb2.UpdateAgentToneResponse(success=False, message="Account not found", agent_tone="")
        except Exception as e:
            logger.error(f"[UpdateAgentTone] error: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return omniagent_pb2.UpdateAgentToneResponse(success=False, message=str(e), agent_tone="")

    def UpdateAgentSchedule(self, request: omniagent_pb2.UpdateAgentScheduleRequest, context):
        logger.info(f"[UpdateAgentSchedule] user_id={request.user_id} entries={len(request.entries)}")

        if not request.user_id:
            return omniagent_pb2.UpdateAgentScheduleResponse(success=False, message="user_id is required")
        if not request.entries:
            return omniagent_pb2.UpdateAgentScheduleResponse(success=False, message="entries are required")

        normalized_entries = []
        for entry in request.entries:
            if entry.day not in VALID_DAYS:
                return omniagent_pb2.UpdateAgentScheduleResponse(
                    success=False, message=f"Invalid day: {entry.day}. Must be 0-6."
                )
            if not _is_valid_time(entry.start_time):
                return omniagent_pb2.UpdateAgentScheduleResponse(
                    success=False, message=f"Invalid start_time for day={entry.day}: {entry.start_time}"
                )
            if not _is_valid_time(entry.end_time):
                return omniagent_pb2.UpdateAgentScheduleResponse(
                    success=False, message=f"Invalid end_time for day={entry.day}: {entry.end_time}"
                )
            normalized_entries.append(
                {
                    "day": entry.day,
                    "start_time": entry.start_time,
                    "end_time": entry.end_time,
                    "is_enabled": entry.is_enabled,
                }
            )

        try:
            with get_db_session() as db:
                result = bulk_upsert_agent_schedule(
                    db=db,
                    user_id=request.user_id,
                    entries=normalized_entries,
                )
                if result["status"] != "success":
                    return omniagent_pb2.UpdateAgentScheduleResponse(
                        success=False, message=result.get("message", "Failed to save schedule")
                    )
                return omniagent_pb2.UpdateAgentScheduleResponse(
                    success=True, message=result.get("message", "Schedule saved")
                )
        except Exception as e:
            logger.error(f"[UpdateAgentSchedule] error: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return omniagent_pb2.UpdateAgentScheduleResponse(success=False, message=str(e))

    def GetAgentSchedule(self, request: omniagent_pb2.GetAgentScheduleRequest, context):
        logger.info(f"[GetAgentSchedule] user_id={request.user_id}")
        if not request.user_id:
            return omniagent_pb2.GetAgentScheduleResponse(found=False, entries=[])
        try:
            with get_db_session() as db:
                result = get_agent_schedule(db, request.user_id)
                if result["status"] != "success":
                    return omniagent_pb2.GetAgentScheduleResponse(found=False, entries=[])

                entries = [
                    omniagent_pb2.ScheduleEntry(
                        day=entry.day,
                        start_time=entry.start_time,
                        end_time=entry.end_time,
                        is_enabled=entry.is_enabled,
                    )
                    for entry in result["entries"]
                ]
                return omniagent_pb2.GetAgentScheduleResponse(found=True, entries=entries)
        except Exception as e:
            logger.error(f"[GetAgentSchedule] error: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return omniagent_pb2.GetAgentScheduleResponse(found=False, entries=[])
# created 10 threaded pool 
def serve() -> grpc.Server:
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10),
        options=[
            ("grpc.max_send_message_length",    10 * 1024 * 1024),  # 10 MB
            ("grpc.max_receive_message_length", 10 * 1024 * 1024),
        ],
    )
    omniagent_pb2_grpc.add_WhatsappServiceServicer_to_server(WhatsappServicer(), server)
    messaging_pb2_grpc.add_MessagingServiceServicer_to_server(MessagingServicer(), server)
    server.add_insecure_port(f"0.0.0.0:{GRPC_PORT}")
    server.start()
    logger.info(f"gRPC server listening on port {GRPC_PORT}")
    return server


def stop(server: grpc.Server) -> None:
    server.stop(grace=5)
    logger.info("gRPC server stopped")
