import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import scheduleService from "services/scheduleService";
import classService from "services/classService";
import lessonService from "services/lessonService";

function LessonBySchedules() {
  const [classes, setClasses] = useState([]); // Danh sách lớp học
  const [selectedClass, setSelectedClass] = useState(""); // Lớp học được chọn
  const [lessons, setLessons] = useState([]); // Danh sách lesson_by_schedule
  const [schedules, setSchedules] = useState([]); // Danh sách schedules

  useEffect(() => {
    fetchClasses(); // Lấy danh sách lớp học khi component mount
    fetchSchedules(); // Lấy danh sách schedules
  }, []);

  // Gọi API lấy danh sách lớp học
  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      setClasses(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách lớp học!", err);
    }
  };

  // Gọi API lấy danh sách schedules
  const fetchSchedules = async () => {
    try {
      const data = await scheduleService.getAllSchedules();
      setSchedules(data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách schedules!", err);
    }
  };

  // Khi chọn một lớp, gọi API lấy danh sách lesson_by_schedule của lớp đó
  const handleClassChange = async (event) => {
    const classId = event.target.value;
    setSelectedClass(classId);
    if (!classId) return;

    try {
      const lessonData = await lessonService.getLessonsByClass(classId);
      setLessons(lessonData);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách lesson_by_schedule!", err);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* Select Box chọn lớp học */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Chọn lớp học</InputLabel>
              <Select value={selectedClass} onChange={handleClassChange}>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Danh sách lesson_by_schedule */}
          {lessons.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <MDBox pt={3} px={2}>
                  <MDTypography variant="h6">Lessons by Schedule</MDTypography>
                </MDBox>
                <MDBox p={2}>
                  {lessons.map((lesson, index) => (
                    <Grid container key={lesson.id} spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      {/* Select Box chọn schedule */}
                      <Grid item xs={5}>
                        <FormControl fullWidth>
                          <InputLabel>Chọn lịch học</InputLabel>
                          <Select
                            value={lesson.scheduleId || ""}
                            onChange={(e) => {
                              const newLessons = [...lessons];
                              newLessons[index].scheduleId = e.target.value;
                              setLessons(newLessons);
                            }}
                          >
                            {schedules.map((schedule) => (
                              <MenuItem key={schedule.id} value={schedule.id}>
                                {schedule.dayOfWeek} ({schedule.startTime} - {schedule.endTime})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Hiển thị tên Schedule */}
                      <Grid item xs={5}>
                        <MDTypography variant="body1">{lesson.scheduleName}</MDTypography>
                      </Grid>

                      {/* Nút Edit & Delete */}
                      <Grid item xs={2}>
                        <IconButton color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton color="secondary">
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                </MDBox>
              </Card>
            </Grid>
          )}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default LessonBySchedules;
