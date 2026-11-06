const TZ = "Asia/Kathmandu";

export const DAY_MS = 24 * 60 * 60 * 1000;
export const OPEN_HOUR = 6; // mirrors the backend
export const CLOSE_HOUR = 22; // exclusive: the last slot starts at 21:00
export const MAX_DAYS_AHEAD = 30; // mirrors the backend

// "2026-12-01", 18  ->  "2026-12-01T18:00:00+05:45"  (what the API expects)
export const toNepalISO = (dateStr, hour) =>
  `${dateStr}T${String(hour).padStart(2, "0")}:00:00+05:45`;

// UTC string from the API -> readable Nepal time
export const formatNepal = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    timeZone: TZ,
    dateStyle: "medium",
    timeStyle: "short",
  });

// "YYYY-MM-DD" for a date, in Nepal time (used for <input type="date"> min and max)
export const nepalDateString = (date = new Date()) =>
  date.toLocaleDateString("en-CA", { timeZone: TZ });

// A Nepal calendar day -> the UTC range [from, to) for GET /booking/taken
export const nepalDayRange = (dateStr) => {
  const start = new Date(toNepalISO(dateStr, 0));
  return {
    from: start.toISOString(),
    to: new Date(start.getTime() + DAY_MS).toISOString(),
  };
};

// 6 -> "6:00 AM", 18 -> "6:00 PM"
export const formatHour = (hour) =>
  `${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`;
