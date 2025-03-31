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
import HomeworkDetailModal from "./HomeworkDetailModal";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

function HomeWorks() {
  const navigate = useNavigate();
  const [columns] = useState([
    {
      Header: "Lesson Title",
      accessor: "title",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer" }}
          className="truncate-text"
          onClick={() => {
            setSelectedHomeworkDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.title}
        </span>
      ),
    },
    {
      Header: "Level",
      accessor: "level",
      width: "10%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer" }}
          className="truncate-text"
          onClick={() => {
            setSelectedHomeworkDetail(row.original);
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
          style={{ cursor: "pointer" }}
          className="truncate-text"
          onClick={() => {
            setSelectedHomeworkDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.linkYoutube}
        </span>
      ),
    },
    {
      Header: "Link Game",
      accessor: "linkGame",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer" }}
          className="truncate-text"
          onClick={() => {
            setSelectedHomeworkDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.linkGame}
        </span>
      ),
    },
    {
      Header: "Link Speech",
      accessor: "linkSpeech",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer" }}
          className="truncate-text"
          onClick={() => {
            setSelectedHomeworkDetail(row.original);
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
          style={{ cursor: "pointer" }}
          className="truncate-text"
          onClick={() => {
            setSelectedHomeworkDetail(row.original);
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
          style={{ cursor: "pointer" }}
          className="truncate-text"
          onClick={() => {
            setSelectedHomeworkDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.description}
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
  const [selectedHomeWork, setSelectedHomeWork] = useState(null);
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingTTSHomework, setLoadingTTSHomework] = useState(false);
  const [loadingUpdateHomework, setLoadingUpdateHomework] = useState(false);
  const [homeworkData, setHomeworkData] = useState({
    title: "",
    level: "",
    linkYoutube: "",
    linkGame: "",
    linkSpeech: "",
    TeacherId: "",
    description: "",
  });
  const [levels, setLevels] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedHomeworkDetail, setSelectedHomeworkDetail] = useState(null);
  const [searchTeacher, setSearchTeacher] = useState(""); // State cho tìm kiếm

  useEffect(() => {
    fetchHomeworks();
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
    setLoadingTTSHomework(true);

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
    setLoadingTTSHomework(false);
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

  const fetchHomeworks = async () => {
    try {
      const data = await homeWorkService.getAllHomeWork();
      const formattedRows = data.map((homework) => ({
        id: homework.id,
        title: homework.title,
        level: levels?.find((lv) => lv.id === homework.level)?.name,
        linkYoutube: homework.linkYoutube,
        linkGame: homework.linkGame,
        linkSpeech: homework.linkSpeech,
        TeacherId: homework?.teacher?.username,
        description: homework.description,
        actions: (
          <>
            <IconButton
              sx={{
                backgroundColor: colors.midGreen,
                color: colors.white,
                " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
              }}
              onClick={() => handleEdit(homework)}
            >
              <EditIcon />
            </IconButton>
          </>
        ),
      }));
      setRows(formattedRows);
    } catch (err) {
      setError("Lỗi khi tải dữ liệu bài tập! " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (homeWork) => {
    setEditMode(true);
    setSelectedHomeWork(homeWork);
    setHomeworkData({
      title: homeWork.title,
      level: homeWork.level,
      linkYoutube: homeWork.linkYoutube,
      linkGame: homeWork.linkGame,
      description: homeWork.description,
      TeacherId: homeWork?.teacher?.id || "",
    });
    setMp3Url(homeWork.linkSpeech);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài tập này?")) {
      try {
        await homeWorkService.deleteHomeWork(id);
        setRows(rows.filter((row) => row.id !== id));
      } catch (err) {
        alert("Lỗi khi xóa bài tập!");
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoadingUpdateHomework(true);
      const formData = new FormData();
      formData.append("title", homeworkData.title);
      formData.append("level", homeworkData.level);
      formData.append("linkYoutube", homeworkData.linkYoutube);
      formData.append("linkGame", homeworkData.linkGame);
      formData.append("description", homeworkData.description);
      formData.append("teacherId", homeworkData.TeacherId);
      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }
      const homeworkEntity = await homeWorkService.editHomeWork(selectedHomeWork.id, formData);
      setRows(
        rows.map((row) =>
          row.id === selectedHomeWork.id
            ? {
                ...row,
                ...homeworkData,
                linkSpeech: homeworkEntity.linkSpeech,
                actions: (
                  <>
                    <IconButton color="primary" onClick={() => handleEdit(homeworkEntity)}>
                      <EditIcon />
                    </IconButton>
                  </>
                ),
              }
            : row
        )
      );
      message.success("Homework updated successfully");
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
      setOpen(false);
      setHomeworkData({
        title: "",
        level: "",
        linkYoutube: "",
        linkGame: "",
        linkSpeech: "",
        TeacherId: "",
        description: "",
      });
      setEditMode(false);
    } catch (err) {
      alert(editMode ? "Lỗi khi chỉnh sửa bài tập!" + err : "Lỗi khi tạo bài tập!");
    } finally {
      setLoadingUpdateHomework(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchTeacher) return rows;
    return rows.filter((row) => row.TeacherId.toLowerCase().includes(searchTeacher.toLowerCase()));
  }, [rows, searchTeacher]);

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
            label="Lesson Title"
            fullWidth
            margin="normal"
            value={homeworkData.title}
            onChange={(e) => setHomeworkData({ ...homeworkData, title: e.target.value })}
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
            value={homeworkData.level}
            onChange={(e) => {
              setHomeworkData({ ...homeworkData, level: e.target.value });
            }}
          />
          <TextField
            label="Lesson Link"
            fullWidth
            margin="normal"
            value={homeworkData.linkYoutube}
            onChange={(e) => setHomeworkData({ ...homeworkData, linkYoutube: e.target.value })}
          />
          <TextField
            label="Lesson Game Link"
            fullWidth
            margin="normal"
            value={homeworkData.linkGame}
            onChange={(e) => setHomeworkData({ ...homeworkData, linkGame: e.target.value })}
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
            loading={loadingTTSHomework}
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
            onChange={(e) => {
              setHomeworkData({ ...homeworkData, description: e });
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
            loading={loadingUpdateHomework}
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
      <HomeworkDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedHomeworkDetail(null);
        }}
        homework={selectedHomeworkDetail}
      />
    </DashboardLayout>
  );
}

export default HomeWorks;
HomeWorks.propTypes = {
  row: PropTypes.object.isRequired,
};
