import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Typography,
} from "antd";
import {
  CopyOutlined,
  IdcardOutlined,
  ReadOutlined,
  SaveOutlined,
  SendOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import { colors } from "assets/theme/color";
import axios from "axios";
import lessonService from "services/lessonService";
import TextArea from "antd/es/input/TextArea";
import homeWorkService from "services/homeWorkService";
import HomeWorkBySchedule from "./HomeWorkBySchedule";
import lessonByScheduleService from "services/lessonByScheduleService";
import notificationService from "services/notificationService";
import user_notificationService from "services/user_notificationService";
import classService from "services/classService";
import { BookOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Text } = Typography;
const { Option } = Select;
export default function CreateHomeWork({
  toolbar,
  quillFormats,
  levels,
  isMobile,
  loadingCreateHomeWork,
  setLoadingCreateHomeWork,
  teacherId,
  loadingTTSHomeWork,
  setLoadingTTSHomeWork,
  level,
  lessonByScheduleData,
  daysOfWeek,
  homeWorksData,
  setLessonByScheduleData,
  classID,
  students,
}) {
  const [form] = Form.useForm();
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [showAccessId, setShowAccessId] = useState(false);
  const [accessId, setAccessId] = useState("");
  const [loadingClass, setLoadingClass] = useState(false);
  const homeworkLink = "https://happyclass.com.vn/do-homework";
  const [copySuccess, setCopySuccess] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(homeworkLink).then(() => {
      setCopySuccess(true);
      message.success("Copied to clipboard!"); // Hiển thị thông báo

      // Reset hiệu ứng sau 2 giây
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      setQuill(editor);
    }
  }, [quillRef]);
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      // console.log([...formData]);

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );
        console.log(response.data.url);

        // const result = await response.json();

        if (response.status === 201 && quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, "image", response.data.url);
        } else {
          message.error("Upload failed. Try again!");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error("Upload error. Please try again!");
      }
    };
  }, []);

  const modules = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandler,
      },
    },
  };
  const handleSubmit = async (values) => {
    try {
      setLoadingCreateHomeWork(true);

      // Tạo FormData
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("level", level);
      formData.append("linkYoutube", values.linkYoutube);
      formData.append("linkGame", values.linkGame);
      formData.append("linkZalo", values.linkZalo);
      formData.append("description", values.description);
      formData.append("teacherId", teacherId);
      if (selected.size > 0) {
        formData.append("status", 1);
      }

      // Nếu có mp3Url thì fetch dữ liệu và append vào formData
      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }

      const homeworkData = await homeWorkService.createHomeWork(formData);
      let detailStr = "Bạn mới có bài tập mới vào ngày:";
      for (const item of selected) {
        const data = await lessonByScheduleService.updateHomeWorkLessonBySchedule(
          item,
          homeworkData.id
        );
        detailStr += " " + data.date.toString();
      }
      const notificationData = {
        title: "Bài tập mới",
        general: false,
        classID: classID,
        detail: detailStr,
        createdAt: new Date(),
      };
      const notificationRes = await notificationService.createNotification(notificationData);
      const userNotificationCreate = students.forEach(async (element) => {
        const userNotificationData = {
          status: false,
          notificationID: notificationRes.id,
          studentID: element.id,
        };
        const userNotificationRes = await user_notificationService.createUserNotification(
          userNotificationData
        );
      });
      message.success("Homework created successfully!");
      form.resetFields();
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
    } catch (err) {
      message.error("Failed to create lesson. Please try again.");
    } finally {
      setLoadingCreateHomeWork(false);
    }
  };
  const handleLoadLessonContent = async () => {
    const today = new Date(); // Lấy ngày hiện tại thực tế
    const todayString = today.toISOString().split("T")[0]; // Định dạng YYYY-MM-DD

    // Tìm bài học của ngày hôm nay từ lessonByScheduleData
    const todayLesson = lessonByScheduleData.find(
      (lesson) => lesson.date === todayString && lesson.lessonID
    );

    if (todayLesson && todayLesson.lessonID) {
      try {
        // Gọi API để lấy thông tin lesson từ lessonID
        const lessonData = await lessonService.getLessonById(todayLesson.lessonID);

        if (lessonData && lessonData.name) {
          // Cập nhật các field trong Form
          form.setFieldsValue({
            title: lessonData.name, // Điền name của lesson vào field title
            linkYoutube: lessonData.linkYoutube || "", // Điền linkYoutube (nếu có) vào field linkYoutube
            description: lessonData.description || "", // Điền description (nếu có) vào field description
          });

          // Cập nhật nội dung description vào ReactQuill
          if (lessonData.description && quill) {
            quill.setContents([]); // Xóa nội dung hiện tại
            quill.clipboard.dangerouslyPasteHTML(lessonData.description); // Chèn description vào ReactQuill
          } else if (lessonData.content && quill) {
            // Nếu không có description nhưng có content, dùng content làm fallback
            quill.setContents([]);
            quill.clipboard.dangerouslyPasteHTML(lessonData.content);
          }

          message.success("Đã tải nội dung bài học hôm nay!");
        } else {
          message.warning("Không tìm thấy thông tin bài học.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin lesson:", error);
        message.error("Không thể tải thông tin bài học. Vui lòng thử lại.");
      }
    } else {
      message.warning("Không tìm thấy bài học cho ngày hôm nay.");
    }
  };
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTSHomeWork(true);

    try {
      const response = await homeWorkService.textToSpeech(textToSpeech);

      let base64String = response;
      // console.log(response);

      // base64String = btoa(
      //   new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
      // );
      // console.log(base64String);

      // Bước 2: Chuyển Base64 về mảng nhị phân (binary)
      function base64ToBlob(base64, mimeType) {
        let byteCharacters = atob(base64); // Giải mã base64
        let byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
      }

      // Bước 3: Tạo URL từ Blob và truyền vào thẻ <audio>
      let audioBlob = base64ToBlob(base64String, "audio/mp3"); // Hoặc "audio/wav"
      setMp3file(audioBlob);
      console.log(audioBlob);

      // if (mp3Url) {
      //   const audioElement = document.getElementById("audio-player");
      //   if (audioElement) {
      //     audioElement.src = ""; // Xóa src trước khi revoke
      //     audioElement.load(); // Yêu cầu cập nhật
      //   }
      //   URL.revokeObjectURL(mp3Url);
      // }
      // console.log("mémaeseaseas");

      let audioUrl = URL.createObjectURL(audioBlob);
      setMp3Url(audioUrl);
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTSHomeWork(false);
  };
  // console.log(mp3Url);
  useEffect(() => {
    if (mp3Url) {
      // console.log("🔄 Cập nhật audio URL:", mp3Url);
      const audioElement = document.getElementById("audio-player");
      if (audioElement) {
        audioElement.src = ""; // Xóa src để tránh giữ URL cũ
        audioElement.load(); // Tải lại audio
        audioElement.src = mp3Url;
      }
    }
  }, [mp3Url]);
  useEffect(() => {
    const fetchClass = async () => {
      try {
        setLoadingClass(true);
        const data = await classService.getClassById(classID);
        setAccessId(data.accessId);
      } catch (err) {
        setAccessId(err);
      } finally {
        setLoadingClass(false);
      }
    };
    fetchClass();
  }, [classID]);
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "10px",
        maxHeight: "60vh",
        overflow: "auto",
      }}
    >
      <div style={{ maxHeight: "50vh", overflow: "auto", width: isMobile ? "100%" : "60%" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 12px " + colors.softShadow,
            background: colors.white,
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <div style={{ marginBottom: isMobile ? "" : "14px" }}>
            {/* <Button
                          icon={<ArrowLeftOutlined />}
                          onClick={() => navigate("/teacherpage/manageLessons")}
                          style={{
                            border: "none",
                            boxShadow: "none",
                            paddingLeft: 0,
                            color: colors.deepGreen,
                          }}
                        >
                          Back to Lessons
                        </Button> */}
            <Title level={3} style={{ margin: "16px 0", color: colors.darkGreen }}>
              Tạo bài tập
            </Title>
            <Divider style={{ borderColor: colors.paleGreen }} />
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              title: "",
              level: "",
              linkYoutube: "",
              linkGame: "",
              linkZalo: "",
              description: "",
            }}
          >
            <Form.Item>
              <Button
                type="default"
                icon={<BookOutlined />}
                onClick={handleLoadLessonContent}
                style={{
                  backgroundColor: colors.deepGreen,
                  borderColor: colors.deepGreen,
                  color: colors.white,
                }}
              >
                Nội dung bài học
              </Button>
            </Form.Item>

            <Form.Item
              name="title"
              label="Tiêu đề bài tập"
              rules={[
                { required: true, message: "Please enter the homework name" },
                { max: 100, message: "Title cannot be longer than 100 characters" },
              ]}
            >
              <Input
                placeholder="Nhập tiêu đề bài tập"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item>

            {/* <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: "Please select a level" }]}
          >
            <Select
              placeholder="Select level"
              style={{
                borderRadius: "6px",
              }}
            >
              {levels?.map((level, index) => (
                <Option key={index} value={level.id}>
                  {level.name}
                </Option>
              ))}
            </Select>
          </Form.Item> */}

            <Form.Item label="Văn bản thành giọng nói">
              <TextArea
                value={textToSpeech}
                onChange={(e) => setTextToSpeech(e.target.value)}
                rows={3}
                placeholder="Nhập văn bản để chuyển thành giọng nói"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                onClick={handleConvertToSpeech}
                loading={loadingTTSHomeWork}
                style={{
                  backgroundColor: colors.deepGreen,
                  borderColor: colors.deepGreen,
                }}
              >
                Chuyển thành giọng nói
              </Button>
            </Form.Item>
            {mp3Url && (
              <Form.Item>
                <div style={{ marginBottom: "16px" }}>
                  <audio id="audio-player" controls style={{ width: "100%" }}>
                    <source src={mp3Url} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </Form.Item>
            )}
            {/* <div style={{ marginBottom: "16px" }}>
            <audio controls style={{ width: "100%" }}>
              <source
                src={
                  "https://res.cloudinary.com/ddd1hxsx0/video/upload/v1742718873/o7o1ouv3el4w72s4rxnc.mp3"
                }
                type="audio/mp3"
              />
              Your browser does not support the audio element.
            </audio>
          </div> */}
            <Form.Item
              name="linkYoutube"
              label="Link Youtube bài tập"
              rules={[{ required: true, message: "Please enter the homework link" }]}
            >
              <Input
                placeholder="Nhập link youtube bài tập"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item>
            <Form.Item name="linkGame" label="Link game bài tập">
              <Input
                placeholder="Nhập link game bài tập"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item>
            <Form.Item name="linkZalo" label="Link Zalo bài tập">
              <Input
                placeholder="Nhập link zalo bài tập"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Please enter a description" }]}
            >
              <ReactQuill
                theme="snow"
                modules={modules}
                formats={quillFormats}
                ref={quillRef}
                style={{
                  height: "250px",
                  marginBottom: "60px", // Consider reducing this
                  borderRadius: "6px",
                  border: `1px solid ${colors.inputBorder}`,
                }}
              />
            </Form.Item>
          </Form>
        </Card>
      </div>
      {isMobile && (
        <>
          <Button
            type="primary"
            htmlType="submit"
            loading={loadingCreateHomeWork}
            icon={<SaveOutlined />}
            style={{
              borderRadius: "6px",
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              boxShadow: "0 2px 0 " + colors.softShadow,
            }}
            onClick={() => {
              form.submit();
            }}
          >
            Lưu
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            // loading={loadingCreateHomeWork}
            icon={<SendOutlined />}
            style={{
              borderRadius: "6px",
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              boxShadow: "0 2px 0 " + colors.softShadow,
            }}
            onClick={() => {
              setShowAccessId(true);
            }}
          >
            Gửi link
          </Button>
        </>
      )}
      <div
        style={{
          maxHeight: "50vh",
          overflow: "auto",
          width: isMobile ? "100%" : "39%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <HomeWorkBySchedule
          lessonByScheduleData={lessonByScheduleData}
          daysOfWeek={daysOfWeek}
          homeWorksData={homeWorksData}
          setLessonByScheduleData={setLessonByScheduleData}
          isMobile={isMobile}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "right", width: "100%", gap: "10px" }}>
        {!isMobile && (
          <>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingCreateHomeWork}
              icon={<SaveOutlined />}
              style={{
                borderRadius: "6px",
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                boxShadow: "0 2px 0 " + colors.softShadow,
              }}
              onClick={() => {
                form.submit();
              }}
            >
              Lưu
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingClass}
              icon={<SendOutlined />}
              style={{
                borderRadius: "6px",
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                boxShadow: "0 2px 0 " + colors.softShadow,
              }}
              onClick={() => {
                setShowAccessId(true);
              }}
            >
              Gửi link
            </Button>
          </>
        )}
      </div>
      <Modal
        open={showAccessId}
        onCancel={() => setShowAccessId(false)}
        onClose={() => setShowAccessId(false)}
        footer={<></>}
      >
        {loadingClass ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin />
          </div>
        ) : (
          <Card style={{ maxWidth: "90%", margin: "auto", textAlign: "center" }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <ReadOutlined style={{ fontSize: 32, color: "#1890ff" }} />
              <Text strong style={{ fontSize: 16 }}>
                Mã lớp của bạn là: <Text type="danger">{accessId}</Text>
              </Text>
              <Input value={homeworkLink} readOnly style={{ textAlign: "center", width: "100%" }} />

              {/* Nút Copy với hiệu ứng */}
              <Button
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
                type={copySuccess ? "default" : "primary"}
              >
                {copySuccess ? "Copied!" : "Copy Link bài tập"}
              </Button>
            </Space>
          </Card>
        )}
      </Modal>
    </div>
  );
}
CreateHomeWork.propTypes = {
  toolbar: PropTypes.array.isRequired,
  quillFormats: PropTypes.array.isRequired,
  levels: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  loadingCreateHomeWork: PropTypes.bool.isRequired,
  setLoadingCreateHomeWork: PropTypes.func.isRequired,
  teacherId: PropTypes.number.isRequired,
  loadingTTSHomeWork: PropTypes.bool.isRequired,
  setLoadingTTSHomeWork: PropTypes.func.isRequired,
  lessonByScheduleData: PropTypes.array.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  homeWorksData: PropTypes.array.isRequired,
  setLessonByScheduleData: PropTypes.func.isRequired,
  level: PropTypes.number.isRequired,
  classID: PropTypes.number.isRequired, // Giả sử level là string
  students: PropTypes.array.isRequired, // Giả sử level là string
};
