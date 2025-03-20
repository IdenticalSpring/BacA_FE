import React, { useCallback, useEffect, useRef, useState } from "react";
import { json, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Form,
  Input,
  Select,
  Typography,
  Upload,
  message,
  Space,
  Divider,
  Grid,
} from "antd";
import {
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import ReactQuill from "react-quill"; // For rich text editor
import "react-quill/dist/quill.snow.css";
import Quill from "quill";
import { colors } from "../../assets/theme/color";
import lessonService from "services/lessonService";
import axios from "axios";
const { useBreakpoint } = Grid;
const { Title } = Typography;
const { Option } = Select;

const levels = [
  "Level Pre-1",
  "Level 1",
  "Starters",
  "Level-KET",
  "Movers",
  "Flyers",
  "Pre-KET",
  "level-PET",
];

const CreateLesson = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  // console.log(quill);
  const screens = useBreakpoint();

  // Determine if we're on mobile or tablet
  const isMobile = !screens.md;
  // Initialize the quill instance after component mount
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      setQuill(editor);
    }
  }, [quillRef]);
  // Configure the rich text editor toolbar
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

  const toolbar = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "code-block"],
    ["link", "image"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
  ];
  const modules = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandler,
      },
    },
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "align",
  ];

  // Handle file upload
  const handleFileChange = (info) => {
    const { status, name } = info.file;
    console.log(info);
    if (status === "done") {
      setVideoFile(info.file);

      message.success(`${name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${name} file upload failed.`);
    }
  };

  // File upload properties
  const uploadProps = {
    name: "file",
    accept: "video/*",
    action: process.env.REACT_APP_API_BASE_URL + "/lessons/upload", // Replace with your actual upload endpoint
    onChange: handleFileChange,
    maxCount: 1,
    progress: {
      strokeColor: {
        "0%": colors.lightGreen,
        "100%": colors.deepGreen,
      },
      strokeWidth: 3,
    },
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // If we have a video file, we need to update the link field
      // if (videoFile) {
      //   values.link = videoFile.response?.url || videoFile.name;
      // }

      await lessonService.createLesson(values);
      message.success("Lesson created successfully!");
      navigate("/teacherpage/manageLessons");
    } catch (err) {
      message.error("Failed to create lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: isMobile ? "5px" : "24px" }}>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px " + colors.softShadow,
          background: colors.white,
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: isMobile ? "" : "24px" }}>
          <Button
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
          </Button>
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
            link: "",
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
              {levels.map((level, index) => (
                <Option key={index} value={level}>
                  {level}
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
            name="link"
            label="Lesson Link"
            rules={[{ required: true, message: "Please enter the lesson link" }]}
          >
            <Input
              placeholder="Enter lesson link"
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
              <Button
                onClick={() => navigate("/teacherpage/manageLessons")}
                style={{
                  borderRadius: "6px",
                  borderColor: colors.deepGreen,
                  color: colors.deepGreen,
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
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
};

export default CreateLesson;
