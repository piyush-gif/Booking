import { memo } from "react";

const colors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  cancelled: "bg-gray-200 text-gray-700",
  unpaid: "bg-red-100 text-red-800",
  paid: "bg-green-100 text-green-800",
};

function Badge({ value }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[value] || "bg-gray-100 text-gray-700"}`}
    >
      {value}
    </span>
  );
}

export default memo(Badge);
