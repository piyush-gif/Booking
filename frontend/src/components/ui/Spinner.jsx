export default function Spinner({ label = "Loading..." }) {
  return (
    <div
      className="flex items-center justify-center gap-2 py-10 text-gray-600"
      role="status"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      <span>{label}</span>
    </div>
  );
}
