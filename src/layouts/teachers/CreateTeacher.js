import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, TextField, Button, Grid, MenuItem } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import teacherService from "services/teacherService";
import { colors } from "assets/theme/color";
const levels = [
  "Level Pre-1",
  "Level 1",
  "Starters",
  "Level-KET",
  "Movers",
  "Flyers",
  "Pre-KET",
  "level-PET",
];
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
          <Grid
            item
            xs={12}
            md={6}
            sx={{ marginLeft: "20px", borderRadius: "20px", backgroundColor: colors.white }}
          >
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
                value={teacherData.name}
                onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
              />
              <TextField
                select
                label="level"
                fullWidth
                sx={{
                  "& .css-1cohrqd-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select":
                    {
                      minHeight: "48px", // Đặt lại chiều cao tối thiểu
                      display: "flex",
                      alignItems: "center",
                    },
                }}
                margin="normal"
                value={teacherData.level}
                onChange={(e) => {
                  setTeacherData({ ...teacherData, level: e.target.value });
                  // console.log(e.target.value, +e.target.value);
                }}
              >
                {levels.map((d, index) => (
                  <MenuItem key={index} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
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
