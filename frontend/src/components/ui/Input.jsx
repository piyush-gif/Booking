import { useId } from "react";

export default function Input({ label, error, hint, id, className = "", ...props }) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        className={`w-full rounded border px-3 py-2 ${error ? "border-red-500" : "border-gray-300"} ${className}`}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
