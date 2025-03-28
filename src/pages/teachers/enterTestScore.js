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
import { colors } from "./teacherPage";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const EnterTestScore = () => {
  const [classTestSchedules, setClassTestSchedules] = useState([]);
  const [selectedClassTest, setSelectedClassTest] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [testSkills, setTestSkills] = useState([]);
  const [selectedTestSkills, setSelectedTestSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [previousScores, setPreviousScores] = useState([]);

  // Get the teacherId from token
  const token = sessionStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const teacherId = decoded?.userId;

  // Get classId from location.state
  const classId = location.state?.classId;

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    if (classId) {
      fetchClassTestSchedules(classId);
      fetchStudents(classId);
      fetchTestSkills();
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

  useEffect(() => {
    if (selectedStudent) {
      fetchPreviousScores(selectedStudent);
    } else {
      setPreviousScores([]);
    }
  }, [selectedStudent]);

  const fetchPreviousScores = async (studentId) => {
    try {
      setLoading(true);
      const data = await studentScoreService.getAllStudentScoreDetails();
      const studentScores = data
        .filter((score) => score.studentID === studentId)
        .reduce((acc, score) => {
          const existing = acc.find((item) => item.studentScoreID === score.studentScoreID);
          if (existing) {
            existing.scores[score.testSkill.name] = score.score;
          } else {
            acc.push({
              key: score.studentScoreID,
              studentScoreID: score.studentScoreID,
              scores: { [score.testSkill.name]: score.score },
              avgScore: score.avgScore,
            });
          }
          return acc;
        }, []);
      setPreviousScores(studentScores);
    } catch (error) {
      console.error("Error fetching previous scores:", error);
      // Không hiển thị lỗi nếu không có điểm trước đó
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

  const handleScoreChange = () => {
    const values = form.getFieldsValue();
    const scores = selectedTestSkills.reduce((acc, skillId) => {
      const skill = testSkills.find((s) => s.id === skillId);
      acc[skill.name] = values[`score_${skillId}`];
      return acc;
    }, {});
    const avgScore = calculateAvgScore(scores);
    form.setFieldsValue({ avgScore });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // 1. Gọi createScoreStudent để lưu thông tin chính
      const scoreData = {
        studentID: selectedStudent,
        classTestScheduleID: selectedClassTest,
        teacherID: teacherId,
      };
      const scoreResponse = await studentScoreService.createScoreStudent(scoreData);
      const studentScoreId = scoreResponse.id;

      // 2. Gọi createScoreStudentDetails để lưu chi tiết điểm
      const avgScore = parseFloat(values.avgScore);
      const scores = selectedTestSkills.reduce((acc, skillId) => {
        const skill = testSkills.find((s) => s.id === skillId);
        acc[skill.name] = values[`score_${skillId}`];
        return acc;
      }, {});

      const scoreDetailsPromises = selectedTestSkills.map((skillId) =>
        studentScoreService.createScoreStudentDetails({
          studentID: selectedStudent,
          testSkillID: skillId,
          score: values[`score_${skillId}`],
          avgScore: avgScore,
          studentScoreID: studentScoreId,
        })
      );

      await Promise.all(scoreDetailsPromises);

      // 3. Thêm điểm vừa nhập vào danh sách điểm
      const newScore = {
        key: studentScoreId,
        studentScoreID: studentScoreId,
        scores: { ...scores },
        avgScore: avgScore,
      };
      setPreviousScores((prev) => [...prev, newScore]);

      notification.success({
        message: "Success",
        description: "Test scores have been saved successfully.",
      });
      form.resetFields();
      setSelectedTestSkills([]);
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

  // Tạo cột động cho bảng Previous Test Scores
  const scoreColumns = [
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
                <Form.Item label="Select Student">
                  <Select
                    placeholder="Select a student"
                    value={selectedStudent}
                    onChange={(value) => {
                      setSelectedStudent(value);
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
                </Form.Item>
              </Col>
            </Row>

            {selectedStudent && (
              <>
                <Divider style={{ borderColor: colors.paleGreen }} />
                <Form.Item label="Select Test Skills">
                  <Select
                    mode="multiple"
                    placeholder="Select test skills"
                    value={selectedTestSkills}
                    onChange={(value) => {
                      setSelectedTestSkills(value);
                      form.resetFields(
                        testSkills.map((skill) => `score_${skill.id}`).concat("avgScore")
                      );
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
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ avgScore: "" }}
                  >
                    <Row gutter={[24, 16]}>
                      {selectedTestSkills.map((skillId) => {
                        const skill = testSkills.find((s) => s.id === skillId);
                        return (
                          <Col xs={24} sm={12} md={6} key={skillId}>
                            <Form.Item
                              name={`score_${skillId}`}
                              label={`${skill.name} Score`}
                              rules={[
                                { required: true, message: `Please enter ${skill.name} score` },
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
                                onChange={handleScoreChange}
                              />
                            </Form.Item>
                          </Col>
                        );
                      })}
                    </Row>

                    <Row gutter={[24, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item name="avgScore" label="Average Score">
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
                              Save Score
                            </Button>
                          </Space>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                )}
              </>
            )}

            {!selectedClassTest && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Text type="secondary">Please select a test schedule to continue.</Text>
              </div>
            )}

            {selectedClassTest && !selectedStudent && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Text type="secondary">Please select a student to enter test scores.</Text>
              </div>
            )}
          </Spin>
        </Card>

        {selectedStudent && (
          <Card
            title={`Test Scores for ${
              students.find((s) => s.id === selectedStudent)?.name || "Student"
            }`}
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
