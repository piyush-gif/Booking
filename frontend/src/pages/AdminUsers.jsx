import { useCallback, useEffect, useReducer, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/api";
import { useAuthState } from "../context/AuthContext";
import { initialListState, listReducer } from "../reducers/listReducer";
import UserRow from "../components/UserRow";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import usePageTitle from "../hooks/usePageTitle";

export default function AdminUsers() {
  usePageTitle("Users");
  const { user: me } = useAuthState();
  const [state, dispatch] = useReducer(listReducer, initialListState);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await api("/user");
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", payload: err.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRoleChange = useCallback(async (id, role) => {
    if (!window.confirm(`Change this user's role to "${role}"?`)) return;
    setBusyId(id);
    try {
      const updated = await api(`/user/${id}`, { method: "PATCH", body: { role } });
      dispatch({ type: "UPDATE", payload: updated });
      toast.success("Role updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this user? Their bookings will be deleted too.")) return;
    setBusyId(id);
    try {
      await api(`/user/${id}`, { method: "DELETE" });
      dispatch({ type: "REMOVE", payload: id });
      toast.success("User deleted");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }, []);

  let content;
  if (state.status === "idle" || state.status === "loading") {
    content = <Spinner />;
  } else if (state.status === "error") {
    content = (
      <div role="alert" className="rounded bg-red-50 p-4 text-red-700">
        <p className="mb-2">{state.error}</p>
        <Button onClick={load}>Try again</Button>
      </div>
    );
  } else if (state.items.length === 0) {
    content = <p className="text-gray-600">No users.</p>;
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.items.map((u) => (
              <UserRow
                key={u._id}
                user={u}
                isSelf={u._id === me.id}
                busy={busyId === u._id}
                onRoleChange={handleRoleChange}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Users</h1>
      {content}
    </div>
  );
}
