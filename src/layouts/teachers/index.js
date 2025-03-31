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
import DataTable from "examples/Tables/DataTable";
import teacherService from "services/teacherService";
import { useNavigate } from "react-router-dom";
import { colors } from "assets/theme/color";

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
    endDate: "",
  });
  const [file, setFile] = useState(null); // State để lưu file upload khi chỉnh sửa

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
        endDate: teacher.endDate,
        fileUrl: teacher.fileUrl ? (
          <a href={teacher.fileUrl} target="_blank" rel="noopener noreferrer">
            {teacher.fileUrl}
          </a>
        ) : (
          "No file"
        ), // Hiển thị link nếu có fileUrl
        actions: (
          <>
            <IconButton
              sx={{
                backgroundColor: colors.midGreen,
                color: colors.white,
                " &:hover": { backgroundColor: colors.highlightGreen },
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
      startDate: teacher.startDate,
      endDate: teacher.endDate,
    });
    setFile(null); // Reset file khi mở dialog chỉnh sửa
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Lấy file đầu tiên từ input
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        // Cập nhật giáo viên
        const updatedTeacher = await teacherService.editTeacher(
          selectedTeacher.id,
          teacherData,
          file
        );
        setRows(
          rows.map((row) =>
            row.id === selectedTeacher.id
              ? {
                  ...row,
                  ...teacherData,
                  fileUrl: updatedTeacher.fileUrl ? (
                    <a href={updatedTeacher.fileUrl} target="_blank" rel="noopener noreferrer">
                      {updatedTeacher.fileUrl}
                    </a>
                  ) : (
                    "No file"
                  ),
                }
              : row
          )
        );
      } else {
        // Tạo giáo viên mới (không áp dụng ở đây vì đã có trang CreateTeacher riêng)
        const createdTeacher = await teacherService.createTeacher(teacherData, file);
        setRows([
          ...rows,
          {
            id: createdTeacher.id,
            name: createdTeacher.name,
            startDate: createdTeacher.startDate,
            endDate: createdTeacher.endDate,
            fileUrl: createdTeacher.fileUrl ? (
              <a href={createdTeacher.fileUrl} target="_blank" rel="noopener noreferrer">
                {createdTeacher.fileUrl}
              </a>
            ) : (
              "No file"
            ),
            actions: (
              <>
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
      setFile(null);
      setEditMode(false);
    } catch (err) {
      alert(editMode ? "Lỗi khi chỉnh sửa giáo viên!" : "Lỗi khi tạo giáo viên!");
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
                    " &: hover": { backgroundColor: colors.highlightGreen },
                  }}
                  onClick={() => navigate("/teachers/create-teacher")}
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
            fullWidth
            margin="normal"
            type="file"
            label="Upload File"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*, .pdf" }} // Giới hạn loại file
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
    </DashboardLayout>
  );
}

export default Teachers;
