import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Select, Button, Row, Col, Rate, List, Input, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import evaluationStudent from "services/teacherService";

const { TextArea } = Input;
const { Option } = Select;

// ✅ Màu sắc
const colors = {
  lightGreen: "#8ED1B0",
  deepGreen: "#368A68",
  white: "#FFFFFF",
  gray: "#F5F5F5",
  darkGray: "#333333",
  errorRed: "#FF6B6B",
};

const SKILL_OPTIONS = ["Vocabulary", "Structure", "Listening", "Speaking", "Reading", "Writing"];

const EvaluationModal = ({ visible, onClose, student }) => {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading] = useState(false);

  const [behaviors, setBehaviors] = useState([
    { name: "Respect", rating: 0 },
    { name: "Discipline", rating: 0 },
    { name: "Cooperation", rating: 0 },
  ]);

  // ✅ Thêm Skill từ dropdown
  const handleAddSkill = () => {
    if (selectedSkill && !skills.some((s) => s.name === selectedSkill)) {
      setSkills([...skills, { name: selectedSkill, rating: 0 }]);
      setSelectedSkill("");
    }
  };

  // ✅ Xóa Skill
  const handleDeleteSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // ✅ Cập nhật đánh giá Skill
  const handleSkillRating = (index, value) => {
    const updatedSkills = [...skills];
    updatedSkills[index].rating = value;
    setSkills(updatedSkills);
  };

  // ✅ Cập nhật đánh giá Behavior
  const handleBehaviorRating = (index, value) => {
    const updatedBehaviors = [...behaviors];
    updatedBehaviors[index].rating = value;
    setBehaviors(updatedBehaviors);
  };

  // ✅ Gọi API để lưu Evaluation
  const handleOk = async () => {
    if (!student?.id) {
      message.error("Student information is missing.");
      return;
    }

    setLoading(true);
    try {
      await evaluationStudent(); // Gọi API từ file service
      message.success("Evaluation saved successfully!");
      onClose();
    } catch (error) {
      message.error(error || "Error saving evaluation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Evaluation for ${student?.name || "Unknown"}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} style={{ backgroundColor: colors.gray }}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleOk}
          style={{ backgroundColor: colors.deepGreen, color: colors.white }}
          loading={loading}
        >
          Save
        </Button>,
      ]}
      width={800}
    >
      <Row gutter={16}>
        {/* ✅ Cột Skill */}
        <Col span={12}>
          <h3>Skills</h3>
          <Select
            value={selectedSkill}
            onChange={(value) => setSelectedSkill(value)}
            style={{ width: "100%" }}
            placeholder="Select a skill"
          >
            {SKILL_OPTIONS.map((skill) => (
              <Option key={skill} value={skill}>
                {skill}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={handleAddSkill}
            style={{ marginTop: 8, backgroundColor: colors.deepGreen, color: colors.white }}
          >
            Add Skill
          </Button>
          <List
            dataSource={skills}
            renderItem={(item, index) => (
              <List.Item>
                <span style={{ flex: 1 }}>{item.name}</span>
                <Rate
                  value={item.rating}
                  onChange={(value) => handleSkillRating(index, value)}
                  count={4}
                />
                <Button
                  type="text"
                  icon={<DeleteOutlined style={{ color: colors.errorRed }} />}
                  onClick={() => handleDeleteSkill(index)}
                />
              </List.Item>
            )}
            style={{ marginTop: 10 }}
          />
        </Col>

        {/* ✅ Cột Behavior */}
        <Col span={12}>
          <h3>Behaviors</h3>
          <List
            dataSource={behaviors}
            renderItem={(item, index) => (
              <List.Item>
                <span style={{ flex: 1 }}>{item.name}</span>
                <Rate
                  value={item.rating}
                  onChange={(value) => handleBehaviorRating(index, value)}
                  count={4}
                />
              </List.Item>
            )}
            style={{ marginTop: 10 }}
          />
        </Col>
      </Row>

      {/* ✅ Comment ở dưới cùng */}
      <Form layout="vertical" style={{ marginTop: 20 }}>
        <Form.Item label="Comment">
          <TextArea
            rows={4}
            value={evaluation}
            onChange={(e) => setEvaluation(e.target.value)}
            placeholder="Enter evaluation comment..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ✅ Thêm PropTypes để tránh lỗi
EvaluationModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
};

export default EvaluationModal;
