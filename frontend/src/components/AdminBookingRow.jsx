import { memo } from "react";
import { formatNepal } from "../utils/time";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

function AdminBookingRow({ booking, busy, onAction }) {
  const { _id, userId, startTime, price, status, paymentStatus } = booking;

  return (
    <tr className="border-b align-top">
      <td className="p-2">
        <div className="font-medium">{userId?.name ?? "Deleted user"}</div>
        <div className="text-xs text-gray-500">{userId?.phone}</div>
      </td>
      <td className="whitespace-nowrap p-2">{formatNepal(startTime)}</td>
      <td className="p-2">Rs. {price}</td>
      <td className="p-2">
        <Badge value={status} />
      </td>
      <td className="p-2">
        <Badge value={paymentStatus} />
      </td>
      <td className="p-2">
        <div className="flex flex-wrap gap-1">
          {status === "pending" && (
            <Button size="sm" disabled={busy} onClick={() => onAction(_id, { status: "approved" })}>
              Approve
            </Button>
          )}
          {status !== "cancelled" && paymentStatus === "unpaid" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => onAction(_id, { paymentStatus: "paid" })}
            >
              Mark paid
            </Button>
          )}
          {status !== "cancelled" && (
            <Button
              size="sm"
              variant="danger"
              disabled={busy}
              onClick={() => onAction(_id, { status: "cancelled" })}
            >
              Cancel
            </Button>
          )}
          {status === "cancelled" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => onAction(_id, { status: "pending" })}
            >
              Restore
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default memo(AdminBookingRow);
