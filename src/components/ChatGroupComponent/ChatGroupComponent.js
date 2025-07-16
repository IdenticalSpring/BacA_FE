import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Layout,
  Avatar,
  Input,
  Button,
  Typography,
  Spin,
  Empty,
  Card,
  Divider,
  message,
  Tooltip,
  Upload,
  Image,
  Dropdown,
  Menu,
  Alert,
} from "antd";
import {
  UserOutlined,
  SendOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CameraOutlined,
  AudioOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { useSpeechRecognition } from "react-speech-kit";

import messageService from "services/messageService";
import fileService from "services/fileService";
import { colors } from "pages/teachers/teacherPage"; // Tái sử dụng bảng màu

const { Content, Footer } = Layout;
const { Text } = Typography;

// --- Sub-components (Giữ nguyên) ---

const PlayAudioButton = React.memo(({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio(audioUrl));
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, [audioUrl]);
  const togglePlay = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => console.error("Audio play error:", error));
    }
    setIsPlaying(!isPlaying);
  };
  return (
    <Tooltip title="Nghe lại">
      <Button
        type="text"
        shape="circle"
        icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        onClick={togglePlay}
        style={{ color: "inherit", marginLeft: 8 }}
      />
    </Tooltip>
  );
});
PlayAudioButton.propTypes = { audioUrl: PropTypes.string.isRequired };
PlayAudioButton.displayName = "PlayAudioButton";

const MessageBubble = React.memo(({ messageData, isMyMessage }) => {
  const bubbleStyle = {
    backgroundColor: isMyMessage ? colors.deepGreen : colors.white,
    color: isMyMessage ? colors.white : colors.darkGray,
    padding: "8px 12px",
    borderRadius: "18px",
    border: `1px solid ${isMyMessage ? colors.deepGreen : colors.gray}`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.07)",
    maxWidth: "100%",
  };
  return (
    <Card bodyStyle={bubbleStyle} bordered={false}>
      {!isMyMessage && (
        <Text strong style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
          {messageData.senderTeacher?.name || messageData.senderStudent?.name}
        </Text>
      )}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {messageData.imageUrl && (
          <Image
            src={messageData.imageUrl}
            style={{
              maxWidth: "250px",
              borderRadius: "8px",
              marginBottom: messageData.content || messageData.audioUrl ? "8px" : "0px",
            }}
          />
        )}
        {(messageData.content || messageData.audioUrl) && (
          <div style={{ display: "flex", alignItems: "center", lineHeight: 1.4, flexWrap: "wrap" }}>
            {messageData.content && (
              <Text style={{ color: "inherit", whiteSpace: "pre-wrap" }}>
                {messageData.content}
              </Text>
            )}
            {messageData.audioUrl && <PlayAudioButton audioUrl={messageData.audioUrl} />}
          </div>
        )}
      </div>
    </Card>
  );
});
MessageBubble.propTypes = {
  messageData: PropTypes.object.isRequired,
  isMyMessage: PropTypes.bool.isRequired,
};
MessageBubble.displayName = "MessageBubble";

// --- Component Chính ---

const ChatGroupComponent = ({ currentUser, classInfo, socket, messages, setMessages, loading }) => {
  const [error, setError] = useState(null);
  const chatContentRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const liveTranscriptRef = useRef("");
  const [isSending, setIsSending] = useState(false);

  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      setLiveTranscript((prev) => (prev ? `${prev} ${result}` : result));
    },
  });

  useEffect(() => {
    liveTranscriptRef.current = liveTranscript;
  }, [liveTranscript]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(
    (data) => {
      if (!socket) return;
      const messageData = { classId: classInfo.id, ...data };
      socket.emit("sendMessage", messageData);
    },
    [socket, classInfo]
  );

  const createOptimisticMessage = (data) => ({
    id: data.tempId,
    ...data,
    createdAt: new Date().toISOString(),
    senderType: currentUser.role,
    ...(currentUser.role === "teacher"
      ? { senderTeacher: { id: currentUser.id, name: "Bạn" } }
      : {}),
    ...(currentUser.role === "student"
      ? { senderStudent: { id: currentUser.id, name: "Bạn", imgUrl: currentUser.imgUrl } }
      : {}),
  });

  // const handleImageUpload = useCallback(
  //   async (file) => {
  //     if (!file) return;
  //     const tempId = Date.now();
  //     const tempImageUrl = URL.createObjectURL(file);
  //     const optimisticMessage = createOptimisticMessage({ tempId, imageUrl: tempImageUrl });
  //     setMessages((prev) => [...prev, optimisticMessage]);

  //     try {
  //       const uploadedImageUrl = await fileService.upload(file, `group-chat-${tempId}`);
  //       URL.revokeObjectURL(tempImageUrl);
  //       handleSendMessage({ tempId, imageUrl: uploadedImageUrl });
  //     } catch (uploadError) {
  //       message.error("Gửi ảnh thất bại!");
  //       setMessages((prev) => prev.filter((m) => m.id !== tempId));
  //     }
  //   },
  //   [handleSendMessage, currentUser, setMessages]
  // );

  const handleImageUpload = useCallback(
    async (file) => {
      if (!file) return;
      setIsSending(true); // Bắt đầu gửi
      message.loading({ content: "Đang gửi ảnh...", key: "sending" });
      try {
        const uploadedImageUrl = await fileService.upload(file, `group-chat-${Date.now()}`);
        handleSendMessage({ imageUrl: uploadedImageUrl });
        message.success({ content: "Gửi thành công!", key: "sending", duration: 2 });
      } catch (uploadError) {
        message.error({ content: "Gửi ảnh thất bại!", key: "sending", duration: 2 });
      } finally {
        setIsSending(false); // Kết thúc gửi
      }
    },
    [handleSendMessage]
  );

  const handleToggleRecord = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      if (listening) stop();
      setIsRecording(false);
    } else {
      if (!supported) {
        message.error("Trình duyệt không hỗ trợ nhận dạng giọng nói.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) =>
          audioChunksRef.current.push(event.data);

        mediaRecorderRef.current.onstop = async () => {
          setIsSending(true); // Bắt đầu gửi
          message.loading({ content: "Đang xử lý & gửi ghi âm...", key: "sending" });

          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const finalTranscript = liveTranscriptRef.current.trim();

          try {
            const uploadedAudioUrl = await fileService.upload(
              audioBlob,
              `group-audio-${Date.now()}.webm`
            );
            handleSendMessage({ content: finalTranscript, audioUrl: uploadedAudioUrl });
            message.success({ content: "Gửi thành công!", key: "sending", duration: 2 });
          } catch (uploadError) {
            message.error({ content: "Gửi ghi âm thất bại!", key: "sending", duration: 2 });
          } finally {
            setIsSending(false); // Kết thúc gửi
            stream.getTracks().forEach((track) => track.stop());
          }
        };

        mediaRecorderRef.current.start();
        listen({ lang: "en-AU", interimResults: false });
        setIsRecording(true);
        setLiveTranscript("");
      } catch (err) {
        message.error("Không thể truy cập micro. Vui lòng cấp quyền.");
      }
    }
  }, [
    isRecording,
    listening,
    stop,
    listen,
    supported,
    handleSendMessage,
    currentUser,
    setMessages,
  ]);

  const handleRevokeMessage = (messageId) => {
    if (!socket) return;
    socket.emit("recallMessage", { messageId, classId: classInfo.id });
  };

  if (loading)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
      >
        <Spin size="large" />
      </div>
    );
  if (error)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
      >
        <Empty description={error} />
      </div>
    );

  return (
    <Layout style={{ height: "100%", backgroundColor: "#f5f5f5" }}>
      <Content ref={chatContentRef} style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            const isMyMessage =
              msg.senderType === currentUser.role &&
              (msg.senderStudent?.id === currentUser.id ||
                msg.senderTeacher?.id === currentUser.id);
            const canRevoke = isMyMessage && !msg.tempId;
            const showDateDivider =
              index === 0 ||
              new Date(msg.createdAt).toDateString() !==
                new Date(messages[index - 1].createdAt).toDateString();

            return (
              <React.Fragment key={msg.id || msg.tempId}>
                {showDateDivider && (
                  <Divider>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(msg.createdAt).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </Text>
                  </Divider>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: isMyMessage ? "flex-end" : "flex-start",
                    marginBottom: "12px",
                    alignItems: "flex-end",
                    gap: "8px",
                  }}
                >
                  {!isMyMessage && (
                    <Avatar
                      src={msg.senderStudent?.imgUrl || msg.senderTeacher?.imageUrl}
                      icon={<UserOutlined />}
                    />
                  )}
                  <div
                    style={{
                      maxWidth: "70%",
                      display: "flex",
                      alignItems: "center",
                      flexDirection: isMyMessage ? "row-reverse" : "row",
                    }}
                  >
                    {canRevoke && (
                      <Dropdown
                        overlay={
                          <Menu onClick={() => handleRevokeMessage(msg.id)}>
                            <Menu.Item key="revoke">Thu hồi</Menu.Item>
                          </Menu>
                        }
                        trigger={["click"]}
                      >
                        <Button type="text" shape="circle" icon={<MoreOutlined />} />
                      </Dropdown>
                    )}
                    <MessageBubble messageData={msg} isMyMessage={isMyMessage} />
                  </div>
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <Empty description="Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!" />
        )}
        {isSending && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              opacity: 0.6,
              marginBottom: "12px",
            }}
          >
            <Card
              bodyStyle={{
                padding: "8px 12px",
                borderRadius: "18px",
                backgroundColor: colors.deepGreen,
              }}
            >
              <Spin indicator={<LoadingOutlined style={{ fontSize: 16, color: "white" }} spin />} />
              <Text style={{ color: "white", marginLeft: 8, fontStyle: "italic" }}>
                Đang gửi...
              </Text>
            </Card>
          </div>
        )}
      </Content>

      <Footer
        style={{
          padding: "16px",
          backgroundColor: colors.white,
          borderTop: `1px solid ${colors.gray}`,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 8, minHeight: "22px" }}>
          <Text type="secondary" style={{ fontStyle: "italic" }}>
            {liveTranscript || (isRecording ? "Đang nghe..." : "Nhấn nút để ghi âm hoặc chọn ảnh")}
          </Text>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}
        >
          {/* **BƯỚC 4: VÔ HIỆU HÓA NÚT BẤM KHI ĐANG GỬI** */}
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              handleImageUpload(file);
              return false;
            }}
            disabled={isRecording || isSending}
          >
            <Button
              icon={<CameraOutlined style={{ fontSize: 22 }} />}
              shape="circle"
              style={{ width: 50, height: 50, border: "2px solid #1890ff", color: "#1890ff" }}
              disabled={isRecording || isSending}
            />
          </Upload>
          <Button
            type="primary"
            shape="circle"
            danger={isRecording}
            icon={isSending ? <LoadingOutlined /> : <AudioOutlined style={{ fontSize: 24 }} />}
            onClick={handleToggleRecord}
            style={{
              width: 60,
              height: 60,
              animation: isRecording ? "pulse 1.5s infinite" : "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            disabled={isSending} // Vô hiệu hóa nút ghi âm khi đang gửi
          />
        </div>
        <style>{`@keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); } 70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); } }`}</style>
      </Footer>
    </Layout>
  );
};

ChatGroupComponent.propTypes = {
  currentUser: PropTypes.object.isRequired,
  classInfo: PropTypes.object.isRequired,
  socket: PropTypes.object,
  messages: PropTypes.array.isRequired,
  setMessages: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ChatGroupComponent;
