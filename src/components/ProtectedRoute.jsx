import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { getCurrentUser } from "../api/client";

export default function ProtectedRoute({ children, roles = [] }) {
  const [state, setState] = useState("checking");
  const [user, setUser] = useState(null);
  const requiredRoles = roles.join("|");

  useEffect(() => {
    let active = true;

    async function verifySession() {
      if (!sessionStorage.getItem("token")) {
        if (active) setState("unauthenticated");
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        sessionStorage.setItem("role", currentUser.role);
        sessionStorage.setItem("email", currentUser.email);
        if (active) {
          setUser(currentUser);
          setState("ready");
        }
      } catch {
        sessionStorage.clear();
        if (active) setState("unauthenticated");
      }
    }

    function handleExpiredSession() {
      if (active) setState("unauthenticated");
    }

    window.addEventListener("complianceiq:session-expired", handleExpiredSession);
    verifySession();

    return () => {
      active = false;
      window.removeEventListener(
        "complianceiq:session-expired",
        handleExpiredSession
      );
    };
  }, [requiredRoles]);

  if (state === "checking") {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        <div className="rounded-2xl bg-white dark:bg-slate-900 px-6 py-5 shadow-sm text-sm text-slate-500 dark:text-slate-300">
          Verifying your session…
        </div>
      </div>
    );
  }

  if (state === "unauthenticated") {
    return <Navigate to="/" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
