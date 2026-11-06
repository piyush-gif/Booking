import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthState } from "../context/AuthContext";
import Spinner from "./ui/Spinner";

// UX only. The real protection is the backend.
export default function AdminRoute() {
  const { status, user } = useAuthState();
  const location = useLocation();

  if (status === "loading") return <Spinner />;
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (user.role !== "admin") return <Navigate to="/book" replace />;
  return <Outlet />;
}
