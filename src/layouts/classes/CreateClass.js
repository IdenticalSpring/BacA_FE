import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, TextField, MenuItem, Button, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import classService from "services/classService";
import teacherService from "services/teacherService";
import scheduleService from "services/scheduleService";

function CreateClass() {
  const navigate = useNavigate();
  const [classData, setClassData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    teacherId: "",
    scheduleId: "",
  });
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetchTeachers();
    fetchSchedules();
  }, []);

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

  const handleSave = async () => {
    try {
      const payload = {
        name: classData.name,
        startDate: classData.startDate,
        endDate: classData.endDate,
        teacherId: classData.teacherId,
        scheduleId: classData.scheduleId,
      };

      await classService.createClass(payload);
      navigate("/classes"); // Quay lại trang danh sách lớp
    } catch (err) {
      alert("Lỗi khi tạo lớp học!");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card sx={{ padding: 3 }}>
              <MDTypography variant="h5" align="center" gutterBottom>
                Create New Class
              </MDTypography>
              <TextField
                label="Class Name"
                fullWidth
                margin="normal"
                value={classData.name}
                onChange={(e) => setClassData({ ...classData, name: e.target.value })}
              />
              <TextField
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
              />
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
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button variant="text" onClick={() => navigate("/classes")}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSave}>
                  Create
                </Button>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CreateClass;
