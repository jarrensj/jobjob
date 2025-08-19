'use client';
import { useEffect, useState } from 'react';

type State =
  | { status: 'checking' }
  | { status: 'ready'; hasResume: boolean; url?: string }
  | { status: 'uploading'; pct: number }
  | { status: 'success'; msg: string }
  | { status: 'error'; msg: string };

export default function ResumeForm() {
  const [state, setState] = useState<State>({ status: 'checking' });

  async function refresh() {
    setState({ status: 'checking' });
    const res = await fetch('/api/resume', { method: 'GET', credentials: 'include' });
    if (res.status === 501) {
      const { message } = await res.json();
      setState({ status: 'error', msg: message });
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setState({ status: 'ready', hasResume: true, url: data.url });
    } else {
      setState({ status: 'ready', hasResume: false });
    }
  }

  useEffect(() => { refresh(); }, []);

  async function upload(file: File) {
    if (file.type !== 'application/pdf') {
      setState({ status: 'error', msg: 'Only PDF files allowed.' });
      return;
    }
    // Max 5 GB (matches your API comment). Adjust if you want a smaller cap.
    if (file.size > 5 * 1024 * 1024 * 1024) {
      setState({ status: 'error', msg: 'Max size 5GB.' });
      return;
    }

    const presign = await fetch(`/api/resume?type=${encodeURIComponent(file.type)}`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!presign.ok) {
      const text = await presign.text();
      setState({ status: 'error', msg: text || 'Could not start upload.' });
      return;
    }
    const { url, fields } = await presign.json();

    // Build multipart form for S3 POST
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.append(k, v as string));
    form.append('file', file);

    // Use XHR to track progress (fetch doesn’t give upload progress)
    setState({ status: 'uploading', pct: 0 });
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setState({ status: 'uploading', pct });
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`S3 POST failed: ${xhr.status} ${xhr.responseText?.slice(0,180)}`));
      };
      xhr.onerror = () => reject(new Error('Network error during upload.'));
      xhr.send(form);
    }).catch((err: any) => {
      setState({ status: 'error', msg: err?.message || 'Upload failed.' });
      throw err;
    });

    setState({ status: 'success', msg: 'Resume uploaded.' });
    await refresh();
  }

  async function removeResume() {
    const ok = confirm('Remove your resume?');
    if (!ok) return;
    const res = await fetch('/api/resume', { method: 'DELETE', credentials: 'include' });
    if (!res.ok) {
      setState({ status: 'error', msg: 'Delete failed.' });
      return;
    }
    setState({ status: 'success', msg: 'Resume removed.' });
    await refresh();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Resume</h2>

      {state.status === 'checking' && <p className="text-gray-500">Checking…</p>}

      {state.status !== 'checking' && (
        <>
          <label className="block border rounded p-4 cursor-pointer hover:bg-gray-50">
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

          {state.status === 'uploading' && (
            <p className="text-sm">Uploading… {state.pct}%</p>
          )}

          {state.status === 'ready' && state.hasResume && (
            <div className="space-x-3">
              <a className="underline text-blue-600" href={state.url} target="_blank" rel="noreferrer">
                View / Download current resume
              </a>
              <button
                className="border px-3 py-1 rounded hover:bg-gray-50"
                onClick={removeResume}
              >
                Remove
              </button>
            </div>
          )}

          {state.status === 'ready' && !state.hasResume && (
            <p className="text-gray-500">No resume uploaded yet.</p>
          )}

          {state.status === 'success' && <p className="text-green-700">{state.msg}</p>}
          {state.status === 'error' && <p className="text-red-600">{state.msg}</p>}
        </>
      )}
    </div>
  );
}
