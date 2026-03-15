"""
gRPC MessagingServicer: ProcessMessage RPC implementation.
"""
import asyncio
import logging

import grpc
from rpc.generated import messaging_pb2, messaging_pb2_grpc
from messaging.handler import process_message

logger = logging.getLogger(__name__)


class MessagingServicer(messaging_pb2_grpc.MessagingServiceServicer):

    def ProcessMessage(self, request, context):
        user_id = request.user_id or ""
        jid = request.jid or ""
        incoming_text = request.incoming_text or ""
        tone_id = (request.tone_id or "").strip() or None

        history_tuples = []
        for msg in request.conversation_history:
            text = msg.text or ""
            from_me = bool(msg.from_me)
            ts = int(msg.timestamp) if msg.timestamp else 0
            history_tuples.append((text, from_me, ts))

        try:
            loop = asyncio.new_event_loop()
            try:
                success, reply_text = loop.run_until_complete(
                    process_message(
                        user_id=user_id,
                        jid=jid,
                        incoming_text=incoming_text,
                        conversation_history=history_tuples,
                        tone_id=tone_id,
                    )
                )
            finally:
                loop.close()
            return messaging_pb2.ProcessMessageResponse(
                success=success,
                reply_text=reply_text or "",
                error="" if success else (reply_text or "Unknown error"),
            )
        except Exception as e:
            logger.exception("ProcessMessage error: %s", e)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return messaging_pb2.ProcessMessageResponse(
                success=False,
                reply_text="",
                error=str(e),
            )
