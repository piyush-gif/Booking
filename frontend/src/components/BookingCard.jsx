import { memo } from "react";
import { formatNepal } from "../utils/time";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

function BookingCard({ booking, busy, onCancel, onReschedule }) {
  const { _id, startTime, price, status, paymentStatus } = booking;

  return (
    <li className="rounded border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{formatNepal(startTime)}</p>
        <div className="flex gap-2">
          <Badge value={status} />
          <Badge value={paymentStatus} />
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-600">Rs. {price}</p>

      {status === "pending" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Waiting for admin approval</span>
          <Button variant="secondary" size="sm" onClick={() => onReschedule(_id)}>
            Reschedule
          </Button>
          <Button variant="danger" size="sm" loading={busy} onClick={() => onCancel(_id)}>
            Cancel
          </Button>
        </div>
      )}

      {status === "approved" && (
        <p className="mt-3 text-sm text-gray-500">Contact support to make changes</p>
      )}
    </li>
  );
}

export default memo(BookingCard);
