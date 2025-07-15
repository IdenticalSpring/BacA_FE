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

const ChatGroupComponent = ({ currentUser, classInfo, onNewMessage }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chatContentRef = useRef(null);

  // State cho chức năng ghi âm và nhận dạng giọng nói
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const liveTranscriptRef = useRef("");

  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      setLiveTranscript((prev) => (prev ? `${prev} ${result}` : result));
    },
  });

  useEffect(() => {
    liveTranscriptRef.current = liveTranscript;
  }, [liveTranscript]);

  // --- WebSocket Connection ---
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token || !classInfo?.id) return;

    // SỬA LỖI: Dùng đúng biến môi trường API_BASE_URL
    const newSocket = io(process.env.REACT_APP_API_BASE_URL, {
      extraHeaders: { Authorization: `Bearer ${token}` },
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Group Chat: Connected to WebSocket");
      newSocket.emit("joinRoom", { classId: String(classInfo.id) });
    });
    newSocket.on("newMessage", (newMessage) => {
      setMessages((prev) => [...prev.filter((m) => m.tempId !== newMessage.tempId), newMessage]);
      // Kiểm tra xem tin nhắn này có phải của người khác không
      const isFromAnotherUser =
        newMessage.senderType !== currentUser.role ||
        (newMessage.senderStudent?.id !== currentUser.id &&
          newMessage.senderTeacher?.id !== currentUser.id);

      // Nếu là của người khác và prop onNewMessage tồn tại, hãy gọi nó
      if (isFromAnotherUser && onNewMessage) {
        onNewMessage();
      }
    });
    newSocket.on("messageRecalled", (data) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
      message.info("Một tin nhắn đã được thu hồi.");
    });
    newSocket.on("disconnect", () => console.log("Group Chat: Disconnected from WebSocket"));

    return () => newSocket.disconnect();
  }, [classInfo, currentUser.role, currentUser.id, onNewMessage]);

  // --- Fetch Initial Messages ---
  useEffect(() => {
    if (!classInfo?.id) return;
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const history = await messageService.getMessagesForClass(classInfo.id);
        setMessages(history);
      } catch (err) {
        setError("Không thể tải lịch sử tin nhắn.");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [classInfo]);

  // --- Scroll to Bottom ---
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Logic gửi tin nhắn (Được nâng cấp) ---
  const handleSendMessage = useCallback(
    (data) => {
      if (!socket) return;
      const messageData = { classId: classInfo.id, ...data };
      socket.emit("sendMessage", messageData);
    },
    [socket, classInfo]
  );

  const createOptimisticMessage = (data) => ({
    id: data.tempId, // Dùng tempId làm key tạm thời
    ...data,
    createdAt: new Date().toISOString(),
    senderType: currentUser.role,
    // Thêm thông tin người gửi để hiển thị avatar và tên ngay lập tức
    ...(currentUser.role === "teacher"
      ? { senderTeacher: { id: currentUser.id, name: "Bạn" } }
      : {}),
    ...(currentUser.role === "student"
      ? { senderStudent: { id: currentUser.id, name: "Bạn" } }
      : {}),
  });

  const handleImageUpload = useCallback(
    async (file) => {
      if (!file) return;
      const tempId = Date.now();
      const tempImageUrl = URL.createObjectURL(file);
      const optimisticMessage = createOptimisticMessage({ tempId, imageUrl: tempImageUrl });
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const uploadedImageUrl = await fileService.upload(file, `group-chat-${tempId}`);
        URL.revokeObjectURL(tempImageUrl); // Giải phóng bộ nhớ
        handleSendMessage({ tempId, imageUrl: uploadedImageUrl });
      } catch (uploadError) {
        message.error("Gửi ảnh thất bại!");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    },
    [handleSendMessage, currentUser]
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
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const finalTranscript = liveTranscriptRef.current.trim();
          const tempId = Date.now();
          const tempAudioUrl = URL.createObjectURL(audioBlob);

          const optimisticMessage = createOptimisticMessage({
            tempId,
            content: finalTranscript,
            audioUrl: tempAudioUrl,
          });
          setMessages((prev) => [...prev, optimisticMessage]);

          try {
            const uploadedAudioUrl = await fileService.upload(
              audioBlob,
              `group-audio-${tempId}.webm`
            );
            URL.revokeObjectURL(tempAudioUrl);
            handleSendMessage({ tempId, content: finalTranscript, audioUrl: uploadedAudioUrl });
          } catch (uploadError) {
            message.error("Gửi ghi âm thất bại!");
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
          }
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current.start();
        listen({ lang: "en-AU", interimResults: false });
        setIsRecording(true);
        setLiveTranscript("");
      } catch (err) {
        message.error("Không thể truy cập micro. Vui lòng cấp quyền.");
      }
    }
  }, [isRecording, listening, supported, listen, stop, handleSendMessage, currentUser]);

  const handleRevokeMessage = (messageId) => {
    if (!socket) return;
    socket.emit("recallMessage", { messageId, classId: classInfo.id });
  };

  // --- Render Logic ---
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
            const canRevoke = isMyMessage && !msg.tempId; // Chỉ thu hồi tin nhắn đã có id từ server
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
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              handleImageUpload(file);
              return false;
            }}
            disabled={isRecording}
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
            onClick={handleToggleRecord}
            style={{
              width: 60,
              height: 60,
              animation: isRecording ? "pulse 1.5s infinite" : "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          />
        </div>
        <style>{`@keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); } 70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); } }`}</style>
      </Footer>
    </Layout>
  );
};

ChatGroupComponent.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    role: PropTypes.oneOf(["student", "teacher", "admin"]).isRequired,
  }).isRequired,
  classInfo: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onNewMessage: PropTypes.func,
};

ChatGroupComponent.defaultProps = {
  onNewMessage: () => {},
};

export default ChatGroupComponent;
