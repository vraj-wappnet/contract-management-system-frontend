import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Button,
  Spin,
  message,
  Avatar,
  Row,
  Col,
  Typography,
  Divider,
  Badge,
  Space,
} from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  CrownOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
import type { ColumnsType } from "antd/es/table";
import type { RootState } from "../../store/rootReducer";
import api from "../../services/api";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  roles: string[];
  department: string;
  phone?: string;
  status?: "active" | "on_leave" | "inactive";
  lastActive?: string;
  photoUrl?: string;
}

const DepartmentEmployeesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<User[]>([]);
  const [departmentName, setDepartmentName] = useState("");
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchDepartmentEmployees = async () => {
      try {
        setLoading(true);
        if (user?.department) {
          const response = await api.get(
            `/users/department/${user.department}`
          );
          setEmployees(response.data);
          setDepartmentName(user.department);
        }
      } catch (error) {
        console.error("Error fetching department employees:", error);
        message.error("Failed to load department employees");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentEmployees();
  }, [user?.department]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "#52c41a";
      case "on_leave":
        return "#faad14";
      case "inactive":
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "on_leave":
        return "On Leave";
      case "inactive":
        return "Inactive";
      default:
        return "Unknown";
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "Team Member",
      key: "name",
      render: (_, record) => (
        <Space>
          <Badge dot color={getStatusColor(record.status)} offset={[-5, 30]}>
            <Avatar
              size="large"
              src={record.photoUrl}
              icon={<UserOutlined />}
              style={{
                backgroundColor: record.roles.includes("manager")
                  ? "#fff7e6"
                  : "#e6f7ff",
                color: record.roles.includes("manager") ? "#faad14" : "#1890ff",
              }}
              className="shadow-sm"
            >
              {record.firstName?.[0]}
              {record.lastName?.[0]}
            </Avatar>
          </Badge>
          <div>
            <div className="flex items-center">
              <Text strong className="text-gray-800">
                {record.firstName} {record.lastName}
              </Text>
              {record.roles.includes("manager") && (
                <CrownOutlined className="ml-2 text-yellow-500" />
              )}
            </div>
            <Text type="secondary" className="text-xs">
              {record.position}
            </Text>
          </div>
        </Space>
      ),
      fixed: "left",
      width: 250,
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div>
          <div className="flex items-center">
            <MailOutlined className="text-gray-400 mr-2" />
            <a
              href={`mailto:${record.email}`}
              className="text-blue-600 hover:underline"
            >
              {record.email}
            </a>
          </div>
          {record.phone && (
            <div className="flex items-center mt-1">
              <PhoneOutlined className="text-gray-400 mr-2" />
              <Text type="secondary">{record.phone}</Text>
            </div>
          )}
        </div>
      ),
      responsive: ["md"],
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department) => (
        <div className="flex items-center">
          <ApartmentOutlined className="text-gray-400 mr-2" />
          <Text>{department}</Text>
        </div>
      ),
      responsive: ["lg"],
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag
          color={getStatusColor(record.status)}
          className="rounded-full px-3"
        >
          {getStatusText(record.status)}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<MailOutlined />}
            className="text-blue-500 hover:text-blue-700"
            href={`mailto:${record.email}`}
          />
          {record.phone && (
            <Button
              type="text"
              icon={<PhoneOutlined />}
              className="text-green-500 hover:text-green-700"
              href={`tel:${record.phone}`}
            />
          )}
        </Space>
      ),
      width: 120,
      fixed: "right",
    },
  ];

  // Separate managers from employees
  const managers = employees.filter((user) => user.roles.includes("manager"));
  const regularEmployees = employees.filter(
    (user) => !user.roles.includes("manager")
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Loading team members..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
          >
            Back to Dashboard
          </Button>

          <div className="flex items-start">
            <div className="bg-blue-100 p-3 rounded-xl mr-4">
              <TeamOutlined className="text-2xl text-blue-600" />
            </div>
            <div>
              <Title level={2} className="!mb-1 flex items-center">
                {departmentName} Team
                <Tag color="blue" className="ml-3">
                  {employees.length} members
                </Tag>
              </Title>
              <Text type="secondary">
                Manage and connect with your department colleagues
              </Text>
            </div>
          </div>
        </div>

        {/* Managers Section */}
        {managers.length > 0 && (
          <div className="mb-10">
            <Row gutter={[24, 24]}>
              {managers.map((manager) => (
                <Col xs={24} sm={12} lg={8} key={manager.id}>
                  <Card
                    hoverable
                    className="relative overflow-hidden transition-all duration-300 hover:shadow-lg h-full border-0"
                    bodyStyle={{ padding: 0 }}
                  >
                    {/* Status Indicator */}
                    <div
                      className="absolute top-4 right-4 z-10"
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: getStatusColor(manager.status),
                      }}
                    />

                    {/* Decorative Header */}
                    <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-500"></div>

                    {/* Card Content */}
                    <div className="p-6">
                      <div className="flex flex-col items-center text-center mb-4">
                        <div className="relative mb-4">
                          <Avatar
                            size={80}
                            src={manager.photoUrl}
                            icon={<UserOutlined />}
                            className="border-4 border-white shadow-md"
                            style={{
                              backgroundColor: "#fff7e6",
                              color: "#faad14",
                            }}
                          />
                          <div className="absolute -bottom-2 -right-2 bg-amber-500 rounded-full p-2 shadow-sm">
                            <CrownOutlined className="text-white text-sm" />
                          </div>
                        </div>

                        <Title level={4} className="!mb-1">
                          {manager.firstName} {manager.lastName}
                        </Title>

                        <Tag
                          color="gold"
                          className="border-0 font-medium px-3 py-1 rounded-full mb-2"
                          style={{
                            background: "rgba(251, 191, 36, 0.1)",
                            color: "#d97706",
                          }}
                        >
                          {manager.roles.includes("admin")
                            ? "ADMIN"
                            : "MANAGER"}
                        </Tag>

                        <Text strong className="text-gray-600 block">
                          {manager.position}
                        </Text>
                        <Text type="secondary" className="text-sm">
                          {manager.department} Department
                        </Text>
                      </div>

                      {/* Contact Info */}
                      <Divider className="!my-4" />

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <MailOutlined className="text-gray-400 mr-3" />
                          <a
                            href={`mailto:${manager.email}`}
                            className="text-blue-600 hover:underline truncate"
                          >
                            {manager.email}
                          </a>
                        </div>

                        {manager.phone && (
                          <div className="flex items-center">
                            <PhoneOutlined className="text-gray-400 mr-3" />
                            <a
                              href={`tel:${manager.phone}`}
                              className="text-gray-700 hover:text-blue-600"
                            >
                              {manager.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button
                          type="default"
                          icon={<MailOutlined />}
                          className="flex-1"
                          href={`mailto:${manager.email}`}
                        >
                          Email
                        </Button>
                        {manager.phone && (
                          <Button
                            type="primary"
                            icon={<PhoneOutlined />}
                            className="flex-1 bg-amber-500 border-amber-500 hover:bg-amber-600 hover:border-amber-600"
                            href={`tel:${manager.phone}`}
                          >
                            Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Team Members Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <TeamOutlined className="text-xl text-blue-600" />
              </div>
              <div>
                <Title level={3} className="!mb-1">
                  Team Members
                </Title>
                <Text type="secondary">
                  {regularEmployees.length} colleagues in your department
                </Text>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-sm" bodyStyle={{ padding: 0 }}>
            <Table
              columns={columns}
              dataSource={regularEmployees}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Showing ${total} team members`,
                responsive: true,
              }}
              loading={loading}
              scroll={{ x: true }}
              rowClassName={(record) =>
                record.status === "inactive" ? "opacity-70" : ""
              }
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DepartmentEmployeesPage;
