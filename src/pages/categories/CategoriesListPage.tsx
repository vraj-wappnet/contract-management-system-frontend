import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchCategories, deleteCategory } from "../../store/slices/kpiSlice";
import { Table, Button, Space, Card, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const CategoriesListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.kpis);
  const isAdmin = true; // Always enable delete functionality
  const [searchText] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleDelete = async (categoryId: string) => {
    try {
      await dispatch(deleteCategory(categoryId)).unwrap();
      message.success("Category deleted successfully", 3);
      dispatch(fetchCategories());
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("Failed to delete category", 3);
    }
  };

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (
        text: string,
        record: { id: string; name: string; description?: string }
      ) => (
        <Link
          to={`/categories/${record.id}`}
          className="text-teal-600 hover:text-teal-800 font-semibold transition-colors"
          aria-label={`View category ${text}`}
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <span className="text-gray-700 font-medium">{text || "-"}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (
        _: unknown,
        record: { id: string; name: string; description?: string }
      ) => (
        <Space size="small">
          <Link to={`/categories/edit/${record.id}`}>
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-teal-600 hover:text-teal-800 transition-colors border-none shadow-none"
              title="Edit category"
              aria-label={`Edit category ${record.name}`}
            />
          </Link>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
            overlayClassName="rounded-lg"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-500 hover:text-red-600 transition-colors border-none shadow-none"
              title="Delete category"
              disabled={false}
              aria-label={`Delete category ${record.name}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-gray-100 z-10 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Categories
            </h2>
            {isAdmin && (
              <div className="flex items-center gap-3">
                <Link to="/categories/new">
                  <Button
                    className="bg-teal-600 text-white hover:bg-teal-700 border-none rounded-lg shadow-md transition-all transform hover:scale-105 h-10 px-4"
                    icon={<PlusOutlined />}
                    aria-label="Add new category"
                  >
                    Add Category
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Search and Table Card */}
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-6">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={filteredCategories || []}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} categories`,
                className: "mt-4",
              }}
              className="custom-table"
              rowClassName="hover:bg-gray-50 transition-colors duration-200"
              scroll={{ x: "max-content" }}
              locale={{
                emptyText: loading ? "Loading..." : "No categories found",
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CategoriesListPage;
