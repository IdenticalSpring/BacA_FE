import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, TextField, Button, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import teacherService from "services/teacherService";
import { colors } from "assets/theme/color";

function CreateTeacher() {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState({
    name: "",
    username: "",
    password: "",
    startDate: "",
    linkDrive: "",
    endDate: "",
  });
  const [files, setFiles] = useState([]); // Thay đổi từ file thành files để lưu mảng

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files)); // Chuyển danh sách files thành mảng
  };

  const handleSave = async () => {
    try {
      // Gửi teacherData và mảng files lên server
      await teacherService.createTeacher(teacherData, files);
      navigate("/teachers"); // Quay lại danh sách giáo viên
    } catch (err) {
      alert("Create teacher failed");
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="flex-start">
          <Grid
            item
            xs={12}
            md={6}
            sx={{ marginLeft: "20px", borderRadius: "20px", backgroundColor: colors.white }}
          >
            <Card
              sx={{
                padding: 3,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
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
              <TextField
                label="Link Drive"
                fullWidth
                margin="normal"
                value={teacherData.linkDrive}
                onChange={(e) => setTeacherData({ ...teacherData, linkDrive: e.target.value })}
              />
              {/* Trường upload file với hỗ trợ nhiều file */}
              <TextField
                fullWidth
                margin="normal"
                type="file"
                label="Upload Files"
                InputLabelProps={{ shrink: true }}
                inputProps={{ accept: "image/*, .pdf", multiple: true }} // Thêm multiple để chọn nhiều file
                onChange={handleFileChange}
              />
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="text"
                  sx={{ color: colors.midGreen, " &:hover": { color: colors.darkGreen } }}
                  onClick={() => navigate("/teachers")}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen },
                  }}
                  onClick={handleSave}
                >
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
