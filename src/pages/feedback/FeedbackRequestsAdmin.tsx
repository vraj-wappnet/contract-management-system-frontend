import { useState, useEffect, useCallback } from "react";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { CheckCircleOutlined, EyeOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { showSuccessToast, showErrorToast } from "../../components/common/Toast";
import type { FeedbackRequest, RequestStatus } from "../../types/feedback.types";
import { getFeedbackRequests } from "../../api/feedbackApi";

const FeedbackRequestsAdmin: FC = () => {
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText,] = useState("");
  const [statusFilter] = useState<RequestStatus | undefined>(undefined);
  const [tableData, setTableData] = useState<FeedbackRequest[]>([]);
  const [isDeclineModalVisible, setIsDeclineModalVisible] = useState(false);
  const [declineRequestId, setDeclineRequestId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchRequests = useCallback(
    async (page = 1, pageSize = 10) => {
      try {
        setLoading(true);
        const response = await getFeedbackRequests({
          page,
          limit: pageSize,
          status: statusFilter,
        });

        let filteredData = response.items || [];
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          filteredData = filteredData.filter((request: FeedbackRequest) =>
            (request.message || "").toLowerCase().includes(searchLower)
          );
        }

        setTableData(filteredData);
        setPagination((prev) => ({
          ...prev,
          total: response.total,
          current: page,
          pageSize: pageSize,
        }));
      } catch (error) {
        console.error("Error fetching feedback requests:", error);
        showErrorToast("Failed to fetch feedback requests. Please try again.");
        setTableData([]);
      } finally {
        setLoading(false);
      }
    },
    [searchText, statusFilter]
  );

  useEffect(() => {
    fetchRequests(1, 10);
  }, [fetchRequests]);

  const handleApproveRequest = async (requestId: string) => {
    try {
      setLoading(true);
      console.log("Approving request with ID:", requestId);

      const request = await api.get(`/feedback/requests/${requestId}`);
      const recipientId = request.data.recipientId;

      const response = await api.patch(`/feedback/requests/${requestId}`, {
        status: "completed",
        recipientId: recipientId,
      });

      console.log("Approve API response:", response.data);
      showSuccessToast("Feedback request approved successfully");
      await fetchRequests(pagination.current, pagination.pageSize);
      console.log("Requests refreshed after approval");
    } catch (error: unknown) {
      console.error("Error approving feedback request:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object"
      ) {
        const errResponse = (
          error as {
            response?: { data?: { message?: string }; status?: number };
          }
        ).response;
        console.error("Error response data:", errResponse?.data);
        console.error("Error response status:", errResponse?.status);
        showErrorToast(
          errResponse?.data?.message || "Failed to approve feedback request"
        );
      } else {
        showErrorToast("Failed to approve feedback request");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      setLoading(true);
      console.log("Declining request with ID:", requestId);

      const request = await api.get(`/feedback/requests/${requestId}`);
      const recipientId = request.data.recipientId;

      const response = await api.patch(`/feedback/requests/${requestId}`, {
        status: "declined",
        recipientId: recipientId,
      });

      console.log("Decline API response:", response.data);
      showSuccessToast("Feedback request declined successfully");
      await fetchRequests(pagination.current, pagination.pageSize);
    } catch (error: unknown) {
      console.error("Error declining feedback request:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object"
      ) {
        const errResponse = (
          error as {
            response?: { data?: { message?: string }; status?: number };
          }
        ).response;
        console.error("Error response data:", errResponse?.data);
        console.error("Error response status:", errResponse?.status);
        showErrorToast(
          errResponse?.data?.message || "Failed to decline feedback request"
        );
      } else {
        showErrorToast("Failed to decline feedback request");
      }
    } finally {
      setLoading(false);
      setIsDeclineModalVisible(false);
      setDeclineRequestId(null);
    }
  };

  const showDeclineModal = (requestId: string) => {
    setDeclineRequestId(requestId);
    setIsDeclineModalVisible(true);
  };

  const handleTableChange = (pagination: {
    current?: number;
    pageSize?: number;
    total?: number;
  }) => {
    const newPagination = {
      ...pagination,
      current: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
      total: pagination.total || 0,
    };

    setPagination((prev) => ({
      ...prev,
      ...newPagination,
    }));

    fetchRequests(newPagination.current, newPagination.pageSize);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feedback Requests Admin</h1>
          <p className="mt-2 text-lg text-gray-600">Manage and review feedback requests from your team.</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : tableData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No feedback requests found
                    </td>
                  </tr>
                ) : (
                  tableData.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                          {request.type.toLowerCase().replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            request.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : request.status === "declined"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(request.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {request.status === "pending" && (
                            <>
                              <button
                                title="Approve this feedback request"
                                onClick={() => handleApproveRequest(request.id)}
                                disabled={loading}
                                className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                              >
                                <CheckCircleOutlined className="w-5 h-5" />
                              </button>
                              <button
                                title="Decline this feedback request"
                                onClick={() => showDeclineModal(request.id)}
                                disabled={loading}
                                className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <CloseCircleOutlined className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            title="View request details"
                            onClick={() => navigate(`/feedback/requests/${request.id}`)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <EyeOutlined className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div>
              <select
                value={pagination.pageSize}
                onChange={(e) => handleTableChange({ ...pagination, pageSize: parseInt(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => handleTableChange({ ...pagination, current: pagination.current - 1 })}
                disabled={pagination.current === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)} ({pagination.total} items)
              </span>
              <button
                onClick={() => handleTableChange({ ...pagination, current: pagination.current + 1 })}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {isDeclineModalVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
            <div className="bg-white rounded-lg p-6 max-w-md w-full transform transition-transform duration-300 scale-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Decline Feedback Request
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to decline this feedback request? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsDeclineModalVisible(false);
                    setDeclineRequestId(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  No, Cancel
                </button>
                <button
                  onClick={() => declineRequestId && handleDeclineRequest(declineRequestId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackRequestsAdmin;