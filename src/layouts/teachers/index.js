import { useEffect, useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility"; // Thêm icon View
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
import teacherService from "services/teacherService";
import { useNavigate } from "react-router-dom";
import { colors } from "assets/theme/color";
import TeacherOverViewModal from "./teacherOverviewModal"; // Import modal mới
import link from "assets/theme/components/link";
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
function Teachers() {
  const navigate = useNavigate();
  const [columns, setColumns] = useState([
    { Header: "Name", accessor: "name", width: "20%" },
    { Header: "Start Date", accessor: "startDate", width: "20%" },
    { Header: "End Date", accessor: "endDate", width: "20%" },
    { Header: "Actions", accessor: "actions", width: "10%" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherData, setTeacherData] = useState({
    name: "",
    username: "",
    password: "",
    startDate: "",
    linkDrive: "",
    endDate: "",
  });
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openOverview, setOpenOverview] = useState(false); // State cho modal overview
  const [placeholderLessonPlan, setPlaceholderLessonPlan] = useState("");
  useEffect(() => {
    // setTimeout(() => {
    const fetchPlaceholder = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/contentpage/lessonPlanPlaceholder`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        console.log("Placeholder:", response.data);

        setPlaceholderLessonPlan(response.data);
      } catch (error) {
        console.error("Error fetching placeholder:", error);
      }
    };
    fetchPlaceholder();
    // }, 1000); // Delay 1 giây
  }, []);
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      const formattedRows = data.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        startDate: teacher.startDate,
        linkDrive: teacher.linkDrive,
        endDate: teacher.endDate,
        fileUrl: teacher.fileUrls
          ? teacher.fileUrls.map((url, index) => (
              <div key={index}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  File {index + 1}
                </a>
              </div>
            ))
          : "No file",
        actions: (
          <>
            <IconButton
              sx={{
                color: colors.midGreen,
                // " &:hover": { backgroundColor: colors.highlightGreen },
              }}
              onClick={() => handleView(teacher)} // Thêm sự kiện View
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton
              sx={{
                color: colors.deepGray,
                // " &:hover": { backgroundColor: colors.highlightGreen },
              }}
              onClick={() => handleEdit(teacher)}
            >
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleDelete(teacher.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
      }));
      setRows(formattedRows);
    } catch (err) {
      setError("Load data failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditMode(true);
    setSelectedTeacher(teacher);
    setTeacherData({
      name: teacher.name,
      username: teacher.username,
      password: teacher.password,
      linkDrive: teacher.linkDrive,
      startDate: teacher.startDate,
      endDate: teacher.endDate,
    });
    setFiles([]);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await teacherService.deleteTeacher(id);
        setRows(rows.filter((row) => row.id !== id));
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setOpenOverview(true); // Mở modal overview
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        const updatedTeacher = await teacherService.editTeacher(
          selectedTeacher.id,
          teacherData,
          files
        );
        setRows(
          rows.map((row) =>
            row.id === selectedTeacher.id
              ? {
                  ...row,
                  ...teacherData,
                  fileUrl: updatedTeacher.fileUrls
                    ? updatedTeacher.fileUrls.map((url, index) => (
                        <div key={index}>
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            File {index + 1}
                          </a>
                        </div>
                      ))
                    : "No file",
                }
              : row
          )
        );
      } else {
        const createdTeacher = await teacherService.createTeacher(teacherData, files);
        setRows([
          ...rows,
          {
            id: createdTeacher.id,
            name: createdTeacher.name,
            startDate: createdTeacher.startDate,
            endDate: createdTeacher.endDate,
            linkDrive: createdTeacher.linkDrive,
            fileUrl: createdTeacher.fileUrls
              ? createdTeacher.fileUrls.map((url, index) => (
                  <div key={index}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      File {index + 1}
                    </a>
                  </div>
                ))
              : "No file",
            actions: (
              <>
                <IconButton
                  sx={{
                    color: colors.midGreen,
                    " &:hover": { backgroundColor: colors.highlightGreen },
                  }}
                  onClick={() => handleView(createdTeacher)}
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen },
                  }}
                  onClick={() => handleEdit(createdTeacher)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(createdTeacher.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            ),
          },
        ]);
      }
      setOpen(false);
      setTeacherData({ name: "", username: "", password: "", startDate: "", endDate: "" });
      setFiles([]);
      setEditMode(false);
    } catch (err) {
      alert(editMode ? "Lỗi khi chỉnh sửa giáo viên!" : "Lỗi khi tạo giáo viên!");
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter((row) => row.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rows, searchTerm]);

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
                sx={{ backgroundColor: colors.deepGreen }}
              >
                <MDTypography variant="h6" color="white">
                  Teachers Table
                </MDTypography>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen },
                  }}
                  onClick={() => navigate("/teachers/create-teacher")}
                >
                  Create
                </Button>
              </MDBox>
              <MDBox
                mx={2}
                mt={0}
                py={3}
                px={2}
                variant="gradient"
                borderRadius="lg"
                display="flex"
                justifyContent="right"
                alignItems="center"
              >
                <TextField
                  label="Search by teacher"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
      </MDBox>
      <Footer />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.deepGreen, color: colors.white }}>
          {editMode ? "Chỉnh sửa Giáo Viên" : "Thêm Giáo Viên"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={teacherData.name}
            onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
          />
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={teacherData.username}
            onChange={(e) => setTeacherData({ ...teacherData, username: e.target.value })}
          />
          <TextField
            label="Password"
            fullWidth
            margin="normal"
            value={teacherData.password}
            onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            type="date"
            label="Start Date"
            InputLabelProps={{ shrink: true }}
            value={teacherData.startDate}
            onChange={(e) => setTeacherData({ ...teacherData, startDate: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            type="date"
            label="End Date"
            InputLabelProps={{ shrink: true }}
            value={teacherData.endDate}
            onChange={(e) => setTeacherData({ ...teacherData, endDate: e.target.value })}
          />
          <TextField
            label="Link Drive"
            fullWidth
            margin="normal"
            value={teacherData.linkDrive}
            onChange={(e) => setTeacherData({ ...teacherData, linkDrive: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            type="file"
            label="Upload Files"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*, .pdf", multiple: true }}
            onChange={handleFileChange}
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
      <TeacherOverViewModal
        open={openOverview}
        onClose={() => setOpenOverview(false)}
        teacher={selectedTeacher}
        placeholderLessonPlan={placeholderLessonPlan}
      />
    </DashboardLayout>
  );
}

export default Teachers;
