// Landing page — points visitors to the two actual interfaces.
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">
        Patient Input Form &amp; Staff View
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">
        A patient fills out a form. Staff watch it fill in live, on another
        screen. Pick where you're going:
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/patient"
          className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Patient Form
        </Link>
        <Link
          href="/staff"
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
        >
          Staff View
        </Link>
      </div>
    </main>
  );
}
