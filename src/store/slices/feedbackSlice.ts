import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../store';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface FeedbackReceivedParams {
  page?: number;
  limit?: number;
  userId: string;
}

interface FeedbackResponse {
  data: FeedbackState['received'];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export const fetchFeedbackReceived = createAsyncThunk<
  FeedbackResponse,
  FeedbackReceivedParams,
  { rejectValue: string }
>(
  'feedback/fetchReceived',
  async ({ page = 1, limit = 10, userId }, { rejectWithValue }) => {
    try {
      const response = await api.get<FeedbackResponse>('/feedback/received', {
        params: {
          page,
          limit,
          userId,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feedback');
    }
  }
);

interface FeedbackState {
  received: Array<{
    id: string;
    fromUser: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    requestId: string;
  }>;
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}

const initialState: FeedbackState = {
  received: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
};

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearFeedbackError: (state) => {
      state.error = null;
    },
    resetFeedbackState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedbackReceived.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbackReceived.fulfilled, (state, action) => {
        state.loading = false;
        state.received = action.payload?.data || [];
        state.pagination = {
          ...state.pagination,
          total: action.payload?.pagination?.total || 0,
        };
      })
      .addCase(fetchFeedbackReceived.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch feedback';
      });
  },
});

export const { clearFeedbackError, resetFeedbackState } = feedbackSlice.actions;

export const selectFeedbackReceived = (state: RootState) => state.feedback.received;
export const selectFeedbackLoading = (state: RootState) => state.feedback.loading;
export const selectFeedbackError = (state: RootState) => state.feedback.error;
export const selectFeedbackPagination = (state: RootState) => state.feedback.pagination;

export default feedbackSlice.reducer;
