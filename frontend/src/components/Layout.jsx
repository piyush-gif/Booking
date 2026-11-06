import { Outlet } from "react-router";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-4">
        <Outlet />
      </main>
    </>
  );
}
