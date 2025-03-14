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

const colors = {
  primary: "#FFC107",
  secondary: "#121212",
};

const TeacherPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const userId = jwtDecode(sessionStorage.getItem("token"));
  const teacherId = userId.userId;
  const userName = userId.username || "Teacher";

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

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/auth/sign-in";
  };

  const handleSelectClass = (classId) => {
    setSelectedClass(classId);
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

        {/* DataTable */}
        <Container sx={{ py: 6 }}>
          {!selectedClass ? (
            <Typography variant="h5" align="center" sx={{ mt: 5 }}>
              Please select a class
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
                  List of students
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

export default TeacherPage;
