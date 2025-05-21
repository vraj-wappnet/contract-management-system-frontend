import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Badge,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { getFeedbackCycles } from "../../api/feedbackApi";
import type { FeedbackCycle } from "../../types/feedback.types";
import { CycleStatus, CycleType } from "../../types/feedback.types";
import dayjs from "dayjs";
import type { Breakpoint } from 'antd';

const FeedbackCycles: React.FC = () => {
  const navigate = useNavigate();

  const [cycles, setCycles] = useState<FeedbackCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchCycles = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      const data = await getFeedbackCycles(params);
      setCycles(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch feedback cycles:", error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

 

  const getTypeLabel = (type: CycleType) => {
    switch (type) {
      case CycleType.QUARTERLY:
        return "Quarterly";
      case CycleType.ANNUAL:
        return "Annual";
      case CycleType.MONTHLY:
        return "Monthly";
      case CycleType.THREE_SIXTY:
        return "360°";
      case CycleType.CUSTOM:
        return "Custom";
      default:
        return type;
    }
  };

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (_: unknown, record: FeedbackCycle) => (
      <div>
        <div className="font-medium text-gray-900 text-xs sm:text-sm">{record.name}</div>
        {record.description && (
          <div className="text-gray-500 text-xs">{record.description}</div>
        )}
      </div>
    ),
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    responsive: ['sm'] as Breakpoint[], // Fixed type
    render: (type: CycleType) => (
      <Tag color="blue" className="capitalize text-xs sm:text-sm">
        {getTypeLabel(type)}
      </Tag>
    ),
  },
  {
    title: "Period",
    key: "period",
    responsive: ['sm'] as Breakpoint[], // Fixed type
    render: (_: unknown, record: FeedbackCycle) => (
      <div className="whitespace-nowrap text-xs sm:text-sm">
        {dayjs(record.startDate).format("MMM D, YYYY")} -{" "}
        {dayjs(record.endDate).format("MMM D, YYYY")}
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: CycleStatus) => {
      const statusConfig = {
        [CycleStatus.ACTIVE]: { color: "success", text: "Active" },
        [CycleStatus.COMPLETED]: { color: "processing", text: "Completed" },
        [CycleStatus.CANCELLED]: { color: "error", text: "Cancelled" },
        [CycleStatus.PLANNED]: { color: "default", text: "Planned" },
      }[status] || { color: "default", text: status };

      return (
        <Badge
          status={
            statusConfig.color as
              | "success"
              | "processing"
              | "error"
              | "default"
              | "warning"
          }
          text={statusConfig.text}
          className="text-xs sm:text-sm"
        />
      );
    },
  },
  {
    title: "Actions",
    key: "actions",
    width: 80,
    render: (_: unknown, record: FeedbackCycle) => (
      <Space size="middle">
        <Tooltip title="View">
          <Button
            type="text"
            icon={<EyeOutlined className="text-base" />}
            onClick={() => navigate(`/feedback/cycles/${record.id}`)}
            className="p-2"
            aria-label="View feedback cycle details"
          />
        </Tooltip>
      </Space>
    ),
  },
];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Feedback Cycles
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/feedback/cycles/new")}
          className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 rounded-lg"
        >
          Create New Cycle
        </Button>
      </div>

      <div className="mt-6">
        <Card>
          <Table
            columns={columns}
            dataSource={cycles}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page + 1,
              pageSize: rowsPerPage,
              total,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "25"],
              onChange: (page, pageSize) => {
                setPage(page - 1);
                setRowsPerPage(pageSize);
              },
            }}
            locale={{
              emptyText: "No feedback cycles found",
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default FeedbackCycles;