import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Eye, EyeOff } from "lucide-react";

const FEATURE_EXPLANATIONS = {
  "transaction amount": "The value of the transaction. A larger-than-usual amount can increase risk because it may need enhanced review or reporting.",
  amount: "The value of the transaction. A larger-than-usual amount can increase risk because it may need enhanced review or reporting.",
  "country risk": "A risk indicator for the destination or origin country based on the compliance risk context configured by the system.",
  country_risk: "A risk indicator for the destination or origin country based on the compliance risk context configured by the system.",
  "frequency spike": "A sudden increase in the number of transactions compared with the account's normal activity.",
  tx_count_7d: "The number of transactions recorded for the account during the previous seven days.",
  "transaction frequency (7d)": "The number of transactions recorded for the account during the previous seven days.",
  "new beneficiary": "A newly added recipient or account receiving funds. New recipients can require additional review because there is limited history.",
  new_beneficiary: "A newly added recipient or account receiving funds. New recipients can require additional review because there is limited history.",
  "time of day": "The hour when the transaction occurred. Unusual timing can be treated as a behavioural risk signal.",
  hour_of_day: "The hour when the transaction occurred. Unusual timing can be treated as a behavioural risk signal.",
  "kyc status": "Whether the account has completed KYC verification. An unverified account can increase compliance risk.",
  kyc_verified: "Whether the account has completed KYC verification. An unverified account can increase compliance risk.",
};

function normalizeFeature(value) {
  return String(value || "feature").trim().toLowerCase().replaceAll("_", " ");
}

function explanationFor(feature) {
  const normalized = normalizeFeature(feature);
  return FEATURE_EXPLANATIONS[normalized] || "A transaction or account characteristic used by the model when estimating risk.";
}

export default function ShapChart({
  data,
}) {
  const [showExplanations, setShowExplanations] = useState(false);

  return (
    <div
      className="
        bg-white
        dark:bg-slate-900

        border
        border-slate-200
        dark:border-slate-800

        rounded-2xl

        p-6

        shadow-sm

        transition-all

        overflow-x-auto
      "
    >

      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2
            className="
              text-lg
              font-semibold

              text-slate-900
              dark:text-white
            "
          >
            AI Feature Importance
          </h2>

          <p
            className="
              text-sm

              text-slate-500
              dark:text-slate-400

              mt-1
            "
          >
            SHAP-based transaction explanation
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowExplanations((current) => !current)}
          aria-expanded={showExplanations}
          aria-label={showExplanations ? "Hide feature explanations" : "Show feature explanations"}
          title={showExplanations ? "Hide feature explanations" : "Show feature explanations"}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-300"
        >
          {showExplanations ? <EyeOff size={15} /> : <Eye size={15} />}
          {showExplanations ? "Hide meanings" : "Explain features"}
        </button>
      </div>

      {showExplanations && (
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800 dark:text-blue-200">
            What these features mean
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {data.map((item, index) => {
              const feature = item.feature || item.feature_name || `Feature ${index + 1}`;
              return (
                <div key={`${feature}-${index}`} className="rounded-xl bg-white/80 p-3 dark:bg-slate-900/70">
                  <p className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">
                    {String(feature).replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {explanationFor(feature)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="min-w-[700px]">
        <BarChart
          width={700}
          height={350}
          data={data}
        >
          <XAxis
            dataKey="feature"
            tick={{
              fill: "#64748b",
              fontSize: 12,
            }}
          />

          <YAxis
            tick={{
              fill: "#64748b",
              fontSize: 12,
            }}
          />

          <Tooltip />

          <Bar
            dataKey="impact"
            radius={[8, 8, 0, 0]}
            fill="#2563eb"
          />
        </BarChart>
      </div>
    </div>
  );
}
