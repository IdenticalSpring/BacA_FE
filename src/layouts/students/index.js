import { useEffect, useState, useRef, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
import StudentOverviewModal from "./studentOverviewModal";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { message, Tabs } from "antd";
import axios from "axios";
import { AddPhotoAlternateOutlined } from "@mui/icons-material";
import TableScoreTest from "pages/admin/tableScoreTest";

function Students() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("students");
  const [levels, setLevels] = useState([]);
  const [columns, setColumns] = useState([
    { Header: "Name", accessor: "name", width: "20%" },
    { Header: "Level", accessor: "level", width: "15%" },
    { Header: "Class", accessor: "note", width: "15%" },
    { Header: "Avatar", accessor: "avatar", width: "10%" },
    { Header: "Start Date", accessor: "startDate", width: "10%" },
    { Header: "Actions", accessor: "actions", width: "10%" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [classSchedules, setClassSchedules] = useState([]);
  const [selectedClassSchedules, setSelectedClassSchedules] = useState([]);
  const [studentData, setStudentData] = useState({
    name: "",
    level: "",
    classID: "",
    imgUrl: "",
    startDate: "",
    endDate: "",
    username: "",
    password: "",
  });
  const [searchName, setSearchName] = useState("");
  const [searchSchedule, setSearchSchedule] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const levelData = await levelService.getAllLevels();
        setLevels(levelData);
      } catch (error) {
        console.error("Failed to fetch levels", error);
        setError("Error fetching levels!");
      }
    };
    fetchLevels();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchStudents();
        await fetchClassSchedules();
      } catch (error) {
        console.error("Failed to fetch data", error);
        setError("Error fetching students or schedules!");
      } finally {
        setLoading(false);
      }
    };

    if (levels.length > 0) {
      fetchData();
    }
  }, [levels]);

  const handleClassScheduleChange = (event) => {
    const selectedClassId = event.target.value;
    const matchingSchedules = classSchedules.filter(
      (schedule) => schedule.class.id === selectedClassId
    );
    setSelectedClassSchedules(matchingSchedules);
    setStudentData((prevData) => ({
      ...prevData,
      classID: selectedClassId,
    }));
  };

  const renderClassScheduleLabel = (classSchedule) => {
    const { class: classInfo } = classSchedule;
    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography sx={{ fontWeight: "bold", color: colors.midGreen }}>
          {classInfo.name}
        </Typography>
      </Box>
    );
  };

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
      const formattedRows = data.map((student) => {
        const levelObj = levels.find((level) => level.id === student.level);
        const levelName = levelObj ? levelObj.name : "N/A";
        return {
          id: student.id,
          name: student.name,
          level: levelName,
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
          note: student.class?.name,
          rawLevel: student.level,
          actions: (
            <>
              <IconButton
                sx={{
                  color: colors.deepGreen,
                  "&:hover": { backgroundColor: colors.highlightGreen },
                }}
                onClick={() => handleViewDetail(student)}
              >
                <VisibilityIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: colors.midGreen,
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
        };
      });
      setRows(formattedRows);
    } catch (err) {
      setError("Error fetching students!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dayNames = ["", "CN", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const nameMatch = (row.name || "").toLowerCase().includes(searchName.toLowerCase());
      const scheduleMatch = (row.note || "").toLowerCase().includes(searchSchedule.toLowerCase());
      return nameMatch && scheduleMatch;
    });
  }, [rows, searchName, searchSchedule]);

  const handleEdit = (student) => {
    setEditMode(true);
    setSelectedStudent(student);
    setStudentData({
      name: student.name,
      username: student.username || "",
      password: student.password || "",
      classID: student.class?.id || "",
      level: student.rawLevel || "",
      imgUrl: student.imgUrl || "",
      startDate: student.startDate || "",
      endDate: student.endDate || "",
    });
    setPreviewImage(student.imgUrl);
    setSelectedClassSchedules(
      classSchedules.filter((schedule) => schedule.class.id === student.class?.id)
    );
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await studentService.deleteStudent(id);
        setRows(rows.filter((row) => row.id !== id));
        message.success("Student deleted successfully");
      } catch (err) {
        message.error("Error deleting student: " + err.message);
        console.error(err);
      }
    }
  };

  const handleViewDetail = (student) => {
    setSelectedStudent(student);
    setDetailOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      message.error("Vui lòng chọn một file ảnh");
      return;
    }

    setUploadingImage(true);

    // Create URL preview for image
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewImage(fileReader.result);
    };
    fileReader.readAsDataURL(file);

    // Upload image to server
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading image:", file.name);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/files/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      console.log("Image upload response:", response.data);

      if (response.status === 201 && response.data.url) {
        setStudentData((prevData) => ({
          ...prevData,
          imgUrl: response.data.url,
        }));
        setUploadingImage(false);
        message.success(`Đã upload ảnh ${file.name} thành công`);
      } else {
        setUploadingImage(false);
        message.error(`Upload ảnh ${file.name} thất bại: Không nhận được URL từ server`);
      }
    } catch (error) {
      console.error(`Lỗi khi upload ảnh ${file.name}:`, error);
      setUploadingImage(false);
      message.error(
        `Lỗi upload ảnh ${file.name}: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleSave = async () => {
    try {
      setLoadingEdit(true);
      // Validate required fields
      if (
        !studentData.name ||
        !studentData.username ||
        !studentData.password ||
        !studentData.level ||
        !studentData.classID
      ) {
        message.error("Vui lòng điền đầy đủ các trường bắt buộc: Name, Username, Password, Level");
        return;
      }

      const dataToSubmit = {
        name: studentData.name,
        username: studentData.username,
        password: studentData.password,
        classID: studentData.classID,
        level: studentData.level,
        startDate: studentData.startDate,
        endDate: studentData.endDate,
        imgUrl: studentData.imgUrl,
      };

      if (editMode && selectedStudent) {
        const updatedStudent = await studentService.editStudent(selectedStudent.id, dataToSubmit);
        console.log("Updated student:", updatedStudent);

        setRows(
          rows.map((row) =>
            row.id === selectedStudent.id
              ? {
                  ...row,
                  name: updatedStudent.name,
                  level: levels.find((lv) => lv.id === +updatedStudent.level)?.name || "N/A",
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
                  note: updatedStudent.class?.name,
                  rawLevel: updatedStudent.level,
                  actions: (
                    <>
                      <IconButton
                        sx={{
                          color: colors.deepGreen,
                          "&:hover": { backgroundColor: colors.highlightGreen },
                        }}
                        onClick={() => handleViewDetail(updatedStudent)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        sx={{
                          color: colors.midGreen,
                          "&:hover": { backgroundColor: colors.highlightGreen },
                        }}
                        onClick={() => handleEdit(updatedStudent)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(updatedStudent.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  ),
                }
              : row
          )
        );
      }
      await fetchStudents();
      setOpen(false);
      setStudentData({
        name: "",
        level: "",
        classID: "",
        imgUrl: "",
        startDate: "",
        endDate: "",
        username: "",
        password: "",
      });
      setPreviewImage(null);
      setEditMode(false);
      setSelectedStudent(null);
      setSelectedClassSchedules([]);
      message.success("Student saved successfully");
    } catch (error) {
      console.error("Error saving student:", error.response?.data || error.message);
      message.error(`Error saving student: ${error.message || "Server error"}`);
    } finally {
      setLoadingEdit(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          style={{ marginBottom: 0 }}
          items={[
            { key: "students", label: "Danh sách học sinh" },
            { key: "scores", label: "Quản lý điểm số" },
          ]}
        />
        {activeTab === "scores" ? (
          <TableScoreTest />
        ) : (
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
              <MDBox
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                gap={2}
                px={2}
                py={1}
              >
                <TextField
                  label="Search by name"
                  variant="outlined"
                  size="small"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  sx={{ backgroundColor: "white", borderRadius: "4px" }}
                />
                <TextField
                  label="Search by Class"
                  variant="outlined"
                  size="small"
                  value={searchSchedule}
                  onChange={(e) => setSearchSchedule(e.target.value)}
                  sx={{ backgroundColor: "white", borderRadius: "4px" }}
                />
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
                    table={{ columns, rows: filteredRows }}
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
        )}
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
          <Box
            sx={{
              mt: 2,
              mb: 2,
              border: "1px dashed #ccc",
              borderRadius: "8px",
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {previewImage ? (
              <Box sx={{ mb: 2, textAlign: "center" }}>
                <img
                  src={previewImage}
                  alt="Avatar preview"
                  style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px" }}
                />
              </Box>
            ) : (
              <AddPhotoAlternateOutlined sx={{ fontSize: 60, color: colors.midGreen, mb: 1 }} />
            )}
            <Typography variant="body1" sx={{ mb: 1 }}>
              {uploadingImage ? "Đang tải ảnh..." : "Click to upload avatar"}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{
                color: colors.midGreen,
                borderColor: colors.midGreen,
                "&:hover": {
                  borderColor: colors.darkGreen,
                  backgroundColor: "rgba(0, 128, 0, 0.04)",
                },
              }}
            >
              Upload Photo
            </Button>
          </Box>
          <TextField
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: colors.inputBorder },
                "&:hover fieldset": { borderColor: colors.midGreen },
                "&.Mui-focused fieldset": { borderColor: colors.inputFocus },
                height: "44px",
              },
              "& .MuiInputLabel-root": { color: colors.darkGray },
              "& .MuiInputLabel-root.Mui-focused": { color: colors.inputFocus },
              "& .MuiSelect-select": {
                height: "100%",
                display: "flex",
                alignItems: "center",
              },
            }}
            select
            label="Class Schedule"
            fullWidth
            margin="normal"
            value={studentData.classID}
            onChange={handleClassScheduleChange}
            renderValue={() => {
              const selectedSchedule = classSchedules.find(
                (schedule) => schedule.class.id === studentData.classID
              );
              return selectedSchedule
                ? renderClassScheduleLabel(selectedSchedule)
                : "Select Class Schedule";
            }}
          >
            {Array.from(new Set(classSchedules.map((schedule) => schedule.class.id))).map(
              (uniqueClassId) => {
                const classSchedule = classSchedules.find(
                  (schedule) => schedule.class.id === uniqueClassId
                );
                return (
                  <MenuItem key={uniqueClassId} value={uniqueClassId}>
                    {renderClassScheduleLabel(classSchedule)}
                  </MenuItem>
                );
              }
            )}
          </TextField>
          {selectedClassSchedules.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: colors.midGreen, mb: 1 }}>
                Class Schedules
              </Typography>
              {selectedClassSchedules.map((schedule, index) => (
                <Box
                  key={schedule.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                    p: 1,
                    backgroundColor: colors.white,
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ mr: 2 }}>{dayNames[schedule.schedule.dayOfWeek]}</Typography>
                  <Typography>
                    {schedule.schedule.startTime.substring(0, 5)} -{" "}
                    {schedule.schedule.endTime.substring(0, 5)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
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
            type={showPassword ? "text" : "password"}
            value={studentData.password}
            onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
            disabled={loadingEdit}
            sx={{
              backgroundColor: colors.midGreen,
              color: colors.white,
              "&:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
            }}
          >
            {loadingEdit && <CircularProgress size={24} sx={{ mr: 1 }} />}
            {editMode ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <StudentOverviewModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        student={selectedStudent}
      />
    </DashboardLayout>
  );
}

export default Students;
