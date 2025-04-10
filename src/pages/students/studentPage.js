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
  Tabs,
  Input,
  Spin,
  Tag,
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
  LinkOutlined,
  BarChartOutlined,
  CopyOutlined,
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
import student_homework_countService from "services/student_homework_countService";
import student_lesson_countService from "services/student_lesson_countService";
import EvaluationStudent from "./evaluationStudent"; // Thêm import
import { Collapse } from "antd";
import ConvertTTS from "./ConvertTTS";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const getTimeElapsed = (createdAt) => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now - created) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} sec`;
  else if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
  else if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr`;
  else
    return `${Math.floor(diffInSeconds / 86400)} day${
      Math.floor(diffInSeconds / 86400) !== 1 ? "s" : ""
    }`;
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
  const [activeTab, setActiveTab] = useState("lessons");
  const [loadingHomework, setLoadingHomework] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [errorNotification, setErrorNotification] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [openSubmitHomework, setOpenSubmitHomework] = useState(false);
  const [homeworkZaloLink, setHomeworkZaloLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [loadingSubmitHomework, setLoadingSubmitHomework] = useState(false);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [isLessonSent, setIsLessonSent] = useState(false); // Mặc định là false (không hiển thị)
  const [isHomeWorkSent, setIsHomeWorkSent] = useState(false); // Mặc định là false (không hiển thị)
  const [wordwallEmbed, setWordwallEmbed] = useState(null); // Mã nhúng từ oEmbed
  const [isModalWordWallVisible, setIsModalWordWallVisible] = useState(false); // Trạng thái Modal
  const lessonRef = useRef(null);
  const progressRef = useRef(null);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(homeworkZaloLink).then(() => {
      setCopySuccess(true);
      message.success("Copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };
  const handlePractice = (link) => {
    if (link) {
      fetchWordwallEmbed(link);
    } else {
      message.error("Không có link luyện tập nào được cung cấp!");
    }
  };

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoadingNotification(true);
        let count = 0;
        const res = await notificationService.getAllGeneralNotifications();
        const studentNotification = await user_notificationService.getAllUserNotificationsOfStudent(
          studentId
        );
        const studentNotificationsData = studentNotification.map((noti) => {
          if (!noti.status) count++;
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
          setNotifications(data);
        }
      } catch (error) {
        setErrorNotification(error || "fail to fetch notification");
      } finally {
        setLoadingNotification(false);
      }
    };
    fetchNotification();
  }, [studentId]);

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
          setIsLessonSent(!!findSelectedLessonBySchedule.isLessonSent); // Chuyển đổi sang boolean nếu cần
          setIsHomeWorkSent(!!findSelectedLessonBySchedule.isHomeWorkSent); // Chuyển đổi sang boolean nếu cần
          // console.log("lessonBySchedule", findSelectedLessonBySchedule);
          const student_lesson_countData = {
            lessonId: +findSelectedLessonBySchedule.lessonID,
            studentId: +studentId,
          };
          await student_lesson_countService.updateCount(student_lesson_countData);
          if (findSelectedLessonBySchedule.homeWorkId) {
            fetchHomeworkByLesson(findSelectedLessonBySchedule.homeWorkId);
          } else {
            fetchHomeworkByLesson(findSelectedLessonBySchedule.id);
          }
        } catch (error) {
          console.error("Error fetching lesson:", error);
          setLessons([]);
          setHomework([]);
          setIsLessonSent(0);
          setIsHomeWorkSent(0);
        }
      };
      fetchLessonById();
    } else {
      setLessons([]);
      setHomework([]);
      setIsLessonSent(0);
      setIsHomeWorkSent(0);
    }
  }, [selectedLessonBySchedule, studentId, lessonsBySchedule]);
  // Hàm lấy mã nhúng từ Wordwall oEmbed
  const fetchWordwallEmbed = async (resourceUrl) => {
    try {
      const response = await fetch(
        `https://wordwall.net/api/oembed?url=${encodeURIComponent(resourceUrl)}` // Sửa endpoint thành oEmbed chính xác
      );
      const data = await response.json();
      setWordwallEmbed(data.html); // Lưu mã nhúng vào state
      setIsModalWordWallVisible(true); // Mở Modal sau khi lấy được mã nhúng
    } catch (error) {
      console.error("Error fetching Wordwall oEmbed:", error);
    }
  };
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
  const handleViewNotification = () => {
    setOpenNotification(!openNotification);
  };
  // Đóng Modal
  const handleModalWordWallClose = () => {
    setIsModalWordWallVisible(false);
    setWordwallEmbed(null); // Xóa mã nhúng khi đóng Modal (tùy chọn)
  };
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/login/student";
  };

  const handleSelectLessonBySchedule = (lessonByScheduleId) => {
    setSelectedLessonBySchedule(lessonByScheduleId);
    if (isMobile) setSidebarVisible(false);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const showComingSoon = () => {
    message.info("Coming soon!");
  };

  const handleSubmitHomework = async (homeworkId) => {
    try {
      console.log();

      setHomeworkZaloLink(homework[0]?.linkZalo);
      setLoadingSubmitHomework(true);
      // setOpenSubmitHomework(true);
      window.open(homework[0]?.linkZalo);
      const student_homework_countData = { homeworkId, studentId };
      await student_homework_countService.updateCount(student_homework_countData);
    } catch {
      message.error("Có lỗi khi nộp bài, vui lòng refresh trang và nộp lại!");
    } finally {
      setLoadingSubmitHomework(false);
    }
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

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "scores") {
      setScoreModalVisible(true);
    } else if (tab === "lessons" && lessonRef.current) {
      lessonRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (tab === "homework") {
      setActiveTab("homework");
    }
  };
  console.log(notifications);

  const renderLessonContent = () => (
    <>
      <div ref={lessonRef}>
        <Title level={3} style={{ color: colors.darkGreen, marginBottom: 20 }}>
          <BookOutlined /> Bài Học
        </Title>
        {isLessonSent ? (
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
                {/* <ConvertTTS audioTag={"audio-player-lesson"} /> */}
                <Collapse
                  defaultActiveKey={[]} // Mặc định thu gọn
                  bordered={false}
                  style={{ marginBottom: 16 }}
                >
                  <Panel header="Xem mô tả" key="1">
                    <div dangerouslySetInnerHTML={{ __html: lesson.description || " " }} />
                  </Panel>
                </Collapse>
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
                {/* Thêm nút Luyện tập */}
                {/* {lesson.linkGame && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      type="primary"
                      onClick={() => handlePractice(lesson.linkGame)}
                      style={{ backgroundColor: colors.deepGreen, borderColor: colors.deepGreen }}
                    >
                      Luyện tập
                    </Button>
                  </div>
                )} */}
              </Card>
            )}
          />
        ) : (
          <Empty
            description="Bài học này chưa được gửi đến bạn."
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
      <Divider />
      <div ref={progressRef}>
        <EvaluationStudent studentId={studentId} colors={colors} />
      </div>
    </>
  );

  const renderHomeworkContent = () => (
    <>
      <Title level={3} style={{ color: colors.darkGreen, marginBottom: 20 }}>
        <FileTextOutlined /> Bài Tập
      </Title>
      {loadingHomework ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin />
          <div>Đang tải dữ liệu bài tập...</div>
        </div>
      ) : isHomeWorkSent ? (
        homework.length > 0 ? (
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
                    <Text
                      strong
                      style={{ fontSize: 16, display: "block", color: colors.darkGreen }}
                    >
                      {hw.title || "Bài tập"}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Hạn nộp: {hw.dueDate || "Chưa có hạn nộp"} · Trạng thái:{" "}
                      {hw.status || "Chưa nộp"} · ID: {hw.id}
                    </Text>
                  </div>
                </div>
                <ConvertTTS audioTag={"audio-player-homework"} />
                <Collapse
                  defaultActiveKey={[]} // Mặc định thu gọn
                  bordered={false}
                  style={{ marginBottom: 16 }}
                >
                  <Panel header="Xem mô tả" key="1">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: hw.description || "Chưa có mô tả cho bài tập này.",
                      }}
                    />
                  </Panel>
                </Collapse>
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
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  {/* Nút Luyện tập */}
                  {hw.linkGame && (
                    <Button
                      type="primary"
                      onClick={() => handlePractice(hw.linkGame)}
                      style={{ backgroundColor: colors.deepGreen, borderColor: colors.deepGreen }}
                    >
                      Luyện tập
                    </Button>
                  )}
                  {/* Nút Nộp bài */}
                  <Button
                    type="primary"
                    onClick={() => {
                      handleSubmitHomework(hw.id);
                      // handlePractice(hw.linkGame);
                      // setHomeworkZaloLink(hw.linkZalo);
                    }}
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
        )
      ) : (
        <Empty
          description="Bài tập này chưa được gửi đến bạn."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{
            margin: "40px 0",
            padding: "20px",
            backgroundColor: colors.paleGreen,
            borderRadius: "12px",
          }}
        />
      )}
    </>
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
            <Tag color="green" bordered={false} style={{ fontSize: "16px" }}>
              {"Mã lớp: "}
              {student?.class?.accessId}
            </Tag>
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
            <Tabs activeKey={activeTab} tabBarStyle={{ display: "none" }}>
              <TabPane key="lessons">{renderLessonContent()}</TabPane>
              <TabPane key="homework">{renderHomeworkContent()}</TabPane>
            </Tabs>
          )}
        </Content>

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
            <Space
              size={screens.xs ? 4 : screens.sm ? 8 : "large"}
              style={{
                flexWrap: screens.xs ? "wrap" : "nowrap",
                justifyContent: "center",
                width: "100%",
                maxWidth: screens.lg ? "800px" : "100%",
                padding: screens.xs ? "0 5px" : "0 10px",
              }}
            >
              <Button
                type={activeTab === "lessons" ? "primary" : "link"}
                icon={<BookOutlined />}
                onClick={() => handleTabClick("lessons")}
                style={{
                  backgroundColor: activeTab === "lessons" ? colors.deepGreen : "transparent",
                  borderColor: activeTab === "lessons" ? colors.deepGreen : colors.borderGreen,
                  fontSize: screens.xs ? "12px" : "14px",
                  padding: screens.xs ? "0 8px" : "0 16px",
                  height: screens.xs ? 32 : 40,
                  minWidth: screens.xs ? 60 : 100,
                }}
              >
                {screens.xs ? "" : "Bài Học"}
              </Button>
              <Button
                type={activeTab === "homework" ? "primary" : "link"}
                icon={<FileTextOutlined />}
                onClick={() => handleTabClick("homework")}
                style={{
                  backgroundColor: activeTab === "homework" ? colors.deepGreen : "transparent",
                  borderColor: activeTab === "homework" ? colors.deepGreen : colors.borderGreen,
                  fontSize: screens.xs ? "12px" : "14px",
                  padding: screens.xs ? "0 8px" : "0 16px",
                  height: screens.xs ? 32 : 40,
                  minWidth: screens.xs ? 60 : 100,
                }}
              >
                {screens.xs ? "" : "Bài Tập"}
              </Button>
              <Button
                type={activeTab === "scores" ? "primary" : "link"}
                icon={<TrophyOutlined />}
                onClick={() => handleTabClick("scores")}
                style={{
                  backgroundColor: activeTab === "scores" ? colors.deepGreen : "transparent",
                  borderColor: activeTab === "scores" ? colors.deepGreen : colors.borderGreen,
                  fontSize: screens.xs ? "12px" : "14px",
                  padding: screens.xs ? "0 8px" : "0 16px",
                  height: screens.xs ? 32 : 40,
                  minWidth: screens.xs ? 60 : 100,
                }}
              >
                {screens.xs ? "" : "Điểm Thi"}
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
      <Modal
        open={openSubmitHomework}
        onCancel={() => setOpenSubmitHomework(false)}
        onClose={() => setOpenSubmitHomework(false)}
        footer={<></>}
      >
        {loadingSubmitHomework ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin />
          </div>
        ) : (
          <Card style={{ maxWidth: "90%", margin: "auto", textAlign: "center" }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <FileTextOutlined style={{ fontSize: 32, color: "#1890ff" }} />
              <Text strong style={{ fontSize: 16 }}>
                Bạn vui lòng nộp bài cho giáo viên qua link Zalo này:
              </Text>
              <Input
                value={homeworkZaloLink}
                readOnly
                style={{ textAlign: "center", width: "100%" }}
              />
              <Button
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
                type={copySuccess ? "default" : "primary"}
              >
                {copySuccess ? "Copied!" : "Copy Link nộp bài tập"}
              </Button>
              <Button
                icon={<LinkOutlined />}
                onClick={() => {
                  window.open(homeworkZaloLink);
                }}
                type={"primary"}
              >
                {"Truy cập link"}
              </Button>
            </Space>
          </Card>
        )}
      </Modal>

      <Modal
        title="Điểm Thi"
        open={scoreModalVisible}
        onCancel={() => setScoreModalVisible(false)}
        footer={null}
        width={isMobile ? "90%" : "50%"}
        style={{ top: 20 }}
      >
        <StudentScoreTab studentId={studentId} colors={colors} />
      </Modal>
      <Modal
        title="Wordwall Activity"
        open={isModalWordWallVisible}
        onCancel={handleModalWordWallClose}
        footer={null}
        width={600} // Điều chỉnh chiều rộng Modal
      >
        {wordwallEmbed ? (
          <div
            style={{ textAlign: "center" }}
            dangerouslySetInnerHTML={{ __html: wordwallEmbed }}
          />
        ) : (
          <p>Đang tải nội dung...</p>
        )}
      </Modal>
    </Layout>
  );
};

export default StudentPage;
