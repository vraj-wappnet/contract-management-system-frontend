import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../rootReducer';
import api from '../../services/api';

// Helper type for API error responses
type ApiError = {
  message: string;
  status?: number;
};

// Define the API User type that matches the API response
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  role?: string; // For backward compatibility
  position: string;
  department: string;
  managerId: string | null;
  manager?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  password?: string; // Only present in some responses
}

// Type for the users response from the API
interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Type for the Redux state
interface UserState {
  users: UsersResponse | null;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}



const initialState: UserState = {
  users: null,
  currentUser: null,
  loading: false,
  error: null,
};

// Async thunks
// Types for fetchUsers parameters
type FetchUsersParams = {
  page?: number;
  limit?: number;
};

export const fetchUsers = createAsyncThunk<UsersResponse, FetchUsersParams, { rejectValue: ApiError }>(
  'users/fetchUsers',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/users', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch users',
        status: error.response?.status
      });
    }
  }
);

export const fetchUserById = createAsyncThunk<User, string, { rejectValue: string }>(
  'users/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user'
      );
    }
  }
);

export const createUser = createAsyncThunk<User, Partial<User>, { rejectValue: string }>(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create user'
      );
    }
  }
);

export const updateUser = createAsyncThunk<
  User,
  { id: string; userData: Partial<User> },
  { rejectValue: string }
>(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user'
      );
    }
  }
);

export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete user'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<UsersResponse>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as unknown as string;
      });

    // Fetch User By Id
    builder.addCase(fetchUserById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchUserById.fulfilled,
      (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.currentUser = action.payload;
      }
    );
    builder.addCase(fetchUserById.rejected, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : 'Failed to fetch user';
      } else {
        state.error = 'Failed to fetch user';
      }
    });

    // Create User
    builder.addCase(createUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      createUser.fulfilled,
      (state, action: PayloadAction<User>) => {
        state.loading = false;
        if (state.users) {
          state.users = {
            ...state.users,
            items: [action.payload, ...(state.users.items || [])],
            total: (state.users.total || 0) + 1,
          };
        }
      }
    );
    builder.addCase(createUser.rejected, (state, action) => {
      state.loading = false;
      state.error = typeof action.payload === 'string' 
        ? action.payload 
        : 'Failed to create user';
    });

    // Update User
    builder.addCase(updateUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateUser.fulfilled,
      (state, action: PayloadAction<User>) => {
        state.loading = false;
        if (state.users) {
          const updatedItems = [...(state.users.items || [])];
          const index = updatedItems.findIndex(
            (user) => user.id === action.payload.id
          );
          if (index !== -1) {
            updatedItems[index] = action.payload;
            state.users = {
              ...state.users,
              items: updatedItems
            };
          }
        }
      }
    );
    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = typeof action.payload === 'string'
        ? action.payload
        : 'Failed to update user';
    });
  },
});

export const { clearCurrentUser, clearError } = userSlice.actions;

export const selectUsers = (state: RootState) => state.users.users?.items || [];
export const selectUsersResponse = (state: RootState) => state.users.users;
export const selectCurrentUser = (state: RootState) => state.users.currentUser;
export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectTotalUsers = (state: RootState) => state.users.users?.total || 0;

export default userSlice.reducer;
