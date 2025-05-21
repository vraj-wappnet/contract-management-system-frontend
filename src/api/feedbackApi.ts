import api from '../services/api';
import type { 
  FeedbackType, 
  FeedbackStatus, 
  RequestStatus, 
  CycleStatus
} from '../types/feedback.types';

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No authentication token found');
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface Feedback {
  id: string;
  type: FeedbackType;
  content: string;
  ratings: Record<string, number>;
  strengths?: string;
  improvements?: string;
  status: FeedbackStatus;
  cycleId?: string;
  fromUser: any; // Replace with User type when available
  fromUserId: string;
  toUser: any; // Replace with User type when available
  toUserId: string;
  requestId?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackCycle {
  id: string;
  name: string;
  description?: string;
  type: string; // Using string instead of CycleType to avoid circular dependency
  startDate: string;
  endDate: string;
  status: CycleStatus;
  feedbackTemplates?: any;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackRequest {
  id: string;
  type: FeedbackType;
  message?: string;
  dueDate: string;
  status: RequestStatus;
  requester: any; // Replace with User type when available
  requesterId: string;
  recipient: any; // Replace with User type when available
  recipientId: string;
  subject: any; // Replace with User type when available
  subjectId: string;
  cycleId?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

// Feedback endpoints
export const getFeedbackList = async (params?: {
  fromUserId?: string;
  toUserId?: string;
  type?: FeedbackType;
  status?: FeedbackStatus;
  cycleId?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/feedback', { params });
  return response.data;
};

export const getFeedbackById = async (id: string) => {
  const response = await api.get(`/feedback/${id}`);
  return response.data;
};

export const createFeedback = async (data: any) => {
  const response = await api.post('/feedback', data);
  return response.data;
};

export const updateFeedback = async (id: string, data: any) => {
  const response = await api.patch(`/feedback/${id}`, data);
  return response.data;
};

export const deleteFeedback = async (id: string) => {
  await api.delete(`/feedback/${id}`);
};

// Feedback Cycle endpoints
export const getFeedbackCycles = async (params?: {
  status?: CycleStatus;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/feedback/cycles', { params });
  return response.data;
};

export const getFeedbackCycleById = async (id: string) => {
  const response = await api.get(`/feedback/cycles/${id}`);
  return response.data;
};

export const createFeedbackCycle = async (data: any) => {
  const response = await api.post('/feedback/cycles', data);
  return response.data;
};

export const updateFeedbackCycle = async (id: string, data: any) => {
  const response = await api.patch(`/feedback/cycles/${id}`, data);
  return response.data;
};

export const deleteFeedbackCycle = async (id: string) => {
  await api.delete(`/feedback/cycles/${id}`);
};

// Feedback Request endpoints
export interface FeedbackRequestParams {
  requesterId?: string;
  recipientId?: string;
  subjectId?: string;
  status?: RequestStatus;
  cycleId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeedbackRequest {
  id: string;
  // Add other properties as needed
}

export const getFeedbackRequests = async (
  params: FeedbackRequestParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<FeedbackRequest>> => {
  try {
    console.log('Fetching feedback requests with params:', params);
    
    const response = await api.get('/feedback/requests', { 
      params: {
        page: 1,
        limit: 10,
        ...params
      },
      headers: getAuthHeaders()
    });
    
    console.log('Feedback requests response:', response.data);
    
    // Ensure we always return a valid response structure
    if (!response.data) {
      return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
    
    return {
      items: response.data.items || [],
      total: response.data.total || 0,
      page: response.data.page || 1,
      limit: response.data.limit || 10,
      totalPages: response.data.totalPages || 1
    };
  } catch (error) {
    console.error('Error fetching feedback requests:', error);
    // Return empty data structure to prevent UI errors
    return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }
};

export const getFeedbackRequestById = async (id: string) => {
  const response = await api.get(`/feedback/requests/${id}`);
  return response.data;
};

export const createFeedbackRequest = async (data: any) => {
  const response = await api.post('/feedback/requests', data);
  return response.data;
};

export const updateFeedbackRequest = async (id: string, data: any) => {
  const response = await api.patch(`/feedback/requests/${id}`, data);
  return response.data;
};

export interface RespondToFeedbackRequestResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface RespondToFeedbackRequestPayload {
  accept: boolean;
  reason?: string;
}

export const approveFeedbackRequest = async (
  id: string
): Promise<RespondToFeedbackRequestResponse> => {
  try {
    const payload = {
      status: 'approved',
      isAnonymous: false
    };
    
    const response = await api.patch<RespondToFeedbackRequestResponse>(
      `/feedback/requests/${id}`,
      payload,
      { 
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    return {
      success: true,
      message: 'Feedback request approved successfully',
      data: response.data
    };
  } catch (error: any) {
    console.error('Error approving feedback request:', error);
    const errorMessage = 
      error?.response?.data?.message || 
      error?.message || 
      'Failed to approve feedback request. Please try again.';
    throw new Error(errorMessage);
  }
};

export const deleteFeedbackRequest = async (id: string) => {
  await api.delete(`/feedback/requests/${id}`);
};

// 360 Feedback endpoints
export const generate360Feedback = async (userId: string, cycleId: string, recipientIds: string[]) => {
  const response = await api.post(`/feedback/360/${userId}?cycleId=${cycleId}`, { recipientIds });
  return response.data;
};

export const get360FeedbackSummary = async (userId: string, cycleId?: string) => {
  const response = await api.get(`/feedback/360/${userId}/summary${cycleId ? `?cycleId=${cycleId}` : ''}`);
  return response.data;
};

// Analytics endpoints
export const getFeedbackStats = async (userId?: string) => {
  const response = await api.get('/feedback/analytics/stats', { params: { userId } });
  return response.data;
};

export const getAverageRatings = async (userId: string) => {
  const response = await api.get(`/feedback/analytics/ratings/${userId}`);
  return response.data;
};
