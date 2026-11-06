import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useAuthActions, useAuthState } from "../context/AuthContext";
import usePageTitle from "../hooks/usePageTitle";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const emptyForm = { name: "", email: "", phone: "", password: "", confirm: "" };

export default function Register() {
  usePageTitle("Register");
  const { status } = useAuthState();
  const { register } = useAuthActions();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") return <Navigate to="/book" replace />;

  const setField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const found = {};
    if (!form.name.trim()) found.name = "Name is required";
    if (!form.email.trim()) found.email = "Email is required";
    if (!form.phone.trim()) found.phone = "Phone is required";
    if (form.password.length < 8) found.password = "At least 8 characters";
    if (form.confirm !== form.password) found.confirm = "Passwords don't match";
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      toast.success("Account created. Please log in.");
      navigate("/login");
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Create an account</h1>
      <form onSubmit={handleSubmit} noValidate>
        <Input label="Name" autoComplete="name" value={form.name} onChange={setField("name")} error={errors.name} />
        <Input label="Email" type="email" autoComplete="email" value={form.email} onChange={setField("email")} error={errors.email} />
        <Input
          label="Phone"
          type="tel"
          autoComplete="tel"
          hint="Usually 10 digits starting with 9"
          value={form.phone}
          onChange={setField("phone")}
          error={errors.phone}
        />
        <Input label="Password" type="password" autoComplete="new-password" value={form.password} onChange={setField("password")} error={errors.password} />
        <Input label="Confirm password" type="password" autoComplete="new-password" value={form.confirm} onChange={setField("confirm")} error={errors.confirm} />
        {serverError && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {serverError}
          </p>
        )}
        <Button type="submit" loading={submitting} className="w-full">
          Register
        </Button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already registered?{" "}
        <Link to="/login" className="text-blue-700 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
