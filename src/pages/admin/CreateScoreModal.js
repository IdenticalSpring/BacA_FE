import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Input, Select, InputNumber, Row, Col, notification } from "antd";
import classTestScheduleService from "services/classTestScheduleService";
import studentService from "services/studentService";
import StudentScoreService from "services/studentScoreService";

const { TextArea } = Input;

const CreateScoreModal = ({
  visible,
  onCancel,
  onSuccess,
  classes,
  testSkills,
  assessments,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [allSchedules, setAllSchedules] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState([]);
  const [blockedStudentIds, setBlockedStudentIds] = useState([]);

  const selectedClassId = Form.useWatch("classId", form);
  const selectedScheduleId = Form.useWatch("scheduleId", form);

  const filteredSchedules = useMemo(() => {
    if (!selectedClassId) {
      return [];
    }
    return allSchedules.filter(
      (schedule) =>
        Number(schedule.classID || schedule.classId || schedule.class?.id) ===
        Number(selectedClassId)
    );
  }, [allSchedules, selectedClassId]);

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const schedules = await classTestScheduleService.getAllClassTestSchedule();
        setAllSchedules(schedules || []);
      } catch (error) {
        notification.error({
          message: "Error",
          description: "Không thể tải danh sách lịch kiểm tra.",
        });
      }
    };

    if (visible) {
      form.resetFields();
      setStudentsByClass([]);
      setBlockedStudentIds([]);
      fetchBaseData();
    }
  }, [visible, form]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId) {
        setStudentsByClass([]);
        return;
      }

      try {
        const students = await studentService.getAllStudentsbyClass(selectedClassId);
        setStudentsByClass(students || []);
      } catch (error) {
        setStudentsByClass([]);
        notification.error({
          message: "Error",
          description: "Không thể tải danh sách học sinh theo lớp.",
        });
      }
    };

    form.setFieldValue("scheduleId", undefined);
    form.setFieldValue("studentId", undefined);
    setBlockedStudentIds([]);
    fetchStudents();
  }, [selectedClassId, form]);

  useEffect(() => {
    const fetchBlockedStudents = async () => {
      if (!selectedScheduleId) {
        setBlockedStudentIds([]);
        return;
      }

      try {
        const allScores = await StudentScoreService.getCombinedStudentScores();
        const blocked = allScores
          .filter(
            (score) => Number(score.classTestScheduleID) === Number(selectedScheduleId)
          )
          .map((score) => Number(score.studentID));
        setBlockedStudentIds([...new Set(blocked)]);
      } catch (error) {
        setBlockedStudentIds([]);
        notification.warning({
          message: "Warning",
          description: "Không thể kiểm tra học sinh đã có điểm. Bạn có thể thử lại.",
        });
      }
    };

    form.setFieldValue("studentId", undefined);
    fetchBlockedStudents();
  }, [selectedScheduleId, form]);

  const calculateAvgScore = (scoreValues) => {
    const valid = scoreValues.filter(
      (value) => value !== undefined && value !== null && value !== ""
    );
    if (valid.length === 0) {
      return null;
    }
    const sum = valid.reduce((acc, value) => acc + parseFloat(value), 0);
    return Number((sum / valid.length).toFixed(2));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const selectedClass = classes.find((item) => Number(item.id) === Number(values.classId));
      const teacherID = selectedClass?.teacher?.id || selectedClass?.teacherID;

      if (!teacherID) {
        throw new Error("Không tìm thấy giáo viên phụ trách lớp để gán điểm.");
      }

      const scoreItems = testSkills
        .map((skill) => ({
          testSkillID: skill.id,
          score: values[`skill_${skill.id}`],
        }))
        .filter((item) => item.score !== undefined && item.score !== null && item.score !== "");

      if (scoreItems.length === 0) {
        throw new Error("Vui lòng nhập ít nhất một điểm kỹ năng.");
      }

      const existingScores = await StudentScoreService.getCombinedStudentScores([values.studentId]);
      const hasDuplicate = existingScores.some(
        (score) => Number(score.classTestScheduleID) === Number(values.scheduleId)
      );

      if (hasDuplicate) {
        throw new Error("Học sinh đã có điểm ở lịch thi này. Vui lòng dùng chức năng Sửa điểm.");
      }

      const avgScore = calculateAvgScore(scoreItems.map((item) => item.score));

      const createdScore = await StudentScoreService.createScoreStudent({
        studentID: values.studentId,
        classTestScheduleID: values.scheduleId,
        teacherID,
        teacherComment: values.teacherComment || "",
        assessmentID: values.assessmentId || null,
      });

      try {
        await Promise.all(
          scoreItems.map((item) =>
            StudentScoreService.createScoreStudentDetails({
              studentScoreID: createdScore.id,
              testSkillID: item.testSkillID,
              score: item.score,
              avgScore: avgScore ?? 0,
              studentID: values.studentId,
            })
          )
        );
      } catch (detailError) {
        await StudentScoreService.deleteScoreStudent(createdScore.id);
        throw detailError;
      }

      notification.success({
        message: "Success",
        description: "Đã tạo điểm mới thành công.",
      });

      onSuccess();
      form.resetFields();
    } catch (error) {
      notification.error({
        message: "Error",
        description: error?.message || "Không thể tạo điểm mới.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Nhập điểm mới"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="Lưu điểm"
      cancelText="Hủy"
      width={900}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="classId"
              label="Lớp"
              rules={[{ required: true, message: "Vui lòng chọn lớp" }]}
            >
              <Select placeholder="Chọn lớp" showSearch optionFilterProp="children">
                {classes.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="scheduleId"
              label="Lịch thi"
              rules={[{ required: true, message: "Vui lòng chọn lịch thi" }]}
            >
              <Select
                placeholder="Chọn lịch thi"
                disabled={!selectedClassId}
                showSearch
                optionFilterProp="children"
              >
                {filteredSchedules.map((schedule) => (
                  <Select.Option key={schedule.id} value={schedule.id}>
                    {new Date(schedule.date).toISOString().split("T")[0]}
                    {schedule.test?.name ? ` - ${schedule.test.name}` : ""}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="studentId"
              label="Học sinh"
              rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
            >
              <Select
                placeholder="Chọn học sinh"
                disabled={!selectedClassId || !selectedScheduleId}
                showSearch
                optionFilterProp="children"
              >
                {studentsByClass.map((student) => {
                  const isBlocked = blockedStudentIds.includes(Number(student.id));
                  return (
                    <Select.Option key={student.id} value={student.id} disabled={isBlocked}>
                      {student.name}
                      {isBlocked ? " (đã có điểm)" : ""}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="assessmentId" label="Assessment">
              <Select placeholder="Chọn assessment" allowClear showSearch optionFilterProp="children">
                {assessments.map((assessment) => (
                  <Select.Option key={assessment.id} value={assessment.id}>
                    {assessment.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="teacherComment" label="Nhận xét giáo viên">
              <TextArea rows={2} placeholder="Nhập nhận xét" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 0]}>
          {testSkills.map((skill) => (
            <Col xs={24} md={8} key={skill.id}>
              <Form.Item
                name={`skill_${skill.id}`}
                label={`${skill.name}`}
                rules={[
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null || value === "") {
                        return Promise.resolve();
                      }
                      if (value < 0 || value > 10) {
                        return Promise.reject(new Error("Điểm phải trong khoảng 0-10"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Modal>
  );
};

CreateScoreModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  classes: PropTypes.array,
  testSkills: PropTypes.array,
  assessments: PropTypes.array,
};

CreateScoreModal.defaultProps = {
  classes: [],
  testSkills: [],
  assessments: [],
};

export default CreateScoreModal;