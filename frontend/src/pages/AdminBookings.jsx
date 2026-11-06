import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/api";
import { initialListState, listReducer } from "../reducers/listReducer";
import AdminBookingRow from "../components/AdminBookingRow";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import usePageTitle from "../hooks/usePageTitle";

const FILTERS = ["all", "pending", "approved", "cancelled"];

export default function AdminBookings() {
  usePageTitle("All bookings");
  const [state, dispatch] = useReducer(listReducer, initialListState);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await api("/booking");
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", payload: err.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const result = { all: state.items.length, pending: 0, approved: 0, cancelled: 0 };
    for (const b of state.items) result[b.status] += 1;
    return result;
  }, [state.items]);

  const visible = useMemo(() => {
    const list =
      filter === "all" ? state.items : state.items.filter((b) => b.status === filter);
    return [...list].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }, [state.items, filter]);

  const handleAction = useCallback(async (id, patch) => {
    setBusyId(id);
    try {
      const updated = await api(`/booking/${id}`, { method: "PATCH", body: patch });
      dispatch({ type: "UPDATE", payload: updated });
      toast.success("Booking updated");
    } catch (err) {
      toast.error(err.message); // a 409 means the slot is now held by someone else
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
  } else if (visible.length === 0) {
    content = <p className="text-gray-600">No bookings here.</p>;
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-2">User</th>
              <th className="p-2">When (Nepal)</th>
              <th className="p-2">Price</th>
              <th className="p-2">Status</th>
              <th className="p-2">Payment</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((booking) => (
              <AdminBookingRow
                key={booking._id}
                booking={booking}
                busy={busyId === booking._id}
                onAction={handleAction}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">All bookings</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "primary" : "secondary"}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            <span className="capitalize">{f}</span> ({counts[f]})
          </Button>
        ))}
      </div>
      {content}
    </div>
  );
}
