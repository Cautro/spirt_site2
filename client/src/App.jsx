import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Owner from "./pages/Owner";
import Unauthorized from "./pages/Unauthorized";
import RequireAuth from "./auth/RequireAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/dashboard"
        element={
          <RequireAuth roles={["user", "helper"]}>
            <Dashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireAuth roles={["admin", "owner"]}>
            <Admin />
          </RequireAuth>
        }
      />

      <Route
        path="/owner"
        element={
          <RequireAuth roles={["owner"]}>
            <Owner />
          </RequireAuth>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
