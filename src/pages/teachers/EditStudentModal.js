import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Upload, message, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import PropTypes from "prop-types"; // Import PropTypes
import studentService from "services/studentService";
import { colors } from "./teacherPage"; // Import bảng màu từ TeacherPage.js

const EditStudentModal = ({ visible, onClose, student, classID, isMobile, refreshStudents }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Khởi tạo form với dữ liệu học sinh khi modal mở
  useEffect(() => {
    if (student) {
      form.setFieldsValue({
        name: student.name,
        username: student.username || "",
        password: student.password || "",
      });
      // Khởi tạo fileList nếu học sinh có ảnh đại diện
      if (student.imgUrl) {
        setFileList([
          {
            uid: "-1",
            name: "current-image.png",
            status: "done",
            url: student.imgUrl,
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [student, form]);

  // Xử lý thay đổi file upload
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Tùy chỉnh yêu cầu upload (ngăn upload tự động)
  const customRequest = ({ onSuccess }) => {
    onSuccess("ok");
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const studentData = {
        name: values.name,
        username: values.username,
        password: values.password,
        classId: classID,
      };

      // Lấy file từ fileList
      const file =
        fileList.length > 0 && fileList[0].originFileObj ? fileList[0].originFileObj : null;

      await studentService.editStudent(student.id, studentData, file);
      message.success("Cập nhật học sinh thành công");
      refreshStudents(); // Làm mới danh sách học sinh
      onClose(); // Đóng modal
    } catch (error) {
      message.error(error.message || "Không thể cập nhật học sinh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa hồ sơ học sinh"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMobile ? "90%" : 600}
      centered
      style={{ borderRadius: "12px" }}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ padding: "16px" }}>
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên học sinh" }]}
          >
            <Input
              placeholder="Nhập tên học sinh"
              style={{
                borderRadius: "8px",
                borderColor: colors.borderGreen,
              }}
            />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ type: "username", message: "Vui lòng nhập username hợp lệ" }]}
          >
            <Input
              placeholder="Nhập username học sinh"
              style={{
                borderRadius: "8px",
                borderColor: colors.borderGreen,
              }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            // rules={[
            //   {
            //     pattern: /^[0-9]{10,}$/,
            //     message: "Vui lòng nhập password hợp lệ",
            //   },
            // ]}
          >
            <Input
              placeholder="Nhập password học sinh"
              style={{
                borderRadius: "8px",
                borderColor: colors.borderGreen,
              }}
            />
          </Form.Item>
          <Form.Item label="Ảnh đại diện" name="profilePicture">
            <Upload
              fileList={fileList}
              onChange={handleUploadChange}
              customRequest={customRequest}
              accept="image/*"
              listType="picture"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                backgroundColor: colors.deepGreen,
                borderColor: colors.deepGreen,
                borderRadius: "8px",
                width: "100%",
              }}
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

// Định nghĩa PropTypes cho component
EditStudentModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    username: PropTypes.string,
    password: PropTypes.string,
    imgUrl: PropTypes.string,
  }).isRequired,
  classID: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
  refreshStudents: PropTypes.func.isRequired,
};

export default EditStudentModal;
