import React, { useState, useEffect, useMemo } from "react";
import {
  Layout,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Select,
  notification,
  Spin,
  Divider,
  InputNumber,
  Row,
  Col,
  Space,
  Breadcrumb,
  Alert,
  message,
  Table,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CalculatorOutlined,
  EditOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";
import studentService from "services/studentService";
import classTestScheduleService from "services/classTestScheduleService";
import studentScoreService from "services/studentScoreService";
import MDTypography from "components/MDTypography";
import testSkillService from "services/testSkillService";
import assessmentService from "services/assessmentService";
import { colors } from "./teacherPage";
import DataTable from "examples/Tables/DataTable";
import TextField from "@mui/material/TextField";
import TestSchedule from "./TestSchedule";
import EditScoreModal from "./EditScoreModal";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const normalizeId = (value) => {
  const normalized = Number(value);
  return Number.isNaN(normalized) ? value : normalized;
};

const sameId = (left, right) => normalizeId(left) === normalizeId(right);

// Component for rendering ScoreCell
const ScoreCell = ({ value }) => {
  return value || "-";
};

ScoreCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// Component for rendering AvgScoreCell
const AvgScoreCell = ({ value }) => {
  return <strong>{value}</strong>;
};

AvgScoreCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// Component for rendering ActionsCell
const ActionsCell = ({ row }) => (
  <Button type="link" icon={<EditOutlined />} onClick={() => row.handleEditScore(row.original)}>
    Edit
  </Button>
);

ActionsCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      key: PropTypes.string,
      studentScoreID: PropTypes.string,
      studentID: PropTypes.string,
      studentName: PropTypes.string,
      testScheduleID: PropTypes.string,
      testScheduleName: PropTypes.string,
      assessmentName: PropTypes.string,
      assessmentID: PropTypes.string,
      scores: PropTypes.object,
      avgScore: PropTypes.string,
      teacherComment: PropTypes.string,
    }).isRequired,
    handleEditScore: PropTypes.func.isRequired,
  }).isRequired,
};

// PropTypes for the Cell function in the Actions column
const actionsCellPropTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      key: PropTypes.string,
      studentScoreID: PropTypes.string,
      studentID: PropTypes.string,
      studentName: PropTypes.string,
      testScheduleID: PropTypes.string,
      testScheduleName: PropTypes.string,
      assessmentName: PropTypes.string,
      assessmentID: PropTypes.string,
      scores: PropTypes.object,
      avgScore: PropTypes.string,
      teacherComment: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

const EnterTestScore = () => {
  const [classTestSchedules, setClassTestSchedules] = useState([]);
  const [selectedClassTest, setSelectedClassTest] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [testSkills, setTestSkills] = useState([]);
  const [selectedTestSkills, setSelectedTestSkills] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [previousScores, setPreviousScores] = useState([]);
  const [filterTestSchedule, setFilterTestSchedule] = useState("");
  const [filterName, setFilterName] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editScoreData, setEditScoreData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [isEntryFormDisabled, setIsEntryFormDisabled] = useState(false);

  const token = sessionStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const teacherId = decoded?.userId;
  const classId = location.state?.classId;

  const [studentsWithScores, setStudentsWithScores] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  useEffect(() => {
    if (classId) {
      fetchInitialData();
    } else {
      notification.error({
        message: "Error",
        description: "No class selected. Please select a class from the Teacher Page.",
      });
      navigate(-1);
    }
  }, [classId]);

  // useEffect(() => {
  //   if (!selectedClassTest) {
  //     setIsEntryFormDisabled(false);
  //     return;
  //   }

  //   // Kiểm tra xem có bản ghi điểm nào đã tồn tại cho lịch thi đang chọn không
  //   const scoresExistForThisTest = previousScores.some(
  //     (score) => score.testScheduleID === selectedClassTest
  //   );

  //   setIsEntryFormDisabled(scoresExistForThisTest);
  // }, [selectedClassTest, previousScores]);

  useEffect(() => {
    if (!selectedClassTest) {
      setIsEntryFormDisabled(false);
      setStudentsWithScores([]); // Reset khi không có lịch thi nào được chọn
      return;
    }

    // Lọc ra những học sinh đã có điểm cho lịch thi này
    const studentIdsWithScores = previousScores
      .filter((score) => sameId(score.testScheduleID, selectedClassTest))
      .map((score) => normalizeId(score.studentID));

    setStudentsWithScores(studentIdsWithScores); // <-- CẬP NHẬT STATE

    // Kiểm tra xem tất cả học sinh đã có điểm chưa
    // (Chúng ta sẽ dùng studentIdsWithScores để kiểm tra điều này sau)
    const allSelectedStudentsHaveScores = selectedStudents.every((id) =>
      studentIdsWithScores.some((studentId) => sameId(studentId, id))
    );

    // Nếu tất cả học sinh trong lớp đã có điểm thì disable toàn bộ form
    const allStudentsInClassHaveScores = students.every((student) =>
      studentIdsWithScores.some((studentId) => sameId(studentId, student.id))
    );
    setIsEntryFormDisabled(allStudentsInClassHaveScores && students.length > 0);
  }, [selectedClassTest, previousScores, students, selectedStudents]); // Thêm dependencies

  const fetchClassTestSchedules = async () => {
    try {
      setLoading(true);
      const scheduleData = await classTestScheduleService.getAllClassTestSchedule();
      // Check both classID and class.id for the filter
      const filteredSchedules = scheduleData.filter((schedule) => {
        const scheduleClassId = schedule.classID || schedule.classId || schedule.class?.id;
        return Number(scheduleClassId) === Number(classId);
      });
      setClassTestSchedules(filteredSchedules);
    } catch (error) {
      console.error("Error fetching class test schedules:", error);
      notification.error({
        message: "Error",
        description: "Failed to refresh test schedules.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [scheduleData, studentData, skillData, assessmentData, scoreData, detailsData] =
        await Promise.all([
          classTestScheduleService.getAllClassTestSchedule(),
          studentService.getAllStudentsbyClass(classId),
          testSkillService.getAllTestSkill(),
          assessmentService.getAllAssessments(),
          studentScoreService.getCombinedStudentScores(),
          studentScoreService.getAllStudentScoreDetailsProcessed(),
        ]);

      console.log("Raw API data:", {
        scheduleData,
        studentData,
        skillData,
        assessmentData,
        scoreData,
        detailsData,
      });

      // Convert to numbers for consistent comparison
      console.log("classId from location.state:", classId, "type:", typeof classId);
      console.log("First schedule item structure:", scheduleData[0]);
      console.log("All scheduleData classIDs:", scheduleData.map(s => ({ 
        id: s.id, 
        classID: s.classID, 
        classId: s.classId,
        class: s.class,
        classIdFromClass: s.class?.id
      })));
      
      // Note: setClassTestSchedules will be called after processing scores
      // to show only schedules that students actually have scores for
      
      setStudents(studentData);
      setTestSkills(skillData);
      setAssessments(assessmentData);

      const studentScores = scoreData
        .filter((score) => studentData.some((student) => Number(student.id) === Number(score.studentID)))
        .map((score) => {
          const student = studentData.find((s) => Number(s.id) === Number(score.studentID));
          const schedule = scheduleData.find((s) => Number(s.id) === Number(score.classTestScheduleID));
          const assessment = assessmentData.find((a) => Number(a.id) === Number(score.assessmentID));
          const detail = detailsData.find((d) => d.studentScoreID === score.studentScoreID);

          // Tính toán lại avgScore một cách chủ động
          const currentAvgScore = detail && detail.scores ? calculateAvgScore(detail.scores) : "-";

          return {
            key: score.studentScoreID,
            studentScoreID: score.studentScoreID,
            studentID: score.studentID,
            studentName: student ? student.name : "Unknown",
            testScheduleID: score.classTestScheduleID,
            testScheduleName: schedule ? `${schedule.date}` : "Unknown",
            assessmentName: assessment ? assessment.name : "Unknown",
            assessmentID: score.assessmentID,
            scores: detail ? detail.scores : {},
            avgScore: currentAvgScore,
            teacherComment: score.teacherComment || "-",
          };
        });

      console.log("Processed previous scores:", studentScores);
      setPreviousScores(studentScores);
      
      // Lấy danh sách schedules từ các scores thực tế của students
      // Thay vì lọc theo classId (có thể không khớp nếu students được chuyển lớp)
      const scheduleIdsFromScores = [...new Set(studentScores.map(s => s.testScheduleID).filter(Boolean))];
      const schedulesForFilter = scheduleData.filter(s => scheduleIdsFromScores.includes(s.id));
      
      console.log("Schedule IDs from scores:", scheduleIdsFromScores);
      console.log("Schedules for filter dropdown (from scores):", schedulesForFilter);
      
      setClassTestSchedules(schedulesForFilter);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Failed to load initial data. Please try again.");
      notification.error({
        message: "Error",
        description: "Failed to load initial data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgScore = (scores) => {
    const validScores = Object.values(scores).filter(
      (score) => score !== undefined && score !== null
    );
    if (validScores.length > 0) {
      return (
        validScores.reduce((sum, score) => sum + parseFloat(score), 0) / validScores.length
      ).toFixed(2);
    }
    return "";
  };

  const handleScoreChange = (studentId) => {
    const values = form.getFieldsValue();
    const scores = selectedTestSkills.reduce((acc, skillId) => {
      const skill = testSkills.find((s) => sameId(s.id, skillId));
      acc[skill.name] = values[`${studentId}_score_${skillId}`];
      return acc;
    }, {});
    const avgScore = calculateAvgScore(scores);
    form.setFieldsValue({ [`${studentId}_avgScore`]: avgScore });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError("");

      const studentIdsWithScoresForSchedule = previousScores
        .filter((score) => sameId(score.testScheduleID, selectedClassTest))
        .map((score) => normalizeId(score.studentID));

      const studentsAlreadyScored = selectedStudents.filter((id) =>
        studentIdsWithScoresForSchedule.some((studentId) => sameId(studentId, id))
      );

      if (studentsAlreadyScored.length > 0) {
        const studentNames = studentsAlreadyScored
          .map((id) => students.find((s) => sameId(s.id, id))?.name)
          .join(", ");
        notification.error({
          message: "Submission Blocked",
          description: `The following students already have scores for this test schedule: ${studentNames}. Please edit their scores in the table below.`,
        });
        setLoading(false);
        return; // Dừng hàm ngay lập tức
      }

      if (selectedStudents.length === 0) {
        notification.warning({
          message: "No Students Selected",
          description: "Please select at least one student without a score to submit.",
        });
        setLoading(false);
        return;
      }
      const promises = selectedStudents.map(async (studentId) => {
        const scoreData = {
          studentID: normalizeId(studentId),
          classTestScheduleID: normalizeId(selectedClassTest),
          teacherID: normalizeId(teacherId),
          teacherComment: values[`${studentId}_teacherComment`],
          assessmentID: values[`${studentId}_assessmentId`]
            ? normalizeId(values[`${studentId}_assessmentId`])
            : null,
        };
        const scoreResponse = await studentScoreService.createScoreStudent(scoreData);
        const studentScoreId = scoreResponse.id;

        const avgScore = parseFloat(values[`${studentId}_avgScore`]);
        const scores = selectedTestSkills.reduce((acc, skillId) => {
          const skill = testSkills.find((s) => sameId(s.id, skillId));
          acc[skill.name] = values[`${studentId}_score_${skillId}`];
          return acc;
        }, {});

        const scoreDetailsPromises = selectedTestSkills.map((skillId) =>
          studentScoreService.createScoreStudentDetails({
            studentID: normalizeId(studentId),
            testSkillID: normalizeId(skillId),
            score: values[`${studentId}_score_${skillId}`],
            avgScore: avgScore,
            studentScoreID: studentScoreId,
          })
        );

        await Promise.all(scoreDetailsPromises);

        const student = students.find((s) => sameId(s.id, studentId));
        const schedule = classTestSchedules.find((s) => sameId(s.id, selectedClassTest));
        const assessment = assessments.find((a) =>
          sameId(a.id, values[`${studentId}_assessmentId`])
        );

        return {
          key: studentScoreId,
          studentScoreID: studentScoreId,
          studentID: studentId,
          studentName: student ? student.name : "Unknown",
          testScheduleID: selectedClassTest,
          testScheduleName: schedule ? `${schedule.date}` : "Unknown",
          assessmentName: assessment ? assessment.name : "Unknown",
          assessmentID: values[`${studentId}_assessmentId`],
          scores: { ...scores },
          avgScore: avgScore,
          teacherComment: values[`${studentId}_teacherComment`],
        };
      });

      const newScores = await Promise.all(promises);
      setPreviousScores((prev) => [...prev, ...newScores]);

      notification.success({
        message: "Success",
        description: "Test scores have been saved successfully.",
      });
      form.resetFields();
      setSelectedTestSkills([]);
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "Failed to save test scores. Please try again.";

      console.error("Error saving test scores:", error);
      setError(errorMessage);
      notification.error({
        message: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // const handleSelectAllStudents = () => {
  //   const allStudentIds = students.map((student) => student.id);
  //   setSelectedStudents(allStudentIds);
  //   setSelectedTestSkills([]);
  //   form.resetFields();
  // };

  const handleSelectAllStudents = () => {
    if (students.length === 0) {
      message.info("No students in this class to select.");
      return;
    }

    // Lọc ra ID của những học sinh CHƯA có điểm cho lịch thi này
    const availableStudentIds = students
      .map((student) => student.id) // Lấy tất cả ID học sinh trong lớp
      .filter((id) => !studentsWithScores.some((studentId) => sameId(studentId, id))); // Loại bỏ những ID đã có trong danh sách `studentsWithScores`

    if (availableStudentIds.length === 0) {
      message.info("All students in this class already have scores for this test schedule.");
    } else {
      message.success(`Selected ${availableStudentIds.length} available student(s).`);
    }

    // Cập nhật state `selectedStudents` chỉ với những học sinh hợp lệ
    setSelectedStudents(availableStudentIds);

    form.resetFields();

    // Bạn có thể quyết định có reset các field khác hay không.
    // Thường thì không cần reset `selectedTestSkills` nếu người dùng đã chọn.
    // form.resetFields(['scores']); // Có thể chỉ reset các field điểm nếu muốn
  };

  const handleEditScore = (record) => {
    setEditScoreData(record);
    setEditModalVisible(true);
  };

  const handleEditModalOk = (updatedScore) => {
    setPreviousScores((prev) =>
      prev.map((score) =>
        score.studentScoreID === updatedScore.studentScoreID ? updatedScore : score
      )
    );
    setEditModalVisible(false);
    setEditScoreData(null);
  };

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
    setEditScoreData(null);
  };

  const scoreColumns = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      width: "15%",
    },
    {
      title: "Test Schedule",
      dataIndex: "testScheduleName",
      key: "testScheduleName",
      width: "15%",
    },
    {
      title: "Assessment",
      dataIndex: "assessmentName",
      key: "assessmentName",
      width: "15%",
    },
    ...testSkills.map((skill) => ({
      title: skill.name,
      dataIndex: ["scores", skill.name],
      key: skill.name,
      width: "8%",
      align: "center",
      render: (value) => value || "-",
    })),
    {
      title: "Average Score",
      dataIndex: "avgScore",
      key: "avgScore",
      width: "10%",
      align: "center",
      render: (value) => <strong>{value}</strong>,
    },
    {
      title: "Actions",
      key: "actions",
      width: "10%",
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEditScore(record)}>
          Edit
        </Button>
      ),
    },
  ];

  const filteredScores = useMemo(() => {
    const result = previousScores.filter((score) => {
      const nameMatch = score.studentName.toLowerCase().includes(filterName.toLowerCase());
      const scheduleMatch = filterTestSchedule ? Number(score.testScheduleID) === Number(filterTestSchedule) : true;
      return nameMatch && scheduleMatch;
    });
    console.log("Filtered scores:", result);
    return result;
  }, [previousScores, filterName, filterTestSchedule]);

  // Auto expand all rows when data changes
  useEffect(() => {
    setExpandedRowKeys(filteredScores.map((_, index) => index));
  }, [filteredScores]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          backgroundColor: colors.lightGreen,
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: `0 2px 8px ${colors.softShadow}`,
          zIndex: 10,
          position: "sticky",
          top: 0,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          style={{
            marginRight: 16,
            backgroundColor: colors.deepGreen,
            color: colors.white,
            border: "none",
          }}
        ></Button>
        <Title level={4} style={{ margin: 0, color: colors.darkGreen }}>
          Enter Test Scores
        </Title>
        <div style={{ width: "32px" }} />
      </Header>

      <Content style={{ padding: "24px", background: colors.white }}>
        <Breadcrumb style={{ marginBottom: "16px" }}>
          <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item>Enter Test Scores</Breadcrumb.Item>
        </Breadcrumb>

        {error && (
          <div style={{ textAlign: "center", padding: "20px", color: colors.error }}>
            <Text type="danger">{error}</Text>
          </div>
        )}

        <Card
          title="Test Schedule Management"
          style={{
            borderRadius: "12px",
            boxShadow: `0 4px 12px ${colors.softShadow}`,
            marginBottom: "24px",
          }}
        >
          <TestSchedule
            classId={classId}
            classTestSchedules={classTestSchedules}
            onScheduleChange={fetchClassTestSchedules}
          />
        </Card>

        <Card
          style={{
            borderRadius: "12px",
            boxShadow: `0 4px 12px ${colors.softShadow}`,
            marginBottom: "24px",
          }}
        >
          <Spin spinning={loading}>
            <Row gutter={[24, 24]}>
              {isEntryFormDisabled && selectedClassTest && (
                <Col xs={24} style={{ marginTop: 16 }}>
                  <Alert
                    message="Scores Already Entered"
                    description="Scores for this test schedule have already been submitted. To modify them, please use the 'Edit' button in the 'Previous Test Scores' table below."
                    type="info"
                    showIcon
                  />
                </Col>
              )}
              <Col xs={24} md={12}>
                <Form.Item label="Select Test Schedule">
                  <Select
                    placeholder="Select a test schedule"
                    value={selectedClassTest}
                    onChange={(value) => {
                      setSelectedClassTest(value);
                      setSelectedTestSkills([]);
                      setSelectedStudents([]);
                      form.resetFields();
                    }}
                    style={{ width: "100%" }}
                  >
                    {classTestSchedules.map((schedule) => (
                      <Option key={schedule.id} value={schedule.id}>
                        {schedule.date}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Select Students">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Select
                      mode="multiple"
                      placeholder="Select students"
                      value={selectedStudents}
                      onChange={(value) => {
                        setSelectedStudents(value);
                        setSelectedTestSkills([]);
                        form.resetFields();
                      }}
                      style={{ width: "100%" }}
                      disabled={!selectedClassTest || isEntryFormDisabled}
                    >
                      {students.map((student) => (
                        <Option
                          key={student.id}
                          value={student.id}
                          disabled={studentsWithScores.some((studentId) =>
                            sameId(studentId, student.id)
                          )}
                        >
                          {student.name}
                        </Option>
                      ))}
                    </Select>
                    <Button
                      type="link"
                      onClick={handleSelectAllStudents}
                      disabled={!selectedClassTest || students.length === 0 || isEntryFormDisabled}
                      style={{ padding: 0, color: colors.deepGreen }}
                    >
                      Select All Students
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>

            {selectedStudents.length > 0 && !isEntryFormDisabled && (
              <>
                <Divider style={{ borderColor: colors.paleGreen }} />
                <Form.Item label="Select Test Skills">
                  <Select
                    mode="multiple"
                    placeholder="Select test skills"
                    value={selectedTestSkills}
                    onChange={(value) => {
                      setSelectedTestSkills(value);
                      form.resetFields();
                    }}
                    style={{ width: "100%" }}
                  >
                    {testSkills.map((skill) => (
                      <Option key={skill.id} value={skill.id}>
                        {skill.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {selectedTestSkills.length > 0 && (
                  <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    {selectedStudents.map((studentId) => (
                      <Card
                        key={studentId}
                        title={`Scores for ${students.find((s) => sameId(s.id, studentId))?.name}`}
                        style={{ marginBottom: 16 }}
                      >
                        <Row gutter={[24, 16]}>
                          {selectedTestSkills.map((skillId) => {
                            const skill = testSkills.find((s) => sameId(s.id, skillId));
                            return (
                              <Col xs={24} sm={12} md={6} key={skillId}>
                                <Form.Item
                                  name={`${studentId}_score_${skillId}`}
                                  label={`${skill.name} Score`}
                                  rules={[
                                    {
                                      type: "number",
                                      min: 0,
                                      max: 10,
                                      message: "Score must be between 0 and 10",
                                    },
                                  ]}
                                >
                                  <InputNumber
                                    placeholder="0-10"
                                    min={0}
                                    max={10}
                                    step={0.1}
                                    precision={1}
                                    style={{ width: "100%" }}
                                    onChange={() => handleScoreChange(studentId)}
                                  />
                                </Form.Item>
                              </Col>
                            );
                          })}
                        </Row>

                        <Row gutter={[24, 16]}>
                          <Col xs={24} md={12}>
                            <Form.Item name={`${studentId}_avgScore`} label="Average Score">
                              <InputNumber
                                min={0}
                                max={10}
                                precision={2}
                                style={{ width: "100%" }}
                                readOnly
                                disabled
                                addonAfter={<CalculatorOutlined />}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <MDTypography variant="caption" color="text" mb={12}>
                              Chú thích trạng thái: Điểm ≤ 5 - Cần cải thiện | 5 ≤ Điểm ≤ 7 - Khá |
                              Điểm = 8 - Giỏi | Điểm = 9, 10 - Xuất sắc
                            </MDTypography>

                            <Form.Item name={`${studentId}_assessmentId`} label="Select Assessment">
                              <Select placeholder="Select an assessment" style={{ width: "100%" }}>
                                {assessments.map((assessment) => (
                                  <Option key={assessment.id} value={assessment.id}>
                                    {assessment.name}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </Col>

                          <Col xs={24}>
                            <Divider style={{ margin: "12px 0 24px 0", borderColor: "#e0e0e0" }} />
                          </Col>

                          <Col xs={24}>
                            <Form.Item name={`${studentId}_teacherComment`} label="Teacher Comment">
                              <Input.TextArea rows={3} placeholder="Enter your comment here" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}

                    <Form.Item style={{ marginTop: "30px", textAlign: "right" }}>
                      <Space>
                        <Button onClick={() => form.resetFields()}>Reset</Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          loading={loading}
                          style={{
                            backgroundColor: colors.emerald,
                            borderColor: colors.emerald,
                          }}
                        >
                          Save Scores
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                )}
              </>
            )}

            {!selectedClassTest && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Text type="secondary">Please select a test schedule to continue.</Text>
              </div>
            )}

            {selectedClassTest && selectedStudents.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Text type="secondary">
                  Please select at least one student to enter test scores.
                </Text>
              </div>
            )}
          </Spin>
        </Card>

        <Card
          title="Previous Test Scores"
          style={{
            borderRadius: "12px",
            boxShadow: `0 4px 12px ${colors.softShadow}`,
          }}
        >
          <Space style={{ marginBottom: 16, width: "100%", justifyContent: "flex-end" }}>
            <Select
              placeholder="Filter by Test Schedule"
              value={filterTestSchedule}
              onChange={(value) => setFilterTestSchedule(value)}
              style={{ width: 200 }}
              allowClear
            >
              {classTestSchedules.map((schedule) => (
                <Option key={schedule.id} value={schedule.id}>
                  {schedule.date}
                </Option>
              ))}
            </Select>
            <TextField
              label="Filter by Student Name"
              variant="outlined"
              size="small"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              sx={{ backgroundColor: "white", borderRadius: "4px", width: 200 }}
            />
          </Space>
          <Table
            columns={scoreColumns}
            dataSource={filteredScores.map((score, index) => ({ ...score, key: index }))}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            scroll={{ x: true }}
            loading={loading}
            locale={{
              emptyText:
                filteredScores.length === 0 && !loading ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text type="secondary">No previous scores available.</Text>
                  </div>
                ) : null,
            }}
            expandable={{
              expandedRowRender: (record) => (
                <Card
                  size="small"
                  style={{
                    backgroundColor: "#f9f9f9",
                    border: `1px solid ${colors.paleGreen || "#d9f7be"}`,
                    margin: "8px 0",
                  }}
                >
                  <Row gutter={[16, 8]}>
                    <Col xs={24}>
                      <Text strong style={{ color: colors.darkGreen }}>
                        Teacher Comment:
                      </Text>{" "}
                      <Text>{record.teacherComment || "No comment"}</Text>
                    </Col>
                  </Row>
                </Card>
              ),
              expandedRowKeys: expandedRowKeys,
              onExpand: (expanded, record) => {
                const keys = expanded
                  ? [...expandedRowKeys, record.key]
                  : expandedRowKeys.filter((key) => key !== record.key);
                setExpandedRowKeys(keys);
              },
              expandIcon: ({ expanded, onExpand, record }) =>
                expanded ? (
                  <DownOutlined
                    onClick={(e) => onExpand(record, e)}
                    style={{ color: colors.darkGreen }}
                  />
                ) : (
                  <RightOutlined
                    onClick={(e) => onExpand(record, e)}
                    style={{ color: colors.darkGreen }}
                  />
                ),
            }}
          />
        </Card>

        <EditScoreModal
          visible={editModalVisible}
          onCancel={handleEditModalCancel}
          onOk={handleEditModalOk}
          scoreData={editScoreData}
          testSkills={testSkills}
          assessments={assessments}
          studentName={editScoreData?.studentName}
          loading={editLoading}
        />
      </Content>
    </Layout>
  );
};

export default EnterTestScore;
