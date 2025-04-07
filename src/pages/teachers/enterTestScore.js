import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Select,
  Table,
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
import studentService from "services/studentService";
import classTestScheduleSerivce from "services/classTestScheduleService";
import studentScoreService from "services/studentScoreService";
import testSkillService from "services/testSkillService";
import assessmentService from "services/assessmentService";
import { colors } from "./teacherPage";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const EnterTestScore = () => {
  const [classTestSchedules, setClassTestSchedules] = useState([]);
  const [selectedClassTest, setSelectedClassTest] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [testSkills, setTestSkills] = useState([]);
  const [selectedTestSkills, setSelectedTestSkills] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [previousScores, setPreviousScores] = useState([]);

  const token = sessionStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const teacherId = decoded?.userId;
  const classId = location.state?.classId;

  useEffect(() => {
    if (classId) {
      fetchClassTestSchedules(classId);
      fetchStudents(classId);
      fetchTestSkills();
      fetchAssessments();
    } else {
      notification.error({
        message: "Error",
        description: "No class selected. Please select a class from the Teacher Page.",
      });
      navigate(-1);
    }
  }, [classId]);

  const fetchClassTestSchedules = async (classId) => {
    try {
      setLoading(true);
      const data = await classTestScheduleSerivce.getAllClassTestSchedule();
      const filteredData = data.filter((schedule) => schedule.classID === classId);
      setClassTestSchedules(filteredData);
    } catch (error) {
      console.error("Error fetching test schedules:", error);
      notification.error({
        message: "Error",
        description: "Failed to load test schedules. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      setLoading(true);
      const data = await studentService.getAllStudentsbyClass(classId);
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      notification.error({
        message: "Error",
        description: "Failed to load students. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTestSkills = async () => {
    try {
      setLoading(true);
      const data = await testSkillService.getAllTestSkill();
      setTestSkills(data);
    } catch (error) {
      console.error("Error fetching test skills:", error);
      notification.error({
        message: "Error",
        description: "Failed to load test skills. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentService.getAllAssessments();
      setAssessments(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      notification.error({
        message: "Error",
        description: "Failed to load assessments. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudents.length > 0) {
      fetchPreviousScores(selectedStudents);
    } else {
      setPreviousScores([]);
    }
  }, [selectedStudents]);

  const fetchPreviousScores = async (studentIds) => {
    try {
      setLoading(true);
      const data = await studentScoreService.getAllStudentScoreDetails();
      const studentScores = data
        .filter((score) => studentIds.includes(score.studentID))
        .reduce((acc, score) => {
          const existing = acc.find((item) => item.studentScoreID === score.studentScoreID);
          if (existing) {
            existing.scores[score.testSkill.name] = score.score;
          } else {
            acc.push({
              key: score.studentScoreID,
              studentScoreID: score.studentScoreID,
              studentID: score.studentID,
              scores: { [score.testSkill.name]: score.score },
              avgScore: score.avgScore,
              teacherComment: score.teacherComment,
            });
          }
          return acc;
        }, []);
      setPreviousScores(studentScores);
    } catch (error) {
      console.error("Error fetching previous scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgScore = (scores) => {
    const validScores = Object.values(scores).filter(
      (score) => score !== undefined && score !== null
    );
    if (validScores.length > 0) {
      return (validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(2);
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

        return {
          key: studentScoreId,
          studentScoreID: studentScoreId,
          studentID: studentId,
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
      setSelectedAssessment(null);
    } catch (error) {
      console.error("Error saving test scores:", error);
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

  // Hàm chọn tất cả học sinh
  const handleSelectAllStudents = () => {
    const allStudentIds = students.map((student) => student.id);
    setSelectedStudents(allStudentIds);
    setSelectedTestSkills([]); // Reset các kỹ năng đã chọn khi thay đổi danh sách học sinh
    form.resetFields(); // Reset form để tránh xung đột dữ liệu
  };

  const scoreColumns = [
    {
      title: "Student",
      key: "student",
      render: (_, record) => students.find((s) => s.id === record.studentID)?.name || "Unknown",
    },
    ...testSkills.map((skill) => ({
      title: skill.name,
      dataIndex: ["scores", skill.name],
      key: skill.name,
      render: (score) => score || "-",
    })),
    {
      title: "Average",
      dataIndex: "avgScore",
      key: "avgScore",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Teacher Comment",
      dataIndex: "teacherComment",
      key: "teacherComment",
      render: (text) => text || "-",
    },
  ];

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
                        {schedule.name} {schedule.date}
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

        {selectedStudents.length > 0 && (
          <Card
            title="Previous Test Scores"
            style={{
              borderRadius: "12px",
              boxShadow: `0 4px 12px ${colors.softShadow}`,
            }}
          >
            <Table
              columns={scoreColumns}
              dataSource={
                previousScores.length > 0
                  ? previousScores
                  : [{ key: "no-data", scores: {}, avgScore: "No Data" }]
              }
              pagination={false}
              loading={loading}
            />
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default EnterTestScore;
