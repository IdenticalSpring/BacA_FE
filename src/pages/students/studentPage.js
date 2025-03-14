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
} from "@mui/material";
import Sidebar from "./sidebar";
import Toolbox from "./toolbox"; // Import Toolbox
import classService from "services/classService";
import studentService from "services/studentService";
import { jwtDecode } from "jwt-decode";
import DataTable from "examples/Tables/DataTable";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import lessonByScheduleService from "services/lessonByScheduleService";
import lessonService from "services/lessonService";

const colors = {
  primary: "#FFC107",
  secondary: "#121212",
};

const StudentPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedLessonBySchedule, setSelectedLessonBySchedule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [student, setStudent] = useState(null);
  const userId = jwtDecode(sessionStorage.getItem("token"));
  const studentId = userId.userId;
  const userName = userId.username || "Student";
  const [lessonsBySchedule, setLessonsBySchedule] = useState([]);
  useEffect(() => {
    const fetchStudentById = async () => {
      try {
        const data = await studentService.getStudentById(studentId);
        setStudent(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin học sinh:", error);
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
          console.error("Lỗi khi lấy thông tin bài học theo lịch:", error);
        }
      };
      fetchLessonByScheduleOfClasses();
    }
  }, [student]);

  useEffect(() => {
    const findSelectedLessonBySchedule = lessonsBySchedule.find(
      (lessonBySchedule) => lessonBySchedule.id === selectedLessonBySchedule
    );
    // console.log("findSelectedLessonBySchedule", findSelectedLessonBySchedule);

    if (findSelectedLessonBySchedule && findSelectedLessonBySchedule.lessonID) {
      const fetchLessonById = async () => {
        try {
          const data = await lessonService.getLessonById(findSelectedLessonBySchedule.lessonID);
          setLessons([data]);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách học sinh:", error);
          setLessons([]);
        }
      };
      fetchLessonById();
    } else {
      setLessons([]);
    }
  }, [selectedLessonBySchedule]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/auth/sign-in";
  };

  const handleSelectLessonBySchedule = (lessonByScheduleId) => {
    // console.log("Chọn lớp học", lessonByScheduleId);

    setSelectedLessonBySchedule(lessonByScheduleId);
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
    { Header: "Link", accessor: "link", align: "center" },
    { Header: "Description", accessor: "description", align: "center" },
  ];

  const rows = lessons.map((lesson) => ({
    id: lesson.id,
    name: lesson.name,
    level: lesson.level || "N/A",
    link: lesson.link || "N/A",
    description: lesson.description || "N/A",
  }));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <Sidebar
        lessonsBySchedule={lessonsBySchedule}
        selectedLessonBySchedule={selectedLessonBySchedule}
        onSelectLessonBySchedule={handleSelectLessonBySchedule}
      />

      <Box sx={{ flexGrow: 1, paddingLeft: "260px", pb: selectedLessonBySchedule ? "70px" : "0" }}>
        {/* Navbar */}
        <AppBar position="static" sx={{ backgroundColor: colors.primary, boxShadow: "none" }}>
          <Toolbar>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: "bold", color: colors.secondary }}
            >
              STUDENT DASHBOARD
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

        {/* DataTable */}
        <Container sx={{ py: 6 }}>
          {!selectedLessonBySchedule ? (
            <Typography variant="h5" align="center" sx={{ mt: 5 }}>
              Please select a lesson by schedule
            </Typography>
          ) : (
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                borderRadius="lg"
                sx={{ backgroundColor: colors.primary }}
              >
                <MDTypography variant="h6" color="black">
                  List of lessons
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          )}
        </Container>
      </Box>

      {/* Chỉ hiển thị Toolbox nếu đã chọn lớp */}
      {selectedLessonBySchedule && (
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
            onAddStudent={handleAddStudent}
            onEditClass={handleEditClass}
            onDeleteClass={handleDeleteClass}
            onViewReport={handleViewReport}
          />
        </Box>
      )}
    </Box>
  );
};

export default StudentPage;
