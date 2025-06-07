import React, { useState, useEffect } from "react";
import {
  List,
  Badge,
  Modal,
  Typography,
  Space,
  Tag,
  Avatar,
  message,
  Button,
  Divider,
  Empty,
  Tooltip,
  Card,
} from "antd";
import {
  BellOutlined,
  NotificationOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import notificationService from "services/notificationService";
import PropTypes from "prop-types";
import user_notificationService from "services/user_notificationService";

// Material Dashboard 2 React colors
const colors = {
  primary: {
    main: "#1A73E8",
    focus: "#1662C4",
    light: "#E3F2FD",
  },
  secondary: {
    main: "#7B809A",
    focus: "#8F93A9",
    light: "#F8F9FA",
  },
  info: {
    main: "#17C1E8",
    focus: "#3ACAEB",
    light: "#ABE9F7",
  },
  success: {
    main: "#82D616",
    focus: "#95DC39",
    light: "#D1F7C4",
  },
  warning: {
    main: "#FFA726",
    focus: "#FFB74D",
    light: "#FFF3C4",
  },
  error: {
    main: "#EA0606",
    focus: "#F56565",
    light: "#FED7D7",
  },
  gradients: {
    primary: "linear-gradient(310deg, #7928CA 0%, #FF0080 100%)",
    secondary: "linear-gradient(310deg, #627594 0%, #A8B8D8 100%)",
    info: "linear-gradient(310deg, #2152FF 0%, #21D4FD 100%)",
    success: "linear-gradient(310deg, #17AD37 0%, #98EC2D 100%)",
    warning: "linear-gradient(310deg, #F53939 0%, #FBCF33 100%)",
    error: "linear-gradient(310deg, #EA0606 0%, #FF667C 100%)",
    dark: "linear-gradient(310deg, #141727 0%, #3A416F 100%)",
    light: "linear-gradient(310deg, #EBEFF4 0%, #CED4DA 100%)",
  },
};

const { Title, Text, Paragraph } = Typography;

// Helper function to calculate time elapsed
const getTimeElapsed = (createdAt) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now - created) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} giây`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} phút`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} giờ`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} ngày`;
  }
};

const NotificationSection = ({
  notifications,
  setNotifications,
  loadingNotification,
  errorNotification,
  notificationsCount,
  setNotificationsCount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationData, setNotificationData] = useState([]);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  useEffect(() => {
    setNotificationData(notifications);
  }, [notifications]);

  // Update time elapsed every minute
  useEffect(() => {
    const updateTimeElapsed = () => {
      setNotificationData((prevData) =>
        prevData.map((item) => ({
          ...item,
          timeElapsed: getTimeElapsed(item.createdAt),
        }))
      );
    };

    updateTimeElapsed();
    const intervalId = setInterval(updateTimeElapsed, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, []);

  const showNotificationDetail = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleUpdateStatusUserNotification = async (user_notificationID) => {
    try {
      await user_notificationService.editUserNotification(user_notificationID, { status: true });
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllAsRead(true);
    try {
      const unreadNotifications = notificationData.filter((item) => !item.status);

      // Update all unread notifications
      const updatePromises = unreadNotifications.map((item) =>
        item.user_notificationID
          ? handleUpdateStatusUserNotification(item.user_notificationID)
          : Promise.resolve()
      );

      await Promise.all(updatePromises);

      // Update local state
      setNotificationData((prevData) => prevData.map((item) => ({ ...item, status: true })));

      setNotificationsCount(0);
      message.success("Đã đánh dấu tất cả thông báo là đã đọc");
    } catch (error) {
      message.error("Có lỗi xảy ra khi đánh dấu thông báo");
      console.error("Error marking all as read:", error);
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  const unreadCount = notificationData.filter((item) => !item.status).length;

  return (
    <div
      style={{
        width: "100%",
        paddingRight: "20px",
        overflow: "hidden",
      }}
    >
      {/* Enhanced Header */}
      <Card
        size="small"
        style={{
          marginBottom: "16px",
          borderRadius: "12px",
          background: colors.gradients.info,
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "white",
          }}
        >
          <Space>
            <Badge count={unreadCount} offset={[-5, 5]}>
              <BellOutlined style={{ fontSize: "24px", color: "white" }} />
            </Badge>
            <div>
              <Title level={5} style={{ margin: 0, color: "white" }}>
                Thông báo
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>
                {unreadCount > 0 ? `${unreadCount} chưa đọc` : "Tất cả đã đọc"}
              </Text>
            </div>
          </Space>

          {unreadCount > 0 && (
            <Tooltip title="Đánh dấu tất cả là đã đọc">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                loading={markingAllAsRead}
                onClick={handleMarkAllAsRead}
                style={{
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                size="small"
              >
                Đọc tất cả
              </Button>
            </Tooltip>
          )}
        </div>
      </Card>

      {/* Notification List */}
      {notificationData.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không có thông báo nào"
          style={{ padding: "40px 20px" }}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notificationData}
          style={{
            maxHeight: "400px",
            overflow: "auto",
          }}
          renderItem={(item, index) => (
            <List.Item
              onClick={() => {
                if (item.user_notificationID && !item.status) {
                  handleUpdateStatusUserNotification(item.user_notificationID);
                  item.status = true;
                  setNotificationsCount(Math.max(0, notificationsCount - 1));
                }
                showNotificationDetail(item);
              }}
              style={{
                padding: "16px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                borderRadius: "12px",
                margin: "8px 0",
                backgroundColor: item.status ? "#fafafa" : "#fff",
                border: item.status ? "1px solid #f0f0f0" : "1px solid #e6f7ff",
                boxShadow: item.status
                  ? "0 2px 4px rgba(0,0,0,0.05)"
                  : "0 4px 12px rgba(24, 144, 255, 0.1)",
                position: "relative",
                overflow: "hidden",
              }}
              className={`notification-item ${!item.status ? "notification-unread" : ""}`}
            >
              {/* Unread indicator */}
              {!item.status && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    background: "linear-gradient(180deg, #1890ff 0%, #40a9ff 100%)",
                  }}
                />
              )}

              <List.Item.Meta
                avatar={
                  <div style={{ position: "relative" }}>
                    <Avatar
                      icon={<NotificationOutlined />}
                      style={{
                        backgroundColor:
                          item.general === true
                            ? "linear-gradient(135deg, #1890ff, #40a9ff)"
                            : "linear-gradient(135deg, #ff9800, #ffb74d)",
                        border: "3px solid #fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      size={48}
                    />
                    {!item.status && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-2px",
                          right: "-2px",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: "#ff4d4f",
                          border: "2px solid #fff",
                        }}
                      />
                    )}
                  </div>
                }
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1, marginRight: "8px" }}>
                      <Text
                        strong
                        style={{
                          fontSize: "15px",
                          color: item.status ? "#666" : "#262626",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        {item.title}
                      </Text>
                      <Space size="small">
                        <Tag
                          color={item.general === true ? "blue" : "orange"}
                          style={{
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "500",
                          }}
                        >
                          {item.general === true ? "Chung" : "Lớp học"}
                        </Tag>
                        <Space size={4} style={{ color: "#999", fontSize: "12px" }}>
                          <ClockCircleOutlined />
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {item.timeElapsed} trước
                          </Text>
                        </Space>
                      </Space>
                    </div>

                    {item.status && (
                      <Tooltip title="Đã đọc">
                        <CheckOutlined style={{ color: "#52c41a", fontSize: "14px" }} />
                      </Tooltip>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      {/* Enhanced Notification Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              icon={<NotificationOutlined />}
              style={{
                backgroundColor: selectedNotification?.general === true ? "#1890ff" : "#ff9800",
              }}
            />
            <div>
              <div style={{ fontSize: "16px", fontWeight: "600" }}>
                {selectedNotification?.title || "Thông báo"}
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Chi tiết thông báo
              </Text>
            </div>
          </div>
        }
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
        width={600}
        style={{ top: 50 }}
      >
        {selectedNotification && (
          <div style={{ padding: "8px 0" }}>
            <div style={{ marginBottom: "20px" }}>
              <Space wrap>
                <Tag
                  color={selectedNotification.general === true ? "green" : "orange"}
                  style={{
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "500",
                    padding: "4px 8px",
                  }}
                >
                  {selectedNotification.general === true ? "Thông báo chung" : "Thông báo lớp học"}
                </Tag>
                <Space size={4} style={{ color: "#666" }}>
                  <ClockCircleOutlined />
                  <Text type="secondary">
                    {new Date(selectedNotification.createdAt).toLocaleString("vi-VN")}
                  </Text>
                </Space>
                {selectedNotification.status && (
                  <Tag color="success" icon={<CheckOutlined />}>
                    Đã đọc
                  </Tag>
                )}
              </Space>
            </div>

            <Divider />

            <div
              style={{
                background: "#fafafa",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #f0f0f0",
              }}
            >
              <Paragraph
                style={{
                  margin: 0,
                  lineHeight: "1.6",
                  fontSize: "14px",
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: selectedNotification.detail }} />
              </Paragraph>
            </div>

            {selectedNotification.classID && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "#e6f7ff",
                  borderRadius: "6px",
                  border: "1px solid #91d5ff",
                }}
              >
                <Text type="secondary">
                  <strong>Mã lớp học:</strong> {selectedNotification.classID}
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Enhanced CSS Styles */}
      <style>{`
        .notification-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .notification-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
        }
        
        .notification-unread {
          position: relative;
        }
        
        .notification-unread::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(24, 144, 255, 0.02), rgba(64, 169, 255, 0.02));
          pointer-events: none;
          border-radius: 12px;
        }

        /* Pulse animation for unread notifications */
        @keyframes pulse {
          0% { box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1); }
          50% { box-shadow: 0 6px 20px rgba(24, 144, 255, 0.2); }
          100% { box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1); }
        }

        .notification-unread {
          animation: pulse 3s infinite;
        }

        /* Custom scrollbar */
        .ant-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .ant-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .ant-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .ant-list::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }

        /* Responsive styles */
        @media (max-width: 576px) {
          .ant-modal {
            max-width: 95vw !important;
            margin: 0 auto;
          }
          
          .ant-modal-content {
            padding: 12px !important;
          }
          
          .ant-modal-header {
            padding: 12px 12px 8px !important;
          }
          
          .ant-modal-body {
            padding: 8px 12px 12px !important;
          }
          
          .notification-item {
            margin: 4px 0 !important;
            padding: 12px !important;
          }
        }

        /* Loading state */
        .ant-spin-nested-loading > div > .ant-spin {
          max-height: none !important;
        }
      `}</style>
    </div>
  );
};

export default NotificationSection;

NotificationSection.propTypes = {
  notifications: PropTypes.array.isRequired,
  setNotifications: PropTypes.func.isRequired,
  loadingNotification: PropTypes.bool.isRequired,
  errorNotification: PropTypes.string.isRequired,
  notificationsCount: PropTypes.number.isRequired,
  setNotificationsCount: PropTypes.func.isRequired,
};
