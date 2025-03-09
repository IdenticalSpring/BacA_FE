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
        <Grid container justifyContent="flex-start">
          <Grid item xs={12} md={6} sx={{ marginLeft: "20px" }}>
            <Card
              sx={{
                padding: 3,
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Màu nền trong suốt nhẹ
                backdropFilter: "blur(10px)", // Hiệu ứng kính mờ
                boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)", // Đổ bóng nhẹ
                borderRadius: "12px", // Bo góc
                border: "1px solid rgba(255, 255, 255, 0.3)", // Viền nhẹ
              }}
            >
              {" "}
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
