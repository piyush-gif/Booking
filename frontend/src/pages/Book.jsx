import { useCallback } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { api } from "../api/api";
import { useBookingsActions } from "../context/BookingsContext";
import SlotPicker from "../components/SlotPicker";
import usePageTitle from "../hooks/usePageTitle";

export default function Book() {
  usePageTitle("Book a slot");
  const { addBooking } = useBookingsActions();
  const navigate = useNavigate();

  const handleBook = useCallback(
    async (startTime) => {
      const booking = await api("/booking", {
        method: "POST",
        body: { startTime },
      });
      addBooking(booking);
      toast.success("Booking requested. Waiting for admin approval.");
      navigate("/my-bookings");
    },
    [addBooking, navigate],
  );

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold">Book a slot</h1>
      <p className="mb-4 text-sm text-gray-600">
        Pick a date, then an hour. All times are Nepal time.
      </p>
      <SlotPicker submitLabel="Book this slot" onSubmit={handleBook} />
    </div>
  );
}
