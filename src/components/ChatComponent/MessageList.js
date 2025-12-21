import React from "react";
import { Avatar, Divider, Typography, Button, Dropdown, Menu } from "antd";
import { UserOutlined, MoreOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import MessageBubble from "./MessageBubble";
import { colors } from "pages/teachers/teacherPage";

const { Text } = Typography;
const timeZone = "Asia/Ho_Chi_Minh";

const MessageList = ({ chats, currentUserRole, chatPartner, onRevokeMessage, isTyping }) => {
  let lastDate = null;

  const RevokeMenu = ({ chatId }) => (
    <Menu onClick={() => onRevokeMessage(chatId)}>
      <Menu.Item key="revoke">Thu hồi tin nhắn</Menu.Item>
    </Menu>
  );

  // 🔔 Typing indicator component
  const TypingIndicator = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: 12,
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      <Avatar src={chatPartner?.imgUrl} icon={<UserOutlined />} />
      <div
        style={{
          background: "#f0f0f0",
          borderRadius: 18,
          padding: "10px 16px",
          maxWidth: "75%",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        <Text type="secondary" style={{ fontSize: 14 }}>
          <span style={{ animation: "dots 1.5s steps(3, end) infinite" }}>
            Đang trả lời...
          </span>
        </Text>
      </div>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60%, 100% { content: '...'; }
          }
        `}
      </style>
    </div>
  );

  return (
    <div style={{ padding: "0 8px" }}>
      {chats.map((chat) => {
        const isMyMessage = chat.senderRole === currentUserRole;
        const canRevoke = isMyMessage && !chat.isRevoked;

        const currentDate = new Date(chat.createdAt).toLocaleDateString("vi-VN", { timeZone });
        const showDivider = currentDate !== lastDate;
        lastDate = currentDate;

        return (
          <React.Fragment key={chat.id}>
            {showDivider && (
              <Divider>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {currentDate}
                </Text>
              </Divider>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: isMyMessage ? "flex-end" : "flex-start",
                marginBottom: 12,
                alignItems: "flex-end",
                gap: 8,
              }}
            >
              {!isMyMessage && (
                <Avatar src={chatPartner?.imgUrl} icon={<UserOutlined />} />
              )}
              <div
                style={{
                  maxWidth: "75%",
                  display: "flex",
                  flexDirection: isMyMessage ? "row-reverse" : "row",
                  alignItems: "center",
                }}
              >
                {canRevoke && (
                  <Dropdown overlay={<RevokeMenu chatId={chat.id} />} trigger={["click"]}>
                    <Button
                      type="text"
                      shape="circle"
                      icon={<MoreOutlined />}
                      style={{ color: colors.darkGray }}
                    />
                  </Dropdown>
                )}
                <MessageBubble chat={chat} isMyMessage={isMyMessage} />
              </div>
            </div>
          </React.Fragment>
        );
      })}
      
      {/* 🔔 Show typing indicator if teacher/AI is typing */}
      {isTyping && <TypingIndicator />}
    </div>
  );
};

MessageList.propTypes = {
  chats: PropTypes.array.isRequired,
  currentUserRole: PropTypes.string.isRequired,
  chatPartner: PropTypes.object,
  onRevokeMessage: PropTypes.func.isRequired,
  isTyping: PropTypes.bool, // 🔔 Add typing prop
};
export default React.memo(MessageList);
