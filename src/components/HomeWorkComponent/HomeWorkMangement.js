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
import { jwtDecode } from "jwt-decode";
import homeWorkService from "services/homeWorkService";
import TextArea from "antd/es/input/TextArea";
import axios from "axios";
export default function HomeWorkMangement({
  toolbar,
  quillFormats,
  levels,
  isMobile,
  setModalUpdateHomeWorkVisible,
  setEditingHomeWork,
  modalUpdateHomeWorkVisible,
  editingHomeWork,
  loading,
  homeWorks,
  setHomeWorks,
  loadingTTSForUpdate,
  setLoadingTTSForUpdate,
  teacherId,
}) {
  const [form] = Form.useForm();
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const handleDelete = async (id) => {
    try {
      await homeWorkService.deleteHomeWork(id);
      setHomeWorks(homeWorks.filter((homeWork) => homeWork.id !== id));
      message.success("Homework deleted successfully");
    } catch (err) {
      message.error("Error deleting homework!");
    }
  };
  const handleEdit = (homeWork) => {
    setEditingHomeWork(homeWork);
    form.setFieldsValue({
      title: homeWork.title,
      level: homeWork.level,
      linkYoutube: homeWork.linkYoutube,
      linkGame: homeWork.linkGame,
      linkSpeech: homeWork.linkSpeech,
      description: homeWork.description,
    });
    setMp3Url(homeWork.linkSpeech);
    setModalUpdateHomeWorkVisible(true);
  };
  console.log(textToSpeech);

  const handleConvertToSpeech = async () => {
    if (!textToSpeech) {
      return;
    }
    setLoadingTTSForUpdate(true);

    try {
      const response = await homeWorkService.textToSpeech(textToSpeech);

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
    setLoadingTTSForUpdate(false);
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
      formData.append("title", values.title);
      formData.append("level", values.level);
      formData.append("linkYoutube", values.linkYoutube);
      formData.append("linkGame", values.linkGame);
      formData.append("description", values.description);
      formData.append("teacherId", teacherId);

      // Nếu có mp3Url thì fetch dữ liệu và append vào formData
      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }
      if (editingHomeWork) {
        const HomeWorkdata = await homeWorkService.editHomeWork(editingHomeWork.id, formData);
        setHomeWorks(
          homeWorks?.map((homeWork) =>
            homeWork.id === editingHomeWork.id ? { ...homeWork, ...HomeWorkdata } : homeWork
          )
        );
        message.success("HomeWork updated successfully");
      }
      setModalUpdateHomeWorkVisible(false);
      form.resetFields();
      setTextToSpeech("");
      setEditingHomeWork(null);
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
    } catch (err) {
      message.error("Please check your input and try again" + err);
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
      title: "Homework title",
      dataIndex: "title",
      key: "title",
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
      title: "Link Speech",
      dataIndex: "linkSpeech",
      key: "linkSpeech",
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
            title="Are you sure you want to delete this homeWork?"
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
  console.log(mp3Url == true);

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
            HomeWork Management
          </Title>
        </div>

        <Table
          dataSource={homeWorks}
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
        title={editingHomeWork ? "Edit HomeWork" : "Create New HomeWork"}
        open={modalUpdateHomeWorkVisible}
        onCancel={() => {
          setModalUpdateHomeWorkVisible(false);
          form.resetFields();
          setEditingHomeWork(null);
        }}
        footer={[
          <Button
            style={{ marginTop: isMobile ? "20px" : "" }}
            key="cancel"
            onClick={() => {
              setModalUpdateHomeWorkVisible(false);
              form.resetFields();
              setEditingHomeWork(null);
            }}
          >
            Cancel
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
            {editingHomeWork ? "Save" : "Create"}
          </Button>,
        ]}
        width={720}
      >
        <Form
          form={form}
          layout="vertical"
          name="HomeWorkForm"
          initialValues={{
            title: "",
            level: "",
            linkYoutube: "",
            linkGame: "",
            description: "",
          }}
        >
          <Form.Item
            name="title"
            label="Homework Title"
            rules={[
              { required: true, message: "Please enter the homework name" },
              { max: 100, message: "Title cannot be longer than 100 characters" },
            ]}
          >
            <Input
              placeholder="Enter homework name"
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
          <Form.Item
            name="linkYoutube"
            label="Homework Youtube Link"
            rules={[{ required: true, message: "Please enter the homework link" }]}
          >
            <Input
              placeholder="Enter homework youtube link"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item>
          <Form.Item name="linkGame" label="Homework Game Link">
            <Input
              placeholder="Enter homework game link"
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
              loading={loadingTTSForUpdate}
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
          {/* {
          ||
            (form.getFieldValue("linkSpeech") && (
              <Form.Item>
                <div style={{ marginBottom: "16px" }}>
                  <audio id="audio-player" controls style={{ width: "100%" }}>
                    <source src={form.getFieldValue("linkSpeech")} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </Form.Item>
            ))} */}
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
HomeWorkMangement.propTypes = {
  toolbar: PropTypes.func.isRequired,
  quillFormats: PropTypes.func.isRequired,
  levels: PropTypes.func.isRequired,
  isMobile: PropTypes.func.isRequired,
  loading: PropTypes.func.isRequired,
  setModalUpdateHomeWorkVisible: PropTypes.func.isRequired,
  setEditingHomeWork: PropTypes.func.isRequired,
  modalUpdateHomeWorkVisible: PropTypes.func.isRequired,
  editingHomeWork: PropTypes.func.isRequired,
  homeWorks: PropTypes.func.isRequired,
  setHomeWorks: PropTypes.func.isRequired,
  loadingTTSForUpdate: PropTypes.func.isRequired,
  setLoadingTTSForUpdate: PropTypes.func.isRequired,
  teacherId: PropTypes.func.isRequired,
};
