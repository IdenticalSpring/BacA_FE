import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import { colors } from "assets/theme/color";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
const { Title } = Typography;
const { Option } = Select;
import PropTypes from "prop-types";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import lessonService from "services/lessonService";
import { jwtDecode } from "jwt-decode";
export default function LessonMangement({
  toolbar,
  quillFormats,
  levels,
  isMobile,
  setModalUpdateLessonVisible,
  setEditingLesson,
  modalUpdateLessonVisible,
  editingLesson,
  loading,
  lessons,
  setLessons,
}) {
  const [form] = Form.useForm();
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);

  const handleDelete = async (id) => {
    try {
      await lessonService.deleteLesson(id);
      setLessons(lessons.filter((lesson) => lesson.id !== id));
      message.success("Lesson deleted successfully");
    } catch (err) {
      message.error("Error deleting lesson!");
    }
  };
  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    form.setFieldsValue({
      name: lesson.name,
      level: lesson.level,
      linkYoutube: lesson.linkYoutube,
      linkGame: lesson.linkGame,
      description: lesson.description,
    });
    setModalUpdateLessonVisible(true);
  };
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingLesson) {
        await lessonService.editLesson(editingLesson.id, values);
        setLessons(
          lessons?.map((lesson) =>
            lesson.id === editingLesson.id ? { ...lesson, ...values } : lesson
          )
        );
        message.success("Lesson updated successfully");
      }
      setModalUpdateLessonVisible(false);
      form.resetFields();
      setEditingLesson(null);
    } catch (err) {
      message.error("Please check your input and try again");
    }
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
      render: (text) => levels?.find((level) => level.id === text)?.name,
    },
    {
      title: "Link Youtube",
      dataIndex: "linkYoutube",
      key: "linkYoutube",
      width: "20%",
      render: (text) => <Typography.Text ellipsis={{ tooltip: text }}>{text}</Typography.Text>,
    },
    {
      title: "Link Game",
      dataIndex: "linkGame",
      key: "linkGame",
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
    <div style={{ padding: "14px" }}>
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
        open={modalUpdateLessonVisible}
        onCancel={() => {
          setModalUpdateLessonVisible(false);
          form.resetFields();
          setEditingLesson(null);
        }}
        footer={[
          <Button
            style={{ marginTop: isMobile ? "20px" : "" }}
            key="cancel"
            onClick={() => {
              setModalUpdateLessonVisible(false);
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
            linkYoutube: "",
            linkGame: "",
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
              {levels?.map((level, index) => (
                <Option key={index} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item>

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
        </Form>
      </Modal>
    </div>
  );
}
LessonMangement.propTypes = {
  toolbar: PropTypes.func.isRequired,
  quillFormats: PropTypes.func.isRequired,
  levels: PropTypes.func.isRequired,
  isMobile: PropTypes.func.isRequired,
  loading: PropTypes.func.isRequired,
  setModalUpdateLessonVisible: PropTypes.func.isRequired,
  setEditingLesson: PropTypes.func.isRequired,
  modalUpdateLessonVisible: PropTypes.func.isRequired,
  editingLesson: PropTypes.func.isRequired,
  lessons: PropTypes.func.isRequired,
  setLessons: PropTypes.func.isRequired,
};
