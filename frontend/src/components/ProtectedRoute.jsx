import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthState } from "../context/AuthContext";
import Spinner from "./ui/Spinner";

// UX only. The real protection is the backend.
export default function ProtectedRoute() {
  const { status } = useAuthState();
  const location = useLocation();

  if (status === "loading") return <Spinner />;
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
