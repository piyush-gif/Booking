import { Link } from "react-router";
import usePageTitle from "../hooks/usePageTitle";

export default function NotFound() {
  usePageTitle("Page not found");
  return (
    <div className="py-10 text-center">
      <h1 className="mb-2 text-3xl font-bold">Page not found</h1>
      <p className="mb-4 text-gray-600">That page doesn't exist.</p>
      <Link to="/" className="text-blue-700 underline">
        Go home
      </Link>
    </div>
  );
}
