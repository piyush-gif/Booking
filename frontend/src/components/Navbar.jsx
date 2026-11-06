import { NavLink } from "react-router";

const links = [
  ["/login", "Login"],
  ["/register", "Register"],
  ["/book", "Book"],
  ["/my-bookings", "My Bookings"],
  ["/profile", "Profile"],
  ["/admin/bookings", "Admin Bookings"],
  ["/admin/users", "Admin Users"],
];

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="max-w-5xl mx-auto p-4 flex flex-wrap gap-3">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? "font-bold text-blue-700" : "text-gray-700"
            }>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
