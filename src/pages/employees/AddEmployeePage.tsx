import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { createUser } from "../../store/slices/userSlice";
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Typography,
  Divider,
  Space,
  Alert,
} from "antd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  IdcardOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { Title, Text } = Typography;
const { Option } = Select;

interface Department {
  id: string;
  name: string;
}

const AddEmployeePage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        const response = await api.get("/departments");
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
        const errorMessage =
          "Failed to load departments. Please try again later.";
        setDepartmentsError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setDepartmentsLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  interface EmployeeFormValues {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    position: string;
    department?: string;
  }

  const onFinish = async (values: EmployeeFormValues) => {
    try {
      setLoading(true);

      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        roles: [values.role],
        position: values.position,
        ...(values.role !== "manager" &&
          values.department && { department: values.department }),
      };

      await dispatch(createUser(userData)).unwrap();

      toast.success("Employee added successfully!");
      navigate("/employees");
    } catch (error: unknown) {
      interface ApiError {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      }
      let errorMessage = "Failed to add employee";
      if (typeof error === "object" && error !== null) {
        const apiError = error as ApiError;
        if (
          apiError.response &&
          typeof apiError.response.data?.message === "string"
        ) {
          errorMessage = apiError.response.data.message;
        } else if (typeof apiError.message === "string") {
          errorMessage = apiError.message;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <Card
          className="bg-white border-0 rounded-xl shadow-sm"
          bodyStyle={{ padding: 0 }}
        >
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div>
                <Title level={2} className="!mb-1 !text-2xl sm:!text-3xl">
                  Add New Employee
                </Title>
                <Text type="secondary">
                  Fill in the details below to onboard a new team member
                </Text>
              </div>
            </div>

            <Divider className="!mt-2 !mb-6" />

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="max-w-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[
                    { required: true, message: "Please enter first name" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="John"
                    className="rounded-lg h-11"
                  />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[
                    { required: true, message: "Please enter last name" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Doe"
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
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="john.doe@example.com"
                    type="email"
                    className="rounded-lg h-11"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: "Please enter password" },
                    {
                      min: 8,
                      message: "Password must be at least 8 characters",
                    },
                  ]}
                  extra={
                    <Text type="secondary" className="text-xs">
                      Minimum 8 characters
                    </Text>
                  }
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="••••••••"
                    className="rounded-lg h-11"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please confirm password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Passwords do not match")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="••••••••"
                    className="rounded-lg h-11"
                  />
                </Form.Item>

                <Form.Item
                  name="role"
                  label="Role"
                  rules={[{ required: true, message: "Please select a role" }]}
                >
                  <Select
                    placeholder="Select role"
                    className="rounded-lg h-11"
                    dropdownClassName="rounded-lg shadow-md"
                    onChange={(value) => {
                      setSelectedRole(value);
                      if (value === "manager") {
                        form.setFieldsValue({ department: undefined });
                      }
                    }}
                  >
                    <Option value="employee">
                      <Space>
                        <UserOutlined />
                        Employee
                      </Space>
                    </Option>
                    <Option value="manager">
                      <Space>
                        <IdcardOutlined />
                        Manager
                      </Space>
                    </Option>
                    <Option value="admin">
                      <Space>
                        <UserOutlined />
                        Admin
                      </Space>
                    </Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="position"
                  label="Position"
                  rules={[{ required: true, message: "Please enter position" }]}
                >
                  <Input
                    prefix={<IdcardOutlined className="text-gray-400" />}
                    placeholder="e.g., Software Engineer"
                    className="rounded-lg h-11"
                  />
                </Form.Item>

                <Form.Item
                  name="department"
                  label={
                    <span>
                      Department
                      {selectedRole === "manager" && (
                        <Text type="secondary" className="ml-1 text-xs">
                          (Optional)
                        </Text>
                      )}
                    </span>
                  }
                  rules={[
                    {
                      required: selectedRole !== "manager",
                      message: "Please select a department",
                    },
                  ]}
                  className="md:col-span-2"
                  extra={
                    selectedRole === "manager" && (
                      <Text type="secondary" className="text-xs">
                        Managers can oversee multiple departments
                      </Text>
                    )
                  }
                >
                  <Select
                    placeholder={
                      selectedRole === "manager"
                        ? "Optional for managers"
                        : "Select department"
                    }
                    loading={departmentsLoading}
                    disabled={
                      departmentsLoading ||
                      !!departmentsError ||
                      selectedRole === "manager"
                    }
                    className="rounded-lg h-11"
                    dropdownClassName="rounded-lg shadow-md"
                    suffixIcon={<ApartmentOutlined className="text-gray-400" />}
                  >
                    {departments.map((dept) => (
                      <Option key={dept.id} value={dept.name}>
                        {dept.name}
                      </Option>
                    ))}
                  </Select>
                  {departmentsError && (
                    <Alert
                      message={departmentsError}
                      type="error"
                      showIcon
                      className="mt-2"
                    />
                  )}
                </Form.Item>
              </div>

              <Divider className="!my-8" />

              <div className="flex justify-end gap-4">
                <Button
                  onClick={() => navigate("/employees")}
                  className="rounded-lg h-11 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="rounded-lg h-11 px-6"
                  icon={<UserOutlined />}
                >
                  Add Employee
                </Button>
              </div>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AddEmployeePage;
