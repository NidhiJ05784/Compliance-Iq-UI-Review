import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/Layout";
import AlertDetails from "../components/AlertDetails";
import {
  escalateAlert,
  getAlert,
  resolveAlert,
} from "../api/client";
import useAuth from "../hooks/useAuth";

export default function AlertDetail() {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const { getRole } = useAuth();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAlert() {
      try {
        const data = await getAlert(alertId);
        if (active) setAlert(data);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.detail ||
            "Unable to load this alert."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAlert();
    return () => { active = false; };
  }, [alertId]);

  async function handleResolve() {
    try {
      await resolveAlert(
        alertId,
        resolutionNotes || "Resolved from alert investigation view."
      );
      setAlert((current) => ({
        ...current,
        status: "resolved",
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
      }));
      toast.success("Alert resolved successfully");
    } catch (requestError) {
      toast.error(requestError.response?.data?.detail || "Unable to resolve alert");
    }
  }

  async function handleEscalate() {
    try {
      await escalateAlert(alertId);
      setAlert((current) => ({ ...current, status: "escalated" }));
      toast.success("Alert escalated for senior review");
    } catch (requestError) {
      toast.error(requestError.response?.data?.detail || "Unable to escalate alert");
    }
  }

  const canAct = getRole() === "admin" || getRole() === "officer";

  return (
    <Layout>
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/alerts")}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to alerts
        </button>

        {loading && (
          <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">
            Loading alert details…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {!loading && alert && (
          <AlertDetails
            alert={alert}
            onResolve={canAct && alert.status !== "resolved" ? handleResolve : undefined}
            onEscalate={canAct && alert.status !== "resolved" ? handleEscalate : undefined}
            resolutionNotes={resolutionNotes}
            onResolutionNotesChange={setResolutionNotes}
          />
        )}
      </div>
    </Layout>
  );
}
