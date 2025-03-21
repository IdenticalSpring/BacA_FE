import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Tabs,
  notification,
  message,
  Popconfirm,
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
  FolderOpenOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
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
import EvaluationModal from "./EvaluationModal";
import { useNavigate } from "react-router-dom";
import levelService from "services/levelService";
import ManageLessons from "./ManageLessons";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
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
  const [hasClassToday, setHasClassToday] = useState(false);
  const [scheduleID, setScheduleID] = useState([]);

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
  const navigate = useNavigate();
  //Student information
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEvaluationModalVisible, setIsEvaluationModalVisible] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState(false);
  const [activeTab, setActiveTab] = useState("lesson");
  const [levels, setLevels] = useState(null);
  const [form] = Form.useForm();
  const [formUpdate] = Form.useForm();
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const quillUpdateRef = useRef(null);
  const [quillUpdate, setQuillUpdate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      setQuill(editor);
    }
    if (quillUpdateRef.current) {
      const updateEditor = quillUpdateRef.current.getEditor();
      setQuillUpdate(updateEditor);
    }
  }, [quillRef, quillUpdateRef]);
  const toolbar = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "code-block"],
    ["link", "image"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
  ];

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "align",
  ];
  const imageUpdateHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      // console.log([...formData]);

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );
        console.log(response.data.url);

        // const result = await response.json();

        if (response.status === 201 && quillRef.current) {
          const editor = quillUpdateRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, "image", response.data.url);
        } else {
          message.error("Upload failed. Try again!");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error("Upload error. Please try again!");
      }
    };
  }, []);

  const modulesUpdate = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageUpdateHandler,
      },
    },
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      // Giải mã token để lấy role
      const decoded = jwtDecode(token);
      if (!decoded) {
        return;
      }
      const data = await lessonService.getLessonByTeacherId(decoded.userId);
      setLessons(data);
    } catch (err) {
      console.log(err);

      message.error("Failed to load lessons!", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    formUpdate.setFieldsValue({
      name: lesson.name,
      level: lesson.level,
      linkYoutube: lesson.linkYoutube,
      linkGame: lesson.linkGame,
      description: lesson.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await lessonService.deleteLesson(id);
      setLessons(lessons.filter((lesson) => lesson.id !== id));
      message.success("Lesson deleted successfully");
    } catch (err) {
      message.error("Error deleting lesson!");
    }
  };

  const handleSave = async () => {
    try {
      const values = await formUpdate.validateFields();

      if (editingLesson) {
        await lessonService.editLesson(editingLesson.id, values);
        setLessons(
          lessons.map((lesson) =>
            lesson.id === editingLesson.id ? { ...lesson, ...values } : lesson
          )
        );
        message.success("Lesson updated successfully");
      } else {
        const newLesson = await lessonService.createLesson(values);
        setLessons([...lessons, newLesson]);
        message.success("Lesson created successfully");
      }

      setModalVisible(false);
      form.resetFields();
      setEditingLesson(null);
    } catch (err) {
      message.error("Please check your input and try again");
    }
  };

  const columns = [
    {
      title: "Lesson Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: "15%",
    },
    {
      title: "Link Youtube",
      dataIndex: "linkYoutube",
      key: "linkYoutube",
      width: "20%",
      render: (text) => <Typography.Text ellipsis={{ tooltip: text }}>{text}</Typography.Text>,
    },
    {
      title: "Link Game",
      dataIndex: "linkGame",
      key: "linkGame",
      width: "20%",
      render: (text) => <Typography.Text ellipsis={{ tooltip: text }}>{text}</Typography.Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "25%",
      render: (text) => (
        <Typography.Paragraph ellipsis={{ rows: 2, expandable: true, symbol: "more" }}>
          {text?.replace(/<[^>]*>?/gm, "") || ""}
        </Typography.Paragraph>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{
              backgroundColor: colors.deepGreen,
              borderColor: colors.deepGreen,
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this lesson?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{
              style: { backgroundColor: colors.errorRed, borderColor: colors.errorRed },
            }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      // console.log([...formData]);

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );
        console.log(response.data.url);

        // const result = await response.json();

        if (response.status === 201 && quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, "image", response.data.url);
        } else {
          message.error("Upload failed. Try again!");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error("Upload error. Please try again!");
      }
    };
  }, []);

  const modules = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandler,
      },
    },
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // If we have a video file, we need to update the link field
      // if (videoFile) {
      //   values.link = videoFile.response?.url || videoFile.name;
      // }
      const dataLesson = {
        ...values,
        teacherId: teacherId,
      };
      console.log(dataLesson);

      await lessonService.createLesson(dataLesson);
      message.success("Lesson created successfully!");
      // navigate("/teacherpage/manageLessons");
      form.resetFields();
    } catch (err) {
      message.error("Failed to create lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleSaveHomework = () => {
    // Implementation here
    console.log("Saving homework:", {
      title: homeworkTitle,
      description: homeworkDescription,
      audio: mp3Url,
      youtube: youtubeLink,
    });
  };
  const openAssignmentModal = (tab = "lesson") => {
    setActiveTab(tab);
    setAssignmentModal(true);
  };

  const checkClassScheduleForToday = () => {
    if (!lessonByScheduleData || lessonByScheduleData.length === 0) return false;

    // Get today's date in YYYY-MM-DD format
    const today = new Date();

    const todayFormatted = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    console.log("Today is " + todayFormatted);
    // Check if any lesson schedule matches today's date
    const todaySchedule = lessonByScheduleData.find((schedule) => schedule.date === todayFormatted);
    return todaySchedule !== undefined;
  };
  const getSchedulesForToday = () => {
    if (!lessonByScheduleData || lessonByScheduleData.length === 0) return [];

    // Lấy ngày hôm nay theo format YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // Lọc danh sách các schedule có ngày trùng với hôm nay
    const todaySchedules = lessonByScheduleData
      .filter((schedule) => schedule.date.startsWith(today)) // Lọc đúng ngày
      .map((schedule) => ({
        id: schedule.schedule.id,
        startTime: schedule.schedule.startTime,
        endTime: schedule.schedule.endTime,
      }));

    console.log("Schedule IDs for today:", todaySchedules);
    return todaySchedules;
  };

  useEffect(() => {
    // Check for class today whenever lesson schedule data changes
    if (lessonByScheduleData.length > 0) {
      const hasClass = checkClassScheduleForToday();
      setHasClassToday(hasClass);
    }
  }, [lessonByScheduleData]);

  const schedulesForToday = getSchedulesForToday();

  const handleAttendanceCheck = () => {
    if (!hasClassToday) {
      notification.warning({
        message: "Warning",
        description: "Class is scheduled for today",
        placement: "topRight",
        duration: 4,
      });
      return;
    }

    // Chuyển hướng sang trang AttendanceCheck và truyền dữ liệu qua state
    navigate("/teacherpage/attendanceCheck", {
      state: {
        classId: selectedClass,
        students: students,
        lessonByScheduleData: lessonByScheduleData,
      },
    });
  };

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
    if (!hasClassToday) {
      notification.warning({
        message: "No Class Today",
        description: "Class is scheduled for today",
        placement: "topRight",
        duration: 4,
      });
      return;
    }
    setSelectedStudent(student);
    setIsEvaluationModalVisible(true);
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
    const fetchLevels = async () => {
      try {
        const data = await levelService.getAllLevels();
        setLevels(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách level:", error);
      }
    };
    fetchLevels();
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
      const token = sessionStorage.getItem("token");

      // Giải mã token để lấy role
      const decoded = jwtDecode(token);
      if (!decoded) {
        return;
      }
      if (classData) {
        const levelAndTeacherId = {
          level: classData.level,
          teacherId: decoded.userId,
        };
        const lessons = await lessonService.getLessonByLevelAndTeacherId(levelAndTeacherId);
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
    navigate("/login/teacher");
  };

  const handleSelectClass = (classId) => {
    setSelectedClass(classId);
    setHasClassToday(false); // Reset state
    setLoading(true); // Hiển thị trạng thái loading
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
  const handleManageLessons = () => {
    navigate("/teacherpage/manageLessons");
  };
  // Menu for user dropdown
  const userMenu = (
    <Menu>
      <Menu.Item key="1" icon={<LogoutOutlined />} onClick={handleLogout}>
        Log out
      </Menu.Item>
      {/* <Menu.Item key="2" icon={<FolderOpenOutlined />} onClick={handleManageLessons}>
        Manage my lessons
      </Menu.Item> */}
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

        {selectedClass && (
          <div
            style={{
              padding: "12px 24px",
              backgroundColor: hasClassToday ? colors.mintGreen : colors.lightAccent,
            }}
          >
            <Text style={{ color: hasClassToday ? colors.darkGreen : colors.darkGray }}>
              <strong>Class Status:</strong>{" "}
              {hasClassToday ? "Class is scheduled for today" : "Class is scheduled for today"}
            </Text>
          </div>
        )}

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
        {/* Hiển thị Evaluation Modal khi cần */}
        {selectedStudent && (
          <EvaluationModal
            visible={isEvaluationModalVisible}
            onClose={() => setIsEvaluationModalVisible(false)}
            student={selectedStudent}
            schedules={schedulesForToday}
          />
        )}

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
              onAssignment={() => openAssignmentModal()}
              onClassReview={() => console.log("Class review")}
              onEnterScores={() => console.log("Enter scores")}
              onAttendanceCheck={handleAttendanceCheck}
            />
          </div>
        )}
      </Layout>

      {/* Lesson Modal */}
      <Modal
        title="Assignment Management"
        open={assignmentModal}
        onCancel={() => setAssignmentModal(false)}
        footer={
          activeTab === "homework"
            ? [
                <Button key="close" onClick={() => setAssignmentModal(false)}>
                  Close
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={handleSaveHomework}
                  style={{ backgroundColor: colors.deepGreen, borderColor: colors.deepGreen }}
                >
                  Save
                </Button>,
              ]
            : [
                <Button
                  style={{ marginTop: "20px" }}
                  key="close"
                  onClick={() => setAssignmentModal(false)}
                >
                  Close
                </Button>,
              ]
        }
        width={isMobile ? "95%" : "95%"}
        centered={true}
        className="assignment-modal"
        style={{
          borderRadius: "8px",
        }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" className="assignment-tabs">
          <TabPane
            tab={
              <span>
                <BookOutlined /> Lesson
              </span>
            }
            key="lesson"
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
                <div style={{ marginTop: "10px" }}>Loading...</div>
              </div>
            ) : error ? (
              <Alert message="Error" description={error} type="error" showIcon />
            ) : (
              <div
                style={{
                  maxHeight: "70vh",
                  width: "100%",
                  display: "flex",
                  flexWrap: "wrap",
                  rowGap: isMobile ? "20px" : "20px",
                  justifyContent: "space-between",
                  overflow: "auto",
                }}
              >
                <div
                  style={{
                    maxHeight: "35vh",
                    width: isMobile ? "100%" : "49%",
                    height: "40vh",
                  }}
                >
                  <div style={{ maxHeight: "35vh", overflow: "auto" }}>
                    <Card
                      style={{
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px " + colors.softShadow,
                        background: colors.white,
                        maxWidth: "800px",
                        margin: "0 auto",
                      }}
                    >
                      <div style={{ marginBottom: isMobile ? "" : "14px" }}>
                        {/* <Button
                          icon={<ArrowLeftOutlined />}
                          onClick={() => navigate("/teacherpage/manageLessons")}
                          style={{
                            border: "none",
                            boxShadow: "none",
                            paddingLeft: 0,
                            color: colors.deepGreen,
                          }}
                        >
                          Back to Lessons
                        </Button> */}
                        <Title level={3} style={{ margin: "16px 0", color: colors.darkGreen }}>
                          Create New Lesson
                        </Title>
                        <Divider style={{ borderColor: colors.paleGreen }} />
                      </div>

                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                          name: "",
                          level: "",
                          linkYoutube: "",
                          linkGame: "",
                          description: "",
                        }}
                      >
                        <Form.Item
                          name="name"
                          label="Lesson Name"
                          rules={[
                            { required: true, message: "Please enter the lesson name" },
                            { max: 100, message: "Name cannot be longer than 100 characters" },
                          ]}
                        >
                          <Input
                            placeholder="Enter lesson name"
                            style={{
                              borderRadius: "6px",
                              borderColor: colors.inputBorder,
                            }}
                          />
                        </Form.Item>

                        <Form.Item
                          name="level"
                          label="Level"
                          rules={[{ required: true, message: "Please select a level" }]}
                        >
                          <Select
                            placeholder="Select level"
                            style={{
                              borderRadius: "6px",
                            }}
                          >
                            {levels.map((level, index) => (
                              <Option key={index} value={level.id}>
                                {level.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        {/* <Form.Item
            name="link"
            label="Lesson Video"
            rules={[{ required: true, message: "Please upload a video file" }]}
          >
            <Upload {...uploadProps} listType="picture">
              <Button
                icon={<VideoCameraOutlined />}
                style={{
                  borderColor: colors.inputBorder,
                  borderRadius: "6px",
                  width: "100%",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.deepGreen,
                  backgroundColor: colors.paleGreen,
                }}
              >
                <span style={{ marginLeft: "8px" }}>Select Video File</span>
              </Button>
            </Upload>
            <div style={{ marginTop: "4px", color: colors.darkGray, fontSize: "12px" }}>
              Supported formats: MP4, MOV, AVI, WEBM
            </div>
          </Form.Item> */}
                        <Form.Item
                          name="linkYoutube"
                          label="Lesson Youtube Link"
                          rules={[{ required: true, message: "Please enter the lesson link" }]}
                        >
                          <Input
                            placeholder="Enter lesson youtube link"
                            style={{
                              borderRadius: "6px",
                              borderColor: colors.inputBorder,
                            }}
                          />
                        </Form.Item>
                        <Form.Item name="linkGame" label="Lesson Game Link">
                          <Input
                            placeholder="Enter lesson game link"
                            style={{
                              borderRadius: "6px",
                              borderColor: colors.inputBorder,
                            }}
                          />
                        </Form.Item>
                        <Form.Item
                          name="description"
                          label="Description"
                          rules={[{ required: true, message: "Please enter a description" }]}
                        >
                          <ReactQuill
                            theme="snow"
                            modules={modules}
                            formats={quillFormats}
                            ref={quillRef}
                            style={{
                              height: "250px",
                              marginBottom: "60px", // Consider reducing this
                              borderRadius: "6px",
                              border: `1px solid ${colors.inputBorder}`,
                            }}
                          />
                        </Form.Item>

                        <Form.Item style={{ marginTop: isMobile ? "40px" : "" }}>
                          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                            {/* <Button
                              onClick={() => navigate("/teacherpage/manageLessons")}
                              style={{
                                borderRadius: "6px",
                                borderColor: colors.deepGreen,
                                color: colors.deepGreen,
                              }}
                            >
                              Cancel
                            </Button> */}
                            <Button
                              type="primary"
                              htmlType="submit"
                              loading={loading}
                              icon={<SaveOutlined />}
                              style={{
                                borderRadius: "6px",
                                backgroundColor: colors.emerald,
                                borderColor: colors.emerald,
                                boxShadow: "0 2px 0 " + colors.softShadow,
                              }}
                            >
                              Create Lesson
                            </Button>
                          </Space>
                        </Form.Item>
                      </Form>
                    </Card>
                  </div>
                </div>
                <div
                  style={{ maxHeight: "35vh", overflow: "auto", width: isMobile ? "100%" : "49%" }}
                >
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
                          height: isMobile ? "40%" : "25%",
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
                <div
                  style={{
                    maxHeight: "35vh",
                    width: "100%",
                    height: "35vh",
                  }}
                >
                  <div style={{ padding: "14px" }}>
                    <Card
                      style={{
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px " + colors.softShadow,
                        marginBottom: "24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "24px",
                        }}
                      >
                        <Title level={4} style={{ margin: 0, color: colors.darkGreen }}>
                          Lessons Management
                        </Title>
                      </div>

                      <Table
                        dataSource={lessons}
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        style={{ borderRadius: "8px", overflow: "hidden" }}
                        onRow={(record) => ({
                          style: { cursor: "pointer" },
                        })}
                        scroll={{ x: 1000 }}
                      />
                    </Card>

                    <Modal
                      centered
                      title={editingLesson ? "Edit Lesson" : "Create New Lesson"}
                      open={modalVisible}
                      onCancel={() => {
                        setModalVisible(false);
                        form.resetFields();
                        setEditingLesson(null);
                      }}
                      footer={[
                        <Button
                          style={{ marginTop: isMobile ? "20px" : "" }}
                          key="cancel"
                          onClick={() => {
                            setModalVisible(false);
                            form.resetFields();
                            setEditingLesson(null);
                          }}
                        >
                          Cancel
                        </Button>,
                        <Button
                          key="submit"
                          type="primary"
                          onClick={handleSave}
                          style={{
                            backgroundColor: colors.emerald,
                            borderColor: colors.emerald,
                          }}
                        >
                          {editingLesson ? "Save" : "Create"}
                        </Button>,
                      ]}
                      width={720}
                    >
                      <Form
                        form={formUpdate}
                        layout="vertical"
                        name="lessonForm"
                        initialValues={{
                          name: "",
                          level: "",
                          link: "",
                          description: "",
                        }}
                      >
                        <Form.Item
                          name="name"
                          label="Lesson Name"
                          rules={[{ required: true, message: "Please enter the lesson name" }]}
                        >
                          <Input placeholder="Enter lesson name" />
                        </Form.Item>

                        <Form.Item
                          name="level"
                          label="Level"
                          rules={[{ required: true, message: "Please select a level" }]}
                        >
                          <Select placeholder="Select level">
                            {levels.map((level, index) => (
                              <Option key={index} value={level}>
                                {level}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          name="linkYoutube"
                          label="Lesson Youtube Link"
                          rules={[{ required: true, message: "Please enter the lesson link" }]}
                        >
                          <Input
                            placeholder="Enter lesson youtube link"
                            style={{
                              borderRadius: "6px",
                              borderColor: colors.inputBorder,
                            }}
                          />
                        </Form.Item>
                        <Form.Item name="linkGame" label="Lesson Game Link">
                          <Input
                            placeholder="Enter lesson game link"
                            style={{
                              borderRadius: "6px",
                              borderColor: colors.inputBorder,
                            }}
                          />
                        </Form.Item>

                        <Form.Item
                          name="description"
                          label="Description"
                          rules={[{ required: true, message: "Please enter a description" }]}
                        >
                          <ReactQuill
                            theme="snow"
                            modules={modulesUpdate}
                            formats={quillFormats}
                            ref={quillUpdateRef}
                            style={{
                              height: "250px",
                              marginBottom: "60px", // Consider reducing this
                              borderRadius: "6px",
                              border: `1px solid ${colors.inputBorder}`,
                            }}
                          />
                        </Form.Item>
                      </Form>
                    </Modal>
                  </div>
                </div>
              </div>
            )}
          </TabPane>
          <TabPane
            tab={
              <span>
                <FormOutlined /> Homework
              </span>
            }
            key="homework"
          >
            <Form layout="vertical" style={{ maxHeight: "60vh", overflow: "auto" }}>
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
          </TabPane>
        </Tabs>
      </Modal>
    </Layout>
  );
};

export default TeacherPage;
