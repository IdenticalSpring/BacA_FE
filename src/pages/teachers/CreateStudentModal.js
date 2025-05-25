import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Input, Select, Button, Upload, message, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import studentService from "services/studentService";
import levelService from "services/levelService";
import { colors } from "./teacherPage";

const { Text } = Typography;

const CreateStudentModal = ({ visible, onClose, classID, isMobile, refreshStudents }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [levels, setLevels] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const levelData = await levelService.getAllLevels();
        setLevels(levelData);
      } catch (error) {
        console.error("Failed to fetch levels:", error);
        message.error("Failed to load levels");
      }
    };
    fetchLevels();
  }, []);

  const handleUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/upload/cloudinary`,
        formData
      );
      if (response.status === 201) {
        onSuccess(response.data.url);
        setPreviewUrl(response.data.url);
      } else {
        onError(new Error("Upload failed"));
        message.error("Upload failed. Try again!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      onError(error);
      message.error("Upload error. Please try again!");
    }
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].status === "done") {
      setPreviewUrl(newFileList[0].response || newFileList[0].url);
    } else {
      setPreviewUrl("");
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (!classID) {
        message.error("No class selected. Please select a class.");
        return;
      }
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("level", values.level);
      formData.append("phone", values.phone || "");
      formData.append("username", values.username);
      formData.append("password", values.password);
      formData.append("startDate", values.startDate);
      formData.append("note", values.note || "");
      formData.append("classID", classID);

      if (fileList.length > 0 && fileList[0].status === "done" && fileList[0].response) {
        formData.append("imgUrl", fileList[0].response);
      }

      await studentService.createStudentWithFile(formData);
      message.success("Student created successfully!");
      form.resetFields();
      setFileList([]);
      setPreviewUrl("");
      if (refreshStudents) await refreshStudents(); // Refresh student list
      onClose();
    } catch (error) {
      console.error("Create student failed:", error);
      message.error(`Create student failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setPreviewUrl("");
    onClose();
  };

  return (
    <Modal
      title="Create New Student"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={isMobile ? "90%" : 600}
      centered
      style={{ borderRadius: "8px" }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          name: "",
          level: "",
          phone: "",
          username: "",
          password: "",
          startDate: "",
          note: "",
        }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please input the student's name!" }]}
        >
          <Input placeholder="Enter student name" />
        </Form.Item>

        <Form.Item
          name="level"
          label="Level"
          rules={[{ required: true, message: "Please select a level!" }]}
        >
          <Select placeholder="Select level">
            {levels.map((level) => (
              <Select.Option key={level.id} value={level.id}>
                {level.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="phone" label="Phone">
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input the username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input the password!" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Start Date"
          rules={[{ required: true, message: "Please select the start date!" }]}
        >
          <Input type="date" />
        </Form.Item>

        <Form.Item name="note" label="Note">
          <Input.TextArea rows={3} placeholder="Enter any notes" />
        </Form.Item>

        <Form.Item label="Avatar">
          <Upload
            customRequest={handleUpload}
            fileList={fileList}
            onChange={handleChange}
            accept="image/*"
            listType="picture"
            maxCount={1}
          >
            <Button
              icon={<UploadOutlined />}
              style={{ borderColor: colors.midGreen, color: colors.midGreen }}
            >
              Upload Avatar
            </Button>
          </Upload>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Avatar preview"
              style={{
                maxWidth: "100%",
                maxHeight: "150px",
                marginTop: "10px",
                borderRadius: "8px",
              }}
            />
          )}
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <Button
              onClick={handleCancel}
              style={{ borderColor: colors.errorRed, color: colors.errorRed }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ backgroundColor: colors.midGreen, borderColor: colors.midGreen }}
            >
              Create
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

CreateStudentModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classID: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
  refreshStudents: PropTypes.func,
};

export default CreateStudentModal;
