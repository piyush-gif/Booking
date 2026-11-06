import { memo } from "react";
import Button from "./ui/Button";

function UserRow({ user, isSelf, busy, onRoleChange, onDelete }) {
  return (
    <tr className="border-b">
      <td className="p-2 font-medium">
        {user.name}
        {isSelf && <span className="ml-1 text-xs text-gray-500">(you)</span>}
      </td>
      <td className="p-2">{user.email}</td>
      <td className="p-2">{user.phone}</td>
      <td className="p-2">
        <select
          value={user.role}
          disabled={isSelf || busy}
          aria-label={`Role for ${user.name}`}
          onChange={(e) => onRoleChange(user._id, e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </td>
      <td className="p-2">
        <Button
          size="sm"
          variant="danger"
          disabled={isSelf}
          loading={busy}
          onClick={() => onDelete(user._id)}
        >
          Delete
        </Button>
      </td>
    </tr>
  );
}

export default memo(UserRow);
