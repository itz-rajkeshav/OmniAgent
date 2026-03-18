import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROTO_PATH = path.join(__dirname, "../proto/messaging.proto");

const AGENT_CORE_GRPC_ADDR =
  process.env.AGENT_CORE_GRPC_ADDR || "agent-core:50051";

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDef);
const MessagingService = proto.omniagent.messaging.MessagingService;

const client = new MessagingService(
  AGENT_CORE_GRPC_ADDR,
  grpc.credentials.createInsecure(),
  {
    "grpc.enable_retries": 1,
    "grpc.service_config": JSON.stringify({
      methodConfig: [
        {
          name: [{}],
          retryPolicy: {
            maxAttempts: 5,
            initialBackoff: "1s",
            maxBackoff: "10s",
            backoffMultiplier: 2,
            retryableStatusCodes: ["UNAVAILABLE"],
          },
        },
      ],
    }),
    "grpc.keepalive_time_ms": 30000,
    "grpc.keepalive_timeout_ms": 10000,
  },
);


export function processMessage(
  userId,
  jid,
  incomingText,
  conversationHistory,
  toneId,
) {
  const history = (conversationHistory || []).map((m) => ({
    text: m.text || "",
    from_me: Boolean(m.fromMe),
    timestamp: Number(m.timestamp) || 0,
  }));

  return new Promise((resolve, reject) => {
    client.ProcessMessage(
      {
        user_id: userId,
        jid,
        incoming_text: incomingText || "",
        conversation_history: history,
        tone_id: toneId || "casual_friendly",
      },
      (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          success: Boolean(response.success),
          reply_text: response.reply_text || "",
          error: response.error || "",
        });
      },
    );
  });
}
