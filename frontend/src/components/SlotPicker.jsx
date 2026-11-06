import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../api/api";
import {
  CLOSE_HOUR,
  DAY_MS,
  MAX_DAYS_AHEAD,
  OPEN_HOUR,
  formatNepal,
  nepalDateString,
  nepalDayRange,
  toNepalISO,
} from "../utils/time";
import HourButton from "./HourButton";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Spinner from "./ui/Spinner";

const HOURS = Array.from(
  { length: CLOSE_HOUR - OPEN_HOUR },
  (_, i) => OPEN_HOUR + i,
);

// onSubmit(startTime) makes the API call and handles success. It throws on failure.
export default function SlotPicker({ submitLabel, onSubmit, onCancel }) {
  const [date, setDate] = useState("");
  const [selectedHour, setSelectedHour] = useState(null);
  const [taken, setTaken] = useState(() => new Set()); // epoch ms of booked slots
  const [takenStatus, setTakenStatus] = useState("idle"); // idle | loading | error
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const minDate = nepalDateString();
  const maxDate = nepalDateString(
    new Date(new Date().getTime() + MAX_DAYS_AHEAD * DAY_MS),
  );

  const handleDateChange = (e) => {
    const value = e.target.value;
    setDate(value);
    setSelectedHour(null);
    setTaken(new Set());
    setTakenStatus(value ? "loading" : "idle");
  };

  const handleRetry = () => {
    setTakenStatus("loading");
    setReloadKey((k) => k + 1);
  };

  // Fetch the booked slots for the chosen day.
  useEffect(() => {
    if (!date) return;
    let ignore = false; // a slow answer for an old date must not overwrite a newer one

    const { from, to } = nepalDayRange(date);
    api("/booking/taken?" + new URLSearchParams({ from, to }))
      .then((list) => {
        if (ignore) return;
        setTaken(new Set(list.map((iso) => new Date(iso).getTime())));
        setTakenStatus("idle");
      })
      .catch(() => {
        if (!ignore) setTakenStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [date, reloadKey]);

  const slots = useMemo(() => {
    if (!date) return [];
    const now = new Date();
    const latest = new Date(now.getTime() + MAX_DAYS_AHEAD * DAY_MS);
    return HOURS.map((hour) => {
      const time = new Date(toNepalISO(date, hour));
      return {
        hour,
        disabled: time <= now || time > latest || taken.has(time.getTime()),
      };
    });
  }, [date, taken]);

  const handleSelect = useCallback((hour) => setSelectedHour(hour), []);

  const handleSubmit = async () => {
    if (!date || selectedHour === null) return;
    const startTime = toNepalISO(date, selectedHour);
    setSubmitting(true);
    try {
      await onSubmit(startTime);
    } catch (error) {
      if (error.status === 409) {
        setTaken((prev) => new Set(prev).add(new Date(startTime).getTime()));
        setSelectedHour(null);
        toast.error("That slot was just taken. Pick another time.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Input
        label="Date"
        type="date"
        min={minDate}
        max={maxDate}
        value={date}
        onChange={handleDateChange}
      />

      {date && takenStatus === "loading" && <Spinner label="Checking availability..." />}

      {date && takenStatus === "error" && (
        <div role="alert" className="mb-3 rounded bg-yellow-50 p-3 text-sm text-yellow-800">
          Couldn't check which slots are taken. You can still try a slot.{" "}
          <button type="button" onClick={handleRetry} className="font-medium underline">
            Retry
          </button>
        </div>
      )}

      {date && takenStatus !== "loading" && (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((slot) => (
            <HourButton
              key={slot.hour}
              hour={slot.hour}
              selected={slot.hour === selectedHour}
              disabled={slot.disabled}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {date && selectedHour !== null && (
        <p className="mb-3 text-sm text-gray-700">
          Selected: <strong>{formatNepal(toNepalISO(date, selectedHour))}</strong> (Nepal time)
        </p>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!date || selectedHour === null}
          loading={submitting}
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
