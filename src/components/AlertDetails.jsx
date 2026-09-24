import RiskBadge from "./RiskBadge";
import { formatRupees } from "../utils/formatters";

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
      <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">{value ?? "—"}</p>
    </div>
  );
}

export default function AlertDetails({
  alert,
  onResolve,
  onEscalate,
  resolutionNotes = "",
  onResolutionNotesChange,
}) {
  if (!alert) return null;

  const shapExplanation = alert.shap_explanation || [];
  const amount = Number(alert.amount || 0);
  const rawRiskScore = Number(alert.risk_score);
  const riskScore = Number.isFinite(rawRiskScore)
    ? `${Math.round(rawRiskScore > 1 ? rawRiskScore : rawRiskScore * 100)}%`
    : "—";
  const kycLabel = alert.kyc_verified == null ? "—" : alert.kyc_verified ? "Verified" : "Not verified";
  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Alert Investigation</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Transaction: {alert.transaction_id}</p>
        </div>
        <RiskBadge level={alert.risk_level} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DetailItem label="Amount" value={formatRupees(amount)} />
        <DetailItem label="Risk score" value={riskScore} />
        <DetailItem label="Status" value={alert.status} />
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Transaction details</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Sender account" value={alert.sender_account} />
          <DetailItem label="Receiver account" value={alert.receiver_account} />
          <DetailItem label="Transaction type" value={alert.transaction_type || "Transfer"} />
          <DetailItem label="Hour of day" value={alert.hour_of_day == null ? "—" : `${alert.hour_of_day}:00`} />
          <DetailItem label="Transactions in 7 days" value={alert.tx_count_7d} />
          <DetailItem label="KYC status" value={kycLabel} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <DetailItem label="Violation type" value={alert.violation_type} />
        <DetailItem label="Regulation cited" value={alert.regulation_cited} />
      </div>

      <div className="mt-6">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">AI explanation</h3>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">{alert.ai_explanation}</p>
        </div>
      </div>

      {alert.resolution_notes && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Resolution notes</p>
          <p className="mt-2 text-sm leading-6 text-emerald-900 dark:text-emerald-100">{alert.resolution_notes}</p>
          <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">Resolved at: {formatDate(alert.resolved_at)}</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">SHAP feature contributions</h3>
        {shapExplanation.length === 0 && <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">No model explanation was stored for this alert.</p>}
        <div className="space-y-3">
          {shapExplanation.map((item, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div><p className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">{String(item.feature_name || item.feature || "Feature").replaceAll("_", " ")}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Value: {item.value ?? "—"}</p></div>
                <div className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300">{item.contribution ?? item.shap_value ?? item.impact ?? "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(onResolve || onEscalate) && (
        <div className="mt-6">
          {onResolutionNotesChange && onResolve && (
            <label className="block max-w-2xl text-sm font-medium text-slate-700 dark:text-slate-300">
              Resolution notes
              <textarea
                value={resolutionNotes}
                onChange={(event) => onResolutionNotesChange(event.target.value)}
                rows="3"
                placeholder="Explain why this alert is being resolved…"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
          {onResolve && <button type="button" onClick={onResolve} className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-green-700">Resolve Alert</button>}
          {onEscalate && <button type="button" onClick={onEscalate} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700">Escalate Alert</button>}
          </div>
        </div>
      )}
    </div>
  );
}
