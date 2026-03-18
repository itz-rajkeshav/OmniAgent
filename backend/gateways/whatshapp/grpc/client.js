import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROTO_PATH = path.join(__dirname, "../../proto/omniagent.proto");

const AGENT_CORE_GRPC_ADDR =
  process.env.AGENT_CORE_GRPC_ADDR || "agent-core:50051";

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// basically it will mirror the .proto file ..like look like the js for the proto
const proto = grpc.loadPackageDefinition(packageDef);

const WhatsappService = proto.omniagent.WhatsappService;

const client = new WhatsappService(
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

export function saveAccount(userId, phoneNumber, jid) {
  return new Promise((resolve, reject) => {
    client.SaveAccount(
      { user_id: userId, phone_number: phoneNumber, jid },
      (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response);
      },
    );
  });
}

export function updateAccountStatus(userId, status, jid = null) {
  return new Promise((resolve, reject) => {
    const payload = { user_id: userId, status };
    if (jid) payload.jid = jid;
    client.UpdateAccountStatus(payload, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response);
    });
  });
}

export function getAccount(phoneNumber) {
  return new Promise((resolve, reject) => {
    client.GetAccount({ phone_number: phoneNumber }, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response);
    });
  });
}

export function updateAgentMode(userId, agentMode) {
  return new Promise((resolve, reject) => {
    client.UpdateAgentMode(
      { user_id: userId, agent_mode: agentMode },
      (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response);
      },
    );
  });
}

export function updateAgentTone(userId, agentTone) {
  return new Promise((resolve, reject) => {
    client.UpdateAgentTone(
      { user_id: userId, agent_tone: agentTone },
      (err, response) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(response);
      },
    );
  });
}