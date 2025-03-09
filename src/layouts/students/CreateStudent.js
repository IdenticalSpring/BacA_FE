import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, TextField, Button, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import studentService from "services/studentService";

function CreateStudent() {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    note: "",
  });

  const handleSave = async () => {
    try {
      await studentService.createStudent(studentData);
      navigate("/students"); // Quay lại danh sách sinh viên
    } catch (err) {
      alert("Create student failed");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card sx={{ padding: 3 }}>
              <MDTypography variant="h5" align="center" gutterBottom>
                Create New Student
              </MDTypography>
              <TextField
                label="Name"
                fullWidth
                margin="normal"
                value={studentData.name}
                onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={studentData.startDate}
                onChange={(e) => setStudentData({ ...studentData, startDate: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={studentData.endDate}
                onChange={(e) => setStudentData({ ...studentData, endDate: e.target.value })}
              />
              <TextField
                label="Note"
                fullWidth
                margin="normal"
                value={studentData.note}
                onChange={(e) => setStudentData({ ...studentData, note: e.target.value })}
              />
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button variant="text" onClick={() => navigate("/students")}>
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

export default CreateStudent;
