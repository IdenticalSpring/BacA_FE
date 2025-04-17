import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Select, Button, Row, Col, Rate, List, Input, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import TeacherService from "services/teacherService";
import skillService from "services/skillService";
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

const RATING_DESCRIPTIONS = {
  1: "Cần cải thiện",
  2: "Cố gắng hơn",
  3: "Khá",
  4: "Giỏi",
  5: "Xuất sắc",
};

const EvaluationModal = ({ visible, onClose, students }) => {
  const [skills, setSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [behaviors, setBehaviors] = useState([]);
  const [availableBehaviors, setAvailableBehaviors] = useState([]);
  const [selectedBehavior, setSelectedBehavior] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const today = new Date();
  const padZero = (num) => String(num).padStart(2, "0");
  const todayFormatted = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(
    today.getDate()
  )}`;

  useEffect(() => {
    const fetchSkillsAndBehaviors = async () => {
      try {
        const skillData = await skillService.getAllSkill();
        const fetchedSkills = skillData
          .filter((item) => item?.type === 1)
          .map((skill) => skill?.name);
        const fetchedBehaviors = skillData
          .filter((item) => item?.type === 0)
          .map((behavior) => behavior?.name);

        setAvailableSkills(fetchedSkills);
        setAvailableBehaviors(fetchedBehaviors);
        setAllSkills(skillData);
        setSkills([]);
        setBehaviors([]);
      } catch (error) {
        console.error("Error fetching skills and behaviors:", error);
        message.error("Failed to load skills and behaviors.");
      }
    };

    if (visible) {
      fetchSkillsAndBehaviors();
      setSkills([]);
      setSelectedSkill("");
      setBehaviors([]);
      setSelectedBehavior("");
      setEvaluation("");
      setSelectedSchedule(null);
      setAvailableSkills([]);
      setAvailableBehaviors([]);
      setAllSkills([]);
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

  const handleAddBehavior = () => {
    if (selectedBehavior && !behaviors.some((b) => b.name === selectedBehavior)) {
      setBehaviors([...behaviors, { name: selectedBehavior, rating: 0 }]);
      setSelectedBehavior("");
    }
  };

  const handleDeleteBehavior = (index) => {
    setBehaviors(behaviors.filter((_, i) => i !== index));
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

    setLoading(true);
    try {
      const evaluationPromises = students.map(async (student) => {
        // Kiểm tra comment hiện tại cho ngày và studentID
        const existingComments = await TeacherService.getCommentByDate(todayFormatted);
        const studentComment = existingComments.find(
          (comment) => comment.student?.id === student.id
        );

        const commentPayload = {
          teacherID,
          studentID: student.id,
          scheduleID: student.schedule?.id,
          date: todayFormatted,
          comment: evaluation,
        };

        let teacherCommentID;

        if (studentComment) {
          // Nếu có comment hiện tại, cập nhật comment
          const updateCommentResponse = await TeacherService.updateTeacherComment(
            student.id,
            todayFormatted,
            commentPayload
          );
          teacherCommentID = studentComment.id;
        } else {
          // Nếu không có comment hiện tại, tạo mới comment
          const commentResponse = await TeacherService.evaluationStudent(commentPayload);
          teacherCommentID = commentResponse.id;
        }

        // Kiểm tra điểm skill và behavior hiện tại
        const existingScores = await TeacherService.getStudentScoreSkillandBehaviorByDate(
          todayFormatted
        );
        const studentScores = existingScores.filter((score) => score.studentID === student.id);

        const skillBehaviorPayload = [];

        // Xử lý Skills
        skills.forEach((skill) => {
          const skillData = allSkills.find((s) => s.name === skill.name && s.type === 1);
          if (skillData && skill.rating > 0) {
            skillBehaviorPayload.push({
              studentID: student.id,
              skillType: "1",
              score: skill.rating,
              teacherComment: teacherCommentID,
              skill: skillData.id,
              date: todayFormatted,
            });
          }
        });

        // Xử lý Behaviors
        behaviors.forEach((behavior) => {
          const behaviorData = allSkills.find((s) => s.name === behavior.name && s.type === 0);
          if (behaviorData && behavior.rating > 0) {
            skillBehaviorPayload.push({
              studentID: student.id,
              skillType: "0",
              score: behavior.rating,
              teacherComment: teacherCommentID,
              skill: behaviorData.id,
              date: todayFormatted,
            });
          }
        });

        if (studentScores.length > 0) {
          // Nếu đã có điểm, cập nhật điểm skill và behavior
          await TeacherService.updateStudentScoreSkillandBehaviorByDate(
            student.id,
            todayFormatted,
            skillBehaviorPayload
          );
        } else {
          // Nếu chưa có điểm, tạo mới điểm skill và behavior
          const skillScorePromises = skillBehaviorPayload.map((payload) =>
            TeacherService.skillScoreStudent(payload)
          );
          await Promise.all(skillScorePromises);
        }
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

  const currentSchedule = todayFormatted;

  return (
    <Modal
      title={`Evaluation for ${
        students.length > 1 ? `${students.length} Students` : students[0]?.name || "Unknown"
      } - Schedule: ${currentSchedule}`}
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
            {availableSkills.map((skill) => (
              <Option key={skill} value={skill}>
                {skill}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={handleAddSkill}
            style={{ marginTop: 8, backgroundColor: colors.deepGreen, color: colors.white }}
            disabled={!selectedSkill || skills.some((s) => s.name === selectedSkill)}
          >
            Add Skill
          </Button>
          <List
            dataSource={skills}
            renderItem={(item, index) => (
              <List.Item>
                <span style={{ flex: 1 }}>{item.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Rate
                    value={item.rating}
                    onChange={(value) => handleSkillRating(index, value)}
                    count={5}
                  />
                  <span>{item.rating > 0 ? RATING_DESCRIPTIONS[item.rating] : ""}</span>
                </div>
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
          <Select
            value={selectedBehavior}
            onChange={(value) => setSelectedBehavior(value)}
            style={{ width: "100%" }}
            placeholder="Select a behavior"
          >
            {availableBehaviors.map((behavior) => (
              <Option key={behavior} value={behavior}>
                {behavior}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={handleAddBehavior}
            style={{ marginTop: 8, backgroundColor: colors.deepGreen, color: colors.white }}
            disabled={!selectedBehavior || behaviors.some((b) => b.name === selectedBehavior)}
          >
            Add Behavior
          </Button>
          <List
            dataSource={behaviors}
            renderItem={(item, index) => (
              <List.Item>
                <span style={{ flex: 1 }}>{item.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Rate
                    value={item.rating}
                    onChange={(value) => handleBehaviorRating(index, value)}
                    count={5}
                  />
                  <span>{item.rating > 0 ? RATING_DESCRIPTIONS[item.rating] : ""}</span>
                </div>
                <Button
                  type="text"
                  icon={<DeleteOutlined style={{ color: colors.errorRed }} />}
                  onClick={() => handleDeleteBehavior(index)}
                />
              </List.Item>
            )}
            style={{ marginTop: 10 }}
          />
        </Col>
      </Row>

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

EvaluationModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default EvaluationModal;
