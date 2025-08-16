"use client";
import { useEffect, useState } from "react";

type State =
  | { status: "checking" }
  | { status: "ready"; hasResume: boolean; url?: string }
  | { status: "uploading"; pct: number }
  | { status: "success"; msg: string }
  | { status: "error"; msg: string };

export default function ResumeSettings() {
  const [state, setState] = useState<State>({ status: "checking" });

  async function refresh() {
    setState({ status: "checking" });
    const res = await fetch("/api/resume", { method: "GET" });
    if (res.status === 501) {
      const { message } = await res.json();
      setState({ status: "error", msg: message });
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setState({ status: "ready", hasResume: true, url: data.url });
    } else {
      setState({ status: "ready", hasResume: false });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function upload(file: File) {
    if (file.type !== "application/pdf") {
      setState({ status: "error", msg: "Only PDF files allowed." });
      return;
    }
    if (file.size > 5 * 1024 * 1024 * 1024) {
      setState({ status: "error", msg: "Max size 5GB." });
      return;
    }

    const presign = await fetch(`/api/resume?type=${encodeURIComponent(file.type)}`, {
      method: "POST",
    });
    if (!presign.ok) {
      const text = await presign.text();
      setState({ status: "error", msg: text || "Could not start upload." });
      return;
    }
    const { url, fields } = await presign.json();

    setState({ status: "uploading", pct: 0 });

    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => form.append(key, value as string));
    form.append("file", file);

    const res = await fetch(url, { method: "POST", body: form });
    if (!res.ok) {
        const text = await res.text();
        setState({ status: "error", msg: `S3 POST failed: ${res.status} ${text}` });
        return;
    }
    setState({ status: "success", msg: "Resume uploaded." });
    await refresh();
  }

  async function removeResume() {
    const ok = confirm("Remove your resume?");
    if (!ok) return;
    const res = await fetch("/api/resume", { method: "DELETE" });
    if (!res.ok) {
      setState({ status: "error", msg: "Delete failed." });
      return;
    }
    setState({ status: "success", msg: "Resume removed." });
    await refresh();
  }

  return (
    <main className="p-6 max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Resume</h1>

      {state.status === "checking" && <p>Checking…</p>}

      {state.status !== "checking" && (
        <>
          <label className="block border rounded p-4 cursor-pointer">
            <div className="space-y-2">
              <p className="font-medium">Upload / Replace</p>
              <p className="text-sm text-gray-500">PDF only, max 5 GB.</p>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                }}
              />
            </div>
          </label>

          {state.status === "uploading" && <p>Uploading… {state.pct}%</p>}

          {state.status === "ready" && state.hasResume && (
            <div className="space-x-3">
              <a className="underline" href={state.url} target="_blank" rel="noreferrer">
                View / Download current resume
              </a>
              <button className="border px-3 py-1" onClick={removeResume}>
                Remove
              </button>
            </div>
          )}

          {state.status === "ready" && !state.hasResume && (
            <p className="text-gray-500">No resume uploaded yet.</p>
          )}

          {state.status === "success" && <p className="text-green-700">{state.msg}</p>}
          {state.status === "error" && <p className="text-red-600">{state.msg}</p>}
        </>
      )}
    </main>
  );
}
