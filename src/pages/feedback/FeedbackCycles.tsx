import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Badge,
  Dropdown,
  Menu,
  message,
  Modal,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { getFeedbackCycles } from "../../api/feedbackApi";
import type { FeedbackCycle } from "../../types/feedback.types";
import { CycleStatus, CycleType } from "../../types/feedback.types";

import dayjs from "dayjs";

const FeedbackCycles: React.FC = () => {
  // User authentication can be added back when needed
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

  const handleStatusChange = async (
    _cycleId: string,
    newStatus: CycleStatus
  ) => {
    try {
      // Show confirmation modal for status changes
      if (newStatus === CycleStatus.CANCELLED) {
        Modal.confirm({
          title: "Cancel Feedback Cycle",
          content:
            "Are you sure you want to cancel this feedback cycle? This action cannot be undone.",
          okText: "Yes, cancel it",
          okType: "danger",
          cancelText: "No, keep it",
          onOk: async () => {
            // Call API to update status
            // await updateCycleStatus(cycleId, newStatus);
            message.success("Feedback cycle cancelled successfully");
            fetchCycles();
          },
        });
      } else if (newStatus === CycleStatus.ACTIVE) {
        Modal.confirm({
          title: "Start Feedback Cycle",
          content: "Are you sure you want to start this feedback cycle?",
          okText: "Yes, start it",
          okType: "primary",
          cancelText: "No, keep as planned",
          onOk: async () => {
            // Call API to update status
            // await updateCycleStatus(cycleId, newStatus);
            message.success("Feedback cycle started successfully");
            fetchCycles();
          },
        });
      } else if (newStatus === CycleStatus.COMPLETED) {
        Modal.confirm({
          title: "Complete Feedback Cycle",
          content:
            "Are you sure you want to mark this feedback cycle as completed?",
          okText: "Yes, complete it",
          okType: "primary",
          cancelText: "No, keep it active",
          onOk: async () => {
            // Call API to update status
            // await updateCycleStatus(cycleId, newStatus);
            message.success("Feedback cycle marked as completed");
            fetchCycles();
          },
        });
      }
    } catch (error) {
      message.error("Failed to update feedback cycle status");
      console.error("Error updating feedback cycle status:", error);
    }
  };

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
          <div className="font-medium text-gray-900">{record.name}</div>
          {record.description && (
            <div className="text-gray-500 text-sm">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: CycleType) => (
        <Tag color="blue" className="capitalize">
          {getTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: "Period",
      key: "period",
      render: (_: unknown, record: FeedbackCycle) => (
        <div className="whitespace-nowrap">
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
          />
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: unknown, record: FeedbackCycle) => {
        const menu = (
          <Menu>
            <Menu.Item
              key="view"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/feedback/cycles/${record.id}`)}
            >
              View Details
            </Menu.Item>
            <Menu.Item
              key="edit"
              icon={<EditOutlined />}
              onClick={() => navigate(`/feedback/cycles/${record.id}/edit`)}
            >
              Edit
            </Menu.Item>

            {record.status === CycleStatus.PLANNED && (
              <Menu.Item
                key="start"
                icon={<PlayCircleOutlined />}
                onClick={() =>
                  handleStatusChange(record.id, CycleStatus.ACTIVE)
                }
              >
                Start Cycle
              </Menu.Item>
            )}

            {record.status === CycleStatus.ACTIVE && (
              <Menu.Item
                key="complete"
                icon={<CheckCircleOutlined />}
                onClick={() =>
                  handleStatusChange(record.id, CycleStatus.COMPLETED)
                }
              >
                Mark as Completed
              </Menu.Item>
            )}

            {[CycleStatus.PLANNED, CycleStatus.ACTIVE].includes(
              record.status as CycleStatus
            ) && (
              <Menu.Item
                key="cancel"
                icon={<StopOutlined />}
                danger
                onClick={() =>
                  handleStatusChange(record.id, CycleStatus.CANCELLED)
                }
              >
                Cancel Cycle
              </Menu.Item>
            )}
          </Menu>
        );

        return (
          <Space size="middle">
            <Tooltip title="View">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/feedback/cycles/${record.id}`)}
              />
            </Tooltip>
            <Dropdown overlay={menu} trigger={["click"]}>
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
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
