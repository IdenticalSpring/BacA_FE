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

function Classes() {
  const [columns] = useState([
    { Header: "Class Name", accessor: "name", width: "20%" },
    { Header: "Start Date", accessor: "startDate", width: "20%" },
    { Header: "End Date", accessor: "endDate", width: "20%" },
    { Header: "Teacher", accessor: "teacher", width: "20%" },
    { Header: "Date", accessor: "date", width: "20%" },
    { Header: "Start Time", accessor: "startTime", width: "20%" },
    { Header: "End Time", accessor: "endTime", width: "20%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [classData, setClassData] = useState({ className: "", startTime: "", endTime: "" });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchSchedules();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      const formattedRows = data.map((cls) => ({
        id: cls.id,
        name: cls.name,
        startDate: cls.startDate,
        endDate: cls.endDate,
        teacher: cls.teacher?.name || "N/A",
        date: cls.schedule?.date || "N/A",
        startTime: cls.schedule?.startTime || "N/A",
        endTime: cls.schedule?.endTime || "N/A",
        actions: (
          <>
            <IconButton color="primary" onClick={() => handleEdit(cls)}>
              <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => handleDelete(cls.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
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
      startDate: cls.startDate,
      endDate: cls.endDate,
      teacherId: cls.teacher?.id || "",
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
        startDate: classData.startDate,
        endDate: classData.endDate,
        teacherId: classData.teacherId, // Chỉ gửi teacherId
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
            startDate: createdClass.startDate,
            endDate: createdClass.endDate,
            teacher: teachers.find((t) => t.id === createdClass.teacherId),
            date: schedules.find((s) => s.id === createdClass.scheduleId),
            actions: (
              <>
                <IconButton color="primary" onClick={() => handleEdit(createdClass)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleDelete(createdClass.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            ),
          },
        ]);
      }

      setOpen(false);
      setClassData({ name: "", startDate: "", endDate: "", teacherId: "", scheduleId: "" });
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
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Class Tables
                </MDTypography>
                <Button variant="contained" color="success" onClick={() => setOpen(true)}>
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
            // label="Start Date"
            fullWidth
            margin="normal"
            type="date"
            value={classData.startDate}
            onChange={(e) => setClassData({ ...classData, startDate: e.target.value })}
          />
          <TextField
            // label="End Date"
            fullWidth
            margin="normal"
            type="date"
            value={classData.endDate}
            onChange={(e) => setClassData({ ...classData, endDate: e.target.value })}
          />
        </DialogContent>
        <TextField
          select
          label="Teacher"
          fullWidth
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
        <TextField
          select
          label="Schedule"
          fullWidth
          margin="normal"
          value={classData.scheduleId}
          onChange={(e) => setClassData({ ...classData, scheduleId: e.target.value })}
        >
          {schedules.map((schedule) => (
            <MenuItem key={schedule.id} value={schedule.id}>
              {schedule.date} - {schedule.startTime} to {schedule.endTime}
            </MenuItem>
          ))}
        </TextField>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} color="primary">
            {editMode ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Classes;
