import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Box,
  Container,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControl,
  TextField,
  Grid,
  CardContent,
} from "@mui/material";
import Sidebar from "./sidebar";
import Toolbox from "./toolbox"; // Import Toolbox
import classService from "services/classService";
import studentService from "services/studentService";
import { jwtDecode } from "jwt-decode";
import DataTable from "examples/Tables/DataTable";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import LessonBySchedules from "layouts/lesson_by_schedules";
import lessonService from "services/lessonService";
import lessonByScheduleService from "services/lessonByScheduleService";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";

const colors = {
  primary: "#FFC107",
  secondary: "#121212",
};
const daysOfWeek = [
  "Choose day of week",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TeacherPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lessonsData, setLessonsData] = useState([]);
  const [lessonByScheduleData, setLessonByScheduleData] = useState([]);
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const userId = jwtDecode(sessionStorage.getItem("token"));
  const teacherId = userId.userId;
  const userName = userId.username || "Teacher";

  const [openHomeworkModal, setOpenHomeworkModal] = useState(false);

  const handleOpenHomeworkModal = () => setOpenHomeworkModal(true);
  const handleCloseHomeworkModal = () => setOpenHomeworkModal(false);

  const [homeworkTitle, setHomeworkTitle] = useState("");
  const [homeworkDescription, setHomeworkDescription] = useState("");
  const [textToSpeech, setTextToSpeech] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [mp3Url, setMp3Url] = useState(""); // Lưu URL của file MP3

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
  }, [teacherId]);
  useEffect(() => {
    if (selectedClass) {
      fetchLessonByScheduleAndLessonByLevel(); // Lấy danh sách lesson_by_schedule của lớp học khi selectedClass thay đổi
      console.log(lessonByScheduleData);
    }
  }, [selectedClass]);
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
    }
  }, [selectedClass]);
  const fetchLessonByScheduleAndLessonByLevel = async () => {
    try {
      const data = await lessonByScheduleService.getAllLessonBySchedulesOfClass(selectedClass);
      setLessonByScheduleData(data);
      const classData = classes.find((c) => c.id === selectedClass);
      if (classData) {
        const lessons = await lessonService.getLessonByLevel(classData.level);
        setLessonsData(lessons);
      }
    } catch (err) {
      setError("Lỗi khi tải dữ liệu lesson_by_schedule!");
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateLessonBySchedule = async (id, lessonByScheduleData) => {
    try {
      await lessonByScheduleService.updateLessonBySchedule(id, lessonByScheduleData);
      // alert("Cập nhật lesson_by_schedule thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật lesson_by_schedule!");
    }
  };
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/auth/sign-in";
  };

  const handleSelectClass = (classId) => {
    setSelectedClass(classId);
  };

  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTS(true);

    try {
      const response = await axios.post(
        "https://viettel-ai-api-url.com/tts", // Thay bằng API thật của Viettel
        {
          text: textToSpeech,
          voice: "banmai", // Chọn giọng đọc
          speed: 1.0,
          format: "mp3",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "YOUR_VIETTEL_AI_KEY", // Thay bằng key của bạn
          },
        }
      );

      setMp3Url(response.data.audioUrl);
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTS(false);
  };

  // Các hàm xử lý khi bấm nút trong Toolbox
  const handleAddStudent = () => console.log("Thêm học sinh");
  const handleEditClass = () => console.log("Sửa thông tin lớp");
  const handleDeleteClass = () => console.log("Xóa lớp");
  const handleViewReport = () => console.log("Xem báo cáo");

  // Cấu hình DataTable
  const columns = [
    { Header: "ID", accessor: "id", align: "left" },
    { Header: "Name", accessor: "name", align: "left" },
    { Header: "Level", accessor: "level", align: "center" },
    { Header: "Note", accessor: "note", align: "center" },
  ];

  const rows = students.map((student) => ({
    id: student.id,
    name: student.name,
    level: student.level || "N/A",
    note: student.note || "N/A",
  }));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <Sidebar classes={classes} selectedClass={selectedClass} onSelectClass={handleSelectClass} />

      <Box sx={{ flexGrow: 1, paddingLeft: "260px", pb: selectedClass ? "70px" : "0" }}>
        {/* Navbar */}
        <AppBar position="static" sx={{ backgroundColor: colors.primary, boxShadow: "none" }}>
          <Toolbar>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: "bold", color: colors.secondary }}
            >
              TEACHER DASHBOARD
            </Typography>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: colors.secondary, color: colors.primary }}>
                {userName.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{ mt: 1 }}
              PaperProps={{
                sx: {
                  backgroundColor: colors.secondary,
                  color: "white",
                  borderRadius: 2,
                  boxShadow: "0px 5px 15px rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <MenuItem
                onClick={handleLogout}
                sx={{ "&:hover": { backgroundColor: colors.hover, color: "black" } }}
              >
                Log out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Grid
          container
          spacing={2} // Giảm khoảng cách giữa các items
          sx={{ mt: 2, maxWidth: "90%", mx: "auto" }} // Giới hạn độ rộng của danh sách
        >
          {students.length > 0 ? (
            students.map((student) => (
              <Grid item xs={12} sm={6} md={3} lg={2.5} key={student.id}>
                {" "}
                {/* Thu nhỏ item */}
                <Card
                  sx={{
                    p: 1.5,
                    textAlign: "center",
                    boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: 2,
                    transition: "0.2s",
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow: "0px 5px 12px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    sx={{ bgcolor: colors.primary, width: 48, height: 48, mx: "auto", mb: 1.5 }}
                  >
                    {student.name.charAt(0)}
                  </Avatar>

                  {/* Thông tin học sinh */}
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {student.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Level: {student.level || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Note: {student.note || "N/A"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography align="center" sx={{ fontStyle: "italic", color: "gray", mt: 3 }}>
                Choose your class
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Chỉ hiển thị Toolbox nếu đã chọn lớp */}
      {selectedClass && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            backgroundColor: "#f5f5f5",
            borderTop: "1px solid #ddd",
            zIndex: 1000,
          }}
        >
          <Toolbox
            onManageLessons={handleOpenDialog}
            Homework={handleOpenHomeworkModal}
            onDeleteClass={handleDeleteClass}
            onViewReport={handleViewReport}
          />
        </Box>
      )}
      <Dialog open={openHomeworkModal} onClose={handleCloseHomeworkModal} maxWidth="md" fullWidth>
        <DialogTitle>Homework</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            value={homeworkTitle}
            onChange={(e) => setHomeworkTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle1">Description</Typography>
          <ReactQuill
            theme="snow"
            value={homeworkDescription}
            onChange={setHomeworkDescription}
            style={{ height: "150px", marginBottom: "20px" }}
          />

          <TextField
            label="Enter text to convert to MP3"
            fullWidth
            multiline
            rows={2}
            value={textToSpeech}
            onChange={(e) => setTextToSpeech(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleConvertToSpeech}
            disabled={loadingTTS}
          >
            {loadingTTS ? "Converting..." : "Convert to Speech"}
          </Button>

          {mp3Url && (
            <audio controls>
              <source src={mp3Url} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          )}

          <TextField
            label="YouTube Link"
            fullWidth
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHomeworkModal} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Lesson By Schedule</DialogTitle>
        <DialogContent>
          {/* <LessonBySchedules /> */}
          {loading ? (
            <MDTypography variant="h6" color="info" align="center">
              Loading...
            </MDTypography>
          ) : error ? (
            <MDTypography variant="h6" color="error" align="center">
              {error}
            </MDTypography>
          ) : (
            <>
              {lessonByScheduleData.length > 0 && (
                <MDBox px={3} py={2}>
                  {lessonByScheduleData.map((item, index) => (
                    <MDBox
                      key={index}
                      p={1}
                      mb={1}
                      border="1px solid #ddd"
                      borderRadius="8px"
                      bgcolor="#f9f9f9"
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      {/* Thông tin lịch học */}
                      <MDTypography
                        variant="body1"
                        sx={{
                          width: "48%",
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        📅 {daysOfWeek[item.schedule.dayOfWeek]} | {item.date} | 🕒{" "}
                        {item.schedule.startTime} - {item.schedule.endTime}
                      </MDTypography>
                      {/* Dropdown chọn Lesson */}
                      <FormControl sx={{ width: "48%" }}>
                        <TextField
                          select
                          label="Lesson"
                          margin="normal"
                          InputProps={{
                            sx: {
                              minHeight: "48px",
                              display: "flex",
                              alignItems: "center",
                            },
                          }}
                          value={
                            lessonsData.some((lesson) => lesson.id === item.lessonID)
                              ? item.lessonID
                              : ""
                          }
                          onChange={(e) => {
                            const newData = [...lessonByScheduleData];
                            newData[index] = { ...newData[index], lessonID: e.target.value };
                            setLessonByScheduleData(newData);
                            handleUpdateLessonBySchedule(item.id, { lessonID: e.target.value });
                          }}
                        >
                          {lessonsData.map((lesson) => (
                            <MenuItem key={lesson.id} value={lesson.id}>
                              {lesson.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </FormControl>
                    </MDBox>
                  ))}
                </MDBox>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherPage;
