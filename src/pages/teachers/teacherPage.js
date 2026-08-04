import React, { useEffect, useRef, useState } from "react";
import {
  Layout,
  Avatar,
  Menu,
  Dropdown,
  Button,
  Typography,
  Card,
  Modal,
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
  Divider,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
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
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  PlusOutlined,
  UpOutlined,
  DownOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import EditStudentModal from "./EditStudentModal";
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
import LessonMangement from "components/TeacherPageComponent/LessonMangement";
import homeWorkService from "services/homeWorkService";
import CreateHomeWork from "components/HomeWorkComponent/CreateHomeWork";
import HomeWorkMangement from "components/HomeWorkComponent/HomeWorkMangement";
import teacherService from "services/teacherService";
import MultiStudentEvaluationModal from "./multiEvaluationModal";
import StudentProfileModal from "./studentProfileModal";
import notificationService from "services/notificationService";
import HomeworkStatisticsDashboard from "./HomeworkStatisticsDashboard";
import TeacherFeedbackModal from "./teacherFeedbackModal";
import contentPageService from "services/contentpageService";
import CreateStudentModal from "./CreateStudentModal";
import ChatComponent from "components/ChatComponent/ChatComponent";
import { io } from "socket.io-client"; // Thêm import này
import messageService from "services/messageService";
import classScheduleService from "services/classScheduleService";
import sidebarLinkService from "services/sidebarLinkService";
import { openPptWindow } from "services/pptLaunch";
import toolbar from "utils/teacherPageToolBar";
import quillFormats from "utils/teacherPageQuillFormat";
import daysOfWeek from "utils/dayofWeek";
import getTimeElapsed from "utils/getTimeElapsed";
import NotificationMenu from "components/TeacherPageComponent/NotificationComponent";

const { Header } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
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

const TeacherPage = () => {
  const [isChatDrawerVisible, setIsChatDrawerVisible] = useState(false);
  // END: ADD STATE FOR CHAT DRAWER

  const [isAttendanceMode, setIsAttendanceMode] = useState(false);
  const [isAttendanceGuideVisible, setIsAttendanceGuideVisible] = useState(false);
  const [isEditStudentModalVisible, setIsEditStudentModalVisible] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);
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
  const [isCreateStudentModalVisible, setIsCreateStudentModalVisible] = useState(false);

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
  const [selectedNotification, setSelectedNotification] = useState(null); // State mới cho thông báo được chọn
  const [openDetailModal, setOpenDetailModal] = useState(false); // State mới cho modal chi tiết
  // Use Ant Design's Grid breakpoints
  const screens = useBreakpoint();

  const [groupSocket, setGroupSocket] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [isGroupChatLoading, setIsGroupChatLoading] = useState(true);
  const [hasNewGroupMessage, setHasNewGroupMessage] = useState(false);
  const [isGroupChatDrawerVisible, setIsGroupChatDrawerVisible] = useState(false);

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
  const [selectLanguageClick, setSelectLanguageClick] = useState(false);
  const quillRefLessonCreate = useRef(null);
  const quillRefLessonUpdate = useRef(null);
  const quillRefLessonPlanCreate = useRef(null);
  const quillRefLessonPlanUpdate = useRef(null);
  const quillRefHomeWorkCreate = useRef(null);
  const quillRefHomeWorkUpdate = useRef(null);
  const [placeholderLessonPlan, setPlaceholderLessonPlan] = useState("");
  const [isLessonCreate, setIsLessonCreate] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState(null);
  const [loadingUpdateSchedule, setLoadingUpdateSchedule] = useState(false);

  // Class PIN Lock states
  const [isLockModalVisible, setIsLockModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [loadingLock, setLoadingLock] = useState(false);

  // Floating Links states
  const [floatingLinks, setFloatingLinks] = useState([]);
  const [showFloatingLinks, setShowFloatingLinks] = useState(false);
  const [isCreateFloatingLinkOpen, setIsCreateFloatingLinkOpen] = useState(false);
  const [loadingCreateFloatingLink, setLoadingCreateFloatingLink] = useState(false);
  const [newFloatingLinkData, setNewFloatingLinkData] = useState({ name: "", link: "", type: 2 });
  const fileInputRefFloatingLink = useRef(null);
  const [previewUrlFloatingLink, setPreviewUrlFloatingLink] = useState("");
  const [imageLoadingFloatingLink, setImageLoadingFloatingLink] = useState(false);

  const handleFileChangeFloatingLink = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageLoadingFloatingLink(true);
    const fileReader = new FileReader();
    fileReader.onload = () => setPreviewUrlFloatingLink(fileReader.result);
    fileReader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (response.status === 201 && response.data.url) {
        setNewFloatingLinkData((prev) => ({ ...prev, imgUrl: response.data.url }));
        setImageLoadingFloatingLink(false);
        message.success("Đã tải ảnh lên thành công");
      } else {
        setImageLoadingFloatingLink(false);
        message.error("Tải ảnh lên thất bại");
      }
    } catch (error) {
      setImageLoadingFloatingLink(false);
      message.error(`Lỗi tải ảnh: ${error.message}`);
    }
  };

  const fetchFloatingLinks = async () => {
    try {
      const data = await sidebarLinkService.getAllSidebars();
      setFloatingLinks(data.filter((link) => link.type === 2));
    } catch (error) {
      console.error("Error fetching floating links:", error);
    }
  };

  useEffect(() => {
    fetchFloatingLinks();
  }, []);

  const handleCreateFloatingLink = async () => {
    if (!newFloatingLinkData.name || !newFloatingLinkData.link) {
      message.error("Vui lòng nhập đầy đủ tên mục và link!");
      return;
    }
    try {
      setLoadingCreateFloatingLink(true);
      await sidebarLinkService.createSidebar(newFloatingLinkData);
      message.success("Thêm mục link thành công!");
      setIsCreateFloatingLinkOpen(false);
      setNewFloatingLinkData({ name: "", link: "", type: 2, imgUrl: "" });
      setPreviewUrlFloatingLink("");
      fetchFloatingLinks();
    } catch (error) {
      message.error("Lỗi khi thêm link: " + error.message);
    } finally {
      setLoadingCreateFloatingLink(false);
    }
  };

  const refreshClasses = async () => {
    try {
      const data = await classService.getAllClassesByTeacher(teacherId);
      setClasses(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lớp học:", error);
    }
  };

  // Handle lock class with PIN
  const handleLockClass = async () => {
    if (!pinInput || !/^\d{4}$/.test(pinInput)) {
      message.error("Mã PIN phải là 4 chữ số!");
      return;
    }
    try {
      setLoadingLock(true);
      await classService.lockClass(selectedClass, pinInput);
      message.success("Đã khóa lớp thành công!");
      setIsLockModalVisible(false);
      setPinInput("");
      // Refresh class data
      const data = await classService.getClassById(selectedClass);
      setClassData(data);
      await refreshClasses();
    } catch (error) {
      message.error("Lỗi khi khóa lớp: " + (error || "Unknown error"));
    } finally {
      setLoadingLock(false);
    }
  };

  // Handle unlock class
  const handleUnlockClass = async () => {
    Modal.confirm({
      title: "Xác nhận mở khóa lớp",
      content: "Bạn có chắc chắn muốn mở khóa lớp này? Học sinh sẽ vào lớp mà không cần nhập mã PIN.",
      okText: "Mở khóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoadingLock(true);
          await classService.unlockClass(selectedClass);
          message.success("Đã mở khóa lớp thành công!");
          // Refresh class data
          const data = await classService.getClassById(selectedClass);
          setClassData(data);
          await refreshClasses();
        } catch (error) {
          message.error("Lỗi khi mở khóa lớp: " + (error || "Unknown error"));
        } finally {
          setLoadingLock(false);
        }
      },
    });
  };

  const studentContextMenu = (student) => (
    <Menu>
      <Menu.Item
        key="view-profile"
        icon={<UserOutlined />}
        onClick={() => {
          setSelectedStudentForProfile(student);
          setIsProfileModalVisible(true);
        }}
      >
        View Profile
      </Menu.Item>
      <Menu.Item
        key="edit-profile"
        icon={<EditOutlined />}
        onClick={() => {
          setSelectedStudentForEdit(student);
          setIsEditStudentModalVisible(true);
        }}
      >
        Edit Profile
      </Menu.Item>
      <Menu.Item
        key="request-delete"
        icon={<DeleteOutlined />}
        danger
        onClick={() => {
          setSelectedStudents([student]);
          handleDeleteStudents();
        }}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    const fetchPlaceholder = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/contentpage/lessonPlanPlaceholder`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        console.log("Placeholder:", response.data);

        setPlaceholderLessonPlan(response.data);
      } catch (error) {
        console.error("Error fetching placeholder:", error);
      }
    };
    fetchPlaceholder();
  }, []);
  console.log(homeworkModal);
  useEffect(() => {
    const handlePaste = (e) => {
      const editorA = quillRefHomeWorkCreate.current?.getEditor()?.root;
      const editorB = quillRefHomeWorkUpdate.current?.getEditor()?.root;

      const isEditorA = editorA?.contains(document.activeElement);
      const isEditorB = editorB?.contains(document.activeElement);
      const isHomeworkDescriptionCreate =
        document.activeElement.parentElement.parentElement.id === "HomeworkDescriptionCreate";
      const isHomeworkDescriptionUpdate =
        document.activeElement.parentElement.parentElement.id === "HomeworkDescriptionUpdate";

      let quill;
      if (!editingHomeWork && isHomeworkDescriptionCreate && isEditorA) {
        quill = quillRefHomeWorkCreate.current?.getEditor();
      } else if (editingHomeWork && isHomeworkDescriptionUpdate && isEditorB) {
        quill = quillRefHomeWorkUpdate.current?.getEditor();
      }

      if (!quill) return;

      const clipboardData = e.clipboardData;
      const items = clipboardData?.items;

      if (!items) return;

      for (const item of items) {
        if (item?.type?.indexOf("image") !== -1) {
          e.preventDefault(); // Ngăn xử lý mặc định của Quill

          const file = item.getAsFile();

          if (!file) return;

          const formData = new FormData();
          formData.append("file", file);

          axios
            .post(process.env.REACT_APP_API_BASE_URL + "/files/upload", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
              if (response.status === 201 && response.data.url) {
                const range = quill.getSelection(true) || { index: quill.getLength() };
                quill.insertEmbed(range.index, "image", response.data.url, "user");
                setTimeout(() => {
                  const imgs = quill.root.querySelectorAll(`img[src="${response.data.url}"]`);
                  imgs.forEach((img) => {
                    img.classList.add("ql-image");
                    img.style.maxWidth = "100%";
                    img.onerror = () => {
                      console.error("Image failed to load:", response.data.url);
                      message.error(`Không thể tải ảnh: ${response.data.url}`);
                    };
                  });
                  message.success(`Đã chèn ảnh ${file.name} thành công`);
                }, 100);
              } else {
                message.error(`Upload ảnh ${file.name} thất bại: Không nhận được URL từ server`);
              }
            })
            .catch((err) => {
              console.error("Upload error:", err);
              message.error(
                `Lỗi upload ảnh ${file.name}: ${err.response?.data?.message || err.message}`
              );
            });

          break; // Chỉ xử lý ảnh đầu tiên
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [quillRefHomeWorkCreate, quillRefHomeWorkUpdate, editingHomeWork]);

  const handleDeleteStudents = async () => {
    if (selectedStudents.length === 0) {
      notification.warning({
        message: "Chưa chọn học sinh",
        description: "Vui lòng chọn ít nhất một học sinh để xóa.",
        placement: "topRight",
        duration: 4,
      });
      return;
    }

    Modal.confirm({
      title: "Xác nhận gửi yêu cầu xóa",
      content: `Bạn có chắc chắn muốn gửi yêu cầu xóa ${selectedStudents.length} học sinh khỏi lớp này? Yêu cầu sẽ được gửi đến admin để xử lý.`,
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          setLoading(true);
          const studentIds = selectedStudents.map((student) => student.id);

          await Promise.all(
            studentIds.map((studentId) => studentService.requestDeleteStudent(studentId))
          );

          setSelectedStudents([]);
          setAllStudentsSelected(false);

          notification.success({
            message: "Thành công",
            description: "Yêu cầu xóa học sinh đã được gửi đến admin.",
            placement: "topRight",
            duration: 4,
          });
        } catch (error) {
          console.error("Lỗi khi gửi yêu cầu xóa học sinh:", error);
          notification.error({
            message: "Lỗi",
            description: "Không thể gửi yêu cầu xóa học sinh. Vui lòng thử lại.",
            placement: "topRight",
            duration: 4,
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };
  // console.log(editingHomeWork);
  useEffect(() => {
    const menu = document.getElementById(":0.container");
    const menu2 = document.getElementById(":2.container");
    console.log("Menu:", menu);

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
  useEffect(() => {
    const handlePaste = (e) => {
      const editorA = quillRefHomeWorkCreate.current?.getEditor()?.root;
      const editorB = quillRefHomeWorkUpdate.current?.getEditor()?.root;

      const isEditorA = editorA?.contains(document.activeElement);
      const isEditorB = editorB?.contains(document.activeElement);
      const isHomeworkDescriptionCreate =
        document.activeElement.parentElement.parentElement.id === "HomeworkDescriptionCreate";
      const isHomeworkDescriptionUpdate =
        document.activeElement.parentElement.parentElement.id === "HomeworkDescriptionUpdate";

      let quill;
      if (!editingHomeWork && isHomeworkDescriptionCreate && isEditorA) {
        quill = quillRefHomeWorkCreate.current?.getEditor();
      } else if (editingHomeWork && isHomeworkDescriptionUpdate && isEditorB) {
        quill = quillRefHomeWorkUpdate.current?.getEditor();
      }

      if (!quill) return;

      const clipboardData = e.clipboardData;
      const items = clipboardData?.items;

      if (!items) return;

      for (const item of items) {
        if (item?.type?.indexOf("image") !== -1) {
          e.preventDefault(); // Ngăn xử lý mặc định của Quill

          const file = item.getAsFile();

          if (!file) return;

          const formData = new FormData();
          formData.append("file", file);

          axios
            .post(process.env.REACT_APP_API_BASE_URL + "/files/upload", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
              if (response.status === 201 && response.data.url) {
                const range = quill.getSelection(true) || { index: quill.getLength() };
                quill.insertEmbed(range.index, "image", response.data.url, "user");
                setTimeout(() => {
                  const imgs = quill.root.querySelectorAll(`img[src="${response.data.url}"]`);
                  imgs.forEach((img) => {
                    img.classList.add("ql-image");
                    img.style.maxWidth = "100%";
                    img.onerror = () => {
                      console.error("Image failed to load:", response.data.url);
                      message.error(`Không thể tải ảnh: ${response.data.url}`);
                    };
                  });
                  message.success(`Đã chèn ảnh ${file.name} thành công`);
                }, 100);
              } else {
                message.error(`Upload ảnh ${file.name} thất bại: Không nhận được URL từ server`);
              }
            })
            .catch((err) => {
              console.error("Upload error:", err);
              message.error(
                `Lỗi upload ảnh ${file.name}: ${err.response?.data?.message || err.message}`
              );
            });

          break; // Chỉ xử lý ảnh đầu tiên
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [quillRefHomeWorkCreate, quillRefHomeWorkUpdate, editingHomeWork]);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoadingNotification(true);
        const notiData = { type: true };
        const res = await notificationService.getAllGeneralNotificationsByType(notiData);
        const readNotifications = JSON.parse(localStorage.getItem("readNotifications")) || [];

        // Sắp xếp thông báo theo createdAt (mới nhất trước) và thêm timeElapsed, isRead
        const sortedData = res
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((item) => ({
            ...item,
            timeElapsed: getTimeElapsed(item.createdAt),
            isRead: readNotifications.includes(item.id) || item.isRead,
          }));

        setNotifications(sortedData);
      } catch (error) {
        setErrorNotification(error.message || "Không thể tải thông báo");
      } finally {
        setLoadingNotification(false);
      }
    };
    fetchNotification();
  }, []);

  // Hàm định dạng thời gian cho thông báo (tương tự index.js)
  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  // Xử lý khi nhấp vào thông báo
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setOpenDetailModal(true);
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notification.id ? { ...notif, isRead: true } : notif))
      );
      const readNotifications = JSON.parse(localStorage.getItem("readNotifications")) || [];
      if (!readNotifications.includes(notification.id)) {
        readNotifications.push(notification.id);
        localStorage.setItem("readNotifications", JSON.stringify(readNotifications));
      }
    }
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    localStorage.setItem("readNotifications", JSON.stringify(allIds));
  };

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

      const filterData = data?.filter((lesson) =>
        lessonByScheduleData?.some((item) => item.lessonId === lesson.id)
      );
      console.log(data, lessonByScheduleData, filterData);
      setLessons(filterData);
    } catch (err) {
      console.log(err);

      message.error("Failed to load lessons!", err);
    } finally {
      setLoading(false);
    }
  };
  // useEffect(() => {
  //   fetchHomeWork();
  // }, [loadingCreateHomeWork]);

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
  // const handleRightClick = (student, e) => {
  //   e.preventDefault(); // Ngăn menu context mặc định của trình duyệt
  //   setSelectedStudentForProfile(student);
  //   setIsProfileModalVisible(true);
  // };
  const handleRightClick = (student, e) => {
    e.preventDefault(); // Prevent default browser context menu
  };
  const openAssignmentModal = () => {
    setSelectedStudents([]);
    setAllStudentsSelected(false);
    setAssignmentModal(true);
    setIsLessonCreate(true);
  };

  const openHomeworkModal = () => {
    setSelectedStudents([]);
    setAllStudentsSelected(false);
    setHomeworkModal(true);
    setIsLessonCreate(false);
  };

  const openStandalonePpt = () => {
    try {
      openPptWindow({ language: "vi" });
    } catch (error) {
      message.error(error?.message || "Kh\u00f4ng th\u1ec3 m\u1edf tr\u00ecnh so\u1ea1n PPT.");
    }
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

      // Reload dữ liệu để làm mới HomeworkStatisticsDashboard
      await fetchLessonByScheduleAndLessonByLevel();

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
    fetchContentData();
  }, []);
  useEffect(() => {
    if (selectedClass) {
      fetchLessonByScheduleAndLessonByLevel();
    }
  }, [selectedClass, loadingCreateHomeWork, loadingCreateLesson]);

  useEffect(() => {
    // Reset khi không có lớp nào được chọn
    if (!selectedClass) {
      groupSocket?.disconnect();
      setGroupSocket(null);
      setGroupMessages([]);
      setHasNewGroupMessage(false);
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) return;

    // 1. Lấy lịch sử tin nhắn
    const fetchHistory = async () => {
      setIsGroupChatLoading(true);
      try {
        const history = await messageService.getMessagesForClass(selectedClass);
        setGroupMessages(history);
      } catch (err) {
        console.error("Failed to fetch group chat history:", err);
      } finally {
        setIsGroupChatLoading(false);
      }
    };
    fetchHistory();

    // 2. Thiết lập kết nối WebSocket
    const newSocket = io(process.env.REACT_APP_API_BASE_URL, {
      extraHeaders: { Authorization: `Bearer ${token}` },
    });
    setGroupSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinRoom", { classId: String(selectedClass) });
    });

    newSocket.on("newMessage", (newMessage) => {
      setGroupMessages((prev) => [
        ...prev.filter((m) => m.tempId !== newMessage.tempId),
        newMessage,
      ]);

      const isFromAnotherUser =
        newMessage.senderType !== "teacher" || newMessage.senderTeacher?.id !== teacherId;
      if (isFromAnotherUser && !isGroupChatDrawerVisible) {
        setHasNewGroupMessage(true);
      }
    });

    newSocket.on("messageRecalled", (data) => {
      setGroupMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    });

    // 3. Cleanup khi component unmount hoặc selectedClass thay đổi
    return () => {
      newSocket.disconnect();
    };
  }, [selectedClass, teacherId, isGroupChatDrawerVisible]);

  const openGroupChatDrawer = () => {
    setHasNewGroupMessage(false);
    setIsGroupChatDrawerVisible(true);
  };

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

  const refreshStudents = async () => {
    try {
      const data = await studentService.getAllStudentsbyClass(selectedClass);
      setStudents(data);
    } catch (error) {
      console.error("Error refreshing students:", error);
      setStudents([]);
    }
  };

  const fetchLessonByScheduleAndLessonByLevel = async () => {
    try {
      setLoading(true);
      const data = await lessonByScheduleService.getAllLessonBySchedulesOfClass(selectedClass);
      data.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sắp xếp theo ngày tăng dần
      setLessonByScheduleData(data);
      // fetchLessons();
      const classData = classes?.find((c) => c.id === selectedClass);
      const token = sessionStorage.getItem("token");

      // Giải mã token để lấy role
      const decoded = jwtDecode(token);
      if (!decoded) {
        return;
      }
      const dataLesson = await lessonService.getLessonByTeacherId(decoded.userId);

      const filterLessonData = dataLesson?.filter((lesson) =>
        data?.some((item) => item.lessonID === lesson.id)
      );
      // console.log(dataLesson, data, filterData);
      setLessons(filterLessonData);
      const dataHomework = await homeWorkService.getHomeWorkByTeacherId(decoded.userId);
      const filterHomeworkData = dataHomework?.filter((homework) =>
        data?.some((item) => item.homeWorkId === homework.id)
      );
      setHomeWorks(filterHomeworkData);
      // console.log(dataHomework, data, filterHomeworkData);
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

  const getDatesForSelectedSchedules = () => {
    const resultDates = [];
    let currentDate = new Date(
      lessonByScheduleData?.[(lessonByScheduleData?.length ?? 0) - 1].date
    );
    const endDate = new Date(lessonByScheduleData?.[(lessonByScheduleData?.length ?? 0) - 1].date);
    endDate.setMonth(endDate.getMonth() + 6);

    while (currentDate <= endDate) {
      selectedSchedules.forEach((schedule) => {
        if (currentDate.getDay() === schedule.dayOfWeek - 1) {
          resultDates.push({
            classID: selectedClass,
            scheduleID: schedule.id,
            lessonID: null,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            date: currentDate.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }),
          });
        }
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
    return resultDates;
  };

  const onUpdateSchedule = async () => {
    try {
      if (loadingUpdateSchedule) {
        return;
      }

      setLoadingUpdateSchedule(true);

      const dateString = lessonByScheduleData?.[(lessonByScheduleData?.length ?? 0) - 1].date;
      const inputDate = new Date(dateString);
      const today = new Date();

      const monthDiff =
        (inputDate.getFullYear() - today.getFullYear()) * 12 +
        (inputDate.getMonth() - today.getMonth());

      if (selectedSchedules.length > 0 && monthDiff < 3) {
        const dataForLessonBySchedule = {
          lessons: getDatesForSelectedSchedules(),
        };
        const lessonBySchedulesRes = await lessonByScheduleService.createLessonBySchedule(
          dataForLessonBySchedule
        );
        const classScheduleDatas = [];
        selectedSchedules.forEach((schedule) => {
          const classScheduleData = {
            classID: selectedClass,
            scheduleID: schedule.id,
          };
          classScheduleDatas.push(classScheduleData);
        });
        await classScheduleService.createClassSchedule(classScheduleDatas);

        const lessonByScheduleDataUpdated = [...lessonByScheduleData, ...lessonBySchedulesRes];

        setLessonByScheduleData(lessonByScheduleDataUpdated);

        message.success("Cập nhật lịch thành công!");
      } else {
        message.warning("Last schedule must be at least 3 months from now");
      }
    } catch (e) {
      message.error("something went wrong!" + e);
    } finally {
      setLoadingUpdateSchedule(false);
    }
  };

  useEffect(() => {
    const getAllSchedulesOfClass = async () => {
      try {
        const schedules = await lessonByScheduleService.getAllSchedulesOfClass(selectedClass);

        setSelectedSchedules(schedules);
      } catch (error) {
        message.error("schedules fetch failed");
      }
    };

    if (selectedClass) {
      getAllSchedulesOfClass();
    }
  }, [selectedClass]);

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
              refreshClasses={refreshClasses}
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
          refreshClasses={refreshClasses}
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
              <>
                <Tag color="green" bordered={false} style={{ fontSize: isMobile ? "12px" : "16px" }}>
                  {"Mã lớp: "}
                  {classes.find((cls) => cls.id === selectedClass)?.accessId}
                </Tag>
                <Button
                  type="text"
                  size="small"
                  loading={loadingLock}
                  icon={classData?.isLocked ? <LockOutlined style={{ color: "#ff4d4f" }} /> : <UnlockOutlined style={{ color: colors.deepGreen }} />}
                  onClick={() => {
                    if (classData?.isLocked) {
                      handleUnlockClass();
                    } else {
                      setPinInput("");
                      setIsLockModalVisible(true);
                    }
                  }}
                  title={classData?.isLocked ? `Lớp đang khóa (PIN: ${classData?.classPin || "****"}) - Click để mở khóa` : "Khóa lớp bằng mã PIN"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: 4,
                  }}
                />
              </>
            )}
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              overlay={
                <NotificationMenu
                  colors={colors}
                  notifications={notifications}
                  loadingNotification={loadingNotification}
                  errorNotification={errorNotification}
                  onClickNotification={handleNotificationClick}
                  onMarkAllRead={handleMarkAllRead}
                  formatTime={formatTime}
                />
              }
            >
              <Button
                type="text"
                style={{
                  marginRight: 12,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 8px",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                  ...(notifications.filter((n) => !n.isRead).length > 0 && {
                    backgroundColor: "#FF6B6B",
                    border: "2px solid #FF4757",
                    boxShadow: "0 4px 15px rgba(255, 71, 87, 0.3)",
                    animation: "pulse 2s infinite",
                  }),
                }}
              >
                <Badge count={notifications.filter((n) => !n.isRead).length} size="small">
                  <BellOutlined
                    style={{
                      fontSize: 20,
                      color:
                        notifications.filter((n) => !n.isRead).length > 0
                          ? colors.white
                          : colors.darkGreen,
                      ...(notifications.filter((n) => !n.isRead).length > 0 && {
                        filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))",
                        animation: "glow 1.5s ease-in-out infinite alternate",
                      }),
                    }}
                  />
                </Badge>
              </Button>
            </Dropdown>
            <style>
              {`
      @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3); }
        50% { transform: scale(1.08); box-shadow: 0 6px 20px rgba(255, 71, 87, 0.5); }
        100% { transform: scale(1); box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3); }
      }
      @keyframes glow {
        from { filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)); }
        to { filter: drop-shadow(0 0 15px rgba(255, 255, 255, 1)); }
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
        40% { transform: translateY(-3px) scale(1.1); }
        60% { transform: translateY(-1px) scale(1.05); }
      }
    `}
            </style>

            {/* Help/Question Icon */}
            <Button
              type="text"
              onClick={() => {
                window.open(contentData?.centerZaloLink || "https://chat.zalo.me/");
              }}
              style={{
                marginRight: 12,
                color: colors.darkGreen,
                padding: 0,
              }}
            >
              <QuestionCircleOutlined style={{ fontSize: 20 }} />
            </Button>
            <div
              id="google_translate_element"
              style={{ marginRight: "5px" }}
              onClick={() => setSelectLanguageClick(!selectLanguageClick)}
            ></div>
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
                gap: "10px",
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
            const isSelected = selectedStudents.some((s) => s.id === student.id);

            return (
              <Col xs={20} sm={10} md={8} lg={6} xl={4} key={student.id}>
                <Dropdown overlay={studentContextMenu(student)} trigger={["contextMenu"]}>
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
                                    studentAttendance.present === 1
                                      ? colors.safeGreen
                                      : colors.white,
                                  borderColor:
                                    studentAttendance.present === 1
                                      ? colors.safeGreen
                                      : colors.borderGreen,
                                  color:
                                    studentAttendance.present === 1
                                      ? colors.white
                                      : colors.darkGray,
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
                                    studentAttendance.present === 0
                                      ? colors.errorRed
                                      : colors.white,
                                  borderColor:
                                    studentAttendance.present === 0
                                      ? colors.errorRed
                                      : colors.borderGreen,
                                  color:
                                    studentAttendance.present === 0
                                      ? colors.white
                                      : colors.darkGray,
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
                                    studentAttendance.present === 2
                                      ? colors.white
                                      : colors.darkGray,
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
                </Dropdown>
              </Col>
            );
          })}
          {selectedClass && (
            <Col xs={20} sm={10} md={8} lg={6} xl={4}>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: `0 2px 8px ${colors.softShadow}`,
                  border: `1px solid ${colors.borderGreen}`,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  backgroundColor: colors.white,
                }}
                hoverable
                bodyStyle={{ padding: "16px" }}
                onClick={() => setIsCreateStudentModalVisible(true)}
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
                      backgroundColor: colors.midGreen,
                      color: colors.white,
                      marginBottom: "12px",
                      fontSize: isMobile ? "24px" : "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </Avatar>
                  <Typography.Title
                    level={5}
                    style={{ margin: "0 0 8px 0", color: colors.darkGreen }}
                  >
                    Create Student
                  </Typography.Title>
                </div>
              </Card>
            </Col>
          )}
        </Row>
        {selectedStudents.length > 0 && (
          <EvaluationModal
            visible={isEvaluationModalVisible}
            onClose={() => setIsEvaluationModalVisible(false)}
            students={selectedStudents}
          />
        )}

        <CreateStudentModal
          visible={isCreateStudentModalVisible}
          onClose={() => setIsCreateStudentModalVisible(false)}
          classID={selectedClass}
          isMobile={isMobile}
          refreshStudents={refreshStudents}
        />

        <EditStudentModal
          visible={isEditStudentModalVisible}
          onClose={() => {
            setIsEditStudentModalVisible(false);
            setSelectedStudentForEdit(null);
          }}
          student={selectedStudentForEdit}
          classID={selectedClass}
          isMobile={isMobile}
          refreshStudents={refreshStudents}
        />

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

        <div
            style={{
              position: "fixed",
              bottom: 0,
              left: isMobile ? 0 : 260,
              right: 0,
              zIndex: 10,
            }}
          >
            {selectedClass && (
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
            )}
            <Toolbox
              onHomework={openHomeworkModal}
              onAssignment={() => openAssignmentModal()}
              onCreatePpt={openStandalonePpt}
              showClassTools={Boolean(selectedClass)}
              onClassReview={handleOpenEvaluationModal}
              onEnterScores={handleEnterTestScores}
              onAttendanceCheck={handleAttendanceCheck}
              setOpenHomeworkStatisticsDashboard={setOpenHomeworkStatisticsDashboard}
              // setIsLessonCreate = {setIsLessonCreate}
            />

            {selectedClass && (
              <>
                {/* Floating Links & Social Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                position: "fixed",
                bottom: "60px",
                right: "20px",
                flexDirection: "column",
                zIndex: 1000,
              }}
            >
              {/* Floating Links Area - Hợp nhất toàn bộ Link, FB, Zalo */}
              {!showFloatingLinks ? (
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    border: `1px solid ${colors.deepGreen}`,
                  }}
                  onClick={() => setShowFloatingLinks(true)}
                  title="Hiện các link tham khảo"
                >
                  <UpOutlined style={{ fontSize: "20px", color: colors.deepGreen }} />
                </div>
              ) : (
                <>
                  {(() => {
                    const linksArray = [
                      ...floatingLinks.map(l => ({ type: 'custom', data: l }))
                    ];
                    const cols = [];
                    for (let i = 0; i < linksArray.length; i += 3) {
                      cols.push(linksArray.slice(i, i + 3));
                    }
                    return (
                      <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '10px', alignItems: 'flex-end', marginBottom: '0px' }}>
                        {cols.map((col, colIndex) => (
                          <div key={colIndex} style={{ display: 'flex', flexDirection: 'column-reverse', gap: '10px' }}>
                            {col.map((item, itemIndex) => {
                              const link = item.data;
                              return (
                                <div
                                  key={link.id}
                                  style={{
                                    width: "50px", height: "50px", background: "transparent", cursor: "pointer",
                                    overflow: "hidden", borderRadius: "8px"
                                  }}
                                  onClick={() => window.open(link.link)}
                                  title={link.name}
                                >
                                  {link.imgUrl ? (
                                    <img src={link.imgUrl} alt={link.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  ) : (
                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: colors.deepGreen, color: "white", borderRadius: "8px" }}>
                                      <LinkOutlined style={{ fontSize: "24px" }} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {colIndex === 0 && userId.role === 'admin' && (
                              <div
                                key="create"
                                style={{
                                  width: "50px", height: "50px", background: "white", borderRadius: "50%",
                                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)", border: `2px dashed ${colors.deepGreen}`
                                }}
                                onClick={() => setIsCreateFloatingLinkOpen(true)}
                                title="Thêm mục link tham khảo mới"
                              >
                                <PlusOutlined style={{ fontSize: "24px", color: colors.deepGreen }} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Nút Collapse */}
                  <div
                    style={{
                      width: "50px", height: "50px", background: "white", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", border: `1px solid ${colors.deepGreen}`
                    }}
                    onClick={() => setShowFloatingLinks(false)}
                    title="Thu gọn"
                  >
                    <DownOutlined style={{ fontSize: "20px", color: colors.deepGreen }} />
                  </div>
                </>
              )}
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
              </>
            )}
        </div>
      </Layout>
      <Modal
        title="Nội dung bài học"
        open={assignmentModal}
        onCancel={() => {
          if (quillRefLessonCreate.current) {
            const editor = quillRefLessonCreate.current.getEditor();
            editor.setContents([]);
          }
          if (quillRefLessonPlanCreate.current) {
            const editor = quillRefLessonPlanCreate.current.getEditor();
            editor.setContents([]);
          }
          if (quillRefLessonUpdate.current) {
            const editor = quillRefLessonUpdate.current.getEditor();
            editor.setContents([]);
          }
          if (quillRefLessonPlanUpdate.current) {
            const editor = quillRefLessonPlanUpdate.current.getEditor();
            editor.setContents([]);
          }
          setAssignmentModal(false);
        }}
        footer={[
          <Button
            style={{ marginTop: "20px" }}
            key="close"
            onClick={() => {
              if (quillRefLessonCreate.current) {
                const editor = quillRefLessonCreate.current.getEditor();
                editor.setContents([]);
              }
              if (quillRefLessonPlanCreate.current) {
                const editor = quillRefLessonPlanCreate.current.getEditor();
                editor.setContents([]);
              }
              if (quillRefLessonUpdate.current) {
                const editor = quillRefLessonUpdate.current.getEditor();
                editor.setContents([]);
              }
              if (quillRefLessonPlanUpdate.current) {
                const editor = quillRefLessonPlanUpdate.current.getEditor();
                editor.setContents([]);
              }
              setAssignmentModal(false);
            }}
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
                quillRefDescription={quillRefLessonCreate}
                quillRefLessonPlan={quillRefLessonPlanCreate}
                placeholderLessonPlan={placeholderLessonPlan}
                onUpdateSchedule={onUpdateSchedule}
                loadingUpdateSchedule={loadingUpdateSchedule}
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
                loadingTTSForUpdateLesson={loadingTTSForUpdateLesson}
                setLoadingTTSForUpdateLesson={setLoadingTTSForUpdateLesson}
                level={classData?.level}
                lessonByScheduleData={lessonByScheduleData}
                daysOfWeek={daysOfWeek}
                setLessonByScheduleData={setLessonByScheduleData}
                classID={selectedClass}
                students={students}
                quillRef={quillRefLessonUpdate}
                quillRefLessonPlan={quillRefLessonPlanUpdate}
                placeholderLessonPlan={placeholderLessonPlan}
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
        onCancel={() => {
          if (quillRefHomeWorkCreate.current) {
            const editor = quillRefHomeWorkCreate.current.getEditor();
            editor.setContents([]);
          }
          if (quillRefHomeWorkUpdate.current) {
            const editor = quillRefHomeWorkUpdate.current.getEditor();
            editor.setContents([]);
          }
          setHomeworkModal(false);
        }}
        footer={[
          <Button
            style={{ marginTop: "20px" }}
            key="close"
            onClick={() => {
              if (quillRefHomeWorkCreate.current) {
                const editor = quillRefHomeWorkCreate.current.getEditor();
                editor.setContents([]);
              }
              if (quillRefHomeWorkUpdate.current) {
                const editor = quillRefHomeWorkUpdate.current.getEditor();
                editor.setContents([]);
              }
              setHomeworkModal(false);
            }}
          >
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
                quillRef={quillRefHomeWorkCreate}
                onUpdateSchedule={onUpdateSchedule}
                loadingUpdateSchedule={loadingUpdateSchedule}
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
                loadingTTSForUpdateHomeWork={loadingTTSForUpdateHomeWork}
                setLoadingTTSForUpdateHomeWork={setLoadingTTSForUpdateHomeWork}
                teacherId={teacherId}
                level={classData?.level}
                lessonByScheduleData={lessonByScheduleData}
                daysOfWeek={daysOfWeek}
                setLessonByScheduleData={setLessonByScheduleData}
                classID={selectedClass}
                students={students}
                quillRef={quillRefHomeWorkUpdate}
                selectedClass={selectedClass}
              />
            </div>
          </div>
        )}
      </Modal>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BellOutlined />
            <span>{selectedNotification?.title || "Chi tiết thông báo"}</span>
          </div>
        }
        open={openDetailModal}
        onCancel={() => {
          setOpenDetailModal(false);
          setSelectedNotification(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setOpenDetailModal(false);
              setSelectedNotification(null);
            }}
            style={{
              background: `linear-gradient(135deg, ${colors.deepGreen} 0%, ${colors.darkGreen} 100%)`,
              color: colors.white,
              borderRadius: "8px",
            }}
          >
            Đóng
          </Button>,
        ]}
        width="500px"
        centered
        style={{ borderRadius: "12px" }}
      >
        <div style={{ padding: "16px 0" }}>
          <Typography.Text style={{ lineHeight: 1.6, display: "block", marginBottom: "16px" }}>
            {selectedNotification?.detail || "Không có chi tiết thông báo."}
          </Typography.Text>
          {selectedNotification?.createdAt && (
            <div
              style={{
                padding: "12px",
                backgroundColor: colors.paleGreen,
                borderRadius: "8px",
                borderLeft: `4px solid ${colors.emerald}`,
              }}
            >
              <Typography.Text style={{ color: colors.darkGray }}>
                <strong>Thời gian:</strong>{" "}
                {new Date(selectedNotification.createdAt).toLocaleString("vi-VN")}
              </Typography.Text>
            </div>
          )}
        </div>
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
          classId={selectedClass}
        />
      </Modal>

      {/* START: ADD CHAT BUBBLE AND DRAWER */}
      {selectedClass && (
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined style={{ fontSize: "24px" }} />}
          size="large"
          onClick={() => setIsChatDrawerVisible(true)}
          style={{
            position: "fixed",
            right: 40,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1000,
            boxShadow: "0 6px 16px 0 rgba(0, 0, 0, 0.12)",
            width: 60,
            height: 60,
            backgroundColor: colors.deepGreen,
            borderColor: colors.deepGreen,
          }}
        />
      )}

      <Drawer
        title="Chit Chat"
        placement="right"
        onClose={() => setIsChatDrawerVisible(false)}
        open={isChatDrawerVisible}
        width={isMobile ? "100vw" : 840} // Sử dụng isMobile ở đây
        bodyStyle={{ padding: 0 }}
        destroyOnClose={true}
      >
        {isChatDrawerVisible && (
          <ChatComponent
            currentUser={{ id: teacherId, role: "teacher" }}
            classInfo={classData}
            studentsInClass={students}
            isMobile={isMobile} // VÀ TRUYỀN isMobile VÀO ĐÂY
          />
        )}
      </Drawer>

      {/* {selectedClass && (
        <>
          <Button
            type="primary"
            shape="circle"
            size="large"
            onClick={openGroupChatDrawer}
            style={{
              position: "fixed",
              right: 40,
              top: "50%", // Vị trí cho chat nhóm
              transform: "translateY(-50%)",
              zIndex: 1000,
              width: 60,
              height: 60,
              backgroundColor: colors.deepGreen,
              borderColor: colors.deepGreen,
            }}
            title="Mở chat nhóm"
          >
            <Badge dot={hasNewGroupMessage}>
              <MessageOutlined style={{ fontSize: "24px", color: "white" }} />
            </Badge>
          </Button>

          <Drawer
            title={`Chit Chat: ${classData?.name}`}
            placement="right"
            onClose={() => setIsGroupChatDrawerVisible(false)}
            open={isGroupChatDrawerVisible}
            width={isMobile ? "100vw" : 500}
            bodyStyle={{ padding: 0, display: "flex", flexDirection: "column" }}
            destroyOnClose={false} // Không hủy component để giữ kết nối
          >
            {isGroupChatDrawerVisible && (
              <ChatGroupComponent
                currentUser={{ ...teacherData, role: "teacher" }}
                classInfo={classData}
                socket={groupSocket}
                messages={groupMessages}
                // setMessages={setGroupMessages}
                loading={isGroupChatLoading}
              />
            )}
          </Drawer>
        </>
      )} */}
      {/* Class PIN Lock Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LockOutlined style={{ color: colors.deepGreen }} />
            <span>Khóa lớp bằng mã PIN</span>
          </div>
        }
        open={isLockModalVisible}
        onCancel={() => {
          setIsLockModalVisible(false);
          setPinInput("");
        }}
        onOk={handleLockClass}
        okText="Khóa lớp"
        cancelText="Hủy"
        confirmLoading={loadingLock}
        okButtonProps={{
          style: { backgroundColor: colors.deepGreen, borderColor: colors.deepGreen },
          disabled: !pinInput || !/^\d{4}$/.test(pinInput),
        }}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Text style={{ display: "block", marginBottom: 16, color: colors.darkGray }}>
            Nhập mã PIN 4 số để khóa lớp. Học sinh sẽ cần nhập đúng mã này để vào lớp.
          </Text>
          <Input
            placeholder="Nhập mã PIN 4 số"
            maxLength={4}
            value={pinInput}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, ""); // Only allow digits
              setPinInput(val);
            }}
            style={{
              width: 200,
              textAlign: "center",
              fontSize: 24,
              letterSpacing: 12,
              fontWeight: "bold",
              height: 50,
            }}
          />
          {pinInput && pinInput.length === 4 && (
            <Text style={{ display: "block", marginTop: 8, color: colors.deepGreen }}>
              ✓ Mã PIN hợp lệ
            </Text>
          )}
          {pinInput && pinInput.length > 0 && pinInput.length < 4 && (
            <Text style={{ display: "block", marginTop: 8, color: "#ff4d4f" }}>
              Cần nhập đủ 4 chữ số
            </Text>
          )}
        </div>
      </Modal>

      {/* Create Floating Link Modal */}
      <Modal
        title="Thêm mục link tham khảo"
        open={isCreateFloatingLinkOpen}
        onCancel={() => {
          setIsCreateFloatingLinkOpen(false);
          setNewFloatingLinkData({ name: "", link: "", type: 2, imgUrl: "" });
          setPreviewUrlFloatingLink("");
        }}
        onOk={handleCreateFloatingLink}
        confirmLoading={loadingCreateFloatingLink}
        okText="Tạo"
        cancelText="Hủy"
        okButtonProps={{ style: { background: colors.deepGreen, borderColor: colors.deepGreen } }}
      >
        <Input
          placeholder="Tên hiển thị (VD: Google Drive)"
          value={newFloatingLinkData.name}
          onChange={(e) => setNewFloatingLinkData({ ...newFloatingLinkData, name: e.target.value })}
          style={{ marginBottom: "16px" }}
        />
        <Input
          placeholder="Đường dẫn URL (VD: https://drive...)"
          value={newFloatingLinkData.link}
          onChange={(e) => setNewFloatingLinkData({ ...newFloatingLinkData, link: e.target.value })}
          style={{ marginBottom: "16px" }}
        />
        <div
          style={{
            border: "1px dashed #ccc",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            background: "#fafafa"
          }}
          onClick={() => fileInputRefFloatingLink.current.click()}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRefFloatingLink}
            style={{ display: "none" }}
            onChange={handleFileChangeFloatingLink}
          />
          {previewUrlFloatingLink ? (
            <img
              src={previewUrlFloatingLink}
              alt="Avatar preview"
              style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px", marginBottom: "8px" }}
            />
          ) : (
            <div style={{ padding: "20px" }}>
              <PlusOutlined style={{ fontSize: 30, color: colors.midGreen }} />
            </div>
          )}
          <span style={{ color: "#888" }}>
            {imageLoadingFloatingLink ? "Đang tải ảnh..." : "Click để chọn ảnh đại diện (Tùy chọn)"}
          </span>
        </div>
      </Modal>
    </Layout>
  );
};

export default TeacherPage;
