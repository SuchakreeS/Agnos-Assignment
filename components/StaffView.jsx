"use client";

// Real-time staff monitoring dashboard — read-only mirror of PatientForm.
import { useEffect, useMemo, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import StatusIndicator from "./StatusIndicator";

const IDLE_THRESHOLD_MS = 30000;
const SUBMITTED_RESET_MS = 10000;
const TICK_INTERVAL_MS = 1000;

// Keep labels/keys in sync with PatientForm.jsx's formData shape.
const DISPLAY_FIELDS = [
  { label: "First Name", key: "firstName" },
  { label: "Middle Name", key: "middleName" },
  { label: "Last Name", key: "lastName" },
  { label: "Date of Birth", key: "dateOfBirth" },
  { label: "Gender", key: "gender" },
  { label: "Phone Number", key: "phoneNumber" },
  { label: "Email", key: "email" },
  { label: "Address", key: "address" },
  { label: "Preferred Language", key: "preferredLanguage" },
  { label: "Nationality", key: "nationality" },
  { label: "Emergency Contact Name", key: "eContactName" },
  { label: "Emergency Contact Relationship", key: "eContactRelationship" },
  { label: "Religion", key: "religion" },
];

export default function StaffView() {
  const { connectionStatus, lastMessage } = useWebSocket("staff");
  const [now, setNow] = useState(Date.now());

  // Re-render periodically so "Actively Filling" ages into "Idle", and a
  // "Submitted" patient ages out back to "Not Started", without needing a
  // new message to arrive to trigger a render.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // Once a submission has been visible for SUBMITTED_RESET_MS, treat it as
  // if no message had arrived — clears both the status badge and the
  // displayed fields, freeing the view for the next patient.
  const isSubmissionExpired =
    lastMessage?.type === "submit" &&
    now - lastMessage.timestamp >= SUBMITTED_RESET_MS;
  const effectiveMessage = isSubmissionExpired ? null : lastMessage;

  const status = useMemo(() => {
    if (!effectiveMessage) return "not-started";
    if (effectiveMessage.type === "submit") return "submitted";
    const elapsed = now - effectiveMessage.timestamp;
    return elapsed < IDLE_THRESHOLD_MS ? "filling" : "idle";
  }, [effectiveMessage, now]);

  const data = effectiveMessage?.data ?? {};

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">
          Patient Monitoring
        </h1>
        <div className="flex items-center gap-3">
          {connectionStatus !== "open" && (
            <span className="text-xs text-amber-600">
              {connectionStatus === "connecting"
                ? "Connecting…"
                : "Reconnecting…"}
            </span>
          )}
          <StatusIndicator status={status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 md:grid-cols-2">
        {DISPLAY_FIELDS.map(({ label, key }) => (
          <div key={key} className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <span
              className={`text-sm ${data[key] ? "text-gray-900" : "text-gray-300"}`}
            >
              {data[key] || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
