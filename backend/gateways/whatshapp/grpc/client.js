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

export function updateAgentSchedule(userId, entries, timezone) {
  return new Promise((resolve, reject) => {
    client.UpdateAgentSchedule(
      { user_id: userId, entries: entries || [], timezone: timezone || "Asia/Kolkata" },
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

export function getAgentSchedule(userId) {
  return new Promise((resolve, reject) => {
    client.GetAgentSchedule({ user_id: userId }, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response);
    });
  });
}