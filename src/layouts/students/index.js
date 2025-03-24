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

const levels = [
  { id: 1, name: "Level Pre-1" },
  { id: 2, name: "Level 1" },
  { id: 3, name: "Starters" },
  { id: 4, name: "Level-KET" },
  { id: 5, name: "Movers" },
  { id: 6, name: "Flyers" },
  { id: 7, name: "Pre-KET" },
  { id: 8, name: "level-PET" },
];

const getLevelNameById = (levelId) => {
  const level = levels.find((level) => level.id === levelId);
  return level ? level.name : "Unknown Level";
};

function Students() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [columns, setColumns] = useState([
    { Header: "Name", accessor: "name", width: "20%" },
    { Header: "Age", accessor: "age", width: "10%" },
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
  const [studentData, setStudentData] = useState({
    name: "",
    level: "",
    age: "",
    phone: "",
    imgUrl: "",
    startDate: "",
    endDate: "",
    note: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      const formattedRows = data.map((student) => ({
        id: student.id,
        name: student.name,
        level: typeof student.level === "number" ? getLevelNameById(student.level) : student.level,
        age: student.age,
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
        // Thay đổi này: thay vì chỉ hiển thị note, giờ hiển thị thông tin lịch học
        note: formatSchedule(student),
        rawLevel: student.level,
        actions: (
          <>
            <IconButton
              sx={{
                backgroundColor: colors.midGreen,
                color: colors.white,
                " &:hover": { backgroundColor: colors.highlightGreen },
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
    } finally {
      setLoading(false);
    }
  };
  const formatSchedule = (student) => {
    let scheduleInfo = "";

    // Thêm thông tin lớp học
    if (student.class && student.class.name) {
      scheduleInfo += `Class: ${student.class.name}`;
    }

    // Thêm thông tin lịch học
    if (student.schedule) {
      const { startTime, endTime, dayOfWeek } = student.schedule;

      // Định dạng ngày trong tuần (1-Thứ Hai, 2-Thứ Ba, vv.)
      const dayNames = ["", "T2", "T3", "T4", "T5", "T6", "T7", "CN"];
      const dayName = dayNames[dayOfWeek] || "";

      // Nếu đã có thông tin lớp thì thêm dòng mới
      if (scheduleInfo) scheduleInfo += "\n";

      // Thêm thông tin thời gian
      scheduleInfo += `${dayName}: ${startTime?.substring(0, 5)} - ${endTime?.substring(0, 5)}`;
    }

    return scheduleInfo || "N/A";
  };

  const handleEdit = (student) => {
    setEditMode(true);
    setSelectedStudent(student);
    setStudentData({
      name: student.name,
      username: student.username,
      password: student.password,
      age: student.age,
      phone: student.phone,
      imgUrl: student.imgUrl,
      level: student.rawLevel || student.level,
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
      }
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Kiểm tra xem file có phải là hình ảnh không
    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }

    try {
      setUploadingImage(true);
      // Tạo URL cho preview
      const previewURL = URL.createObjectURL(file);
      setPreviewImage(previewURL);

      // Gọi API để upload ảnh
      const formData = new FormData();
      formData.append("image", file);

      // Giả định bạn có service để upload ảnh
      const uploadedImageUrl = await studentService.uploadImage(formData);

      // Cập nhật state với URL ảnh mới
      setStudentData((prev) => ({
        ...prev,
        imgUrl: uploadedImageUrl,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await studentService.editStudent(selectedStudent.id, studentData);

        const levelName = getLevelNameById(parseInt(studentData.level));

        setRows(
          rows.map((row) =>
            row.id === selectedStudent.id
              ? {
                  ...row,
                  name: studentData.name,
                  age: studentData.age,
                  phone: studentData.phone,
                  avatar: (
                    <Box display="flex" justifyContent="center">
                      <Avatar
                        src={studentData.imgUrl}
                        alt={studentData.name}
                        sx={{
                          width: 50,
                          height: 50,
                          border: `1px solid ${colors.lightGrey}`,
                        }}
                      >
                        {studentData.name.charAt(0)}
                      </Avatar>
                    </Box>
                  ),
                  imgUrl: studentData.imgUrl,
                  startDate: studentData.startDate,
                  endDate: studentData.endDate,
                  note: studentData.note,
                  level: levelName,
                  rawLevel: parseInt(studentData.level),
                }
              : row
          )
        );
      } else {
        const createdStudent = await studentService.createStudent(studentData);

        const levelName = getLevelNameById(parseInt(createdStudent.level));

        setRows([
          ...rows,
          {
            id: createdStudent.id,
            name: createdStudent.name,
            age: createdStudent.age,
            phone: createdStudent.phone,
            avatar: (
              <Box display="flex" justifyContent="center">
                <Avatar
                  src={createdStudent.imgUrl}
                  alt={createdStudent.name}
                  sx={{
                    width: 50,
                    height: 50,
                    border: `1px solid ${colors.lightGrey}`,
                  }}
                >
                  {createdStudent.name.charAt(0)}
                </Avatar>
              </Box>
            ),
            imgUrl: createdStudent.imgUrl,
            username: createdStudent.username,
            password: createdStudent.password,
            startDate: createdStudent.startDate,
            endDate: createdStudent.endDate,
            note: createdStudent.note,
            level: levelName,
            rawLevel: parseInt(createdStudent.level),
            actions: (
              <>
                <IconButton
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen },
                  }}
                  onClick={() => handleEdit(createdStudent)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(createdStudent.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            ),
          },
        ]);
      }

      setOpen(false);
      setStudentData({ name: "", level: "" });
      setEditMode(false);
      setPreviewImage(null);
    } catch (err) {
      alert(editMode ? "Error updating student!" : "Error creating student!");
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
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
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
            label="level"
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
            onChange={(e) => {
              setStudentData({ ...studentData, level: e.target.value });
            }}
          >
            {levels.map((level) => (
              <MenuItem key={level.id} value={level.id}>
                {level.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Age"
            fullWidth
            margin="normal"
            value={studentData.age}
            onChange={(e) => setStudentData({ ...studentData, age: e.target.value })}
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={studentData.phone}
            onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })}
          />

          {/* Phần upload ảnh đại diện */}
          <Box sx={{ mt: 3, mb: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Student Avatar
            </Typography>

            {/* Hiển thị preview ảnh */}
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

            {/* File input hidden */}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {/* Button to trigger file dialog */}
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

export default Students;
