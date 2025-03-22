import React, { useEffect, useState } from "react";
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
  Comment,
  List,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
  BookOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import Sidebar from "./sidebar";
import Toolbox from "./toolbox";
import classService from "services/classService";
import studentService from "services/studentService";
import { jwtDecode } from "jwt-decode";
import lessonByScheduleService from "services/lessonByScheduleService";
import lessonService from "services/lessonService";
import { colors } from "assets/theme/color";
import StudentScoreModal from "./studentScoreModal";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const StudentPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedLessonBySchedule, setSelectedLessonBySchedule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [student, setStudent] = useState(null);
  const userId = jwtDecode(sessionStorage.getItem("token"));
  const studentId = userId.userId;
  const userName = userId.username || "Student";
  const [lessonsBySchedule, setLessonsBySchedule] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Use Ant Design's Grid breakpoints
  const screens = useBreakpoint();

  // Determine if we're on mobile or tablet
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

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
        } catch (error) {
          console.error("Error fetching lesson:", error);
          setLessons([]);
        }
      };
      fetchLessonById();
    } else {
      setLessons([]);
    }
  }, [selectedLessonBySchedule]);

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

  // Toolbox handlers
  const handleAddStudent = () => console.log("Add assignment");
  const [scoreModalVisible, setScoreModalVisible] = useState(false);

  // Update the handleViewScore function
  const handleViewScore = () => {
    setScoreModalVisible(true);
  };

  // Add this right before the return statement
  const handleCloseScoreModal = () => {
    setScoreModalVisible(false);
  };
  const handleDeleteClass = () => console.log("Review lesson");
  const handleViewReport = () => console.log("Enter test scores");

  // Dropdown menu
  const menu = (
    <Menu style={{ backgroundColor: colors.paleGreen, borderRadius: "8px" }}>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{
          color: colors.darkGreen,
          "&:hover": { backgroundColor: colors.mintGreen },
        }}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  // Function to generate a random time for demo purposes
  const getRandomTime = () => {
    const hours = Math.floor(Math.random() * 12) + 1;
    const minutes = Math.floor(Math.random() * 60);
    const ampm = Math.random() > 0.5 ? "AM" : "PM";
    return `${hours}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
  };

  // Function to get random engagement numbers
  const getRandomEngagement = () => {
    return {
      likes: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 20),
      shares: Math.floor(Math.random() * 10),
    };
  };

  const SidebarComponent = () => (
    <Sidebar
      lessonsBySchedule={lessonsBySchedule}
      selectedLessonBySchedule={selectedLessonBySchedule}
      onSelectLessonBySchedule={handleSelectLessonBySchedule}
      colors={colors}
      isMobile={isMobile}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div style={{ width: "260px", height: "100%", position: "fixed", zIndex: 1001 }}>
          <SidebarComponent />
        </div>
      )}

      {/* Mobile Drawer Sidebar */}
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
                style={{
                  fontSize: "16px",
                  marginRight: "12px",
                  color: colors.darkGreen,
                }}
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
              HỌC SINH
            </Title>
          </div>

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
        </Header>

        <Content
          style={{
            padding: isMobile ? "16px" : "24px",
            marginBottom: selectedLessonBySchedule ? (isMobile ? 140 : 70) : 0,
          }}
        >
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
              {/* <Title level={3} style={{ color: colors.darkGreen, marginBottom: 24 }}>
                Lesson Feed
              </Title> */}
              <List
                itemLayout="vertical"
                size="large"
                dataSource={lessons}
                renderItem={(lesson) => {
                  const engagement = getRandomEngagement();
                  return (
                    <Card
                      style={{
                        marginBottom: 16,
                        borderRadius: 12,
                        boxShadow: `0 2px 8px ${colors.softShadow}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                        <Avatar
                          style={{
                            backgroundColor: colors.deepGreen,
                            color: colors.white,
                          }}
                          icon={<BookOutlined />}
                          size={40}
                        />
                        <div style={{ marginLeft: 12 }}>
                          <Text
                            strong
                            style={{ fontSize: 16, display: "block", color: colors.darkGreen }}
                          >
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

                      {lesson.link && (
                        <div
                          style={{
                            backgroundColor: colors.paleGreen,
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 16,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          {lesson.link.includes("youtube.com") ||
                          lesson.link.includes("youtu.be") ? (
                            <iframe
                              width="100%"
                              height="315"
                              src={lesson.link.replace("watch?v=", "embed/")}
                              title="Lesson Video"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <video width="100%" height="auto" controls>
                              <source src={lesson.link} type="video/mp4" />
                              Trình duyệt của bạn không hỗ trợ phát video.
                            </video>
                          )}
                        </div>
                      )}

                      <Divider style={{ margin: "12px 0" }} />

                      {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button
                          type="text"
                          icon={<LikeOutlined />}
                          style={{ color: colors.darkGreen }}
                        >
                          {engagement.likes} Likes
                        </Button>
                        <Button
                          type="text"
                          icon={<MessageOutlined />}
                          style={{ color: colors.darkGreen }}
                        >
                          {engagement.comments} Comments
                        </Button>
                        <Button
                          type="text"
                          icon={<ShareAltOutlined />}
                          style={{ color: colors.darkGreen }}
                        >
                          {engagement.shares} Shares
                        </Button>
                      </div> */}
                    </Card>
                  );
                }}
              />
            </div>
          )}
        </Content>

        {selectedLessonBySchedule && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              width: isMobile ? "100%" : `calc(100% - 260px)`,
              right: 0,
              backgroundColor: colors.white,
              borderTop: `1px solid ${colors.borderGreen}`,
              zIndex: 1000,
              boxShadow: `0 -2px 8px ${colors.softShadow}`,
              padding: isMobile ? "12px 8px" : "12px 0",
            }}
          >
            <Toolbox
              onAddStudent={handleAddStudent}
              viewScores={handleViewScore}
              onDeleteClass={handleDeleteClass}
              onViewReport={handleViewReport}
              colors={colors}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </div>
        )}
        <StudentScoreModal
          visible={scoreModalVisible}
          onCancel={handleCloseScoreModal}
          studentId={studentId}
          colors={colors}
        />
      </Layout>
    </Layout>
  );
};

export default StudentPage;
