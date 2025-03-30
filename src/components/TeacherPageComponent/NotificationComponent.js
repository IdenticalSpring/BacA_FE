import React, { useState, useEffect } from "react";
import { List, Badge, Modal, Typography, Space, Tag, Avatar, message } from "antd";
import { BellOutlined, NotificationOutlined } from "@ant-design/icons";
import notificationService from "services/notificationService";
import PropTypes from "prop-types";
import user_notificationService from "services/user_notificationService";
const { Title, Text, Paragraph } = Typography;

// Helper function to calculate time elapsed
const getTimeElapsed = (createdAt) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now - created) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} min`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} hr`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} day${
      Math.floor(diffInSeconds / 86400) !== 1 ? "s" : ""
    }`;
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
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  //   console.log(notifications);
  const [notificationData, setNotificationData] = useState([]);
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

    // Initial update
    updateTimeElapsed();

    // Set interval for updates (every minute)
    const intervalId = setInterval(updateTimeElapsed, 1000);

    // Clean up interval on component unmount
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
    user_notificationService.editUserNotification(user_notificationID, { status: true });
  };
  return (
    <div
      style={{
        width: "100%",
        // maxWidth: "400px",
        // padding: "0 20px",
        paddingRight: "20px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      {/* <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          //   backgroundColor: "#f9f9f9",
        }}
      >
        <Space>
          <Badge count={notifications.length} offset={[-5, 5]}>
            <BellOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
          </Badge>
          <Title level={5} style={{ margin: 0 }}>
            Notifications
          </Title>
        </Space>
      </div> */}

      {/* Notification List */}
      <List
        itemLayout="horizontal"
        dataSource={notificationData}
        style={{ maxHeight: "400px", overflow: "auto" }}
        renderItem={(item) => (
          <List.Item
            onClick={() => {
              if (item.user_notificationID && !item.status) {
                handleUpdateStatusUserNotification(item.user_notificationID);
                item.status = true;
                setNotificationsCount(notificationsCount - 1);
              }
              showNotificationDetail(item);
            }}
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              transition: "background-color 0.3s",
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: item.status ? "rgba(124, 124, 124, 0.1)" : "",
            }}
            className="notification-item"
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={<NotificationOutlined />}
                  style={{ backgroundColor: item.general === true ? "#1890ff" : "#ff9800" }}
                />
              }
              title={
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>{item.title}</Text>
                  <Tag color="blue">{item.timeElapsed} ago</Tag>
                </div>
              }
            />
          </List.Item>
        )}
      />

      {/* Notification Detail Modal */}
      <Modal
        title={selectedNotification?.title || "Notification"}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
      >
        {selectedNotification && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <Space>
                <Tag color={selectedNotification.general === true ? "green" : "orange"}>
                  {selectedNotification.general === true ? "General" : "Class Specific"}
                </Tag>
                <Text type="secondary">
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </Text>
              </Space>
            </div>

            <Paragraph style={{ maxWidth: "100%", overflow: "auto" }}>
              <div dangerouslySetInnerHTML={{ __html: selectedNotification.detail }} />
            </Paragraph>

            {selectedNotification.classID && (
              <div style={{ marginTop: "16px" }}>
                <Text type="secondary">Class ID: {selectedNotification.classID}</Text>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* CSS for hover effect */}
      <style>{`
        .notification-item:hover {
          background-color: #f5f5f5;
        }
          
        /* Add these styles to your CSS file */

        /* Animation for new notifications */
        @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(24, 144, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
        }

        .notification-new {
        animation: pulse 2s infinite;
        }

        /* Responsive styles */
        @media (max-width: 576px) {
        .ant-modal {
            max-width: 90vw !important;
            margin: 0 auto;
        }
        
        .ant-modal-content {
            padding: 16px !important;
        }
        
        .ant-modal-header {
            padding: 16px 16px 8px !important;
        }
        
        .ant-modal-body {
            padding: 8px 16px 16px !important;
        }
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
