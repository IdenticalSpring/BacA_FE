import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  TextField,
  MenuItem,
  Button,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import classService from "services/classService";
import teacherService from "services/teacherService";
import scheduleService from "services/scheduleService";
import DeleteIcon from "@mui/icons-material/Delete";
import lessonByScheduleService from "services/lessonByScheduleService";
import levelService from "services/levelService";
function CreateClass() {
  const navigate = useNavigate();
  const [classData, setClassData] = useState({
    name: "",
    level: "",
    // startDate: "",
    // endDate: "",
    teacherID: "",
    scheduleId: "",
  });
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [levels, setLevels] = useState([]);
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
  useEffect(() => {
    fetchTeachers();
    fetchLevels();
    // fetchSchedules();
  }, []);
  useEffect(() => {
    fetchSchedulesByDayOfWeek(dayOfWeek);
  }, [dayOfWeek]);
  const fetchSchedulesByDayOfWeek = async (dayOfWeek) => {
    try {
      const data = await scheduleService.getScheduleByDayOfWeek({ dayOfWeek: dayOfWeek });
      setSchedules(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lịch học theo ngày trong tuần");
    }
  };
  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách giáo viên");
    }
  };
  const fetchLevels = async () => {
    try {
      const data = await levelService.getAllLevels();
      setLevels(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách level:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const data = await scheduleService.getAllSchedules();
      setSchedules(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lịch học");
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: classData.name,
        level: classData.level,
        // startDate: classData.startDate,
        // endDate: classData.endDate,
        teacherID: classData.teacherID,
      };

      const classEntity = await classService.createClass(payload);
      const dataForLessonBySchedule = {
        lessons: getDatesForSelectedSchedules(selectedSchedules, classEntity),
      };
      console.log(dataForLessonBySchedule);

      await lessonByScheduleService.createLessonBySchedule(dataForLessonBySchedule);
      navigate("/classes"); // Quay lại trang danh sách lớp
    } catch (err) {
      alert("Create class failed!");
    }
  };

  const handleAddSchedule = () => {
    if (!classData.scheduleId) return;
    const selectedSchedule = schedules.find((sch) => sch.id === classData.scheduleId);
    if (!selectedSchedule) return;

    if (selectedSchedules.some((sch) => classData.scheduleId === sch.scheduleId)) {
      return;
    }

    // Thêm schedule mới vào danh sách (tránh trùng lặp)
    setSelectedSchedules((prev) => [
      ...prev,
      {
        scheduleId: selectedSchedule.id,
        day: daysOfWeek[selectedSchedule.dayOfWeek],
        startTime: selectedSchedule.startTime,
        endTime: selectedSchedule.endTime,
      },
    ]);
  };
  const handleRemoveSchedule = (id) => {
    setSelectedSchedules((prev) => prev.filter((schedule) => schedule.scheduleId !== id));
  };
  const getDatesForSelectedSchedules = (selectedSchedules, classEntity) => {
    const resultDates = [];
    let currentDate = new Date(); // Ngày bắt đầu từ hôm nay
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6); // 6 tháng sau
    // console.log(
    //   `📅 Ngày hiện tại: ${currentDate.toISOString().split("T")[0]} (Thứ: ${currentDate.getDay()})`
    // );
    while (currentDate <= endDate) {
      selectedSchedules.forEach((schedule) => {
        if (currentDate.getDay() === daysOfWeek.indexOf(schedule.day) - 1) {
          // console.log(
          //   daysOfWeek.indexOf(schedule.day) - 1,
          //   currentDate.getDay(),
          //   currentDate.getDate()
          // );

          resultDates.push({
            classID: classEntity.id,
            scheduleID: schedule.scheduleId,
            lessonID: null,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            date: currentDate.toISOString().split("T")[0], // Format YYYY-MM-DD
          });
        }
      });

      currentDate.setDate(currentDate.getDate() + 1); // Tăng ngày lên 1
    }

    return resultDates;
  };
  // console.log(getDatesForSelectedSchedules(selectedSchedules, classData));

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
              <TextField
                label="Class Name"
                fullWidth
                margin="normal"
                value={classData.name}
                onChange={(e) => setClassData({ ...classData, name: e.target.value })}
              />
              <TextField
                select
                label="Level"
                fullWidth
                sx={{
                  "& .css-1cohrqd-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select":
                    {
                      minHeight: "48px", // Đặt lại chiều cao tối thiểu
                      display: "flex",
                      alignItems: "center",
                    },
                }}
                InputProps={{
                  sx: {
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                margin="normal"
                value={classData.level}
                onChange={(e) => {
                  setClassData({ ...classData, level: e.target.value });
                  // console.log(e.target.value, +e.target.value);
                }}
              >
                {levels.map((d, index) => (
                  <MenuItem key={index} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
              {/* <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={classData.startDate}
                onChange={(e) => setClassData({ ...classData, startDate: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={classData.endDate}
                onChange={(e) => setClassData({ ...classData, endDate: e.target.value })}
              /> */}
              <TextField
                select
                label="Teacher"
                fullWidth
                InputProps={{
                  sx: {
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                margin="normal"
                value={classData.teacherID}
                onChange={(e) => setClassData({ ...classData, teacherID: e.target.value })}
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </TextField>
              <div style={{ width: "100%", display: "flex", gap: "10px", alignItems: "center" }}>
                <TextField
                  select
                  label="Day of Week"
                  fullWidth
                  InputProps={{
                    sx: {
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                  margin="normal"
                  value={dayOfWeek}
                  onChange={(e) => {
                    setDayOfWeek(+e.target.value);
                    // console.log(e.target.value, +e.target.value);
                  }}
                >
                  {daysOfWeek.map((d, index) => (
                    <MenuItem key={index} value={index}>
                      {d}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Schedule"
                  fullWidth
                  InputProps={{
                    sx: {
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                  margin="normal"
                  value={classData.scheduleId}
                  onChange={(e) => setClassData({ ...classData, scheduleId: e.target.value })}
                >
                  {schedules.map((schedule) => (
                    <MenuItem key={schedule.id} value={schedule.id}>
                      {daysOfWeek[schedule.dayOfWeek]} - {schedule.startTime} to {schedule.endTime}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="text" style={{ height: "30px" }} onClick={handleAddSchedule}>
                  Add
                </Button>
              </div>
              {selectedSchedules.length > 0 && (
                <TableContainer component={Paper} sx={{ marginTop: 2, width: "100%" }}>
                  <Table>
                    <TableHead style={{ display: "table-header-group" }}>
                      <TableRow>
                        <TableCell>Day</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedSchedules.map((schedule, index) => (
                        <TableRow key={index}>
                          <TableCell>{schedule.day}</TableCell>
                          <TableCell>
                            {schedule.startTime} - {schedule.endTime}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => {
                                console.log(schedule.scheduleId);
                                handleRemoveSchedule(schedule.scheduleId);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button variant="text" onClick={() => navigate("/classes")}>
                  Cancel
                </Button>
                <Button variant="contained" style={{ color: "white" }} onClick={handleSave}>
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

export default CreateClass;
