import { useEffect, useState } from "react";
import { Grid, Card, MenuItem, FormControl, TextField } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import classService from "services/classService";
import lessonService from "services/lessonService";
import lessonByScheduleService from "services/lessonByScheduleService";
import { colors } from "assets/theme/color";
const daysOfWeek = [
  "Choose day of week",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
function LessonBySchedules() {
  const [classes, setClasses] = useState([]); // Danh sách lớp học
  const [selectedClass, setSelectedClass] = useState(0); // Lớp học được chọn
  const [lessonByScheduleData, setLessonByScheduleData] = useState([]); // Danh sách lesson_by_schedule
  // const [schedules, setSchedules] = useState([]); // Danh sách schedules
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lessonsData, setLessonsData] = useState([]);
  useEffect(() => {
    fetchClasses(); // Lấy danh sách lớp học khi component mount
    // fetchSchedules(); // Lấy danh sách schedules
  }, []);
  useEffect(() => {
    fetchLessonByScheduleAndLessonByLevel(); // Lấy danh sách lesson_by_schedule của lớp học khi selectedClass thay đổi
    console.log(lessonByScheduleData);
  }, [selectedClass]);
  // Gọi API lấy danh sách lớp học
  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      setClasses(data);
    } catch (err) {
      setError("Lỗi khi tải dữ liệu lớp học!");
    } finally {
      setLoading(false);
    }
  };
  const fetchLessonByScheduleAndLessonByLevel = async () => {
    try {
      const data = await lessonByScheduleService.getAllLessonBySchedulesOfClass(selectedClass);
      setLessonByScheduleData(data);
      const classData = classes.find((c) => c.id === selectedClass);
      if (classData) {
        const lessons = await lessonService.getLessonByLevel(classData.level);
        setLessonsData(lessons);
      }
    } catch (err) {
      setError("Lỗi khi tải dữ liệu lesson_by_schedule!");
    } finally {
      setLoading(false);
    }
  };
  // Gọi API lấy danh sách schedules
  // const fetchSchedules = async () => {
  //   try {
  //     const data = await scheduleService.getAllSchedules();
  //     setSchedules(data);
  //   } catch (err) {
  //     console.error("Lỗi khi lấy danh sách schedules!", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // console.log(lessonByScheduleData);
  const handleUpdateLessonBySchedule = async (id, lessonByScheduleData) => {
    try {
      await lessonByScheduleService.updateLessonBySchedule(id, lessonByScheduleData);
      // alert("Cập nhật lesson_by_schedule thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật lesson_by_schedule!");
    }
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                borderRadius="lg"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ backgroundColor: colors.deepGreen, color: colors.white }}
              >
                <MDTypography variant="h6" color="white">
                  Lesson By Schedule
                </MDTypography>
                {/* <Button variant="contained" color="success" onClick={() => setOpen(true)}>
                        Create
                      </Button> */}
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDTypography variant="h6" color="info" align="center">
                    Loading...
                  </MDTypography>
                ) : error ? (
                  <MDTypography variant="h6" color="error" align="center">
                    {error}
                  </MDTypography>
                ) : (
                  <TextField
                    select
                    label="Class"
                    style={{ width: "50%", margin: "20px" }}
                    InputProps={{
                      sx: {
                        minHeight: "48px",
                        display: "flex",
                        alignItems: "center",
                      },
                    }}
                    margin="normal"
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(+e.target.value);
                      // console.log(e.target.value, +e.target.value);
                    }}
                  >
                    <MenuItem key={0} value={0}>
                      choose class
                    </MenuItem>
                    {classes.map((c, index) => (
                      <MenuItem key={index} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </MDBox>
              {lessonByScheduleData.length > 0 && (
                <MDBox px={3} py={2}>
                  {lessonByScheduleData.map((item, index) => (
                    <MDBox
                      key={index}
                      p={1}
                      mb={1}
                      border="1px solid #ddd"
                      borderRadius="8px"
                      bgcolor="#f9f9f9"
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      {/* Thông tin lịch học */}
                      <MDTypography
                        variant="body1"
                        sx={{
                          width: "48%",
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        📅 {daysOfWeek[item.schedule.dayOfWeek]} | {item.date} | 🕒{" "}
                        {item.schedule.startTime} - {item.schedule.endTime}
                      </MDTypography>
                      {/* Dropdown chọn Lesson */}
                      <FormControl sx={{ width: "48%" }}>
                        <TextField
                          select
                          label="Lesson"
                          margin="normal"
                          InputProps={{
                            sx: {
                              minHeight: "48px",
                              display: "flex",
                              alignItems: "center",
                            },
                          }}
                          value={
                            lessonsData.some((lesson) => lesson.id === item.lessonID)
                              ? item.lessonID
                              : ""
                          }
                          onChange={(e) => {
                            const newData = [...lessonByScheduleData];
                            newData[index] = { ...newData[index], lessonID: e.target.value };
                            setLessonByScheduleData(newData);
                            handleUpdateLessonBySchedule(item.id, { lessonID: e.target.value });
                          }}
                        >
                          {lessonsData.map((lesson) => (
                            <MenuItem key={lesson.id} value={lesson.id}>
                              {lesson.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </FormControl>
                    </MDBox>
                  ))}
                </MDBox>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default LessonBySchedules;
