import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Select, Button, Row, Col, Rate, List, Input } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

// ✅ Màu sắc
const colors = {
  lightGreen: "#8ED1B0",
  deepGreen: "#368A68",
  white: "#FFFFFF",
  gray: "#F5F5F5",
  darkGray: "#333333",
  accent: "#FFD166",
  lightAccent: "#FFEDC2",
  darkGreen: "#224922",
  paleGreen: "#E8F5EE",
  midGreen: "#5FAE8C",
  errorRed: "#FF6B6B",
  mintGreen: "#C2F0D7",
  paleBlue: "#E6F7FF",
  softShadow: "rgba(0, 128, 96, 0.1)",
  emerald: "#2ECC71",
  highlightGreen: "#43D183",
  safeGreen: "#27AE60",
  borderGreen: "#A8E6C3",
};

const SKILL_OPTIONS = ["Vocabulary", "Structure", "Listening", "Speaking", "Reading", "Writing"];

const EvaluationModal = ({ visible, onClose, student }) => {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [evaluation, setEvaluation] = useState("");

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
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
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

  // ✅ Xử lý lưu Evaluation
  const handleOk = () => {
    console.log("Skills:", skills);
    console.log("Behaviors:", behaviors);
    console.log("Comment:", evaluation);
    onClose();
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
    name: PropTypes.string.isRequired,
  }),
};

export default EvaluationModal;
