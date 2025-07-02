import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Input, Select, Button, Upload, message, Typography } from "antd";
import { UploadOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
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
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

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
    setImageLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/files/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      if (response.status === 201 && response.data.url) {
        onSuccess(response.data.url);
        setImageUrl(response.data.url);
        setImageLoading(false);
        message.success("Đã upload ảnh thành công");
      } else {
        setImageLoading(false);
        onError(new Error("Upload failed"));
        message.error("Upload ảnh thất bại: Không nhận được URL từ server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setImageLoading(false);
      onError(error);
      message.error(`Lỗi upload ảnh: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].status === "done") {
      setImageUrl(newFileList[0].response || newFileList[0].url);
    } else {
      setImageUrl("");
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (!classID) {
        message.error("No class selected. Please select a class.");
        setLoading(false);
        return;
      }

      // Prepare JSON data
      const studentData = {
        name: values.name,
        level: values.level,
        username: values.username,
        password: values.password,
        startDate: values.startDate,
        classID: classID,
        imgUrl: imageUrl || "", // Use the uploaded image URL or empty string
      };

      await studentService.createStudentWithFile(studentData);
      message.success("Student created successfully!");
      form.resetFields();
      setFileList([]);
      setImageUrl("");
      setImageLoading(false);
      if (refreshStudents) await refreshStudents();
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
    setImageUrl("");
    setImageLoading(false);
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
          username: "",
          password: "",
          startDate: "",
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

        <Form.Item label="Avatar">
          <style>{`
            .ant-upload-select {
              width: 90px !important;
              height: 90px !important;
            }
          `}</style>
          <Upload
            name="file"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={true}
            customRequest={handleUpload}
            fileList={fileList}
            onChange={handleChange}
            accept="image/*"
            maxCount={1}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="avatar" style={{ width: "100%" }} />
            ) : (
              <div>
                {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            )}
          </Upload>
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
