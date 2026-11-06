import { memo } from "react";
import { formatHour } from "../utils/time";

function HourButton({ hour, selected, disabled, onSelect }) {
  let style = "border bg-white hover:bg-blue-50";
  if (selected) style = "border border-blue-600 bg-blue-600 text-white";
  if (disabled) {
    style = "cursor-not-allowed border bg-gray-100 text-gray-400 line-through";
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={() => onSelect(hour)}
      className={`rounded px-2 py-2 text-sm ${style}`}
    >
      {formatHour(hour)}
    </button>
  );
}

export default memo(HourButton);
