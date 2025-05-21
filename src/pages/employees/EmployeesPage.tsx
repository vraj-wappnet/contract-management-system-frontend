import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store/store";
import {
  fetchUsers,
  selectUsers,
  selectUsersLoading,
  selectTotalUsers,
} from "../../store/slices/userSlice";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Table,
  Space,
  Tag,
  Avatar,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Divider,
  Tooltip,
  Badge,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { Title, Text } = Typography;
const { Option } = Select;

interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  role?: string;
  position: string;
  department: string;
  managerId: string | null;
  manager?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  password?: string;
  status?: "active" | "inactive";
}

type User = ApiUser;

const EmployeesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const total = useSelector(selectTotalUsers);

  const [pagination, setPagination] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 10,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchEmployees = useCallback(
    (page: number, pageSize: number) => {
      dispatch(fetchUsers({ page, limit: pageSize }));
    },
    [dispatch]
  );

  useEffect(() => {
    fetchEmployees(1, 10);
  }, [fetchEmployees]);

  const handleTableChange = (tablePagination: {
    current?: number;
    pageSize?: number;
  }) => {
    const currentPage = tablePagination?.current || 1;
    const pageSize = tablePagination?.pageSize || 10;

    setPagination({
      current: currentPage,
      pageSize: pageSize,
    });

    fetchEmployees(currentPage, pageSize);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      position: user.position,
      department: user.department,
      role: user.role || user.roles?.[0] || "employee",
      status: user.status || "active",
    });
    setEditModalVisible(true);
  };

  interface UpdateUserFormValues {
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: string;
    role: string;
    status: "active" | "inactive";
  }

  const handleUpdate = async (values: UpdateUserFormValues) => {
    if (!selectedUser) return;
    try {
      setUpdateLoading(true);
      const updatedUser = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        position: values.position,
        department: values.department,
        roles: [values.role],
        status: values.status,
      };
      await api.patch(`/users/${selectedUser.id}`, updatedUser);
      message.success("Employee updated successfully", 3);
      setEditModalVisible(false);
      fetchEmployees(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("Failed to update employee", 3);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      message.success("Employee deleted successfully", 3);
      fetchEmployees(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error("Failed to delete employee", 3);
    }
  };

  const columns = [
    {
      title: "Employee",
      key: "name",
      fixed: "left" as const,
      width: 250,
      render: (_: unknown, record: User) => {
        const displayName = `${record.firstName || ""} ${
          record.lastName || ""
        }`.trim();
        return (
          <Link to={`/employees/${record.id}`}>
            <Space>
              <Badge
                dot
                color={record.status === "active" ? "#52c41a" : "#f5222d"}
                offset={[-5, 30]}
              >
                <Avatar
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor:
                      record.status === "active" ? "#2563eb" : "#d9d9d9",
                    color: record.status === "active" ? "#fff" : "#595959",
                  }}
                  className="flex-shrink-0"
                >
                  {record.firstName?.[0]?.toUpperCase()}
                  {record.lastName?.[0]?.toUpperCase()}
                </Avatar>
              </Badge>
              <div className="flex flex-col">
                <span className="text-gray-900 font-medium">
                  {displayName || record.email}
                </span>
                <Text type="secondary" className="text-xs">
                  {record.email}
                </Text>
              </div>
            </Space>
          </Link>
        );
      },
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      render: (position: string) =>
        position || <Text type="secondary">N/A</Text>,
      responsive: ["md"] as "md"[],
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department: string) =>
        department || <Text type="secondary">N/A</Text>,
      responsive: ["md"] as "md"[],
    },
    {
      title: "Role",
      key: "role",
      width: 120,
      render: (_: unknown, record: User) => {
        const role = (
          record.role ||
          record.roles?.[0] ||
          "employee"
        ).toLowerCase();
        const roleColors: Record<string, string> = {
          admin: "volcano",
          manager: "geekblue",
          employee: "green",
        };
        return (
          <Tag
            color={roleColors[role] || "default"}
            className="font-medium capitalize"
            style={{ borderRadius: "12px" }}
          >
            {role}
          </Tag>
        );
      },
    },
    {
      title: "Manager",
      key: "manager",
      render: (_: unknown, record: User) => (
        <Text>{record.manager?.name || <Text type="secondary">N/A</Text>}</Text>
      ),
      responsive: ["lg"] as "lg"[],
    },
    {
      title: "Joined",
      key: "createdAt",
      render: (_: unknown, record: User) => (
        <Text type="secondary">
          {new Date(record.createdAt).toLocaleDateString()}
        </Text>
      ),
      responsive: ["xl"] as "xl"[],
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 120,
      render: (_: unknown, record: User) => {
        return (
          <Space size="small">
            <Tooltip title="Edit employee">
              <Button
                type="text"
                icon={<EditOutlined />}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <Popconfirm
              title="Delete this employee?"
              description="Are you sure you want to delete this employee?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              overlayClassName="rounded-lg"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete employee">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  className="hover:text-red-800 transition-colors"
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const tableData: User[] = users || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Card
          className="bg-white border-0 rounded-xl shadow-sm"
          bodyStyle={{ padding: 0 }}
        >
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <Title
                  level={2}
                  className="!mb-1 !text-2xl sm:!text-3xl flex items-center"
                >
                  <TeamOutlined className="mr-3 text-blue-600" />
                  Employee Management
                </Title>
                <Text type="secondary">
                  Manage your organization's employees and their roles
                </Text>
              </div>
              <Space>
                <Link to="/employees/add">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="flex items-center"
                    size="middle"
                  >
                    Add Employee
                  </Button>
                </Link>
              </Space>
            </div>
            <Divider className="!mt-2 !mb-4" />
          </div>

          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <Table
              columns={columns}
              dataSource={tableData}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: total || 0,
                showSizeChanger: true,
                showTotal: (total, range) => (
                  <Text>
                    Showing{" "}
                    <Text strong>
                      {range[0]}-{range[1]}
                    </Text>{" "}
                    of <Text strong>{total}</Text> employees
                  </Text>
                ),
                responsive: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                size: "default",
              }}
              loading={loading}
              onChange={handleTableChange}
              scroll={{ x: "max-content" }}
              className="custom-table"
              rowClassName="hover:bg-gray-50 transition-colors duration-200"
            />
          </div>
        </Card>
      </div>

      <Modal
        title={<span className="text-xl font-semibold">Edit Employee</span>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        className="rounded-lg"
        width={700}
        centered
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          className="mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                className="rounded-lg h-11"
              />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                className="rounded-lg h-11"
              />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
              className="md:col-span-2"
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                className="rounded-lg h-11"
              />
            </Form.Item>
            <Form.Item
              name="position"
              label="Position"
              rules={[{ required: true, message: "Please enter position" }]}
            >
              <Input className="rounded-lg h-11" />
            </Form.Item>
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: "Please enter department" }]}
            >
              <Input className="rounded-lg h-11" />
            </Form.Item>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Select
                className="rounded-lg h-11"
                dropdownClassName="rounded-lg shadow-md"
              >
                <Option value="employee">Employee</Option>
                <Option value="manager">Manager</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select
                className="rounded-lg h-11"
                dropdownClassName="rounded-lg shadow-md"
              >
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </div>
          <Divider className="!my-6" />
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setEditModalVisible(false)}
              className="rounded-lg h-10 px-6"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateLoading}
              className="rounded-lg h-10 px-6"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
