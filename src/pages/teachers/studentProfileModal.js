// StudentProfileModal.js
import React from "react";
import { Modal, Avatar, Typography, Descriptions } from "antd";
import { colors } from "assets/theme/color";
import PropTypes from "prop-types"; // Thêm import PropTypes

const { Title, Text } = Typography;

const StudentProfileModal = ({ visible, onClose, student }) => {
  if (!student) return null;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={48}
            style={{
              backgroundColor: colors.deepGreen,
              color: colors.white,
            }}
          >
            {student.name.charAt(0)}
          </Avatar>
          <Title level={4} style={{ margin: 0, color: colors.darkGreen }}>
            {student.name}&apos;s Profile
          </Title>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
      style={{ borderRadius: "8px" }}
      bodyStyle={{ padding: "16px" }}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Student ID">
          <Text>{student.id}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Level">
          <Text>{student.level || "N/A"}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Note">
          <Text>{student.note || "N/A"}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

// Thêm prop-types validation
StudentProfileModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    level: PropTypes.string,
    note: PropTypes.string,
  }),
};

export default StudentProfileModal;
