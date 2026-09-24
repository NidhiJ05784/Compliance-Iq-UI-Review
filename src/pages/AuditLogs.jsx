import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";

import Layout from "../components/Layout";
import { getAuditLogs } from "../api/client";

const ACTIONS = [
  "login_success",
  "login_failed",
  "alert_resolved",
  "alert_escalated",
  "user_created",
  "user_deactivated",
];

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadLogs() {
      setLoading(true);
      setError("");
      try {
        const data = await getAuditLogs({ action });
        if (active) setLogs(data);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.detail || "Unable to load audit logs.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadLogs();
    return () => { active = false; };
  }, [action]);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-slate-900 p-3 text-white dark:bg-blue-600"><ScrollText size={22} /></div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">Audit logs</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review administrative and compliance actions recorded by the database.</p>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div><h2 className="font-semibold text-slate-900 dark:text-white">Activity history</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{logs.length} event{logs.length === 1 ? "" : "s"} shown.</p></div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by action<select value={action} onChange={(event) => setAction(event.target.value)} className="ml-3 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"><option value="">All actions</option>{ACTIONS.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"><tr><th className="px-6 py-4">Timestamp</th><th className="px-6 py-4">Action</th><th className="px-6 py-4">User ID</th><th className="px-6 py-4">Details</th><th className="px-6 py-4">IP address</th></tr></thead>
              <tbody>
                {loading && <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500">Loading audit logs…</td></tr>}
                {!loading && logs.map((log) => <tr key={log.id} className="border-t border-slate-100 align-top text-sm dark:border-slate-800"><td className="whitespace-nowrap px-6 py-4 text-slate-600 dark:text-slate-300">{formatDate(log.timestamp)}</td><td className="px-6 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">{String(log.action || "event").replaceAll("_", " ")}</span></td><td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{log.user_id || "System"}</td><td className="max-w-xl px-6 py-4 leading-6 text-slate-700 dark:text-slate-300">{log.detail || "—"}</td><td className="px-6 py-4 text-slate-500 dark:text-slate-400">{log.ip_address || "—"}</td></tr>)}
                {!loading && logs.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500">No audit events found for this filter.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}
