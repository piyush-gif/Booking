export const initialListState = { items: [], status: "idle", error: null };

export const listReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, status: "loading", error: null };
    case "FETCH_SUCCESS":
      return { items: action.payload, status: "success", error: null };
    case "FETCH_ERROR":
      return { ...state, status: "error", error: action.payload };
    case "ADD":
      return { ...state, items: [action.payload, ...state.items] };
    case "UPDATE":
      return {
        ...state,
        items: state.items.map((item) => {
          if (item._id !== action.payload._id) return item;
          // In the admin list userId is a populated object, but a PATCH
          // response only has the plain id, so keep the old populated one.
          const keepUser = "userId" in item ? { userId: item.userId } : {};
          return { ...item, ...action.payload, ...keepUser };
        }),
      };
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((item) => item._id !== action.payload),
      };
    case "RESET":
      return initialListState;
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};
