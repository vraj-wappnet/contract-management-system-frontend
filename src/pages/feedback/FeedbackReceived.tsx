import React, { useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Avatar,
  Rate,
  Typography,
  Tooltip,
  Statistic,
  message,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

interface FeedbackItem {
  id: string;
  fromUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  requestId: string;
}

// Mock data for feedback
const mockFeedback: FeedbackItem[] = [
  {
    id: "1",
    fromUser: {
      id: "user1",
      firstName: "John",
      lastName: "Doe",
      email: "manager@example.com",
    },
    rating: 4.5,
    comment:
      "Great work on the project! Your attention to detail really made a difference.",
    status: "completed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    requestId: "req1",
  },
  {
    id: "2",
    fromUser: {
      id: "user2",
      firstName: "Jane",
      lastName: "Smith",
      email: "admin@example.com",
    },
    rating: 5,
    comment: "Excellent collaboration and communication throughout the sprint.",
    status: "completed",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    requestId: "req2",
  },
];

const FeedbackReceived: React.FC = () => {
  // Transform data to include a key for each row
  const tableData = useMemo(
    () =>
      mockFeedback.map((item) => ({
        key: item.id,
        ...item,
      })),
    []
  );

  // Calculate average rating for summary
  const averageRating = useMemo(() => {
    const total = tableData.reduce((sum, item) => sum + item.rating, 0);
    return tableData.length ? (total / tableData.length).toFixed(1) : 0;
  }, [tableData]);

  const columns = [
    {
      title: "From",
      dataIndex: "fromUser",
      key: "from",
      render: (_: unknown, record: FeedbackItem) => {
        const initials =
          `${record.fromUser.firstName[0]}${record.fromUser.lastName[0]}`.toUpperCase();
        const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b"];
        const colorIndex =
          (record.fromUser.firstName.length + record.fromUser.lastName.length) %
          colors.length;
        const bgColor = colors[colorIndex];

        return (
          <div className="flex items-center group">
            <div className="relative mr-3">
              <Avatar
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  record.fromUser.firstName + " " + record.fromUser.lastName
                )}&background=${bgColor.replace("#", "")}&color=fff&size=128`}
                className="transition-all duration-200 group-hover:shadow-lg group-hover:scale-105"
                size={48}
              >
                {initials}
              </Avatar>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {`${record.fromUser.firstName} ${record.fromUser.lastName}`}
              </span>
              <Tooltip title="Click to copy email">
                <a
                  href={`mailto:${record.fromUser.email}`}
                  className="text-sm text-gray-500 hover:text-blue-500 transition-colors flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(record.fromUser.email);
                    message.success("Email copied to clipboard!");
                  }}
                >
                  <CopyOutlined className="w-3 h-3 mr-1" />
                  {record.fromUser.email}
                </a>
              </Tooltip>
            </div>
          </div>
        );
      },
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 180,
      render: (rating: number) => (
        <div className="flex items-center">
          <Rate
            disabled
            allowHalf
            value={rating}
            className="text-sm text-yellow-400"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            {rating.toFixed(1)}/5
          </span>
        </div>
      ),
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (comment: string) => (
        <div className="whitespace-pre-line text-gray-600">{comment}</div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag
          color={
            status.toLowerCase() === "completed"
              ? "green"
              : status.toLowerCase() === "pending"
              ? "orange"
              : "blue"
          }
          className="capitalize w-full text-center py-1 rounded-full font-medium"
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      width: 140,
      render: (date: string) => (
        <div className="text-sm">
          <div className="font-medium text-gray-800">
            {dayjs(date).format("MMM D, YYYY")}
          </div>
          <div className="text-gray-500">{dayjs(date).format("h:mm A")}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6 animate-fade-in">
          <Title level={2} className="text-3xl font-bold text-gray-800">
            Feedback Received
          </Title>
          <Text type="secondary" className="text-gray-600">
            View all feedback you've received from your colleagues
          </Text>
        </div>

        <Card className="shadow-lg rounded-xl bg-white p-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Statistic
              title="Total Feedback"
              value={tableData.length}
              className="text-center"
            />
            <Statistic
              title="Average Rating"
              value={averageRating}
              suffix="/ 5"
              precision={1}
              className="text-center"
            />
            <Statistic
              title="Completed Feedback"
              value={
                tableData.filter(
                  (item) => item.status.toLowerCase() === "completed"
                ).length
              }
              className="text-center"
            />
          </div>
        </Card>

        <Card className="shadow-lg rounded-xl bg-white animate-fade-in">
          <Table
            columns={columns}
            dataSource={tableData}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              showTotal: (total) => `Total ${total} feedback items`,
              className: "pagination-custom",
            }}
            className="w-full rounded-lg overflow-hidden"
            scroll={{ x: "max-content" }}
            rowClassName="hover:bg-gray-50 transition-colors cursor-pointer"
            locale={{
              emptyText: (
                <div className="py-8 text-center">
                  <Text type="secondary" className="text-gray-500">
                    No feedback data available
                  </Text>
                </div>
              ),
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default FeedbackReceived;
