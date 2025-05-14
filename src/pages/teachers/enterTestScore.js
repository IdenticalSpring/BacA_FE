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
} from "antd";
import { ArrowLeftOutlined, SaveOutlined, CalculatorOutlined } from "@ant-design/icons";
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
import TestSchedule from "./TestSchedule"; // Import TestSchedule

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Component for rendering Cell
const ScoreCell = ({ value }) => {
  return value || "-";
};

ScoreCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const AvgScoreCell = ({ value }) => {
  return <strong>{value}</strong>;
};

AvgScoreCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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

  const token = sessionStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const teacherId = decoded?.userId;
  const classId = location.state?.classId;

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

      setClassTestSchedules(scheduleData.filter((schedule) => schedule.classID === classId));
      setStudents(studentData);
      setTestSkills(skillData);
      setAssessments(assessmentData);

      // Ghép dữ liệu studentScore và student-score-details
      const studentScores = scoreData
        .filter((score) => studentData.some((student) => student.id === score.studentID))
        .map((score) => {
          const student = studentData.find((s) => s.id === score.studentID);
          const schedule = scheduleData.find((s) => s.id === score.classTestScheduleID);
          const assessment = assessmentData.find((a) => a.id === score.assessmentID);
          const detail = detailsData.find((d) => d.studentScoreID === score.studentScoreID);

          return {
            key: score.studentScoreID,
            studentScoreID: score.studentScoreID,
            studentID: score.studentID,
            studentName: student ? student.name : "Unknown",
            testScheduleID: score.classTestScheduleID,
            testScheduleName: schedule ? `${schedule.date}` : "Unknown",
            assessmentName: assessment ? assessment.name : "Unknown",
            scores: detail ? detail.scores : {},
            avgScore: detail ? detail.avgScore : "-",
            teacherComment: score.teacherComment || "-",
          };
        });

      console.log("Processed previous scores:", studentScores);
      setPreviousScores(studentScores);
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
      const skill = testSkills.find((s) => s.id === skillId);
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
      const promises = selectedStudents.map(async (studentId) => {
        const scoreData = {
          studentID: studentId,
          classTestScheduleID: selectedClassTest,
          teacherID: teacherId,
          teacherComment: values[`${studentId}_teacherComment`],
          assessmentID: values[`${studentId}_assessmentId`],
        };
        const scoreResponse = await studentScoreService.createScoreStudent(scoreData);
        const studentScoreId = scoreResponse.id;

        const avgScore = parseFloat(values[`${studentId}_avgScore`]);
        const scores = selectedTestSkills.reduce((acc, skillId) => {
          const skill = testSkills.find((s) => s.id === skillId);
          acc[skill.name] = values[`${studentId}_score_${skillId}`];
          return acc;
        }, {});

        const scoreDetailsPromises = selectedTestSkills.map((skillId) =>
          studentScoreService.createScoreStudentDetails({
            studentID: studentId,
            testSkillID: skillId,
            score: values[`${studentId}_score_${skillId}`],
            avgScore: avgScore,
            studentScoreID: studentScoreId,
          })
        );

        await Promise.all(scoreDetailsPromises);

        const student = students.find((s) => s.id === studentId);
        const schedule = classTestSchedules.find((s) => s.id === selectedClassTest);
        const assessment = assessments.find((a) => a.id === values[`${studentId}_assessmentId`]);

        return {
          key: studentScoreId,
          studentScoreID: studentScoreId,
          studentID: studentId,
          studentName: student ? student.name : "Unknown",
          testScheduleID: selectedClassTest,
          testScheduleName: schedule ? `${schedule.date}` : "Unknown",
          assessmentName: assessment ? assessment.name : "Unknown",
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
      console.error("Error saving test scores:", error);
      setError("Failed to save test scores. Please try again.");
      notification.error({
        message: "Error",
        description: "Failed to save test scores. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSelectAllStudents = () => {
    const allStudentIds = students.map((student) => student.id);
    setSelectedStudents(allStudentIds);
    setSelectedTestSkills([]);
    form.resetFields();
  };

  const scoreColumns = [
    {
      Header: "Student Name",
      accessor: "studentName",
      width: "15%",
    },
    {
      Header: "Test Schedule",
      accessor: "testScheduleName",
      width: "15%",
    },
    {
      Header: "Assessment",
      accessor: "assessmentName",
      width: "15%",
    },
    ...testSkills.map((skill) => ({
      Header: skill.name,
      accessor: `scores.${skill.name}`,
      width: "8%",
      align: "center",
      Cell: ScoreCell,
    })),
    {
      Header: "Average Score",
      accessor: "avgScore",
      width: "10%",
      align: "center",
      Cell: AvgScoreCell,
    },
    {
      Header: "Teacher Comment",
      accessor: "teacherComment",
      width: "19%",
      Cell: ScoreCell,
    },
  ];

  const filteredScores = useMemo(() => {
    const result = previousScores.filter((score) => {
      const nameMatch = score.studentName.toLowerCase().includes(filterName.toLowerCase());
      const scheduleMatch = filterTestSchedule ? score.testScheduleID === filterTestSchedule : true;
      return nameMatch && scheduleMatch;
    });
    console.log("Filtered scores:", result);
    return result;
  }, [previousScores, filterName, filterTestSchedule]);

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

        {/* Test Schedule Management Section */}
        <Card
          title="Test Schedule Management"
          style={{
            borderRadius: "12px",
            boxShadow: `0 4px 12px ${colors.softShadow}`,
            marginBottom: "24px",
          }}
        >
          <TestSchedule classId={classId} classTestSchedules={classTestSchedules} />
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
                      disabled={!selectedClassTest}
                    >
                      {students.map((student) => (
                        <Option key={student.id} value={student.id}>
                          {student.name}
                        </Option>
                      ))}
                    </Select>
                    <Button
                      type="link"
                      onClick={handleSelectAllStudents}
                      disabled={!selectedClassTest || students.length === 0}
                      style={{ padding: 0, color: colors.deepGreen }}
                    >
                      Select All Students
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>

            {selectedStudents.length > 0 && (
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
                        title={`Scores for ${students.find((s) => s.id === studentId)?.name}`}
                        style={{ marginBottom: 16 }}
                      >
                        <Row gutter={[24, 16]}>
                          {selectedTestSkills.map((skillId) => {
                            const skill = testSkills.find((s) => s.id === skillId);
                            return (
                              <Col xs={24} sm={12} md={6} key={skillId}>
                                <Form.Item
                                  name={`${studentId}_score_${skillId}`}
                                  label={`${skill.name} Score`}
                                  rules={[
                                    {
                                      required: true,
                                      message: `Please enter ${skill.name} score`,
                                    },
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

                            <Form.Item
                              name={`${studentId}_assessmentId`}
                              label="Select Assessment"
                              rules={[{ required: true, message: "Please select an assessment" }]}
                            >
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
                            <Form.Item
                              name={`${studentId}_teacherComment`}
                              label="Teacher Comment"
                              rules={[
                                { required: true, message: "Please enter a teacher comment" },
                              ]}
                            >
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
          <DataTable
            table={{
              columns: scoreColumns,
              rows: filteredScores,
            }}
            isSorted={false}
            entriesPerPage={10}
            showTotalEntries={false}
            noEndBorder
            loading={loading}
          />
          {filteredScores.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Text type="secondary">No previous scores available.</Text>
            </div>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default EnterTestScore;
