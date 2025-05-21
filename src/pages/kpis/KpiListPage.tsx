import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  fetchKpis,
  fetchCategories,
  deleteKpi,
} from "../../store/slices/kpiSlice";
import type { PaginationParams } from "../../types/kpi";
import { KpiStatus } from "../../types/kpi";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { TablePaginationConfig } from "antd";

const KpiListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { kpis, loading, pagination, filters, categories } = useAppSelector(
    (state) => state.kpis
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    console.log("KPI Data:", kpis);
    console.log("Categories:", categories);
    console.log("Loading:", loading);
    console.log("Pagination:", pagination);
    console.log("Filters:", filters);
  }, [kpis, categories, loading, pagination, filters]);

  const loadKpis = useCallback(async () => {
    try {
      console.log("Fetching KPIs with params:", {
        page: pagination.page,
        limit: pagination.limit,
        filters,
      });

      const resultAction = await dispatch(
        fetchKpis({
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
          },
          filters,
        })
      );

      if (fetchKpis.fulfilled.match(resultAction)) {
        console.log("Fetched KPIs:", resultAction.payload);
      } else if (fetchKpis.rejected.match(resultAction)) {
        console.error(
          "Failed to fetch KPIs:",
          resultAction.payload || resultAction.error
        );
      }
    } catch (error) {
      console.error("Error in loadKpis:", error);
    }
  }, [dispatch, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadKpis();
    dispatch(fetchCategories());
  }, [loadKpis, dispatch]);

  const handleTableChange = (tablePagination: TablePaginationConfig) => {
    console.log("Table changed:", { tablePagination });

    const paginationParams: PaginationParams = {
      page: tablePagination.current ?? 1,
      limit: tablePagination.pageSize ?? 10,
    };

    dispatch(
      fetchKpis({
        pagination: paginationParams,
        filters: { ...filters },
      })
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteKpi(id)).unwrap();
      setConfirmDeleteId(null);
      alert("KPI deleted successfully");
    } catch {
      alert("Failed to delete KPI");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-gray-50 z-10 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Key Performance Indicators
            </h2>
            <button
              onClick={() => navigate("/kpis/new")}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-transform transform hover:scale-105"
            >
              <PlusOutlined className="text-base" />
              Create KPI
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : !kpis || kpis.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No data
                    </td>
                  </tr>
                ) : (
                  kpis.map((kpi) => {
                    const current =
                      typeof kpi.currentValue === "number"
                        ? kpi.currentValue
                        : parseFloat(kpi.currentValue || "0");
                    const target =
                      typeof kpi.targetValue === "number"
                        ? kpi.targetValue
                        : parseFloat(kpi.targetValue || "0");
                    const percentage =
                      target > 0 ? Math.round((current / target) * 100) : 0;
                    const category = categories?.find(
                      (cat) => cat.id === kpi.categoryId
                    );

                    return (
                      <tr
                        key={kpi.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/kpis/${kpi.id}`)}
                            className="text-teal-600 hover:text-teal-800 font-medium"
                          >
                            {kpi.title}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              kpi.status === KpiStatus.ACTIVE
                                ? "bg-cyan-100 text-cyan-800"
                                : kpi.status === KpiStatus.COMPLETED
                                ? "bg-green-100 text-green-800"
                                : kpi.status === KpiStatus.CANCELLED
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {kpi.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-gray-700 font-medium">
                              {current.toLocaleString()} /{" "}
                              {target.toLocaleString()}
                              <span className="text-teal-600 ml-1">
                                ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-teal-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {dayjs(kpi.endDate).format("MMM D, YYYY")}
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {category?.name || "Uncategorized"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/kpis/edit/${kpi.id}`)}
                              className="text-teal-600 hover:text-teal-800"
                              aria-label={`Edit KPI ${kpi.title}`}
                            >
                              <EditOutlined className="text-base" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(kpi.id)}
                              className="text-red-500 hover:text-red-600"
                              aria-label={`Delete KPI ${kpi.title}`}
                            >
                              <DeleteOutlined className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div>
              <select
                value={pagination.limit}
                onChange={(e) =>
                  handleTableChange({
                    current: 1,
                    pageSize: parseInt(e.target.value),
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                onClick={() =>
                  handleTableChange({
                    current: pagination.page - 1,
                    pageSize: pagination.limit,
                  })
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of{" "}
                {Math.ceil(pagination.total / pagination.limit)} (
                {pagination.total} items)
              </span>
              <button
                onClick={() =>
                  handleTableChange({
                    current: pagination.page + 1,
                    pageSize: pagination.limit,
                  })
                }
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.limit)
                }
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Are you sure you want to delete this KPI?
              </h2>
              <p className="text-gray-600 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  No, Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiListPage;
