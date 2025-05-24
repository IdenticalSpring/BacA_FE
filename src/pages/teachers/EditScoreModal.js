import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, InputNumber, Row, Col, notification } from "antd";
import studentScoreService from "services/studentScoreService";
import PropTypes from "prop-types";

const { Option } = Select;
const { TextArea } = Input;

const EditScoreModal = ({
  visible,
  onCancel,
  onOk,
  scoreData,
  testSkills,
  assessments,
  studentName,
  loading,
}) => {
  const [form] = Form.useForm();
  const [existingDetails, setExistingDetails] = useState([]);

  useEffect(() => {
    if (scoreData && visible) {
      console.log("scoreData:", scoreData);
      console.log("studentScoreID:", scoreData.studentScoreID);
      console.log("studentScoreService:", studentScoreService);
      if (!scoreData.studentScoreID) {
        notification.error({
          message: "Error",
          description: "Invalid score data provided.",
        });
        return;
      }
      const fetchDetails = async () => {
        try {
          const details = await studentScoreService.getScoreDetailsByStudentScoreID(
            scoreData.studentScoreID
          );
          console.log("Fetched details:", details);
          setExistingDetails(details);
          const initialValues = {
            assessmentId: scoreData.assessmentID,
            teacherComment: scoreData.teacherComment,
            ...Object.keys(scoreData.scores).reduce((acc, skillName) => {
              const skill = testSkills.find((s) => s.name === skillName);
              if (skill) {
                acc[`score_${skill.id}`] = scoreData.scores[skillName];
              }
              return acc;
            }, {}),
          };
          form.setFieldsValue(initialValues);
        } catch (error) {
          console.error("Error fetching score details:", error);
          notification.error({
            message: "Error",
            description: "Failed to load existing score details.",
          });
        }
      };
      fetchDetails();
    }
  }, [scoreData, testSkills, form, visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const updatedScoreData = {
        studentID: scoreData.studentID,
        classTestScheduleID: scoreData.classTestScheduleID,
        teacherComment: values.teacherComment,
        assessmentID: values.assessmentId,
      };

      const avgScore = calculateAvgScore(values);
      const scoreDetails = testSkills.map((skill) => {
        const existingDetail = existingDetails.find((d) => d.testSkillID === skill.id);
        return {
          id: existingDetail?.id,
          studentScoreID: scoreData.studentScoreID,
          testSkillID: skill.id,
          score: values[`score_${skill.id}`],
          avgScore: parseFloat(avgScore),
        };
      });

      console.log(
        "Updating score for studentScoreID:",
        scoreData.studentScoreID,
        "Details:",
        scoreDetails
      );

      await studentScoreService.editScoreStudent(scoreData.studentScoreID, updatedScoreData);

      const updatePromises = scoreDetails.map((detail) => {
        if (detail.id) {
          return studentScoreService.updateScoreStudentDetails(detail.id, {
            score: detail.score,
            avgScore: detail.avgScore,
          });
        } else {
          return studentScoreService.createScoreStudentDetails({
            studentScoreID: detail.studentScoreID,
            testSkillID: detail.testSkillID,
            score: detail.score,
            avgScore: detail.avgScore,
          });
        }
      });
      await Promise.all(updatePromises);

      notification.success({
        message: "Success",
        description: "Score updated successfully.",
      });

      onOk({
        key: scoreData.studentScoreID,
        studentScoreID: scoreData.studentScoreID,
        studentID: scoreData.studentID,
        studentName: scoreData.studentName,
        testScheduleID: scoreData.classTestScheduleID,
        testScheduleName: scoreData.testScheduleName,
        assessmentName: assessments.find((a) => a.id === values.assessmentId)?.name || "Unknown",
        scores: testSkills.reduce((acc, skill) => {
          acc[skill.name] = values[`score_${skill.id}`];
          return acc;
        }, {}),
        avgScore: avgScore,
        teacherComment: values.teacherComment,
      });
    } catch (error) {
      console.error("Error updating score:", error);
      notification.error({
        message: "Error",
        description: `Failed to update score: ${
          error.message || "Unknown error"
        }. Please try again.`,
      });
    }
  };

  const calculateAvgScore = (values) => {
    const validScores = testSkills
      .map((skill) => values[`score_${skill.id}`])
      .filter((score) => score !== undefined && score !== null);
    if (validScores.length > 0) {
      return (
        validScores.reduce((sum, score) => sum + parseFloat(score), 0) / validScores.length
      ).toFixed(2);
    }
    return "";
  };

  return (
    <Modal
      title={`Edit Scores for ${studentName}`}
      visible={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Save"
      cancelText="Cancel"
    >
      <Form form={form} layout="vertical">
        <Row gutter={[24, 16]}>
          {testSkills.map((skill) => (
            <Col xs={24} sm={12} key={skill.id}>
              <Form.Item
                name={`score_${skill.id}`}
                label={`${skill.name} Score`}
                rules={[
                  { required: true, message: `Please enter ${skill.name} score` },
                  { type: "number", min: 0, max: 10, message: "Score must be between 0 and 10" },
                ]}
              >
                <InputNumber
                  placeholder="0-10"
                  min={0}
                  max={10}
                  step={0.1}
                  precision={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Form.Item
          name="assessmentId"
          label="Select Assessment"
          rules={[{ required: true, message: "Please select an assessment" }]}
        >
          <Select placeholder="Select an assessment">
            {assessments.map((assessment) => (
              <Option key={assessment.id} value={assessment.id}>
                {assessment.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="teacherComment"
          label="Teacher Comment"
          rules={[{ required: true, message: "Please enter a teacher comment" }]}
        >
          <TextArea rows={3} placeholder="Enter your comment here" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

EditScoreModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  scoreData: PropTypes.object,
  testSkills: PropTypes.array.isRequired,
  assessments: PropTypes.array.isRequired,
  studentName: PropTypes.string,
  loading: PropTypes.bool,
};

export default EditScoreModal;
