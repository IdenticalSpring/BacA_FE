/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com
=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl"; // Thêm FormControl
import InputLabel from "@mui/material/InputLabel"; // Thêm InputLabel
import Select from "@mui/material/Select"; // Thêm Select
import MenuItem from "@mui/material/MenuItem"; // Thêm MenuItem

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

import { useEffect, useState } from "react";
import studentService from "services/studentService";
import teacherService from "services/teacherService";
import lessonService from "services/lessonService";
import homeWorkService from "services/homeWorkService";
import checkinService from "services/checkinService";
import pagevisitService from "services/pagevisitService";

function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    lessons: 0,
    homeworks: 0,
    visitCount: 0,
  });

  const [attendanceChartData, setAttendanceChartData] = useState({
    labels: [],
    datasets: [
      { label: "Present", data: [], color: "success" },
      { label: "Absent Without Permission", data: [], color: "error" },
      { label: "Absent With Permission", data: [], color: "warning" },
    ],
  });

  const [visitorChartData, setVisitorChartData] = useState({
    labels: [],
    datasets: [{ label: "Visitors", data: [], color: "info" }],
  });

  const [period, setPeriod] = useState("weekly"); // Mặc định là tuần

  // Lấy dữ liệu tổng quan
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, teachers, lessons, homeworks] = await Promise.all([
          studentService.getAllStudents(),
          teacherService.getAllTeachers(),
          lessonService.getAllLessons(),
          homeWorkService.getAllHomeWork(),
        ]);

        setStats({
          students: students.length,
          teachers: teachers.length,
          lessons: lessons.length,
          homeworks: homeworks.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Lấy và xử lý dữ liệu điểm danh
  useEffect(() => {
    const fetchAttendanceStats = async () => {
      try {
        const checkins = await checkinService.getAllCheckins();
        console.log("Fetched checkins:", checkins);

        if (!checkins || checkins.length === 0) {
          console.warn("No checkin data available");
          return;
        }

        const groupedByDate = checkins.reduce((acc, checkin) => {
          const date = checkin.lessonBySchedule?.date;
          if (!date) {
            console.warn("Missing date in checkin:", checkin);
            return acc;
          }
          if (!acc[date]) {
            acc[date] = { present: 0, absent: 0, absentWithPermission: 0 };
          }
          if (checkin.present === 1) acc[date].present += 1;
          if (checkin.present === 0) acc[date].absent += 1;
          if (checkin.present === 2) acc[date].absentWithPermission += 1;
          return acc;
        }, {});

        const dates = Object.keys(groupedByDate).sort();
        if (dates.length === 0) {
          console.warn("No dates found in grouped data");
          return;
        }

        const presentData = dates.map((date) => groupedByDate[date].present);
        const absentData = dates.map((date) => groupedByDate[date].absent);
        const absentWithPermissionData = dates.map(
          (date) => groupedByDate[date].absentWithPermission
        );

        const chartData = {
          labels: dates,
          datasets: [
            { label: "Present", data: presentData, color: "success" },
            { label: "Absent Without Permission", data: absentData, color: "error" },
            { label: "Absent With Permission", data: absentWithPermissionData, color: "warning" },
          ],
        };

        setAttendanceChartData(chartData);
      } catch (error) {
        console.error("Error fetching attendance stats:", error);
      }
    };

    fetchAttendanceStats();
  }, []);

  // Lấy và xử lý dữ liệu thống kê lượt truy cập
  useEffect(() => {
    const fetchVisitorStats = async () => {
      try {
        const stats = await pagevisitService.getStatsVisitor();
        console.log("Visitor stats:", stats);

        if (!stats || stats.length === 0) {
          console.warn("No visitor data available");
          return;
        }

        // Hàm tính số tuần (ISO week) từ ngày
        const getWeekNumber = (date) => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          d.setDate(d.getDate() + 4 - (d.getDay() || 7));
          const yearStart = new Date(d.getFullYear(), 0, 1);
          return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
        };

        // Nhóm dữ liệu theo tuần hoặc tháng
        const groupedData = stats.reduce((acc, entry) => {
          const date = new Date(entry.date);
          let key;

          if (period === "weekly") {
            const year = date.getFullYear();
            const week = getWeekNumber(date);
            key = `${year}-W${week}`; // Ví dụ: "2025-W15"
          } else {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            key = `${year}-${month}`; // Ví dụ: "2025-04"
          }

          if (!acc[key]) {
            acc[key] = 0;
          }
          acc[key] += entry.visitCount;
          return acc;
        }, {});

        const labels = Object.keys(groupedData).sort();
        const visitData = labels.map((label) => groupedData[label]);

        const chartData = {
          labels,
          datasets: [
            {
              label: "Visitors",
              data: visitData,
              color: "info",
            },
          ],
        };

        setVisitorChartData(chartData);
      } catch (error) {
        console.error("Error fetching visitor stats:", error);
      }
    };

    fetchVisitorStats();
  }, [period]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Grid 1: Tổng số students, teachers, lessons, homeworks */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="person"
                title="Students"
                count={stats.students}
                percentage={{ color: "success", amount: "", label: "Total students" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="school"
                title="Teachers"
                count={stats.teachers}
                percentage={{ color: "success", amount: "", label: "Total teachers" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="book"
                title="Lessons"
                count={stats.lessons}
                percentage={{ color: "success", amount: "", label: "Total lessons" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="assignment"
                title="Homeworks"
                count={stats.homeworks}
                percentage={{ color: "success", amount: "", label: "Total homeworks" }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* Grid 2: Thống kê điểm danh theo biểu đồ đường */}
        {/* <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="info"
                  title="Attendance Statistics"
                  description="Daily attendance trends"
                  date={`Updated: ${new Date().toLocaleDateString()}`}
                  chart={attendanceChartData}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox> */}

        {/* Grid 3: Thống kê lượt truy cập theo biểu đồ đường DefaultLineChart */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <MDBox mb={3} sx={{ backgroundColor: "#fff", padding: "10px", borderRadius: "8px" }}>
                <FormControl
                  sx={{
                    minWidth: 120,
                    mb: 2,
                    "& .MuiInputBase-root": {
                      height: "40px",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: "14px 14px",
                    },
                    padding: "10px 10px",
                  }}
                >
                  <InputLabel id="period-select-label">Period</InputLabel>
                  <Select
                    labelId="period-select-label"
                    id="period-select"
                    value={period}
                    label="Period"
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
                <DefaultLineChart
                  icon={{ color: "info", component: "visibility" }}
                  title={`Visitor Statistics (${period === "weekly" ? "Weekly" : "Monthly"})`}
                  description="Trends of page visits"
                  chart={visitorChartData}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Grid 4: Projects và OrdersOverview */}
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              {/* <OrdersOverview /> */}
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
