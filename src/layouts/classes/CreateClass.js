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
import { colors } from "assets/theme/color";
import DataTable from "examples/Tables/DataTable";

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
  const [dayOfWeekForCreate, setDayOfWeekForCreate] = useState(0);
  const [dayOfWeekForUpdate, setDayOfWeekForUpdate] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedulesForCreate, setSelectedSchedulesForCreate] = useState([]);
  const [selectedSchedulesForUpdate, setSelectedSchedulesForUpdate] = useState([]);
  const [levels, setLevels] = useState([]);
  const [classColumns] = useState([
    { Header: "Class Name", accessor: "name", width: "20%" },
    { Header: "Level", accessor: "level", width: "10%" },
    // { Header: "Start Date", accessor: "startDate", width: "20%" },
    // { Header: "End Date", accessor: "endDate", width: "20%" },
    { Header: "Teacher", accessor: "teacher", width: "20%" },
    // { Header: "Actions", accessor: "actions", width: "20%" },
  ]);
  const [scheduleColumns] = useState([
    { Header: "Day Of Week", accessor: "dayOfWeek", width: "30%" },
    { Header: "Start Time", accessor: "startTime", width: "30%" },
    { Header: "End Time", accessor: "endTime", width: "30%" },
    // { Header: "Actions", accessor: "actions", width: "20%" },
  ]);
  const [scheduleRows, setScheduleRows] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [classrows, setClassRows] = useState([]);
  const [loadingClass, setLoadingClass] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [errorClass, setErrorClass] = useState("");
  const [errorSchedule, setErrorSchedule] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
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
    fetchClasses();
    fetchLevels();
    fetchSchedules();
    // fetchSchedules();
  }, []);
  const fetchClasses = async () => {
    try {
      setLoadingClass(true);
      const data = await classService.getAllClasses();
      const formattedRows = data.map((cls) => ({
        id: cls.id,
        name: cls.name,
        level: cls.level,
        // startDate: cls.startDate,
        // endDate: cls.endDate,
        teacher: cls.teacher?.name || "N/A",
        // actions: (
        //   <>
        //     <IconButton color="primary" onClick={() => handleEdit(cls)}>
        //       <EditIcon />
        //     </IconButton>
        //     <IconButton color="secondary" onClick={() => handleDelete(cls.id)}>
        //       <DeleteIcon />
        //     </IconButton>
        //   </>
        // ),
      }));
      setClassRows(formattedRows);
    } catch (err) {
      setErrorClass("Lỗi khi tải dữ liệu lớp học!");
    } finally {
      setLoadingClass(false);
    }
  };
  useEffect(() => {
    fetchSchedulesByDayOfWeek(dayOfWeekForCreate);
  }, [dayOfWeekForCreate]);
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
      setLoadingSchedule(true);
      const data = await scheduleService.getAllSchedules();
      const formattedRows = data.map((schedule) => ({
        id: schedule.id,
        dayOfWeek: daysOfWeek[schedule.dayOfWeek],
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        // actions: (
        //   <>
        //     <IconButton color="primary" onClick={() => handleEdit(schedule)}>
        //       <EditIcon />
        //     </IconButton>
        //     <IconButton color="secondary" onClick={() => handleDelete(schedule.id)}>
        //       <DeleteIcon />
        //     </IconButton>
        //   </>
        // ),
      }));
      setScheduleRows(formattedRows);
    } catch (err) {
      setErrorSchedule("Lỗi khi tải dữ liệu lịch học!");
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleSaveClass = async () => {
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
        lessons: getDatesForSelectedSchedules(selectedSchedulesForCreate, classEntity),
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

    if (selectedSchedulesForCreate.some((sch) => classData.scheduleId === sch.scheduleId)) {
      return;
    }

    // Thêm schedule mới vào danh sách (tránh trùng lặp)
    setSelectedSchedulesForCreate((prev) => [
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
    setSelectedSchedulesForCreate((prev) => prev.filter((schedule) => schedule.scheduleId !== id));
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
  const [scheduleData, setScheduleData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const handleSaveSchedule = async () => {
    try {
      await scheduleService.createSchedule(scheduleData);
      // navigate("/schedules");
    } catch (err) {
      alert("Lỗi khi tạo lịch học!");
    }
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid
          container
          sx={{
            display: "flex",
            gap: "30px",
            justifyContent: "space-between", // Custom gap size
          }}
        >
          <Grid
            item
            xs={12}
            md={5.5}
            sx={{
              borderRadius: "20px",
              backgroundColor: colors.white,
              padding: "20px", // Add padding instead of margin
            }}
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
                  value={dayOfWeekForCreate}
                  onChange={(e) => {
                    setDayOfWeekForCreate(+e.target.value);
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
                <Button
                  variant="text"
                  style={{ height: "30px" }}
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={handleAddSchedule}
                >
                  Add
                </Button>
              </div>
              {selectedSchedulesForCreate.length > 0 && (
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
                      {selectedSchedulesForCreate.map((schedule, index) => (
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
                {/* <Button
                  variant="text"
                  sx={{ color: colors.midGreen, " &:hover": { color: colors.darkGreen } }}
                  onClick={() => navigate("/classes")}
                >
                  Cancel
                </Button> */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={handleSaveClass}
                >
                  Create
                </Button>
              </MDBox>
            </Card>
          </Grid>
          <Grid
            item
            xs={12}
            md={5.5}
            sx={{
              borderRadius: "20px",
              backgroundColor: colors.white,
              padding: "20px", // Add padding instead of margin
            }}
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
                value={scheduleData.dayOfWeek}
                onChange={(e) => {
                  setScheduleData({ ...scheduleData, dayOfWeek: e.target.value });
                }}
              >
                {daysOfWeek.map((d, index) => (
                  <MenuItem key={index} value={index}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                margin="normal"
                label="Start Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={scheduleData.startTime}
                onChange={(e) => setScheduleData({ ...scheduleData, startTime: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="End Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={scheduleData.endTime}
                onChange={(e) => setScheduleData({ ...scheduleData, endTime: e.target.value })}
              />
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                {/* <Button
                  variant="text"
                  sx={{ color: colors.midGreen, " &:hover": { color: colors.darkGreen } }}
                  onClick={() => navigate("/schedules")}
                >
                  Cancel
                </Button> */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={handleSaveSchedule}
                >
                  Create
                </Button>
              </MDBox>
            </Card>
          </Grid>
          <Grid
            item
            xs={12}
            md={5.5}
            sx={{
              borderRadius: "20px",
              backgroundColor: colors.white,
              padding: "20px", // Add padding instead of margin
            }}
          >
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
                  Class Tables
                </MDTypography>
                {/* <Button variant="contained" color="success" onClick={() => setOpen(true)}>
                            Create
                          </Button> */}
                {/* <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={() => navigate("/classes/create-class")}
                >
                  Create
                </Button> */}
              </MDBox>
              <MDBox pt={3}>
                {loadingClass ? (
                  <MDTypography variant="h6" color="info" align="center">
                    Loading...
                  </MDTypography>
                ) : errorClass ? (
                  <MDTypography variant="h6" color="error" align="center">
                    {errorClass}
                  </MDTypography>
                ) : (
                  <DataTable
                    table={{ columns: classColumns, rows: classrows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
          <Grid
            item
            xs={12}
            md={5.5}
            sx={{
              borderRadius: "20px",
              backgroundColor: colors.white,
              padding: "20px", // Add padding instead of margin
            }}
          >
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
                  Schedule Tables
                </MDTypography>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={() => navigate("/schedules/create-schedule")}
                >
                  Create
                </Button>
              </MDBox>
              <MDBox pt={3}>
                {loadingSchedule ? (
                  <MDTypography variant="h6" color="info" align="center">
                    Loading...
                  </MDTypography>
                ) : errorSchedule ? (
                  <MDTypography variant="h6" color="error" align="center">
                    {errorSchedule}
                  </MDTypography>
                ) : (
                  <DataTable
                    table={{ columns: scheduleColumns, rows: scheduleRows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
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
