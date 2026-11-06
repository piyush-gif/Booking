import { NavLink, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useAuthState, useAuthActions } from "../context/AuthContext";
import { useBookings } from "../context/BookingsContext";
import Button from "./ui/Button";

const linkClass = ({ isActive }) =>
  isActive ? "font-bold text-blue-700" : "text-gray-700 hover:text-blue-700";

export default function Navbar() {
  const { user, status } = useAuthState();
  const { logout } = useAuthActions();
  const { pendingCount } = useBookings();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 p-4">
        <span className="font-bold">Booking App</span>

        {status === "authenticated" && (
          <>
            <NavLink to="/book" className={linkClass}>
              Book
            </NavLink>
            <NavLink to="/my-bookings" className={linkClass}>
              My Bookings
              {pendingCount > 0 && (
                <span className="ml-1 rounded-full bg-yellow-400 px-2 text-xs font-semibold text-black">
                  {pendingCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
            {user.role === "admin" && (
              <>
                <NavLink to="/admin/bookings" className={linkClass}>
                  All bookings
                </NavLink>
                <NavLink to="/admin/users" className={linkClass}>
                  Users
                </NavLink>
              </>
            )}
            <span className="ml-auto text-sm text-gray-600">{user.name}</span>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}

        {status === "unauthenticated" && (
          <>
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
            <NavLink to="/register" className={linkClass}>
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
