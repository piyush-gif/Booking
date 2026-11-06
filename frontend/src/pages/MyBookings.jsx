import { useCallback, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useBookings, useBookingsActions } from "../context/BookingsContext";
import BookingCard from "../components/BookingCard";
import SlotPicker from "../components/SlotPicker";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import usePageTitle from "../hooks/usePageTitle";
import { formatNepal } from "../utils/time";

export default function MyBookings() {
  usePageTitle("My bookings");
  const { sorted, status, error } = useBookings();
  const { fetchBookings, updateBooking } = useBookingsActions();
  const [busyId, setBusyId] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);

  const handleCancel = useCallback(
    async (id) => {
      if (!window.confirm("Cancel this booking?")) return;
      setBusyId(id);
      try {
        await updateBooking(id, { status: "cancelled" });
        toast.success("Booking cancelled");
      } catch (err) {
        toast.error(err.message);
        if (err.status === 403) fetchBookings(); // an admin changed it meanwhile
      } finally {
        setBusyId(null);
      }
    },
    [updateBooking, fetchBookings],
  );

  const handleReschedule = useCallback((id) => setReschedulingId(id), []);

  const handleMove = useCallback(
    async (startTime) => {
      try {
        await updateBooking(reschedulingId, { startTime });
      } catch (err) {
        if (err.status === 403) fetchBookings();
        throw err; // SlotPicker shows the message
      }
      toast.success("Booking moved");
      setReschedulingId(null);
    },
    [updateBooking, fetchBookings, reschedulingId],
  );

  const rescheduling = sorted.find((b) => b._id === reschedulingId);

  let content;
  if (status === "idle" || status === "loading") {
    content = <Spinner />;
  } else if (status === "error") {
    content = (
      <div role="alert" className="rounded bg-red-50 p-4 text-red-700">
        <p className="mb-2">{error}</p>
        <Button onClick={fetchBookings}>Try again</Button>
      </div>
    );
  } else if (sorted.length === 0) {
    content = (
      <p className="text-gray-600">
        You have no bookings yet.{" "}
        <Link to="/book" className="text-blue-700 underline">
          Book a slot
        </Link>
      </p>
    );
  } else {
    content = (
      <ul className="space-y-3">
        {sorted.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            busy={busyId === booking._id}
            onCancel={handleCancel}
            onReschedule={handleReschedule}
          />
        ))}
      </ul>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">My bookings</h1>

      {rescheduling && (
        <section className="mb-6 rounded border bg-blue-50 p-4">
          <h2 className="mb-3 font-semibold">
            Move booking from {formatNepal(rescheduling.startTime)}
          </h2>
          <SlotPicker
            key={reschedulingId}
            submitLabel="Move booking"
            onSubmit={handleMove}
            onCancel={() => setReschedulingId(null)}
          />
        </section>
      )}

      {content}
    </div>
  );
}
