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
  Space,
  Tag,
  Drawer,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  BookOutlined,
  FormOutlined,
  BarChartOutlined,
  YoutubeOutlined,
  FacebookFilled,
  BellOutlined,
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  SmileOutlined,
  FrownOutlined,
  MehOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import classService from "services/classService";
import TeacherProfileModal from "./teacherProfileModal";
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
import teacherService from "services/teacherService";
import MultiStudentEvaluationModal from "./multiEvaluationModal";
import StudentProfileModal from "./studentProfileModal";
import NotificationSection from "components/TeacherPageComponent/NotificationComponent";
import notificationService from "services/notificationService";
import HomeworkStatisticsDashboard from "./HomeworkStatisticsDashboard";
import TeacherFeedbackModal from "./teacherFeedbackModal";
import contentPageService from "services/contentpageService";
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
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];
// Helper function to calculate time elapsed
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
// Main TeacherPage Component
const TeacherPage = () => {
  const [isAttendanceMode, setIsAttendanceMode] = useState(false);
  const [isAttendanceGuideVisible, setIsAttendanceGuideVisible] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
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
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);
  const [isMultiStudentEvaluationModalVisible, setIsMultiStudentEvaluationModalVisible] =
    useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const [allStudentsSelected, setAllStudentsSelected] = useState(false);
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
  const [notifications, setNotifications] = useState([]);
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [errorNotification, setErrorNotification] = useState(false);
  // Use Ant Design's Grid breakpoints
  const screens = useBreakpoint();

  const [socialHover, setSocialHover] = useState({
    facebook: false,
    zalo: false,
    global: false,
  });

  // Determine if we're on mobile or tablet
  const isMobile = !screens.lg;
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
  const [openNotification, setOpenNotification] = useState(false);
  const [openHomeworkStatisticsDashboard, setOpenHomeworkStatisticsDashboard] = useState(false);
  const [isTeacherProfileModalVisible, setIsTeacherProfileModalVisible] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [homeworkZaloLink, setHomeworkZaloLink] = useState("");
  const [contentData, setContentData] = useState(null);
  const toolbar = [
    [{ font: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    ["link", "image", "video"],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["clean"],
    ["undo", "redo"],
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
    "audio",
    "size",
    // "code-block",
    "font",
    // "code",
    "script",
    "direction",
    "video",
  ];
  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoadingNotification(true);
        const notiData = {
          type: true,
        };
        const res = await notificationService.getAllGeneralNotificationsByType(notiData);

        if (res[0]?.createdAt) {
          const sortedData = [...res].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const data = sortedData.map((item) => ({
            ...item,
            timeElapsed: getTimeElapsed(item.createdAt),
          }));
          //   console.log(data);

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
    fetchLessons();
    fetchContentData();
  }, [loadingCreateLesson]);
  const fetchContentData = async () => {
    try {
      const data = await contentPageService.getAllContentPages();
      setContentData(data[0]); // Lấy phần tử đầu tiên từ danh sách
    } catch (error) {
      console.error("Error fetching content page data:", error);
    }
  };

  useEffect(() => {
    if (isMobile) {
      setSidebarVisible(true);
    }
  }, [isMobile]);

  // Hàm chọn tất cả học sinh
  const handleSelectAllStudents = () => {
    if (allStudentsSelected) {
      setSelectedStudents([]); // Bỏ chọn tất cả
      setAllStudentsSelected(false);
    } else {
      setSelectedStudents(students); // Chọn tất cả học sinh
      setAllStudentsSelected(true);
    }
  };

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const data = await teacherService.getTeacherById(teacherId);
        setTeacherData(data);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        message.error("Failed to load teacher profile");
      }
    };
    fetchTeacherData();
  }, [teacherId]);

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
      setHomeworkZaloLink(data && data[data?.length - 1]?.linkZalo);
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

  // Thêm hàm xử lý khi nhấn chuột phải
  const handleRightClick = (student, e) => {
    e.preventDefault(); // Ngăn menu context mặc định của trình duyệt
    setSelectedStudentForProfile(student);
    setIsProfileModalVisible(true);
  };
  const openAssignmentModal = () => {
    setSelectedStudents([]);
    setAllStudentsSelected(false);
    setAssignmentModal(true);
  };

  const openHomeworkModal = () => {
    setSelectedStudents([]);
    setAllStudentsSelected(false);
    setHomeworkModal(true);
  };

  const checkClassScheduleForToday = () => {
    if (!lessonByScheduleData || lessonByScheduleData.length === 0) return false;

    // Get today's date using local time
    const today = new Date();
    const padZero = (num) => String(num).padStart(2, "0");
    const todayFormatted = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(
      today.getDate()
    )}`;

    console.log("Today (raw):", today);
    console.log("Today (formatted):", todayFormatted);

    // Check if any lesson schedule matches today's formatted date
    const todaySchedule = lessonByScheduleData.find((schedule) => schedule.date === todayFormatted);

    return todaySchedule !== undefined;
  };

  useEffect(() => {
    // Check for class today whenever lesson schedule data changes
    if (lessonByScheduleData.length > 0) {
      const hasClass = checkClassScheduleForToday();
      setHasClassToday(hasClass);
    }
  }, [lessonByScheduleData]);

  // Hàm để kích hoạt chế độ điểm danh
  const handleAttendanceCheck = async () => {
    setSelectedStudents([]);
    setAllStudentsSelected(false);
    if (!hasClassToday) {
      notification.warning({
        message: "Warning",
        description: "Class is not scheduled for today",
        placement: "topRight",
        duration: 4,
      });
      return;
    }

    try {
      setLoading(true);

      // Lấy ngày hiện tại theo định dạng YYYY-MM-DD
      const today = new Date();
      const padZero = (num) => String(num).padStart(2, "0");
      const todayFormatted = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(
        today.getDate()
      )}`;

      // Lấy dữ liệu điểm danh hiện có từ server cho ngày hôm nay
      const existingAttendance = await teacherService.getAttendanceByDate(todayFormatted);

      // Khởi tạo attendance mặc định cho tất cả học sinh
      const initialAttendance = students.map((student) => ({
        studentId: student.id,
        present: 1, // Mặc định là có mặt
        note: "",
      }));

      // Lấy ngày hiện tại để tìm lịch học

      const todaySchedule = lessonByScheduleData.find(
        (schedule) => schedule.date === todayFormatted
      );

      if (!todaySchedule) {
        notification.warning({
          message: "Warning",
          description: "Cannot find lesson schedule for today",
          placement: "topRight",
          duration: 4,
        });
        setLoading(false);
        return;
      }

      const selectedLessonByScheduleId = todaySchedule.id;

      // Kiểm tra xem có dữ liệu điểm danh nào từ server không
      if (existingAttendance && existingAttendance.length > 0) {
        // Lọc các StudentID từ dữ liệu server
        const existingStudentIds = existingAttendance.map((att) => att.student.id);

        // So sánh với danh sách StudentID khởi tạo
        const matchedAttendance = initialAttendance.filter((init) =>
          existingStudentIds.includes(init.studentId)
        );

        if (matchedAttendance.length > 0) {
          // Nếu có StudentID trùng khớp, cập nhật điểm danh
          const payload = {
            attendanceData: matchedAttendance.map((item) => ({
              studentId: item.studentId,
              present: item.present,
              note: item.note,
            })),
          };

          await teacherService.updateAttendanceByDate(payload, todayFormatted);

          notification.success({
            message: "Attendance Updated",
            description: "Attendance for matching students has been updated",
            placement: "topRight",
            duration: 4,
          });
        } else {
          // Nếu không có StudentID nào trùng khớp, tạo mới điểm danh
          await teacherService.attendanceStudent({
            lessonByScheduleId: selectedLessonByScheduleId,
            attendanceData: initialAttendance,
          });

          notification.success({
            message: "Attendance Initiated",
            description: "New attendance has been created",
            placement: "topRight",
            duration: 4,
          });
        }

        // Cập nhật state attendance với dữ liệu đã xử lý
        const updatedAttendance = initialAttendance.map((init) => {
          const existing = existingAttendance.find((att) => att.studentId === init.studentId);
          return existing
            ? { ...init, present: existing.present, note: existing.note || "" }
            : init;
        });
        setAttendance(updatedAttendance);
      } else {
        // Nếu không có dữ liệu điểm danh nào từ server, tạo mới
        await teacherService.attendanceStudent({
          lessonByScheduleId: selectedLessonByScheduleId,
          attendanceData: initialAttendance,
        });

        setAttendance(initialAttendance);
        notification.success({
          message: "Attendance Initiated",
          description: "New attendance has been started",
          placement: "topRight",
          duration: 4,
        });
      }

      setIsAttendanceMode(true);
      setIsAttendanceGuideVisible(true);
    } catch (error) {
      console.error("Error in attendance check:", error);
      notification.error({
        message: "Error",
        description: "Failed to process attendance",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, present) => {
    setAttendance((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, present } : item))
    );
  };

  // Hàm để cập nhật ghi chú
  const handleNoteChange = (studentId, note) => {
    setAttendance((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, note } : item))
    );
  };

  // Hàm để lưu điểm danh
  const handleSaveAttendance = async () => {
    if (!lessonByScheduleData || lessonByScheduleData.length === 0) {
      notification.warning({
        message: "Warning",
        description: "No class schedule available for today",
        placement: "topRight",
        duration: 4,
      });
      return;
    }

    try {
      setLoading(true);

      // Lấy ngày hiện tại theo định dạng YYYY-MM-DD
      const today = new Date();
      const padZero = (num) => String(num).padStart(2, "0");
      const todayFormatted = `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(
        today.getDate()
      )}`;

      // Chuẩn bị payload cho update
      const payload = {
        attendanceData: attendance.map((item) => ({
          studentId: item.studentId,
          present: item.present,
          note: item.note,
        })),
      };

      // Gọi API updateAttendanceByDate
      await teacherService.updateAttendanceByDate(payload, todayFormatted);

      notification.success({
        message: "Success",
        description: "Attendance updated successfully",
        placement: "topRight",
        duration: 4,
      });

      setIsAttendanceMode(false);
      setIsAttendanceGuideVisible(false);
    } catch (error) {
      console.error("Error updating attendance:", error);
      notification.error({
        message: "Error",
        description: "Failed to update attendance",
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };
  // const handleSelectStudent = (student) => {
  //   setSelectedStudents((prev) => {
  //     if (prev.some((s) => s.id === student.id)) {
  //       // Nếu học sinh đã được chọn, xóa khỏi danh sách
  //       return prev.filter((s) => s.id !== student.id);
  //     } else {
  //       // Nếu chưa được chọn, thêm vào danh sách
  //       return [...prev, student];
  //     }
  //   });
  // };

  // Hàm xử lý chọn từng học sinh (cập nhật để đồng bộ với allStudentsSelected)
  const handleSelectStudent = (student) => {
    setSelectedStudents((prev) => {
      if (prev.some((s) => s.id === student.id)) {
        const newSelected = prev.filter((s) => s.id !== student.id);
        setAllStudentsSelected(false); // Nếu bỏ chọn một học sinh, bỏ trạng thái "chọn tất cả"
        return newSelected;
      } else {
        const newSelected = [...prev, student];
        if (newSelected.length === students.length) {
          setAllStudentsSelected(true); // Nếu tất cả học sinh được chọn, bật trạng thái "chọn tất cả"
        }
        return newSelected;
      }
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
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => setIsTeacherProfileModalVisible(true)} // Mở modal
      >
        Profile
      </Menu.Item>
      <Menu.Item key="policy" icon={<ExclamationCircleOutlined />} onClick={showComingSoon}>
        Policy
      </Menu.Item>
      <Menu.Item
        key="feedback"
        icon={<MessageOutlined />}
        onClick={() => setIsFeedbackModalVisible(true)} // Mở modal feedback
      >
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
    setSelectedStudents([]);
    setAllStudentsSelected(false);
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
    // message.info("Comming soon...");
    setOpenNotification(!openNotification);
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

    // Nếu số học sinh >= 2, hiển thị MultiStudentEvaluationModal
    if (selectedStudents.length >= 2) {
      setIsMultiStudentEvaluationModalVisible(true);
    } else {
      setIsEvaluationModalVisible(true);
    }
  };

  const showDrawer = () => setSidebarVisible(true);
  const onClose = () => setSidebarVisible(false);
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <Layout style={{ minHeight: "99vh" }}>
      {isMobile && (
        <>
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={showDrawer}
            style={{
              position: "fixed",
              left: 20,
              top: 20,
              zIndex: 99,
              backgroundColor: colors.deepGreen,
              borderColor: colors.deepGreen,
            }}
          />
          <Drawer
            placement="left"
            closable={false}
            onClose={onClose}
            open={sidebarVisible}
            width={260}
            bodyStyle={{ padding: 0, backgroundColor: colors.paleGreen }}
            headerStyle={{ display: "none" }}
          >
            <Sidebar
              teacherName={userName}
              classes={classes}
              selectedClass={selectedClass}
              onSelectClass={handleSelectClass}
              setOpenHomeworkStatisticsDashboard={setOpenHomeworkStatisticsDashboard}
              googleDriveLink={teacherData?.linkDrive || ""}
              isMobile={isMobile}
              onClose={onClose}
            />
          </Drawer>
        </>
      )}
      {!isMobile && (
        <Sidebar
          teacherName={userName}
          classes={classes}
          selectedClass={selectedClass}
          onSelectClass={handleSelectClass}
          setOpenHomeworkStatisticsDashboard={setOpenHomeworkStatisticsDashboard}
          googleDriveLink={teacherData?.linkDrive || ""}
          isMobile={isMobile}
        />
      )}
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
          <div
            style={{ display: "flex", alignItems: "center" }}
            onClick={() => setOpenNotification(false)}
          >
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
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {selectedClass && (
              <Tag color="green" bordered={false} style={{ fontSize: "16px" }}>
                {"Mã lớp: "}
                {classes.find((cls) => cls.id === selectedClass)?.accessId}
              </Tag>
            )}
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
              <Badge count={notifications.length} size="small">
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
          <>
            <div
              style={{
                padding: "12px 24px",
                backgroundColor: hasClassToday ? colors.mintGreen : colors.lightAccent,
              }}
            >
              <Text style={{ color: hasClassToday ? colors.darkGreen : colors.darkGray }}>
                <strong>Class Status:</strong>{" "}
                {hasClassToday
                  ? "Class is scheduled for today"
                  : "Class is not scheduled for today"}
              </Text>
            </div>
            {isAttendanceGuideVisible && (
              <div
                style={{
                  padding: "12px 24px",
                  backgroundColor: colors.paleBlue,
                  borderTop: `1px solid ${colors.borderGreen}`,
                }}
              >
                <Text style={{ color: colors.darkGreen }}>
                  <strong>Attendance Guide:</strong>
                  <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
                    <li>
                      <SmileOutlined style={{ color: colors.safeGreen, marginRight: 8 }} /> Present:
                      Học sinh có mặt.
                    </li>
                    <li>
                      <FrownOutlined style={{ color: colors.errorRed, marginRight: 8 }} /> Absent:
                      Học sinh vắng mặt.
                    </li>
                    <li>
                      <MehOutlined style={{ color: colors.accent, marginRight: 8 }} /> Late: Học
                      sinh đến muộn.
                    </li>
                  </ul>
                </Text>
              </div>
            )}
          </>
        )}

        <Row
          gutter={[16, 16]}
          style={{
            padding: isMobile ? "16px" : "24px",
            background: colors.white,
            paddingBottom: selectedClass ? (isMobile ? "70px" : "64px") : "24px",
          }}
          onClick={() => setOpenNotification(false)}
        >
          {selectedClass && (
            <div
              style={{
                width: "100%",
                paddingBottom: "16px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="primary"
                onClick={handleSelectAllStudents}
                disabled={isAttendanceMode || students.length === 0}
                style={{
                  backgroundColor: allStudentsSelected ? colors.errorRed : colors.deepGreen,
                  borderColor: allStudentsSelected ? colors.errorRed : colors.deepGreen,
                }}
              >
                {allStudentsSelected ? "Deselect All Students" : "Select All Students"}
              </Button>
            </div>
          )}
          {students?.map((student) => {
            const studentAttendance = attendance.find((a) => a.studentId === student.id) || {
              present: 1,
              note: "",
            };
            const isSelected = selectedStudents.some((s) => s.id === student.id); // Kiểm tra xem học sinh có được chọn không

            return (
              <Col xs={20} sm={10} md={8} lg={6} xl={4} key={student.id}>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: `0 2px 8px ${colors.softShadow}`,
                    border: `1px solid ${colors.borderGreen}`,
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    backgroundColor: isAttendanceMode
                      ? studentAttendance.present === 1
                        ? colors.paleGreen
                        : studentAttendance.present === 0
                        ? colors.errorRed
                        : colors.lightAccent
                      : isSelected
                      ? colors.lightGreen
                      : colors.white,
                  }}
                  hoverable={!isAttendanceMode}
                  bodyStyle={{ padding: "16px" }}
                  onClick={!isAttendanceMode ? () => handleSelectStudent(student) : undefined}
                  onContextMenu={(e) => handleRightClick(student, e)}
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
                      src={student.imgUrl || ""}
                    >
                      {student.name.charAt(0)}
                    </Avatar>
                    <Typography.Title
                      level={5}
                      style={{ margin: "0 0 8px 0", color: colors.darkGreen }}
                    >
                      {student.name}
                    </Typography.Title>
                    {isAttendanceMode && (
                      <div style={{ width: "100%", marginTop: 8 }}>
                        <Space direction="vertical" style={{ width: "100%", gap: "8px" }}>
                          <Space
                            style={{
                              width: "100%",
                              justifyContent: "space-between",
                              gap: "4px",
                            }}
                          >
                            <Button
                              type={studentAttendance.present === 1 ? "primary" : "default"}
                              style={{
                                flex: 1,
                                backgroundColor:
                                  studentAttendance.present === 1 ? colors.safeGreen : colors.white,
                                borderColor:
                                  studentAttendance.present === 1
                                    ? colors.safeGreen
                                    : colors.borderGreen,
                                color:
                                  studentAttendance.present === 1 ? colors.white : colors.darkGray,
                                borderRadius: "8px",
                                padding: "4px 8px",
                                fontSize: "12px",
                                height: "32px",
                              }}
                              onClick={() => handleStatusChange(student.id, 1)}
                            >
                              <SmileOutlined style={{ fontSize: "20px" }} />
                            </Button>
                            <Button
                              type={studentAttendance.present === 0 ? "primary" : "default"}
                              style={{
                                flex: 1,
                                backgroundColor:
                                  studentAttendance.present === 0 ? colors.errorRed : colors.white,
                                borderColor:
                                  studentAttendance.present === 0
                                    ? colors.errorRed
                                    : colors.borderGreen,
                                color:
                                  studentAttendance.present === 0 ? colors.white : colors.darkGray,
                                borderRadius: "8px",
                                padding: "4px 8px",
                                fontSize: "12px",
                                height: "32px",
                              }}
                              onClick={() => handleStatusChange(student.id, 0)}
                            >
                              <FrownOutlined style={{ fontSize: "20px" }} />
                            </Button>
                            <Button
                              type={studentAttendance.present === 2 ? "primary" : "default"}
                              style={{
                                flex: 1,
                                backgroundColor:
                                  studentAttendance.present === 2 ? colors.accent : colors.white,
                                borderColor:
                                  studentAttendance.present === 2
                                    ? colors.accent
                                    : colors.borderGreen,
                                color:
                                  studentAttendance.present === 2 ? colors.white : colors.darkGray,
                                borderRadius: "8px",
                                padding: "4px 8px",
                                fontSize: "12px",
                                height: "32px",
                              }}
                              onClick={() => handleStatusChange(student.id, 2)}
                            >
                              <MehOutlined style={{ fontSize: "20px" }} />
                            </Button>
                          </Space>
                          <Input.TextArea
                            rows={2}
                            value={studentAttendance.note}
                            onChange={(e) => handleNoteChange(student.id, e.target.value)}
                            placeholder="Enter note here..."
                            style={{
                              borderRadius: "8px",
                              borderColor: colors.borderGreen,
                              fontSize: "12px",
                              padding: "8px",
                              backgroundColor: colors.white,
                              color: colors.darkGray,
                              resize: "none",
                            }}
                          />
                        </Space>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
        {selectedStudents.length > 0 && (
          <EvaluationModal
            visible={isEvaluationModalVisible}
            onClose={() => setIsEvaluationModalVisible(false)}
            students={selectedStudents}
          />
        )}

        <TeacherFeedbackModal
          visible={isFeedbackModalVisible}
          onClose={() => setIsFeedbackModalVisible(false)}
          teacherId={teacherId}
        />

        <StudentProfileModal
          visible={isProfileModalVisible}
          onClose={() => {
            setIsProfileModalVisible(false);
            setSelectedStudentForProfile(null);
          }}
          student={selectedStudentForProfile}
        />

        {/* Hiển thị MultiStudentEvaluationModal khi chọn >= 2 học sinh */}
        {selectedStudents.length >= 2 && (
          <MultiStudentEvaluationModal
            visible={isMultiStudentEvaluationModalVisible}
            onClose={() => setIsMultiStudentEvaluationModalVisible(false)}
            students={selectedStudents}
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
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "12px 0",
              }}
            >
              {isAttendanceMode && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleSaveAttendance}
                    style={{
                      backgroundColor: colors.deepGreen,
                      borderColor: colors.deepGreen,
                      marginRight: "10px",
                    }}
                    loading={loading}
                  >
                    Save Attendance Check
                  </Button>
                  <Button
                    type="default"
                    onClick={() => {
                      setIsAttendanceMode(false); // Thoát chế độ điểm danh
                      setIsAttendanceGuideVisible(false); // Ẩn phần hướng dẫn
                    }}
                    style={{ borderColor: colors.errorRed, color: colors.errorRed }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
            <Toolbox
              onHomework={openHomeworkModal}
              onAssignment={() => openAssignmentModal()}
              onClassReview={handleOpenEvaluationModal}
              onEnterScores={handleEnterTestScores}
              onAttendanceCheck={handleAttendanceCheck}
              setOpenHomeworkStatisticsDashboard={setOpenHomeworkStatisticsDashboard}
            />

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
                  background: socialHover.facebook
                    ? "linear-gradient(145deg, #166FE5, #1877F2)"
                    : "linear-gradient(145deg, #1877F2, #166FE5)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "24px",
                  boxShadow: socialHover.facebook
                    ? "0 6px 15px rgba(24, 119, 242, 0.4)"
                    : "0 4px 10px rgba(24, 119, 242, 0.3)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform: socialHover.facebook
                    ? "scale(1.1) rotate(5deg)"
                    : "scale(1) rotate(0deg)",
                }}
                onMouseEnter={() => setSocialHover({ ...socialHover, facebook: true })}
                onMouseLeave={() => setSocialHover({ ...socialHover, facebook: false })}
                onClick={() => window.open(contentData?.linkFacebook)}
              >
                <FacebookFilled style={{ fontSize: "24px" }} />
              </div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  background: socialHover.zalo
                    ? "linear-gradient(145deg, #0077EE, #0088FF)"
                    : "linear-gradient(145deg, #0088FF, #0077EE)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "24px",
                  boxShadow: socialHover.zalo
                    ? "0 6px 15px rgba(0, 136, 255, 0.4)"
                    : "0 4px 10px rgba(0, 136, 255, 0.3)",
                  cursor: "pointer",
                  transform: socialHover.zalo ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0deg)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={() => setSocialHover({ ...socialHover, zalo: true })}
                onMouseLeave={() => setSocialHover({ ...socialHover, zalo: false })}
                onClick={() => window.open(contentData?.linkZalo)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="30"
                  height="30"
                  viewBox="0,0,256,256"
                >
                  <g fill="#ffffff" style={{ mixBlendMode: "normal" }}>
                    <g transform="scale(5.12,5.12)">
                      <path d="M9,4c-2.74952,0 -5,2.25048 -5,5v32c0,2.74952 2.25048,5 5,5h32c2.74952,0 5,-2.25048 5,-5v-32c0,-2.74952 -2.25048,-5 -5,-5zM9,6h6.58008c-3.57109,3.71569 -5.58008,8.51808 -5.58008,13.5c0,5.16 2.11016,10.09984 5.91016,13.83984c0.12,0.21 0.21977,1.23969 -0.24023,2.42969c-0.29,0.75 -0.87023,1.72961 -1.99023,2.09961c-0.43,0.14 -0.70969,0.56172 -0.67969,1.01172c0.03,0.45 0.36078,0.82992 0.80078,0.91992c2.87,0.57 4.72852,-0.2907 6.22852,-0.9707c1.35,-0.62 2.24133,-1.04047 3.61133,-0.48047c2.8,1.09 5.77938,1.65039 8.85938,1.65039c4.09369,0 8.03146,-0.99927 11.5,-2.88672v3.88672c0,1.66848 -1.33152,3 -3,3h-32c-1.66848,0 -3,-1.33152 -3,-3v-32c0,-1.66848 1.33152,-3 3,-3zM33,15c0.55,0 1,0.45 1,1v9c0,0.55 -0.45,1 -1,1c-0.55,0 -1,-0.45 -1,-1v-9c0,-0.55 0.45,-1 1,-1zM18,16h5c0.36,0 0.70086,0.19953 0.88086,0.51953c0.17,0.31 0.15875,0.69977 -0.03125,1.00977l-4.04883,6.4707h3.19922c0.55,0 1,0.45 1,1c0,0.55 -0.45,1 -1,1h-5c-0.36,0 -0.70086,-0.19953 -0.88086,-0.51953c-0.17,-0.31 -0.15875,-0.69977 0.03125,-1.00977l4.04883,-6.4707h-3.19922c-0.55,0 -1,-0.45 -1,-1c0,-0.55 0.45,-1 1,-1zM27.5,19c0.61,0 1.17945,0.16922 1.68945,0.44922c0.18,-0.26 0.46055,-0.44922 0.81055,-0.44922c0.55,0 1,0.45 1,1v5c0,0.55 -0.45,1 -1,1c-0.35,0 -0.63055,-0.18922 -0.81055,-0.44922c-0.51,0.28 -1.07945,0.44922 -1.68945,0.44922c-1.93,0 -3.5,-1.57 -3.5,-3.5c0,-1.93 1.57,-3.5 3.5,-3.5zM38.5,19c1.93,0 3.5,1.57 3.5,3.5c0,1.93 -1.57,3.5 -3.5,3.5c-1.93,0 -3.5,-1.57 -3.5,-3.5c0,-1.93 1.57,-3.5 3.5,-3.5zM27.5,21c-0.10375,0 -0.20498,0.01131 -0.30273,0.03125c-0.19551,0.03988 -0.37754,0.11691 -0.53711,0.22461c-0.15957,0.1077 -0.2966,0.24473 -0.4043,0.4043c-0.10769,0.15957 -0.18473,0.3416 -0.22461,0.53711c-0.01994,0.09775 -0.03125,0.19898 -0.03125,0.30273c0,0.10375 0.01131,0.20498 0.03125,0.30273c0.01994,0.09775 0.04805,0.19149 0.08594,0.28125c0.03789,0.08977 0.08482,0.17607 0.13867,0.25586c0.05385,0.07979 0.11578,0.15289 0.18359,0.2207c0.06781,0.06781 0.14092,0.12975 0.2207,0.18359c0.15957,0.10769 0.3416,0.18473 0.53711,0.22461c0.09775,0.01994 0.19898,0.03125 0.30273,0.03125c0.10375,0 0.20498,-0.01131 0.30273,-0.03125c0.68428,-0.13959 1.19727,-0.7425 1.19727,-1.46875c0,-0.83 -0.67,-1.5 -1.5,-1.5zM38.5,21c-0.10375,0 -0.20498,0.01131 -0.30273,0.03125c-0.09775,0.01994 -0.19149,0.04805 -0.28125,0.08594c-0.08977,0.03789 -0.17607,0.08482 -0.25586,0.13867c-0.07979,0.05385 -0.15289,0.11578 -0.2207,0.18359c-0.13562,0.13563 -0.24648,0.29703 -0.32227,0.47656c-0.03789,0.08976 -0.066,0.1835 -0.08594,0.28125c-0.01994,0.09775 -0.03125,0.19898 -0.03125,0.30273c0,0.10375 0.01131,0.20498 0.03125,0.30273c0.01994,0.09775 0.04805,0.19149 0.08594,0.28125c0.03789,0.08977 0.08482,0.17607 0.13867,0.25586c0.05385,0.07979 0.11578,0.15289 0.18359,0.2207c0.06781,0.06781 0.14092,0.12975 0.2207,0.18359c0.07979,0.05385 0.16609,0.10078 0.25586,0.13867c0.08976,0.03789 0.1835,0.066 0.28125,0.08594c0.09775,0.01994 0.19898,0.03125 0.30273,0.03125c0.10375,0 0.20498,-0.01131 0.30273,-0.03125c0.68428,-0.13959 1.19727,-0.7425 1.19727,-1.46875c0,-0.83 -0.67,-1.5 -1.5,-1.5z"></path>
                    </g>
                  </g>
                </svg>
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
        title="Nội dung bài học"
        open={assignmentModal}
        onCancel={() => setAssignmentModal(false)}
        footer={[
          <Button
            style={{ marginTop: "20px" }}
            key="close"
            onClick={() => setAssignmentModal(false)}
          >
            Đóng
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
                maxHeight: "70vh",
                width: "100%",
                height: "70vh",
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
                classID={selectedClass}
                students={students}
                lessons={lessons}
                setLessons={setLessons}
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
                lessonByScheduleData={lessonByScheduleData}
                daysOfWeek={daysOfWeek}
                setLessonByScheduleData={setLessonByScheduleData}
                classID={selectedClass}
                students={students}
              />
            </div>
          </div>
        )}
      </Modal>
      {/* // Trong TeacherPage component */}
      <TeacherProfileModal
        open={isTeacherProfileModalVisible}
        onClose={() => setIsTeacherProfileModalVisible(false)}
        teacher={teacherData}
      />
      <Modal
        title="Quản lý bài tập"
        open={homeworkModal}
        onCancel={() => setHomeworkModal(false)}
        footer={[
          <Button style={{ marginTop: "20px" }} key="close" onClick={() => setHomeworkModal(false)}>
            Đóng
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
                maxHeight: "70vh",
                width: "100%",
                height: "70vh",
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
                classID={selectedClass}
                students={students}
                homeworkZaloLink={homeworkZaloLink}
                homeWorks={homeWorks}
                setHomeWorks={setHomeWorks}
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
                lessonByScheduleData={lessonByScheduleData}
                daysOfWeek={daysOfWeek}
                setLessonByScheduleData={setLessonByScheduleData}
                classID={selectedClass}
                students={students}
              />
            </div>
          </div>
        )}
      </Modal>
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
        />
      </Modal>
      <Modal
        open={openHomeworkStatisticsDashboard}
        onCancel={() => setOpenHomeworkStatisticsDashboard(false)}
        footer={<></>}
        width={isMobile ? "90%" : "90%"}
        centered={true}
        className="homework-modal"
        style={{
          borderRadius: "8px",
        }}
      >
        <HomeworkStatisticsDashboard
          students={students}
          lessonByScheduleData={lessonByScheduleData}
          daysOfWeek={daysOfWeek}
          isMobile={isMobile}
        />
      </Modal>
    </Layout>
  );
};

export default TeacherPage;
