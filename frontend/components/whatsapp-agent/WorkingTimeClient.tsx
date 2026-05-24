"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  SunMedium,
  MoonStar,
  ShieldCheck,
} from "lucide-react";
import { GATEWAY_URL } from "@/lib/constants";

type ScheduleEntry = {
  day: number;
  start_time: string;
  end_time: string;
  is_enabled: boolean;
};

type PresetKey = "office" | "always-on" | "support";

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const OFFICE_HOURS = ["09:00", "18:00"];
const SUPPORT_HOURS = ["10:00", "19:00"];

function createEntry(
  day: number,
  start_time: string,
  end_time: string,
  is_enabled: boolean,
): ScheduleEntry {
  return { day, start_time, end_time, is_enabled };
}

function buildPresetSchedule(preset: PresetKey): ScheduleEntry[] {
  if (preset === "always-on") {
    return DAY_NAMES.map((_, day) => createEntry(day, "00:00", "23:59", true));
  }

  if (preset === "support") {
    return DAY_NAMES.map((_, day) =>
      day < 6
        ? createEntry(day, SUPPORT_HOURS[0], SUPPORT_HOURS[1], true)
        : createEntry(day, SUPPORT_HOURS[0], SUPPORT_HOURS[1], false),
    );
  }

  return DAY_NAMES.map((_, day) =>
    day < 5
      ? createEntry(day, OFFICE_HOURS[0], OFFICE_HOURS[1], true)
      : createEntry(day, OFFICE_HOURS[0], OFFICE_HOURS[1], false),
  );
}

function normalizeSchedule(entries: ScheduleEntry[]) {
  const map = new Map(entries.map((entry) => [entry.day, entry]));
  return DAY_NAMES.map(
    (_, day) =>
      map.get(day) ??
      createEntry(day, OFFICE_HOURS[0], OFFICE_HOURS[1], day < 5),
  );
}

function isSameSchedule(a: ScheduleEntry[], b: ScheduleEntry[]) {
  return a.every((entry, index) => {
    const other = b[index];
    return (
      other &&
      entry.day === other.day &&
      entry.start_time === other.start_time &&
      entry.end_time === other.end_time &&
      entry.is_enabled === other.is_enabled
    );
  });
}

function parseMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

function formatRange(startTime: string, endTime: string) {
  return `${startTime} - ${endTime}`;
}

function buildSummary(entries: ScheduleEntry[]) {
  const enabledEntries = entries.filter((entry) => entry.is_enabled);
  const totalMinutes = enabledEntries.reduce((sum, entry) => {
    const start = parseMinutes(entry.start_time);
    const end = parseMinutes(entry.end_time);
    return sum + Math.max(0, end - start);
  }, 0);

  const firstStart = enabledEntries.length
    ? enabledEntries.reduce(
        (earliest, entry) =>
          entry.start_time < earliest ? entry.start_time : earliest,
        enabledEntries[0].start_time,
      )
    : "--:--";

  const lastEnd = enabledEntries.length
    ? enabledEntries.reduce(
        (latest, entry) => (entry.end_time > latest ? entry.end_time : latest),
        enabledEntries[0].end_time,
      )
    : "--:--";

  return { totalMinutes, firstStart, lastEnd, enabledEntries };
}

export function WorkingTimeClient({ userId }: { userId: string }) {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(() =>
    buildPresetSchedule("office"),
  );
  const [initialSchedule, setInitialSchedule] = useState<ScheduleEntry[]>(() =>
    buildPresetSchedule("office"),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(
          `${GATEWAY_URL}/whatshapp/get-agent-schedule/${userId}`,
        );
        const data = await res.json();

        if (
          data.success &&
          data.found &&
          Array.isArray(data.entries) &&
          data.entries.length > 0
        ) {
          const normalizedSchedule = normalizeSchedule(data.entries);
          setSchedule(normalizedSchedule);
          setInitialSchedule(normalizedSchedule);
        } else {
          const fallbackSchedule = buildPresetSchedule("office");
          setSchedule(fallbackSchedule);
          setInitialSchedule(fallbackSchedule);
        }
      } catch (fetchError) {
        console.error("Failed to load schedule:", fetchError);
        const fallbackSchedule = buildPresetSchedule("office");
        setSchedule(fallbackSchedule);
        setInitialSchedule(fallbackSchedule);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [userId]);

  const summary = useMemo(() => buildSummary(schedule), [schedule]);
  const hasChanges = !isSameSchedule(schedule, initialSchedule);
  const activeCount = summary.enabledEntries.length;
  const averageMinutes =
    activeCount > 0 ? Math.round(summary.totalMinutes / activeCount) : 0;

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2500);
  };

  const updateDay = (day: number, patch: Partial<ScheduleEntry>) => {
    setSchedule((current) =>
      current.map((entry) =>
        entry.day === day ? { ...entry, ...patch } : entry,
      ),
    );
  };

  const applyPreset = (preset: PresetKey) => {
    setSchedule(buildPresetSchedule(preset));
    setError(null);
  };

  const resetSchedule = () => {
    setSchedule(initialSchedule);
    setError(null);
  };

  const saveSchedule = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `${GATEWAY_URL}/whatshapp/set-agent-schedule/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: schedule }),
        },
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save schedule");
      }

      setInitialSchedule(schedule);
      showToast("Working time saved successfully.");
    } catch (saveError: unknown) {
      console.error("Failed to save schedule:", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your schedule.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#128C7E]" />
          <p className="text-[#667781] font-medium">
            Loading working-time settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#111B21] text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-[#E9EDEF] shadow-xl shadow-slate-200/40 relative overflow-hidden">
        <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-[#25D366]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#128C7E]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#25D366] to-[#128C7E] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/25">
                <Clock3 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#111B21] tracking-tight">
                  Working Time
                </h1>
                <p className="text-[#667781] mt-1 max-w-2xl">
                  Define the weekly windows when the WhatsApp agent is allowed
                  to reply automatically.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => applyPreset("office")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E9EDEF] bg-white text-sm font-semibold text-[#111B21] hover:border-[#128C7E] hover:text-[#128C7E] transition-colors"
              >
                <SunMedium className="w-4 h-4" />
                Office Hours
              </button>
              <button
                type="button"
                onClick={() => applyPreset("always-on")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E9EDEF] bg-white text-sm font-semibold text-[#111B21] hover:border-[#128C7E] hover:text-[#128C7E] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                24/7
              </button>
              <button
                type="button"
                onClick={() => applyPreset("support")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E9EDEF] bg-white text-sm font-semibold text-[#111B21] hover:border-[#128C7E] hover:text-[#128C7E] transition-colors"
              >
                <MoonStar className="w-4 h-4" />
                Support Shift
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <MetricCard
              icon={<CalendarDays className="w-5 h-5" />}
              label="Enabled days"
              value={`${activeCount}/7`}
              description="Days the agent can respond"
            />
            <MetricCard
              icon={<Clock3 className="w-5 h-5" />}
              label="Average window"
              value={activeCount > 0 ? formatMinutes(averageMinutes) : "--"}
              description="Average enabled day length"
            />
          </div>

          <div className="bg-white rounded-3xl border border-[#E9EDEF] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E9EDEF] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#111B21]">
                  Weekly Schedule
                </h2>
                <p className="text-sm text-[#667781] mt-1">
                  Each row mirrors the backend schedule entry for that weekday.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E9EDEF]">
              {schedule.map((entry) => {
                const dayName = DAY_NAMES[entry.day];
                const isActive = entry.is_enabled;
                return (
                  <motion.div
                    key={entry.day}
                    layout
                    className={`p-5 flex flex-col lg:flex-row lg:items-center gap-6 transition-colors ${isActive ? "bg-white hover:bg-slate-50/50" : "bg-[#F9FAFB] opacity-80"}`}
                  >
                    <div className="flex items-center justify-between lg:w-56 shrink-0">
                      <div>
                        <p
                          className={`font-bold ${isActive ? "text-[#111B21]" : "text-[#7B8B95]"}`}
                        >
                          {dayName}
                        </p>
                        <p className="text-xs text-[#667781] mt-0.5">
                          Day {entry.day + 1} of the weekly schedule
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateDay(entry.day, { is_enabled: !isActive })
                        }
                        className={`relative w-12 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 ${isActive ? "bg-[#25D366]" : "bg-[#D9DFE8]"}`}
                        aria-pressed={isActive}
                        role="switch"
                      >
                        <span
                          className={`absolute left-[2px] top-[2px] w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${isActive ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TimeField
                        label="Starts"
                        value={entry.start_time}
                        disabled={!isActive}
                        onChange={(value) =>
                          updateDay(entry.day, { start_time: value })
                        }
                      />
                      <TimeField
                        label="Ends"
                        value={entry.end_time}
                        disabled={!isActive}
                        onChange={(value) =>
                          updateDay(entry.day, { end_time: value })
                        }
                      />
                    </div>

                    <div className="lg:w-40 flex lg:justify-end shrink-0">
                      <span
                        className={`inline-flex min-w-[120px] justify-center items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isActive ? "bg-[#25D366]/10 text-[#128C7E]" : "bg-[#E9EDEF] text-[#667781]"}`}
                      >
                        {isActive ? (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        ) : (
                          <RefreshCcw className="w-3.5 h-3.5" />
                        )}
                        {isActive
                          ? formatRange(entry.start_time, entry.end_time)
                          : "Closed"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="gap-6 mt-6">
            <div className="bg-white rounded-3xl border border-[#E9EDEF] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111B21]">Preview</h2>
                  <p className="text-sm text-[#667781]">
                    How the schedule will behave
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <PreviewRow
                  label="Enabled windows"
                  value={`${activeCount} day${activeCount === 1 ? "" : "s"}`}
                />
                <PreviewRow label="First opening" value={summary.firstStart} />
                <PreviewRow label="Last closing" value={summary.lastEnd} />
              </div>

              <div className="mt-6 rounded-2xl bg-[#F7F8FA] border border-[#E9EDEF] p-4">
                <p className="text-sm font-semibold text-[#111B21] mb-2">
                  Enabled days
                </p>
                <div className="flex flex-wrap gap-2">
                  {schedule
                    .filter((entry) => entry.is_enabled)
                    .map((entry) => (
                      <span
                        key={entry.day}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#111B21] border border-[#E9EDEF]"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                        {DAY_NAMES[entry.day]}
                      </span>
                    ))}
                  {activeCount === 0 && (
                    <span className="text-sm text-[#667781]">
                      No active days selected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#667781]">
              <RefreshCcw className="w-4 h-4" />
              {hasChanges
                ? "Unsaved changes detected"
                : "Schedule is up to date"}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetSchedule}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#E9EDEF] bg-white text-sm font-bold text-[#111B21] hover:border-[#128C7E] hover:text-[#128C7E] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                type="button"
                onClick={saveSchedule}
                disabled={isSaving || !hasChanges}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#128C7E] text-white text-sm font-bold shadow-lg shadow-[#128C7E]/20 hover:bg-[#075E54] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E9EDEF] bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#667781] uppercase tracking-wider">
            {label}
          </p>
          <div className="text-3xl font-extrabold text-[#111B21] tracking-tight">
            {value}
          </div>
          <p className="text-sm font-medium text-[#667781] pt-1">
            {description}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-[#f0f9f6] text-[#128C7E] flex items-center justify-center shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TimeField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <label
      className={`group relative flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${disabled ? "border-[#E9EDEF] bg-[#F7F8FA] opacity-60" : "border-[#D9DFE8] bg-white hover:border-[#128C7E]/50 focus-within:border-[#128C7E] focus-within:ring-1 focus-within:ring-[#128C7E]"}`}
    >
      <div className="flex flex-col w-full">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#667781] mb-0.5">
          {label}
        </span>
        <input
          type="time"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm font-bold text-[#111B21] outline-none disabled:cursor-not-allowed"
        />
      </div>
      <Clock3
        className={`w-4 h-4 shrink-0 transition-colors ${disabled ? "text-[#D9DFE8]" : "text-[#667781] group-hover:text-[#128C7E]"}`}
      />
    </label>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E9EDEF] bg-[#F7F8FA] px-4 py-3">
      <span className="text-sm text-[#667781]">{label}</span>
      <span className="text-sm font-semibold text-[#111B21] text-right truncate">
        {value}
      </span>
    </div>
  );
}
