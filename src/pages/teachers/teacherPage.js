import React from "react";
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
} from "@mui/material";

const TeacherPage = () => {
  return (
    <>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "#1976D2", boxShadow: "none" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            TEACHER DASHBOARD
          </Typography>
          <Button
            color="inherit"
            sx={{ fontWeight: "bold", mx: 1, "&:hover": { color: "#ffeb3b" } }}
          >
            Báo bài
          </Button>
          <Button
            color="inherit"
            sx={{ fontWeight: "bold", mx: 1, "&:hover": { color: "#ffeb3b" } }}
          >
            Nhận xét kiểm tra
          </Button>
          <Button
            color="inherit"
            sx={{ fontWeight: "bold", mx: 1, "&:hover": { color: "#ffeb3b" } }}
          >
            Nhận xét theo ngày
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(to right, #1976D2, #42A5F5)",
          color: "white",
          textAlign: "center",
          py: 10,
          px: 2,
          boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Welcome, Teacher!
        </Typography>
        <Typography variant="h5" paragraph>
          Empower your students with the best learning experience.
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#FFEB3B",
            color: "black",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#FBC02D" },
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
                  boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0px 10px 25px rgba(0,0,0,0.2)",
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {feature}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Experience a seamless and efficient workflow.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ textAlign: "center", py: 6, backgroundColor: "#F5F5F5" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Ready to get started?
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#1976D2",
            color: "white",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#1565C0" },
          }}
          size="large"
        >
          Sign Up Now
        </Button>
      </Box>
    </>
  );
};

export default TeacherPage;
