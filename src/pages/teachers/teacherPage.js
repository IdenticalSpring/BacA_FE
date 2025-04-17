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
import Compressor from "compressorjs";
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
  const [selectLanguageClick, setSelectLanguageClick] = useState(false);
  const quillRefLessonCreate = useRef(null);
  const quillRefLessonUpdate = useRef(null);
  const quillRefLessonPlanCreate = useRef(null);
  const quillRefLessonPlanUpdate = useRef(null);
  const quillRefHomeWorkCreate = useRef(null);
  const quillRefHomeWorkUpdate = useRef(null);
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
  // console.log(editingLesson);

  useEffect(() => {
    // console.log(quillRefLessonCreate);
    const handlePaste = (e) => {
      const editorA = quillRefLessonCreate.current?.getEditor()?.root;
      const editorB = quillRefLessonUpdate.current?.getEditor()?.root;
      const editorC = quillRefLessonPlanCreate.current?.getEditor()?.root;

      const isEditorA = editorA?.contains(document.activeElement);
      const isEditorB = editorB?.contains(document.activeElement);
      const isEditorC = editorC?.contains(document.activeElement);
      const isLessonPlanCreate =
        document.activeElement.parentElement.parentElement.id === "lessonPlanCreate";
      const isLessonPlanUpdate =
        document.activeElement.parentElement.parentElement.id === "lessonPlanUpdate";
      // console.log(isLessonPlan);

      // console.log("Editor A:", quillRefLessonCreate.current?.getEditor().hasFocus(), isEditorA);
      // console.log("Editor B:", editorB);
      // console.log(editingLesson);

      if (!editingLesson) {
        if (isLessonPlanCreate) {
          const quill = quillRefLessonPlanCreate.current?.getEditor();
          if (!quill) return;

          const handlePaste = (e) => {
            const clipboardData = e.clipboardData;
            const items = clipboardData?.items;
            // console.log(quill.getLength());

            if (!items) return;

            for (const item of items) {
              if (item?.type?.indexOf("image") !== -1) {
                e.preventDefault(); // chặn mặc định Quill xử lý

                const file = item.getAsFile();

                if (!file) return;

                // 👇 Resize trước khi upload như trong imageHandler
                // new Compressor(file, {
                //   quality: 1, // Giảm dung lượng, 1 là giữ nguyên
                //   maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
                //   maxHeight: 800,
                //   success(compressedFile) {
                const formData = new FormData();
                formData.append("file", file);

                axios
                  .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
                  .then((response) => {
                    if (response.status === 201) {
                      if (!quill) return;
                      const range = quill.getSelection(true);
                      quill.insertEmbed(
                        range?.index ?? quill.getLength(),
                        "image",
                        response.data.url
                      );
                      setTimeout(() => {
                        const imgs = quill.root.querySelectorAll(`img[src="${response.data.url}"]`);
                        imgs.forEach((img) => {
                          img.classList.add("ql-image"); // ví dụ: "rounded-lg", "centered-img"
                        });
                      }, 100);
                    } else {
                      message.error("Upload failed. Try again!");
                    }
                  })
                  .catch((err) => {
                    console.error("Upload error:", err);
                    message.error("Upload error. Please try again!");
                  });
                //   },
                //   error(err) {
                //     console.error("Compression error:", err);
                //     message.error("Image compression failed!");
                //   },
                // });

                break; // chỉ xử lý ảnh đầu tiên
              }
            }
          };
          handlePaste(e);
        } else {
          const quill = quillRefLessonCreate.current?.getEditor();
          if (!quill) return;

          const handlePaste = (e) => {
            const clipboardData = e.clipboardData;
            const items = clipboardData?.items;

            if (!items) return;

            for (const item of items) {
              if (item?.type?.indexOf("image") !== -1) {
                e.preventDefault(); // chặn mặc định Quill xử lý

                const file = item.getAsFile();

                if (!file) return;

                // 👇 Resize trước khi upload như trong imageHandler
                // new Compressor(file, {
                //   quality: 1, // Giảm dung lượng, 1 là giữ nguyên
                //   maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
                //   maxHeight: 800,
                //   success(compressedFile) {
                const formData = new FormData();
                formData.append("file", file);

                axios
                  .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
                  .then((response) => {
                    if (response.status === 201) {
                      if (!quill) return;
                      const range = quill.getSelection(true);
                      quill.insertEmbed(
                        range?.index ?? quill.getLength(),
                        "image",
                        response.data.url
                      );
                      setTimeout(() => {
                        const imgs = quill.root.querySelectorAll(`img[src="${response.data.url}"]`);
                        imgs.forEach((img) => {
                          img.classList.add("ql-image"); // ví dụ: "rounded-lg", "centered-img"
                        });
                      }, 100);
                    } else {
                      message.error("Upload failed. Try again!");
                    }
                  })
                  .catch((err) => {
                    console.error("Upload error:", err);
                    message.error("Upload error. Please try again!");
                  });
                //   },
                //   error(err) {
                //     console.error("Compression error:", err);
                //     message.error("Image compression failed!");
                //   },
                // });

                break; // chỉ xử lý ảnh đầu tiên
              }
            }
          };
          handlePaste(e);
        }
      } else if (editingLesson) {
        if (isLessonPlanUpdate) {
          const quill = quillRefLessonPlanUpdate.current?.getEditor();
          if (!quill) return;

          const handlePaste = (e) => {
            const clipboardData = e.clipboardData;
            const items = clipboardData?.items;

            if (!items) return;

            for (const item of items) {
              if (item?.type?.indexOf("image") !== -1) {
                e.preventDefault(); // chặn mặc định Quill xử lý

                const file = item.getAsFile();

                if (!file) return;

                // 👇 Resize trước khi upload như trong imageHandler
                // new Compressor(file, {
                //   quality: 1, // Giảm dung lượng, 1 là giữ nguyên
                //   maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
                //   maxHeight: 800,
                //   success(compressedFile) {
                const formData = new FormData();
                formData.append("file", file);

                axios
                  .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
                  .then((response) => {
                    if (response.status === 201) {
                      if (!quill) return;
                      const range = quill.getSelection(true);
                      quill.insertEmbed(
                        range?.index ?? quill.getLength(),
                        "image",
                        response.data.url
                      );
                      setTimeout(() => {
                        const imgs = quill.root.querySelectorAll(`img[src="${response.data.url}"]`);
                        imgs.forEach((img) => {
                          img.classList.add("ql-image"); // ví dụ: "rounded-lg", "centered-img"
                        });
                      }, 100);
                    } else {
                      message.error("Upload failed. Try again!");
                    }
                  })
                  .catch((err) => {
                    console.error("Upload error:", err);
                    message.error("Upload error. Please try again!");
                  });
                //   },
                //   error(err) {
                //     console.error("Compression error:", err);
                //     message.error("Image compression failed!");
                //   },
                // });

                break; // chỉ xử lý ảnh đầu tiên
              }
            }
          };
          handlePaste(e);
        } else {
          const quill = quillRefLessonUpdate.current?.getEditor();
          if (!quill) return;

          const handlePaste = (e) => {
            const clipboardData = e.clipboardData;
            const items = clipboardData?.items;

            if (!items) return;

            for (const item of items) {
              if (item?.type?.indexOf("image") !== -1) {
                e.preventDefault(); // chặn mặc định Quill xử lý

                const file = item.getAsFile();

                if (!file) return;

                // 👇 Resize trước khi upload như trong imageHandler
                // new Compressor(file, {
                //   quality: 1, // Giảm dung lượng, 1 là giữ nguyên
                //   maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
                //   maxHeight: 800,
                //   success(compressedFile) {
                const formData = new FormData();
                formData.append("file", file);

                axios
                  .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
                  .then((response) => {
                    if (response.status === 201) {
                      if (!quill) return;
                      const range = quill.getSelection(true);
                      quill.insertEmbed(
                        range?.index ?? quill.getLength(),
                        "image",
                        response.data.url
                      );
                      setTimeout(() => {
                        const imgs = quill.root.querySelectorAll(`img[src="${response.data.url}"]`);
                        imgs.forEach((img) => {
                          img.classList.add("ql-image"); // ví dụ: "rounded-lg", "centered-img"
                        });
                      }, 100);
                    } else {
                      message.error("Upload failed. Try again!");
                    }
                  })
                  .catch((err) => {
                    console.error("Upload error:", err);
                    message.error("Upload error. Please try again!");
                  });
                //   },
                //   error(err) {
                //     console.error("Compression error:", err);
                //     message.error("Image compression failed!");
                //   },
                // });

                break; // chỉ xử lý ảnh đầu tiên
              }
            }
          };
          handlePaste(e);
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [quillRefLessonCreate, quillRefLessonUpdate, editingLesson]);
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
    // console.log(quillRefLessonCreate);
    const handlePaste = (e) => {
      const editorA = quillRefHomeWorkCreate.current?.getEditor()?.root;
      const editorB = quillRefHomeWorkUpdate.current?.getEditor()?.root;

      const isEditorA = editorA?.contains(document.activeElement);
      const isEditorB = editorB?.contains(document.activeElement);
      // console.log("Editor A:", quillRefHomeWorkCreate.current?.getEditor().hasFocus(), isEditorA);
      // console.log("Editor B:", editorB);
      // console.log(editingHomeWork);

      if (!editingHomeWork) {
        const quill = quillRefHomeWorkCreate.current?.getEditor();
        if (!quill) return;

        const handlePaste = (e) => {
          const clipboardData = e.clipboardData;
          const items = clipboardData?.items;

          if (!items) return;

          for (const item of items) {
            if (item?.type?.indexOf("image") !== -1) {
              e.preventDefault(); // chặn mặc định Quill xử lý

              const file = item.getAsFile();

              if (!file) return;

              // 👇 Resize trước khi upload như trong imageHandler
              // new Compressor(file, {
              //   quality: 1, // Giảm dung lượng, 1 là giữ nguyên
              //   maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
              //   maxHeight: 800,
              //   success(compressedFile) {
              const formData = new FormData();
              formData.append("file", file);

              axios
                .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
                .then((response) => {
                  if (response.status === 201) {
                    if (!quill) return;
                    const range = quill.getSelection(true);
                    quill.insertEmbed(
                      range?.index ?? quill.getLength(),
                      "image",
                      response.data.url
                    );
                    setTimeout(() => {
                      const imgs = quill.root.querySelectorAll(`img[src="${response.data.url}"]`);
                      // console.log("IMG:", imgs);

                      imgs.forEach((img) => {
                        img.classList.add("ql-image"); // ví dụ: "rounded-lg", "centered-img"
                      });
                    }, 100);
                  } else {
                    message.error("Upload failed. Try again!");
                  }
                })
                .catch((err) => {
                  console.error("Upload error:", err);
                  message.error("Upload error. Please try again!");
                });
              //   },
              //   error(err) {
              //     console.error("Compression error:", err);
              //     message.error("Image compression failed!");
              //   },
              // });

              break; // chỉ xử lý ảnh đầu tiên
            }
          }
        };
        handlePaste(e);
      } else if (editingHomeWork) {
        const quill = quillRefHomeWorkUpdate.current?.getEditor();
        if (!quill) return;

        const handlePaste = (e) => {
          const clipboardData = e.clipboardData;
          const items = clipboardData?.items;

          if (!items) return;

          for (const item of items) {
            if (item?.type?.indexOf("image") !== -1) {
              e.preventDefault(); // chặn mặc định Quill xử lý

              const file = item.getAsFile();

              if (!file) return;

              // 👇 Resize trước khi upload như trong imageHandler
              // new Compressor(file, {
              //   quality: 1, // Giảm dung lượng, 1 là giữ nguyên
              //   maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
              //   maxHeight: 800,
              //   success(compressedFile) {
              const formData = new FormData();
              formData.append("file", file);

              axios
                .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
                .then((response) => {
                  if (response.status === 201) {
                    if (!quill) return;
                    const range = quill.getSelection(true);
                    quill.insertEmbed(
                      range?.index ?? quill.getLength(),
                      "image",
                      response.data.url
                    );
                    setTimeout(() => {
                      const imgs = quill.root.querySelectorAll(`img[src="${response.data.url}"]`);
                      // console.log(imgs);

                      imgs.forEach((img) => {
                        img.classList.add("ql-image"); // ví dụ: "rounded-lg", "centered-img"
                      });
                    }, 100);
                  } else {
                    message.error("Upload failed. Try again!");
                  }
                })
                .catch((err) => {
                  console.error("Upload error:", err);
                  message.error("Upload error. Please try again!");
                });
              //   },
              //   error(err) {
              //     console.error("Compression error:", err);
              //     message.error("Image compression failed!");
              //   },
              // });

              break; // chỉ xử lý ảnh đầu tiên
            }
          }
        };
        handlePaste(e);
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

      fetchContentData();
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
              <Tag color="green" bordered={false} style={{ fontSize: isMobile ? "12px" : "16px" }}>
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
                quillRefDescription={quillRefLessonCreate}
                quillRefLessonPlan={quillRefLessonPlanCreate}
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
                quillRef={quillRefLessonUpdate}
                quillRefLessonPlan={quillRefLessonPlanUpdate}
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
                quillRef={quillRefHomeWorkCreate}
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
                quillRef={quillRefHomeWorkUpdate}
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
