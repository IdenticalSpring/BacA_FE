import { Button, Card, Divider, Form, Input, message, Select, Space, Typography } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import { colors } from "assets/theme/color";
import axios from "axios";
import lessonService from "services/lessonService";
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
}) {
  const [form] = Form.useForm();
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
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
      const dataLesson = {
        ...values,
        teacherId: teacherId,
      };
      console.log(dataLesson);

      await lessonService.createLesson(dataLesson);
      message.success("Lesson created successfully!");
      // navigate("/teacherpage/manageLessons");
      form.resetFields();
    } catch (err) {
      message.error("Failed to create lesson. Please try again.");
    } finally {
      setLoadingCreateLesson(false);
    }
  };
  return (
    <div style={{ maxHeight: "35vh", overflow: "auto" }}>
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

          <Form.Item
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
          </Form.Item>

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
          <Form.Item name="linkGame" label="Lesson Game Link">
            <Input
              placeholder="Enter lesson game link"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item>
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

          <Form.Item style={{ marginTop: isMobile ? "40px" : "" }}>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              {/* <Button
                              onClick={() => navigate("/teacherpage/manageLessons")}
                              style={{
                                borderRadius: "6px",
                                borderColor: colors.deepGreen,
                                color: colors.deepGreen,
                              }}
                            >
                              Cancel
                            </Button> */}
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
              >
                Create Lesson
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
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
};
