import React from "react";
import { Layout, Avatar, Button, Typography, Upload, Alert, Spin, Empty } from "antd";
import { ArrowLeftOutlined, CameraOutlined, AudioOutlined, UserOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { colors } from "pages/teachers/teacherPage";
import MessageList from "./MessageList";

const { Content, Title, Text } = Typography;

const ChatInterface = ({
  chatPartner,
  chats,
  currentUserRole,
  loading,
  error,
  onGoBack,
  chatContentRef,
  isRecording,
  onToggleRecord,
  liveTranscript,
  onImageUpload,
  onRevokeMessage,
  isMobile,
}) => {
  return (
    <Layout style={{ height: "100%", backgroundColor: "#f5f5f5" }}>
      <header
        style={{
          padding: "12px 16px",
          backgroundColor: colors.white,
          borderBottom: `1px solid ${colors.gray}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        {isMobile && <Button type="text" icon={<ArrowLeftOutlined />} onClick={onGoBack} />}
        <Avatar src={chatPartner?.imgUrl} icon={<UserOutlined />} />
        <Title level={5} style={{ margin: 0 }}>{chatPartner?.name}</Title>
      </header>

      <Content ref={chatContentRef} style={{ padding: 16, overflowY: "auto" }}>
        {loading && <Spin style={{ display: "block", margin: "20px auto" }} />}
        {!loading && !chats.length && <Empty description="Chưa có tin nhắn" />}
        <MessageList
          chats={chats}
          currentUserRole={currentUserRole}
          chatPartner={chatPartner}
          onRevokeMessage={onRevokeMessage}
        />
      </Content>

      <footer
        style={{
          padding: 16,
          backgroundColor: colors.white,
          borderTop: `1px solid ${colors.gray}`,
        }}
      >
        {error && <Alert message={error} type="error" showIcon />}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <Text type="secondary" italic>
            {liveTranscript || (isRecording ? "Đang nghe..." : "Nhấn nút để ghi âm hoặc chọn ảnh")}
          </Text>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              onImageUpload(file);
              return false;
            }}
          >
            <Button
              icon={<CameraOutlined style={{ fontSize: 22 }} />}
              shape="circle"
              style={{ width: 50, height: 50, border: "2px solid #1890ff", color: "#1890ff" }}
            />
          </Upload>
          <Button
            type="primary"
            shape="circle"
            danger={isRecording}
            icon={<AudioOutlined style={{ fontSize: 24 }} />}
            onClick={onToggleRecord}
            style={{
              width: 60,
              height: 60,
              animation: isRecording ? "pulse 1.5s infinite" : "none",
            }}
          />
        </div>
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,77,79,0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255,77,79,0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,77,79,0); }
          }
        `}</style>
      </footer>
    </Layout>
  );
};

ChatInterface.propTypes = {
  chatPartner: PropTypes.object,
  chats: PropTypes.array.isRequired,
  currentUserRole: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onGoBack: PropTypes.func,
  chatContentRef: PropTypes.object.isRequired,
  isRecording: PropTypes.bool.isRequired,
  onToggleRecord: PropTypes.func.isRequired,
  liveTranscript: PropTypes.string,
  onImageUpload: PropTypes.func.isRequired,
  onRevokeMessage: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};
export default React.memo(ChatInterface);
