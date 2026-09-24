import axios from "axios";

import {
  dashboardStats as mockDashboardStats,
  mockAlerts,
} from "./mockData";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 5000,
});

function isDemoMode() {
  return sessionStorage.getItem("token") === "demo-token";
}

function clearSession() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("email");
}

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 403].includes(error.response?.status) && !isDemoMode()) {
      clearSession();
      window.dispatchEvent(new Event("complianceiq:session-expired"));
    }

    return Promise.reject(error);
  }
);

function parseShapFeatures(value) {
  if (!value) return [];

  try {
    const parsed = Array.isArray(value) ? value : JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          feature: item.feature || item.feature_name || item.name || "Feature",
          feature_name: item.feature || item.feature_name || item.name || "Feature",
          value: item.value ?? "—",
          impact: Math.round(
            Math.abs(
              Number(item.shap_value ?? item.contribution ?? item.impact ?? 0)
            ) * 100
          ),
          contribution: item.shap_value ?? item.contribution ?? item.impact ?? 0,
          shap_value: item.shap_value,
          direction: item.impact,
        }))
      : [];
  } catch {
    return [];
  }
}

function normalizeAlert(summary = {}, detail = {}) {
  const transaction = detail?.transaction || {};
  const transactionId =
    summary.transaction_id ||
    transaction.id ||
    detail?.transaction_id ||
    detail?.id ||
    "Unknown transaction";
  const riskLevel = String(
    detail?.risk_level ?? summary.risk_level ?? "unknown"
  ).toLowerCase();
  const status = String(detail?.status ?? summary.status ?? "open").toLowerCase();

  return {
    ...summary,
    ...detail,
    transaction_id: transactionId,
    risk_level: riskLevel,
    status,
    amount: transaction.amount ?? summary.amount ?? 0,
    risk_score: transaction.risk_score ?? summary.risk_score ?? 0,
    created_at: summary.created_at || detail?.created_at || "—",
    resolved_at: detail?.resolved_at || summary.resolved_at || null,
    resolved_by: detail?.resolved_by || summary.resolved_by || null,
    resolution_notes: detail?.resolution_notes || summary.resolution_notes || "",
    ai_explanation:
      detail?.ai_explanation || summary.ai_explanation || "No explanation available.",
    violation_type: detail?.violation_type || summary.violation_type || "—",
    regulation_cited: detail?.regulation_cited || summary.regulation_cited || "—",
    shap_explanation: parseShapFeatures(
      detail?.shap_features || summary.shap_explanation
    ),
    sender_account: transaction.sender_account,
    receiver_account: transaction.receiver_account,
    transaction_type: transaction.transaction_type,
    hour_of_day: transaction.hour_of_day,
    tx_count_7d: transaction.tx_count_7d,
    kyc_verified: transaction.kyc_verified,
  };
}

async function hydrateAlertSummaries(summaries) {
  return Promise.all(
    summaries.map(async (summary) => {
      try {
        const detail = await API.get(`/alerts/${summary.id}`);
        return normalizeAlert(summary, detail.data);
      } catch (error) {
        if (error.response?.status && !isDemoMode()) throw error;
        return normalizeAlert(summary);
      }
    })
  );
}

export async function getAlertsPage({
  status = "",
  riskLevel = "",
  limit = 10,
  offset = 0,
} = {}) {
  try {
    const response = await API.get("/alerts", {
      params: {
        ...(status ? { status } : {}),
        ...(riskLevel ? { risk_level: riskLevel } : {}),
        limit,
        offset,
      },
    });
    const summaries = Array.isArray(response.data)
      ? response.data
      : response.data?.alerts || [];

    return {
      alerts: await hydrateAlertSummaries(summaries),
      total: response.data?.total ?? summaries.length,
      demo: false,
    };
  } catch (error) {
    if (error.response?.status && !isDemoMode()) throw error;

    const filtered = mockAlerts.filter((alert) => {
      const statusMatch = !status || alert.status === status;
      const riskMatch = !riskLevel || alert.risk_level === riskLevel;
      return statusMatch && riskMatch;
    });

    return {
      alerts: filtered.slice(offset, offset + limit),
      total: filtered.length,
      demo: true,
    };
  }
}

export async function getAlerts() {
  const page = await getAlertsPage({ limit: 50 });
  return page.alerts;
}

export async function loginUser({ email, password }) {
  try {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);

    const response = await API.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data;
  } catch (error) {
    const demoUsers = {
      "admin@complianceiq.com": { role: "admin", password: "Admin@1234" },
      "officer@complianceiq.com": { role: "officer", password: "Officer@1234" },
      "analyst@complianceiq.com": { role: "analyst", password: "Analyst@1234" },
    };
    const demoUser = demoUsers[email];

    if (!error.response && demoUser && demoUser.password === password) {
      return {
        access_token: "demo-token",
        token_type: "bearer",
        email,
        role: demoUser.role,
      };
    }

    throw error;
  }
}

export async function getCurrentUser() {
  if (isDemoMode()) {
    return {
      id: "demo-user",
      email: sessionStorage.getItem("email") || "admin@complianceiq.com",
      role: sessionStorage.getItem("role") || "admin",
    };
  }

  const response = await API.get("/auth/me");
  return response.data;
}

export async function getDashboardStats() {
  try {
    const response = await API.get("/dashboard/summary");
    return response.data;
  } catch (error) {
    if (error.response?.status && !isDemoMode()) throw error;
    return {
      ...mockDashboardStats,
      total_open: mockAlerts.filter((alert) => alert.status === "open").length,
      system_status: "operational",
    };
  }
}

export async function getMlHealth() {
  try {
    const response = await API.get("/ml/health");
    return response.data;
  } catch (error) {
    if (error.response?.status && !isDemoMode()) throw error;
    return { status: "unavailable", pipeline: "Demo mode" };
  }
}

export async function getAlert(id) {
  try {
    const response = await API.get(`/alerts/${id}`);
    return normalizeAlert({ id }, response.data);
  } catch (error) {
    if (error.response?.status && !isDemoMode()) throw error;
    const fallback = mockAlerts.find((alert) => String(alert.id) === String(id));
    if (fallback) return normalizeAlert(fallback);
    throw error;
  }
}

export async function resolveAlert(id, notes = "") {
  try {
    const response = await API.put(`/alerts/${id}/resolve`, { notes });
    return response.data;
  } catch (error) {
    if (error.response?.status && !isDemoMode()) throw error;
    return { id, status: "resolved" };
  }
}

export async function escalateAlert(id) {
  try {
    const response = await API.put(`/alerts/${id}/escalate`);
    return response.data;
  } catch (error) {
    if (error.response?.status && !isDemoMode()) throw error;
    return { id, status: "escalated" };
  }
}

export async function checkTransaction(payload) {
  try {
    const response = await API.post("/transactions/check", payload);
    return response.data;
  } catch (error) {
    if (error.response || !isDemoMode()) throw error;

    const flags = [];
    if (payload.amount > 500000 && !payload.kyc_verified) {
      flags.push({
        rule: "KYC Enhanced Due Diligence Required",
        reason: `Transfer of ₹${payload.amount.toLocaleString()} to an unverified account.`,
        severity: "high",
        section: "RBI KYC Master Direction 2023 — Section 16(3)",
      });
    }
    if (payload.amount >= 900000 && payload.amount < 1000000) {
      flags.push({
        rule: "Possible Structuring",
        reason: "Amount is close to the ₹10L reporting threshold.",
        severity: "high",
        section: "PMLA 2002 — Section 3",
      });
    }
    if (payload.amount >= 1000000) {
      flags.push({
        rule: "PMLA Mandatory Reporting",
        reason: "Amount exceeds the ₹10L reporting threshold.",
        severity: "medium",
        section: "PMLA 2002 — Rule 7",
      });
    }
    if ([0, 1, 2, 3, 4].includes(Number(payload.hour_of_day)) && payload.amount > 500000) {
      flags.push({
        rule: "Suspicious Overnight Transfer",
        reason: "Large transfer was submitted during overnight hours.",
        severity: "medium",
        section: "PMLA 2002 — Rule 7",
      });
    }
    if (payload.tx_count_7d >= 3 && payload.amount >= 500000) {
      flags.push({
        rule: "Structuring Pattern Detected",
        reason: "Multiple large transfers were recorded this week.",
        severity: "high",
        section: "PMLA 2002 — Section 3 + FATF Recommendation 16",
      });
    }

    const flagged = flags.length > 0;
    return {
      transaction_id: `DEMO-TXN-${Date.now()}`,
      flagged,
      risk_level: flags.some((flag) => flag.severity === "high")
        ? "high"
        : flagged
        ? "medium"
        : "low",
      risk_score: flagged ? Math.min(0.95, 0.3 + flags.length * 0.2) : 0.05,
      violations_found: flags.length,
      flags,
      ml_probability: flagged ? 0.78 : 0.08,
      shap_explanation: [
        { feature: "amount", value: payload.amount, shap_value: flagged ? 0.52 : 0.05 },
        { feature: "tx_count_7d", value: payload.tx_count_7d, shap_value: 0.24 },
        { feature: "kyc_verified", value: payload.kyc_verified, shap_value: payload.kyc_verified ? -0.08 : 0.36 },
      ],
      ai_alert: flagged
        ? "Demo screening completed. Review the rule violations before taking action."
        : "Demo screening completed. No rule violations detected.",
      alert_id: null,
      message: flagged
        ? `FLAGGED — ${flags.length} violation(s).`
        : "Transaction is clean. No violations detected.",
      demo: true,
    };
  }
}

const demoUsers = [
  {
    id: "demo-admin",
    email: "admin@complianceiq.com",
    role: "admin",
    is_active: true,
    created_at: "2026-05-01T09:00:00Z",
    last_login_at: new Date().toISOString(),
  },
  {
    id: "demo-officer",
    email: "officer@complianceiq.com",
    role: "officer",
    is_active: true,
    created_at: "2026-05-01T09:00:00Z",
    last_login_at: null,
  },
  {
    id: "demo-analyst",
    email: "analyst@complianceiq.com",
    role: "analyst",
    is_active: true,
    created_at: "2026-05-01T09:00:00Z",
    last_login_at: null,
  },
];

export async function getUsers() {
  try {
    const response = await API.get("/users");
    return response.data;
  } catch (error) {
    if (error.response?.status && !isDemoMode()) throw error;
    return demoUsers;
  }
}

export async function createUser(payload) {
  try {
    const response = await API.post("/users", payload);
    return response.data;
  } catch (error) {
    if (error.response?.status && !isDemoMode()) throw error;
    return {
      user_id: `demo-${Date.now()}`,
      email: payload.email,
      role: payload.role,
      demo: true,
    };
  }
}

export async function deactivateUser(id) {
  try {
    const response = await API.put(`/users/${id}/deactivate`);
    return response.data;
  } catch (error) {
    if (error.response?.status && !isDemoMode()) throw error;
    return { id, demo: true };
  }
}

const demoAuditLogs = [
  {
    id: "demo-log-1",
    user_id: "demo-admin",
    action: "login_success",
    detail: "Successful administrator login",
    ip_address: "127.0.0.1",
    timestamp: new Date().toISOString(),
  },
  {
    id: "demo-log-2",
    user_id: "demo-officer",
    action: "alert_escalated",
    detail: "Alert escalated for senior review",
    ip_address: "127.0.0.1",
    timestamp: "2026-05-14T10:24:00Z",
  },
];

export async function getAuditLogs({ limit = 100, action = "" } = {}) {
  try {
    const response = await API.get("/audit-logs", {
      params: { limit, ...(action ? { action_filter: action } : {}) },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status && !isDemoMode()) throw error;
    return action
      ? demoAuditLogs.filter((log) => log.action === action)
      : demoAuditLogs;
  }
}

export async function askChatbot(question) {
  try {
    const response = await API.post("/chatbot/ask", { question });
    return response.data;
  } catch (error) {
    if (error.response || !isDemoMode()) throw error;
    return {
      question,
      answer:
        "The compliance assistant is in demo mode because the backend is unavailable. The real RAG assistant will answer from the connected regulation sources when that service is running.",
      sources: [],
      demo: true,
    };
  }
}
