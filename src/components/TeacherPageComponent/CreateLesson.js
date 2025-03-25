import { Button, Card, Divider, Form, Input, message, Select, Space, Typography } from "antd";
import { SaveOutlined } from "@ant-design/icons";
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
const { Title } = Typography;
const { Option } = Select;
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
}) {
  const [form] = Form.useForm();
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
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
      setLoadingCreateLesson(true);

      // If we have a video file, we need to update the link field
      // if (videoFile) {
      //   values.link = videoFile.response?.url || videoFile.name;
      // }
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("level", level);
      formData.append("linkYoutube", values.linkYoutube);
      formData.append("description", values.description);
      formData.append("teacherId", teacherId);
      // console.log(dataLesson);
      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }
      const lessonData = await lessonService.createLesson(formData);
      for (const item of selected) {
        await lessonByScheduleService.updateLessonOfLessonBySchedule(item, lessonData.id);
      }
      message.success("Lesson created successfully!");
      // navigate("/teacherpage/manageLessons");
      form.resetFields();
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
    } catch (err) {
      message.error("Failed to create lesson. Please try again." + err);
    } finally {
      setLoadingCreateLesson(false);
    }
  };
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTSLesson(true);

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
    setLoadingTTSLesson(false);
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
  // console.log(selected);
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "right",
        gap: "10px",
        maxHeight: "60vh",
        overflow: "auto",
      }}
    >
      <div style={{ maxHeight: "50vh", overflow: "auto", width: isMobile ? "100%" : "59%" }}>
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
              Create New Lesson
            </Title>
            <Divider style={{ borderColor: colors.paleGreen }} />
          </div>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          ></div>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: "",
              level: "",
              linkYoutube: "",
              linkGame: "",
              description: "",
            }}
          >
            <Form.Item
              name="name"
              label="Lesson Name"
              rules={[
                { required: true, message: "Please enter the lesson name" },
                { max: 100, message: "Name cannot be longer than 100 characters" },
              ]}
            >
              <Input
                placeholder="Enter lesson name"
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

            {/* <Form.Item
            name="link"
            label="Lesson Video"
            rules={[{ required: true, message: "Please upload a video file" }]}
          >
            <Upload {...uploadProps} listType="picture">
              <Button
                icon={<VideoCameraOutlined />}
                style={{
                  borderColor: colors.inputBorder,
                  borderRadius: "6px",
                  width: "100%",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.deepGreen,
                  backgroundColor: colors.paleGreen,
                }}
              >
                <span style={{ marginLeft: "8px" }}>Select Video File</span>
              </Button>
            </Upload>
            <div style={{ marginTop: "4px", color: colors.darkGray, fontSize: "12px" }}>
              Supported formats: MP4, MOV, AVI, WEBM
            </div>
          </Form.Item> */}
            <Form.Item
              name="linkYoutube"
              label="Lesson Youtube Link"
              rules={[{ required: true, message: "Please enter the lesson link" }]}
            >
              <Input
                placeholder="Enter lesson youtube link"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item>
            <Form.Item label="Tech to speech">
              <TextArea
                value={textToSpeech}
                onChange={(e) => setTextToSpeech(e.target.value)}
                rows={3}
                placeholder="Enter text to convert to speech"
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
                loading={loadingTTSLesson}
                style={{
                  backgroundColor: colors.deepGreen,
                  borderColor: colors.deepGreen,
                }}
              >
                Convert to Speech
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
            <Form.Item
              name="description"
              label="Description"
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
          onClick={() => {
            form.submit();
          }}
        >
          Create Lesson
        </Button>
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
      {!isMobile && (
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
          onClick={() => {
            form.submit();
          }}
        >
          Create Lesson
        </Button>
      )}
    </div>
  );
}
CreateLesson.propTypes = {
  toolbar: PropTypes.func.isRequired,
  quillFormats: PropTypes.func.isRequired,
  levels: PropTypes.func.isRequired,
  isMobile: PropTypes.func.isRequired,
  loadingCreateLesson: PropTypes.func.isRequired,
  setLoadingCreateLesson: PropTypes.func.isRequired,
  teacherId: PropTypes.func.isRequired,
  lessonByScheduleData: PropTypes.func.isRequired,
  daysOfWeek: PropTypes.func.isRequired,
  lessonsData: PropTypes.func.isRequired,
  setLessonByScheduleData: PropTypes.func.isRequired,
  isMobile: PropTypes.func.isRequired,
  loadingTTSLesson: PropTypes.func.isRequired,
  setLoadingTTSLesson: PropTypes.func.isRequired,
  level: PropTypes.func.isRequired,
};
