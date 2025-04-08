import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MenuItem from "@mui/material/MenuItem";
import DataTable from "examples/Tables/DataTable";
import classService from "services/classService";
import teacherService from "services/teacherService";
import scheduleService from "services/scheduleService";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
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
function Classes() {
  const navigate = useNavigate();

  const [columns] = useState([
    { Header: "Class Name", accessor: "name", width: "20%" },
    { Header: "Level", accessor: "level", width: "10%" },
    // { Header: "Start Date", accessor: "startDate", width: "20%" },
    // { Header: "End Date", accessor: "endDate", width: "20%" },
    { Header: "Teacher", accessor: "teacher", width: "20%" },
    // { Header: "Actions", accessor: "actions", width: "20%" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [classData, setClassData] = useState({
    className: "",
    level: "",
    // startTime: "",
    // endTime: "",
    teacherID: "",
    scheduleId: "",
  });
  const [dayOfWeek, setDayOfWeek] = useState(0);
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
    fetchClasses();
    fetchTeachers();
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
  const fetchClasses = async () => {
    try {
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
      setRows(formattedRows);
    } catch (err) {
      setError("Lỗi khi tải dữ liệu lớp học!");
    } finally {
      setLoading(false);
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

  const handleEdit = (cls) => {
    setEditMode(true);
    setSelectedClass(cls);
    setClassData({
      name: cls.name,
      level: cls.level,
      // startDate: cls.startDate,
      // endDate: cls.endDate,
      teacherID: cls.teacher?.id || "",
      scheduleId: cls.schedule?.id || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
      try {
        await classService.deleteClass(id);
        setRows(rows.filter((row) => row.id !== id));
      } catch (err) {
        alert("Lỗi khi xóa lớp học!");
      }
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
  // const handleSave = async () => {
  //   try {
  //     if (editMode) {
  //       await classService.editClass(selectedClass.id, classData);
  //       setRows(rows.map((row) => (row.id === selectedClass.id ? { ...row, ...classData } : row)));
  //     } else {
  //       const createdClass = await classService.createClass(classData);
  //       setRows([
  //         ...rows,
  //         {
  //           id: createdClass.id,
  //           className: createdClass.className,
  //           startTime: createdClass.startTime,
  //           endTime: createdClass.endTime,
  //           actions: (
  //             <>
  //               <IconButton color="primary" onClick={() => handleEdit(createdClass)}>
  //                 <EditIcon />
  //               </IconButton>
  //               <IconButton color="secondary" onClick={() => handleDelete(createdClass.id)}>
  //                 <DeleteIcon />
  //               </IconButton>
  //             </>
  //           ),
  //         },
  //       ]);
  //     }

  //     setOpen(false);
  //     setClassData({ name: "", startDate: "", endDate: "" });
  //     setEditMode(false);
  //   } catch (err) {
  //     alert(editMode ? "Lỗi khi chỉnh sửa lớp học!" : "Lỗi khi tạo lớp học!");
  //   }
  // };

  const handleSave = async () => {
    try {
      const payload = {
        name: classData.name,
        level: classData.level,
        // startDate: classData.startDate,
        // endDate: classData.endDate,
        teacherID: classData.teacherID, // Chỉ gửi teacherId
        scheduleId: classData.scheduleId, // Chỉ gửi scheduleId
      };

      if (editMode) {
        await classService.editClass(selectedClass.id, payload);
        setRows(rows.map((row) => (row.id === selectedClass.id ? { ...row, ...payload } : row)));
      } else {
        const createdClass = await classService.createClass(payload);
        setRows([
          ...rows,
          {
            id: createdClass.id,
            name: createdClass.name,
            level: createdClass.level,
            // startDate: createdClass.startDate,
            // endDate: createdClass.endDate,
            teacher: teachers.find((t) => t.id === createdClass.teacherID),
            date: schedules.find((s) => s.id === createdClass.scheduleId),
            // actions: (
            //   <>
            //     <IconButton color="primary" onClick={() => handleEdit(createdClass)}>
            //       <EditIcon />
            //     </IconButton>
            //     <IconButton color="secondary" onClick={() => handleDelete(createdClass.id)}>
            //       <DeleteIcon />
            //     </IconButton>
            //   </>
            // ),
          },
        ]);
      }

      setOpen(false);
      setClassData({
        name: "",
        level: "",
        // startDate: "",
        // endDate: "",
        teacherId: "",
        scheduleId: "",
      });
      setEditMode(false);
    } catch (err) {
      alert(editMode ? "Lỗi khi chỉnh sửa lớp học!" : "Lỗi khi tạo lớp học!");
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
                  Class Tables
                </MDTypography>
                {/* <Button variant="contained" color="success" onClick={() => setOpen(true)}>
                  Create
                </Button> */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={() => navigate("/classes/create-class")}
                >
                  Create
                </Button>
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
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={5}
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
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editMode ? "Edit Class" : "Create"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Class Name"
            fullWidth
            margin="normal"
            value={classData.name}
            onChange={(e) => setClassData({ ...classData, name: e.target.value })}
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
            value={classData.level}
            onChange={(e) => {
              setClassData({ ...classData, level: e.target.value });
              // console.log(e.target.value, +e.target.value);
            }}
          >
            {levels.map((d, index) => (
              <MenuItem key={index} value={d}>
                {d}
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
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            sx={{ color: colors.midGreen, " &:hover": { color: colors.darkGreen } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            sx={{
              backgroundColor: colors.midGreen,
              color: colors.white,
              " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
            }}
          >
            {editMode ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Classes;
