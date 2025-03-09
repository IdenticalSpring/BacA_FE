import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, TextField, Button, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import scheduleService from "services/scheduleService";

function CreateSchedule() {
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const handleSave = async () => {
    try {
      await scheduleService.createSchedule(scheduleData);
      navigate("/schedules");
    } catch (err) {
      alert("Lỗi khi tạo lịch học!");
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
                Create New Schedule
              </MDTypography>
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={scheduleData.date}
                onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Start Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={scheduleData.startTime}
                onChange={(e) => setScheduleData({ ...scheduleData, startTime: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                label="End Time"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={scheduleData.endTime}
                onChange={(e) => setScheduleData({ ...scheduleData, endTime: e.target.value })}
              />
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button variant="text" onClick={() => navigate("/schedules")}>
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

export default CreateSchedule;
