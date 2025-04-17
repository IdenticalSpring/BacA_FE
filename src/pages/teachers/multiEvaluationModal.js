import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Select, Button, Row, Col, Table, Input, message } from "antd";
import skillService from "services/skillService";
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

const RATING_DESCRIPTIONS = {
  1: "Needs Improvement",
  2: "Try Harder",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const MultiStudentEvaluationModal = ({ visible, onClose, students }) => {
  const [skills, setSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [behaviors, setBehaviors] = useState([]);
  const [availableBehaviors, setAvailableBehaviors] = useState([]);
  const [selectedBehavior, setSelectedBehavior] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [studentEvaluations, setStudentEvaluations] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchSkillsAndBehaviors = async () => {
      try {
        const skillData = await skillService.getAllSkill();
        const fetchedSkills = skillData
          .filter((item) => item.type === 1)
          .map((skill) => skill.name);
        const fetchedBehaviors = skillData
          .filter((item) => item.type === 0)
          .map((behavior) => behavior.name);

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
      const initialEvaluations = students.map((student) => ({
        studentId: student.id,
        studentName: student.name,
        scheduleID: student.schedule?.id,
        skills: {},
        behaviors: {},
        comment: "",
      }));
      setStudentEvaluations(initialEvaluations);
    } else {
      setSkills([]);
      setSelectedSkill("");
      setBehaviors([]);
      setSelectedBehavior("");
      setSelectedSchedule(null);
      setAvailableSkills([]);
      setAvailableBehaviors([]);
      setAllSkills([]);
      setStudentEvaluations([]);
    }
  }, [visible, students]);

  const handleAddSkill = () => {
    if (selectedSkill && !skills.includes(selectedSkill)) {
      setSkills([...skills, selectedSkill]);
      setStudentEvaluations(
        studentEvaluations.map((item) => ({
          ...item,
          skills: { ...item.skills, [selectedSkill]: 0 },
        }))
      );
      setSelectedSkill("");
    }
  };

  const handleAddBehavior = () => {
    if (selectedBehavior && !behaviors.includes(selectedBehavior)) {
      setBehaviors([...behaviors, selectedBehavior]);
      setStudentEvaluations(
        studentEvaluations.map((item) => ({
          ...item,
          behaviors: { ...item.behaviors, [selectedBehavior]: 0 },
        }))
      );
      setSelectedBehavior("");
    }
  };

  const handleSkillRating = (studentId, skillName, value) => {
    setStudentEvaluations(
      studentEvaluations.map((item) =>
        item.studentId === studentId
          ? { ...item, skills: { ...item.skills, [skillName]: value } }
          : item
      )
    );
  };

  const handleBehaviorRating = (studentId, behaviorName, value) => {
    setStudentEvaluations(
      studentEvaluations.map((item) =>
        item.studentId === studentId
          ? { ...item, behaviors: { ...item.behaviors, [behaviorName]: value } }
          : item
      )
    );
  };

  const handleCommentChange = (studentId, value) => {
    setStudentEvaluations(
      studentEvaluations.map((item) =>
        item.studentId === studentId ? { ...item, comment: value } : item
      )
    );
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
      // Lấy tất cả điểm số hiện tại trong ngày để tái sử dụng
      const existingScores = await TeacherService.getStudentScoreSkillandBehaviorByDate(today);

      const evaluationPromises = studentEvaluations.map(async (studentEval) => {
        // Kiểm tra StudentID hợp lệ
        if (!studentEval.studentId) {
          console.error(`Invalid StudentID for student: ${JSON.stringify(studentEval)}`);
          return;
        }

        // Lọc điểm số hiện tại của StudentID
        const studentScores = existingScores.filter(
          (score) => score.studentID === studentEval.studentId
        );

        // Tạo map để tra cứu điểm theo SkillID
        const scoreBySkillID = studentScores.reduce((acc, score) => {
          if (score.skill?.id) {
            acc[score.skill?.id] = score;
          }
          return acc;
        }, {});

        // Kiểm tra comment hiện tại cho StudentID trong ngày
        const existingComments = await TeacherService.getCommentByDate(today);
        const studentComment = existingComments.find(
          (comment) => comment.student?.id === studentEval.studentId
        );

        const commentPayload = {
          teacherID,
          studentID: studentEval.studentId,
          scheduleID: studentEval.scheduleID || null,
          date: today,
          comment: studentEval.comment,
        };

        let teacherCommentID;

        if (studentComment) {
          // Cập nhật comment nếu đã tồn tại
          const updateCommentResponse = await TeacherService.updateTeacherComment(
            studentEval.studentId,
            today,
            commentPayload
          );
          teacherCommentID = studentComment.id;
        } else {
          // Tạo mới comment nếu chưa có
          const commentResponse = await TeacherService.evaluationStudent(commentPayload);
          teacherCommentID = commentResponse.id;
        }

        // Chuẩn bị payload cho skill và behavior
        const skillBehaviorPayload = [];

        // Xử lý Skills
        Object.entries(studentEval.skills).forEach(([skillName, rating]) => {
          const skillData = allSkills.find((s) => s.name === skillName && s.type === 1);
          if (skillData && rating > 0) {
            if (!skillData.id) {
              console.error(`Invalid SkillID for skill: ${skillName}`);
              return;
            }
            skillBehaviorPayload.push({
              studentID: studentEval.studentId,
              skillType: "1",
              score: rating,
              teacherComment: teacherCommentID,
              skill: skillData.id,
              date: today,
            });
          }
        });

        // Xử lý Behaviors
        Object.entries(studentEval.behaviors).forEach(([behaviorName, rating]) => {
          const behaviorData = allSkills.find((s) => s.name === behaviorName && s.type === 0);
          if (behaviorData && rating > 0) {
            if (!behaviorData.id) {
              console.error(`Invalid BehaviorID for behavior: ${behaviorName}`);
              return;
            }
            skillBehaviorPayload.push({
              studentID: studentEval.studentId,
              skillType: "0",
              score: rating,
              teacherComment: teacherCommentID,
              skill: behaviorData.id,
              date: today,
            });
          }
        });

        // Kiểm tra skillBehaviorPayload
        if (skillBehaviorPayload.length === 0) {
          console.warn(
            `No valid skills or behaviors to evaluate for StudentID: ${studentEval.studentId}`
          );
          return;
        }

        // Phân loại payload thành update và create
        const updatePayload = [];
        const createPayload = [];

        skillBehaviorPayload.forEach((payload) => {
          const existingScore = scoreBySkillID[payload.skill];

          if (existingScore) {
            // Nếu đã có điểm số cho SkillID, thêm vào updatePayload
            updatePayload.push({
              id: existingScore.id,
              studentID: payload.studentID,
              skillType: payload.skillType,
              score: payload.score,
              teacherComment: payload.teacherComment,
              skill: payload.skill,
              date: payload.date,
            });
          } else {
            // Nếu chưa có, thêm vào createPayload
            createPayload.push(payload);
          }
        });

        // Debug payload
        console.log(`StudentID: ${studentEval.studentId}, Update Payload:`, updatePayload);
        console.log(`StudentID: ${studentEval.studentId}, Create Payload:`, createPayload);

        // Cập nhật các bản ghi hiện có
        if (updatePayload.length > 0) {
          await TeacherService.updateStudentScoreSkillandBehaviorByDate(
            studentEval.studentId,
            today,
            updatePayload
          );
        }

        // Tạo mới các bản ghi chưa có
        if (createPayload.length > 0) {
          const skillScorePromises = createPayload.map((payload) =>
            TeacherService.skillScoreStudent(payload)
          );
          await Promise.all(skillScorePromises);
        }
      });

      await Promise.all(evaluationPromises);
      message.success(`Evaluations saved successfully for ${students.length} students!`);
      onClose();
    } catch (error) {
      console.error("Error saving evaluations:", error.response?.data || error.message);
      message.error("Failed to save evaluations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      fixed: "left",
      width: 150,
    },
    ...skills.map((skill) => ({
      title: skill,
      key: skill,
      width: 150,
      render: (record) => (
        <div>
          <Select
            value={record.skills[skill] || 0}
            onChange={(value) => handleSkillRating(record.studentId, skill, value)}
            style={{ width: 150 }}
          >
            <Option value={0}>Select Score</Option>
            <Option value={1}>1 - Cần cải thiện</Option>
            <Option value={2}>2 - Có cố gắng</Option>
            <Option value={3}>3 - Khá</Option>
            <Option value={4}>4 - Giỏi</Option>
            <Option value={5}>5 - Xuất sắc</Option>
          </Select>
        </div>
      ),
    })),
    ...behaviors.map((behavior) => ({
      title: behavior,
      key: behavior,
      width: 150,
      render: (record) => (
        <div>
          <Select
            value={record.behaviors[behavior] || 0}
            onChange={(value) => handleBehaviorRating(record.studentId, behavior, value)}
            style={{ width: 150 }}
          >
            <Option value={0}>Select Score</Option>
            <Option value={1}>1 - Cần cải thiện</Option>
            <Option value={2}>2 - Có cố gắng</Option>
            <Option value={3}>3 - Khá</Option>
            <Option value={4}>4 - Giỏi</Option>
            <Option value={5}>5 - Xuất sắc</Option>
          </Select>
        </div>
      ),
    })),
    {
      title: "Comment",
      key: "comment",
      width: 200,
      render: (record) => (
        <TextArea
          rows={2}
          value={record.comment}
          onChange={(e) => handleCommentChange(record.studentId, e.target.value)}
          placeholder="Enter comment..."
        />
      ),
    },
  ];

  const currentSchedule = today;

  return (
    <Modal
      title={`Evaluation for ${students.length} Students - Schedule: ${currentSchedule}`}
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
      width="90vw"
      height="100vh"
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
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
            disabled={!selectedSkill || skills.includes(selectedSkill)}
          >
            Add Skill
          </Button>
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
            disabled={!selectedBehavior || behaviors.includes(selectedBehavior)}
          >
            Add Behavior
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={studentEvaluations}
        rowKey="studentId"
        pagination={false}
        scroll={{ x: "max-content" }}
        bordered
      />
    </Modal>
  );
};

MultiStudentEvaluationModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default MultiStudentEvaluationModal;
