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
import classService from "services/classService";
import classTestScheduleSerivce from "services/classTestScheduleService";
import studentScoreService from "services/studentScoreService";
import { colors } from "./teacherPage";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const EnterTestScore = () => {
  const [classTestSchedules, setClassTestSchedules] = useState([]);
  const [selectedClassTest, setSelectedClassTest] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [previousScores, setPreviousScores] = useState([]);

  // Get the teacherId from token
  const token = sessionStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const teacherId = decoded?.userId;

  useEffect(() => {
    if (teacherId) {
      fetchClasses();
    }
  }, [teacherId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classService.getAllClassesByTeacher(teacherId);
      setClasses(data);
      // If there's a class ID in location state, select it
      if (location.state?.classId) {
        setSelectedClass(location.state.classId);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      notification.error({
        message: "Error",
        description: "Failed to load classes. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClassTestSchedules = async (classId) => {
    try {
      setLoading(true);
      const data = await classTestScheduleSerivce.getAllClassTestSchedule();

      // Filter test schedules by the selected class ID
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

  useEffect(() => {
    if (selectedClass) {
      fetchClassTestSchedules(selectedClass);
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchPreviousScores = async (studentId) => {
    try {
      setLoading(true);
      const data = await studentScoreService.getScorebyStudentID(studentId);

      // Format the data for the table
      const formattedData = data.map((score, index) => ({
        key: index.toString(),
        id: score.id,
        // testDate: score.testDate,
        // testName: score.testName,a
        writingScore: score.writingScore,
        readingScore: score.readingScore,
        listeningScore: score.listeningScore,
        speakingScore: score.speakingScore,
        avgScore: score.avgScore,
      }));

      setPreviousScores(formattedData);
    } catch (error) {
      //   console.error("Error fetching previous scores:", error);
      //   notification.error({
      //     message: "Error",
      //     description: "Failed to load previous scores. Please try again.",
      //   });
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

  // Calculate average score
  const calculateAvgScore = (writingScore, readingScore, listeningScore, speakingScore) => {
    // All scores need to exist and be between 0-10
    if (
      writingScore !== undefined &&
      readingScore !== undefined &&
      listeningScore !== undefined &&
      speakingScore !== undefined
    ) {
      // Calculate average with proper weighting (equal weights here, adjust as needed)
      return ((writingScore + readingScore + listeningScore + speakingScore) / 4).toFixed(2);
    }
    return "";
  };

  const handleScoreChange = () => {
    const values = form.getFieldsValue();
    const { writingScore, readingScore, listeningScore, speakingScore } = values;

    const avgScore = calculateAvgScore(writingScore, readingScore, listeningScore, speakingScore);

    form.setFieldsValue({ avgScore });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Get the test schedule details to include name/date
      const testSchedule = classTestSchedules.find((schedule) => schedule.id === selectedClassTest);

      // Construct the data to save
      const testScoreData = {
        classTestScheduleID: selectedClassTest,
        studentID: selectedStudent,
        writingScore: values.writingScore,
        readingScore: values.readingScore,
        listeningScore: values.listeningScore,
        speakingScore: values.speakingScore,
        avgScore: parseFloat(values.avgScore),
      };

      console.log("Saving test score:", testScoreData);

      // Use the API service to create the score
      await studentScoreService.createScoreStudent(testScoreData);

      notification.success({
        message: "Success",
        description: "Test scores have been saved successfully.",
      });

      // Refresh the previous scores
      fetchPreviousScores(selectedStudent);

      // Reset form fields but keep selections
      form.resetFields([
        "writingScore",
        "readingScore",
        "listeningScore",
        "speakingScore",
        "avgScore",
      ]);
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
        <div style={{ width: "32px" }} /> {/* Empty div for balance */}
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
              <Col xs={24} md={8}>
                <Form.Item label="Select Class">
                  <Select
                    placeholder="Select a class"
                    value={selectedClass}
                    onChange={(value) => {
                      setSelectedClass(value);
                      setSelectedClassTest(null);
                      setSelectedStudent(null);
                      form.resetFields();
                    }}
                    style={{ width: "100%" }}
                  >
                    {classes.map((cls) => (
                      <Option key={cls.id} value={cls.id}>
                        {cls.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item label="Select Test Schedule">
                  <Select
                    placeholder="Select a test schedule"
                    value={selectedClassTest}
                    onChange={(value) => {
                      setSelectedClassTest(value);
                      setSelectedStudent(null);
                      form.resetFields();
                    }}
                    style={{ width: "100%" }}
                    disabled={!selectedClass}
                  >
                    {classTestSchedules.map((schedule) => (
                      <Option key={schedule.id} value={schedule.id}>
                        {schedule.name} {schedule.date}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item label="Select Student">
                  <Select
                    placeholder="Select a student"
                    value={selectedStudent}
                    onChange={(value) => {
                      setSelectedStudent(value);
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

            <Divider style={{ borderColor: colors.paleGreen }} />

            {selectedStudent && (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  writingScore: "",
                  readingScore: "",
                  listeningScore: "",
                  speakingScore: "",
                  avgScore: "",
                }}
              >
                <Row gutter={[24, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="writingScore"
                      label="Writing Score"
                      rules={[
                        { required: true, message: "Please enter writing score" },
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

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="readingScore"
                      label="Reading Score"
                      rules={[
                        { required: true, message: "Please enter reading score" },
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

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="listeningScore"
                      label="Listening Score"
                      rules={[
                        { required: true, message: "Please enter listening score" },
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

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="speakingScore"
                      label="Speaking Score"
                      rules={[
                        { required: true, message: "Please enter speaking score" },
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

            {!selectedStudent && selectedClassTest && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Text type="secondary">Please select a student to enter test scores.</Text>
              </div>
            )}

            {!selectedClassTest && selectedClass && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Text type="secondary">Please select a test schedule to continue.</Text>
              </div>
            )}

            {!selectedClass && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Text type="secondary">Please select a class to begin.</Text>
              </div>
            )}
          </Spin>
        </Card>

        {selectedClassTest && selectedStudent && (
          <Card
            title="Previous Test Scores"
            style={{
              borderRadius: "12px",
              boxShadow: `0 4px 12px ${colors.softShadow}`,
            }}
          >
            <Table
              columns={[
                // {
                //   title: "Test Date",
                //   dataIndex: "testDate",
                //   key: "testDate",
                // },
                // {
                //   title: "Test Name",
                //   dataIndex: "testName",
                //   key: "testName",
                // },
                {
                  title: "Writing",
                  dataIndex: "writingScore",
                  key: "writingScore",
                },
                {
                  title: "Reading",
                  dataIndex: "readingScore",
                  key: "readingScore",
                },
                {
                  title: "Listening",
                  dataIndex: "listeningScore",
                  key: "listeningScore",
                },
                {
                  title: "Speaking",
                  dataIndex: "speakingScore",
                  key: "speakingScore",
                },
                {
                  title: "Average",
                  dataIndex: "avgScore",
                  key: "avgScore",
                  render: (text) => <strong>{text}</strong>,
                },
              ]}
              dataSource={previousScores}
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
