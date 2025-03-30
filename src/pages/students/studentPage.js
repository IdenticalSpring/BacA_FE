import React, { useEffect, useState, useRef } from "react";
import {
  Layout,
  Typography,
  Avatar,
  Menu,
  Dropdown,
  Button,
  Card,
  Space,
  Divider,
  Drawer,
  Grid,
  List,
  Empty,
  Badge,
  Modal,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BookOutlined,
  FileTextOutlined,
  SoundOutlined,
  TrophyOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import Sidebar from "./sidebar";
import Toolbox from "./toolbox";
import classService from "services/classService";
import studentService from "services/studentService";
import { jwtDecode } from "jwt-decode";
import lessonByScheduleService from "services/lessonByScheduleService";
import lessonService from "services/lessonService";
import StudentScoreTab from "./studentScoreTab";
import homeWorkService from "services/homeWorkService";
import { message } from "antd";
import { colors } from "pages/teachers/sidebar";
import NotificationSection from "components/TeacherPageComponent/NotificationComponent";
import notificationService from "services/notificationService";
import user_notificationService from "services/user_notificationService";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;
const getTimeElapsed = (createdAt) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now - created) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} min`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} hr`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} day${
      Math.floor(diffInSeconds / 86400) !== 1 ? "s" : ""
    }`;
  }
};

const StudentPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedLessonBySchedule, setSelectedLessonBySchedule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [homework, setHomework] = useState([]);
  const [student, setStudent] = useState(null);
  const userId = jwtDecode(sessionStorage.getItem("token"));
  const studentId = userId.userId;
  const userName = userId.username || "Student";
  const [lessonsBySchedule, setLessonsBySchedule] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("scores");
  const [loadingHomework, setLoadingHomework] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0); // Example notification count
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [studentNotifications, setStudentNotifications] = useState([]);
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [errorNotification, setErrorNotification] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  // Use Ant Design's Grid breakpoints

  // Refs cho từng section
  const scoresRef = useRef(null);
  const lessonsRef = useRef(null);
  const homeworkRef = useRef(null);

  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;
  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoadingNotification(true);
        let count = 0;
        const res = await notificationService.getAllGeneralNotifications();
        const studentNotification = await user_notificationService.getAllUserNotificationsOfStudent(
          studentId
        );
        // console.log(studentNotification);

        const studentNotificationsData = studentNotification.map((noti) => {
          if (!noti.status) {
            count++;
          }
          return { ...noti.notification, status: noti.status, user_notificationID: noti.id };
        });
        count += res.length;
        setNotificationsCount(count);
        const fullData = [...res, ...studentNotificationsData];

        if (res[0]?.createdAt) {
          const sortedData = [...fullData].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          const data = sortedData.map((item) => ({
            ...item,
            timeElapsed: getTimeElapsed(item.createdAt),
          }));
          // console.log(data);

          setNotifications(data);
        }
      } catch (error) {
        setErrorNotification(error || "fail to fetch notification");
      } finally {
        setLoadingNotification(true);
      }
    };
    fetchNotification();
  }, []);

  useEffect(() => {
    const fetchStudentById = async () => {
      try {
        const data = await studentService.getStudentById(studentId);
        setStudent(data);
      } catch (error) {
        console.error("Error fetching student info:", error);
      }
    };
    fetchStudentById();
  }, [studentId]);

  useEffect(() => {
    if (student && student.class.id) {
      const fetchLessonByScheduleOfClasses = async () => {
        try {
          const data = await lessonByScheduleService.getAllLessonBySchedulesOfClass(
            student.class.id
          );
          setLessonsBySchedule(data);
        } catch (error) {
          console.error("Error fetching lessons by schedule:", error);
        }
      };
      fetchLessonByScheduleOfClasses();
    }
  }, [student]);

  useEffect(() => {
    const findSelectedLessonBySchedule = lessonsBySchedule.find(
      (lessonBySchedule) => lessonBySchedule.id === selectedLessonBySchedule
    );

    if (findSelectedLessonBySchedule && findSelectedLessonBySchedule.lessonID) {
      const fetchLessonById = async () => {
        try {
          const data = await lessonService.getLessonById(findSelectedLessonBySchedule.lessonID);
          setLessons([data]);

          if (findSelectedLessonBySchedule.homeWorkId) {
            fetchHomeworkByLesson(findSelectedLessonBySchedule.homeWorkId);
          } else {
            fetchHomeworkByLesson(findSelectedLessonBySchedule.id);
          }
        } catch (error) {
          console.error("Error fetching lesson:", error);
          setLessons([]);
          setHomework([]);
        }
      };
      fetchLessonById();
    } else {
      setLessons([]);
      setHomework([]);
    }
  }, [selectedLessonBySchedule]);

  const fetchHomeworkByLesson = async (homeworkId) => {
    try {
      setLoadingHomework(true);
      const homeworkData = await homeWorkService.getHomeWorkById(homeworkId);
      setHomework(Array.isArray(homeworkData) ? homeworkData : [homeworkData]);
    } catch (error) {
      console.error("Error fetching homework:", error);
      setHomework([]);
    } finally {
      setLoadingHomework(false);
    }
  };

  const showHelpModal = () => {
    setHelpModalVisible(true);
  };

  const handleHelpModalClose = () => {
    setHelpModalVisible(false);
  };

  const handleViewNotification = () => {
    setOpenNotification(!openNotification);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/login/student";
  };

  const handleSelectLessonBySchedule = (lessonByScheduleId) => {
    setSelectedLessonBySchedule(lessonByScheduleId);
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const showComingSoon = () => {
    message.info("Coming soon!");
  };

  const menu = (
    <Menu style={{ backgroundColor: colors.paleGreen, borderRadius: "8px" }}>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={showComingSoon}>
        Profile
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const getRandomTime = () => {
    const hours = Math.floor(Math.random() * 12) + 1;
    const minutes = Math.floor(Math.random() * 60);
    const ampm = Math.random() > 0.5 ? "AM" : "PM";
    return `${hours}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
  };

  const SidebarComponent = () => (
    <Sidebar
      lessonsBySchedule={lessonsBySchedule}
      selectedLessonBySchedule={selectedLessonBySchedule}
      onSelectLessonBySchedule={handleSelectLessonBySchedule}
      colors={colors}
      isMobile={isMobile}
      student={student}
    />
  );

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case "scores":
        scrollToSection(scoresRef);
        break;
      case "lessons":
        scrollToSection(lessonsRef);
        break;
      case "homework":
        scrollToSection(homeworkRef);
        break;
      default:
        break;
    }
  };

  const renderLessonContent = () => (
    <List
      itemLayout="vertical"
      size="large"
      dataSource={lessons}
      renderItem={(lesson) => (
        <Card
          style={{
            marginBottom: 16,
            borderRadius: 12,
            boxShadow: `0 2px 8px ${colors.softShadow}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <Avatar
              style={{ backgroundColor: colors.deepGreen, color: colors.white }}
              icon={<BookOutlined />}
              size={40}
            />
            <div style={{ marginLeft: 12 }}>
              <Text strong style={{ fontSize: 16, display: "block", color: colors.darkGreen }}>
                {lesson.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {getRandomTime()} · Cấp độ: {lesson.level || "N/A"} · ID: {lesson.id}
              </Text>
            </div>
          </div>
          <Paragraph
            ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
            style={{ marginBottom: 16 }}
          >
            {lesson.description || " "}
          </Paragraph>
          {(lesson.linkYoutube || lesson.linkSpeech) && (
            <div
              style={{
                backgroundColor: colors.paleGreen,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              {lesson.linkYoutube && (
                <iframe
                  width="100%"
                  height="315"
                  src={lesson.linkYoutube.replace("watch?v=", "embed/")}
                  title="Lesson Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {lesson.linkSpeech && (
                <audio controls style={{ width: "100%", marginTop: 16 }}>
                  <source
                    src={lesson.linkSpeech.replace("/video/upload/", "/raw/upload/")}
                    type="audio/mpeg"
                  />
                  Trình duyệt của bạn không hỗ trợ phát audio.
                </audio>
              )}
            </div>
          )}
          <Divider style={{ margin: "12px 0" }} />
        </Card>
      )}
    />
  );

  const renderHomeworkContent = () => (
    <div>
      {loadingHomework ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div>Đang tải dữ liệu bài tập...</div>
        </div>
      ) : homework.length > 0 ? (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={homework}
          renderItem={(hw) => (
            <Card
              style={{
                marginBottom: 16,
                borderRadius: 12,
                boxShadow: `0 2px 8px ${colors.softShadow}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                <Avatar
                  style={{ backgroundColor: colors.mintGreen, color: colors.deepGreen }}
                  icon={<FileTextOutlined />}
                  size={40}
                />
                <div style={{ marginLeft: 12 }}>
                  <Text strong style={{ fontSize: 16, display: "block", color: colors.darkGreen }}>
                    {hw.title || "Bài tập"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Hạn nộp: {hw.dueDate || "Chưa có hạn nộp"} · Trạng thái:{" "}
                    {hw.status || "Chưa nộp"} · ID: {hw.id}
                  </Text>
                </div>
              </div>
              <Paragraph
                ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
                style={{ marginBottom: 16 }}
              >
                {hw.description || "Chưa có mô tả cho bài tập này."}
              </Paragraph>
              {hw.linkSpeech && (
                <div
                  style={{
                    marginBottom: 16,
                    backgroundColor: colors.paleGreen,
                    padding: 16,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                    <SoundOutlined style={{ marginRight: 8, color: colors.deepGreen }} />
                    <Text strong style={{ color: colors.deepGreen }}>
                      Audio bài tập:
                    </Text>
                  </div>
                  <audio controls style={{ width: "100%", marginTop: hw.linkYoutube ? 16 : 0 }}>
                    <source src={hw.linkSpeech} type="audio/mpeg" />
                    Trình duyệt của bạn không hỗ trợ phát audio.
                  </audio>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <Button
                      type="link"
                      icon={<LinkOutlined />}
                      href={hw.linkSpeech}
                      target="_blank"
                      style={{ color: colors.deepGreen, padding: 0 }}
                    >
                      Tải xuống audio
                    </Button>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="primary"
                  onClick={() => console.log("Nộp bài tập ID:", hw.id)}
                  style={{ backgroundColor: colors.deepGreen, borderColor: colors.deepGreen }}
                >
                  {hw.status === "Đã nộp" ? "Nộp lại" : "Nộp bài"}
                </Button>
              </div>
            </Card>
          )}
        />
      ) : (
        <Empty
          description="Không có bài tập nào cho bài học này"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{
            margin: "40px 0",
            padding: "20px",
            backgroundColor: colors.paleGreen,
            borderRadius: "12px",
          }}
        />
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile && (
        <div style={{ width: "260px", height: "100%", position: "fixed", zIndex: 1001 }}>
          <SidebarComponent />
        </div>
      )}
      {isMobile && (
        <Drawer
          placement="left"
          closable={true}
          onClose={() => setSidebarVisible(false)}
          open={sidebarVisible}
          width="85%"
          bodyStyle={{ padding: 0 }}
          headerStyle={{ display: "none" }}
        >
          <SidebarComponent />
        </Drawer>
      )}
      <Layout style={{ marginLeft: isMobile ? 0 : 260 }}>
        <Header
          style={{
            backgroundColor: colors.lightGreen,
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: `0 2px 8px ${colors.softShadow}`,
            height: 64,
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {isMobile && (
              <Button
                type="text"
                icon={sidebarVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                onClick={toggleSidebar}
                style={{ fontSize: "16px", marginRight: "12px", color: colors.darkGreen }}
              />
            )}
            <Title
              level={isMobile ? 5 : 4}
              style={{
                margin: 0,
                color: colors.darkGreen,
                fontWeight: "bold",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Happy Class
            </Title>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="text"
              onClick={handleViewNotification}
              style={{
                marginRight: 12,
                color: colors.darkGreen,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Badge count={notificationsCount} size="small">
                <BellOutlined style={{ fontSize: 20 }} />
              </Badge>
            </Button>
            <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
              <Avatar
                style={{
                  backgroundColor: colors.deepGreen,
                  color: colors.white,
                  cursor: "pointer",
                  border: `2px solid ${colors.borderGreen}`,
                }}
                icon={<UserOutlined />}
              >
                {userName.charAt(0)}
              </Avatar>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ padding: isMobile ? "10px" : "20px", marginBottom: 70 }}>
          {!selectedLessonBySchedule ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
                flexDirection: "column",
              }}
            >
              <Avatar
                style={{
                  backgroundColor: colors.mintGreen,
                  color: colors.deepGreen,
                  fontSize: isMobile ? 28 : 40,
                  width: isMobile ? 60 : 80,
                  height: isMobile ? 60 : 80,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                ?
              </Avatar>
              <Text
                style={{
                  fontSize: isMobile ? 16 : 18,
                  color: colors.deepGreen,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Vui lòng chọn bài học từ lịch học của bạn
              </Text>
            </div>
          ) : (
            <div>
              {/* Các section */}
              <div ref={scoresRef}>
                <Title level={3} style={{ color: colors.darkGreen, marginBottom: 20 }}>
                  <TrophyOutlined /> Điểm Số
                </Title>
                <StudentScoreTab studentId={studentId} colors={colors} />
                <Divider />
              </div>

              <div ref={lessonsRef}>
                <Title level={3} style={{ color: colors.darkGreen, marginBottom: 20 }}>
                  <BookOutlined /> Bài Học
                </Title>
                {renderLessonContent()}
                <Divider />
              </div>

              <div ref={homeworkRef}>
                <Title level={3} style={{ color: colors.darkGreen, marginBottom: 20 }}>
                  <FileTextOutlined /> Bài Tập
                </Title>
                {renderHomeworkContent()}
              </div>
            </div>
          )}
        </Content>

        {/* Thanh tab điều hướng ở dưới */}
        {selectedLessonBySchedule && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: isMobile ? 0 : 260,
              right: 0,
              backgroundColor: colors.white,
              borderTop: `1px solid ${colors.borderGreen}`,
              zIndex: 999,
              padding: "10px 0",
              display: "flex",
              justifyContent: "center",
              boxShadow: `0 -2px 8px ${colors.softShadow}`,
            }}
          >
            <Space size="large">
              <Button
                type={activeTab === "scores" ? "primary" : "link"}
                icon={<TrophyOutlined />}
                onClick={() => handleTabClick("scores")}
                style={{
                  backgroundColor: activeTab === "scores" ? colors.deepGreen : "transparent",
                  borderColor: activeTab === "scores" ? colors.deepGreen : colors.borderGreen,
                }}
              >
                Điểm Số
              </Button>
              <Button
                type={activeTab === "lessons" ? "primary" : "link"}
                icon={<BookOutlined />}
                onClick={() => handleTabClick("lessons")}
                style={{
                  backgroundColor: activeTab === "lessons" ? colors.deepGreen : "transparent",
                  borderColor: activeTab === "lessons" ? colors.deepGreen : colors.borderGreen,
                }}
              >
                Bài Học
              </Button>
              <Button
                type={activeTab === "homework" ? "primary" : "link"}
                icon={<FileTextOutlined />}
                onClick={() => handleTabClick("homework")}
                style={{
                  backgroundColor: activeTab === "homework" ? colors.deepGreen : "transparent",
                  borderColor: activeTab === "homework" ? colors.deepGreen : colors.borderGreen,
                }}
              >
                Bài Tập
              </Button>
            </Space>
          </div>
        )}
      </Layout>
      <Modal
        open={openNotification}
        onCancel={() => setOpenNotification(false)}
        footer={<></>}
        style={{
          position: "absolute",
          top: "50px",
          right: isMobile ? "10px" : "100px",
          width: isMobile ? "350px" : "400px",
          zIndex: "10000",
          padding: 0,
        }}
        title="Notification"
      >
        <NotificationSection
          notifications={notifications}
          setNotifications={setNotifications}
          errorNotification={errorNotification}
          loadingNotification={loadingNotification}
          notificationsCount={notificationsCount}
          setNotificationsCount={setNotificationsCount}
        />
      </Modal>
    </Layout>
  );
};

export default StudentPage;
