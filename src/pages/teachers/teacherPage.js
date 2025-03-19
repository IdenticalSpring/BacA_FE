import React, { useEffect, useState } from "react";
import {
  Layout,
  Avatar,
  Menu,
  Dropdown,
  Button,
  Typography,
  Card,
  Modal,
  Form,
  Input,
  Select,
  Table,
  Space,
  Row,
  Col,
  Divider,
  Spin,
  Alert,
  Empty,
  Grid,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  BookOutlined,
  FormOutlined,
  DeleteOutlined,
  BarChartOutlined,
  PlusOutlined,
  EditOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import classService from "services/classService";
import studentService from "services/studentService";
import lessonService from "services/lessonService";
import lessonByScheduleService from "services/lessonByScheduleService";
import Toolbox from "./toolbox";
import Sidebar from "./sidebar";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { useBreakpoint } = Grid;
// Color palette
export const colors = {
  lightGreen: "#8ED1B0",
  deepGreen: "#368A68",
  white: "#FFFFFF",
  gray: "#F5F5F5",
  darkGray: "#333333",
  accent: "#FFD166",
  lightAccent: "#FFEDC2",
  darkGreen: "#224922",
  paleGreen: "#E8F5EE",
  midGreen: "#5FAE8C",
  errorRed: "#FF6B6B",
  mintGreen: "#C2F0D7",
  paleBlue: "#E6F7FF",
  softShadow: "rgba(0, 128, 96, 0.1)",
  emerald: "#2ECC71",
  highlightGreen: "#43D183",
  safeGreen: "#27AE60",
  borderGreen: "#A8E6C3",
};

const daysOfWeek = [
  "Choose day of week",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Main TeacherPage Component
const TeacherPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [lessonsData, setLessonsData] = useState([]);
  const [lessonByScheduleData, setLessonByScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [lessonModal, setLessonModal] = useState(false);
  const [homeworkModal, setHomeworkModal] = useState(false);

  // Homework form states
  const [homeworkTitle, setHomeworkTitle] = useState("");
  const [homeworkDescription, setHomeworkDescription] = useState("");
  const [textToSpeech, setTextToSpeech] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [mp3Url, setMp3Url] = useState("");
  // Use Ant Design's Grid breakpoints
  const screens = useBreakpoint();

  // Determine if we're on mobile or tablet
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;
  // User info
  const userId = jwtDecode(sessionStorage.getItem("token"));
  const teacherId = userId.userId;
  const userName = userId.username || "Teacher";

  //Student information
  const [selectedStudent, setSelectedStudent] = useState(null);

  const studentMenu = (student) => (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => handleViewProfile(student)}>
        Profile
      </Menu.Item>
      <Menu.Item
        key="evaluation"
        icon={<BarChartOutlined />}
        onClick={() => handleViewEvaluation(student)}
      >
        Evaluation
      </Menu.Item>
    </Menu>
  );

  const handleViewProfile = (student) => {
    Modal.info({
      title: `Profile of ${student.name}`,
      content: (
        <div>
          <p>
            <b>Level:</b> {student.level || "N/A"}
          </p>
          <p>
            <b>Note:</b> {student.note || "N/A"}
          </p>
        </div>
      ),
      onOk() {},
    });
  };

  const handleViewEvaluation = (student) => {
    Modal.confirm({
      title: `Evaluation for ${student.name}`,
      content: (
        <Form>
          <Form.Item label="Evaluation">
            <TextArea rows={4} placeholder="Enter evaluation..." />
          </Form.Item>
        </Form>
      ),
      onOk() {
        console.log("Evaluation saved!");
      },
    });
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await classService.getAllClassesByTeacher(teacherId);
        setClasses(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học:", error);
      }
    };
    fetchClasses();
  }, [teacherId]);

  useEffect(() => {
    if (selectedClass) {
      fetchLessonByScheduleAndLessonByLevel();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        try {
          const data = await studentService.getAllStudentsbyClass(selectedClass);
          setStudents(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách học sinh:", error);
          setStudents([]);
        }
      };
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchLessonByScheduleAndLessonByLevel = async () => {
    try {
      setLoading(true);
      const data = await lessonByScheduleService.getAllLessonBySchedulesOfClass(selectedClass);
      setLessonByScheduleData(data);

      const classData = classes.find((c) => c.id === selectedClass);
      if (classData) {
        const lessons = await lessonService.getLessonByLevel(classData.level);
        setLessonsData(lessons);
      }
    } catch (err) {
      setError("Lỗi khi tải dữ liệu lesson_by_schedule!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLessonBySchedule = async (id, lessonByScheduleData) => {
    try {
      await lessonByScheduleService.updateLessonBySchedule(id, lessonByScheduleData);
      // Success message
    } catch (err) {
      Modal.error({
        title: "Error",
        content: "Lỗi khi cập nhật lesson_by_schedule!",
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/login/teacher";
  };

  const handleSelectClass = (classId) => {
    setSelectedClass(classId);
  };

  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTS(true);

    try {
      const response = await axios.post(
        "https://viettel-ai-api-url.com/tts", // Replace with actual Viettel API
        {
          text: textToSpeech,
          voice: "banmai",
          speed: 1.0,
          format: "mp3",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "YOUR_VIETTEL_AI_KEY",
          },
        }
      );

      setMp3Url(response.data.audioUrl);
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTS(false);
  };

  // Menu for user dropdown
  const userMenu = (
    <Menu>
      <Menu.Item key="1" icon={<LogoutOutlined />} onClick={handleLogout}>
        Log out
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar classes={classes} selectedClass={selectedClass} onSelectClass={handleSelectClass} />

      <Layout style={{ marginLeft: isMobile ? 0 : 260 }}>
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
            height: isMobile ? 60 : 64,
          }}
        >
          <Title
            level={isMobile ? 5 : 4}
            style={{ margin: 0, color: colors.darkGreen, marginLeft: isMobile ? "25%" : "0" }}
          >
            TEACHER DASHBOARD
          </Title>

          <Dropdown overlay={userMenu} placement="bottomRight">
            <Avatar
              style={{
                backgroundColor: colors.deepGreen,
                color: colors.white,
                cursor: "pointer",
              }}
            >
              {userName.charAt(0)}
            </Avatar>
          </Dropdown>
        </Header>

        {/* <Content
          style={{
            padding: isMobile ? "16px" : "24px",
            background: colors.white,
            paddingBottom: selectedClass ? (isMobile ? "70px" : "64px") : "24px",
          }}
        >
          {students.length > 0 ? (
            <Row gutter={[16, 16]}>
              {students.map((student) => (
                <Col xs={24} sm={12} md={8} lg={6} xl={4} key={student.id}>
                  <Card
                    style={{
                      borderRadius: "12px",
                      boxShadow: `0 2px 8px ${colors.softShadow}`,
                      border: `1px solid ${colors.borderGreen}`,
                      transition: "all 0.3s ease",
                    }}
                    hoverable
                    bodyStyle={{ padding: "16px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <Avatar
                        size={isMobile ? 48 : 64}
                        style={{
                          backgroundColor: colors.deepGreen,
                          color: colors.white,
                          marginBottom: "12px",
                        }}
                      >
                        {student.name.charAt(0)}
                      </Avatar>

                      <Typography.Title
                        level={5}
                        style={{ margin: "0 0 4px 0", color: colors.darkGreen }}
                      >
                        {student.name}
                      </Typography.Title>

                      <Typography.Text type="secondary" style={{ display: "block" }}>
                        Level: {student.level || "N/A"}
                      </Typography.Text>

                      <Typography.Text type="secondary" style={{ display: "block" }}>
                        Note: {student.note || "N/A"}
                      </Typography.Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: isMobile ? "24px" : "40px",
                color: colors.darkGray,
                background: colors.paleGreen,
                borderRadius: "12px",
              }}
            >
              <Typography.Title level={4} style={{ color: colors.deepGreen }}>
                Choose your class
              </Typography.Title>
              <Typography.Text style={{ color: colors.darkGreen }}>
                Select a class from the sidebar to view students
              </Typography.Text>
            </div>
          )}
        </Content> */}

        <Row
          gutter={[16, 16]}
          style={{
            padding: isMobile ? "16px" : "24px",
            background: colors.white,
            paddingBottom: selectedClass ? (isMobile ? "70px" : "64px") : "24px",
          }}
        >
          {students.map((student) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={4} key={student.id}>
              <Dropdown overlay={studentMenu(student)} trigger={["click"]}>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: `0 2px 8px ${colors.softShadow}`,
                    border: `1px solid ${colors.borderGreen}`,
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  hoverable
                  bodyStyle={{ padding: "16px" }}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <Avatar
                      size={isMobile ? 48 : 64}
                      style={{
                        backgroundColor: colors.deepGreen,
                        color: colors.white,
                        marginBottom: "12px",
                      }}
                    >
                      {student.name.charAt(0)}
                    </Avatar>

                    <Typography.Title
                      level={5}
                      style={{ margin: "0 0 4px 0", color: colors.darkGreen }}
                    >
                      {student.name}
                    </Typography.Title>

                    <Typography.Text type="secondary" style={{ display: "block" }}>
                      Level: {student.level || "N/A"}
                    </Typography.Text>
                  </div>
                </Card>
              </Dropdown>
            </Col>
          ))}
        </Row>

        {selectedClass && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: isMobile ? 0 : 260,
              right: 0,
              zIndex: 10,
            }}
          >
            <Toolbox
              onManageLessons={() => setLessonModal(true)}
              onHomework={() => setHomeworkModal(true)}
              onClassReview={() => console.log("Class review")}
              onEnterScores={() => console.log("Enter scores")}
            />
          </div>
        )}
      </Layout>

      {/* Lesson Modal */}
      <Modal
        title="Lesson By Schedule"
        open={lessonModal}
        onCancel={() => setLessonModal(false)}
        footer={[
          <Button key="close" onClick={() => setLessonModal(false)}>
            Close
          </Button>,
        ]}
        width={isMobile ? "95%" : 800}
        centered={true}
        className="lesson-modal"
        style={{
          borderRadius: "8px",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
            <div style={{ marginTop: "10px" }}>Loading...</div>
          </div>
        ) : error ? (
          <Alert message="Error" description={error} type="error" showIcon />
        ) : (
          <div style={{ maxHeight: "70vh", overflow: "auto" }}>
            {lessonByScheduleData.length > 0 ? (
              lessonByScheduleData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: "16px",
                    marginBottom: "12px",
                    border: `1px solid ${colors.borderGreen}`,
                    borderRadius: "8px",
                    backgroundColor: colors.paleGreen,
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    gap: "10px",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: colors.darkGreen,
                      flex: 1,
                      marginBottom: isMobile ? "10px" : 0,
                    }}
                  >
                    📅 {daysOfWeek[item.schedule.dayOfWeek]} | {item.date} | 🕒{" "}
                    {item.schedule.startTime} - {item.schedule.endTime}
                  </div>

                  <Select
                    style={{ width: isMobile ? "100%" : "48%" }}
                    placeholder="Select lesson"
                    value={
                      lessonsData.some((lesson) => lesson.id === item.lessonID)
                        ? item.lessonID
                        : undefined
                    }
                    onChange={(value) => {
                      const newData = [...lessonByScheduleData];
                      newData[index] = { ...newData[index], lessonID: value };
                      setLessonByScheduleData(newData);
                      handleUpdateLessonBySchedule(item.id, { lessonID: value });
                    }}
                  >
                    {lessonsData.map((lesson) => (
                      <Option key={lesson.id} value={lesson.id}>
                        {lesson.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              ))
            ) : (
              <Empty description="No lesson schedules found" />
            )}
          </div>
        )}
      </Modal>

      {/* Homework Modal */}
      <Modal
        title="Homework"
        open={homeworkModal}
        onCancel={() => setHomeworkModal(false)}
        footer={[
          <Button key="close" onClick={() => setHomeworkModal(false)}>
            Close
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={{ backgroundColor: colors.deepGreen, borderColor: colors.deepGreen }}
          >
            Save
          </Button>,
        ]}
        width={isMobile ? "95%" : 800}
        centered={true}
        className="homework-modal"
        style={{
          borderRadius: "8px",
        }}
      >
        <Form layout="vertical" style={{ maxHeight: "70vh", overflow: "auto" }}>
          <Form.Item label="Title">
            <Input
              value={homeworkTitle}
              onChange={(e) => setHomeworkTitle(e.target.value)}
              placeholder="Enter homework title"
            />
          </Form.Item>

          <Form.Item label="Description">
            <ReactQuill
              theme="snow"
              value={homeworkDescription}
              onChange={setHomeworkDescription}
              style={{ height: "150px", marginBottom: "40px" }}
            />
          </Form.Item>

          <Form.Item label="Text to Speech">
            <TextArea
              rows={3}
              value={textToSpeech}
              onChange={(e) => setTextToSpeech(e.target.value)}
              placeholder="Enter text to convert to speech"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              onClick={handleConvertToSpeech}
              loading={loadingTTS}
              style={{
                backgroundColor: colors.deepGreen,
                borderColor: colors.deepGreen,
              }}
            >
              Convert to Speech
            </Button>
          </Form.Item>

          {mp3Url && (
            <Form.Item>
              <div style={{ marginBottom: "16px" }}>
                <audio controls style={{ width: "100%" }}>
                  <source src={mp3Url} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </Form.Item>
          )}

          <Form.Item label="YouTube Link">
            <Input
              prefix={<YoutubeOutlined style={{ color: colors.errorRed }} />}
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              placeholder="Paste YouTube link here"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default TeacherPage;
