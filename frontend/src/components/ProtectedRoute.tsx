import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authStore } from "@/lib/auth";

export function ProtectedRoute() {
  const location = useLocation();
  const token = authStore.getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const token = authStore.getToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
