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
import scheduleService from "services/scheduleService";
import { useNavigate } from "react-router-dom";

function Schedules() {
  const navigate = useNavigate();
  const [columns] = useState([
    { Header: "Date", accessor: "date", width: "30%" },
    { Header: "Start Time", accessor: "startTime", width: "30%" },
    { Header: "End Time", accessor: "endTime", width: "30%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleData, setScheduleData] = useState({ date: "", startTime: "", endTime: "" });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const data = await scheduleService.getAllSchedules();
      const formattedRows = data.map((schedule) => ({
        id: schedule.id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        actions: (
          <>
            <IconButton color="primary" onClick={() => handleEdit(schedule)}>
              <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => handleDelete(schedule.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
      }));
      setRows(formattedRows);
    } catch (err) {
      setError("Lỗi khi tải dữ liệu lịch học!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditMode(true);
    setSelectedSchedule(schedule);
    setScheduleData({
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch học này?")) {
      try {
        await scheduleService.deleteSchedule(id);
        setRows(rows.filter((row) => row.id !== id));
      } catch (err) {
        alert("Lỗi khi xóa lịch học!");
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await scheduleService.editSchedule(selectedSchedule.id, scheduleData);
        setRows(
          rows.map((row) => (row.id === selectedSchedule.id ? { ...row, ...scheduleData } : row))
        );
      } else {
        const createdSchedule = await scheduleService.createSchedule(scheduleData);
        setRows([
          ...rows,
          {
            id: createdSchedule.id,
            className: createdSchedule.className,
            startTime: createdSchedule.startTime,
            endTime: createdSchedule.endTime,
            actions: (
              <>
                <IconButton color="primary" onClick={() => handleEdit(createdSchedule)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleDelete(createdSchedule.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            ),
          },
        ]);
      }

      setOpen(false);
      setScheduleData({ className: "", startTime: "", endTime: "" });
      setEditMode(false);
    } catch (err) {
      alert(editMode ? "Lỗi khi chỉnh sửa lịch học!" : "Lỗi khi tạo lịch học!");
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
                  Schedule Tables
                </MDTypography>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => navigate("/schedules/create-schedule")}
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
        <DialogTitle>{editMode ? "Edit Scheduel" : "Create"}</DialogTitle>
        <DialogContent>
          <TextField
            // label="Date"
            fullWidth
            margin="normal"
            type="date"
            value={scheduleData.date}
            onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
          />
          <TextField
            label="Start Time"
            fullWidth
            margin="normal"
            value={scheduleData.startTime}
            onChange={(e) => setScheduleData({ ...scheduleData, startTime: e.target.value })}
          />
          <TextField
            label="End Time"
            fullWidth
            margin="normal"
            value={scheduleData.endTime}
            onChange={(e) => setScheduleData({ ...scheduleData, endTime: e.target.value })}
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

export default Schedules;
