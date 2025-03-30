import { useEffect, useState, useRef } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
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
import DataTable from "examples/Tables/DataTable";
import studentService from "services/studentService";
import { useNavigate } from "react-router-dom";
import { MenuItem, Box, Typography, CircularProgress } from "@mui/material";
import { colors } from "assets/theme/color";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import classService from "services/classService";
import levelService from "services/levelService";

function Students() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [levels, setLevels] = useState([]);
  const [columns, setColumns] = useState([
    { Header: "Name", accessor: "name", width: "20%" },
    { Header: "Year of Birth", accessor: "yearOfBirth", width: "10%" },
    { Header: "Level", accessor: "level", width: "15%" },
    { Header: "Schedule", accessor: "note", width: "15%" },
    { Header: "Phone", accessor: "phone", width: "15%" },
    { Header: "Avatar", accessor: "avatar", width: "10%" },
    { Header: "Start Date", accessor: "startDate", width: "10%" },
    { Header: "End Date", accessor: "endDate", width: "10%" },
    { Header: "Actions", accessor: "actions", width: "10%" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [classSchedules, setClassSchedules] = useState([]);
  const [studentData, setStudentData] = useState({
    name: "",
    level: "",
    yearOfBirth: "",
    phone: "",
    classID: "",
    imgUrl: "",
    startDate: "",
    endDate: "",
    note: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch levels trước
        const levelData = await levelService.getAllLevels();
        setLevels(levelData);

        // Sau đó fetch students và class schedules
        await fetchStudents();
        await fetchClassSchedules();
      } catch (error) {
        console.error("Failed to fetch data", error);
        setError("Error fetching initial data!");
      }
    };

    fetchData();
  }, []);

  const fetchClassSchedules = async () => {
    try {
      const schedules = await classService.getAllClassSchedule();
      setClassSchedules(schedules);
    } catch (error) {
      console.error("Failed to fetch class schedules", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      const formattedRows = data.map((student) => ({
        id: student.id,
        name: student.name,
        level: student.level, // Hiển thị tên level trong cột
        yearOfBirth: student.yearOfBirth,
        phone: student.phone,
        avatar: (
          <Box display="flex" justifyContent="center">
            <Avatar
              src={student.imgUrl}
              alt={student.name}
              sx={{
                width: 50,
                height: 50,
                border: `1px solid ${colors.lightGrey}`,
              }}
            >
              {student.name.charAt(0)}
            </Avatar>
          </Box>
        ),
        imgUrl: student.imgUrl,
        startDate: student.startDate,
        endDate: student.endDate,
        note: formatSchedule(student),
        rawLevel: student.level, // Lưu giá trị thô để dùng trong edit
        actions: (
          <>
            <IconButton
              sx={{
                backgroundColor: colors.midGreen,
                color: colors.white,
                "&:hover": { backgroundColor: colors.highlightGreen },
              }}
              onClick={() => handleEdit(student)}
            >
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleDelete(student.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
      }));
      setRows(formattedRows);
    } catch (err) {
      setError("Error fetching students!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatSchedule = (student) => {
    let scheduleInfo = "";
    if (student.class && student.class.name) {
      scheduleInfo += `Class: ${student.class.name}`;
    }
    if (student.schedule) {
      const { startTime, endTime, dayOfWeek } = student.schedule;
      const dayNames = ["", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
      const dayName = dayNames[dayOfWeek] || "";
      if (scheduleInfo) scheduleInfo += "\n";
      scheduleInfo += `${dayName}: ${startTime?.substring(0, 5)} - ${endTime?.substring(0, 5)}`;
    }
    return scheduleInfo || "N/A";
  };

  const handleEdit = (student) => {
    setEditMode(true);
    setSelectedStudent(student);
    setStudentData({
      name: student.name,
      username: student.username || "",
      password: student.password || "",
      yearOfBirth: student.yearOfBirth,
      phone: student.phone,
      imgUrl: student.imgUrl,
      classID: student.classID,
      level: student.rawLevel, // Sử dụng rawLevel để giữ giá trị gốc
      startDate: student.startDate,
      endDate: student.endDate,
      note: student.note,
    });
    setPreviewImage(student.imgUrl);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await studentService.deleteStudent(id);
        setRows(rows.filter((row) => row.id !== id));
      } catch (err) {
        alert("Error deleting student!");
        console.error(err);
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
        setStudentData((prev) => ({ ...prev, file }));
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      const dataToSubmit = {
        name: studentData.name,
        username: studentData.username,
        password: studentData.password,
        yearOfBirth: studentData.yearOfBirth,
        classID: studentData.classID,
        phone: studentData.phone,
        level: studentData.level,
        startDate: studentData.startDate,
        endDate: studentData.endDate,
        note: studentData.note,
      };

      if (editMode && selectedStudent) {
        const updatedStudent = await studentService.editStudent(
          selectedStudent.id,
          dataToSubmit,
          studentData.file
        );
        setRows(
          rows.map((row) =>
            row.id === selectedStudent.id
              ? {
                  ...row,
                  name: updatedStudent.name,
                  level: updatedStudent.level, // Cập nhật tên level
                  yearOfBirth: updatedStudent.yearOfBirth,
                  phone: updatedStudent.phone,
                  avatar: (
                    <Box display="flex" justifyContent="center">
                      <Avatar
                        src={updatedStudent.imgUrl}
                        alt={updatedStudent.name}
                        sx={{
                          width: 50,
                          height: 50,
                          border: `1px solid ${colors.lightGrey}`,
                        }}
                      >
                        {updatedStudent.name.charAt(0)}
                      </Avatar>
                    </Box>
                  ),
                  imgUrl: updatedStudent.imgUrl,
                  startDate: updatedStudent.startDate,
                  endDate: updatedStudent.endDate,
                  note: formatSchedule(updatedStudent),
                  rawLevel: updatedStudent.level,
                }
              : row
          )
        );
      }

      setOpen(false);
      setStudentData({
        name: "",
        level: "",
        yearOfBirth: "",
        phone: "",
        classID: "",
        imgUrl: "",
        startDate: "",
        endDate: "",
        note: "",
      });
      setPreviewImage(null);
      setEditMode(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Error saving student!");
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
                  Students Table
                </MDTypography>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    "&:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={() => navigate("/students/create-student")}
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
        <DialogTitle sx={{ backgroundColor: colors.deepGreen, color: colors.white }}>
          {editMode ? "Edit Student" : "Add Student"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={studentData.name}
            onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
          />
          <TextField
            select
            label="Level"
            fullWidth
            sx={{
              "& .css-1cohrqd-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select":
                {
                  minHeight: "48px",
                  display: "flex",
                  alignItems: "center",
                },
            }}
            margin="normal"
            value={studentData.level}
            onChange={(e) => setStudentData({ ...studentData, level: e.target.value })}
          >
            {levels.map((level) => (
              <MenuItem key={level.id} value={level.id}>
                {level.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            type="date"
            label="Year of birth"
            InputLabelProps={{ shrink: true }}
            value={studentData.yearOfBirth}
            onChange={(e) => setStudentData({ ...studentData, yearOfBirth: e.target.value })}
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={studentData.phone}
            onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })}
          />
          <Box sx={{ mt: 3, mb: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Student Avatar
            </Typography>
            {previewImage && (
              <Box display="flex" justifyContent="center" mb={2}>
                <Avatar
                  src={previewImage}
                  alt={studentData.name}
                  sx={{
                    width: 100,
                    height: 100,
                    border: `1px solid ${colors.lightGrey}`,
                  }}
                >
                  {studentData.name ? studentData.name.charAt(0) : ""}
                </Avatar>
              </Box>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingImage}
                sx={{
                  borderColor: colors.midGreen,
                  color: colors.darkGreen,
                  "&:hover": {
                    borderColor: colors.highlightGreen,
                    backgroundColor: "rgba(0, 128, 0, 0.04)",
                  },
                }}
              >
                {uploadingImage ? "Uploading..." : "Upload Image"}
                {uploadingImage && <CircularProgress size={24} sx={{ ml: 1 }} />}
              </Button>
            </Box>
          </Box>
          <TextField
            select
            label="Class Schedule"
            fullWidth
            margin="normal"
            value={studentData.classID}
            onChange={(e) => {
              const selectedClassSchedule = classSchedules.find((cs) => cs.id === e.target.value);
              setStudentData({
                ...studentData,
                classID: selectedClassSchedule ? selectedClassSchedule.class.id : "",
              });
            }}
            renderValue={(selectedValue) => {
              const selectedClass = classSchedules.find((cs) => cs.id === selectedValue);
              return selectedClass ? formatSchedule(selectedClass) : "Chọn lớp học";
            }}
          >
            {classSchedules.map((classSchedule) => (
              <MenuItem
                key={classSchedule.id}
                value={classSchedule.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "10px",
                }}
              >
                {formatSchedule(classSchedule)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="User name"
            fullWidth
            margin="normal"
            value={studentData.username}
            onChange={(e) => setStudentData({ ...studentData, username: e.target.value })}
          />
          <TextField
            label="Password"
            fullWidth
            margin="normal"
            type="password"
            value={studentData.password}
            onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
          />
          <TextField
            label="Start Date"
            fullWidth
            margin="normal"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={studentData.startDate}
            onChange={(e) => setStudentData({ ...studentData, startDate: e.target.value })}
          />
          <TextField
            label="End Date"
            fullWidth
            type="date"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={studentData.endDate}
            onChange={(e) => setStudentData({ ...studentData, endDate: e.target.value })}
          />
          <TextField
            label="Note"
            fullWidth
            margin="normal"
            value={studentData.note}
            onChange={(e) => setStudentData({ ...studentData, note: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            sx={{ color: colors.midGreen, "&:hover": { color: colors.darkGreen } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            sx={{
              backgroundColor: colors.midGreen,
              color: colors.white,
              "&:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
            }}
          >
            {editMode ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Students;
