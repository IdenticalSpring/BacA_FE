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

function Teachers() {
  const navigate = useNavigate();
  const [columns, setColumns] = useState([
    { Header: "Name", accessor: "name", width: "30%" },
    { Header: "Level", accessor: "level", width: "30%" },
    { Header: "Start Date", accessor: "startDate", width: "30%" },
    { Header: "End Date", accessor: "endDate", width: "30%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherData, setTeacherData] = useState({ name: "", level: "" });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      const formattedRows = data.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        level: teacher.level,
        startDate: teacher.startDate,
        endDate: teacher.endDate,
        actions: (
          <>
            <IconButton color="primary" onClick={() => handleEdit(teacher)}>
              <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => handleDelete(teacher.id)}>
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
      level: teacher.level,
      startDate: teacher.startDate,
      endDate: teacher.endDate,
    });
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

  const handleSave = async () => {
    try {
      if (editMode) {
        // Cập nhật giáo viên
        await teacherService.editTeacher(selectedTeacher.id, teacherData);
        setRows(
          rows.map((row) => (row.id === selectedTeacher.id ? { ...row, ...teacherData } : row))
        );
      } else {
        // Tạo giáo viên mới
        const createdTeacher = await teacherService.createTeacher(teacherData);
        setRows([
          ...rows,
          {
            id: createdTeacher.id,
            name: createdTeacher.name,
            level: createdTeacher.level,
            startDate: createdTeacher.startDate,
            actions: (
              <>
                <IconButton color="primary" onClick={() => handleEdit(createdTeacher)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleDelete(createdTeacher.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            ),
          },
        ]);
      }

      setOpen(false);
      setTeacherData({ name: "", level: "" });
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
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Teachers Table
                </MDTypography>
                <Button
                  variant="contained"
                  color="success"
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
        <DialogTitle>{editMode ? "Chỉnh sửa Giáo Viên" : "Thêm Giáo Viên"}</DialogTitle>
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
            // label="Start Date"
            fullWidth
            margin="normal"
            type="date"
            value={teacherData.startDate}
            onChange={(e) => setTeacherData({ ...teacherData, startDate: e.target.value })}
          />
          <TextField
            // label="End Date"
            fullWidth
            margin="normal"
            type="date"
            value={teacherData.endDate}
            onChange={(e) => setTeacherData({ ...teacherData, endDate: e.target.value })}
          />
          <TextField
            label="Level"
            fullWidth
            margin="normal"
            value={teacherData.level}
            onChange={(e) => setTeacherData({ ...teacherData, level: e.target.value })}
          />
        </DialogContent>
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

export default Teachers;
