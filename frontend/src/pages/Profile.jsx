import { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { api } from "../api/api";
import { useAuthActions, useAuthState } from "../context/AuthContext";
import usePageTitle from "../hooks/usePageTitle";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Profile() {
  usePageTitle("Profile");
  const { user } = useAuthState();
  const { updateUser, logout } = useAuthActions();
  const navigate = useNavigate();

  // edit profile
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // change password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    if (!name.trim() || !phone.trim()) {
      setProfileError("Name and phone are required");
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await api(`/user/${user.id}`, {
        method: "PATCH",
        body: { name: name.trim(), phone: phone.trim() },
      });
      updateUser({ name: updated.name, phone: updated.phone });
      toast.success("Profile updated");
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    if (!oldPassword || !newPassword) {
      setPasswordError("Fill in all password fields");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirm) {
      setPasswordError("The new passwords don't match");
      return;
    }
    setSavingPassword(true);
    try {
      await api(`/user/${user.id}/password`, {
        method: "PATCH",
        body: { oldPassword, newPassword },
      });
      // The backend removed all refresh tokens, so log in again cleanly.
      await logout();
      toast.success("Password changed. Please log in again.");
      navigate("/login");
    } catch (err) {
      setPasswordError(err.message);
      setSavingPassword(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Delete your account? Your bookings will be deleted too. This can't be undone.",
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await api(`/user/${user.id}`, { method: "DELETE" });
      await logout();
      toast.success("Account deleted");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-10">
      <section>
        <h1 className="mb-1 text-2xl font-bold">Profile</h1>
        <p className="mb-4 text-sm text-gray-600">{user.email}</p>
        <form onSubmit={handleProfile} noValidate>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {profileError && (
            <p role="alert" className="mb-3 text-sm text-red-600">
              {profileError}
            </p>
          )}
          <Button type="submit" loading={savingProfile}>
            Save changes
          </Button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Change password</h2>
        <form onSubmit={handlePassword} noValidate>
          <Input label="Old password" type="password" autoComplete="current-password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
          <Input label="New password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {passwordError && (
            <p role="alert" className="mb-3 text-sm text-red-600">
              {passwordError}
            </p>
          )}
          <Button type="submit" loading={savingPassword}>
            Change password
          </Button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold text-red-700">Delete account</h2>
        <p className="mb-3 text-sm text-gray-600">
          This also deletes all of your bookings.
        </p>
        <Button variant="danger" loading={deleting} onClick={handleDelete}>
          Delete my account
        </Button>
      </section>
    </div>
  );
}
