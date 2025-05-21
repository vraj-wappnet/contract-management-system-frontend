import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Form } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import api from '../../services/api';
import { createFeedbackRequest, updateFeedbackRequest } from '../../api/feedbackApi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

type FeedbackType = 'peer' | 'manager' | 'self' | 'upward' | '360';
type RequestStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

interface FeedbackFormValues {
  type: FeedbackType;
  recipientId: string;
  subjectId: string;
  requesterId: string;
  dueDate: Dayjs;
  message: string;
  status: RequestStatus;
  cycleId?: string;
}

interface FeedbackCycle {
  id: string;
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  feedbackTemplates: {
    questions: string[];
    ratingCategories: string[];
  } | null;
  createdAt: string;
  updatedAt: string;
}

const FeedbackRequestForm: React.FC = () => {
  const { user: currentUser, loading: loadingUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm<FeedbackFormValues>();
  
  const initialValues: Partial<FeedbackFormValues> = {
    type: 'peer' as const,
    status: 'pending' as const,
    recipientId: undefined,
    subjectId: currentUser?.id,
    dueDate: undefined,
    message: '',
    cycleId: undefined
  };
  
  const [employees, setEmployees] = useState<User[]>([]);
  const [cycles, setCycles] = useState<FeedbackCycle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users', {
        params: {
          page: 1,
          limit: 100
        }
      });
      
      if (response.data?.items) {
        setEmployees(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setToast({ message: 'Failed to load employees', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCycles = useCallback(async () => {
    try {
      setIsLoadingCycles(true);
      const response = await api.get('/feedback/cycles', {
        params: {
          page: 1,
          limit: 10
        }
      });
      const activeCycles = response.data.items.filter((cycle: FeedbackCycle) => cycle.status === 'active');
      response.data.items = activeCycles;
      if (response.data?.items) {
        setCycles(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching feedback cycles:', error);
      setToast({ message: 'Failed to load feedback cycles', type: 'error' });
    } finally {
      setIsLoadingCycles(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      fetchEmployees();
      fetchCycles();
      form.setFieldsValue({ 
        subjectId: currentUser.id,
        requesterId: currentUser.id
      });
    }
  }, [currentUser?.id, form, fetchEmployees, fetchCycles]);

  const handleSelfFeedbackChange = useCallback((checked: boolean) => {
    if (checked) {
      form.setFieldsValue({ 
        recipientId: currentUser?.id,
        type: 'self' as const
      });
    } else {
      form.setFieldsValue({ 
        recipientId: undefined,
        type: 'peer' as const
      });
    }
  }, [currentUser?.id, form]);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
    navigate('/feedback/requests');
  }, [navigate]);

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  useEffect(() => {
    if (!id || !currentUser?.id) return;
    
    const fetchRequest = async () => {
      try {
        setIsFormLoading(true);
        const response = await api.get(`/feedback/requests/${id}`);
        const request = response.data;
        
        form.setFieldsValue({
          ...request,
          dueDate: dayjs(request.dueDate)
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error loading feedback request';
        setToast({ message: errorMessage, type: 'error' });
        console.error('Error fetching feedback request:', error);
        navigate('/feedback/requests');
      } finally {
        setIsFormLoading(false);
      }
    };
    
    fetchRequest();
  }, [id, form, navigate, currentUser?.id]);

  const handleSubmit = useCallback(async (values: FeedbackFormValues) => {
    if (!currentUser?.id) {
      setToast({ message: 'User not authenticated', type: 'error' });
      return;
    }

    // Client-side validation for due date
    if (values.dueDate && values.dueDate.isBefore(dayjs())) {
      setToast({ message: 'Due date must be in the future', type: 'error' });
      return;
    }

    try {
      setIsLoading(true);

      // Base request data
      const requestData = {
        recipientId: values.recipientId,
        dueDate: values.dueDate.toISOString(),
        message: values.message || undefined,
        status: 'pending' as const,
      };

      if (id) {
        // For updates, only include allowed fields
        await updateFeedbackRequest(id, {
          recipientId: requestData.recipientId,
          dueDate: requestData.dueDate,
          message: requestData.message,
          status: requestData.status,
        });
        setToast({ message: 'Feedback request updated successfully', type: 'success' });
      } else {
        // For creation, include all fields
        await createFeedbackRequest({
          ...requestData,
          type: values.type,
          cycleId: values.cycleId,
          subjectId: currentUser.id,
          requesterId: currentUser.id,
        });
        setToast({ message: 'Feedback request created successfully', type: 'success' });
      }

      navigate('/feedback/requests');
    } catch (error: unknown) {
      console.error('Error submitting feedback request:', error);
      let errorMessage = 'Failed to submit feedback request';
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { message?: string | string[] } } };
        const msg = err.response?.data?.message;
        errorMessage = Array.isArray(msg) ? msg.join(', ') : (msg || errorMessage);
      }
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id, id, navigate]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!currentUser) {
    return null;
  }

  if (loadingUser || isFormLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform ${
              toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 transition-all duration-300 hover:shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {id ? 'Update Feedback Request' : 'New Feedback Request'}
          </h2>
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={handleSubmit}
            className="space-y-6"
          >
            <Form.Item
              name="type"
              label={
                <label className="block text-sm font-semibold text-gray-700">
                  Feedback Type <span className="text-red-500">*</span>
                </label>
              }
              rules={[{ required: true, message: 'Please select feedback type' }]}
            >
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                aria-required="true"
              >
                <option value="" disabled>Select feedback type</option>
                <option value="peer">Peer Feedback</option>
                <option value="manager">Manager Feedback</option>
                <option value="self">Self Feedback</option>
                <option value="upward">Upward Feedback</option>
                <option value="360">360° Feedback</option>
              </select>
            </Form.Item>

            <Form.Item
              name="isSelfFeedback"
              label={
                <label className="block text-sm font-semibold text-gray-700">
                  Request Self-Feedback
                </label>
              }
              valuePropName="checked"
            >
              <input
                type="checkbox"
                onChange={(e) => handleSelfFeedbackChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </Form.Item>

            <Form.Item
              name="recipientId"
              label={
                <label className="block text-sm font-semibold text-gray-700">
                  Recipient <span className="text-red-500">*</span>
                </label>
              }
              rules={[{ required: true, message: 'Please select a recipient' }]}
            >
              <div className="relative">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                  disabled={isLoading}
                  aria-required="true"
                >
                  <option value="" disabled>Select a recipient</option>
                  {employees.map((employee) => {
                    const fullName = employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
                    return (
                      <option key={employee.id} value={employee.id}>
                        {fullName} ({employee.email})
                      </option>
                    );
                  })}
                </select>
                {isLoading && (
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600 absolute right-3 top-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
              </div>
            </Form.Item>

            <Form.Item
              name="dueDate"
              label={
                <label className="block text-sm font-semibold text-gray-700">
                  Due Date <span className="text-red-500">*</span>
                </label>
              }
              rules={[
                { required: true, message: 'Please select due date' },
                {
                  validator: (_, value) => {
                    if (!value || value.isAfter(dayjs())) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Due date must be in the future'));
                  },
                },
              ]}
            >
              <input
                type="date"
                min={dayjs().format('YYYY-MM-DD')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-required="true"
              />
            </Form.Item>

            <Form.Item
              name="cycleId"
              label={
                <label className="block text-sm font-semibold text-gray-700">
                  Feedback Cycle <span className="text-red-500">*</span>
                </label>
              }
              rules={[{ required: true, message: 'Please select a feedback cycle' }]}
            >
              <div className="relative">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                  disabled={isLoadingCycles}
                  aria-required="true"
                >
                  <option value="" disabled>Select feedback cycle</option>
                  {cycles.map((cycle) => (
                    <option key={cycle.id} value={cycle.id}>
                      {cycle.name} ({new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {isLoadingCycles && (
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600 absolute right-3 top-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
              </div>
            </Form.Item>

            <Form.Item
              name="message"
              label={
                <label className="block text-sm font-semibold text-gray-700">
                  Message to Recipient <span className="text-red-500">*</span>
                </label>
              }
              rules={[{ required: true, message: 'Please enter a message' }]}
            >
              <textarea
                rows={4}
                placeholder="Enter your message to the recipient"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                aria-required="true"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={id ? 'Update feedback request' : 'Submit feedback request'}
                >
                  {isLoading && (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {id ? 'Update' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalVisible(true)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Cancel feedback request"
                >
                  Cancel
                </button>
              </div>
            </Form.Item>
          </Form>

          {/* Cancel Confirmation Modal */}
          {isModalVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 animate-fadeIn">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cancel Request</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to cancel this request? Any unsaved changes will be lost.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleModalCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label="Continue editing"
                  >
                    No, Continue
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Confirm cancel"
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inline Animation Styles */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default FeedbackRequestForm;