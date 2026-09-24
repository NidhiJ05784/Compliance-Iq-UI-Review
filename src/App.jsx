import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import AlertDetail from "./pages/AlertDetail";
import Compliance from "./pages/Compliance";
import Login from "./pages/Login";
import TransactionCheck from "./pages/TransactionCheck";
import Chatbot from "./pages/Chatbot";
import AdminUsers from "./pages/AdminUsers";
import AuditLogs from "./pages/AuditLogs";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts/:alertId"
          element={
            <ProtectedRoute>
              <AlertDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/compliance"
          element={
            <ProtectedRoute>
              <Compliance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions/check"
          element={
            <ProtectedRoute>
              <TransactionCheck />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
