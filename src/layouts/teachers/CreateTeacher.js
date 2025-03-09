import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, TextField, Button, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import teacherService from "services/teacherService";

function CreateTeacher() {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState({
    name: "",
    username: "",
    password: "",
    level: "",
    startDate: "",
    endDate: "",
  });

  const handleSave = async () => {
    try {
      await teacherService.createTeacher(teacherData);
      navigate("/teachers"); // Quay lại danh sách giáo viên
    } catch (err) {
      alert("Create teacher failed");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="flex-start">
          <Grid item xs={12} md={6} sx={{ marginLeft: "20px" }}>
            <Card sx={{ padding: 3, backgroundColor: "#f0f2f5", boxShadow: "none" }}>
              <TextField
                label="Name"
                fullWidth
                margin="normal"
                value={teacherData.name}
                onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
              />
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={teacherData.username}
                onChange={(e) => setTeacherData({ ...teacherData, username: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={teacherData.password}
                onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })}
              />
              <TextField
                label="Level"
                fullWidth
                margin="normal"
                value={teacherData.level}
                onChange={(e) => setTeacherData({ ...teacherData, level: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={teacherData.startDate}
                onChange={(e) => setTeacherData({ ...teacherData, startDate: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={teacherData.endDate}
                onChange={(e) => setTeacherData({ ...teacherData, endDate: e.target.value })}
              />
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button variant="text" onClick={() => navigate("/teachers")}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSave}>
                  Create
                </Button>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CreateTeacher;
