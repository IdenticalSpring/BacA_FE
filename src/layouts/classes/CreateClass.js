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
function CreateClass() {
  const navigate = useNavigate();
  const [classData, setClassData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    teacherId: "",
    scheduleId: "",
  });
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
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
    fetchSchedules();
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
        startDate: classData.startDate,
        endDate: classData.endDate,
        teacherId: classData.teacherId,
        scheduleId: classData.scheduleId,
      };

      await classService.createClass(payload);
      navigate("/classes"); // Quay lại trang danh sách lớp
    } catch (err) {
      alert("Create class failed!");
    }
  };

  const handleAddSchedule = () => {
    if (!classData.scheduleId) return;

    const selectedSchedule = schedules.find((sch) => sch.id === classData.scheduleId);
    if (!selectedSchedule) return;

    // Thêm schedule mới vào danh sách (tránh trùng lặp)
    setSelectedSchedules((prev) => [
      ...prev,
      {
        id: selectedSchedule.id,
        day: daysOfWeek[selectedSchedule.dayOfWeek],
        time: `${selectedSchedule.startTime} - ${selectedSchedule.endTime}`,
      },
    ]);
  };
  const handleRemoveSchedule = (id) => {
    setSelectedSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
  };
  console.log(classData);

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
              />
              <TextField
                select
                label="Teacher"
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
                value={classData.teacherId}
                onChange={(e) => setClassData({ ...classData, teacherId: e.target.value })}
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
                  sx={{
                    "& .css-1cohrqd-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select":
                      {
                        minHeight: "48px", // Đặt lại chiều cao tối thiểu
                        display: "flex",
                        alignItems: "center",
                      },
                  }}
                  margin="normal"
                  value={dayOfWeek}
                  onChange={(e) => {
                    setDayOfWeek(+e.target.value);
                    console.log(e.target.value, +e.target.value);
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
                  sx={{
                    "& .css-1cohrqd-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select":
                      {
                        minHeight: "48px", // Đặt lại chiều cao tối thiểu
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
                          <TableCell>{schedule.time}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleRemoveSchedule(schedule.id)}>
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
