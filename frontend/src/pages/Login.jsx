import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { useAuthActions, useAuthState } from "../context/AuthContext";
import usePageTitle from "../hooks/usePageTitle";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
  usePageTitle("Login");
  const { status, user } = useAuthState();
  const { login } = useAuthActions();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Once logged in (now or already), go back where we came from, else to the default page.
  if (status === "authenticated") {
    const from = location.state?.from?.pathname;
    const fallback = user.role === "admin" ? "/admin/bookings" : "/book";
    return <Navigate to={from || fallback} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Log in</h1>
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" loading={submitting} className="w-full">
          Log in
        </Button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        No account?{" "}
        <Link to="/register" className="text-blue-700 underline">
          Register
        </Link>
      </p>
    </div>
  );
}
