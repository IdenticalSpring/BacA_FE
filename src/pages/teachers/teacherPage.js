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
  Row,
  Col,
  Spin,
  Alert,
  Grid,
  Tabs,
  notification,
  message,
  Badge,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  BookOutlined,
  FormOutlined,
  BarChartOutlined,
  YoutubeOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
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
import CreateLesson from "components/TeacherPageComponent/CreateLesson";
import LessonBySchedule from "components/TeacherPageComponent/LessonBySchedule";
import LessonMangement from "components/TeacherPageComponent/LessonMangement";
import homeWorkService from "services/homeWorkService";
import HomeWorkBySchedule from "components/HomeWorkComponent/HomeWorkBySchedule";
import CreateHomeWork from "components/HomeWorkComponent/CreateHomeWork";
import HomeWorkMangement from "components/HomeWorkComponent/HomeWorkMangement";
const { Header } = Layout;
const { Title, Text } = Typography;
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
  const [lessons, setLessons] = useState(null);
  const [homeWorksData, setHomeWorksData] = useState([]);
  const [homeWorks, setHomeWorks] = useState(null);
  const [lessonByScheduleData, setLessonByScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCreateHomeWork, setLoadingCreateHomeWork] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3); // Example notification count
  const [loadingCreateLesson, setLoadingCreateLesson] = useState(false);
  const [error, setError] = useState("");
  const [hasClassToday, setHasClassToday] = useState(false);
  const [classData, setClassData] = useState(null);
  // Homework form states
  const [homeworkTitle, setHomeworkTitle] = useState("");
  const [homeworkDescription, setHomeworkDescription] = useState("");
  const [textToSpeech, setTextToSpeech] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loadingTTSHomeWork, setLoadingTTSHomeWork] = useState(false);
  const [loadingTTSLesson, setLoadingTTSLesson] = useState(false);
  const [loadingTTSForUpdateHomeWork, setLoadingTTSForUpdateHomeWork] = useState(false);
  const [loadingTTSForUpdateLesson, setLoadingTTSForUpdateLesson] = useState(false);
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
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isEvaluationModalVisible, setIsEvaluationModalVisible] = useState(false);
  const [assignmentModal, setAssignmentModal] = useState(false);
  const [homeworkModal, setHomeworkModal] = useState(false);
  const [activeTab, setActiveTab] = useState("lesson");
  const [levels, setLevels] = useState(null);
  const [modalUpdateHomeWorkVisible, setModalUpdateHomeWorkVisible] = useState(false);
  const [modalUpdateLessonVisible, setModalUpdateLessonVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingHomeWork, setEditingHomeWork] = useState(null);
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
  useEffect(() => {
    fetchLessons();
  }, [loadingCreateLesson]);

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
  useEffect(() => {
    fetchHomeWork();
  }, [loadingCreateHomeWork]);

  const fetchHomeWork = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      // Giải mã token để lấy role
      const decoded = jwtDecode(token);
      if (!decoded) {
        return;
      }
      const data = await homeWorkService.getHomeWorkByTeacherId(decoded.userId);
      setHomeWorks(data);
    } catch (err) {
      console.log(err);

      message.error("Failed to load homeworks!", err);
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
  const openAssignmentModal = () => {
    setAssignmentModal(true);
  };

  const openHomeworkModal = () => {
    setHomeworkModal(true);
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
        description: "Class is not scheduled for today",
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
      {/* <Menu.Item
        key="evaluation"
        icon={<BarChartOutlined />}
        onClick={() => handleViewEvaluation(student)}
      >
        Evaluation
      </Menu.Item> */}
    </Menu>
  );

  const handleSelectStudent = (student) => {
    setSelectedStudents((prev) => {
      if (prev.some((s) => s.id === student.id)) {
        // Nếu học sinh đã được chọn, xóa khỏi danh sách
        return prev.filter((s) => s.id !== student.id);
      } else {
        // Nếu chưa được chọn, thêm vào danh sách
        return [...prev, student];
      }
    });
  };

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

  // const handleViewEvaluation = (student) => {
  //   if (!hasClassToday) {
  //     notification.warning({
  //       message: "No Class Today",
  //       description: "Class is scheduled for today",
  //       placement: "topRight",
  //       duration: 4,
  //     });
  //     return;
  //   }
  //   setSelectedStudent(student);
  //   setIsEvaluationModalVisible(true);
  // };

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
  }, [selectedClass, loadingCreateHomeWork, loadingCreateLesson]);

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
      const fetchClass = async () => {
        try {
          const data = await classService.getClassById(selectedClass);
          setClassData(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách học sinh:", error);
          setClassData(null);
        }
      };
      fetchClass();
    }
  }, [selectedClass]);

  const fetchLessonByScheduleAndLessonByLevel = async () => {
    try {
      setLoading(true);
      const data = await lessonByScheduleService.getAllLessonBySchedulesOfClass(selectedClass);
      setLessonByScheduleData(data);

      const classData = classes?.find((c) => c.id === selectedClass);
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
        const lessonsForUpdate = await lessonService.getLessonByLevelAndTeacherId(
          levelAndTeacherId
        );
        setLessonsData(lessonsForUpdate);
        const homeWorkForUpdate = await homeWorkService.getHomeWorkByLevelAndTeacherId(
          levelAndTeacherId
        );
        setHomeWorksData(homeWorkForUpdate);
      }
    } catch (err) {
      setError("Lỗi khi tải dữ liệu lesson_by_schedule!");
    } finally {
      setLoading(false);
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

  // Menu for user dropdown
  const showComingSoon = () => {
    message.info("Coming soon!");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={showComingSoon}>
        Profile
      </Menu.Item>
      <Menu.Item key="policy" icon={<ExclamationCircleOutlined />} onClick={showComingSoon}>
        Policy
      </Menu.Item>
      <Menu.Item key="feedback" icon={<MessageOutlined />} onClick={showComingSoon}>
        Feedback
      </Menu.Item>
      <Menu.Item key="1" icon={<LogoutOutlined />} onClick={handleLogout}>
        Log out
      </Menu.Item>
      {/* <Menu.Item key="2" icon={<FolderOpenOutlined />} onClick={handleManageLessons}>
        Manage my lessons
      </Menu.Item> */}
    </Menu>
  );

  // Enter Test Score
  const handleEnterTestScores = () => {
    if (!selectedClass) {
      notification.warning({
        message: "No Class Selected",
        description: "Please select a class before entering test scores.",
        placement: "topRight",
        duration: 4,
      });
      return;
    }
    navigate("/teacherpage/entertestscore", {
      state: {
        classId: selectedClass, // Truyền classId qua state
      },
    });
  };
  const handleViewNotification = () => {
    message.info("Comming soon...");
  };
  const showHelpModal = () => {
    setHelpModalVisible(true);
  };

  const handleHelpModalClose = () => {
    setHelpModalVisible(false);
  };

  const handleOpenEvaluationModal = () => {
    if (selectedStudents.length === 0) {
      notification.warning({
        message: "No Students Selected",
        description: "Please select at least one student to evaluate.",
        placement: "topRight",
        duration: 4,
      });
      return;
    }
    if (!hasClassToday) {
      notification.warning({
        message: "No Class Today",
        description: "You can only evaluate students on a scheduled class day.",
        placement: "topRight",
        duration: 4,
      });
      return;
    }
    setIsEvaluationModalVisible(true);
  };

  return (
    <Layout style={{ minHeight: "99vh" }}>
      <Sidebar
        teacherName={userName}
        classes={classes}
        selectedClass={selectedClass}
        onSelectClass={handleSelectClass}
      />

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
          <div style={{ display: "flex", alignItems: "center" }}>
            <Title
              level={isMobile ? 5 : 4}
              style={{ margin: 0, color: colors.darkGreen, marginLeft: isMobile ? "25%" : "0" }}
            >
              HappyClass
            </Title>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {/* Notification Bell */}
            <Button
              type="text"
              onClick={handleViewNotification}
              style={{
                marginRight: 12,
                display: "flex",
                alignItems: "center",
                padding: 0,
              }}
            >
              <Badge count={notificationsCount} size="small">
                <BellOutlined style={{ fontSize: 20, color: colors.darkGreen }} />
              </Badge>
            </Button>

            {/* Help/Question Icon */}
            <Button
              type="text"
              onClick={handleViewNotification}
              style={{
                marginRight: 12,
                color: colors.darkGreen,
                padding: 0,
              }}
            >
              <QuestionCircleOutlined style={{ fontSize: 20 }} />
            </Button>

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
          </div>
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
              {hasClassToday ? "Class is scheduled for today" : "Class is not scheduled for today"}
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
          {students?.map((student) => (
            <Col xs={20} sm={10} md={8} lg={6} xl={4} key={student.id}>
              <Dropdown overlay={studentMenu(student)} trigger={["contextMenu"]}>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: `0 2px 8px ${colors.softShadow}`,
                    border: `1px solid ${colors.borderGreen}`,
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    backgroundColor: selectedStudents.some((s) => s.id === student.id)
                      ? colors.paleGreen
                      : colors.white, // Thay đổi màu nền khi được chọn
                  }}
                  hoverable
                  bodyStyle={{ padding: "16px" }}
                  onClick={() => handleSelectStudent(student)} // Thay đổi sự kiện nhấp
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
                    {/* <Typography.Text type="secondary" style={{ display: "block" }}>
                      Level: {student.level || "N/A"}
                    </Typography.Text> */}
                  </div>
                </Card>
              </Dropdown>
            </Col>
          ))}
        </Row>
        {/* Hiển thị Evaluation Modal khi cần */}
        {selectedStudents.length > 0 && (
          <EvaluationModal
            visible={isEvaluationModalVisible}
            onClose={() => setIsEvaluationModalVisible(false)}
            students={selectedStudents} // Truyền danh sách học sinh
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
              onHomework={openHomeworkModal}
              onAssignment={() => openAssignmentModal()}
              onClassReview={handleOpenEvaluationModal}
              onEnterScores={handleEnterTestScores}
              onAttendanceCheck={handleAttendanceCheck}
            />
          </div>
        )}
      </Layout>

      {/* <Modal
        title="Assignment Management"
        open={assignmentModal}
        onCancel={() => setAssignmentModal(false)}
        footer={
          activeTab === "homework"
            ? [
                <Button
                  style={{ marginTop: "20px" }}
                  key="close"
                  onClick={() => setAssignmentModal(false)}
                >
                  Close
                </Button>,
                // <Button
                //   key="submit"
                //   type="primary"
                //   onClick={handleSaveHomework}
                //   style={{ backgroundColor: colors.deepGreen, borderColor: colors.deepGreen }}
                // >
                //   Save
                // </Button>,
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
                  <CreateLesson
                    toolbar={toolbar}
                    quillFormats={quillFormats}
                    levels={levels}
                    isMobile={isMobile}
                    loadingCreateLesson={loadingCreateLesson}
                    setLoadingCreateLesson={setLoadingCreateLesson}
                    teacherId={teacherId}
                  />
                </div>
                <div
                  style={{ maxHeight: "35vh", overflow: "auto", width: isMobile ? "100%" : "49%" }}
                >
                  <LessonBySchedule
                    lessonByScheduleData={lessonByScheduleData}
                    daysOfWeek={daysOfWeek}
                    lessonsData={lessonsData}
                    setLessonByScheduleData={setLessonByScheduleData}
                    isMobile={isMobile}
                  />
                </div>
                <div
                  style={{
                    maxHeight: "35vh",
                    width: "100%",
                    height: "35vh",
                  }}
                >
                  <LessonMangement
                    toolbar={toolbar}
                    quillFormats={quillFormats}
                    levels={levels}
                    isMobile={isMobile}
                    setModalUpdateLessonVisible={setModalUpdateLessonVisible}
                    setEditingLesson={setEditingLesson}
                    modalUpdateLessonVisible={modalUpdateLessonVisible}
                    editingLesson={editingLesson}
                    lessons={lessons}
                    setLessons={setLessons}
                    loading={loading}
                    teacherId={teacherId}
                  />
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
                  <CreateHomeWork
                    toolbar={toolbar}
                    quillFormats={quillFormats}
                    levels={levels}
                    isMobile={isMobile}
                    loadingCreateHomeWork={loadingCreateHomeWork}
                    setLoadingCreateHomeWork={setLoadingCreateHomeWork}
                    teacherId={teacherId}
                    loadingTTS={loadingTTS}
                    setLoadingTTS={setLoadingTTS}
                  />
                </div>
                <div
                  style={{ maxHeight: "35vh", overflow: "auto", width: isMobile ? "100%" : "49%" }}
                >
                  <HomeWorkBySchedule
                    lessonByScheduleData={lessonByScheduleData}
                    daysOfWeek={daysOfWeek}
                    homeWorksData={homeWorksData}
                    setLessonByScheduleData={setLessonByScheduleData}
                    isMobile={isMobile}
                  />
                </div>
                <div
                  style={{
                    maxHeight: "35vh",
                    width: "100%",
                    height: "35vh",
                  }}
                >
                  <HomeWorkMangement
                    toolbar={toolbar}
                    quillFormats={quillFormats}
                    levels={levels}
                    isMobile={isMobile}
                    setModalUpdateHomeWorkVisible={setModalUpdateHomeWorkVisible}
                    setEditingHomeWork={setEditingHomeWork}
                    modalUpdateHomeWorkVisible={modalUpdateHomeWorkVisible}
                    editingHomeWork={editingHomeWork}
                    loading={loading}
                    homeWorks={homeWorks}
                    setHomeWorks={setHomeWorks}
                    loadingTTSForUpdate={loadingTTSForUpdate}
                    setLoadingTTSForUpdate={setLoadingTTSForUpdate}
                    teacherId={teacherId}
                  />
                </div>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Modal> */}

      <Modal
        title="Assignment Management"
        open={assignmentModal}
        onCancel={() => setAssignmentModal(false)}
        footer={[
          <Button
            style={{ marginTop: "20px" }}
            key="close"
            onClick={() => setAssignmentModal(false)}
          >
            Close
          </Button>,
        ]}
        width={isMobile ? "95%" : "95%"}
        centered={true}
        className="assignment-modal"
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
                maxHeight: "60vh",
                width: "100%",
                height: "60vh",
              }}
            >
              <CreateLesson
                toolbar={toolbar}
                quillFormats={quillFormats}
                levels={levels}
                isMobile={isMobile}
                loadingCreateLesson={loadingCreateLesson}
                setLoadingCreateLesson={setLoadingCreateLesson}
                teacherId={teacherId}
                lessonByScheduleData={lessonByScheduleData}
                daysOfWeek={daysOfWeek}
                lessonsData={lessonsData}
                setLessonByScheduleData={setLessonByScheduleData}
                loadingTTSLesson={loadingTTSLesson}
                setLoadingTTSLesson={setLoadingTTSLesson}
                level={classData?.level}
              />
            </div>
            {/* <div
              style={{
                maxHeight: "35vh",
                overflow: "auto",
                width: isMobile ? "100%" : "49%",
              }}
            >
              <LessonBySchedule
                lessonByScheduleData={lessonByScheduleData}
                daysOfWeek={daysOfWeek}
                lessonsData={lessonsData}
                setLessonByScheduleData={setLessonByScheduleData}
                isMobile={isMobile}
              />
            </div> */}
            <div
              style={{
                maxHeight: "35vh",
                width: "100%",
                height: "35vh",
              }}
            >
              <LessonMangement
                toolbar={toolbar}
                quillFormats={quillFormats}
                levels={levels}
                isMobile={isMobile}
                setModalUpdateLessonVisible={setModalUpdateLessonVisible}
                setEditingLesson={setEditingLesson}
                modalUpdateLessonVisible={modalUpdateLessonVisible}
                editingLesson={editingLesson}
                lessons={lessons}
                setLessons={setLessons}
                loading={loading}
                teacherId={teacherId}
                loadingTTSForUpdateLesson={loadingTTSForUpdateLesson}
                setLoadingTTSForUpdateLesson={setLoadingTTSForUpdateLesson}
                level={classData?.level}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Homework Management"
        open={homeworkModal}
        onCancel={() => setHomeworkModal(false)}
        footer={[
          <Button style={{ marginTop: "20px" }} key="close" onClick={() => setHomeworkModal(false)}>
            Close
          </Button>,
        ]}
        width={isMobile ? "95%" : "95%"}
        centered={true}
        className="homework-modal"
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
                maxHeight: "60vh",
                width: "100%",
                height: "60vh",
              }}
            >
              <CreateHomeWork
                toolbar={toolbar}
                quillFormats={quillFormats}
                levels={levels}
                isMobile={isMobile}
                loadingCreateHomeWork={loadingCreateHomeWork}
                setLoadingCreateHomeWork={setLoadingCreateHomeWork}
                teacherId={teacherId}
                loadingTTSHomeWork={loadingTTSHomeWork}
                setLoadingTTSHomeWork={setLoadingTTSHomeWork}
                lessonByScheduleData={lessonByScheduleData}
                daysOfWeek={daysOfWeek}
                homeWorksData={homeWorksData}
                setLessonByScheduleData={setLessonByScheduleData}
                level={classData?.level}
              />
            </div>
            {/* <div
              style={{
                maxHeight: "35vh",
                overflow: "auto",
                width: isMobile ? "100%" : "49%",
              }}
            >
              <HomeWorkBySchedule
                lessonByScheduleData={lessonByScheduleData}
                daysOfWeek={daysOfWeek}
                homeWorksData={homeWorksData}
                setLessonByScheduleData={setLessonByScheduleData}
                isMobile={isMobile}
              />
            </div> */}
            <div
              style={{
                maxHeight: "35vh",
                width: "100%",
                height: "35vh",
              }}
            >
              <HomeWorkMangement
                toolbar={toolbar}
                quillFormats={quillFormats}
                levels={levels}
                isMobile={isMobile}
                setModalUpdateHomeWorkVisible={setModalUpdateHomeWorkVisible}
                setEditingHomeWork={setEditingHomeWork}
                modalUpdateHomeWorkVisible={modalUpdateHomeWorkVisible}
                editingHomeWork={editingHomeWork}
                loading={loading}
                homeWorks={homeWorks}
                setHomeWorks={setHomeWorks}
                loadingTTSForUpdateHomeWork={loadingTTSForUpdateHomeWork}
                setLoadingTTSForUpdateHomeWork={setLoadingTTSForUpdateHomeWork}
                teacherId={teacherId}
                level={classData?.level}
              />
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default TeacherPage;
