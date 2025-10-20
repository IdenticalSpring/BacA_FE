import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layout, Empty, Spin, message as antdMessage } from "antd";
import PropTypes from "prop-types";
import { useSpeechRecognition } from "react-speech-kit";

import ChatInterface from "./ChatInterface";
import ChatGroupComponent from "./ChatGroupComponent";
import { colors } from "pages/teachers/teacherPage";

import chatService from "services/chatService";
import fileService from "services/fileService";
import messageService from "services/messageService";
import { createSocket, disconnectSocket } from "services/socket";
import StudentListSider from "./StudentListSlider";

const { Sider, Content } = Layout;

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
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [allChatsInClass, setAllChatsInClass] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [error, setError] = useState(null);
  const chatContentRef = useRef(null);

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
    const s = createSocket();
    setSocket(s);
    return () => {
      disconnectSocket(s);
      setSocket(null);
    };
  }, [classInfo?.id]);

  // ---- Load private chats
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
  }, [fetchAllChats]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [allChatsInClass, selectedStudent]);

  // ---- Join private room
  const joinPrivateRoom = useCallback(
    (studentId) => {
      if (!socket || !classInfo?.id || !studentId) return;
      setLoadingJoin(true);
      socket.emit("joinPrivateChat", {
        classId: Number(classInfo.id),
        studentId: Number(studentId),
      });
      const onJoined = () => setLoadingJoin(false);
      socket.once("joinedPrivateChat", onJoined);
      setTimeout(() => socket.off("joinedPrivateChat", onJoined), 2000);
    },
    [socket, classInfo?.id]
  );

  const handleSelectStudent = useCallback(
    (student) => {
      setIsGroupChat(false);
      setSelectedStudent(student);
      joinPrivateRoom(student.id);
      handleMarkAsRead(student);
    },
    [joinPrivateRoom]
  );

  // ---- Group Chat Select
  const handleSelectGroupChat = useCallback(() => {
    setIsGroupChat(true);
    setSelectedStudent({ id: "group", name: "Class Group Chat" });
    setLoadingGroup(true);
    messageService
      .getMessagesForClass(classInfo.id)
      .then((msgs) => setGroupMessages(msgs || []))
      .catch(() => setGroupMessages([]))
      .finally(() => setLoadingGroup(false));
  }, [classInfo?.id]);

  // ---- Auto join for student
  useEffect(() => {
    if (!socket || !classInfo?.id || currentUser?.role !== "student" || !currentUser?.id) return;
    joinPrivateRoom(currentUser.id);
  }, [socket, classInfo?.id, currentUser?.role, currentUser?.id, joinPrivateRoom]);

  // ---- Socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewChat = (chat) => setAllChatsInClass((prev) => [...prev, chat]);
    const handleChatRevoked = (chat) =>
      setAllChatsInClass((prev) => prev.map((c) => (c.id === chat.id ? chat : c)));

    socket.on("newPrivateChat", handleNewChat);
    socket.on("privateChatRevoked", handleChatRevoked);

    return () => {
      socket.off("newPrivateChat", handleNewChat);
      socket.off("privateChatRevoked", handleChatRevoked);
    };
  }, [socket]);

  // ---- Unread count
  useEffect(() => {
    if (currentUser.role === "student" && onUnreadCountChange) {
      const unread = allChatsInClass.filter(
        (c) => c.senderRole === "teacher" && !c.isRead && c.student?.id === currentUser.id
      ).length;
      onUnreadCountChange(unread);
    }
  }, [allChatsInClass, currentUser.role, currentUser.id, onUnreadCountChange]);

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

  const handleMarkAsRead = useCallback(
    async (partner) => {
      if (!partner || !classInfo || !currentUser) return;
      const readerRole = currentUser.role;
      const studentId = readerRole === "teacher" ? partner.id : currentUser.id;

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
      } catch {}
    },
    [classInfo, currentUser, teacherOfClass, socket]
  );

  const sendChatSocket = useCallback(
    (payload) => {
      if (!socket) return;
      socket.emit("sendPrivateChat", payload);
    },
    [socket]
  );

  const handleImageUpload = useCallback(
    async (file) => {
      try {
        const chatPartner = currentUser.role === "teacher" ? selectedStudent : teacherOfClass;
        if (!file || !chatPartner || !classInfo?.id) return;
        const uploadedImageUrl = await fileService.upload(file, `chat-image-${Date.now()}`);
        const dto = {
          classId: Number(classInfo.id),
          studentId: Number(currentUser.role === "student" ? currentUser.id : chatPartner.id),
          teacherId: Number(currentUser.role === "teacher" ? currentUser.id : teacherOfClass?.id),
          senderRole: currentUser.role,
          message: "",
          imageUrl: uploadedImageUrl,
        };
        sendChatSocket(dto);
      } catch {
        antdMessage.error("Gửi ảnh thất bại!");
      }
    },
    [currentUser, selectedStudent, teacherOfClass, classInfo?.id, sendChatSocket]
  );

  const handleRevokeMessage = useCallback(
    async (chatId) => {
      try {
        setAllChatsInClass((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? { ...c, isRevoked: true, message: null, imageUrl: null, audioUrl: null }
              : c
          )
        );
        const target = allChatsInClass.find((c) => c.id === chatId);
        if (!target) return;
        const cls = Number(target.class?.id || classInfo.id);
        const studentId = Number(target.student?.id);
        socket?.emit("revokePrivateChat", {
          chatId: Number(chatId),
          classId: cls,
          studentId,
        });
        await chatService.revokeChat(chatId, true);
      } catch {
        antdMessage.error("Thu hồi thất bại.");
      }
    },
    [allChatsInClass, socket, classInfo?.id]
  );

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
          const chatPartner = currentUser.role === "teacher" ? selectedStudent : teacherOfClass;
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
              studentId: Number(currentUser.role === "student" ? currentUser.id : chatPartner.id),
              teacherId: Number(
                currentUser.role === "teacher" ? currentUser.id : teacherOfClass?.id
              ),
              senderRole: currentUser.role,
              message: transcript,
              audioUrl: uploadedAudioUrl,
            };
            sendChatSocket(dto);
          } catch {
            antdMessage.error("Gửi ghi âm thất bại!");
          } finally {
            stream.getTracks().forEach((t) => t.stop());
          }
        };

        mediaRecorderRef.current.start();
        listen({ lang: "en-AU", interimResults: false });
        setIsRecording(true);
        setLiveTranscript("");
      } catch {
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

  const teacherMain = isGroupChat ? (
    <ChatGroupComponent
      currentUser={currentUser}
      classInfo={classInfo}
      socket={socket}
      messages={groupMessages}
      setMessages={setGroupMessages}
      loading={loadingGroup}
    />
  ) : selectedStudent ? (
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
    <Empty description="Chọn một cuộc trò chuyện để bắt đầu" />
  );

  if (loading)
    return (
      <div
        style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}
      >
        <Spin size="large" />
      </div>
    );

  return (
    <Layout style={{ height: "100vh", background: colors.white }}>
      <Sider width={320} theme="light" style={{ borderRight: `1px solid ${colors.gray}` }}>
        <StudentListSider
          students={studentsInClass}
          selectedStudent={selectedStudent}
          onSelectStudent={handleSelectStudent}
          onSelectGroupChat={handleSelectGroupChat}
        />
      </Sider>
      <Content>
        {isGroupChat ? (
          <ChatGroupComponent
            currentUser={currentUser}
            classInfo={classInfo}
            socket={socket}
            messages={groupMessages}
            setMessages={setGroupMessages}
            loading={loadingGroup}
          />
        ) : currentUser.role === "teacher" ? (
          teacherMain
        ) : (
          <ChatInterface
            chatPartner={teacherOfClass}
            chats={studentFilteredChats}
            currentUserRole={currentUser.role}
            isMobile={isMobile}
            loading={loading || loadingJoin}
            error={error}
            chatContentRef={chatContentRef}
            isRecording={isRecording}
            onToggleRecord={handleToggleRecord}
            liveTranscript={liveTranscript}
            onImageUpload={handleImageUpload}
            onRevokeMessage={handleRevokeMessage}
          />
        )}
      </Content>
    </Layout>
  );
};

ChatContainer.propTypes = {
  currentUser: PropTypes.object.isRequired,
  classInfo: PropTypes.object,
  studentsInClass: PropTypes.array,
  teacherOfClass: PropTypes.object,
  isMobile: PropTypes.bool.isRequired,
  onUnreadCountChange: PropTypes.func,
};

export default ChatContainer;
