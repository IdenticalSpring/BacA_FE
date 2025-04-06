import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import classService from "services/classService";
import lessonService from "services/lessonService";
import homeWorkService from "services/homeWorkService";
import { colors } from "assets/theme/color";
import TextField from "@mui/material/TextField";
import TextArea from "antd/es/input/TextArea";
import { Button as AntButton, message, Radio } from "antd";
import ReactQuill from "react-quill";
import axios from "axios";
import levelService from "services/levelService";
import LessonDetailModal from "layouts/lessons/LessonDetailModal";
import HomeworkDetailModal from "layouts/homeWorks/HomeworkDetailModal";

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
      linkZalo: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

function TeacherOverViewModal({ open, onClose, teacher }) {
  const [classes, setClasses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [homeworkDialogOpen, setHomeworkDialogOpen] = useState(false);
  const [lessonDetailOpen, setLessonDetailOpen] = useState(false);
  const [homeworkDetailOpen, setHomeworkDetailOpen] = useState(false);
  const [levels, setLevels] = useState([]);
  const quillRef = useRef(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [lessonData, setLessonData] = useState({
    name: "",
    level: "",
    linkYoutube: "",
    linkGame: "",
    linkSpeech: "",
    TeacherId: "",
    description: "",
    date: "",
  });
  const [homeworkData, setHomeworkData] = useState({
    title: "",
    level: "",
    linkYoutube: "",
    linkGame: "",
    linkSpeech: "",
    linkZalo: "",
    TeacherId: "",
    description: "",
    date: "",
  });
  const [gender, setGender] = useState(1);

  useEffect(() => {
    if (teacher) {
      fetchTeacherData();
    }
  }, [teacher]);

  useEffect(() => {
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

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const classData = await classService.getAllClassesByTeacher(teacher.id);
      setClasses(classData);

      const lessonData = await lessonService.getLessonByTeacherId(teacher.id);
      setLessons(lessonData);

      const homeworkData = await homeWorkService.getHomeWorkByTeacherId(teacher.id);
      setHomeworks(homeworkData);
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
    {
      Header: "Level",
      accessor: "level",
      width: "10%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.level}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Link Youtube",
      accessor: "linkYoutube",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.linkYoutube}
        </span>
      ),
      propTypes: cellPropTypes,
    },
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
    {
      Header: "Link Speech",
      accessor: "linkSpeech",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.linkSpeech}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Teacher",
      accessor: "TeacherId",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.TeacherId}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Description",
      accessor: "description",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.description}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Date",
      accessor: "date",
      width: "20%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {new Date(row.values.date).toLocaleDateString()}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Actions",
      accessor: "actions",
      width: "20%",
      Cell: ({ row }) => (
        <IconButton
          sx={{
            color: colors.midGreen,
            "&:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
          }}
          onClick={() => handleEditLesson(row.original)}
        >
          <EditIcon />
        </IconButton>
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
    {
      Header: "Level",
      accessor: "level",
      width: "10%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.level}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Link Youtube",
      accessor: "linkYoutube",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.linkYoutube}
        </span>
      ),
      propTypes: cellPropTypes,
    },
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
    {
      Header: "Link Speech",
      accessor: "linkSpeech",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.linkSpeech}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Link Zalo",
      accessor: "linkZalo",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.linkZalo}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Teacher",
      accessor: "TeacherId",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.TeacherId}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Description",
      accessor: "description",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.description}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Date",
      accessor: "date",
      width: "20%",
      Cell: ({ row }) => (
        <span
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {new Date(row.values.date).toLocaleDateString()}
        </span>
      ),
      propTypes: cellPropTypes,
    },
    {
      Header: "Actions",
      accessor: "actions",
      width: "20%",
      Cell: ({ row }) => (
        <IconButton
          sx={{
            color: colors.midGreen,
            "&:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
          }}
          onClick={() => handleEditHomework(row.original)}
        >
          <EditIcon />
        </IconButton>
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
    level: levels?.find((lv) => lv.id === lesson.level)?.name || lesson.level,
    linkYoutube: lesson.linkYoutube,
    linkGame: lesson.linkGame,
    linkSpeech: lesson.linkSpeech,
    TeacherId: lesson?.teacher?.username || "N/A",
    description: lesson.description,
    date: lesson.date,
    original: lesson,
  }));

  const homeworkRows = homeworks.map((homework) => ({
    id: homework.id,
    title: homework.title,
    level: levels?.find((lv) => lv.id === homework.level)?.name || homework.level,
    linkYoutube: homework.linkYoutube,
    linkGame: homework.linkGame,
    linkSpeech: homework.linkSpeech,
    linkZalo: homework.linkZalo,
    TeacherId: homework?.teacher?.username || "N/A",
    description: homework.description,
    date: homework.date,
    original: homework,
  }));

  const fileUrls = teacher?.fileUrl ? teacher.fileUrl.split(",") : [];

  // Logic chỉnh sửa Lesson
  const handleEditLesson = (lesson) => {
    setEditMode(true);
    setSelectedLesson(lesson);
    setLessonData({
      name: lesson.name,
      level: lesson.level,
      linkYoutube: lesson.linkYoutube,
      linkGame: lesson.linkGame,
      linkSpeech: lesson.linkSpeech,
      TeacherId: lesson?.teacher?.id || teacher.id,
      description: lesson.description,
      date: lesson.date ? new Date(lesson.date).toISOString().split("T")[0] : "",
    });
    setMp3Url(lesson.linkSpeech);
    setLessonDialogOpen(true);
  };

  const handleSaveLesson = async () => {
    try {
      setLoadingUpdate(true);
      const formData = new FormData();
      formData.append("name", lessonData.name);
      formData.append("level", lessonData.level);
      formData.append("linkYoutube", lessonData.linkYoutube);
      formData.append("linkGame", lessonData.linkGame);
      formData.append("description", lessonData.description);
      formData.append("teacherId", lessonData.TeacherId);
      formData.append("date", lessonData.date);
      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }
      const lessonEntity = await lessonService.editLesson(selectedLesson.id, formData);
      setLessons(lessons.map((ls) => (ls.id === lessonEntity.id ? lessonEntity : ls)));
      message.success("Lesson updated successfully");
      resetForm();
      setLessonDialogOpen(false);
    } catch (err) {
      message.error("Lỗi khi chỉnh sửa bài học: " + err);
    } finally {
      setLoadingUpdate(false);
    }
  };

  // Logic chỉnh sửa Homework
  const handleEditHomework = (homework) => {
    setEditMode(true);
    setSelectedHomework(homework);
    setHomeworkData({
      title: homework.title,
      level: homework.level,
      linkYoutube: homework.linkYoutube,
      linkGame: homework.linkGame,
      linkSpeech: homework.linkSpeech,
      linkZalo: homework.linkZalo,
      TeacherId: homework?.teacher?.id || teacher.id,
      description: homework.description,
      date: homework.date ? new Date(homework.date).toISOString().split("T")[0] : "",
    });
    setMp3Url(homework.linkSpeech);
    setHomeworkDialogOpen(true);
  };

  const handleSaveHomework = async () => {
    try {
      setLoadingUpdate(true);
      const formData = new FormData();
      formData.append("title", homeworkData.title);
      formData.append("level", homeworkData.level);
      formData.append("linkYoutube", homeworkData.linkYoutube);
      formData.append("linkGame", homeworkData.linkGame);
      formData.append("linkZalo", homeworkData.linkZalo);
      formData.append("description", homeworkData.description);
      formData.append("teacherId", homeworkData.TeacherId);
      formData.append("date", homeworkData.date);
      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }
      const homeworkEntity = await homeWorkService.editHomeWork(selectedHomework.id, formData);
      setHomeworks(homeworks.map((hw) => (hw.id === homeworkEntity.id ? homeworkEntity : hw)));
      message.success("Homework updated successfully");
      resetForm();
      setHomeworkDialogOpen(false);
    } catch (err) {
      message.error("Lỗi khi chỉnh sửa bài tập: " + err);
    } finally {
      setLoadingUpdate(false);
    }
  };

  // Text-to-Speech
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTS(true);
    try {
      const response = await homeWorkService.textToSpeech({ textToSpeech, gender });
      let base64String = response;
      const audioBlob = base64ToBlob(base64String, "audio/mp3");
      setMp3file(audioBlob);
      setMp3Url(URL.createObjectURL(audioBlob));
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTS(false);
  };

  const base64ToBlob = (base64, mimeType) => {
    let byteCharacters = atob(base64);
    let byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    let byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  useEffect(() => {
    if (mp3Url) {
      const audioElement = document.getElementById("audio-player");
      if (audioElement) {
        audioElement.src = mp3Url;
        audioElement.load();
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
      description: "",
      date: "",
    });
    setHomeworkData({
      title: "",
      level: "",
      linkYoutube: "",
      linkGame: "",
      linkSpeech: "",
      linkZalo: "",
      TeacherId: "",
      description: "",
      date: "",
    });
    setEditMode(false);
  };

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

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
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

        if (response.status === 201 && quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, "image", response.data.url);
        } else {
          message.error("Upload failed. Try again!");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error("Upload error. Please try again!");
      }
    };
  }, []);

  const modules = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandler,
      },
    },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
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
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
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
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              )}
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: colors.midGreen,
            "&:hover": { color: colors.darkGreen, backgroundColor: "rgba(0, 0, 0, 0.04)" },
          }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Lesson Edit Dialog */}
      <Dialog
        open={lessonDialogOpen}
        onClose={() => setLessonDialogOpen(false)}
        fullWidth
        maxWidth="xl"
        PaperProps={{ sx: { width: "90vw", height: "90vh", maxWidth: "none" } }}
      >
        <DialogTitle>Edit Lesson</DialogTitle>
        <DialogContent sx={{ height: "100%", overflowY: "auto" }}>
          <TextField
            label="Lesson Name"
            fullWidth
            margin="normal"
            value={lessonData.name}
            onChange={(e) => setLessonData({ ...lessonData, name: e.target.value })}
          />
          <TextField
            disabled
            label="Level"
            fullWidth
            margin="normal"
            value={lessonData.level}
            onChange={(e) => setLessonData({ ...lessonData, level: e.target.value })}
          />
          <TextField
            label="Lesson Youtube Link"
            fullWidth
            margin="normal"
            value={lessonData.linkYoutube}
            onChange={(e) => setLessonData({ ...lessonData, linkYoutube: e.target.value })}
          />
          <TextField
            label="Lesson Game Link"
            fullWidth
            margin="normal"
            value={lessonData.linkGame}
            onChange={(e) => setLessonData({ ...lessonData, linkGame: e.target.value })}
          />
          <TextField
            label="Lesson Date"
            type="date"
            fullWidth
            margin="normal"
            value={lessonData.date}
            onChange={(e) => setLessonData({ ...lessonData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextArea
            value={textToSpeech}
            onChange={(e) => setTextToSpeech(e.target.value)}
            rows={3}
            placeholder="Enter text to convert to speech"
            style={{ borderRadius: "6px", borderColor: colors.inputBorder }}
          />
          <Radio.Group
            options={genderOptions}
            onChange={({ target: { value } }) => setGender(value)}
            value={gender}
            optionType="button"
          />
          <AntButton
            type="primary"
            onClick={handleConvertToSpeech}
            loading={loadingTTS}
            style={{ backgroundColor: colors.deepGreen, borderColor: colors.deepGreen }}
          >
            Convert to Speech
          </AntButton>
          {mp3Url && (
            <div style={{ marginBottom: "16px" }}>
              <audio id="audio-player" controls style={{ width: "100%" }}>
                <source src={mp3Url} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          <MDTypography variant="h6" sx={{ color: "#7b809a", margin: "10px" }}>
            Description
          </MDTypography>
          <ReactQuill
            theme="snow"
            modules={modules}
            formats={quillFormats}
            ref={quillRef}
            style={{
              height: "250px",
              marginBottom: "60px",
              borderRadius: "6px",
              border: `1px solid ${colors.inputBorder}`,
            }}
            value={lessonData.description}
            onChange={(e) => setLessonData({ ...lessonData, description: e })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLessonDialogOpen(false)} sx={{ color: colors.midGreen }}>
            Cancel
          </Button>
          <AntButton
            loading={loadingUpdate}
            type="primary"
            onClick={handleSaveLesson}
            style={{ backgroundColor: colors.emerald, borderColor: colors.emerald }}
          >
            Save
          </AntButton>
        </DialogActions>
      </Dialog>

      {/* Homework Edit Dialog */}
      <Dialog
        open={homeworkDialogOpen}
        onClose={() => setHomeworkDialogOpen(false)}
        fullWidth
        maxWidth="xl"
        PaperProps={{ sx: { width: "90vw", height: "90vh", maxWidth: "none" } }}
      >
        <DialogTitle>Edit Homework</DialogTitle>
        <DialogContent sx={{ height: "100%", overflowY: "auto" }}>
          <TextField
            label="Homework Title"
            fullWidth
            margin="normal"
            value={homeworkData.title}
            onChange={(e) => setHomeworkData({ ...homeworkData, title: e.target.value })}
          />
          <TextField
            disabled
            label="Level"
            fullWidth
            margin="normal"
            value={homeworkData.level}
            onChange={(e) => setHomeworkData({ ...homeworkData, level: e.target.value })}
          />
          <TextField
            label="Homework Youtube Link"
            fullWidth
            margin="normal"
            value={homeworkData.linkYoutube}
            onChange={(e) => setHomeworkData({ ...homeworkData, linkYoutube: e.target.value })}
          />
          <TextField
            label="Homework Game Link"
            fullWidth
            margin="normal"
            value={homeworkData.linkGame}
            onChange={(e) => setHomeworkData({ ...homeworkData, linkGame: e.target.value })}
          />
          <TextField
            label="Homework Zalo Link"
            fullWidth
            margin="normal"
            value={homeworkData.linkZalo}
            onChange={(e) => setHomeworkData({ ...homeworkData, linkZalo: e.target.value })}
          />
          <TextField
            label="Homework Date"
            type="date"
            fullWidth
            margin="normal"
            value={homeworkData.date}
            onChange={(e) => setHomeworkData({ ...homeworkData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextArea
            value={textToSpeech}
            onChange={(e) => setTextToSpeech(e.target.value)}
            rows={3}
            placeholder="Enter text to convert to speech"
            style={{ borderRadius: "6px", borderColor: colors.inputBorder }}
          />
          <Radio.Group
            options={genderOptions}
            onChange={({ target: { value } }) => setGender(value)}
            value={gender}
            optionType="button"
          />
          <AntButton
            type="primary"
            onClick={handleConvertToSpeech}
            loading={loadingTTS}
            style={{ backgroundColor: colors.deepGreen, borderColor: colors.deepGreen }}
          >
            Convert to Speech
          </AntButton>
          {mp3Url && (
            <div style={{ marginBottom: "16px" }}>
              <audio id="audio-player" controls style={{ width: "100%" }}>
                <source src={mp3Url} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          <MDTypography variant="h6" sx={{ color: "#7b809a", margin: "10px" }}>
            Description
          </MDTypography>
          <ReactQuill
            theme="snow"
            modules={modules}
            formats={quillFormats}
            ref={quillRef}
            style={{
              height: "250px",
              marginBottom: "60px",
              borderRadius: "6px",
              border: `1px solid ${colors.inputBorder}`,
            }}
            value={homeworkData.description}
            onChange={(e) => setHomeworkData({ ...homeworkData, description: e })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHomeworkDialogOpen(false)} sx={{ color: colors.midGreen }}>
            Cancel
          </Button>
          <AntButton
            loading={loadingUpdate}
            type="primary"
            onClick={handleSaveHomework}
            style={{ backgroundColor: colors.emerald, borderColor: colors.emerald }}
          >
            Save
          </AntButton>
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
};

export default TeacherOverViewModal;
