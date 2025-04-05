import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Radio,
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
import TextArea from "antd/es/input/TextArea";
import homeWorkService from "services/homeWorkService";
const genderOptions = [
  { label: "Giọng nam", value: 1 },
  { label: "Giọng nữ", value: 0 },
];
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
  teacherId,
  level,
  loadingTTSForUpdateLesson,
  setLoadingTTSForUpdateLesson,
}) {
  const [form] = Form.useForm();
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [gender, setGender] = useState(1);
  const onChangeGender = ({ target: { value } }) => {
    console.log("radio3 checked", value);
    setGender(value);
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
  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    form.setFieldsValue({
      name: lesson.name,
      linkYoutube: lesson.linkYoutube,
      linkGame: lesson.linkGame,
      linkSpeech: lesson.linkSpeech,
      description: lesson.description,
    });
    setMp3Url(lesson.linkSpeech);
    setModalUpdateLessonVisible(true);
  };
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) {
      return;
    }
    setLoadingTTSForUpdateLesson(true);

    try {
      const response = await homeWorkService.textToSpeech({ textToSpeech, gender });

      let base64String = response;

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
      let audioUrl = URL.createObjectURL(audioBlob);
      setMp3Url(audioUrl);
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTSForUpdateLesson(false);
  };
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
  const handleSave = async () => {
    try {
      setLoadingUpdate(true);
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("level", level);
      formData.append("linkYoutube", values.linkYoutube);
      formData.append("linkGame", values.linkGame);
      formData.append("description", values.description);
      formData.append("teacherId", teacherId);
      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }
      if (editingLesson) {
        await lessonService.editLesson(editingLesson.id, formData);
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
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
    } catch (err) {
      message.error("Please check your input and try again");
    } finally {
      setLoadingUpdate(false);
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
      title: "Tên bài học",
      dataIndex: "name",
      key: "name",
      width: "20%",
    },
    {
      title: "Cấp độ",
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
      render: (text) => (
        <Typography.Text
          ellipsis={{ tooltip: text }}
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
        >
          {text}
        </Typography.Text>
      ),
    },
    {
      title: "Link Game",
      dataIndex: "linkGame",
      key: "linkGame",
      width: "20%",
      render: (text) => (
        <Typography.Text
          ellipsis={{ tooltip: text }}
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
        >
          {text}
        </Typography.Text>
      ),
    },
    {
      title: "Link Speech",
      dataIndex: "linkSpeech",
      key: "linkSpeech",
      width: "20%",
      render: (text) => (
        <Typography.Text
          ellipsis={{ tooltip: text }}
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
        >
          {text}
        </Typography.Text>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "25%",
      render: (text) => (
        <Typography.Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
        >
          {text?.replace(/<[^>]*>?/gm, "") || ""}
        </Typography.Paragraph>
      ),
    },
    {
      title: "Hành động",
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
            title="Bạn có chắc muốn xóa bài học này?"
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
            Quản lý bài học
          </Title>
        </div>

        <Table
          dataSource={lessons}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 4 }}
          style={{ borderRadius: "8px", overflow: "hidden" }}
          onRow={(record) => ({
            style: { cursor: "pointer" },
          })}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        centered
        title={editingLesson ? "Điều chỉnh bài học" : "Create New Lesson"}
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
            Hủy
          </Button>,
          <Button
            loading={loadingUpdate}
            key="submit"
            type="primary"
            onClick={handleSave}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            {editingLesson ? "Lưu" : "Create"}
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
            label="Tên bài học"
            rules={[{ required: true, message: "Please enter the lesson name" }]}
          >
            <Input placeholder="Nhập tên bài học" />
          </Form.Item>

          {/* <Form.Item
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
              loading={loadingTTSForUpdateLesson}
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
          <Form.Item
            name="linkYoutube"
            label="Link Youtube bài học"
            // rules={[{ required: true, message: "Please enter the lesson link" }]}
          >
            <Input
              placeholder="Nhập link youtube bài học"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item>
          <Form.Item name="linkGame" label="Link game bài học">
            <Input
              placeholder="Nhập link game bài học"
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
      </Modal>
    </div>
  );
}
LessonMangement.propTypes = {
  toolbar: PropTypes.array.isRequired,
  quillFormats: PropTypes.array.isRequired,
  levels: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  setModalUpdateLessonVisible: PropTypes.func.isRequired,
  setEditingLesson: PropTypes.func.isRequired,
  modalUpdateLessonVisible: PropTypes.bool.isRequired,
  editingLesson: PropTypes.array.isRequired,
  lessons: PropTypes.array.isRequired,
  setLessons: PropTypes.func.isRequired,
  teacherId: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  loadingTTSForUpdateLesson: PropTypes.bool.isRequired,
  setLoadingTTSForUpdateLesson: PropTypes.func.isRequired,
};
