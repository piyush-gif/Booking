import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { api } from "../api/api";
import { useAuthState } from "./AuthContext";
import { listReducer, initialListState } from "../reducers/listReducer";

const BookingsStateContext = createContext(null);
const BookingsActionsContext = createContext(null);

export function BookingsProvider({ children }) {
  const [state, dispatch] = useReducer(listReducer, initialListState);
  const { status: authStatus } = useAuthState();

  const fetchBookings = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await api("/booking/user-bookings");
      dispatch({ type: "FETCH_SUCCESS", payload: data });
    } catch (error) {
      dispatch({ type: "FETCH_ERROR", payload: error.message });
    }
  }, []);

  const addBooking = useCallback((booking) => {
    dispatch({ type: "ADD", payload: booking });
  }, []);

  // Errors are left to throw so the caller can show a toast.
  const updateBooking = useCallback(async (id, patch) => {
    const updated = await api(`/booking/${id}`, {
      method: "PATCH",
      body: patch,
    });
    dispatch({ type: "UPDATE", payload: updated });
    return updated;
  }, []);

  const actions = useMemo(
    () => ({ fetchBookings, addBooking, updateBooking }),
    [fetchBookings, addBooking, updateBooking],
  );

  // Load after login, and wipe on logout so the next person never sees this list.
  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchBookings();
    } else if (authStatus === "unauthenticated") {
      dispatch({ type: "RESET" });
    }
  }, [authStatus, fetchBookings]);

  const sorted = useMemo(
    () =>
      [...state.items].sort(
        (a, b) => new Date(b.startTime) - new Date(a.startTime),
      ),
    [state.items],
  );

  const pendingCount = useMemo(
    () => state.items.filter((b) => b.status === "pending").length,
    [state.items],
  );

  const value = useMemo(
    () => ({ ...state, sorted, pendingCount }),
    [state, sorted, pendingCount],
  );

  return (
    <BookingsStateContext.Provider value={value}>
      <BookingsActionsContext.Provider value={actions}>
        {children}
      </BookingsActionsContext.Provider>
    </BookingsStateContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingsStateContext);
  if (context === null) {
    throw new Error("useBookings must be used inside BookingsProvider");
  }
  return context;
}

export function useBookingsActions() {
  const context = useContext(BookingsActionsContext);
  if (context === null) {
    throw new Error("useBookingsActions must be used inside BookingsProvider");
  }
  return context;
}
