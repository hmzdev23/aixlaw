import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ background: "var(--background)" }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6"
        style={{ background: "linear-gradient(135deg, #FF4B00, #FF7A40)" }}
      >
        G
      </div>
      <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--color-gray-900)", letterSpacing: "-0.04em" }}>
        404
      </h1>
      <p className="text-base mb-8" style={{ color: "var(--color-gray-600)" }}>
        This page isn&apos;t in the playbook.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full font-semibold text-white"
        style={{ background: "linear-gradient(135deg, #FF4B00, #FF7A40)" }}
      >
        Back to Gambit
      </Link>
    </div>
  );
}
