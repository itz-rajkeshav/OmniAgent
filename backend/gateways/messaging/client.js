import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// proto-loader compiles .proto file
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
// buils js services
const client = new MessagingService(
  AGENT_CORE_GRPC_ADDR,
  grpc.credentials.createInsecure(),
);

export function processMessage(
  userId,
  jid,
  incomingText,
  conversationHistory,
  toneId,
) {
  // it shapes
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
