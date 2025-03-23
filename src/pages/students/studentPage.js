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
  Tabs,
  Empty,
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
  FileTextOutlined,
  SoundOutlined,
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
import homeWorkService from "services/homeWorkService";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;

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
  const [activeTab, setActiveTab] = useState("lesson");
  const [loadingHomework, setLoadingHomework] = useState(false);

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

          console.log("data", findSelectedLessonBySchedule);

          // Kiểm tra xem có homeworkId trong lessonBySchedule không
          if (findSelectedLessonBySchedule.homeWorkId) {
            // Gọi API để lấy bài tập sử dụng homeworkId từ lessonBySchedule
            fetchHomeworkByLesson(findSelectedLessonBySchedule.homeWorkId);
          } else {
            // Sử dụng lessonBySchedule ID nếu không có homeworkId
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

  // Hàm lấy dữ liệu bài tập từ API
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

  const SidebarComponent = () => (
    <Sidebar
      lessonsBySchedule={lessonsBySchedule}
      selectedLessonBySchedule={selectedLessonBySchedule}
      onSelectLessonBySchedule={handleSelectLessonBySchedule}
      colors={colors}
      isMobile={isMobile}
    />
  );

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Xử lý nộp bài tập
  const handleSubmitHomework = (homeworkId) => {
    console.log("Nộp bài tập ID:", homeworkId);
    // Thêm logic xử lý nộp bài ở đây
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
              style={{
                backgroundColor: colors.deepGreen,
                color: colors.white,
              }}
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
              {lesson.link.includes("youtube.com") || lesson.link.includes("youtu.be") ? (
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
                  style={{
                    backgroundColor: colors.mintGreen,
                    color: colors.deepGreen,
                  }}
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
                  <audio
                    controls
                    style={{
                      width: "100%",
                      height: 40,
                      backgroundColor: colors.white,
                      borderRadius: 4,
                    }}
                  >
                    <source src={hw.linkSpeech} />
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
                  onClick={() => handleSubmitHomework(hw.id)}
                  style={{
                    backgroundColor: colors.deepGreen,
                    borderColor: colors.deepGreen,
                  }}
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
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                type="card"
                style={{
                  marginBottom: 16,
                }}
              >
                <TabPane
                  tab={
                    <span>
                      <BookOutlined /> Bài Học
                    </span>
                  }
                  key="lesson"
                >
                  {renderLessonContent()}
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      <FileTextOutlined /> Bài Tập
                    </span>
                  }
                  key="homework"
                >
                  {renderHomeworkContent()}
                </TabPane>
              </Tabs>
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
