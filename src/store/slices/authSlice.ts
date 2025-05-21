import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../rootReducer";
import api, { setToken } from "../../services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Update User type to include role
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  role: string;
  roles: string[];
}

const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch  {
    return true;
  }
};

const token = localStorage.getItem("token");
const userFromStorage = localStorage.getItem("user");

if (token) {
  try {
    setToken(token);
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
}

const initialState: AuthState = {
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  token: token,
  isAuthenticated: !!token && !isTokenExpired(token),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (!response.data.access_token || !response.data.user) {
        throw new Error("Invalid response from server");
      }

      const { access_token, user } = response.data;

      setToken(access_token);
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        user,
        access_token,
      };
    } catch (error: unknown) {
      console.error("Login error:", error);
      if (error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response && error.response.data && typeof error.response.data === "object" && "message" in error.response.data) {
        return rejectWithValue(error.response.data.message || "Login failed. Please try again.");
      }
      return rejectWithValue("Login failed. Please try again.");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      firstName,
      lastName,
      email,
      password,
      position,
      department,
    }: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      position?: string;
      department?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
        ...(position && { position }),
        ...(department && { department }),
      });

      if (!response.data.access_token || !response.data.user) {
        throw new Error("Invalid response from server");
      }

      const { access_token, user } = response.data;

      setToken(access_token);
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        user,
        access_token,
      };
    } catch (error: unknown) {
      console.error("Registration error:", error);
      if (error && typeof error === "object" && "response" in error && error.response && typeof error.response === "object" && "data" in error.response && error.response.data && typeof error.response.data === "object" && "message" in error.response.data) {
        return rejectWithValue(error.response.data.message || "Registration failed. Please try again.");
      }
      return rejectWithValue("Registration failed. Please try again.");
    }
  }
);

export const loadUser = createAsyncThunk<User, void, { state: RootState }>(
  "auth/loadUser",
  async (_, { getState, rejectWithValue, dispatch }) => {
    const { token } = getState().auth;

    if (!token || isTokenExpired(token)) {
      dispatch(logout());
      return rejectWithValue("Session expired. Please log in again.");
    }

    try {
      setToken(token);

      const userData = localStorage.getItem("user");
      if (!userData) {
        throw new Error("No user data found");
      }

      const user = JSON.parse(userData);
      return user as User;
    } catch (error: unknown) {
      console.error("Error loading user:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken("");
      return rejectWithValue("Failed to load user data. Please log in again.");
    }
  }
);

export const logout = createAsyncThunk<boolean, void, { state: RootState }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken("");
      return true;
    } catch (error: any) {
      console.error("Logout error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to log out"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(loadUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loadUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    });
    builder.addCase(loadUser.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload as string;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    });

    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.error = null;
      if (action.payload.access_token) {
        setToken(action.payload.access_token);
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload as string;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken("");
    });

    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.error = null;
      if (action.payload.access_token) {
        setToken(action.payload.access_token);
      }
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload as string;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken("");
    });
  },
});

export const { clearError } = authSlice.actions;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
