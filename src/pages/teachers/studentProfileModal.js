// StudentProfileModal.js
import React, { useState } from "react";
import { Modal, Avatar, Typography, Descriptions, Image } from "antd";
import { colors } from "assets/theme/color";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

const StudentProfileModal = ({ visible, onClose, student }) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  if (!student) return null;

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0, color: colors.darkGreen, textAlign: "center" }}>
          {student.name}&apos;s Profile
        </Title>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
      style={{ borderRadius: "8px", textAlign: "center" }}
      bodyStyle={{ padding: "16px" }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
        <Avatar
          size={120} // Tăng kích thước Avatar
          src={student.imgUrl}
          style={{
            width: "100vw",
            height: "auto",
            backgroundColor: student.imgUrl ? "transparent" : colors.deepGreen,
            color: colors.white,
            borderRadius: "50%", // Bo tròn hoàn toàn
            border: `2px solid ${colors.lightGreen}`, // Viền nhẹ
            cursor: student.imgUrl ? "pointer" : "default",
            transition: "transform 0.3s ease", // Hiệu ứng hover
          }}
          onClick={() => student.imgUrl && setPreviewVisible(true)}
          onMouseEnter={(e) => student.imgUrl && (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => student.imgUrl && (e.currentTarget.style.transform = "scale(1)")}
        >
          {!student.imgUrl && student.name.charAt(0)}
        </Avatar>
      </div>
      <Descriptions
        column={1}
        bordered
        size="small"
        layout="vertical"
        style={{ textAlign: "center" }}
      >
        <Descriptions.Item label="Name">
          <Text>{student.name}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Level">
          <Text>{student.level || "N/A"}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Year of Birth">
          <Text>{student.class?.name || "N/A"}</Text>
        </Descriptions.Item>
      </Descriptions>

      {/* Preview ảnh chi tiết */}
      {student.imgUrl && (
        <Image
          style={{ display: "none" }}
          src={student.imgUrl}
          preview={{
            visible: previewVisible,
            onVisibleChange: (vis) => setPreviewVisible(vis),
          }}
        />
      )}
    </Modal>
  );
};

StudentProfileModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.shape({
    name: PropTypes.string.isRequired,
    imgUrl: PropTypes.string,
    class: PropTypes.shape({ name: PropTypes.string }),
    level: PropTypes.string,
  }),
};

export default StudentProfileModal;
