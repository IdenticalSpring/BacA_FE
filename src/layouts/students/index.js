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
import studentService from "services/studentService";

function Students() {
  const [columns, setColumns] = useState([
    { Header: "Name", accessor: "name", width: "30%" },
    { Header: "Start Date", accessor: "startDate", width: "30%" },
    { Header: "End Date", accessor: "endDate", width: "30%" },
    { Header: "Note", accessor: "note", width: "30%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState({ name: "", level: "" });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      const formattedRows = data.map((student) => ({
        id: student.id,
        name: student.name,
        level: student.level,
        startDate: student.startDate,
        endDate: student.endDate,
        note: student.note,
        actions: (
          <>
            <IconButton color="primary" onClick={() => handleEdit(student)}>
              <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => handleDelete(student.id)}>
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

  const handleEdit = (student) => {
    setEditMode(true);
    setSelectedStudent(student);
    setStudentData({
      name: student.name,
      username: student.username,
      password: student.password,
      level: student.level,
      startDate: student.startDate,
      endDate: student.endDate,
      note: student.note,
    });
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

  const handleSave = async () => {
    try {
      if (editMode) {
        await studentService.editStudent(selectedStudent.id, studentData);
        setRows(
          rows.map((row) => (row.id === selectedStudent.id ? { ...row, ...studentData } : row))
        );
      } else {
        const createdStudent = await studentService.createStudent(studentData);
        setRows([
          ...rows,
          {
            id: createdStudent.id,
            name: createdStudent.name,
            level: createdStudent.level,
            startDate: createdStudent.startDate,
            note: createdStudent.note,
            actions: (
              <>
                <IconButton color="primary" onClick={() => handleEdit(createdStudent)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleDelete(createdStudent.id)}>
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
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Students Table
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
        <DialogTitle>{editMode ? "Edit Student" : "Add Student"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={studentData.name}
            onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
          />
          <TextField
            // label="Start Date"
            fullWidth
            margin="normal"
            type="date"
            value={studentData.startDate}
            onChange={(e) => setStudentData({ ...studentData, startDate: e.target.value })}
          />
          <TextField
            // label="End Date"
            fullWidth
            type="date"
            margin="normal"
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
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} color="primary">
            {editMode ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Students;
