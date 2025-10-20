import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Typography,
  Input,
  Button,
  Upload,
  message,
  Select,
  Card,
  Spin,
  Tooltip,
  Modal,
  Tag, // 🆕
} from "antd";
import {
  FileImageOutlined,
  AudioOutlined,
  StopOutlined,
  SendOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useSpeechRecognition } from "react-speech-kit";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

export default function ChatTopicComponent({ userRole, classId, teacherId }) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [latestTopic, setLatestTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const { listen, stop } = useSpeechRecognition({
    onResult: (result) => {
      setTopic((prev) => (prev ? prev + " " : "") + result);
    },
  });

  // === Fetch latest topic ===
  const fetchLatestTopic = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/chat-topic/latest/${classId}`);
      setLatestTopic(res.data.topic);
    } catch {
      setLatestTopic(null);
    }
  };

  useEffect(() => {
    if (classId) fetchLatestTopic();
  }, [classId]);

  // === Upload file ===
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    return res.data.url;
  };

  // === Record audio ===
  const handleToggleRecord = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);

        try {
          const uploadedUrl = await uploadFile(
            new File([audioBlob], `topic-audio-${Date.now()}.webm`, { type: "audio/webm" })
          );
          setAudioUrl(uploadedUrl);
          message.success("Âm thanh đã được tải lên!");
        } catch {
          message.error("Không thể tải âm thanh lên.");
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      listen({ lang: "vi-VN" });
      setRecording(true);
      message.info("🎙️ Bắt đầu ghi âm...");
    } catch (err) {
      console.error(err);
      message.error("Không thể truy cập micro.");
    }
  };

  // === Create new topic ===
  const handleCreateTopic = async () => {
    if (!topic.trim()) {
      message.warning("Vui lòng nhập hoặc nói chủ đề!");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      if (imageFile) imageUrl = await uploadFile(imageFile);

      const payload = {
        title: topic,
        classId: Number(classId),
        teacherId: Number(teacherId),
        level,
        active: true,
        image: imageUrl,
        audioUrl,
      };

      const res = await axios.post(`${API_BASE_URL}/chat-topic/create`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      message.success("Tạo chủ đề thành công!");
      setTopic("");
      setImageFile(null);
      setImagePreview(null);
      setAudioUrl(null);
      setLatestTopic(res.data.topic);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Không thể tạo chủ đề!");
    } finally {
      setLoading(false);
    }
  };

  // === Deactivate topic ===
  const handleDeactivateTopic = async () => {
    try {
      setLoading(true);
      await axios.patch(
        `${API_BASE_URL}/chat-topic/deactivate/${latestTopic.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      message.success("Đã tắt chủ đề thành công!");
      setConfirmVisible(false);
      fetchLatestTopic();
    } catch (err) {
      console.error(err);
      message.error("Không thể tắt chủ đề!");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = ({ file }) => {
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  // 🆕 Helper: render topic status
  const renderStatusTag = (isActive) =>
    isActive ? (
      <Tag color="green" style={{ marginLeft: 8 }}>
        🟢 Đang hoạt động
      </Tag>
    ) : (
      <Tag color="gray" style={{ marginLeft: 8 }}>
        ⚪ Đã tắt
      </Tag>
    );

  return (
    <Layout style={{ height: "100%", backgroundColor: "#fff" }}>
      <header
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #ddd",
          backgroundColor: "#fafafa",
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          🎯 Chủ đề trò chuyện AI lớp học
        </Title>
      </header>

      <Content style={{ padding: "16px" }}>
        {userRole === "teacher" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input.TextArea
              rows={3}
              placeholder="Nhập hoặc nói chủ đề..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

            <Select
              value={level}
              onChange={setLevel}
              style={{ width: 200 }}
              options={[
                { value: "Beginner", label: "Beginner" },
                { value: "Intermediate", label: "Intermediate" },
                { value: "Advanced", label: "Advanced" },
              ]}
            />

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Upload
                beforeUpload={(file) => {
                  handleImageUpload({ file });
                  return false;
                }}
                showUploadList={false}
              >
                <Button icon={<FileImageOutlined />}>
                  {imageFile ? "Đã chọn ảnh" : "Thêm hình ảnh"}
                </Button>
              </Upload>

              <Tooltip title={recording ? "Dừng ghi âm" : "Ghi âm chủ đề"}>
                <Button
                  type={recording ? "primary" : "default"}
                  danger={recording}
                  icon={recording ? <StopOutlined /> : <AudioOutlined />}
                  onClick={handleToggleRecord}
                >
                  {recording ? "Đang ghi..." : "Ghi âm"}
                </Button>
              </Tooltip>
            </div>

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: 250,
                  borderRadius: 8,
                  marginTop: 10,
                  border: "1px solid #ddd",
                }}
              />
            )}
            {audioUrl && <audio controls src={audioUrl} style={{ marginTop: 10, width: 250 }} />}

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleCreateTopic}
              loading={loading}
              style={{ width: "fit-content", marginTop: 8 }}
            >
              Tạo chủ đề
            </Button>

            {latestTopic && (
              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>Chủ đề gần nhất</span>
                    {renderStatusTag(latestTopic.active)} {/* 🆕 status tag */}
                  </div>
                }
                bordered
                style={{
                  marginTop: 20,
                  backgroundColor: latestTopic.active ? "#fafafa" : "#f5f5f5", // 🆕 dim if inactive
                  opacity: latestTopic.active ? 1 : 0.7,
                }}
                extra={
                  <Button
                    danger
                    disabled={!latestTopic.active} // 🆕 disable when inactive
                    icon={<PoweroffOutlined />}
                    onClick={() => setConfirmVisible(true)}
                  >
                    Tắt chủ đề
                  </Button>
                }
              >
                <Text strong>{latestTopic.title}</Text>
                <br />
                <Text type="secondary">
                  Ngày tạo: {new Date(latestTopic.createdAt).toLocaleString("vi-VN")}
                </Text>
              </Card>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            {loading ? (
              <Spin />
            ) : latestTopic ? (
              <Card title="Chủ đề hiện tại" bordered style={{ width: 400, margin: "0 auto" }}>
                <Text strong>{latestTopic.title}</Text>
                {renderStatusTag(latestTopic.active)} {/* 🆕 visible to student too */}
                {latestTopic.imageUrl && (
                  <img
                    src={latestTopic.imageUrl}
                    alt="topic"
                    style={{
                      marginTop: 10,
                      borderRadius: 6,
                      width: "100%",
                      maxHeight: 250,
                      objectFit: "cover",
                    }}
                  />
                )}
                {latestTopic.audioUrl && (
                  <audio
                    controls
                    src={latestTopic.audioUrl}
                    style={{ marginTop: 10, width: "100%" }}
                  />
                )}
              </Card>
            ) : (
              <Text type="secondary">Chưa có chủ đề nào được tạo.</Text>
            )}
          </div>
        )}
      </Content>

      <Modal
        title="Tắt chủ đề"
        open={confirmVisible}
        onOk={handleDeactivateTopic}
        onCancel={() => setConfirmVisible(false)}
        okText="Đồng ý"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <p>Bạn có chắc chắn muốn tắt chủ đề này không?</p>
      </Modal>
    </Layout>
  );
}
