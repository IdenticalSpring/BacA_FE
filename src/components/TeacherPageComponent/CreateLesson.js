import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Typography,
} from "antd";
import { SaveOutlined, RobotOutlined, SendOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import { colors } from "assets/theme/color";
import axios from "axios";
import lessonService from "services/lessonService";
import LessonBySchedule from "./LessonBySchedule";
import lessonByScheduleService from "services/lessonByScheduleService";
import TextArea from "antd/es/input/TextArea";
import homeWorkService from "services/homeWorkService";
import notificationService from "services/notificationService";
import user_notificationService from "services/user_notificationService";

const { Title } = Typography;
const { Option } = Select;
const { Text } = Typography;
const genderOptions = [
  { label: "Giọng nam", value: 1 },
  { label: "Giọng nữ", value: 0 },
];

export default function CreateLesson({
  toolbar,
  quillFormats,
  levels,
  isMobile,
  loadingCreateLesson,
  setLoadingCreateLesson,
  teacherId,
  lessonByScheduleData,
  daysOfWeek,
  lessonsData,
  setLessonByScheduleData,
  loadingTTSLesson,
  setLoadingTTSLesson,
  level,
  classID,
  students,
  lessons,
  setLessons,
}) {
  const [form] = Form.useForm();
  const quillRefDescription = useRef(null); // Ref cho description
  const quillRefLessonPlan = useRef(null); // Ref cho lessonPlan
  const [quillDescription, setQuillDescription] = useState(null); // Quill instance cho description
  const [quillLessonPlan, setQuillLessonPlan] = useState(null); // Quill instance cho lessonPlan
  const [selected, setSelected] = useState(new Set());
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingEnhanceDescription, setLoadingEnhanceDescription] = useState(false); // Loading cho description
  const [loadingEnhanceLessonPlan, setLoadingEnhanceLessonPlan] = useState(false); // Loading cho lessonPlan
  const [gender, setGender] = useState(1);
  const [openSend, setOpenSend] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingCreateAndSend, setLoadingCreateAndSend] = useState(false);
  const onChangeGender = ({ target: { value } }) => {
    console.log("radio3 checked", value);
    setGender(value);
  };

  useEffect(() => {
    if (quillRefDescription.current) {
      const editor = quillRefDescription.current.getEditor();
      setQuillDescription(editor);
    }
    if (quillRefLessonPlan.current) {
      const editor = quillRefLessonPlan.current.getEditor();
      setQuillLessonPlan(editor);
    }
  }, [quillRefDescription, quillRefLessonPlan]);

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

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );
        if (response.status === 201 && quillRefDescription.current) {
          const editor = quillRefDescription.current.getEditor();
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

  const enhanceDescription = async () => {
    if (!quillDescription) return;

    const currentContent = quillDescription.getText();
    if (!currentContent.trim()) {
      message.warning("Please enter a description first!");
      return;
    }

    setLoadingEnhanceDescription(true);
    try {
      const enhancedText = await lessonService.enhanceDescription(currentContent);
      quillDescription.setText(enhancedText);
      message.success("Description enhanced successfully!");
    } catch (error) {
      console.error("Error enhancing description:", error);
      message.error("Failed to enhance description. Please try again!");
    } finally {
      setLoadingEnhanceDescription(false);
    }
  };

  const enhanceLessonPlan = async () => {
    if (!quillLessonPlan) return;

    const currentContent = quillLessonPlan.getText();
    if (!currentContent.trim()) {
      message.warning("Please enter a lesson plan first!");
      return;
    }

    setLoadingEnhanceLessonPlan(true);
    try {
      const enhancedText = await lessonService.enhanceLessonPlan(currentContent);
      quillLessonPlan.setText(enhancedText);
      message.success("Lesson plan enhanced successfully!");
    } catch (error) {
      console.error("Error enhancing lesson plan:", error);
      message.error("Failed to enhance lesson plan. Please try again!");
    } finally {
      setLoadingEnhanceLessonPlan(false);
    }
  };

  const handleSubmit = async (values, status) => {
    try {
      if (selected.size === 0) {
        message.warning("Vui lòng chọn ít nhất 1 ngày");
        return;
      }
      if (!status) {
        setLoadingCreateLesson(true);
      }
      if (status) {
        setLoadingCreateAndSend(true);
      }
      // if(status ===1){
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("level", level);
      formData.append("linkYoutube", values.linkYoutube);
      // formData.append("linkGame", values.linkGame);
      formData.append("linkGame", "meomeo");
      formData.append("description", quillDescription.getText()); // Lấy nội dung từ description
      formData.append("lessonPlan", quillLessonPlan.getText()); // Lấy nội dung từ lessonPlan
      formData.append("teacherId", teacherId);

      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }

      const lessonData = await lessonService.createLesson(formData);
      // console.log(lessons, lessonData);

      setLessons((lesson) => [...lesson, lessonData]);
      let selectedSchedule = null;
      for (const item of selected) {
        const data = await lessonByScheduleService.updateLessonOfLessonBySchedule(
          item,
          lessonData.id
        );
        selectedSchedule = data;
      }
      if (status !== true) {
        message.success("Lesson created successfully!");
      }
      // }
      if (status === true) {
        const data = await lessonByScheduleService.updateSendingLessonStatus(
          selectedSchedule?.id,
          true
        );
        const lessonByScheduleDataUpdated = lessonByScheduleData.map((item) => {
          if (item.id === selectedSchedule?.id) {
            return { ...item, lessonID: lessonData.id, isLessonSent: true };
          }
          return item;
        });
        setLessonByScheduleData(lessonByScheduleDataUpdated);
        let detailStr = "Bạn mới có bài học mới vào ngày:";
        // console.log(data);
        const date =
          lessonByScheduleDataUpdated.find((item) => item.id === selectedSchedule?.id)?.date ||
          null;
        // console.log(lessonByScheduleDataUpdated.find((item) => item.id === id));

        detailStr +=
          " " +
            (date &&
              new Date(date).toLocaleDateString("vi-VN", {
                timeZone: "UTC",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })) || "Không có ngày";
        const notificationData = {
          title: "Bài học mới",
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
        message.success("Đã gửi bài học thành công!");
      }
      setSelected(new Set());
      form.resetFields();
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
      quillDescription.setText(""); // Reset description
      quillLessonPlan.setText(""); // Reset lessonPlan
    } catch (err) {
      message.error("Failed to create lesson. Please try again." + err);
    } finally {
      setLoadingCreateLesson(false);
      setLoadingCreateAndSend(false);
    }
  };
  const onSubmitWithStatus = (status) => {
    form
      .validateFields()
      .then((values) => {
        handleSubmit(values, status);
      })
      .catch((err) => {
        console.error("Validation failed:", err);
      });
  };
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTSLesson(true);

    try {
      const response = await homeWorkService.textToSpeech({ textToSpeech, gender });
      let base64String = response;

      function base64ToBlob(base64, mimeType) {
        let byteCharacters = atob(base64);
        let byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
      }

      let audioBlob = base64ToBlob(base64String, "audio/mp3");
      setMp3file(audioBlob);

      let audioUrl = URL.createObjectURL(audioBlob);
      setMp3Url(audioUrl);
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTSLesson(false);
  };

  useEffect(() => {
    if (mp3Url) {
      const audioElement = document.getElementById("audio-player");
      if (audioElement) {
        audioElement.src = "";
        audioElement.load();
        audioElement.src = mp3Url;
      }
    }
  }, [mp3Url]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "10px",
        maxHeight: "70vh",
        overflow: "auto",
        height: "70vh",
      }}
    >
      <div
        style={{
          height: "60vh",
          maxHeight: "60vh",
          overflow: "auto",
          width: isMobile ? "100%" : "70%",
        }}
      >
        <Card
          style={{
            borderRadius: "12px",
            // boxShadow: "0 4px 12px " + colors.softShadow,
            background: colors.white,
            maxWidth: "100%",
            margin: "0 10px",
          }}
        >
          <div style={{ marginBottom: isMobile ? "" : "14px" }}>
            <Title level={5} style={{ margin: "5px 0", color: colors.darkGreen }}>
              Tạo bài học mới
            </Title>
            <Divider style={{ borderColor: colors.paleGreen }} />
          </div>
          <Form
            form={form}
            layout="vertical"
            // onFinish={(values) => handleSubmit(values, false)}
            initialValues={{
              name: "",
              level: "",
              linkYoutube: "",
              linkGame: "",
              description: "",
              lessonPlan: "",
            }}
          >
            <Form.Item
              name="name"
              label="Tên bài học"
              rules={[
                { required: true, message: "Please enter the lesson name" },
                { max: 100, message: "Name cannot be longer than 100 characters" },
              ]}
            >
              <Input
                placeholder="Nhập tên bài học"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              <ReactQuill
                // placeholder={`📎 Nhập chủ đề hoặc mục tiêu cụ thể bạn muốn dạy.\n\nVí dụ:\n• "Lớp 7 – Kỹ năng nghe: Luyện nghe chủ đề thời tiết và trả lời câu hỏi."\n• "Lớp 9 – Ngữ pháp: Sử dụng thì hiện tại hoàn thành để mô tả trải nghiệm cá nhân."\n\nMẹo: Nên ghi rõ kỹ năng chính, lớp, nội dung muốn học sinh đạt được.`}
                theme="snow"
                modules={modules}
                formats={quillFormats}
                ref={quillRefDescription}
                style={{
                  height: "250px",
                  marginBottom: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${colors.inputBorder}`,
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                icon={<RobotOutlined />}
                onClick={enhanceDescription}
                loading={loadingEnhanceDescription}
                style={{
                  alignSelf: "flex-start",
                  marginTop: isMobile ? "100px" : "20px",
                  marginBottom: "20px",
                  borderRadius: "6px",
                  backgroundColor: colors.emerald,
                  borderColor: colors.emerald,
                  color: colors.white,
                }}
              >
                Cải thiện mô tả
              </Button>
            </Form.Item>
            <Form.Item name="lessonPlan" label="Kế hoạch bài học">
              <ReactQuill
                theme="snow"
                modules={modules}
                formats={quillFormats}
                ref={quillRefLessonPlan}
                placeholder={`📎 Nhập chủ đề hoặc mục tiêu cụ thể bạn muốn dạy.\n\nVí dụ:\n• "Lớp 7 – Kỹ năng nghe: Luyện nghe chủ đề thời tiết và trả lời câu hỏi."\n• "Lớp 9 – Ngữ pháp: Sử dụng thì hiện tại hoàn thành để mô tả trải nghiệm cá nhân."\n\nMẹo: Nên ghi rõ kỹ năng chính, lớp, nội dung muốn học sinh đạt được.`}
                style={{
                  height: "250px",
                  marginBottom: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${colors.inputBorder}`,
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                icon={<RobotOutlined />}
                onClick={enhanceLessonPlan}
                loading={loadingEnhanceLessonPlan}
                style={{
                  alignSelf: "flex-start",
                  marginTop: isMobile ? "100px" : "20px",
                  marginBottom: "20px",
                  borderRadius: "6px",
                  backgroundColor: colors.emerald,
                  borderColor: colors.emerald,
                  color: colors.white,
                }}
              >
                Cải thiện kế hoạch bài học
              </Button>
            </Form.Item>
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
              <Radio.Group
                options={genderOptions}
                onChange={onChangeGender}
                value={gender}
                optionType="button"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                onClick={handleConvertToSpeech}
                loading={loadingTTSLesson}
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
            <Form.Item name="linkYoutube" label="Link Youtube bài học">
              <Input
                placeholder="Nhập link youtube bài học"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item>
            {/* <Form.Item name="linkGame" label="Link game bài học">
              <Input
                placeholder="Nhập link game bài học"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item> */}
          </Form>
        </Card>
      </div>

      {isMobile && (
        <>
          <Button
            type="primary"
            htmlType="submit"
            loading={loadingCreateLesson}
            icon={<SaveOutlined />}
            style={{
              borderRadius: "6px",
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              boxShadow: "0 2px 0 " + colors.softShadow,
            }}
            onClick={() => onSubmitWithStatus(false)}
          >
            Lưu
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loadingCreateAndSend}
            icon={<SendOutlined />}
            style={{
              borderRadius: "6px",
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              boxShadow: "0 2px 0 " + colors.softShadow,
            }}
            onClick={() => onSubmitWithStatus(true)}
          >
            Gửi link
          </Button>
        </>
      )}
      <div
        style={{
          maxHeight: "60vh",
          overflow: "auto",
          width: isMobile ? "100%" : "29%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <LessonBySchedule
          lessonByScheduleData={lessonByScheduleData}
          daysOfWeek={daysOfWeek}
          lessonsData={lessonsData}
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
              loading={loadingCreateLesson}
              icon={<SaveOutlined />}
              style={{
                borderRadius: "6px",
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                boxShadow: "0 2px 0 " + colors.softShadow,
              }}
              onClick={() => onSubmitWithStatus(false)}
            >
              Lưu
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingCreateAndSend}
              icon={<SendOutlined />}
              style={{
                borderRadius: "6px",
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                boxShadow: "0 2px 0 " + colors.softShadow,
              }}
              onClick={() => onSubmitWithStatus(true)}
            >
              Gửi link
            </Button>
          </>
        )}
      </div>
      <Modal
        title="Danh sách các lịch học đã có bài học"
        open={openSend}
        onCancel={() => setOpenSend(false)}
        footer={<></>}
        centered
        width={isMobile ? "90%" : "60%"}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {lessonByScheduleData?.length > 0 ? (
            lessonByScheduleData?.map((item, index) => {
              return item.lessonID ? (
                <div
                  key={index}
                  style={{
                    padding: "16px",
                    marginBottom: "12px",
                    border: `1px solid ${colors.lightGreen}`,
                    borderRadius: "8px",
                    backgroundColor: colors.paleGreen,
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    gap: "10px",
                    height: isMobile ? "15%" : "15%",
                    width: "100%",
                    transition: "all 0.3s ease-in-out",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: colors.darkGreen,
                      flex: 1,
                      marginBottom: isMobile ? "10px" : 0,
                    }}
                  >
                    📅 {daysOfWeek[item.schedule.dayOfWeek]} | {item.date} | 🕒{" "}
                    {item.schedule.startTime} - {item.schedule.endTime} |{" "}
                    {lessonsData.find((ls) => ls.id === item.lessonID)?.title}
                  </div>
                  <Button
                    disabled={item.isLessonSent}
                    loading={loadingSchedule}
                    onClick={() => {
                      handleUpdateSendingLessonStatus(item.id);
                    }}
                  >
                    {item.isLessonSent ? <Text>Đã gửi bài học</Text> : <Text>Gửi bài học</Text>}
                  </Button>
                </div>
              ) : null;
            })
          ) : (
            <Text>Không có bài học nào</Text>
          )}
        </div>
      </Modal>
    </div>
  );
}

CreateLesson.propTypes = {
  toolbar: PropTypes.array.isRequired,
  quillFormats: PropTypes.array.isRequired,
  levels: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  loadingCreateLesson: PropTypes.bool.isRequired,
  setLoadingCreateLesson: PropTypes.func.isRequired,
  teacherId: PropTypes.string.isRequired,
  lessonByScheduleData: PropTypes.array.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  lessonsData: PropTypes.array.isRequired,
  setLessonByScheduleData: PropTypes.func.isRequired,
  loadingTTSLesson: PropTypes.bool.isRequired,
  setLoadingTTSLesson: PropTypes.func.isRequired,
  level: PropTypes.number.isRequired,
  classID: PropTypes.number.isRequired,
  students: PropTypes.array.isRequired,
  lessons: PropTypes.array.isRequired,
  setLessons: PropTypes.func.isRequired,
};
