import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = {
  open: "#ef4444",
  resolved: "#22c55e",
  escalated: "#f59e0b",
};

function labelFor(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function AlertsSummaryChart({ alerts = [] }) {
  const counts = alerts.reduce(
    (summary, alert) => {
      const status = String(alert.status || "open").toLowerCase();
      if (status in summary) summary[status] += 1;
      return summary;
    },
    { open: 0, resolved: 0, escalated: 0 }
  );

  const data = Object.entries(counts).map(([status, value]) => ({
    name: labelFor(status),
    status,
    value,
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Alerts summary
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Current alert status distribution
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-right dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total shown</p>
          <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{total}</p>
        </div>
      </div>

      <div className="mt-4 h-64">
        {total === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No alert data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                innerRadius={62}
                outerRadius={92}
                paddingAngle={3}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} alert${value === 1 ? "" : "s"}`, "Count"]} />
              <Legend verticalAlign="bottom" height={28} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
