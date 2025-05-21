import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Table, Space, message, Popconfirm, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Department } from "../../services/departmentService";
import api from "../../services/api";
import { useAuth } from "../../hooks";

const DepartmentList = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ADMIN");

  // Debugging to verify admin status
  useEffect(() => {
    console.log("User:", user);
    console.log("Is Admin:", isAdmin);
  }, [user, isAdmin]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/departments", {
        params: { include: "manager" },
      });
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      message.error("Failed to load departments", 3);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/departments/${id}`);
      message.success("Department deleted successfully", 3);
      fetchDepartments();
    } catch (error) {
      console.error("Error deleting department:", error);
      message.error("Failed to delete department", 3);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Department) => (
        <Link
          to={`/departments/${record.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
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
        <span className="text-gray-700">{text || "-"}</span>
      ),
      responsive: ["md"],
    },
    {
      title: "Manager",
      key: "manager",
      render: (_: any, record: Department) =>
        record.manager ? (
          <span className="text-gray-700 font-medium">{`${record.manager.firstName} ${record.manager.lastName}`}</span>
        ) : (
          <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-sm">
            No Manager
          </span>
        ),
      responsive: ["lg"],
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: Department) => (
        <Space size="small">
          <Link to={`/departments/${record.id}/edit`}>
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-blue-600 hover:text-blue-800 transition-colors border-none shadow-none"
              title="Edit department"
            />
          </Link>

          <Popconfirm
            title="Are you sure you want to delete this department?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            overlayClassName="rounded-lg"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:text-red-800 transition-colors border-none shadow-none"
              title="Delete department"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            Departments
          </h2>
          {isAdmin && (
            <Link to="/departments/new">
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none rounded-lg shadow-md transition-all transform hover:scale-105 px-4 py-2 h-10 text-base font-semibold text-white"
                icon={<PlusOutlined />}
              >
                Add Department
              </Button>
            </Link>
          )}
        </div>

        <Card className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn p-4 sm:p-6">
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={departments}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} departments`,
                className: "mt-4",
              }}
              className="custom-table"
              rowClassName="hover:bg-gray-50 transition-colors duration-200"
              scroll={{ x: "max-content" }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DepartmentList;
