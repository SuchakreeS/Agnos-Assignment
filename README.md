# Patient Input Form & Staff View

A patient fills out a form. Staff watch it fill in live, on another screen. That's the whole idea.

Built for the Agnos front-end assignment.

## Overview

Three pages:

- **`/`** — landing page, just two buttons: one to the patient form, one to the staff view.
- **`/patient`** — a form for the patient to type their info into.
- **`/staff`** — a read-only view for staff. Shows the same data, updating as the patient types, plus a status badge (not started / actively filling / idle / submitted).

They talk to each other over a WebSocket. No database, no page refresh — just live sync.

## Tech Stack

- **Next.js** (App Router)
- **TailwindCSS**
- **WebSockets** (`ws` package, a small standalone server — see "How Real-Time Works" below for why)

## Setup

You need two terminals — one for the Next.js app, one for the WebSocket server.

```bash
git clone <this-repo>
cd agnos-patient-form
npm install
```

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npm run ws-server
```

Then open [http://localhost:3000](http://localhost:3000) — it's a landing page with two buttons, one to the patient form, one to the staff view. Or go straight there:

- Patient form: [http://localhost:3000/patient](http://localhost:3000/patient)
- Staff view: [http://localhost:3000/staff](http://localhost:3000/staff)

Open both in separate tabs and type in the patient form — you'll see it show up on the staff tab.

Optional: copy `.env.local.example` to `.env.local` if you want to change the WebSocket port or point the app at a WebSocket server running somewhere else.

## Project Structure

```
app/
  page.js               - landing page, links to /patient and /staff
  patient/page.js     - patient form page
  staff/page.js        - staff view page

components/
  PatientForm.jsx       - the form itself, all 12 fields
  FormFields.jsx         - one reusable input/select, used by every field
  StaffView.jsx           - staff dashboard, reads live data
  StatusIndicator.jsx      - the colored status badge

hooks/
  useFormValidation.js   - checks the form before it's allowed to submit
  useWebSocket.js         - connects to the WebSocket server, sends/receives data

server/
  websocket-server.js    - the WebSocket server (a separate small Node process, not part of Next.js)
```

Full breakdown of why it's organized this way, plus design decisions and the real-time flow, is in [DEVELOPMENT_PLANNING.md](./DEVELOPMENT_PLANNING.md).

## Features Implemented

- All 12 patient fields (per spec), with Middle Name, Religion, and Emergency Contact as optional
- Validation: required fields, phone (10+ digits), valid email, sane date of birth — errors only show once you've touched a field, not immediately on page load
- Submit button disabled until the form is valid
- Staff view mirrors the form live, field by field
- Status badge: 🔴 Not Started → 🟢 Actively Filling → 🟡 Idle (30s no input) → ✅ Submitted
- Responsive — one column on mobile, two columns from tablet up
- Auto-reconnect if the WebSocket drops

## Bonus Features

A few things past the base requirements:

- **Auto-reset after submit.** Staff view holds "Submitted" for 10 seconds, then goes back to "Not Started" and clears the fields — ready for the next patient without a manual reset.
- **"Fill Another Form" button.** Shows up after a successful submit so the patient can start over on the same device.
- **Multiple staff, for free.** Any number of people can have `/staff` open at once — the server broadcasts to all of them, not just one.
- **Connection status shown to the user.** If the WebSocket connection drops, both pages show "Reconnecting…" instead of silently losing data.
- **Dead connection cleanup.** The server pings clients every 30s and drops ones that stop responding, so a closed tab doesn't linger as a phantom "staff" connection.

## How Real-Time Works

Short version: patient types → browser sends it over a WebSocket → server broadcasts it to every staff tab → staff view re-renders.

Longer version, including *why* it's a separate server process instead of a Next.js API route, is in [DEVELOPMENT_PLANNING.md](./DEVELOPMENT_PLANNING.md#real-time-synchronization-flow).

## Deployment
Live app: https://agnos-assignment-cyan.vercel.app/
