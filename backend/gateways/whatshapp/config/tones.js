/**
 * Tone manifest for WhatsApp gateway UI/settings.
 * Prompt text lives in agent-core (ai/tones.py); this file only lists id + label + mode.
 */

export const TONE_LIST = [
  { id: "casual_friendly", label: "Friendly", mode: "casual" },
  { id: "casual_witty", label: "Witty", mode: "casual" },
  { id: "casual_empathetic", label: "Empathetic", mode: "casual" },
  { id: "casual_brief", label: "Brief", mode: "casual" },
  { id: "professional_formal", label: "Formal", mode: "professional" },
  { id: "professional_consultative", label: "Consultative", mode: "professional" },
  { id: "professional_supportive", label: "Supportive", mode: "professional" },
  { id: "professional_concise", label: "Concise", mode: "professional" },
];

export const DEFAULT_TONE_ID = "casual_friendly";

export function getToneById(id) {
  return TONE_LIST.find((t) => t.id === id) ?? { id: DEFAULT_TONE_ID, label: "Friendly", mode: "casual" };
}
