import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { format, set } from "date-fns";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import Pagination from "@mui/material/Pagination"; // Thêm Pagination
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import classService from "services/classService";
import lessonService from "services/lessonService";
import homeWorkService from "services/homeWorkService";
import teacherFeedbackService from "services/teacherFeedbackService";
import { colors } from "assets/theme/color";
import TextField from "@mui/material/TextField";
import TextArea from "antd/es/input/TextArea";
import { Button as AntButton, Button, Form, Input, message, Radio, Table, Tag } from "antd";
import ReactQuill, { Quill } from "react-quill";
import axios from "axios";
import levelService from "services/levelService";
import LessonDetailModal from "layouts/lessons/LessonDetailModal";
import HomeworkDetailModal from "layouts/homeWorks/HomeworkDetailModal";
import lessonByScheduleService from "services/lessonByScheduleService";
import link from "assets/theme/components/link";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  RobotOutlined,
  SwapOutlined,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { DeleteIcon, TrashIcon } from "lucide-react";
import SpeechToTextComponent from "components/TeacherPageComponent/SpeechToTextComponent";
import vocabularyService from "services/vocabularyService";
import VocabularyCreateComponent from "components/HomeWorkComponent/VocabularyCreateComponent";

const genderOptions = [
  { label: "Giọng nam", value: 1 },
  { label: "Giọng nữ", value: 0 },
];

// Định nghĩa PropTypes cho row trong Cell
const cellPropTypes = {
  row: PropTypes.shape({
    original: PropTypes.object.isRequired,
    values: PropTypes.shape({
      name: PropTypes.string,
      level: PropTypes.string,
      linkYoutube: PropTypes.string,
      linkGame: PropTypes.string,
      linkSpeech: PropTypes.string,
      TeacherId: PropTypes.string,
      description: PropTypes.string,
      date: PropTypes.string,
      title: PropTypes.string,
      // linkZalo: PropTypes.string,
      feedback: PropTypes.string,
      datetime: PropTypes.string,
    }).isRequired,
  }).isRequired,
};
const BlockEmbed = Quill.import("blots/block/embed");
const icons = Quill.import("ui/icons");
icons["undo"] = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 14H4V9"/>
    <path d="M20 20a9 9 0 0 0-15.5-6.36L4 14"/>
  </svg>
`;
icons["redo"] = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 14h5v-5"/>
    <path d="M4 20a9 9 0 0 1 15.5-6.36L20 14"/>
  </svg>
`;
icons["video"] = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.8 8.001c-.2-1.5-.9-2.2-2.3-2.4C17.1 5.2 12 5.2 12 5.2s-5.1 0-7.5.4c-1.4.2-2.1.9-2.3 2.4C2 9.5 2 12 2 12s0 2.5.2 4c.2 1.5.9 2.2 2.3 2.4 2.4.4 7.5.4 7.5.4s5.1 0 7.5-.4c1.4-.2 2.1-.9 2.3-2.4.2-1.5.2-4 .2-4s0-2.5-.2-4zM10 15V9l5 3-5 3z"/>
  </svg>
`;
class AudioBlot extends BlockEmbed {
  static create(url) {
    const node = super.create();
    node.setAttribute("src", url);
    node.setAttribute("controls", true);
    return node;
  }

  static value(node) {
    return node.getAttribute("src");
  }
}

AudioBlot.blotName = "audio";
AudioBlot.tagName = "audio";
Quill.register(AudioBlot);
class CustomVideo extends BlockEmbed {
  static blotName = "video"; // override mặc định
  static tagName = "iframe";

  static create(value) {
    const node = super.create();

    const src = typeof value === "string" ? value : value.src;
    node.setAttribute("src", src);
    node.setAttribute("frameborder", "0");
    node.setAttribute("allowfullscreen", "true");
    node.classList.add("responsive-iframe");
    // Thêm width/height mặc định hoặc theo người dùng truyền vào
    node.setAttribute("width", "100%");
    node.setAttribute("height", "315");

    if (typeof value !== "string") {
      if (value.width) node.setAttribute("width", value.width);
      if (value.height) node.setAttribute("height", value.height);
    }

    return node;
  }

  static value(node) {
    return {
      src: node.getAttribute("src"),
      width: node.getAttribute("width"),
      height: node.getAttribute("height"),
    };
  }
}
class CustomImageBlot extends BlockEmbed {
  static blotName = "image";
  static tagName = "img";

  static create(value) {
    const node = super.create();

    node.setAttribute("src", value);
    node.setAttribute("class", "ql-image");
    node.style.cursor = "zoom-in";

    return node;
  }

  static value(node) {
    return node.getAttribute("src");
  }
}
Quill.register(CustomImageBlot);
Quill.register(CustomVideo);
function TeacherOverViewModal({ open, onClose, teacher, placeholderLessonPlan }) {
  const [classes, setClasses] = useState([]);
  const [lessonByScheduleData, setLessonByScheduleData] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [homeworkDialogOpen, setHomeworkDialogOpen] = useState(false);
  const [lessonDetailOpen, setLessonDetailOpen] = useState(false);
  const [homeworkDetailOpen, setHomeworkDetailOpen] = useState(false);
  const [levels, setLevels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Thêm state cho trang hiện tại
  const feedbacksPerPage = 3; // Số feedback mỗi trang
  const quillRefLessonDescription = useRef(null);
  const quillRefLessonPlan = useRef(null);
  const quillRefHomeworkDescription = useRef(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [loadingUpdateLesson, setLoadingUpdateLesson] = useState(false);
  const [loadingUpdateHomework, setLoadingUpdateHomework] = useState(false);
  const [vocabularyList, setVocabularyList] = useState([]);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 768;
  const [lessonData, setLessonData] = useState({
    name: "",
    level: "",
    linkYoutube: "",
    linkGame: "",
    linkSpeech: "",
    TeacherId: "",
    textToSpeech: "",
    description: "",
    date: "",
  });
  const [homeworkData, setHomeworkData] = useState({
    title: "",
    level: "",
    linkYoutube: "",
    linkGame: "",
    linkSpeech: "",
    // linkZalo: "",
    TeacherId: "",
    textToSpeech: "",
    description: "",
    date: "",
  });
  const [gender, setGender] = useState(1);
  const [formLesson] = Form.useForm();
  const [formHomework] = Form.useForm();
  // const quillRefLessonDescription = useRef(null);
  const [quill, setQuill] = useState(null);
  const [modalUpdateHomeWorkVisible, setModalUpdateHomeWorkVisible] = useState(false);
  const [modalUpdateLessonVisible, setModalUpdateLessonVisible] = useState(false);
  const [openSend, setOpenSend] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [selectedHomeWorkId, setSelectedHomeWorkId] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingHomeWork, setEditingHomeWork] = useState(null);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [currentYoutubeLink, setCurrentYoutubeLink] = useState("");
  const [editYoutubeIndex, setEditYoutubeIndex] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [swapHtmlMode, setSwapHtmlMode] = useState(false);
  const [htmlLessonPlanContent, setHtmlLessonPlanContent] = useState("");
  const [swapHtmlLessonPlanMode, setSwapHtmlLessonPlanMode] = useState(false);
  const [htmlContentHomework, setHtmlContentHomework] = useState("");
  const [swapHtmlHomeworkMode, setSwapHtmlHomeworkMode] = useState(false);
  const [loadingEnhanceLessonPlan, setLoadingEnhanceLessonPlan] = useState(false);
  const [loadingTTSForUpdateHomeWork, setLoadingTTSForUpdateHomeWork] = useState(false);
  const [loadingTTSForUpdateLesson, setLoadingTTSForUpdateLesson] = useState(false);
  const [gameLinks, setGameLinks] = useState([]);
  const [currentLink, setCurrentLink] = useState("");
  const [editIndex, setEditIndex] = useState(null);
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
    if (teacher) {
      fetchTeacherData();
    }
  }, [teacher]);
  useEffect(() => {
    fetchTeacherData();
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const data = await levelService.getAllLevels();
      setLevels(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách level:", error);
    }
  };
  // console.log(classes, lessonByScheduleData, lessons, teacher);

  const fetchLessonBySchedule = async () => {
    try {
      const lessonBySchedules = await Promise.all(
        classes.map(async (cls) => {
          const data = await lessonByScheduleService.getAllLessonBySchedulesOfClass(cls?.id);
          return data;
        })
      );

      // Gộp tất cả các mảng con lại thành một mảng lớn
      const mergedLessons = lessonBySchedules.flat();
      setLessonByScheduleData(mergedLessons);
    } catch (err) {
      // setError("Lỗi khi tải dữ liệu lesson_by_schedule!");
      message.error("Error loading lesson_by_schedule data! " + err);
    } finally {
      setLoading(false);
    }
  };
  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const classData = await classService.getAllClassesByTeacher(teacher.id);
      setClasses(classData);

      const lessonData = await lessonService.getLessonByTeacherId(teacher.id);
      setLessons(lessonData);

      const homeworkData = await homeWorkService.getHomeWorkByTeacherId(teacher.id);
      setHomeworks(homeworkData);

      const feedbackData = await teacherFeedbackService.getFeedbackByStudentId(teacher.id);
      setFeedbacks(feedbackData);
      const lessonBySchedules = await Promise.all(
        classData.map(async (cls) => {
          const data = await lessonByScheduleService.getAllLessonBySchedulesOfClass(cls?.id);
          return data;
        })
      );

      // Gộp tất cả các mảng con lại thành một mảng lớn
      const mergedLessons = lessonBySchedules.flat();
      setLessonByScheduleData(mergedLessons);
    } catch (err) {
      console.error("Error fetching teacher data:", err);
    } finally {
      setLoading(false);
    }
  };

  const classColumns = [
    { Header: "Class Name", accessor: "name", width: "50%" },
    { Header: "AccessID", accessor: "accessId", width: "50%" },
  ];

  const lessonColumns = [
    {
      Header: "Lesson Name",
      accessor: "name",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLesson(row.original);
            setLessonDetailOpen(true);
          }}
        >
          {row.values.name}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    // {
    //   Header: "Level",
    //   accessor: "level",
    //   width: "10%",
    //   Cell: ({ row }) => (
    //     <span
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //       className="truncate-text"
    //     >
    //       {row.values.level}
    //     </span>
    //   ),
    //   propTypes: cellPropTypes,
    // },
    // {
    //   Header: "Link Youtube",
    //   accessor: "linkYoutube",
    //   width: "30%",
    //   Cell: ({ row }) => (
    //     <span
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //       className="truncate-text"
    //     >
    //       {row.values.linkYoutube}
    //     </span>
    //   ),
    //   propTypes: cellPropTypes,
    // },
    // {
    //   Header: "Link Game",
    //   accessor: "linkGame",
    //   width: "30%",
    //   Cell: ({ row }) => (
    //     <span
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //       className="truncate-text"
    //     >
    //       {row.values.linkGame}
    //     </span>
    //   ),
    //   propTypes: cellPropTypes,
    // },
    // {
    //   Header: "Link Speech",
    //   accessor: "linkSpeech",
    //   width: "30%",
    //   Cell: ({ row }) => (
    //     <span
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //       className="truncate-text"
    //     >
    //       {row.values.linkSpeech}
    //     </span>
    //   ),
    //   propTypes: cellPropTypes,
    // },
    // {
    //   Header: "Teacher",
    //   accessor: "TeacherId",
    //   width: "30%",
    //   Cell: ({ row }) => (
    //     <span
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //       className="truncate-text"
    //     >
    //       {row.values.TeacherId}
    //     </span>
    //   ),
    //   propTypes: cellPropTypes,
    // },
    {
      Header: "Description",
      accessor: "description",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.description?.replace(/<[^>]*>?/gm, "") || ""}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Class",
      accessor: "id",
      width: "20%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {lessonByScheduleData.find((item) => {
            // console.log(item.lessonID, row.values);
            return item.lessonID === row.values.id;
          })?.class?.name || ""}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Date",
      accessor: "date",
      width: "20%",
      Cell: ({ row }) => {
        const date = lessonByScheduleData?.filter((item) => item.lessonID === row.values.id)[0]
          ?.date;
        return (
          <span
            style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
            className="truncate-text"
          >
            {(date &&
              new Date(date).toLocaleDateString("vi-VN", {
                timeZone: "UTC",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })) ||
              "Không có ngày"}
          </span>
        );
      },
      propTypes: cellPropTypes,
    },
    {
      Header: "Status",
      accessor: "status",
      width: "20%",
      Cell: ({ row }) => {
        const length = lessonByScheduleData?.filter(
          (item) => item.lessonID === row.values.id
        ).length;
        const isSentLength = lessonByScheduleData.filter(
          (item) => item.lessonID === row.values.id && item.isLessonSent === true
        ).length;
        return (
          <span
            style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
            className="truncate-text"
          >
            <Tag
              color={isSentLength === 0 ? "red" : isSentLength === length ? "green" : "yellow"}
              style={{ fontSize: 14, fontWeight: 600, padding: "5px 10px" }}
            >
              {isSentLength === 0 ? (
                <>
                  <CloseCircleOutlined style={{ marginRight: 5 }} />
                  Unsent
                </>
              ) : isSentLength === length ? (
                <>
                  <CheckCircleOutlined style={{ marginRight: 5 }} />
                  Sent
                </>
              ) : (
                <>
                  <SyncOutlined style={{ marginRight: 5 }} />
                  Pending
                </>
              )}
            </Tag>
          </span>
        );
      },
      propTypes: cellPropTypes,
    },
    {
      Header: "Actions",
      accessor: "actions",
      width: "20%",
      Cell: ({ row }) => (
        <>
          <IconButton
            sx={{
              color: colors.midGreen,
              "&:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
            }}
            onClick={() => handleEditLesson(row.original)}
          >
            <EditIcon />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleDeleteLesson(row.values.id)}>
            <TrashIcon color="red" />
          </IconButton>
        </>
      ),
      propTypes: cellPropTypes,
    },
  ];

  const homeworkColumns = [
    {
      Header: "Homework Title",
      accessor: "title",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedHomework(row.original);
            setHomeworkDetailOpen(true);
          }}
        >
          {row.values.title}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    // {
    //   Header: "Level",
    //   accessor: "level",
    //   width: "10%",
    //   Cell: ({ row }) => (
    //     <span
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //       className="truncate-text"
    //     >
    //       {row.values.level}
    //     </span>
    //   ),
    //   propTypes: cellPropTypes,
    // },
    // {
    //   Header: "Link Youtube",
    //   accessor: "linkYoutube",
    //   width: "30%",
    //   Cell: ({ row }) => (
    //     <span
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //       className="truncate-text"
    //     >
    //       {row.values.linkYoutube}
    //     </span>
    //   ),
    //   propTypes: cellPropTypes,
    // },
    {
      Header: "Link Game",
      accessor: "linkGame",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.linkGame}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    // {
    //   Header: "Link Speech",
    //   accessor: "linkSpeech",
    //   width: "30%",
    //   Cell: ({ row }) => (
    //     <span
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //       className="truncate-text"
    //     >
    //       {row.values.linkSpeech}
    //     </span>
    //   ),
    //   propTypes: cellPropTypes,
    // },
    // {
    //   Header: "Link Zalo",
    //   accessor: "linkZalo",
    //   width: "30%",
    //   Cell: ({ row }) => (
    //     <span
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //       className="truncate-text"
    //     >
    //       {row.values.linkZalo}
    //     </span>
    //   ),
    //   propTypes: cellPropTypes,
    // },
    // {
    //   Header: "Teacher",
    //   accessor: "TeacherId",
    //   width: "30%",
    //   Cell: ({ row }) => (
    //     <span
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //       className="truncate-text"
    //     >
    //       {row.values.TeacherId}
    //     </span>
    //   ),
    //   propTypes: cellPropTypes,
    // },
    {
      Header: "Description",
      accessor: "description",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.description?.replace(/<[^>]*>?/gm, "") || ""}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Class",
      accessor: "id",
      width: "20%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {lessonByScheduleData.find((item) => {
            // console.log(item.lessonID, row.values);
            return item.homeWorkId === row.values.id;
          })?.class?.name || ""}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Date",
      accessor: "date",
      width: "20%",
      Cell: ({ row }) => {
        const date = lessonByScheduleData?.filter((item) => item.homeWorkId === row.values.id)[0]
          ?.date;
        return (
          <span
            style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
            className="truncate-text"
          >
            {(date &&
              new Date(date).toLocaleDateString("vi-VN", {
                timeZone: "UTC",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })) ||
              "Không có ngày"}
          </span>
        );
      },
      propTypes: cellPropTypes,
    },
    {
      Header: "Status",
      accessor: "status",
      width: "20%",
      Cell: ({ row }) => {
        const length = lessonByScheduleData?.filter(
          (item) => item.homeWorkId === row.values.id
        ).length;
        const isSentLength = lessonByScheduleData.filter(
          (item) => item.homeWorkId === row.values.id && item.isHomeWorkSent === true
        ).length;
        return (
          <span
            style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
            className="truncate-text"
          >
            <Tag
              color={isSentLength === 0 ? "red" : isSentLength === length ? "green" : "yellow"}
              style={{ fontSize: 14, fontWeight: 600, padding: "5px 10px" }}
            >
              {isSentLength === 0 ? (
                <>
                  <CloseCircleOutlined style={{ marginRight: 5 }} />
                  Unsent
                </>
              ) : isSentLength === length ? (
                <>
                  <CheckCircleOutlined style={{ marginRight: 5 }} />
                  Sent
                </>
              ) : (
                <>
                  <SyncOutlined style={{ marginRight: 5 }} />
                  Pending
                </>
              )}
            </Tag>
          </span>
        );
      },
      propTypes: cellPropTypes,
    },
    {
      Header: "Actions",
      accessor: "actions",
      width: "20%",
      Cell: ({ row }) => (
        <>
          <IconButton
            sx={{
              color: colors.midGreen,
              "&:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
            }}
            onClick={() => handleEditHomework(row.original)}
          >
            <EditIcon />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleDeleteHomework(row.values.id)}>
            <TrashIcon color="red" />
          </IconButton>
        </>
      ),
      propTypes: cellPropTypes,
    },
  ];

  const classRows = classes.map((cls) => ({
    name: cls.name,
    accessId: cls.accessId,
  }));

  const lessonRows = lessons.map((lesson) => ({
    id: lesson.id,
    name: lesson.name,
    level: lesson.level,
    linkYoutube: lesson.linkYoutube,
    linkGame: lesson.linkGame,
    linkSpeech: lesson.linkSpeech,
    TeacherId: lesson?.teacher?.username || "N/A",
    textToSpeech: lesson.textToSpeech,
    description: lesson.description,
    lessonPlan: lesson.lessonPlan,
    date: lesson.date,
    original: lesson,
  }));

  const homeworkRows = homeworks.map((homework) => ({
    id: homework.id,
    title: homework.title,
    level: homework.level,
    linkYoutube: homework.linkYoutube,
    linkGame: homework.linkGame,
    linkSpeech: homework.linkSpeech,
    // linkZalo: homework.linkZalo,
    TeacherId: homework?.teacher?.username || "N/A",
    textToSpeech: homework.textToSpeech,
    description: homework.description,
    date: homework.date,
    original: homework,
  }));

  // Logic phân trang cho feedback
  const feedbackRows = feedbacks.map((feedback) => ({
    id: feedback.id,
    title: feedback.title,
    description: feedback.description || feedback.feedback || "N/A",
    datetime: feedback.datetime,
  }));

  const totalFeedbackPages = Math.ceil(feedbackRows.length / feedbacksPerPage);
  const indexOfLastFeedback = currentPage * feedbacksPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
  const currentFeedbacks = feedbackRows.slice(indexOfFirstFeedback, indexOfLastFeedback);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const fileUrls = teacher?.fileUrl ? teacher.fileUrl.split(",") : [];

  const onChangeGender = ({ target: { value } }) => {
    console.log("radio3 checked", value);
    setGender(value);
  };
  const handleDeleteLesson = async (id) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        await lessonService.deleteLesson(id);
        setLessons(lessons.filter((lesson) => lesson.id !== id));
        message.success("Lesson deleted successfully");
      } catch (err) {
        message.error("Error deleting lesson!");
      }
    }
  };
  const handleEditLesson = (lesson) => {
    setSelectedLessonId(lesson.id);
    setEditingLesson(lesson);
    formLesson.setFieldsValue({
      name: lesson.name,
      linkGame: lesson.linkGame,
      linkSpeech: lesson.linkSpeech,
    });
    // Khởi tạo youtubeLinks từ linkYoutube
    const links = lesson.linkYoutube ? lesson.linkYoutube.split(", ").filter(Boolean) : [];
    setTextToSpeech(lesson.textToSpeech || "");
    setYoutubeLinks(links);
    setMp3Url(lesson.linkSpeech);
    setModalUpdateLessonVisible(true);
  };
  // console.log(
  //   editingLesson,
  //   modalUpdateLessonVisible,
  //   quillRefLessonDescription.current?.getEditor()
  // );

  useEffect(() => {
    setTimeout(() => {
      if (
        modalUpdateLessonVisible &&
        quillRefLessonDescription.current?.getEditor() &&
        editingLesson?.description
      ) {
        // Thêm delay nhẹ để chắc chắn editor đã render xong
        // console.log(editingLesson.description);

        setTimeout(() => {
          quillRefLessonDescription.current?.getEditor().setContents([]); // reset
          quillRefLessonDescription.current
            ?.getEditor()
            .clipboard.dangerouslyPasteHTML(0, editingLesson.description);
        }, 100); // thử 100ms nếu 0ms chưa đủ
      }
    }, 100); // thử 100ms nếu 0ms chưa đủ
  }, [modalUpdateLessonVisible, editingLesson, quillRefLessonDescription.current?.getEditor()]);
  useEffect(() => {
    setTimeout(() => {
      if (
        modalUpdateLessonVisible &&
        quillRefLessonPlan.current?.getEditor() &&
        editingLesson?.lessonPlan
      ) {
        // Thêm delay nhẹ để chắc chắn editor đã render xong
        // console.log(editingLesson.lessonPlan);

        setTimeout(() => {
          quillRefLessonPlan.current?.getEditor().setContents([]); // reset
          quillRefLessonPlan.current
            ?.getEditor()
            .clipboard.dangerouslyPasteHTML(0, editingLesson.lessonPlan);
        }, 100); // thử 100ms nếu 0ms chưa đủ
      }
    }, 100); // thử 100ms nếu 0ms chưa đủ
  }, [modalUpdateLessonVisible, editingLesson, quillRefLessonPlan.current?.getEditor()]);
  const enhanceLessonPlan = async () => {
    if (!quillRefLessonPlan.current?.getEditor()) return;

    const currentContent = quillRefLessonPlan.current?.getEditor().getText();
    if (!currentContent.trim()) {
      message.warning("Please enter a lesson plan first!");
      return;
    }

    // Lấy danh sách URL ảnh từ nội dung Quill
    const quillEditor = quillRefLessonPlan.current?.getEditor().getContents();
    const imageUrls = [];
    quillEditor.ops.forEach((op) => {
      if (op.insert && op.insert.image) {
        imageUrls.push(op.insert.image); // Thu thập URL ảnh
      }
    });

    setLoadingEnhanceLessonPlan(true);
    try {
      // Gọi lessonService.enhanceLessonPlan với lessonPlan và imageUrls
      const enhancedText = await lessonService.enhanceLessonPlan(currentContent, imageUrls);
      quillRefLessonPlan.current?.getEditor().setText(enhancedText);
      message.success("Lesson plan enhanced successfully!");
    } catch (error) {
      console.error("Error enhancing lesson plan:", error);
      message.error("Failed to enhance lesson plan. Please try again!");
    } finally {
      setLoadingEnhanceLessonPlan(false);
    }
  };
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) {
      return;
    }
    setLoadingTTSForUpdateLesson(true);

    try {
      const response = await homeWorkService.textToSpeech({ textToSpeech, gender });

      let base64String = response;

      // Bước 2: Chuyển Base64 về mảng nhị phân (binary)
      function base64ToBlob(base64, mimeType) {
        let byteCharacters = atob(base64); // Giải mã base64
        let byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
      }

      // Bước 3: Tạo URL từ Blob và truyền vào thẻ <audio>
      let audioBlob = base64ToBlob(base64String, "audio/mp3"); // Hoặc "audio/wav"
      setMp3file(audioBlob);
      let audioUrl = URL.createObjectURL(audioBlob);
      setMp3Url(audioUrl);
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTSForUpdateLesson(false);
  };
  useEffect(() => {
    if (mp3Url) {
      // console.log("🔄 Cập nhật audio URL:", mp3Url);
      const audioElement = document.getElementById("audio-player");
      if (audioElement) {
        audioElement.src = ""; // Xóa src để tránh giữ URL cũ
        audioElement.load(); // Tải lại audio
        audioElement.src = mp3Url;
      }
    }
  }, [mp3Url]);
  const handleSaveLesson = async () => {
    try {
      setLoadingUpdateLesson(true);
      const values = await formLesson.validateFields();
      const formData = new FormData();
      let linkYoutube = "";
      if (youtubeLinks?.length > 0) {
        linkYoutube = youtubeLinks.join(", ");
      }
      formData.append("name", values.name);
      formData.append("level", editingLesson.level);
      formData.append("linkYoutube", linkYoutube);
      // formData.append("linkGame", values.linkGame);
      formData.append("linkGame", "meomeo");
      formData.append("textToSpeech", textToSpeech);
      formData.append(
        "description",
        quillRefLessonDescription.current?.getEditor()?.root?.innerHTML || ""
      );
      formData.append("lessonPlan", quillRefLessonPlan.current?.getEditor()?.root.innerHTML || "");
      formData.append("teacherId", teacher.id);
      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }
      if (editingLesson) {
        const lessonEntity = await lessonService.editLesson(editingLesson.id, formData);
        setLessons(
          lessons?.map((lesson) =>
            lesson.id === editingLesson.id ? { ...lesson, ...lessonEntity } : lesson
          )
        );
        message.success("Lesson updated successfully");
      }
      // setModalUpdateLessonVisible(false);
      // form.resetFields();
      // setEditingLesson(null);
      // setTextToSpeech("");
      // setMp3file(null);
      // setMp3Url("");
      setModalUpdateLessonVisible(false);
      formLesson.resetFields();
      setEditingLesson(null);
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
      setYoutubeLinks([]);
      setCurrentYoutubeLink("");
      setEditYoutubeIndex(null);
      setHtmlContent("");
      setSwapHtmlMode(false);
    } catch (err) {
      message.error("Please check your input and try again" + err);
    } finally {
      setLoadingUpdateLesson(false);
    }
  };
  useEffect(() => {
    if (quillRefLessonDescription.current) {
      const editor = quillRefLessonDescription.current.getEditor();
      setQuill(editor);
    }
  }, [quillRefLessonDescription]);
  // useEffect(() => {
  //   const quill = quillRef.current?.getEditor();
  //   if (!quill) return;

  //   const handlePaste = (e) => {
  //     // console.log("handlePaste called");
  //     const clipboardData = e.clipboardData;
  //     const items = clipboardData?.items;

  //     if (!items) return;

  //     for (const item of items) {
  //       if (item.type.indexOf("image") !== -1) {
  //         e.preventDefault(); // chặn mặc định Quill xử lý

  //         const file = item.getAsFile();

  //         if (!file) return;

  //         // 👇 Resize trước khi upload như trong imageHandler
  //         new Compressor(file, {
  //           quality: 1, // Giảm dung lượng, 1 là giữ nguyên
  //           maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
  //           maxHeight: 800,
  //           success(compressedFile) {
  //             const formData = new FormData();
  //             formData.append("file", compressedFile);

  //             axios
  //               .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
  //               .then((response) => {
  //                 if (response.status === 201) {
  //                   const range = quill.getSelection(true);
  //                   quill.insertEmbed(range.index, "image", response.data.url);
  //                 } else {
  //                   message.error("Upload failed. Try again!");
  //                 }
  //               })
  //               .catch((err) => {
  //                 console.error("Upload error:", err);
  //                 message.error("Upload error. Please try again!");
  //               });
  //           },
  //           error(err) {
  //             console.error("Compression error:", err);
  //             message.error("Image compression failed!");
  //           },
  //         });

  //         break; // chỉ xử lý ảnh đầu tiên
  //       }
  //     }
  //   };

  //   const editor = quill?.root;
  //   editor?.addEventListener("paste", handlePaste);

  //   return () => {
  //     editor?.removeEventListener("paste", handlePaste);
  //   };
  // }, [quillRef]);
  const undoHandlerLessonDescription = useCallback(() => {
    const quill = quillRefLessonDescription.current?.getEditor();
    if (quill) {
      const history = quill.history;
      if (history.stack.undo.length > 0) {
        history.undo();
      } else {
        message.warning("No more undo available.");
      }
    }
  }, []);
  const redoHandlerLessonDescription = useCallback(() => {
    const quill = quillRefLessonDescription.current?.getEditor();
    if (quill) {
      const history = quill.history;

      if (history.stack.redo.length > 0) {
        history.redo();
      } else {
        message.warning("No more redo available.");
      }
    }
  }, []);
  const undoHandlerLessonPlan = useCallback(() => {
    const quill = quillRefLessonPlan.current?.getEditor();
    if (quill) {
      const history = quill.history;
      if (history.stack.undo.length > 0) {
        history.undo();
      } else {
        message.warning("No more undo available.");
      }
    }
  }, []);
  const redoHandlerLessonPlan = useCallback(() => {
    const quill = quillRefLessonPlan.current?.getEditor();
    if (quill) {
      const history = quill.history;

      if (history.stack.redo.length > 0) {
        history.redo();
      } else {
        message.warning("No more redo available.");
      }
    }
  }, []);
  useEffect(() => {
    // console.log(quillRefLessonCreate);
    const handlePaste = (e) => {
      const isLessonPlanUpdate =
        document.activeElement.parentElement.parentElement.id === "lessonPlanUpdate";
      // console.log(document.activeElement.parentElement.parentElement);

      if (editingLesson) {
        if (isLessonPlanUpdate) {
          const quill = quillRefLessonPlan.current?.getEditor();
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
          const quill = quillRefLessonDescription.current?.getEditor();
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
      } else {
        const quill = quillRefHomeworkDescription.current?.getEditor();
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
                    }, 0);
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
  }, [quillRefLessonDescription, quillRefLessonPlan, editingLesson]);
  const imageHandlerLessonDescription = useCallback(() => {
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
        // console.log(response.data.url);

        // const result = await response.json();

        if (response.status === 201 && quillRefLessonDescription.current) {
          const editor = quillRefLessonDescription.current?.getEditor();
          if (!editor) return;
          const range = editor.getSelection(true);
          editor.insertEmbed(range?.index ?? editor.getLength(), "image", response.data.url);
          setTimeout(() => {
            const imgs = editor.root.querySelectorAll(`img[src="${response.data.url}"]`);
            imgs.forEach((img) => {
              img.classList.add("ql-image"); // ví dụ: "rounded-lg", "centered-img"
            });
          }, 0);
        } else {
          message.error("Upload failed. Try again!");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error("Upload error. Please try again!");
      }
      // new Compressor(file, {
      //   quality: 1, // Giảm dung lượng, 1 là giữ nguyên
      //   maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
      //   maxHeight: 800, // Optional, resize chiều cao nếu cần
      //   success(compressedFile) {
      //     const formData = new FormData();
      //     formData.append("file", compressedFile);

      //     axios
      //       .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
      //       .then((response) => {
      //         if (response.status === 201 && quillRef.current) {
      //           const editor = quillRef.current?.getEditor();
      //           const range = editor.getSelection(true);
      //           editor.insertEmbed(range.index, "image", response.data.url);
      //         } else {
      //           message.error("Upload failed. Try again!");
      //         }
      //       })
      //       .catch((err) => {
      //         console.error("Upload error:", err);
      //         message.error("Upload error. Please try again!");
      //       });
      //   },
      //   error(err) {
      //     console.error("Compression error:", err);
      //     message.error("Image compression failed!");
      //   },
      // });
    };
  }, []);
  const imageHandlerLessonPlan = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // const formData = new FormData();
      // formData.append("file", file);

      // try {
      //   const response = await axios.post(
      //     process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
      //     formData
      //   );
      //   if (response.status === 201 && quillRefDescription.current) {
      //     const editor = quillRefDescription.current.getEditor();
      //     const range = editor.getSelection(true);
      //     editor.insertEmbed(range.index, "image", response.data.url);
      //   } else {
      //     message.error("Upload failed. Try again!");
      //   }
      // } catch (error) {
      //   console.error("Error uploading image:", error);
      //   message.error("Upload error. Please try again!");
      // }
      // new Compressor(file, {
      //   quality: 1, // Giảm dung lượng, 1 là giữ nguyên
      //   maxWidth: 350, // Resize ảnh về max chiều ngang là 800px
      //   maxHeight: 350, // Optional, resize chiều cao nếu cần
      //   success(compressedFile) {
      const formData = new FormData();
      formData.append("file", file);

      axios
        .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
        .then((response) => {
          if (response.status === 201 && quillRefLessonPlan.current) {
            const editor = quillRefLessonPlan.current?.getEditor();
            if (!editor) return;
            const range = editor.getSelection(true);
            editor.insertEmbed(range?.index ?? editor.getLength(), "image", response.data.url);
            setTimeout(() => {
              const imgs = editor.root.querySelectorAll(`img[src="${response.data.url}"]`);
              imgs.forEach((img) => {
                img.classList.add("ql-image"); // ví dụ: "rounded-lg", "centered-img"
              });
            }, 0);
          } else {
            message.error("Upload failed. Try again!");
          }
        })
        .catch((err) => {
          console.error("Upload error:", err);
          message.error("Upload error. Please try again!");
        });
      // },
      //   error(err) {
      //     console.error("Compression error:", err);
      //     message.error("Image compression failed!");
      //   },
      // });
    };
  }, []);
  const audioHandlerLessonDescription = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "audio/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );

        if (response.status === 201 && quillRefLessonDescription.current) {
          const editor = quillRefLessonDescription.current?.getEditor();
          if (!editor) return;
          const range = editor.getSelection(true);
          const audioUrl = response?.data?.url;

          // 👇 Đây là điểm quan trọng: insertEmbed với blot 'audio'
          editor.insertEmbed(range?.index ?? editor.getLength(), "audio", audioUrl, "user");
          editor.setSelection(range?.index ?? editor.getLength() + 1); // move cursor
        } else {
          message.error("Upload failed. Try again!");
        }
      } catch (error) {
        console.error("Error uploading audio:", error);
        message.error("Upload error. Please try again!");
      }
    };
  }, []);
  const modulesLessonDescription = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandlerLessonDescription,
        undo: undoHandlerLessonDescription,
        redo: redoHandlerLessonDescription,
      },
    },
  };
  const modulesLessonPlan = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandlerLessonPlan,
        undo: undoHandlerLessonPlan,
        redo: redoHandlerLessonPlan,
      },
    },
  };

  const handleDeleteHomework = async (id) => {
    if (window.confirm("Are you sure you want to delete this homework?")) {
      try {
        await homeWorkService.deleteHomeWork(id);
        setHomeworks(homeworks.filter((homeWork) => homeWork.id !== id));
        message.success("Homework deleted successfully");
      } catch (err) {
        message.error("Error deleting homework!");
      }
    }
  };
  const handleEditHomework = (homeWork) => {
    setEditingHomeWork(homeWork);
    setSelectedHomeWorkId(homeWork?.id);
    const links = homeWork?.linkGame.split(", ");
    const filterLinks = links?.filter((link) => link !== "");
    // console.log(links, filterLinks);
    setGameLinks(filterLinks);
    const youtubeLinks = homeWork?.linkYoutube
      ? homeWork.linkYoutube.split(", ").filter((link) => link !== "")
      : [];
    setYoutubeLinks(youtubeLinks);
    formHomework.setFieldsValue({
      title: homeWork.title,
      // linkYoutube: homeWork.linkYoutube,
      // linkGame: homeWork.linkGame,
      // linkZalo: homeWork.linkZalo,
      linkSpeech: homeWork.linkSpeech,
      // description: homeWork.description,
    });
    // if (quill && homeWork?.description) {
    //   setTimeout(() => {
    //     quill.clipboard.dangerouslyPasteHTML(0, homeWork.description);
    //   }, 1000);
    // }
    setMp3Url(homeWork.linkSpeech);
    setModalUpdateHomeWorkVisible(true);
    setTextToSpeech(homeWork.textToSpeech || "");
  };
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const response = await vocabularyService.getVocabularyByHomworkId(selectedHomeWorkId);
        setVocabularyList(response);
      } catch (error) {
        console.error("Error fetching vocabulary:", error);
      }
    };
    fetchVocabulary();
  }, [selectedHomeWorkId, editingHomeWork]);
  // console.log(textToSpeech);
  useEffect(() => {
    setTimeout(() => {
      if (
        modalUpdateHomeWorkVisible &&
        quillRefHomeworkDescription.current?.getEditor() &&
        editingHomeWork?.description
      ) {
        // Thêm delay nhẹ để chắc chắn editor đã render xong
        setTimeout(() => {
          quillRefHomeworkDescription.current?.getEditor().setContents([]); // reset
          quillRefHomeworkDescription.current
            ?.getEditor()
            .clipboard.dangerouslyPasteHTML(0, editingHomeWork.description);
        }, 100); // thử 100ms nếu 0ms chưa đủ
      }
    }, 100);
  }, [
    modalUpdateHomeWorkVisible,
    editingHomeWork,
    quillRefHomeworkDescription.current?.getEditor(),
  ]);

  const handleSaveHomework = async () => {
    try {
      setLoadingUpdateHomework(true);
      const values = await formHomework.validateFields();
      const formData = new FormData();
      let linkGame = "";
      if (gameLinks?.length > 0) {
        linkGame = gameLinks.join(", ");
        // gameLinks.map((link) => (linkGame += link + ", "));
      }
      let linkYoutube = "";
      if (youtubeLinks?.length > 0) {
        linkYoutube = youtubeLinks.join(", ");
      }
      formData.append("title", values.title);
      formData.append("level", editingHomeWork.level);
      formData.append("linkYoutube", linkYoutube);
      formData.append("linkGame", linkGame);
      // formData.append("linkZalo", values.linkZalo);
      // formData.append("textToSpeech", textToSpeech);
      formData.append(
        "description",
        quillRefHomeworkDescription.current?.getEditor()?.root?.innerHTML || ""
      );
      formData.append("teacherId", teacher.id);

      // Nếu có mp3Url thì fetch dữ liệu và append vào formData
      // if (mp3file) {
      //   formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      // }
      if (editingHomeWork) {
        const HomeWorkdata = await homeWorkService.editHomeWork(editingHomeWork.id, formData);
        if (vocabularyList.length > 0) {
          const formDataForVocabulary = new FormData();
          const vocabularies = [];
          const mp3Files = [];
          // console.log("vocabularyList", vocabularyList);

          vocabularyList.forEach((item) => {
            if (item?.isNew) {
              const vocabulary = {
                textToSpeech: item.word,
                imageUrl: item.imageUrl,
                homeworkId: HomeWorkdata.id,
              };
              vocabularies.push(vocabulary);
              // mp3Files.push(mp3File);
              // console.log(item, "aaaaa");
              let fileToAppend;
              if (item?.audioFile) {
                fileToAppend = new File([item.audioFile], "audio.mp3", { type: "audio/mp3" });
              } else {
                // 👇 Tạo file rỗng nếu không có audio
                // console.log(item, "eeee", fileToAppend);

                const emptyBlob = new Blob([], { type: "audio/mp3" });
                fileToAppend = new File([emptyBlob], "audio.mp3", { type: "audio/mp3" });
              }
              formDataForVocabulary.append("mp3Files", fileToAppend);
            }
          });
          formDataForVocabulary.append("vocabularies", JSON.stringify(vocabularies));
          // formDataForVocabulary.append("mp3Files", mp3Files);
          const vocabularyResponse = await vocabularyService.bulkCreateVocabulary(
            formDataForVocabulary
          );
        }
        setHomeworks(
          homeworks?.map((homeWork) =>
            homeWork.id === editingHomeWork.id ? { ...homeWork, ...HomeWorkdata } : homeWork
          )
        );
        message.success("HomeWork updated successfully");
      }
      setModalUpdateHomeWorkVisible(false);
      formHomework.resetFields();
      setEditingHomeWork(null);
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
      setCurrentLink("");
      setHtmlContentHomework("");
      setSwapHtmlHomeworkMode(false);
    } catch (err) {
      message.error("Please check your input and try again" + err);
    } finally {
      setLoadingUpdateHomework(false);
    }
  };
  // useEffect(() => {
  //   if (quillRefHomeworkDescription.current) {
  //     const editor = quillRefHomeworkDescription.current.getEditor();
  //     setQuill(editor);
  //   }
  // }, [quillRefHomeworkDescription]);
  const undoHandlerHomework = useCallback(() => {
    const quill = quillRefHomeworkDescription.current?.getEditor();
    if (quill) {
      const history = quill.history;
      if (history.stack.undo.length > 0) {
        history.undo();
      } else {
        message.warning("No more undo available.");
      }
    }
  }, []);
  const redoHandlerHomework = useCallback(() => {
    const quill = quillRefHomeworkDescription.current?.getEditor();
    if (quill) {
      const history = quill.history;

      if (history.stack.redo.length > 0) {
        history.redo();
      } else {
        message.warning("No more redo available.");
      }
    }
  }, []);
  const imageHandlerHomework = useCallback(() => {
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

        if (response.status === 201 && quillRefHomeworkDescription.current) {
          const editor = quillRefHomeworkDescription.current?.getEditor();
          if (!editor) return;
          const range = editor.getSelection(true);
          editor.insertEmbed(range?.index ?? editor.getLength(), "image", response.data.url);
          setTimeout(() => {
            const imgs = editor.root.querySelectorAll(`img[src="${response.data.url}"]`);
            imgs.forEach((img) => {
              img.classList.add("ql-image"); // ví dụ: "rounded-lg", "centered-img"
            });
          }, 0);
        } else {
          message.error("Upload failed. Try again!");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error("Upload error. Please try again!");
      }
      // new Compressor(file, {
      //   quality: 1, // Giảm dung lượng, 1 là giữ nguyên
      //   maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
      //   maxHeight: 800, // Optional, resize chiều cao nếu cần
      //   success(compressedFile) {
      //     const formData = new FormData();
      //     formData.append("file", compressedFile);

      //     axios
      //       .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
      //       .then((response) => {
      //         if (response.status === 201 && quillRef.current) {
      //           const editor = quillRef.current?.getEditor();
      //           const range = editor.getSelection(true);
      //           editor.insertEmbed(range.index, "image", response.data.url);
      //         } else {
      //           message.error("Upload failed. Try again!");
      //         }
      //       })
      //       .catch((err) => {
      //         console.error("Upload error:", err);
      //         message.error("Upload error. Please try again!");
      //       });
      //   },
      //   error(err) {
      //     console.error("Compression error:", err);
      //     message.error("Image compression failed!");
      //   },
      // });
    };
  }, []);
  const audioHandlerHomework = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "audio/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );

        if (response.status === 201 && quillRefHomeworkDescription.current) {
          const editor = quillRefHomeworkDescription.current?.getEditor();
          if (!editor) return;
          const range = editor.getSelection(true);
          const audioUrl = response?.data?.url;

          // 👇 Đây là điểm quan trọng: insertEmbed với blot 'audio'
          editor.insertEmbed(range?.index ?? editor.getLength(), "audio", audioUrl, "user");
          editor.setSelection(range?.index ?? editor.getLength() + 1); // move cursor
        } else {
          message.error("Upload failed. Try again!");
        }
      } catch (error) {
        console.error("Error uploading audio:", error);
        message.error("Upload error. Please try again!");
      }
    };
  }, []);
  const modulesHomework = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandlerHomework,
        undo: undoHandlerHomework,
        redo: redoHandlerHomework,
      },
    },
  };
  const handleConvertToSpeechHomework = async () => {
    if (!textToSpeech) {
      return;
    }
    setLoadingTTSForUpdateHomeWork(true);

    try {
      const response = await homeWorkService.textToSpeech({ textToSpeech, gender });

      let base64String = response;

      // Bước 2: Chuyển Base64 về mảng nhị phân (binary)
      function base64ToBlob(base64, mimeType) {
        let byteCharacters = atob(base64); // Giải mã base64
        let byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
      }

      // Bước 3: Tạo URL từ Blob và truyền vào thẻ <audio>
      let audioBlob = base64ToBlob(base64String, "audio/mp3"); // Hoặc "audio/wav"
      setMp3file(audioBlob);
      let audioUrl = URL.createObjectURL(audioBlob);
      setMp3Url(audioUrl);
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTSForUpdateHomeWork(false);
  };
  useEffect(() => {
    if (mp3Url) {
      // console.log("🔄 Cập nhật audio URL:", mp3Url);
      const audioElement = document.getElementById("audio-player-homework");
      if (audioElement) {
        audioElement.src = ""; // Xóa src để tránh giữ URL cũ
        audioElement.load(); // Tải lại audio
        audioElement.src = mp3Url;
      }
    }
  }, [mp3Url]);
  const resetForm = () => {
    setTextToSpeech("");
    setMp3file(null);
    setMp3Url("");
    setLessonData({
      name: "",
      level: "",
      linkYoutube: "",
      linkGame: "",
      linkSpeech: "",
      TeacherId: "",
      textToSpeech: "",
      description: "",
      date: "",
    });
    setHomeworkData({
      title: "",
      level: "",
      linkYoutube: "",
      linkGame: "",
      linkSpeech: "",
      // linkZalo: "",
      TeacherId: "",
      textToSpeech: "",
      description: "",
      date: "",
    });
    setEditMode(false);
  };

  const formatDate = (isoString) => {
    return format(new Date(isoString), "dd/MM/yyyy HH:mm");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xxl" fullWidth>
      <style>
        {`
        .truncate-text {
          display: inline-block;
          max-width: 100px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        `}
      </style>
      <DialogTitle sx={{ backgroundColor: colors.deepGreen, color: colors.white, py: 2 }}>
        <MDTypography variant="h5" color="inherit">
          Teacher Overview: {teacher?.name}
        </MDTypography>
      </DialogTitle>
      <DialogContent sx={{ padding: 3 }}>
        <Grid container spacing={3} direction="column">
          {/* Card Teacher Information */}
          <Grid item xs={12}>
            <Card
              sx={{ padding: 3, borderRadius: "12px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
            >
              <MDTypography
                variant="h6"
                sx={{ color: colors.deepGreen, fontWeight: "bold", mb: 2 }}
              >
                Teacher Information
              </MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <MDBox display="flex" alignItems="center">
                    <MDTypography
                      variant="body2"
                      sx={{ fontWeight: "medium", minWidth: "120px", color: colors.darkGreen }}
                    >
                      Name:
                    </MDTypography>
                    <MDTypography variant="body2">{teacher?.name || "N/A"}</MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MDBox display="flex" alignItems="center">
                    <MDTypography
                      variant="body2"
                      sx={{ fontWeight: "medium", minWidth: "120px", color: colors.darkGreen }}
                    >
                      Username:
                    </MDTypography>
                    <MDTypography variant="body2">{teacher?.username || "N/A"}</MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MDBox display="flex" alignItems="center">
                    <MDTypography
                      variant="body2"
                      sx={{ fontWeight: "medium", minWidth: "120px", color: colors.darkGreen }}
                    >
                      Start Date:
                    </MDTypography>
                    <MDTypography variant="body2">{teacher?.startDate || "N/A"}</MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MDBox display="flex" alignItems="center">
                    <MDTypography
                      variant="body2"
                      sx={{ fontWeight: "medium", minWidth: "120px", color: colors.darkGreen }}
                    >
                      End Date:
                    </MDTypography>
                    <MDTypography variant="body2">{teacher?.endDate || "N/A"}</MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MDBox display="flex" alignItems="center">
                    <MDTypography
                      variant="body2"
                      sx={{ fontWeight: "medium", minWidth: "120px", color: colors.darkGreen }}
                    >
                      Total Files:
                    </MDTypography>
                    <MDTypography variant="body2">{fileUrls.length}</MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12}>
                  <MDBox display="flex" alignItems="center" flexWrap="wrap">
                    <MDTypography
                      variant="body2"
                      sx={{ fontWeight: "medium", minWidth: "120px", color: colors.darkGreen }}
                    >
                      Files:
                    </MDTypography>
                    {fileUrls.length > 0 ? (
                      fileUrls.map((url, index) => (
                        <MDBox key={index} display="flex" alignItems="center" mr={2} mt={1}>
                          <IconButton
                            href={url}
                            download={`teacher_file_${index + 1}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: colors.midGreen,
                              "&:hover": { color: colors.highlightGreen },
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                          <MDTypography variant="body2">
                            <a
                              href={url}
                              download={`teacher_file_${index + 1}`}
                              style={{ textDecoration: "none", color: colors.midGreen }}
                            >
                              File {index + 1}
                            </a>
                          </MDTypography>
                        </MDBox>
                      ))
                    ) : (
                      <MDTypography variant="body2">No file</MDTypography>
                    )}
                  </MDBox>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Card Classes */}
          <Grid item xs={12}>
            <Card
              sx={{ padding: 3, borderRadius: "12px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
            >
              <MDTypography
                variant="h6"
                sx={{ color: colors.deepGreen, fontWeight: "bold", mb: 2 }}
              >
                Classes
              </MDTypography>
              {loading ? (
                <MDTypography>Loading...</MDTypography>
              ) : (
                <DataTable
                  table={{ columns: classColumns, rows: classRows }}
                  isSorted={false}
                  entriesPerPage={true}
                  showTotalEntries={false}
                  noEndBorder
                  canSearch={true}
                />
              )}
            </Card>
          </Grid>

          {/* Card Lessons */}
          <Grid item xs={12}>
            <Card
              sx={{ padding: 3, borderRadius: "12px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
            >
              <MDTypography
                variant="h6"
                sx={{ color: colors.deepGreen, fontWeight: "bold", mb: 2 }}
              >
                Lessons
              </MDTypography>
              {loading ? (
                <MDTypography>Loading...</MDTypography>
              ) : (
                <DataTable
                  table={{ columns: lessonColumns, rows: lessonRows }}
                  isSorted={false}
                  entriesPerPage={true}
                  showTotalEntries={false}
                  noEndBorder
                  canSearch={true}
                />
              )}
            </Card>
          </Grid>

          {/* Card Homeworks */}
          <Grid item xs={12}>
            <Card
              sx={{ padding: 3, borderRadius: "12px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
            >
              <MDTypography
                variant="h6"
                sx={{ color: colors.deepGreen, fontWeight: "bold", mb: 2 }}
              >
                Homeworks
              </MDTypography>
              {loading ? (
                <MDTypography>Loading...</MDTypography>
              ) : (
                <DataTable
                  table={{ columns: homeworkColumns, rows: homeworkRows }}
                  isSorted={false}
                  entriesPerPage={true}
                  showTotalEntries={false}
                  noEndBorder
                  canSearch={true}
                />
              )}
            </Card>
          </Grid>

          {/* Card Feedbacks */}
          <Grid item xs={12}>
            <Card
              sx={{ padding: 3, borderRadius: "12px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}
            >
              <MDTypography
                variant="h6"
                sx={{ color: colors.deepGreen, fontWeight: "bold", mb: 2 }}
              >
                Feedbacks
              </MDTypography>
              {loading ? (
                <MDTypography>Loading...</MDTypography>
              ) : feedbackRows.length === 0 ? (
                <MDTypography>No feedback available</MDTypography>
              ) : (
                <>
                  <Grid container spacing={2}>
                    {currentFeedbacks.map((feedback) => (
                      <Grid item xs={12} sm={6} md={4} key={feedback.id}>
                        <Card
                          sx={{
                            padding: 2,
                            borderRadius: "8px",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <MDTypography
                            variant="h6"
                            sx={{ color: colors.midGreen, fontWeight: "bold", mb: 1 }}
                          >
                            {feedback.title}
                          </MDTypography>
                          <MDTypography variant="body2" sx={{ mb: 1 }}>
                            <strong>Description:</strong> {feedback.description}
                          </MDTypography>
                          <MDTypography variant="body2">
                            <strong>Created At:</strong>{" "}
                            {feedback.datetime ? formatDate(feedback.datetime) : "N/A"}
                          </MDTypography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  <MDBox display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={totalFeedbackPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: colors.midGreen,
                          "&.Mui-selected": {
                            backgroundColor: colors.highlightGreen,
                            color: colors.white,
                          },
                          "&:hover": {
                            backgroundColor: colors.lightGreen,
                          },
                        },
                      }}
                    />
                  </MDBox>
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button style={{ marginTop: isMobile ? "20px" : "" }} key="close" onClick={onClose}>
          Close
        </Button>
      </DialogActions>

      {/* Lesson Edit Dialog */}
      <Dialog
        open={modalUpdateLessonVisible}
        onClose={() => {
          setTextToSpeech("");
          setModalUpdateLessonVisible(false);
          setEditingLesson(null);
        }}
        fullWidth
        maxWidth="xl"
        PaperProps={{ sx: { width: "90vw", height: "90vh", maxWidth: "none" } }}
      >
        <DialogTitle>Edit Lesson</DialogTitle>
        <DialogContent sx={{ height: "100%", overflowY: "auto" }}>
          <Form
            form={formLesson}
            layout="vertical"
            name="lessonForm"
            initialValues={{
              name: "",
              level: "",
              // linkYoutube: "",
              linkGame: "",
              description: "",
            }}
          >
            <Form.Item
              name="name"
              label="Tên bài học"
              rules={[{ required: true, message: "Please enter the lesson name" }]}
            >
              <Input placeholder="Nhập tên bài học" />
            </Form.Item>
            <Button
              style={{
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                color: colors.white,
                margin: "10px 0",
              }}
              icon={<UploadOutlined />}
              onClick={audioHandlerLessonDescription}
            >
              Tải audio lên
            </Button>
            <Button
              style={{
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                color: colors.white,
                margin: "10px",
              }}
              icon={<SwapOutlined />}
              onClick={() => {
                if (!swapHtmlMode) {
                  const html =
                    quillRefLessonDescription.current?.getEditor()?.root?.innerHTML || "";
                  setHtmlContent(html);
                  setSwapHtmlMode(true);
                } else {
                  quillRefLessonDescription.current
                    ?.getEditor()
                    .clipboard.dangerouslyPasteHTML(htmlContent);
                  setSwapHtmlMode(false);
                }
              }}
            >
              Swap to {swapHtmlMode ? "Quill" : "HTML"}
            </Button>
            <Form.Item
              // name="description"
              label="Mô tả"
              // rules={[{ required: true, message: "Please enter a description" }]}
            >
              {
                <ReactQuill
                  theme="snow"
                  modules={modulesLessonDescription}
                  formats={quillFormats}
                  ref={quillRefLessonDescription}
                  style={{
                    height: "250px",
                    marginBottom: "60px", // Consider reducing this
                    borderRadius: "6px",
                    // border: `1px solid ${colors.inputBorder}`,
                    display: swapHtmlMode ? "none" : "block",
                  }}
                />
              }
              {swapHtmlMode && (
                <TextArea
                  value={htmlContent}
                  onChange={(e) => {
                    setHtmlContent(e.target.value);
                  }}
                  style={{
                    height: "250px",
                    marginBottom: "60px", // Consider reducing this
                    borderRadius: "6px",
                    border: `1px solid ${colors.inputBorder}`,
                  }}
                />
              )}
            </Form.Item>
            <Button
              style={{
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                color: colors.white,
                margin: "10px 0",
                marginTop: isMobile ? "100px" : "40px",
              }}
              icon={<SwapOutlined />}
              onClick={() => {
                // console.log(
                //   "swapHtmlLessonPlanMode",
                //   swapHtmlLessonPlanMode,
                //   htmlLessonPlanContent,
                //   quillRefLessonPlan.current?.getEditor()?.root?.innerHTML
                // );

                if (!swapHtmlLessonPlanMode) {
                  const html = quillRefLessonPlan.current?.getEditor()?.root?.innerHTML || "";
                  setHtmlLessonPlanContent(html);
                  setSwapHtmlLessonPlanMode(true);
                } else {
                  // console.log("htmlLessonPlanContent", htmlLessonPlanContent);
                  quillRefLessonPlan.current
                    ?.getEditor()
                    .clipboard.dangerouslyPasteHTML(htmlLessonPlanContent);
                  setSwapHtmlLessonPlanMode(false);
                }
              }}
            >
              Swap to {swapHtmlLessonPlanMode ? "Quill" : "HTML"}
            </Button>
            <Form.Item name="lessonPlan" label="Kế hoạch bài học">
              {
                <ReactQuill
                  id="lessonPlanUpdate"
                  theme="snow"
                  modules={modulesLessonPlan}
                  formats={quillFormats}
                  ref={quillRefLessonPlan}
                  placeholder={placeholderLessonPlan}
                  style={{
                    height: "250px",
                    marginBottom: "60px", // Consider reducing this
                    borderRadius: "6px",
                    // border: `1px solid ${colors.inputBorder}`,
                    display: swapHtmlLessonPlanMode ? "none" : "block",
                  }}
                />
              }
              {/* {swapHtmlLessonPlanMode && ( */}
              <TextArea
                value={htmlLessonPlanContent}
                onChange={(e) => {
                  setHtmlLessonPlanContent(e.target.value);
                }}
                style={{
                  height: "250px",
                  marginBottom: "60px", // Consider reducing this
                  borderRadius: "6px",
                  border: `1px solid ${colors.inputBorder}`,
                  display: !swapHtmlLessonPlanMode ? "none" : "block",
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                icon={<RobotOutlined />}
                onClick={enhanceLessonPlan}
                loading={loadingEnhanceLessonPlan}
                style={{
                  alignSelf: "flex-start",
                  marginTop: isMobile ? "100px" : "40px",
                  // marginBottom: "20px",
                  borderRadius: "6px",
                  backgroundColor: colors.emerald,
                  borderColor: colors.emerald,
                  color: colors.white,
                }}
              >
                Cải thiện mô tả
              </Button>
            </Form.Item>
            <Form.Item>
              <Button
                icon={<RobotOutlined />}
                // onClick={enhanceLessonPlan}
                onClick={() => window.open("https://gemini.google.com/app?hl=vi")}
                // loading={loadingEnhanceLessonPlan}
                style={{
                  alignSelf: "flex-start",
                  // marginTop: isMobile ? "100px" : "40px",
                  marginTop: "5px",
                  marginBottom: "20px",
                  borderRadius: "6px",
                  backgroundColor: colors.emerald,
                  borderColor: colors.emerald,
                  color: colors.white,
                }}
              >
                Cải thiện kế hoạch bài học
              </Button>
            </Form.Item>
            {/* <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: "Please select a level" }]}
          >
            <Select placeholder="Select level">
              {levels?.map((level, index) => (
                <Option key={index} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item> */}

            <Form.Item label="Văn bản thành giọng nói">
              <TextArea
                value={textToSpeech}
                onChange={(e) => setTextToSpeech(e.target.value)}
                rows={3}
                placeholder="Nhập văn bản để chuyển thành giọng nói"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item>
            <Form.Item>
              <Radio.Group
                options={genderOptions}
                onChange={onChangeGender}
                value={gender}
                optionType="button"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                onClick={handleConvertToSpeech}
                loading={loadingTTSForUpdateLesson}
                style={{
                  backgroundColor: colors.deepGreen,
                  borderColor: colors.deepGreen,
                }}
              >
                Chuyển thành giọng nói
              </Button>
            </Form.Item>
            {mp3Url && (
              <Form.Item>
                <div style={{ marginBottom: "16px" }}>
                  <audio id="audio-player" controls style={{ width: "100%" }}>
                    <source src={mp3Url} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </Form.Item>
            )}
            {/* <Form.Item label="Link Youtube bài học">
            <Input.Group compact>
              <Input
                value={currentYoutubeLink}
                placeholder="Nhập link youtube bài học"
                style={{
                  width: "calc(100% - 120px)",
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
                onChange={(e) => setCurrentYoutubeLink(e.target.value)}
              />
              <Button
                type="primary"
                onClick={() => {
                  if (!currentYoutubeLink) return;
                  if (editYoutubeIndex !== null) {
                    const updated = [...youtubeLinks];
                    updated[editYoutubeIndex] = currentYoutubeLink;
                    setYoutubeLinks(updated);
                    setEditYoutubeIndex(null);
                  } else {
                    setYoutubeLinks([...youtubeLinks, currentYoutubeLink]);
                  }
                  setCurrentYoutubeLink("");
                }}
                style={{
                  backgroundColor: colors.emerald,
                  borderColor: colors.emerald,
                }}
              >
                {editYoutubeIndex !== null ? "Cập nhật" : "Thêm"}
              </Button>
            </Input.Group>
          </Form.Item>
          {youtubeLinks?.length > 0 && (
            <Table
              columns={[
                {
                  title: "STT",
                  dataIndex: "index",
                  render: (_, __, i) => i + 1,
                },
                {
                  title: "Link YouTube",
                  dataIndex: "link",
                },
                {
                  title: "Hành động",
                  render: (_, record, index) => (
                    <>
                      <Button
                        type="link"
                        onClick={() => {
                          setCurrentYoutubeLink(record.link);
                          setEditYoutubeIndex(index);
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="link"
                        danger
                        onClick={() => {
                          const updated = youtubeLinks.filter((_, i) => i !== index);
                          setYoutubeLinks(updated);
                          if (editYoutubeIndex === index) {
                            setCurrentYoutubeLink("");
                            setEditYoutubeIndex(null);
                          }
                        }}
                      >
                        Xoá
                      </Button>
                    </>
                  ),
                },
              ]}
              dataSource={youtubeLinks.map((link, index) => ({ key: `${link}-${index}`, link }))}
              pagination={false}
            />
          )} */}
            {/* <Form.Item name="linkGame" label="Link game bài học">
            <Input
              placeholder="Nhập link game bài học"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item> */}
            {/* <Form.Item name="Speech to text" label="Chuyển giọng nói thành văn bản">
              <SpeechToTextComponent />
            </Form.Item> */}
          </Form>
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={() => setLessonDialogOpen(false)} sx={{ color: colors.midGreen }}>
            Cancel
          </Button>
          <AntButton
            loading={loadingUpdateLesson}
            type="primary"
            onClick={handleSaveLesson}
            style={{ backgroundColor: colors.emerald, borderColor: colors.emerald }}
          >
            Save
          </AntButton> */}
          <Button
            style={{ marginTop: isMobile ? "20px" : "" }}
            key="cancel"
            onClick={() => {
              setModalUpdateLessonVisible(false);
              formLesson.resetFields();
              setEditingLesson(null);
              setYoutubeLinks([]);
              setCurrentYoutubeLink("");
              setEditYoutubeIndex(null);
              setTextToSpeech("");
            }}
          >
            Cancel
          </Button>
          <Button
            loading={loadingUpdateLesson}
            key="submit"
            type="primary"
            onClick={handleSaveLesson}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            {editingLesson ? "Lưu" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Homework Edit Dialog */}
      <Dialog
        open={modalUpdateHomeWorkVisible}
        onClose={() => {
          setTextToSpeech("");
          setModalUpdateHomeWorkVisible(false);
          setEditingHomeWork(null);
        }}
        fullWidth
        maxWidth="xl"
        PaperProps={{ sx: { width: "90vw", height: "90vh", maxWidth: "none" } }}
      >
        <DialogTitle>Edit Homework</DialogTitle>
        <DialogContent sx={{ height: "100%", overflowY: "auto" }}>
          <Form
            form={formHomework}
            layout="vertical"
            name="HomeWorkForm"
            initialValues={{
              title: "",
              level: "",
              // linkYoutube: "",
              linkGame: "",
              // linkZalo: "",
              description: "",
            }}
          >
            <Form.Item
              name="title"
              label="Tiêu đề bài tập"
              rules={[
                { required: true, message: "Please enter the homework name" },
                { max: 100, message: "Title cannot be longer than 100 characters" },
              ]}
            >
              <Input
                placeholder="Nhập tiêu đề bài tập"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item>
            <Button
              style={{
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                color: colors.white,
                margin: "10px 0",
              }}
              icon={<UploadOutlined />}
              onClick={audioHandlerHomework}
            >
              Tải audio lên
            </Button>
            <Button
              style={{
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                color: colors.white,
                margin: "10px",
              }}
              icon={<SwapOutlined />}
              onClick={() => {
                if (!swapHtmlHomeworkMode) {
                  const html =
                    quillRefHomeworkDescription.current?.getEditor()?.root?.innerHTML || "";
                  setHtmlContentHomework(html);
                  setSwapHtmlHomeworkMode(true);
                } else {
                  quillRefHomeworkDescription.current
                    ?.getEditor()
                    .clipboard.dangerouslyPasteHTML(htmlContentHomework);
                  setSwapHtmlHomeworkMode(false);
                }
              }}
            >
              Swap to {swapHtmlHomeworkMode ? "Quill" : "HTML"}
            </Button>
            <Form.Item
              // name="description"
              label="Mô tả"
              // rules={[{ required: true, message: "Please enter a description" }]}
            >
              {
                <ReactQuill
                  theme="snow"
                  modules={modulesHomework}
                  formats={quillFormats}
                  ref={quillRefHomeworkDescription}
                  style={{
                    height: "250px",
                    marginBottom: "60px", // Consider reducing this
                    borderRadius: "6px",
                    // border: `1px solid ${colors.inputBorder}`,
                    display: swapHtmlHomeworkMode ? "none" : "block",
                  }}
                />
              }
              {swapHtmlHomeworkMode && (
                <TextArea
                  value={htmlContentHomework}
                  onChange={(e) => {
                    setHtmlContentHomework(e.target.value);
                  }}
                  style={{
                    height: "250px",
                    marginBottom: "60px", // Consider reducing this
                    borderRadius: "6px",
                    border: `1px solid ${colors.inputBorder}`,
                  }}
                />
              )}
            </Form.Item>
            {/* <Form.Item
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
              {levels?.map((level, index) => (
                <Option key={index} value={level.id}>
                  {level.name}
                </Option>
              ))}
            </Select>
          </Form.Item> */}
            <Form.Item name="Speech to text">
              <VocabularyCreateComponent
                isMobile={isMobile}
                setVocabularyList={setVocabularyList}
                vocabularyList={vocabularyList}
                selectedHomeWorkId={selectedHomeWorkId}
              />
            </Form.Item>
            {/* <Form.Item label="Văn bản thành giọng nói">
              <TextArea
                value={textToSpeech}
                onChange={(e) => setTextToSpeech(e.target.value)}
                rows={3}
                placeholder="Nhập văn bản để chuyển thành giọng nói"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item>
            <Form.Item>
              <Radio.Group
                options={genderOptions}
                onChange={onChangeGender}
                value={gender}
                optionType="button"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                onClick={handleConvertToSpeechHomework}
                loading={loadingTTSForUpdateHomeWork}
                style={{
                  backgroundColor: colors.deepGreen,
                  borderColor: colors.deepGreen,
                }}
              >
                Chuyển thành giọng nói
              </Button>
            </Form.Item>
            {mp3Url && (
              <Form.Item>
                <div style={{ marginBottom: "16px" }}>
                  <audio id="audio-player-homework" controls style={{ width: "100%" }}>
                    <source src={mp3Url} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </Form.Item>
            )} */}
            {/* {
          ||
            (form.getFieldValue("linkSpeech") && (
              <Form.Item>
                <div style={{ marginBottom: "16px" }}>
                  <audio id="audio-player" controls style={{ width: "100%" }}>
                    <source src={form.getFieldValue("linkSpeech")} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </Form.Item>
            ))} */}
            {/* <div style={{ marginBottom: "16px" }}>
            <audio controls style={{ width: "100%" }}>
              <source
                src={
                  "https://res.cloudinary.com/ddd1hxsx0/video/upload/v1742718873/o7o1ouv3el4w72s4rxnc.mp3"
                }
                type="audio/mp3"
              />
              Your browser does not support the audio element.
            </audio>
          </div> */}
            {/* <Form.Item
            name="linkYoutube"
            label="Link Youtube Bài tập"
            // rules={[{ required: true, message: "Please enter the homework link" }]}
          >
            <Input
              placeholder="Nhập link youtube bài tập"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item> */}
            {/* <Form.Item label="Link Youtube bài tập">
            <Input.Group compact>
              <Input
                value={currentYoutubeLink}
                placeholder="Nhập link youtube bài tập"
                style={{
                  width: "calc(100% - 120px)",
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
                onChange={(e) => setCurrentYoutubeLink(e.target.value)}
              />
              <Button
                type="primary"
                onClick={() => {
                  if (!currentYoutubeLink) return;
                  if (editYoutubeIndex !== null) {
                    const updated = [...youtubeLinks];
                    updated[editYoutubeIndex] = currentYoutubeLink;
                    setYoutubeLinks(updated);
                    setEditYoutubeIndex(null);
                  } else {
                    setYoutubeLinks([...youtubeLinks, currentYoutubeLink]);
                  }
                  setCurrentYoutubeLink("");
                }}
              >
                {editYoutubeIndex !== null ? "Cập nhật" : "Thêm"}
              </Button>
            </Input.Group>
          </Form.Item>
          {youtubeLinks?.length > 0 && (
            <Table
              columns={[
                {
                  title: "STT",
                  dataIndex: "index",
                  render: (_, __, i) => i + 1,
                },
                {
                  title: "Link YouTube",
                  dataIndex: "link",
                },
                {
                  title: "Hành động",
                  render: (_, record, index) => (
                    <>
                      <Button
                        type="link"
                        onClick={() => {
                          setCurrentYoutubeLink(record.link);
                          setEditYoutubeIndex(index);
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="link"
                        danger
                        onClick={() => {
                          const updated = youtubeLinks.filter((_, i) => i !== index);
                          setYoutubeLinks(updated);
                          if (editYoutubeIndex === index) {
                            setCurrentYoutubeLink("");
                            setEditYoutubeIndex(null);
                          }
                        }}
                      >
                        Xoá
                      </Button>
                    </>
                  ),
                },
              ]}
              dataSource={youtubeLinks.map((link, index) => ({ key: `${link}-${index}`, link }))}
              pagination={false}
            />
          )} */}
            {/* <Form.Item name="linkGame" label="Link Game bài tập">
            <Input
              placeholder="Nhập link game bài tập"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item> */}
            <Form.Item label="Link game bài tập">
              <Input.Group compact>
                <Input
                  value={currentLink}
                  placeholder="Nhập link game bài tập"
                  style={{
                    width: "calc(100% - 120px)",
                    borderRadius: "6px",
                    borderColor: colors.inputBorder,
                  }}
                  onChange={(e) => setCurrentLink(e.target.value)}
                />
                <Button
                  type="primary"
                  onClick={() => {
                    if (!currentLink) return;
                    if (editIndex !== null) {
                      const updated = [...gameLinks];
                      updated[editIndex] = currentLink;
                      setGameLinks(updated);
                      setEditIndex(null);
                    } else {
                      setGameLinks([...gameLinks, currentLink]);
                    }
                    setCurrentLink("");
                  }}
                >
                  {editIndex !== null ? "Cập nhật" : "Thêm"}
                </Button>
              </Input.Group>
            </Form.Item>
            {gameLinks?.length > 0 && (
              <Table
                columns={[
                  {
                    title: "STT",
                    dataIndex: "index",
                    render: (_, __, i) => i + 1,
                  },
                  {
                    title: "Link Game",
                    dataIndex: "link",
                  },
                  {
                    title: "Hành động",
                    render: (_, record, index) => (
                      <>
                        <Button
                          type="link"
                          onClick={() => {
                            setCurrentLink(record.link);
                            setEditIndex(index);
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          type="link"
                          danger
                          onClick={() => {
                            const updated = gameLinks.filter((_, i) => i !== index);
                            setGameLinks(updated);
                            if (editIndex === index) {
                              setCurrentLink("");
                              setEditIndex(null);
                            }
                          }}
                        >
                          Xoá
                        </Button>
                      </>
                    ),
                  },
                ]}
                dataSource={gameLinks.map((link, index) => {
                  return { key: `${link}-${index}`, link };
                })}
                pagination={false}
              />
            )}

            {/* <Form.Item name="linkZalo" label="Link Zalo bài tập">
              <Input
                placeholder="Nhập link zalo bài tập"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item> */}
            {/* <Form.Item name="Speech to text" label="Chuyển giọng nói thành văn bản">
              <SpeechToTextComponent />
            </Form.Item> */}
          </Form>
        </DialogContent>
        <DialogActions>
          <Button
            style={{ marginTop: isMobile ? "20px" : "" }}
            key="cancelHomework"
            onClick={() => {
              setTextToSpeech("");
              setModalUpdateHomeWorkVisible(false);
              formHomework.resetFields();
              setEditingHomeWork(null);
              setCurrentLink("");
            }}
          >
            cancel
          </Button>
          <Button
            loading={loadingUpdateHomework}
            key="submitHomework"
            type="primary"
            onClick={handleSaveHomework}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            {editingHomeWork ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lesson Detail Modal */}
      <LessonDetailModal
        open={lessonDetailOpen}
        onClose={() => setLessonDetailOpen(false)}
        lesson={selectedLesson}
      />

      {/* Homework Detail Modal */}
      <HomeworkDetailModal
        open={homeworkDetailOpen}
        onClose={() => setHomeworkDetailOpen(false)}
        homework={selectedHomework}
      />
    </Dialog>
  );
}

TeacherOverViewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  teacher: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    username: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    fileUrl: PropTypes.string,
  }),
  row: PropTypes.object.isRequired,
  placeholderLessonPlan: PropTypes.string,
};

export default TeacherOverViewModal;
