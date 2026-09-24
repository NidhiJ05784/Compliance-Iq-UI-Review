import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import useAuth from "../hooks/useAuth";
import {
  escalateAlert as escalateAlertAPI,
  getAlertsPage,
  resolveAlert as resolveAlertAPI,
} from "../api/client";

const PAGE_SIZE = 10;

function statusClass(status) {
  if (status === "resolved") return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300";
  if (status === "escalated") return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";
  return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
}

function riskClass(risk) {
  if (risk === "high") return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300";
  if (risk === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
  return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function Alerts() {
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const role = getRole();
  const canAct = role === "officer" || role === "admin";
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedRisk, setSelectedRisk] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [search, setSearch] = useState("");
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAlerts() {
      setLoading(true);
      setError("");
      try {
        const page = await getAlertsPage({
          riskLevel: selectedRisk,
          status: selectedStatus,
          limit: PAGE_SIZE,
          offset: (currentPage - 1) * PAGE_SIZE,
        });
        if (active) {
          setAlerts(page.alerts);
          setTotal(page.total);
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.detail || "Unable to load alerts.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAlerts();
    return () => { active = false; };
  }, [selectedRisk, selectedStatus, currentPage]);

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setCurrentPage(1);
      setExpandedAlert(null);
    };
  }

  const visibleAlerts = useMemo(() => alerts.filter((alert) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [alert.transaction_id, alert.violation_type, alert.sender_account, alert.receiver_account]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  }), [alerts, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const highRisk = alerts.filter((alert) => alert.risk_level === "high").length;
  const resolved = alerts.filter((alert) => alert.status === "resolved").length;
  const escalated = alerts.filter((alert) => alert.status === "escalated").length;

  async function resolveAlert(id) {
    try {
      await resolveAlertAPI(id);
      setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, status: "resolved" } : alert));
      toast.success("Alert resolved successfully");
    } catch (requestError) {
      toast.error(requestError.response?.data?.detail || "Failed to resolve alert");
    }
  }

  async function escalateAlert(id) {
    try {
      await escalateAlertAPI(id);
      setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, status: "escalated" } : alert));
      toast.success("Alert escalated for senior review");
    } catch (requestError) {
      toast.error(requestError.response?.data?.detail || "Failed to escalate alert");
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">Alerts management</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monitor and investigate suspicious transactions from the database.</p>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[['Total results', total, 'text-slate-900 dark:text-white'], ['High risk on page', highRisk, 'text-red-600 dark:text-red-300'], ['Resolved on page', resolved, 'text-emerald-600 dark:text-emerald-300'], ['Escalated on page', escalated, 'text-amber-600 dark:text-amber-300']].map(([label, value, color]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-xs text-slate-500 dark:text-slate-400">{label}</p><p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p></div>)}
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search current page…" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:max-w-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            <div className="flex flex-wrap gap-2">
              <select value={selectedStatus} onChange={(event) => changeFilter(setSelectedStatus)(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm capitalize text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"><option value="">All statuses</option><option value="open">Open</option><option value="resolved">Resolved</option><option value="escalated">Escalated</option></select>
              <select value={selectedRisk} onChange={(event) => changeFilter(setSelectedRisk)(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm capitalize text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"><option value="">All risk levels</option><option value="high">High risk</option><option value="medium">Medium risk</option><option value="low">Low risk</option></select>
              <button onClick={() => setCurrentPage(1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><RefreshCw size={15} /> Refresh</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"><tr><th className="px-6 py-4">Transaction</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Risk</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Created</th><th className="px-6 py-4">View</th></tr></thead>
              <tbody>
                {loading && <tr><td colSpan="6" className="px-6 py-14 text-center text-sm text-slate-500">Loading alerts…</td></tr>}
                {!loading && visibleAlerts.map((alert) => {
                  const isExpanded = expandedAlert === alert.id;
                  return <tr key={alert.id} className="border-t border-slate-100 align-top dark:border-slate-800">
                    <td colSpan="6" className="p-0">
                      <div className="grid grid-cols-6 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <button onClick={() => setExpandedAlert(isExpanded ? null : alert.id)} className="flex items-center gap-2 px-6 py-5 text-left font-medium text-slate-900 dark:text-white"><span>{alert.transaction_id}</span>{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                        <div className="px-6 py-5 text-sm text-slate-700 dark:text-slate-300">₹{Number(alert.amount || 0).toLocaleString()}</div>
                        <div className="px-6 py-5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${riskClass(alert.risk_level)}`}>{alert.risk_level}</span></div>
                        <div className="px-6 py-5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(alert.status)}`}>{alert.status}</span></div>
                        <div className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">{formatDate(alert.created_at)}</div>
                        <div className="px-6 py-5"><button onClick={() => navigate(`/alerts/${alert.id}`)} className="text-sm font-semibold text-blue-600 hover:underline">Open</button></div>
                      </div>
                      {isExpanded && <div className="bg-slate-50 px-6 py-5 dark:bg-slate-800/50"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs uppercase tracking-wide text-slate-500">Violation</p><p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{alert.violation_type || "—"}</p></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Regulation</p><p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{alert.regulation_cited || "—"}</p></div><div><p className="text-xs uppercase tracking-wide text-slate-500">Accounts</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{alert.sender_account || "—"} → {alert.receiver_account || "—"}</p></div><div><p className="text-xs uppercase tracking-wide text-slate-500">KYC</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{alert.kyc_verified == null ? "—" : alert.kyc_verified ? "Verified" : "Not verified"}</p></div></div><p className="mt-5 max-w-4xl whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">{alert.ai_explanation}</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => navigate(`/alerts/${alert.id}`)} className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/30">Open investigation</button>{canAct && alert.status !== "resolved" && <><button onClick={() => resolveAlert(alert.id)} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">Resolve</button><button onClick={() => escalateAlert(alert.id)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Escalate</button></>}</div></div>}
                    </td>
                  </tr>;
                })}
                {!loading && visibleAlerts.length === 0 && <tr><td colSpan="6" className="px-6 py-14 text-center text-sm text-slate-500">No alerts match the selected filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </Layout>
  );
}
