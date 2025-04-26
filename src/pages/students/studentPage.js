import React, { useEffect, useState, useRef, useCallback } from "react";
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
  FacebookFilled,
  UpOutlined,
  CopyOutlined,
  MessageOutlined,
  CloseCircleFilled,
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
import ProfileModal from "./profileModal";
import StudentFeedbackModal from "./feedbackModal";
import contentPageService from "services/contentpageService";
import { Close } from "@mui/icons-material";
import VocabularyStudyComponent from "components/Vocabulary/VocabularyStudyComponent";

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
const extractDomain = (url) => {
  const match = url.match(/^https?:\/\/(?:www\.)?([^\/]+)/i);
  return match ? match[1].replace(/\.(com|net|org|edu|vn|info|io|app)$/i, "") : null;
};

const getPlatformName = (url) => {
  const domain = extractDomain(url);
  if (!domain) return "Không rõ";

  if (domain.includes("kahoot")) return "Kahoot";
  if (domain.includes("quizizz")) return "Quizizz";
  if (domain.includes("blooket")) return "Blooket";
  if (domain.includes("wordwall")) return "Wordwall";
  if (domain.includes("google")) return "Google Form";

  // fallback: capitalize domain name
  return domain.charAt(0).toUpperCase() + domain.slice(1);
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
  const [profileModalVisible, setProfileModalVisible] = useState(false); // Thêm state cho modal profile
  const [socialHover, setSocialHover] = useState({
    facebook: false,
    zalo: false,
    global: false,
  });
  const lessonRef = useRef(null);
  const progressRef = useRef(null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectLanguageClick, setSelectLanguageClick] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  useEffect(() => {
    if (isMobile) {
      setSidebarVisible(true);
    }
  }, [isMobile]);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(homeworkZaloLink).then(() => {
      setCopySuccess(true);
      message.success("Copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };
  const handlePractice = async (link) => {
    if (!link) {
      message.error("Link không hợp lệ!");
      return;
    }

    const platform = getPlatformName(link);
    if (platform === "Wordwall") {
      const embedCode = await fetchWordwallEmbed(link);
      if (embedCode) {
        setWordwallEmbed(embedCode);
        setIsModalWordWallVisible(true);
      } else {
        message.error("Không thể tải nội dung từ Wordwall!");
      }
    } else {
      window.open(link, "_blank");
    }
  };

  const [contentData, setContentData] = useState(null);

  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const data = await contentPageService.getAllContentPages();
        setContentData(data[0]); // Lấy phần tử đầu tiên từ danh sách
      } catch (error) {
        console.error("Error fetching content page data:", error);
      }
    };
    fetchContentData();
  }, []);

  const handleStudentUpdated = (updatedStudent) => {
    setStudent(updatedStudent); // Cập nhật student trong state
  };

  const handleShowFeedback = () => {
    setFeedbackModalVisible(true); // Mở modal khi chọn Feedback
  };

  const handleShowProfile = () => {
    setProfileModalVisible(true); // Mở modal khi chọn Profile
  };

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoadingNotification(true);
        let count = 0;
        const dataNoti = { type: false };
        const res = await notificationService.getAllGeneralNotificationsByType(dataNoti);
        const studentNotification = await user_notificationService.getAllUserNotificationsOfStudent(
          studentId
        );
        const studentNotificationsData = studentNotification?.map((noti) => {
          if (!noti.status) count++;
          return { ...noti.notification, status: noti.status, user_notificationID: noti.id };
        });
        count += res.length;
        setNotificationsCount(count);
        const fullData = [...res, ...studentNotificationsData];
        // console.log(fullData, res, studentNotificationsData);

        if (fullData[0]?.createdAt) {
          const sortedData = [...fullData]?.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          const data = sortedData?.map((item) => ({
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
          const filterData = data?.filter(
            (lesson) =>
              (lesson.isLessonSent && lesson.lessonID) ||
              (lesson.homeWorkId && lesson.isHomeWorkSent)
          );
          setLessonsBySchedule(filterData);
        } catch (error) {
          console.error("Error fetching lessons by schedule:", error);
        }
      };
      fetchLessonByScheduleOfClasses();
    }
  }, [student]);
  // console.log(isHomeWorkSent, isLessonSent);

  useEffect(() => {
    const findSelectedLessonBySchedule = lessonsBySchedule?.find(
      (lessonBySchedule) => lessonBySchedule.id === selectedLessonBySchedule
    );
    // console.log(findSelectedLessonBySchedule);
    if (findSelectedLessonBySchedule) {
      if (findSelectedLessonBySchedule?.lessonID) {
        setLessons([]);
        setIsLessonSent(0);
      }
      if (findSelectedLessonBySchedule?.homeWorkId) {
        setHomework([]);
        setIsHomeWorkSent(0);
      }
      const fetchLessonById = async () => {
        try {
          if (findSelectedLessonBySchedule?.lessonID) {
            const data = await lessonService.getLessonById(findSelectedLessonBySchedule?.lessonID);
            setLessons([data]);
            // console.log(data, findSelectedLessonBySchedule?.lessonID);
          }

          if (findSelectedLessonBySchedule?.homeWorkId) {
            fetchHomeworkByLesson(findSelectedLessonBySchedule?.homeWorkId);
          }
          setTimeout(() => {
            const images = document.querySelectorAll(".ql-image");
            images.forEach((image) => {
              const src = image.getAttribute("src");
              if (src) {
                image.addEventListener("click", () => handleClickQLImage(src));
              }
            });
          }, 100);
          setIsLessonSent(findSelectedLessonBySchedule.isLessonSent); // Chuyển đổi sang boolean nếu cần
          setIsHomeWorkSent(findSelectedLessonBySchedule.isHomeWorkSent); // Chuyển đổi sang boolean nếu cần
          // console.log("lessonBySchedule", findSelectedLessonBySchedule);
          if (findSelectedLessonBySchedule?.lessonID) {
            const student_lesson_countData = {
              lessonId: +findSelectedLessonBySchedule.lessonID,
              studentId: +studentId,
            };

            await student_lesson_countService.updateCount(student_lesson_countData);
          }
          // if (findSelectedLessonBySchedule.homeWorkId) {

          // } else {
          //   fetchHomeworkByLesson(findSelectedLessonBySchedule.id);
          // }
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
    return () => {
      setLessons([]);
      setHomework([]);
      setIsLessonSent(0);
      setIsHomeWorkSent(0);
      setTimeout(() => {
        const images = document.querySelectorAll(".ql-image");
        images.forEach((image) => {
          const src = image.getAttribute("src");
          if (src) {
            image.removeEventListener("click", () => handleClickQLImage(src));
          }
        });
      }, 100);
    };
  }, [selectedLessonBySchedule, studentId, lessonsBySchedule]);
  // console.log(isHomeWorkSent);

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

  const handleSubmitHomework = async (homeworkId) => {
    try {
      // console.log();

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
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={handleShowProfile}>
        Profile
      </Menu.Item>
      <Menu.Item key="feedback" icon={<MessageOutlined />} onClick={handleShowFeedback}>
        Feedback
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
  // console.log(notifications);

  const fetchWordwallEmbed = async (url) => {
    try {
      const response = await fetch(
        `https://www.wordwall.net/api/oembed?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();
      return data.html; // Trả về mã HTML của iframe
    } catch (error) {
      console.error("Error fetching Wordwall oEmbed:", error);
      return null;
    }
  };
  useEffect(() => {
    const menu = document.getElementById(":0.container");
    const menu2 = document.getElementById(":2.container");
    // console.log("Menu:", menu);

    if (menu) {
      menu.style.display = "none";
    } else {
      console.warn("Không tìm thấy phần tử với id ':0.container'");
    }
    if (menu2) {
      menu2.style.display = "none";
    } else {
      console.warn("Không tìm thấy phần tử với id ':2.container'");
    }
    //   const node = document.querySelector(".skiptranslate")?.childNodes.item(0);

    //   if (node?.nodeName === "IFRAME") {
    //     console.log("Node con là iframe");
    //   } else {
    //     console.log("Không phải iframe");
    //   }
  });
  const handleClickQLImage = useCallback((imageUrl) => {
    setPreviewSrc(imageUrl);
    setPreviewVisible(true);
    // console.log(imageUrl);
  }, []);

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
                  // padding: "10px!important",
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
                {/* <Collapse
                  defaultActiveKey={[]} // Mặc định thu gọn
                  bordered={false}
                  style={{ marginBottom: 16 }}
                >
                  <Panel header="Xem mô tả" key="1">
                    
                  </Panel>
                </Collapse> */}
                <div
                  style={{ maxWidth: "100%", overflow: "auto", margin: "10px 0" }}
                  dangerouslySetInnerHTML={{ __html: lesson.description || " " }}
                />
                {(lesson.linkYoutube || lesson.linkSpeech) && (
                  <div
                    style={{
                      backgroundColor: colors.paleGreen,
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  >
                    {/* {lesson.linkYoutube && (
                      <iframe
                        width="100%"
                        height="315"
                        src={lesson.linkYoutube.replace("watch?v=", "embed/")}
                        title="Lesson Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )} */}
                    {/* {lesson.linkYoutube && lesson.linkYoutube.trim() && (
                      <div>
                        <Text
                          strong
                          style={{ color: colors.deepGreen, display: "block", marginBottom: 8 }}
                        >
                          Video bài học:
                        </Text>
                        {lesson.linkYoutube.split(",").map((link, index) => {
                          const trimmed = link.trim();
                          if (!trimmed) return null;
                          return (
                            <iframe
                              key={`youtube-${lesson.id}-${index}`}
                              width="100%"
                              height={isMobile ? "315" : "500"}
                              src={trimmed.replace("watch?v=", "embed/")}
                              title={`Lesson Video ${index + 1}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ marginBottom: 16 }}
                            />
                          );
                        })}
                      </div>
                    )} */}
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
    <div style={{ maxWidth: "100%", overflowX: "auto" }}>
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
                {/* <ConvertTTS audioTag={"audio-player-homework"} /> */}
                {/* <Collapse
                  defaultActiveKey={[]} // Mặc định thu gọn
                  bordered={false}
                  style={{ marginBottom: 16 }}
                >
                  <Panel header="Xem mô tả" key="1">
                    
                  </Panel>
                </Collapse> */}
                <div
                  style={{ maxWidth: "100%", overflow: "auto", margin: "10px 0" }}
                  dangerouslySetInnerHTML={{
                    __html: hw.description || "Chưa có mô tả cho bài tập này.",
                  }}
                />
                {/* {hw.linkSpeech || hw.linkYoutube && (
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
                )} */}
                {(hw.linkYoutube || hw.linkSpeech) && (
                  <div
                    style={{
                      backgroundColor: colors.paleGreen,
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  >
                    {/* {hw.linkYoutube && hw.linkYoutube.trim() && (
                      <div>
                        <Text
                          strong
                          style={{ color: colors.deepGreen, display: "block", marginBottom: 8 }}
                        >
                          Video bài tập:
                        </Text>
                        {hw.linkYoutube.split(",").map((link, index) => {
                          const trimmed = link.trim();
                          if (!trimmed) return null; // Bỏ qua link rỗng
                          return (
                            <iframe
                              key={`youtube-${hw.id}-${index}`}
                              width="100%"
                              height={isMobile ? "315" : "500"}
                              src={trimmed.replace("watch?v=", "embed/")}
                              title={`Homework Video ${index + 1}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ marginBottom: 16 }}
                            />
                          );
                        })}
                      </div>
                    )} */}
                    {/* {hw.linkSpeech && (
                      <div style={{ marginTop: hw.linkYoutube ? 16 : 0 }}>
                        <Text
                          strong
                          style={{ color: colors.deepGreen, display: "block", marginBottom: 8 }}
                        >
                          Audio bài tập:
                        </Text>
                        <audio controls style={{ width: "100%" }}>
                          <source
                            src={hw.linkSpeech.replace("/video/upload/", "/raw/upload/")}
                            type="audio/mpeg"
                          />
                          Trình duyệt của bạn không hỗ trợ phát audio.
                        </audio>
                      </div>
                    )} */}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  {/* Render multiple practice buttons if linkGame contains multiple links */}
                  {/* {hw.linkGame &&
                    hw.linkGame.split(",").map((link, index) => {
                      const trimmed = link.trim();
                      const platform = getPlatformName(trimmed);
                      return (
                        <Button
                          key={`practice-${hw.id}-${index}`}
                          type="primary"
                          onClick={() => handlePractice(trimmed)}
                          style={{
                            backgroundColor: colors.deepGreen,
                            borderColor: colors.deepGreen,
                          }}
                        >
                          Luyện tập bằng {platform}
                        </Button>
                      );
                    })} */}

                  {hw.linkGame &&
                    hw.linkGame.split(",").map((link, index) => {
                      const trimmed = link.trim();
                      return (
                        <Button
                          key={`practice-${hw.id}-${index}`}
                          type="primary"
                          onClick={() => handlePractice(trimmed)}
                          style={{
                            backgroundColor: colors.deepGreen,
                            borderColor: colors.deepGreen,
                          }}
                        >
                          Luyện tập {index + 1}
                        </Button>
                      );
                    })}
                  {/* Nút Nộp bài */}
                  {/* <Button
                    type="primary"
                    onClick={() => {
                      handleSubmitHomework(hw.id);
                      // handlePractice(hw.linkGame);
                      // setHomeworkZaloLink(hw.linkZalo);
                    }}
                    style={{
                      backgroundColor: colors.deepGreen,
                      borderColor: colors.deepGreen,
                    }}
                  >
                    {hw.status === "Đã nộp" ? "Nộp lại" : "Nộp bài"}
                  </Button> */}
                </div>
                <VocabularyStudyComponent
                  selectedHomeWorkId={hw.id}
                  isMobile={isMobile}
                  studentId={studentId}
                />
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
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <style>
        {`
      .responsive-iframe {
  width: 100%;
  height: 315px;
}
.ql-image{
  max-width: 100%;
  height: auto;
  text-align: center;
}
@media screen and (min-width: 990px) {
  .responsive-iframe {
    height: 500px;
  }
}`}
      </style>
      {!isMobile && (
        <div style={{ width: "260px", height: "100%", position: "fixed" }}>
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
              {contentData?.name}
            </Title>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Tag color="green" bordered={false} style={{ fontSize: isMobile ? "12px" : "16px" }}>
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
            <div
              id="google_translate_element"
              style={{ marginRight: "5px" }}
              onClick={() => setSelectLanguageClick(!selectLanguageClick)}
            ></div>
            <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
              <Avatar
                src={student?.imgUrl}
                alt={student?.name}
                sx={{
                  width: 50,
                  height: 50,
                  border: `1px solid ${colors.lightGrey}`,
                }}
              >
                {student?.name.charAt(0)}
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
            {/* Social Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                position: "fixed",
                bottom: "20px",
                right: "20px",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  // background: socialHover.facebook
                  //   ? "linear-gradient(145deg, #166FE5, #1877F2)"
                  //   : "linear-gradient(145deg, #1877F2, #166FE5)",
                  background: "transparent",
                  // borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "24px",
                  // boxShadow: socialHover.facebook
                  //   ? "0 6px 15px rgba(24, 119, 242, 0.4)"
                  //   : "0 4px 10px rgba(24, 119, 242, 0.3)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform: socialHover.facebook
                    ? "scale(1.1) rotate(5deg)"
                    : "scale(1) rotate(0deg)",
                  overflow: "hidden",
                }}
                onMouseEnter={() => setSocialHover({ ...socialHover, facebook: true })}
                onMouseLeave={() => setSocialHover({ ...socialHover, facebook: false })}
                onClick={() => window.open(contentData?.linkFacebook)}
              >
                {contentData?.img1 ? (
                  <img
                    src={contentData.img1}
                    alt="Image 1"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover", // Đảm bảo ảnh lấp đầy div mà không bị méo
                      // borderRadius: "50%", // Giữ hình tròn
                    }}
                  />
                ) : (
                  <span style={{ color: "white", fontSize: "24px" }}>?</span> // Hiển thị ký tự mặc định nếu không có ảnh
                )}
              </div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  // background: socialHover.zalo
                  //   ? "linear-gradient(145deg, #0077EE, #0088FF)"
                  //   : "linear-gradient(145deg, #0088FF, #0077EE)",
                  background: "transparent",
                  // borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "24px",
                  // boxShadow: socialHover.zalo
                  //   ? "0 6px 15px rgba(0, 136, 255, 0.4)"
                  //   : "0 4px 10px rgba(0, 136, 255, 0.3)",
                  cursor: "pointer",
                  transform: socialHover.zalo ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0deg)",
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                }}
                onMouseEnter={() => setSocialHover({ ...socialHover, zalo: true })}
                onMouseLeave={() => setSocialHover({ ...socialHover, zalo: false })}
                onClick={() => window.open(contentData?.linkZalo || "https://zalo.me/happyclass")}
              >
                {contentData?.img2 ? (
                  <img
                    src={contentData.img2}
                    alt="Image 2"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover", // Đảm bảo ảnh lấp đầy div mà không bị méo
                      // borderRadius: "50%", // Giữ hình tròn
                    }}
                  />
                ) : (
                  <span style={{ color: "white", fontSize: "24px" }}>?</span> // Hiển thị ký tự mặc định nếu không có ảnh
                )}
              </div>
              <style>
                {`
                  @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                  }
        
                  @keyframes float {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0); }
                  }
                `}
              </style>
            </div>
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
      {/* Thêm StudentProfileModal */}
      <ProfileModal
        open={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        student={student}
        onStudentUpdated={handleStudentUpdated}
      />
      {/* Thêm StudentFeedbackModal */}
      <StudentFeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        studentId={studentId}
      />
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
      {/* <div
        style={{
          position: "fixed",
          bottom: "5%",
          right: "5%",
          width: "90%",
          height: "90%",
          zIndex: 100000000000,
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            position: "fixed",
            bottom: "90.5%",
            left: "93%",
            zIndex: 100000000000,
            cursor: "pointer",
          }}
        >
          <CloseCircleFilled style={{ fontSize: "20px", color: "white" }} />
        </div>
        <img src={previewSrc} style={{ width: "100%", height: "100%", borderRadius: "12px" }}></img>
      </div> */}
      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        style={{ zIndex: 100000000 }}
        centered
        width="90%"
      >
        <img
          src={previewSrc}
          style={{
            // position: "absolute",
            // top: "50%",
            // left: "50%",
            // transform: "translate(-50%, -50%)",
            transform: "translateX(-1%)",
            width: "102%",
            // height: isMobile ? "auto" : "102%",
            // height: "100%",
            borderRadius: "12px",
            maxWidth: "102%",
            // maxHeight: "102%",
            objectFit: "contain",
            borderRadius: "12px",
            margin: "0 auto",
          }}
        ></img>
      </Modal>
    </Layout>
  );
};

export default StudentPage;
