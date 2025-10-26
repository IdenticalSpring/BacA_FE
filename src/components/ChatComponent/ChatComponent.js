import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Layout,
  List,
  Avatar,
  Button,
  Typography,
  Spin,
  Alert,
  Empty,
  Card,
  Divider,
  message,
  Tooltip,
  Upload,
  Image,
  Dropdown,
  Menu,
  Badge,
} from "antd";
import {
  AudioOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  FileImageOutlined,
  MoreOutlined,
  PictureOutlined,
  SoundOutlined,
  CameraOutlined,
  TeamOutlined, // Icon máy ảnh
} from "@ant-design/icons";
import PropTypes from "prop-types";
import chatService from "services/chatService";
import fileService from "services/fileService";
import { colors } from "pages/teachers/teacherPage";
import { useSpeechRecognition } from "react-speech-kit";
import messageService from "services/messageService";
import AIChatComponent from "./AIChatComponent";
import chatTopicService from "services/chatTopicService";
const { Sider, Content } = Layout;
const { Text, Title } = Typography;
const timeZone = "Asia/Ho_Chi_Minh";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// --- Helpers & Sub-components ---
const createLocalTimestamp = () => new Date().toISOString();

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
    <Tooltip title="Nghe lại ghi âm">
      <Button
        type="text"
        shape="circle"
        icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        onClick={togglePlay}
        style={{ color: "inherit", opacity: 0.8, marginLeft: 8 }}
      />
    </Tooltip>
  );
});
PlayAudioButton.propTypes = { audioUrl: PropTypes.string.isRequired };
PlayAudioButton.displayName = "PlayAudioButton";

const MessageBubble = React.memo(({ chat, isMyMessage }) => {
  const bubbleStyle = {
    backgroundColor: isMyMessage ? colors.deepGreen : colors.white,
    color: isMyMessage ? colors.white : colors.darkGray,
    padding: "8px 12px",
    borderRadius: "18px",
    border: `1px solid ${isMyMessage ? colors.deepGreen : colors.gray}`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.07)",
    maxWidth: "100%",
  };

  if (chat.isRevoked) {
    return (
      <Card bodyStyle={bubbleStyle} bordered={false} className="message-card">
        <Text italic disabled>
          Tin nhắn đã bị thu hồi
        </Text>
      </Card>
    );
  }

  return (
    <Card bodyStyle={bubbleStyle} bordered={false} className="message-card">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {chat.imageUrl && (
          <Image
            src={chat.imageUrl}
            style={{
              width: "100%",
              maxWidth: "250px",
              borderRadius: "8px",
              marginBottom: chat.message || chat.audioUrl ? "8px" : "0px",
            }}
            preview={{ mask: "Xem ảnh" }}
          />
        )}
        {(chat.message || chat.audioUrl) && (
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", lineHeight: 1.4 }}>
            {chat.message && (
              <Text style={{ color: "inherit", whiteSpace: "pre-wrap" }}>{chat.message}</Text>
            )}
            {chat.audioUrl && <PlayAudioButton audioUrl={chat.audioUrl} />}
          </div>
        )}
      </div>
    </Card>
  );
});
MessageBubble.propTypes = {
  chat: PropTypes.object.isRequired,
  isMyMessage: PropTypes.bool.isRequired,
};
MessageBubble.displayName = "MessageBubble";

const MessageList = React.memo(({ chats, currentUserRole, onRevokeMessage, chatPartner }) => {
  let lastDate = null;

  const RevokeMenu = ({ chatId }) => (
    <Menu onClick={() => onRevokeMessage(chatId)}>
      <Menu.Item key="revoke">Thu hồi tin nhắn</Menu.Item>
    </Menu>
  );
  RevokeMenu.propTypes = { chatId: PropTypes.number.isRequired };

  return (
    <div style={{ padding: "0 8px" }}>
      {chats.map((chat) => {
        const isMyMessage = chat.senderRole === currentUserRole;
        const canRevoke = isMyMessage && !chat.isRevoked;

        const currentDateString = new Date(chat.createdAt).toLocaleDateString("vi-VN", {
          timeZone,
        });
        const showDateDivider = currentDateString !== lastDate;
        lastDate = currentDateString;

        return (
          <React.Fragment key={chat.id}>
            {showDateDivider && (
              <Divider>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date(chat.createdAt).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </Text>
              </Divider>
            )}
            <div
              className={`message-row ${isMyMessage ? "my-message" : "their-message"}`}
              style={{
                display: "flex",
                justifyContent: isMyMessage ? "flex-end" : "flex-start",
                marginBottom: "12px",
                alignItems: "flex-end",
                gap: "8px",
              }}
            >
              {!isMyMessage && <Avatar src={chatPartner?.imgUrl} icon={<UserOutlined />} />}

              <div
                style={{
                  maxWidth: "75%",
                  display: "flex",
                  alignItems: "center",
                  flexDirection: isMyMessage ? "row-reverse" : "row",
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
    </div>
  );
});
MessageList.propTypes = {
  chats: PropTypes.array.isRequired,
  currentUserRole: PropTypes.string.isRequired,
  onRevokeMessage: PropTypes.func.isRequired,
  chatPartner: PropTypes.object,
};
MessageList.displayName = "MessageList";

const StudentListSider = React.memo(({ students, selectedStudent, onSelectStudent, role }) => {
  const getLastMessagePreview = (msg) => {
    if (!msg) return "Bắt đầu cuộc Chit Chat";
    if (msg.isRevoked) return <Text italic>Tin nhắn đã thu hồi</Text>;
    let previewText = msg.isMyLastMessage ? "Bạn: " : "";
    if (msg.text) previewText += msg.text;
    else if (msg.imageUrl) previewText += "[Hình ảnh]";
    else if (msg.audioUrl) previewText += "[Ghi âm]";
    return previewText;
  };

  // ✅ Inject Group Chat only once
  const hasGroup = students.some((s) => s.id === "group");
  const listWithGroupAndAI = [
    {
      id: "ai",
      name: "🤖 AI Trò chuyện",
      imgUrl: null,
      isAI: true,
      lastMessage: { text: "Trò chuyện với AI hỗ trợ học tập" },
    },
    {
      id: "group",
      name: "💬 Nhóm lớp",
      imgUrl: null,
      isGroup: true,
      lastMessage: { text: "Phòng chat chung của lớp" },
    },
    ...students,
  ];

  return (
    <Layout style={{ height: "100%", backgroundColor: colors.white, overflow: "hidden" }}>
      {/* <header
          style={{
            padding: 16,
            borderBottom: `1px solid ${colors.gray}`,
            backgroundColor: colors.white,
          }}
        >
          <Title level={4} style={{ margin: 0, color: colors.deepGreen }}>
            {role === "teacher" ? "Học sinh" : "Trò chuyện"}
          </Title>
        </header> */}

      <Content style={{ overflowY: "auto", height: "100%" }}>
        {listWithGroupAndAI.length > 0 ? (
          <List
            dataSource={listWithGroupAndAI}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedStudent?.id === item.id ? colors.paleGreen : "transparent",
                  borderLeft: `4px solid ${
                    selectedStudent?.id === item.id ? colors.deepGreen : "transparent"
                  }`,
                  transition: "all 0.2s ease-in-out",
                }}
                onClick={() => onSelectStudent(item)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size="large"
                      src={item.imgUrl}
                      icon={item.isGroup ? <TeamOutlined /> : <UserOutlined />}
                      style={{
                        backgroundColor: item.isGroup ? "#e6f7ff" : "#f0f0f0",
                        border: item.isGroup ? "1px solid #91caff" : "1px solid #ccc",
                      }}
                    />
                  }
                  title={<Text strong>{item.name}</Text>}
                  description={
                    <Text type="secondary" style={{ fontSize: 12 }} ellipsis={{ tooltip: true }}>
                      {getLastMessagePreview(item.lastMessage)}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Không có dữ liệu" style={{ marginTop: 40 }} />
        )}
      </Content>
    </Layout>
  );
});

StudentListSider.propTypes = {
  students: PropTypes.array.isRequired,
  selectedStudent: PropTypes.object,
  onSelectStudent: PropTypes.func.isRequired,
  role: PropTypes.string.isRequired,
};

StudentListSider.displayName = "StudentListSider";

const ChatInterface = React.memo(
  ({
    chatPartner,
    chats,
    currentUserRole,
    isMobile,
    loading,
    error,
    onGoBack,
    chatContentRef,
    isRecording,
    onToggleRecord,
    liveTranscript,
    onImageUpload,
    onRevokeMessage,
    classInfo,
  }) => {
    const [currentTopic, setCurrentTopic] = useState(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
      if (!classInfo?.id || currentUserRole !== "student") {
        console.log("🚫 Skipped topic init — missing classInfo or not student:", {
          classId: classInfo?.id,
          currentUserRole,
        });
        return;
      }

      console.log("🟡 [Topic Init] Connecting socket for class", classInfo.id);

      const socket = chatTopicService.connect();
      console.log("🟢 Socket instance:", socket?.id || "(no id yet)");

      chatTopicService.joinTopicRoom(classInfo.id);
      console.log("📩 Sent joinClassTopic event:", { classId: classInfo.id });

      // --- REST fetch
      chatTopicService
        .getLatestTopic(classInfo.id)
        .then((topic) => {
          console.log("📦 [REST] Latest topic response:", topic);
          if (topic) {
            setCurrentTopic(topic);
          } else {
            console.warn("⚠️ No topic found for class", classInfo.id);
          }
        })
        .catch((err) => {
          console.error("❌ [REST] Failed to load topic:", err);
          setCurrentTopic(null);
        });

      // --- Listen for realtime updates
      chatTopicService.onNewTopic((topic) => {
        console.log("🆕 [SOCKET] New topic received:", topic);
        setCurrentTopic(topic);
      });

      socket.on("connect", () => console.log("✅ Connected to topic socket:", socket.id));
      socket.on("disconnect", (reason) =>
        console.log("❌ Disconnected from topic socket:", reason)
      );
      socket.on("connect_error", (err) => console.error("💥 Socket connect error:", err.message));

      return () => {
        console.log("🧹 Cleaning up topic socket for class", classInfo.id);
        chatTopicService.offNewTopic();
        chatTopicService.disconnect();
      };
    }, [classInfo?.id, currentUserRole]);

    return (
      <Layout style={{ height: "100%", backgroundColor: "#f5f5f5" }}>
        <header
          style={{
            padding: "12px 16px",
            backgroundColor: colors.white,
            borderBottom: `1px solid ${colors.gray}`,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          {isMobile && <Button type="text" icon={<ArrowLeftOutlined />} onClick={onGoBack} />}
          <Avatar src={chatPartner.imgUrl} icon={<UserOutlined />} />
          <Title level={5} style={{ margin: 0 }}>
            {chatPartner.name}
          </Title>
        </header>
        {currentUserRole === "student" && currentTopic ? (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderBottom: `1px solid ${colors.gray}`,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: currentTopic.imageUrl ? "pointer" : "default",
            }}
            onClick={() => currentTopic.imageUrl && setExpanded(true)}
          >
            {currentTopic.imageUrl && (
              <img
                src={currentTopic.imageUrl}
                alt="topic"
                style={{
                  width: 60,
                  height: 40,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
            )}
            <div>
              <Text strong>Chủ đề: {currentTopic.title}</Text>
              <br />
            </div>
          </div>
        ) : null}

        <Content ref={chatContentRef} style={{ padding: "16px", overflowY: "auto" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin />
            </div>
          )}
          <MessageList
            chats={chats}
            currentUserRole={currentUserRole}
            onRevokeMessage={onRevokeMessage}
            chatPartner={chatPartner}
          />
        </Content>
        <footer
          style={{
            padding: "16px",
            backgroundColor: colors.white,
            borderTop: `1px solid ${colors.gray}`,
          }}
        >
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 10 }} />}
          <div style={{ textAlign: "center", marginBottom: 8, minHeight: "22px" }}>
            <Text type="secondary" style={{ fontStyle: "italic" }}>
              {liveTranscript ||
                (isRecording ? "Đang nghe..." : "Nhấn nút để ghi âm hoặc chọn ảnh")}
            </Text>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}
          >
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                onImageUpload(file);
                return false;
              }}
              disabled={isRecording}
            >
              <Button
                icon={<CameraOutlined style={{ fontSize: 22 }} />}
                shape="circle"
                style={{
                  width: 50,
                  height: 50,
                  border: "2px solid #1890ff",
                  color: "#1890ff",
                }}
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
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
          </div>
          {expanded && (
            <div
              onClick={() => setExpanded(false)}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <img
                src={currentTopic?.imageUrl}
                alt="expanded topic"
                style={{
                  maxWidth: "90%",
                  maxHeight: "80%",
                  borderRadius: 12,
                  boxShadow: "0 0 20px rgba(0,0,0,0.4)",
                }}
              />
            </div>
          )}
        </footer>
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
          }
          .message-row.my-message .message-card { border-bottom-right-radius: 4px; }
          .message-row.their-message .message-card { border-bottom-left-radius: 4px; }
        `}</style>
      </Layout>
    );
  }
);
ChatInterface.propTypes = {
  chatPartner: PropTypes.object.isRequired,
  chats: PropTypes.array.isRequired,
  currentUserRole: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onGoBack: PropTypes.func,
  chatContentRef: PropTypes.object.isRequired,
  isRecording: PropTypes.bool.isRequired,
  onToggleRecord: PropTypes.func.isRequired,
  liveTranscript: PropTypes.string,
  onImageUpload: PropTypes.func.isRequired,
  onRevokeMessage: PropTypes.func.isRequired,
};
ChatInterface.displayName = "ChatInterface";

const ChatComponent = ({
  currentUser,
  classInfo,
  studentsInClass,
  teacherOfClass,
  isMobile,
  onUnreadCountChange,
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [allChatsInClass, setAllChatsInClass] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chatContentRef = useRef(null);
  const [mobileView, setMobileView] = useState("list");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [groupChats, setGroupChats] = useState([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState(null);
  // ✅ connect to socket once
  useEffect(() => {
    const socket = chatService.connect();
    if (!classInfo?.id) return;

    // join this class's group room
    chatService.joinGroupRoom(classInfo.id);

    // subscribe to new / recalled messages
    chatService.subscribeGroupMessages(
      (newMsg) => {
        setGroupChats((prev) => {
          // avoid duplicates if same id already exists
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      },
      ({ messageId }) => {
        setGroupChats((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, isRevoked: true } : m))
        );
      }
    );

    return () => {
      chatService.unsubscribeGroupMessages();
      chatService.disconnect();
    };
  }, [classInfo?.id]);

  // *** FIX 1: Tạo một ref để lưu trữ giá trị mới nhất của liveTranscript ***
  const liveTranscriptRef = useRef("");

  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      setLiveTranscript((prev) => (prev ? prev + " " : "") + result);
    },
  });

  // *** FIX 2: Luôn cập nhật ref mỗi khi state thay đổi ***
  useEffect(() => {
    liveTranscriptRef.current = liveTranscript;
  }, [liveTranscript]);

  useEffect(() => {
    if (currentUser.role === "student" && onUnreadCountChange) {
      const unreadCount = allChatsInClass.filter(
        (chat) => chat.senderRole === "teacher" && !chat.isRead
      ).length;
      onUnreadCountChange(unreadCount);
    }
  }, [allChatsInClass, currentUser.role, onUnreadCountChange]);

  const fetchGroupChats = useCallback(async () => {
    if (!classInfo?.id) return;
    setGroupLoading(true);
    try {
      const groupMessages = await messageService.getMessagesForClass(classInfo.id);
      setGroupChats(groupMessages || []);
    } catch (err) {
      setGroupError(err.message || "Không thể tải tin nhắn nhóm lớp.");
    } finally {
      setGroupLoading(false);
    }
  }, [classInfo]);

  const fetchAllChats = useCallback(async () => {
    if (!classInfo?.id) return;
    try {
      const chatsData = await chatService.getChatsByClass(classInfo.id);
      setAllChatsInClass(chatsData || []);
    } catch (err) {
      setError(err.message || "Không thể tải tin nhắn.");
    } finally {
      setLoading(false);
    }
  }, [classInfo]);

  useEffect(() => {
    fetchAllChats();
    const interval = setInterval(fetchAllChats, 5000);
    return () => clearInterval(interval);
  }, [fetchAllChats]);
  useEffect(() => {
    fetchGroupChats();
    // const interval = setInterval(fetchGroupChats, 8000);
    // return () => clearInterval(interval);
  }, [fetchGroupChats]);
  const handleMarkAsRead = useCallback(
    async (partner) => {
      if (!partner || !classInfo || !currentUser) return;
      const partnerRole = currentUser.role === "teacher" ? "student" : "teacher";
      const unreadMessagesExist = allChatsInClass.some(
        (chat) =>
          chat.senderRole === partnerRole &&
          !chat.isRead &&
          (partnerRole === "student"
            ? chat.student?.id === partner.id
            : chat.teacher?.id === partner.id)
      );
      if (unreadMessagesExist) {
        setAllChatsInClass((prev) =>
          prev.map((chat) =>
            chat.senderRole === partnerRole &&
            !chat.isRead &&
            (partnerRole === "student"
              ? chat.student?.id === partner.id
              : chat.teacher?.id === partner.id)
              ? { ...chat, isRead: true }
              : chat
          )
        );
        try {
          await chatService.markMessagesAsRead(classInfo.id, partner.id, currentUser.role);
        } catch (err) {
          console.error("Failed to mark messages as read:", err);
        }
      }
    },
    [allChatsInClass, classInfo, currentUser]
  );
  const handleSendGroupMessage = useCallback(
    (data) => {
      if (!classInfo?.id) return;

      // optimistic append
      const tempId = Date.now();
      const optimisticMsg = {
        id: tempId,
        tempId,
        classId: classInfo.id,
        message: data.message || "",
        imageUrl: data.imageUrl || null,
        audioUrl: data.audioUrl || null,
        senderRole: currentUser.role,
        createdAt: new Date().toISOString(),
      };
      setGroupChats((prev) => [...prev, optimisticMsg]);

      chatService.sendGroupMessage({
        classId: classInfo.id,
        content: data.message || "",
        imageUrl: data.imageUrl || null,
        audioUrl: data.audioUrl || null,
      });
    },
    [classInfo, currentUser.role]
  );

  const handleSendMessage = useCallback(
    async (data) => {
      // 🟣 If this is the group chat, call messageService instead
      if (selectedStudent?.id === "group") {
        try {
          const newMsg = await messageService.sendGroupMessage(classInfo.id, {
            message: data.message || "",
            imageUrl: data.imageUrl || null,
            audioUrl: data.audioUrl || null,
          });
          setGroupChats((prev) => [...prev, newMsg]);
        } catch (err) {
          setGroupError(err.message || "Không thể gửi tin nhắn nhóm.");
        }
        return;
      }

      // 🟢 Otherwise, normal private chat
      const chatPartner = currentUser.role === "teacher" ? selectedStudent : teacherOfClass;
      if (!chatPartner || !classInfo) return;
      setError(null);

      const chatData = {
        classId: classInfo.id,
        studentId: currentUser.role === "student" ? currentUser.id : chatPartner.id,
        teacherId: currentUser.role === "teacher" ? currentUser.id : chatPartner.id,
        senderRole: currentUser.role,
        ...data,
      };

      try {
        const newChat = await chatService.createChat(chatData);
        setAllChatsInClass((prev) => [...prev.filter((c) => c.id !== chatData.tempId), newChat]);
      } catch (err) {
        setError("Gửi tin nhắn thất bại.");
        setAllChatsInClass((prev) => prev.filter((c) => c.id !== chatData.tempId));
      }
    },
    [selectedStudent, teacherOfClass, classInfo, currentUser]
  );

  // --- SEND GROUP MESSAGE ---

  // --- RECALL GROUP MESSAGE ---
  const handleRevokeGroupMessage = useCallback(
    (messageId) => {
      if (!classInfo?.id) return;
      chatService.recallGroupMessage(messageId, classInfo.id);
    },
    [classInfo]
  );

  const createOptimisticChat = (chatPartner, data) => ({
    id: data.tempId,
    tempId: data.tempId,
    createdAt: createLocalTimestamp(),
    student: { id: currentUser.role === "student" ? currentUser.id : chatPartner.id },
    teacher: { id: currentUser.role === "teacher" ? currentUser.id : chatPartner.id },
    senderRole: currentUser.role,
    isRead: true,
    ...data,
  });

  const handleImageUpload = useCallback(
    async (file) => {
      const chatPartner = currentUser.role === "teacher" ? selectedStudent : teacherOfClass;
      if (!file || !chatPartner) return;
      const tempId = Date.now();
      const tempImageUrl = URL.createObjectURL(file);
      const optimisticChat = createOptimisticChat(chatPartner, {
        tempId,
        message: "",
        imageUrl: tempImageUrl,
      });
      setAllChatsInClass((prev) => [...prev, optimisticChat]);
      try {
        const uploadedImageUrl = await fileService.upload(file, `chat-image-${tempId}`);
        URL.revokeObjectURL(tempImageUrl);
        await handleSendMessage({ tempId, message: "", imageUrl: uploadedImageUrl });
      } catch (uploadError) {
        message.error("Gửi ảnh thất bại!");
        setAllChatsInClass((prev) => prev.filter((c) => c.id !== tempId));
      }
    },
    [selectedStudent, teacherOfClass, currentUser, handleSendMessage]
  );
  const handleGroupImageUpload = useCallback(
    async (file) => {
      if (!file) return;
      const tempId = Date.now();
      const tempImageUrl = URL.createObjectURL(file);
      setGroupChats((prev) => [
        ...prev,
        {
          id: tempId,
          tempId,
          createdAt: new Date().toISOString(),
          senderType: currentUser.role,
          imageUrl: tempImageUrl,
          message: "",
          isRead: true,
        },
      ]);
      try {
        const uploadedUrl = await fileService.upload(file, `group-chat-${tempId}`);
        URL.revokeObjectURL(tempImageUrl);
        await handleSendGroupMessage({ imageUrl: uploadedUrl });
      } catch {
        message.error("Gửi ảnh nhóm thất bại!");
        setGroupChats((prev) => prev.filter((m) => m.id !== tempId));
      }
    },
    [handleSendGroupMessage, currentUser]
  );

  const handleRevokeMessage = useCallback(async (chatId) => {
    try {
      await chatService.revokeChat(chatId, true);
      setAllChatsInClass((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, isRevoked: true, message: null, imageUrl: null, audioUrl: null }
            : chat
        )
      );
      message.success("Tin nhắn đã được thu hồi.");
    } catch (err) {
      message.error("Thu hồi thất bại.");
    }
  }, []);

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

        // *** FIX 3: Sử dụng giá trị từ ref trong closure của onstop ***
        mediaRecorderRef.current.onstop = async () => {
          const chatPartner = currentUser.role === "teacher" ? selectedStudent : teacherOfClass;
          if (!chatPartner) return;
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

          // Lấy giá trị MỚI NHẤT từ ref, không phải từ state cũ
          const finalTranscript = liveTranscriptRef.current.trim();

          const tempId = Date.now();
          const tempAudioUrl = URL.createObjectURL(audioBlob);
          const optimisticChat = createOptimisticChat(chatPartner, {
            tempId,
            message: finalTranscript,
            audioUrl: tempAudioUrl,
          });
          setAllChatsInClass((prev) => [...prev, optimisticChat]);
          try {
            const uploadedAudioUrl = await fileService.upload(
              audioBlob,
              `chat-audio-${tempId}.webm`
            );
            URL.revokeObjectURL(tempAudioUrl);
            await handleSendMessage({
              tempId,
              message: finalTranscript,
              audioUrl: uploadedAudioUrl,
            });
          } catch (uploadError) {
            message.error("Gửi thất bại!");
            setAllChatsInClass((prev) => prev.filter((c) => c.id !== tempId));
          }
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current.start();
        listen({ lang: "en-AU", interimResults: false });
        setIsRecording(true);
        setLiveTranscript(""); // Reset state để bắt đầu phiên mới
      } catch (err) {
        message.error("Không thể truy cập micro. Vui lòng cấp quyền.");
      }
    }
  }, [
    isRecording,
    listening,
    supported,
    listen,
    stop,
    handleSendMessage,
    selectedStudent,
    teacherOfClass,
    currentUser,
  ]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [allChatsInClass, selectedStudent]);

  const studentsWithLastMessage = useMemo(() => {
    if (currentUser.role !== "teacher" || !studentsInClass) return [];
    return studentsInClass
      .map((student) => {
        const relatedChats = allChatsInClass.filter(
          (chat) => chat.student?.id === student.id && chat.teacher?.id === currentUser.id
        );
        const unreadCount = relatedChats.filter(
          (c) => c.senderRole === "student" && !c.isRead
        ).length;
        if (relatedChats.length === 0) return { ...student, lastMessage: null, unreadCount: 0 };
        const lastChat = relatedChats.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        return {
          ...student,
          unreadCount,
          lastMessage: {
            text: lastChat.message,
            time: lastChat.createdAt,
            isMyLastMessage: lastChat.senderRole === "teacher",
            imageUrl: lastChat.imageUrl,
            audioUrl: lastChat.audioUrl,
            isRevoked: lastChat.isRevoked,
          },
        };
      })
      .sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.time) - new Date(a.lastMessage.time);
      });
  }, [studentsInClass, allChatsInClass, currentUser.id, currentUser.role]);

  const getFilteredChats = (partner) => {
    if (!partner) return [];
    const studentId = currentUser.role === "student" ? currentUser.id : partner.id;
    const teacherId = currentUser.role === "teacher" ? currentUser.id : partner.id;
    return allChatsInClass.filter(
      (c) => c.student?.id === studentId && c.teacher?.id === teacherId
    );
  };

  const teacherFilteredChats = useMemo(
    () => getFilteredChats(selectedStudent),
    [allChatsInClass, selectedStudent]
  );
  const studentFilteredChats = useMemo(() => {
    const all = getFilteredChats(teacherOfClass);
    // Filter out AI intro or system-like messages if needed
    return all.filter(
      (chat) => !(chat.senderRole === "teacher" && chat.message?.startsWith("[AI]")) // or any marker if you use one
    );
  }, [allChatsInClass, teacherOfClass]);

  const handleSelectStudent = useCallback(
    (student) => {
      setSelectedStudent(student);

      if (student?.isAI) {
        if (isMobile) setMobileView("ai");
        return;
      }

      if (!student.isGroup) handleMarkAsRead(student);
      if (isMobile) setMobileView("chat");
    },
    [isMobile, handleMarkAsRead]
  );

  const handleGoBack = useCallback(() => setMobileView("list"), []);

  useEffect(() => {
    if (currentUser.role === "student" && teacherOfClass) {
      handleMarkAsRead(teacherOfClass);
    }
  }, [currentUser.role, teacherOfClass, handleMarkAsRead, allChatsInClass]);

  // --- RENDER LOGIC ---
  if (currentUser.role === "teacher") {
    const isGroupChat = selectedStudent?.id === "group";
    const chatsToDisplay = isGroupChat ? groupChats : teacherFilteredChats;
    const mainContent = selectedStudent ? (
      selectedStudent.isAI ? (
        <AIChatComponent
          userRole={currentUser.role}
          classId={classInfo?.id}
          teacherId={currentUser?.id}
        />
      ) : (
        <ChatInterface
          chatPartner={selectedStudent}
          chats={chatsToDisplay}
          currentUserRole={currentUser.role}
          isMobile={isMobile}
          loading={isGroupChat ? groupLoading : loading}
          error={isGroupChat ? groupError : error}
          onGoBack={handleGoBack}
          chatContentRef={chatContentRef}
          isRecording={isRecording}
          onToggleRecord={handleToggleRecord}
          liveTranscript={liveTranscript}
          onImageUpload={isGroupChat ? handleGroupImageUpload : handleImageUpload}
          onRevokeMessage={isGroupChat ? handleRevokeGroupMessage : handleRevokeMessage}
          classInfo={classInfo}
        />
      )
    ) : (
      <div
        style={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Empty
          description="Chọn một học sinh để bắt đầu Chit Chat"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
    if (isMobile) {
      if (mobileView === "list") {
        return (
          <StudentListSider
            students={studentsWithLastMessage}
            selectedStudent={selectedStudent}
            onSelectStudent={handleSelectStudent}
          />
        );
      }
      return mainContent;
    }
    return (
      <Layout style={{ height: "100vh", overflow: "hidden" }}>
        <Sider width={320} theme="light" style={{ borderRight: `1px solid ${colors.gray}` }}>
          <StudentListSider
            students={studentsWithLastMessage}
            selectedStudent={selectedStudent}
            onSelectStudent={handleSelectStudent}
          />
        </Sider>
        <Content>{mainContent}</Content>
      </Layout>
    );
  }

  // --- STUDENT VIEW ---
  if (currentUser.role === "student") {
    if (!teacherOfClass) {
      return (
        <div
          style={{
            display: "flex",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Empty description="Lớp học của bạn hiện chưa có giáo viên." />
        </div>
      );
    }

    const studentList = [
      {
        id: teacherOfClass.id,
        name: teacherOfClass.name || "Giáo viên",
        imgUrl: teacherOfClass.imgUrl || null,
        isGroup: false,
        lastMessage: null,
      },
    ];

    const selectedPartner =
      selectedStudent && selectedStudent.id
        ? selectedStudent
        : { id: teacherOfClass.id, name: teacherOfClass.name, isGroup: false };

    const isGroupChat = selectedStudent?.id === "group";
    const chatsToDisplay = isGroupChat ? groupChats : teacherFilteredChats;

    // ✅ Add mobile responsive switch
    if (isMobile) {
      if (mobileView === "list") {
        return (
          <StudentListSider
            role="student"
            students={studentList}
            selectedStudent={selectedStudent}
            onSelectStudent={(student) => {
              setSelectedStudent(student);
              setMobileView("chat");
            }}
          />
        );
      }
      return (
        <ChatInterface
          chatPartner={selectedPartner}
          chats={chatsToDisplay}
          currentUserRole={currentUser.role}
          isMobile={isMobile}
          loading={isGroupChat ? groupLoading : loading}
          error={isGroupChat ? groupError : error}
          onGoBack={() => setMobileView("list")}
          chatContentRef={chatContentRef}
          isRecording={isRecording}
          onToggleRecord={handleToggleRecord}
          liveTranscript={liveTranscript}
          onImageUpload={isGroupChat ? handleGroupImageUpload : handleImageUpload}
          onRevokeMessage={isGroupChat ? handleRevokeGroupMessage : handleRevokeMessage}
          classInfo={classInfo}
        />
      );
    }

    // --- Desktop Layout ---
    return (
      <Layout style={{ height: "100vh", overflow: "hidden" }}>
        <Sider width={280} theme="light" style={{ borderRight: `1px solid ${colors.gray}` }}>
          <StudentListSider
            role="student"
            students={studentList}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
          />
        </Sider>
        <Content>
          <ChatInterface
            chatPartner={selectedPartner}
            chats={chatsToDisplay}
            currentUserRole={currentUser.role}
            isMobile={isMobile}
            loading={isGroupChat ? groupLoading : loading}
            error={isGroupChat ? groupError : error}
            onGoBack={null}
            chatContentRef={chatContentRef}
            isRecording={isRecording}
            onToggleRecord={handleToggleRecord}
            liveTranscript={liveTranscript}
            onImageUpload={isGroupChat ? handleGroupImageUpload : handleImageUpload}
            onRevokeMessage={isGroupChat ? handleRevokeGroupMessage : handleRevokeMessage}
            classInfo={classInfo}
          />
        </Content>
      </Layout>
    );
  }

  return (
    <div
      style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}
    >
      <Spin size="large" />
    </div>
  );
};

ChatComponent.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
  classInfo: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
  studentsInClass: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  teacherOfClass: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }),
  isMobile: PropTypes.bool.isRequired,
  onUnreadCountChange: PropTypes.func,
};
ChatComponent.defaultProps = {
  studentsInClass: [],
  teacherOfClass: null,
  classInfo: null,
  onUnreadCountChange: () => {},
};

ChatInterface.propTypes = {
  chatPartner: PropTypes.object.isRequired,
  chats: PropTypes.array.isRequired,
  currentUserRole: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onGoBack: PropTypes.func,
  chatContentRef: PropTypes.object.isRequired,
  isRecording: PropTypes.bool.isRequired,
  onToggleRecord: PropTypes.func.isRequired,
  liveTranscript: PropTypes.string,
  onImageUpload: PropTypes.func.isRequired,
  onRevokeMessage: PropTypes.func.isRequired,
  classInfo: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

ChatComponent.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
  classInfo: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  studentsInClass: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  teacherOfClass: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string, // Add this
    imgUrl: PropTypes.string, // Add this
  }),
  isMobile: PropTypes.bool.isRequired,
  onUnreadCountChange: PropTypes.func,
};

export default ChatComponent;
