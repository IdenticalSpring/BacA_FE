import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Table,
  Space,
  Typography,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  message,
  Grid,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import ReactQuill from "react-quill"; // For rich text editor
import "react-quill/dist/quill.snow.css";
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

const ManageLessons = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [form] = Form.useForm();
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const screens = useBreakpoint();

  // Determine if we're on mobile or tablet
  const isMobile = !screens.md;
  // console.log(quill);

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
  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const data = await lessonService.getAllLessons();
      setLessons(data);
    } catch (err) {
      message.error("Failed to load lessons!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    form.setFieldsValue({
      name: lesson.name,
      level: lesson.level,
      link: lesson.link,
      description: lesson.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await lessonService.deleteLesson(id);
      setLessons(lessons.filter((lesson) => lesson.id !== id));
      message.success("Lesson deleted successfully");
    } catch (err) {
      message.error("Error deleting lesson!");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingLesson) {
        await lessonService.editLesson(editingLesson.id, values);
        setLessons(
          lessons.map((lesson) =>
            lesson.id === editingLesson.id ? { ...lesson, ...values } : lesson
          )
        );
        message.success("Lesson updated successfully");
      } else {
        const newLesson = await lessonService.createLesson(values);
        setLessons([...lessons, newLesson]);
        message.success("Lesson created successfully");
      }

      setModalVisible(false);
      form.resetFields();
      setEditingLesson(null);
    } catch (err) {
      message.error("Please check your input and try again");
    }
  };

  const columns = [
    {
      title: "Lesson Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: "15%",
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      width: "20%",
      render: (text) => <Typography.Text ellipsis={{ tooltip: text }}>{text}</Typography.Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "25%",
      render: (text) => (
        <Typography.Paragraph ellipsis={{ rows: 2, expandable: true, symbol: "more" }}>
          {text?.replace(/<[^>]*>?/gm, "") || ""}
        </Typography.Paragraph>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{
              backgroundColor: colors.deepGreen,
              borderColor: colors.deepGreen,
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this lesson?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{
              style: { backgroundColor: colors.errorRed, borderColor: colors.errorRed },
            }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px " + colors.softShadow,
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <Title level={4} style={{ margin: 0, color: colors.darkGreen }}>
            Lessons Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/teacherpage/createLesson")}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              borderRadius: "6px",
              boxShadow: "0 2px 0 " + colors.softShadow,
            }}
          >
            Create New Lesson
          </Button>
        </div>

        <Table
          dataSource={lessons}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ borderRadius: "8px", overflow: "hidden" }}
          onRow={(record) => ({
            style: { cursor: "pointer" },
          })}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        centered
        title={editingLesson ? "Edit Lesson" : "Create New Lesson"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingLesson(null);
        }}
        footer={[
          <Button
            style={{ marginTop: isMobile ? "20px" : "" }}
            key="cancel"
            onClick={() => {
              setModalVisible(false);
              form.resetFields();
              setEditingLesson(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSave}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            {editingLesson ? "Save" : "Create"}
          </Button>,
        ]}
        width={720}
      >
        <Form
          form={form}
          layout="vertical"
          name="lessonForm"
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
            rules={[{ required: true, message: "Please enter the lesson name" }]}
          >
            <Input placeholder="Enter lesson name" />
          </Form.Item>

          <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: "Please select a level" }]}
          >
            <Select placeholder="Select level">
              {levels.map((level, index) => (
                <Option key={index} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="link"
            label="Lesson Link"
            rules={[{ required: true, message: "Please enter the lesson link" }]}
          >
            <Input placeholder="Enter video link" />
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
        </Form>
      </Modal>
    </div>
  );
};

export default ManageLessons;
