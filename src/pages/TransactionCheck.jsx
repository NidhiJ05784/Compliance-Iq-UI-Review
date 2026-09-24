import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, Loader2, ScanSearch } from "lucide-react";

import Layout from "../components/Layout";
import { checkTransaction } from "../api/client";

const initialForm = {
  sender_account: "ACC-1001",
  receiver_account: "ACC-2002",
  amount: "980000",
  transaction_type: "transfer",
  hour_of_day: "12",
  tx_count_7d: "1",
  kyc_verified: true,
};

function fieldClass() {
  return "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-950";
}

export default function TransactionCheck() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const data = await checkTransaction({
        sender_account: form.sender_account.trim(),
        receiver_account: form.receiver_account.trim(),
        amount: Number(form.amount),
        transaction_type: form.transaction_type,
        hour_of_day: Number(form.hour_of_day),
        tx_count_7d: Number(form.tx_count_7d),
        kyc_verified: form.kyc_verified,
      });
      setResult(data);
      toast.success(data.flagged ? "Transaction flagged for review" : "Transaction is clean");
    } catch (requestError) {
      const message =
        requestError.response?.data?.detail ||
        "The transaction could not be checked. Verify the backend is running and try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const riskScore = result ? Math.round(Number(result.risk_score || 0) * 100) : 0;

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-3 text-white">
              <ScanSearch size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl">
                Screen a transaction
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Send transaction details through the compliance rules and ML pipeline.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Transaction details</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                All fields are used by the backend screening request.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Sender account
                <input required name="sender_account" value={form.sender_account} onChange={updateField} className={`${fieldClass()} mt-2`} />
              </label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Receiver account
                <input required name="receiver_account" value={form.receiver_account} onChange={updateField} className={`${fieldClass()} mt-2`} />
              </label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Amount (₹)
                <input required min="0" step="0.01" type="number" name="amount" value={form.amount} onChange={updateField} className={`${fieldClass()} mt-2`} />
              </label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Transaction type
                <select name="transaction_type" value={form.transaction_type} onChange={updateField} className={`${fieldClass()} mt-2`}>
                  <option value="transfer">Transfer</option>
                  <option value="payment">Payment</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="deposit">Deposit</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Hour of day (0–23)
                <input required min="0" max="23" type="number" name="hour_of_day" value={form.hour_of_day} onChange={updateField} className={`${fieldClass()} mt-2`} />
              </label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Transactions in last 7 days
                <input required min="0" type="number" name="tx_count_7d" value={form.tx_count_7d} onChange={updateField} className={`${fieldClass()} mt-2`} />
              </label>
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300">
              <input type="checkbox" name="kyc_verified" checked={form.kyc_verified} onChange={updateField} className="h-4 w-4 accent-blue-600" />
              KYC is verified for this transaction
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 size={17} className="animate-spin" />}
              {submitting ? "Checking transaction…" : "Check transaction"}
            </button>
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Screening result</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The backend response will appear here.</p>
            </div>

            {!result && (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 text-center dark:border-slate-700">
                <ScanSearch size={30} className="text-slate-400" />
                <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No transaction checked yet</p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">Submit the form to see risk, rule violations, ML probability and explanations.</p>
              </div>
            )}

            {result && (
              <div className="space-y-5">
                <div className={`rounded-2xl border p-4 ${result.flagged ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20" : "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20"}`}>
                  <div className="flex items-start gap-3">
                    {result.flagged ? <AlertTriangle className="mt-0.5 text-red-600" size={22} /> : <CheckCircle2 className="mt-0.5 text-emerald-600" size={22} />}
                    <div>
                      <p className={`font-semibold ${result.flagged ? "text-red-800 dark:text-red-200" : "text-emerald-800 dark:text-emerald-200"}`}>
                        {result.flagged ? "Flagged for compliance review" : "Transaction is clean"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{result.message}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500 dark:text-slate-400">Risk level</p><p className="mt-1 text-lg font-semibold capitalize text-slate-900 dark:text-white">{result.risk_level}</p></div>
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500 dark:text-slate-400">Risk score</p><p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{riskScore}%</p></div>
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500 dark:text-slate-400">ML probability</p><p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{Math.round(Number(result.ml_probability || 0) * 100)}%</p></div>
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500 dark:text-slate-400">Transaction ID</p><p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">{result.transaction_id}</p></div>
                </div>

                {result.flags?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Detected violations</h3>
                    <div className="mt-3 space-y-3">
                      {result.flags.map((flag, index) => (
                        <div key={`${flag.rule}-${index}`} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                          <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{flag.rule}</p><span className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold uppercase text-red-700 dark:bg-red-950/50 dark:text-red-300">{flag.severity}</span></div>
                          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{flag.reason}</p>
                          <p className="mt-2 text-xs font-medium text-blue-700 dark:text-blue-300">{flag.section}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">AI explanation</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">{result.ai_alert}</p>
                </div>

                {result.shap_explanation?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Why the model reacted</h3>
                    <div className="mt-3 grid gap-2">
                      {result.shap_explanation.map((item, index) => (
                        <div key={`${item.feature || item.feature_name}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"><span className="capitalize text-slate-600 dark:text-slate-300">{String(item.feature || item.feature_name || "Feature").replaceAll("_", " ")}</span><span className="font-semibold text-slate-900 dark:text-white">{item.value ?? "—"}</span></div>
                      ))}
                    </div>
                  </div>
                )}

                {result.alert_id && <Link to={`/alerts/${result.alert_id}`} className="inline-flex text-sm font-semibold text-blue-600 hover:underline">Open created alert →</Link>}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
