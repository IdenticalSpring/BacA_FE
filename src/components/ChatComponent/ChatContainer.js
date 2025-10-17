import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layout, Empty, Spin, message as antdMessage } from "antd";
import PropTypes from "prop-types";
import { useSpeechRecognition } from "react-speech-kit";

import ChatInterface from "./ChatInterface";
import StudentListSider from "./StudentListSider";
import MessageList from "./MessageList"; // if you need direct import somewhere else
import { colors } from "pages/teachers/teacherPage";

import chatService from "services/chatService";
import fileService from "services/fileService";
import { createSocket, disconnectSocket } from "services/socket";

const { Sider, Content } = Layout;
const timeZone = "Asia/Ho_Chi_Minh";

/**
 * ChatContainer
 * - Orchestrates socket lifecycle, history loading, partner selection
 * - Teacher: chooses a student and joins their private room
 * - Student: auto-joins teacher’s private room
 * - Real-time events: newPrivateChat / privateChatRevoked / privateMessagesRead
 */
const ChatContainer = ({
  currentUser,
  classInfo,
  studentsInClass,
  teacherOfClass,
  isMobile,
  onUnreadCountChange,
}) => {
  const [socket, setSocket] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [allChatsInClass, setAllChatsInClass] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [error, setError] = useState(null);
  const chatContentRef = useRef(null);

  // Audio recorder + transcript
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

  // ---- Socket bootstrap
  useEffect(() => {
    if (!classInfo?.id) return;
    const s = createSocket(); // grabs token from storage internally
    setSocket(s);
    return () => {
      disconnectSocket(s);
      setSocket(null);
    };
  }, [classInfo?.id]);

  // ---- Load full class history (REST fallback / initial load)
  const fetchAllChats = useCallback(async () => {
    if (!classInfo?.id) return;
    try {
      const chatsData = await chatService.getChatsByClass(classInfo.id);
      setAllChatsInClass(chatsData || []);
      setError(null);
    } catch (err) {
      setError(err?.message || "Không thể tải tin nhắn.");
    } finally {
      setLoading(false);
    }
  }, [classInfo?.id]);

  useEffect(() => {
    fetchAllChats();
    // optional polling backup if websocket drops:
    // const interval = setInterval(fetchAllChats, 15000);
    // return () => clearInterval(interval);
  }, [fetchAllChats]);

  // ---- Auto-scroll on list change
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [allChatsInClass, selectedStudent]);

  // ---- Teacher selects student => join that private room
  const joinPrivateRoom = useCallback(
    (studentId) => {
      if (!socket || !classInfo?.id || !studentId) return;
      setLoadingJoin(true);
      socket.emit("joinPrivateChat", { classId: Number(classInfo.id), studentId: Number(studentId) });
      // optional: wait for joined event to mark done
      const onJoined = () => setLoadingJoin(false);
      socket.once("joinedPrivateChat", onJoined);
      setTimeout(() => socket.off("joinedPrivateChat", onJoined), 2000);
    },
    [socket, classInfo?.id]
  );

  const handleSelectStudent = useCallback(
    (student) => {
      setSelectedStudent(student);
      joinPrivateRoom(student.id);
      // mark unread → read for current partner
      handleMarkAsRead(student);
    },
    [joinPrivateRoom]
  );

  // ---- Student client auto-joins their room with class' teacher
  useEffect(() => {
    if (!socket || !classInfo?.id || currentUser?.role !== "student" || !currentUser?.id) return;
    joinPrivateRoom(currentUser.id);
  }, [socket, classInfo?.id, currentUser?.role, currentUser?.id, joinPrivateRoom]);

  // ---- Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewChat = (chat) => {
      setAllChatsInClass((prev) => [...prev, chat]);
    };

    const handleChatRevoked = (chat) => {
      setAllChatsInClass((prev) =>
        prev.map((c) => (c.id === chat.id ? chat : c))
      );
    };

    const handleMessagesRead = (data) => {
      // optional: update isRead locally if you want
      // e.g., set read for opposite sender in that room
    };

    socket.on("newPrivateChat", handleNewChat);
    socket.on("privateChatRevoked", handleChatRevoked);
    socket.on("privateMessagesRead", handleMessagesRead);

    return () => {
      socket.off("newPrivateChat", handleNewChat);
      socket.off("privateChatRevoked", handleChatRevoked);
      socket.off("privateMessagesRead", handleMessagesRead);
    };
  }, [socket]);

  // ---- Read counter (badge)
  useEffect(() => {
    if (currentUser.role === "student" && onUnreadCountChange) {
      const unread = allChatsInClass.filter(
        (c) => c.senderRole === "teacher" && !c.isRead && c.student?.id === currentUser.id
      ).length;
      onUnreadCountChange(unread);
    }
  }, [allChatsInClass, currentUser.role, currentUser.id, onUnreadCountChange]);

  // ---- Compute student list with last message (for teacher)
  const studentsWithLastMessage = useMemo(() => {
    if (currentUser.role !== "teacher" || !studentsInClass) return [];
    return studentsInClass
      .map((student) => {
        const related = allChatsInClass.filter(
          (c) => c.student?.id === student.id && c.teacher?.id === currentUser.id
        );
        const unreadCount = related.filter((c) => c.senderRole === "student" && !c.isRead).length;
        if (!related.length) return { ...student, lastMessage: null, unreadCount: 0 };
        const last = related.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        return {
          ...student,
          unreadCount,
          lastMessage: {
            text: last.message,
            time: last.createdAt,
            isMyLastMessage: last.senderRole === "teacher",
            imageUrl: last.imageUrl,
            audioUrl: last.audioUrl,
            isRevoked: last.isRevoked,
          },
        };
      })
      .sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.time) - new Date(a.lastMessage.time);
      });
  }, [studentsInClass, allChatsInClass, currentUser.id, currentUser.role]);

  // ---- Filter chat of current 1-1 pair
  const getFilteredChats = useCallback(
    (partner) => {
      if (!partner) return [];
      const studentId = currentUser.role === "student" ? currentUser.id : partner.id;
      const teacherId = currentUser.role === "teacher" ? currentUser.id : teacherOfClass?.id;
      return allChatsInClass.filter(
        (c) => c.student?.id === studentId && c.teacher?.id === teacherId
      );
    },
    [allChatsInClass, currentUser, teacherOfClass]
  );

  const teacherFilteredChats = useMemo(
    () => getFilteredChats(selectedStudent),
    [getFilteredChats, selectedStudent]
  );
  const studentFilteredChats = useMemo(
    () => getFilteredChats(teacherOfClass),
    [getFilteredChats, teacherOfClass]
  );

  // ---- Mark messages as read (REST + socket notify)
  const handleMarkAsRead = useCallback(
    async (partner) => {
      if (!partner || !classInfo || !currentUser) return;
      const readerRole = currentUser.role;
      const studentId = readerRole === "teacher" ? partner.id : currentUser.id;

      // local optimistic update
      setAllChatsInClass((prev) =>
        prev.map((c) => {
          const isOpposite = c.senderRole !== readerRole;
          const samePair =
            c.student?.id === studentId &&
            c.teacher?.id === (readerRole === "teacher" ? currentUser.id : teacherOfClass?.id);
          if (isOpposite && samePair) return { ...c, isRead: true };
          return c;
        })
      );

      try {
        await chatService.markMessagesAsRead(classInfo.id, studentId, readerRole);
        socket?.emit("markPrivateRead", {
          classId: Number(classInfo.id),
          studentId: Number(studentId),
          readerRole,
        });
      } catch (err) {
        // ignore soft failures
      }
    },
    [classInfo, currentUser, teacherOfClass, socket]
  );

  // ---- Send chat (via socket)
  const sendChatSocket = useCallback(
    (payload) => {
      if (!socket) return;
      socket.emit("sendPrivateChat", payload);
    },
    [socket]
  );

  // ---- Upload & send image
  const handleImageUpload = useCallback(
    async (file) => {
      try {
        const chatPartner =
          currentUser.role === "teacher" ? selectedStudent : teacherOfClass;
        if (!file || !chatPartner || !classInfo?.id) return;
        const uploadedImageUrl = await fileService.upload(file, `chat-image-${Date.now()}`);
        const dto = {
          classId: Number(classInfo.id),
          studentId: Number(
            currentUser.role === "student" ? currentUser.id : chatPartner.id
          ),
          teacherId: Number(
            currentUser.role === "teacher" ? currentUser.id : teacherOfClass?.id
          ),
          senderRole: currentUser.role,
          message: "",
          imageUrl: uploadedImageUrl,
        };
        sendChatSocket(dto);
      } catch (err) {
        antdMessage.error("Gửi ảnh thất bại!");
      }
    },
    [currentUser, selectedStudent, teacherOfClass, classInfo?.id, sendChatSocket]
  );

  // ---- Revoke message
  const handleRevokeMessage = useCallback(
    async (chatId) => {
      try {
        // local soft update
        setAllChatsInClass((prev) =>
          prev.map((c) =>
            c.id === chatId ? { ...c, isRevoked: true, message: null, imageUrl: null, audioUrl: null } : c
          )
        );
        // Also let backend broadcast via socket
        // Need classId & studentId for room routing
        const target = allChatsInClass.find((c) => c.id === chatId);
        if (!target) return;
        const cls = Number(target.class?.id || classInfo.id);
        const studentId = Number(target.student?.id);
        socket?.emit("revokePrivateChat", {
          chatId: Number(chatId),
          classId: cls,
          studentId,
        });
        // Persist via REST if you want to ensure DB state (optional if gateway already flips isRevoked)
        await chatService.revokeChat(chatId, true);
      } catch (err) {
        antdMessage.error("Thu hồi thất bại.");
      }
    },
    [allChatsInClass, socket, classInfo?.id]
  );

  // ---- Toggle record (audio + transcript)
  const handleToggleRecord = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      if (listening) stop();
      setIsRecording(false);
    } else {
      if (!supported) {
        antdMessage.error("Trình duyệt không hỗ trợ nhận dạng giọng nói.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);

        mediaRecorderRef.current.onstop = async () => {
          const chatPartner =
            currentUser.role === "teacher" ? selectedStudent : teacherOfClass;
          if (!chatPartner || !classInfo?.id) return;
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const transcript = (liveTranscriptRef.current || "").trim();
          try {
            const uploadedAudioUrl = await fileService.upload(
              audioBlob,
              `chat-audio-${Date.now()}.webm`
            );
            const dto = {
              classId: Number(classInfo.id),
              studentId: Number(
                currentUser.role === "student" ? currentUser.id : chatPartner.id
              ),
              teacherId: Number(
                currentUser.role === "teacher" ? currentUser.id : teacherOfClass?.id
              ),
              senderRole: currentUser.role,
              message: transcript,
              audioUrl: uploadedAudioUrl,
            };
            sendChatSocket(dto);
          } catch (_) {
            antdMessage.error("Gửi ghi âm thất bại!");
          } finally {
            stream.getTracks().forEach((t) => t.stop());
          }
        };

        mediaRecorderRef.current.start();
        listen({ lang: "en-AU", interimResults: false });
        setIsRecording(true);
        setLiveTranscript("");
      } catch (err) {
        antdMessage.error("Không thể truy cập micro. Vui lòng cấp quyền.");
      }
    }
  }, [
    isRecording,
    listening,
    listen,
    stop,
    supported,
    currentUser,
    selectedStudent,
    teacherOfClass,
    classInfo?.id,
    sendChatSocket,
  ]);

  // ---- Mark read when student opens teacher chat first time / refresh
  useEffect(() => {
    if (currentUser.role === "student" && teacherOfClass) {
      handleMarkAsRead(teacherOfClass);
    }
  }, [currentUser.role, teacherOfClass, handleMarkAsRead, allChatsInClass]);

  // ---- Derived renders
  const teacherMain = selectedStudent ? (
    <ChatInterface
      chatPartner={selectedStudent}
      chats={teacherFilteredChats}
      currentUserRole={currentUser.role}
      isMobile={isMobile}
      loading={loading || loadingJoin}
      error={error}
      onGoBack={() => setSelectedStudent(null)}
      chatContentRef={chatContentRef}
      isRecording={isRecording}
      onToggleRecord={handleToggleRecord}
      liveTranscript={liveTranscript}
      onImageUpload={handleImageUpload}
      onRevokeMessage={handleRevokeMessage}
    />
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
      <Empty description="Chọn một học sinh để bắt đầu Chit Chat" />
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (currentUser.role === "teacher") {
    if (isMobile) {
      return selectedStudent ? (
        teacherMain
      ) : (
        <StudentListSider
          students={studentsWithLastMessage}
          selectedStudent={selectedStudent}
          onSelectStudent={handleSelectStudent}
        />
      );
    }
    return (
      <Layout style={{ height: "100vh", background: colors.white }}>
        <Sider width={320} theme="light" style={{ borderRight: `1px solid ${colors.gray}` }}>
          <StudentListSider
            students={studentsWithLastMessage}
            selectedStudent={selectedStudent}
            onSelectStudent={handleSelectStudent}
          />
        </Sider>
        <Content>{teacherMain}</Content>
      </Layout>
    );
  }

  if (currentUser.role === "student") {
    if (!teacherOfClass) {
      return (
        <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <Empty description="Lớp học của bạn hiện chưa có giáo viên." />
        </div>
      );
    }
    return (
      <Layout style={{ height: "100vh" }}>
        <ChatInterface
          chatPartner={teacherOfClass}
          chats={studentFilteredChats}
          currentUserRole={currentUser.role}
          isMobile={isMobile}
          loading={loading || loadingJoin}
          error={error}
          onGoBack={null}
          chatContentRef={chatContentRef}
          isRecording={isRecording}
          onToggleRecord={handleToggleRecord}
          liveTranscript={liveTranscript}
          onImageUpload={handleImageUpload}
          onRevokeMessage={handleRevokeMessage}
        />
      </Layout>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
      <Spin size="large" />
    </div>
  );
};

ChatContainer.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    role: PropTypes.oneOf(["student", "teacher"]).isRequired,
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
  }),
  isMobile: PropTypes.bool.isRequired,
  onUnreadCountChange: PropTypes.func,
};

ChatContainer.defaultProps = {
  studentsInClass: [],
  teacherOfClass: null,
  classInfo: null,
  onUnreadCountChange: () => {},
};

export default ChatContainer;
