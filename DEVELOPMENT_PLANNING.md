# Development Planning

Notes on how this is built and why. Written for whoever reads this next (including future me).

## Project Structure

```
app/
  page.js               - landing page, links to /patient and /staff
  patient/page.js        - renders <PatientForm />
  staff/page.js           - renders <StaffView />

components/
  PatientForm.jsx       - the patient-facing form, owns the form state
  FormFields.jsx          - one reusable field (label + input/select + error text)
  StaffView.jsx            - the staff-facing dashboard, read-only
  StatusIndicator.jsx       - just the colored badge, no logic of its own

hooks/
  useFormValidation.js  - pure function, no state — takes formData, returns errors
  useWebSocket.js         - all the WebSocket plumbing, used by both pages

server/
  websocket-server.js   - standalone Node process, the WebSocket server
```

Why split like this: `PatientForm` and `StaffView` both need the same 12 fields and the same WebSocket connection, so the shared parts (`FormFields`, `useWebSocket`, `useFormValidation`) are pulled out instead of copy-pasted. Each component does one job — `FormFields` doesn't know about WebSockets, `useWebSocket` doesn't know about form fields. Keeps things easy to change independently.

## Design Decisions

**One column on mobile, two on tablet+.** Twelve fields in one column on desktop would be a very long, boring scroll. Two columns via Tailwind's `md:grid-cols-2` fixes that without needing a different layout for different screens — same grid, it just wraps differently.

**Errors only show after you touch a field.** If every required-field error showed up the moment the page loads, it'd look broken before you've even started typing. Errors only appear once a field has been blurred (or you've tried to submit) — feels less aggressive.

**Submit button just disables, doesn't hide.** A disabled button still tells you it exists and that something's stopping you. Hiding it would leave you wondering where it went.

**Status badge uses color + icon + text, not just color.** Color alone breaks for anyone colorblind. Everything is `emoji + label`, so it reads fine either way.

**Staff view is read-only, not a second copy of the form.** It intentionally can't be edited — it's monitoring, not editing. Keeps the two roles clearly separate, and there's no confusion about which side is the "real" data.

**Landing page exists so nobody has to guess a URL.** Without it, `/` would still be the Next.js starter page — fine for local dev where you know the routes, bad for anyone opening the deployed link cold (a reviewer, mainly). Two buttons, no clever navigation, just gets people where they're going.

## Component Architecture

**`PatientForm.jsx`** — owns all the form state (`formData`, `touched`, `submitted`). On every change, updates local state and calls `sendUpdate` from `useWebSocket`. On submit, validates one more time, calls `sendSubmit`, then shows a thank-you screen with a "Fill Another Form" button that resets everything.

**`FormFields.jsx`** — no state of its own. Just takes `label`, `value`, `onChange`, `error`, etc. as props and renders either an `<input>` or a `<select>`. Same component handles all 12 fields — some are text, one's a date, three are dropdowns.

**`StaffView.jsx`** — calls `useWebSocket("staff")`, reads `lastMessage`, renders the 12 fields read-only. Also runs a small timer (checks every second) to figure out if the patient's gone idle, or if a submitted form should reset — see the sync flow below for the details.

**`StatusIndicator.jsx`** — just a badge. Given a `status` string, picks the right color/icon/label. No logic beyond a lookup table.

**`useFormValidation.js`** — a plain function, not tied to any component. Given `formData`, returns an `errors` object. Used by `PatientForm` before every submit attempt.

**`useWebSocket.js`** — connects on mount, reconnects if dropped, cleans up on unmount. Exposes `connectionStatus`, `lastMessage`, and two send functions. Both `PatientForm` and `StaffView` use the exact same hook, just with a different `role` ("patient" vs "staff").

## Real-Time Synchronization Flow

**Why a separate server, not a Next.js API route:** Next's App Router only handles regular HTTP requests in `app/api/`. A WebSocket needs the connection to stay open, and Next's route handlers aren't built for that. So the WebSocket server is its own small Node script (`server/websocket-server.js`), run separately from `next dev`. That's also why local dev needs two terminals.

**The flow, step by step:**

1. Both `/patient` and `/staff` connect to the WebSocket server on load — patient connects as `?role=patient`, staff as `?role=staff`. The server just remembers who's who.
2. Patient types → `PatientForm` updates its state → calls `sendUpdate(formData)`.
3. `sendUpdate` doesn't send instantly. It waits up to 300ms and sends the latest value once — so fast typing doesn't spam the server with a message per keystroke.
4. The server receives the update, only from a patient client, and rebroadcasts it to every connected staff client, with a timestamp added: `{ type: "update", data, timestamp }`.
5. Every `/staff` tab receives that message and re-renders with the new data.
6. On submit, the same thing happens but with `sendSubmit` instead — sent immediately, no waiting.
7. `StaffView` watches the timestamp on its own: if it's been less than 30 seconds since the last update, status is "Actively Filling." Past that with no `submit`, it's "Idle." A `submit` message flips it to "Submitted," which then holds for 10 seconds before resetting back to "Not Started" — ready for the next patient.
8. If the connection drops (tab closed, server restarted), the hook notices and reconnects automatically after 2 seconds. The server also pings every 30s and drops any client that stops answering, so it doesn't keep broadcasting to dead connections.

One thing to flag: because the WebSocket server is a separate always-running process, it can't be deployed on Vercel the normal way (Vercel's serverless functions don't stay open long enough to hold a WebSocket connection). It needs a host that keeps a Node process running — Render, Railway, Fly, or similar — with the Next.js app pointed at it via `NEXT_PUBLIC_WS_URL`.
