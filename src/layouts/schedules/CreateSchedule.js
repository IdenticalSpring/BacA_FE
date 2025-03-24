import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, TextField, Button, Grid, MenuItem } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import scheduleService from "services/scheduleService";
import { colors } from "assets/theme/color";

function CreateSchedule() {
  const daysOfWeekArr = [
    "Choose day of week",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
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
        <Grid container justifyContent="flex-start">
          <Grid
            item
            xs={12}
            md={6}
            sx={{ marginLeft: "20px", borderRadius: "20px", backgroundColor: colors.white }}
          >
            <Card
              sx={{
                padding: 3,
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Màu nền trong suốt nhẹ
                backdropFilter: "blur(10px)", // Hiệu ứng kính mờ
                boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)", // Đổ bóng nhẹ
                borderRadius: "12px", // Bo góc
                border: "1px solid rgba(255, 255, 255, 0.3)", // Viền nhẹ
              }}
            >
              {" "}
              <TextField
                select
                label="Day of Week"
                fullWidth
                InputProps={{
                  sx: {
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                margin="normal"
                value={scheduleData.dayOfWeek}
                onChange={(e) => {
                  setScheduleData({ ...scheduleData, dayOfWeek: e.target.value });
                }}
              >
                {daysOfWeekArr.map((d, index) => (
                  <MenuItem key={index} value={index}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
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
                <Button
                  variant="text"
                  sx={{ color: colors.midGreen, " &:hover": { color: colors.darkGreen } }}
                  onClick={() => navigate("/schedules")}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={handleSave}
                >
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
