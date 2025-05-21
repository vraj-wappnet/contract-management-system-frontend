import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  createKpi,
  updateKpi,
  fetchKpiById,
  fetchCategories,
  createCategory,
} from "../../store/slices/kpiSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import { KpiType, KpiStatus } from "../../types/kpi";

const KpiFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const dispatch = useAppDispatch();

  const { loading, categories = [] } = useAppSelector((state) => state.kpis);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { users: usersResponse, loading: usersLoading } = useAppSelector(
    (state) => state.users
  );
  const users = usersResponse?.items || [];

  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [formValues, setFormValues] = useState({
    title: "",
    userId: "",
    type: KpiType.QUANTITATIVE,
    description: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    status: "draft",
    targetValue: 0,
    currentValue: 0,
    weight: 0,
    categoryId: "",
    metrics: [] as Array<{
      name: string;
      target: number;
      current: number;
      unit?: string;
    }>,
  });
  const [kpiType, setKpiType] = useState<KpiType>(KpiType.QUANTITATIVE);
  const isEditing = !!id;

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchUsers({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(fetchKpiById(id))
        .unwrap()
        .then((kpi) => {
          setFormValues({
            title: kpi.title || "",
            userId: kpi.userId || "",
            type: kpi.type,
            description: kpi.description || "",
            startDate: kpi.startDate ? new Date(kpi.startDate) : null,
            endDate: kpi.endDate ? new Date(kpi.endDate) : null,
            status: kpi.status || "draft",
            targetValue: kpi.targetValue ?? 0,
            currentValue: kpi.currentValue ?? 0,
            weight: kpi.weight ?? 0,
            categoryId: kpi.categoryId ?? "",
            metrics: (kpi.metrics || []).map((metric) => ({
              name: metric.name,
              target: metric.target,
              current: metric.current ?? 0,
              unit: metric.unit,
            })),
          });
          setKpiType(kpi.type);
        })
        .catch(() => {
          alert("Failed to load KPI");
          navigate("/kpis");
        });
    }
  }, [dispatch, id, navigate]);

  const handleAddCategory = async () => {
    try {
      if (!newCategoryName.trim()) {
        alert("Please enter a category name");
        return;
      }

      const resultAction = await dispatch(
        createCategory({
          name: newCategoryName.trim(),
          description: "",
        })
      );

      if (createCategory.fulfilled.match(resultAction)) {
        alert("Category added successfully");
        setNewCategoryName("");
        setIsAddingCategory(false);
        setFormValues({ ...formValues, categoryId: resultAction.payload.id });
      } else {
        const errorMessage = resultAction.payload || "Failed to add category";
        alert(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add category";
      alert(errorMessage);
    }
  };

  const isAdminOrManager =
    currentUser?.roles?.some((role: string | { name?: string }) => {
      const roleName =
        typeof role === "string" ? role : (role as { name?: string }).name;
      return roleName === "ADMIN" || roleName === "MANAGER";
    }) ?? false;

  const onFinish = async () => {
    try {
      const requiredFields = [
        "title",
        "userId",
        "type",
        "description",
        "startDate",
        "endDate",
        "status",
        "targetValue",
        "weight",
      ];
      const errors = requiredFields.filter((field) => !formValues[field]);
      if (errors.length > 0) {
        alert("Please fill in all required fields");
        return;
      }
      if (formValues.weight < 0 || formValues.weight > 5) {
        alert("Weight must be between 0 and 5");
        return;
      }

      const kpiData = {
        ...formValues,
        startDate: formValues.startDate
          ? dayjs(formValues.startDate).format("YYYY-MM-DD")
          : "",
        endDate: formValues.endDate
          ? dayjs(formValues.endDate).format("YYYY-MM-DD")
          : "",
        metrics: formValues.metrics.map((metric) => ({
          name: metric.name,
          target: metric.target,
          current: metric.current,
          unit: metric.unit,
        })),
        status: formValues.status as KpiStatus,
        userId: formValues.userId || (currentUser ? currentUser.id : ""),
      };

      if (id) {
        await dispatch(updateKpi({ id, data: kpiData })).unwrap();
        alert("KPI updated successfully");
      } else {
        await dispatch(createKpi(kpiData)).unwrap();
        alert("KPI created successfully");
      }

      navigate("/kpis");
    } catch (error) {
      alert(`Failed to ${id ? "update" : "create"} KPI`);
      console.error("Error saving KPI:", error);
    }
  };

  const onTypeChange = (type: KpiType) => {
    setKpiType(type);
    if (formValues.type !== type) {
      setFormValues({ ...formValues, type, metrics: [] });
    }
  };

  const handleMetricChange = (
    index: number,
    field: keyof (typeof formValues.metrics)[0],
    value: string | number
  ) => {
    const newMetrics = [...formValues.metrics];
    newMetrics[index] = {
      ...newMetrics[index],
      [field]:
        field === "target" || field === "current" ? Number(value) || 0 : value,
    };
    setFormValues({ ...formValues, metrics: newMetrics });
  };

  const addMetric = () => {
    setFormValues({
      ...formValues,
      metrics: [
        ...formValues.metrics,
        { name: "", target: 0, current: 0, unit: "" },
      ],
    });
  };

  const removeMetric = (index: number) => {
    setFormValues({
      ...formValues,
      metrics: formValues.metrics.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {id ? "Edit" : "Create New"} KPI
        </h1>
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formValues.title}
                  onChange={(e) =>
                    setFormValues({ ...formValues, title: e.target.value })
                  }
                  placeholder="Enter KPI title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To <span className="text-red-500">*</span>
                </label>
                <select
                  value={formValues.userId}
                  onChange={(e) =>
                    setFormValues({ ...formValues, userId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={usersLoading}
                >
                  <option value="" disabled>
                    Select an employee
                  </option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {`${user.firstName} ${user.lastName} (${
                        user.roles?.[0] || "No Role"
                      })`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formValues.type}
                  onChange={(e) => onTypeChange(e.target.value as KpiType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={KpiType.QUANTITATIVE}>Quantitative</option>
                  <option value={KpiType.QUALITATIVE}>Qualitative</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={formValues.categoryId}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        categoryId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2">
                    {isAddingCategory ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddCategory()
                          }
                        />
                        <button
                          onClick={() => setIsAddingCategory(false)}
                          className="px-3 py-2 text-gray-500 hover:text-gray-700 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsAddingCategory(true)}
                        className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700"
                      >
                        + Add new category
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formValues.description}
                onChange={(e) =>
                  setFormValues({ ...formValues, description: e.target.value })
                }
                placeholder="Enter KPI description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={
                    formValues.startDate
                      ? dayjs(formValues.startDate).format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      startDate: e.target.value
                        ? new Date(e.target.value)
                        : null,
                    })
                  }
                  min={dayjs().format("YYYY-MM-DD")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={
                    formValues.endDate
                      ? dayjs(formValues.endDate).format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      endDate: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                  min={
                    formValues.startDate
                      ? dayjs(formValues.startDate).format("YYYY-MM-DD")
                      : dayjs().format("YYYY-MM-DD")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formValues.status}
                  onChange={(e) =>
                    setFormValues({ ...formValues, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {["draft", "active", "completed", "cancelled"].map(
                    (status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() +
                          status.slice(1).toLowerCase()}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formValues.targetValue}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      targetValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  min={0}
                  step={0.01}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formValues.currentValue}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        currentValue: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    step={0.01}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (0-5) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formValues.weight}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      weight: parseInt(e.target.value) || 0,
                    })
                  }
                  min={0}
                  max={5}
                  step={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {kpiType === KpiType.QUANTITATIVE && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Metrics
                </h2>
                {formValues.metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 mb-4 flex-wrap"
                  >
                    <input
                      type="text"
                      value={metric.name}
                      onChange={(e) =>
                        handleMetricChange(index, "name", e.target.value)
                      }
                      placeholder="Metric name"
                      className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={metric.target}
                      onChange={(e) =>
                        handleMetricChange(index, "target", e.target.value)
                      }
                      placeholder="Target"
                      min={0}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={metric.current}
                      onChange={(e) =>
                        handleMetricChange(index, "current", e.target.value)
                      }
                      placeholder="Current"
                      min={0}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={metric.unit}
                      onChange={(e) =>
                        handleMetricChange(index, "unit", e.target.value)
                      }
                      placeholder="Unit (optional)"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeMetric(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addMetric}
                  className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  + Add Metric
                </button>
              </div>
            )}
            {isAdminOrManager && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <select
                  value={formValues.userId}
                  onChange={(e) =>
                    setFormValues({ ...formValues, userId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {`${user.firstName} ${user.lastName}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-4 mt-6">
              <button
                onClick={onFinish}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Loading..." : isEditing ? "Update" : "Create"} KPI
              </button>
              <button
                onClick={() => navigate("/kpis")}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiFormPage;
