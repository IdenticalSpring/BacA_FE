import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import classService from "services/classService";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

// Màu sắc
const colors = {
  primary: "rgb(16, 168, 16)", // xanh lá đậm
  secondary: "rgb(243, 243, 243)", // Màu nền đen
  hover: "#rgb(213, 213, 208)", // Màu xanh lá sáng khi hover
};

const TeacherDashboard = () => {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const userId = jwtDecode(sessionStorage.getItem("token"));
  const teacherId = userId.userId;
  const userName = userId.username || "Teacher"; // Lấy tên giáo viên từ token

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

  // Xử lý mở/đóng menu dropdown
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Xử lý đăng xuất
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/auth/sign-in"; // Chuyển hướng về trang đăng nhập
  };

  return (
    <>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: colors.primary, boxShadow: "none" }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: "bold", color: colors.secondary }}
          >
            TEACHER DASHBOARD
          </Typography>

          {/* Avatar + Dropdown Menu */}
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
                boxShadow: "0px 5px 15px rgba(212, 47, 47, 0.1)",
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

      {/* Hero Section */}
      <Box
        sx={{
          background: colors.primary,
          color: colors.secondary,
          textAlign: "center",
          py: 10,
          px: 2,
          boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Welcome, {userName}!
        </Typography>
        <Typography variant="h5" paragraph>
          Empower your students with the best learning experience.
        </Typography>
        <Button
          onClick={() => navigate("/teacherpage")}
          variant="contained"
          sx={{
            backgroundColor: colors.secondary,
            color: colors.primary,
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#333333" },
          }}
          size="large"
        >
          Get Started
        </Button>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {["Fast", "Secure", "Reliable"].map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card
                sx={{
                  textAlign: "center",
                  borderRadius: 4,
                  backgroundColor: colors.secondary,
                  color: "white",
                  boxShadow: "0px 5px 15px rgba(255, 255, 255, 0.1)",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0px 10px 25px rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {feature}
                  </Typography>
                  <Typography variant="body1" color="grey.400">
                    Experience a seamless and efficient workflow.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      {/* <Box sx={{ textAlign: "center", py: 6, backgroundColor: colors.secondary }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="white">
          Ready to get started?
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: colors.primary,
            color: colors.secondary,
            fontWeight: "bold",
            "&:hover": { backgroundColor: colors.hover },
          }}
          size="large"
        >
          Sign Up Now
        </Button>
      </Box> */}
    </>
  );
};

export default TeacherDashboard;
