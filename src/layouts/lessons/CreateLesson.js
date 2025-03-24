import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, TextField, Button, Grid, MenuItem } from "@mui/material";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import lessonService from "services/lessonService";
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
function CreateLesson() {
  const navigate = useNavigate();
  const [lessonData, setLessonData] = useState({ name: "", level: "", link: "", description: "" });

  const handleSave = async () => {
    try {
      await lessonService.createLesson(lessonData);
      navigate("/lessons");
    } catch (err) {
      alert("Lỗi khi tạo lịch học!");
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
                label="Lesson Name"
                fullWidth
                margin="normal"
                value={lessonData.name}
                onChange={(e) => setLessonData({ ...lessonData, name: e.target.value })}
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
                value={lessonData.level}
                onChange={(e) => {
                  setLessonData({ ...lessonData, level: e.target.value });
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
                label="Lesson Link"
                fullWidth
                margin="normal"
                value={lessonData.link}
                onChange={(e) => setLessonData({ ...lessonData, link: e.target.value })}
              />
              <TextField
                label="Lesson Description"
                fullWidth
                margin="normal"
                value={lessonData.description}
                onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
              />
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="text"
                  sx={{ color: colors.midGreen, " &:hover": { color: colors.darkGreen } }}
                  onClick={() => navigate("/lessons")}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
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

export default CreateLesson;
