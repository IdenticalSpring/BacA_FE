import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Select, Button, Row, Col, Rate, List, Input, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import TeacherService from "services/teacherService";
import { jwtDecode } from "jwt-decode";

const { TextArea } = Input;
const { Option } = Select;

const colors = {
  lightGreen: "#8ED1B0",
  deepGreen: "#368A68",
  white: "#FFFFFF",
  gray: "#F5F5F5",
  darkGray: "#333333",
  errorRed: "#FF6B6B",
};

const SKILL_OPTIONS = ["Vocabulary", "Structure", "Listening", "Speaking", "Reading", "Writing"];

const EvaluationModal = ({ visible, onClose, students, schedules }) => {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [behaviors, setBehaviors] = useState([
    { name: "Respect", rating: 0 },
    { name: "Discipline", rating: 0 },
    { name: "Cooperation", rating: 0 },
  ]);

  useEffect(() => {
    if (!visible) {
      setSkills([]);
      setSelectedSkill("");
      setEvaluation("");
      setSelectedSchedule(null);
      setBehaviors([
        { name: "Respect", rating: 0 },
        { name: "Discipline", rating: 0 },
        { name: "Cooperation", rating: 0 },
      ]);
    }
  }, [visible]);

  const handleAddSkill = () => {
    if (selectedSkill && !skills.some((s) => s.name === selectedSkill)) {
      setSkills([...skills, { name: selectedSkill, rating: 0 }]);
      setSelectedSkill("");
    }
  };

  const handleDeleteSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSkillRating = (index, value) => {
    const updatedSkills = [...skills];
    updatedSkills[index].rating = value;
    setSkills(updatedSkills);
  };

  const handleBehaviorRating = (index, value) => {
    const updatedBehaviors = [...behaviors];
    updatedBehaviors[index].rating = value;
    setBehaviors(updatedBehaviors);
  };

  const handleOk = async () => {
    if (!students || students.length === 0) {
      message.error("No students selected for evaluation.");
      return;
    }

    const token = sessionStorage.getItem("token");
    const decoded = jwtDecode(token);
    const teacherID = decoded?.userId;

    const skillRatings = skills.reduce((acc, skill) => {
      acc[skill.name.toLowerCase()] = skill.rating;
      return acc;
    }, {});

    const behaviorRatings = behaviors.reduce((acc, behavior) => {
      acc[behavior.name.toLowerCase()] = behavior.rating;
      return acc;
    }, {});

    setLoading(true);
    try {
      const evaluationPromises = students.map((student) => {
        const payload = {
          teacherID,
          studentID: student.id,
          scheduleID: selectedSchedule,
          comment: evaluation,
          ...skillRatings,
          ...behaviorRatings,
        };
        return TeacherService.evaluationStudent(payload);
      });

      await Promise.all(evaluationPromises);
      message.success(`Evaluations saved successfully for ${students.length} students!`);
      onClose();
    } catch (error) {
      console.error("Error saving evaluations:", error);
      message.error("Failed to save evaluations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Evaluation for ${
        students.length > 1 ? `${students.length} Students` : students[0]?.name || "Unknown"
      }`}
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

      <Form layout="vertical" style={{ marginTop: 20 }}>
        <Form.Item label="Select Schedule">
          <Select
            value={selectedSchedule}
            onChange={(value) => setSelectedSchedule(value)}
            placeholder="Choose a schedule"
            style={{ width: "100%" }}
          >
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <Option key={schedule.id} value={schedule.id}>
                  {schedule.startTime} - {schedule.endTime}
                </Option>
              ))
            ) : (
              <Option disabled>No schedules available</Option>
            )}
          </Select>
        </Form.Item>
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

EvaluationModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  schedules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
    })
  ).isRequired,
};

export default EvaluationModal;
