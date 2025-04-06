import React, { useState } from "react";
import { Modal, Form, Input, Button, Typography, notification } from "antd";
import PropTypes from "prop-types";
import teacherFeedbackService from "services/teacherFeedbackService";
import { colors } from "./teacherPage";

const { Title } = Typography;
const { TextArea } = Input;

const TeacherFeedbackModal = ({ visible, onClose, teacherId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const feedbackData = {
        teacherID: teacherId, // Gửi teacherId trong dữ liệu
        title: values.title,
        description: values.description,
      };
      await teacherFeedbackService.createTeacherFeedback(feedbackData);

      notification.success({
        message: "Success",
        description: "Feedback has been created successfully.",
        placement: "topRight",
      });
      form.resetFields(); // Xóa dữ liệu form sau khi tạo thành công
      onClose(); // Đóng modal
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to create feedback.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<Title level={4}>Create Teacher Feedback</Title>}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="50%"
      style={{ borderRadius: "8px" }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ title: "", description: "" }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter a title" }]}
        >
          <Input placeholder="Enter feedback title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <TextArea rows={4} placeholder="Enter feedback description" />
        </Form.Item>

        <Form.Item style={{ textAlign: "right" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            Submit Feedback
          </Button>
          <Button onClick={onClose} style={{ marginLeft: 8 }} disabled={loading}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

TeacherFeedbackModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  teacherId: PropTypes.string.isRequired,
};

export default TeacherFeedbackModal;
