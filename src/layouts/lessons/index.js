import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { useNavigate } from "react-router-dom";
import lessonService from "services/lessonService";
import { colors } from "assets/theme/color";
import levelService from "services/levelService";
import PropTypes from "prop-types";
import TextArea from "antd/es/input/TextArea";
import { Button, message } from "antd";
import ReactQuill from "react-quill";
import axios from "axios";
import homeWorkService from "services/homeWorkService";
import LessonDetailModal from "./LessonDetailModal";

function Lessons() {
  const navigate = useNavigate();
  const [columns] = useState([
    {
      Header: "Lesson Name",
      accessor: "name",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.name}
        </span>
      ),
    },
    {
      Header: "Level",
      accessor: "level",
      width: "10%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.level}
        </span>
      ),
    },
    {
      Header: "Link Youtube",
      accessor: "linkYoutube",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.linkYoutube}
        </span>
      ),
    },
    {
      Header: "Link Speech",
      accessor: "linkSpeech",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.linkSpeech}
        </span>
      ),
    },
    {
      Header: "Teacher",
      accessor: "TeacherId",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.TeacherId}
        </span>
      ),
    },
    {
      Header: "Description",
      accessor: "description",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.description}
        </span>
      ),
    },
    {
      Header: "Date",
      accessor: "date",
      width: "20%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {new Date(row.values.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      Header: "Actions",
      accessor: "actions",
      width: "20%",
    },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingTTSLesson, setLoadingTTSLesson] = useState(false);
  const [loadingUpdateLesson, setLoadingUpdateLesson] = useState(false);
  const [lessonData, setLessonData] = useState({
    name: "",
    level: "",
    linkYoutube: "",
    linkSpeech: "",
    TeacherId: "",
    description: "",
    date: "", // Dùng chuỗi định dạng YYYY-MM-DD
  });
  const [levels, setLevels] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLessonDetail, setSelectedLessonDetail] = useState(null);
  const [searchTeacher, setSearchTeacher] = useState("");
  const [searchDate, setSearchDate] = useState(""); // State để lưu ngày tìm kiếm

  useEffect(() => {
    fetchLessons();
  }, [levels]);

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

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      setQuill(editor);
    }
  }, [quillRef]);

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

  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTSLesson(true);

    try {
      const response = await homeWorkService.textToSpeech(textToSpeech);
      let base64String = response;

      function base64ToBlob(base64, mimeType) {
        let byteCharacters = atob(base64);
        let byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
      }

      let audioBlob = base64ToBlob(base64String, "audio/mp3");
      setMp3file(audioBlob);
      let audioUrl = URL.createObjectURL(audioBlob);
      setMp3Url(audioUrl);
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTSLesson(false);
  };

  useEffect(() => {
    if (mp3Url) {
      const audioElement = document.getElementById("audio-player");
      if (audioElement) {
        audioElement.src = "";
        audioElement.load();
        audioElement.src = mp3Url;
      }
    }
  }, [mp3Url]);

  const fetchLessons = async () => {
    try {
      const data = await lessonService.getAllLessons();
      const formattedRows = data.map((lesson) => ({
        id: lesson.id,
        name: lesson.name,
        level: levels?.find((lv) => lv.id === lesson.level)?.name,
        linkYoutube: lesson.linkYoutube,
        linkSpeech: lesson.linkSpeech,
        TeacherId: lesson?.teacher?.username,
        description: lesson.description,
        date: lesson.date, // Giả sử API trả về trường date
        actions: (
          <>
            <IconButton
              sx={{
                color: colors.midGreen,
                " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
              }}
              onClick={() => handleEdit(lesson)}
            >
              <EditIcon />
            </IconButton>
          </>
        ),
      }));
      setRows(formattedRows);
    } catch (err) {
      setError("Lỗi khi tải dữ liệu bài học!" + err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditMode(true);
    setSelectedLesson(lesson);
    setLessonData({
      name: lesson.name,
      level: lesson.level,
      linkYoutube: lesson.linkYoutube,
      description: lesson.description,
      TeacherId: lesson?.teacher?.id || "",
      date: lesson.date ? new Date(lesson.date).toISOString().split("T")[0] : "", // Chuyển thành YYYY-MM-DD
    });
    setMp3Url(lesson.linkSpeech);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài học này?")) {
      try {
        await lessonService.deleteLesson(id);
        setRows(rows.filter((row) => row.id !== id));
      } catch (err) {
        alert("Lỗi khi xóa bài học!");
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoadingUpdateLesson(true);
      const formData = new FormData();
      formData.append("name", lessonData.name);
      formData.append("level", lessonData.level);
      formData.append("linkYoutube", lessonData.linkYoutube);
      formData.append("description", lessonData.description);
      formData.append("teacherId", lessonData.TeacherId);
      formData.append("date", lessonData.date); // Gửi chuỗi ngày YYYY-MM-DD
      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }
      const lessonEntity = await lessonService.editLesson(selectedLesson.id, formData);
      setRows(
        rows.map((row) =>
          row.id === selectedLesson.id
            ? {
                ...row,
                ...lessonData,
                linkSpeech: lessonEntity.linkSpeech,
                actions: (
                  <>
                    <IconButton
                      sx={{
                        color: colors.midGreen,
                        " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                      }}
                      onClick={() => handleEdit(lessonEntity)}
                    >
                      <EditIcon />
                    </IconButton>
                  </>
                ),
              }
            : row
        )
      );
      message.success("Lesson updated successfully");
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
      setOpen(false);
      setLessonData({
        name: "",
        level: "",
        linkYoutube: "",
        linkSpeech: "",
        TeacherId: "",
        description: "",
        date: "",
      });
      setEditMode(false);
    } catch (err) {
      alert(editMode ? "Lỗi khi chỉnh sửa bài học!" + err : "Lỗi khi tạo bài học!");
    } finally {
      setLoadingUpdateLesson(false);
    }
  };

  const filteredRows = useMemo(() => {
    let filtered = rows;

    // Lọc theo tên giáo viên
    if (searchTeacher) {
      filtered = filtered.filter((row) => {
        const teacherName = row.TeacherId || "";
        return teacherName.toLowerCase().includes(searchTeacher.toLowerCase());
      });
    }

    // Lọc theo ngày
    if (searchDate) {
      filtered = filtered.filter((row) => {
        const lessonDate = new Date(row.date).toISOString().split("T")[0]; // Chuẩn hóa thành YYYY-MM-DD
        return lessonDate === searchDate;
      });
    }

    return filtered;
  }, [rows, searchTeacher, searchDate]);

  return (
    <DashboardLayout>
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
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                borderRadius="lg"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ backgroundColor: colors.deepGreen, color: colors.white }}
              >
                <MDTypography variant="h6" color="white">
                  Lesson Tables
                </MDTypography>
              </MDBox>
              <MDBox
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                gap={2}
                px={2}
                py={1}
              >
                <TextField
                  label="Search by teacher"
                  variant="outlined"
                  size="small"
                  value={searchTeacher}
                  onChange={(e) => setSearchTeacher(e.target.value)}
                  sx={{ backgroundColor: "white", borderRadius: "4px" }}
                />
                <TextField
                  label="Search by date"
                  type="date"
                  variant="outlined"
                  size="small"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "white", borderRadius: "4px" }}
                />
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDTypography variant="h6" color="info" align="center">
                    Loading...
                  </MDTypography>
                ) : error ? (
                  <MDTypography variant="h6" color="error" align="center">
                    {error}
                  </MDTypography>
                ) : (
                  <DataTable
                    table={{ columns, rows: filteredRows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <Dialog
        open={open}
        onClose={() => {
          setTextToSpeech("");
          setOpen(false);
        }}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            width: "90vw",
            height: "90vh",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>{editMode ? "Edit Lesson" : "Create"}</DialogTitle>
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
            label="level"
            fullWidth
            sx={{
              "& .css-1cohrqd-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select":
                {
                  minHeight: "48px",
                  display: "flex",
                  alignItems: "center",
                },
            }}
            margin="normal"
            value={lessonData.level}
            onChange={(e) => {
              setLessonData({ ...lessonData, level: e.target.value });
            }}
          />
          <TextField
            label="Lesson Link"
            fullWidth
            margin="normal"
            value={lessonData.linkYoutube}
            onChange={(e) => setLessonData({ ...lessonData, linkYoutube: e.target.value })}
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
            style={{
              borderRadius: "6px",
              borderColor: colors.inputBorder,
            }}
          />
          <Button
            type="primary"
            onClick={handleConvertToSpeech}
            loading={loadingTTSLesson}
            style={{
              backgroundColor: colors.deepGreen,
              borderColor: colors.deepGreen,
            }}
          >
            Convert to Speech
          </Button>
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
            id="detail"
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
            onChange={(e) => {
              setLessonData({ ...lessonData, description: e });
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            sx={{ color: colors.midGreen, " &:hover": { color: colors.darkGreen } }}
          >
            Cancel
          </Button>
          <Button
            loading={loadingUpdateLesson}
            key="submit"
            type="primary"
            onClick={handleSave}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            {"Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <LessonDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedLessonDetail(null);
        }}
        lesson={selectedLessonDetail}
      />
    </DashboardLayout>
  );
}

export default Lessons;
Lessons.propTypes = {
  row: PropTypes.object.isRequired,
};
