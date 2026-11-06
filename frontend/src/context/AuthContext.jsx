import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { api, setUnauthorizedHandler } from "../api/api";

const AuthStateContext = createContext(null);
const AuthActionsContext = createContext(null);

const initialState = { user: null, status: "loading" };

const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_SUCCESS":
      return { user: action.payload, status: "authenticated" };
    case "AUTH_FAILURE":
    case "LOGOUT":
      return { user: null, status: "unauthenticated" };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (email, password) => {
    const user = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    dispatch({ type: "AUTH_SUCCESS", payload: user });
    return user;
  }, []);

  const register = useCallback(
    (data) => api("/auth/register", { method: "POST", body: data }),
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // log out in the UI even if the request failed
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const updateUser = useCallback((partial) => {
    dispatch({ type: "UPDATE_USER", payload: partial });
  }, []);

  const actions = useMemo(
    () => ({ login, register, logout, updateUser }),
    [login, register, logout, updateUser],
  );

  // When the session is truly dead (refresh failed), log out in the UI.
  useEffect(() => {
    setUnauthorizedHandler(() => dispatch({ type: "AUTH_FAILURE" }));
  }, []);

  // On load, ask the backend who we are. This is what survives a page reload.
  useEffect(() => {
    api("/auth/me")
      .then((user) => dispatch({ type: "AUTH_SUCCESS", payload: user }))
      .catch(() => dispatch({ type: "AUTH_FAILURE" }));
  }, []);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (context === null) {
    throw new Error("useAuthState must be used inside AuthProvider");
  }
  return context;
}

export function useAuthActions() {
  const context = useContext(AuthActionsContext);
  if (context === null) {
    throw new Error("useAuthActions must be used inside AuthProvider");
  }
  return context;
}
