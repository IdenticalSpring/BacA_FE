import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Card,
  CardContent,
  Divider,
  Avatar,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { colors } from "assets/theme/color";
import feedbackService from "services/feedbackService";
import PropTypes from "prop-types";
import { format } from "date-fns";
import FeedbackIcon from "@mui/icons-material/Feedback";
import { Pie } from "react-chartjs-2"; // Import Pie
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"; // Import ChartJS và các thành phần
import studentService from "services/studentService"; // Import studentService
import lessonByScheduleService from "services/lessonByScheduleService"; // Import lessonByScheduleService
import checkinService from "services/checkinService"; // Import checkinService
import StudentScoreTab from "pages/students/studentScoreTab";
import MDAvatar from "components/MDAvatar";

// Đăng ký các thành phần của ChartJS
ChartJS.register(ArcElement, Tooltip, Legend);

export default function StudentOverviewModal({ open, onClose, student }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState(null);
  const [chartData, setChartData] = useState({});
  const [loadingChart, setLoadingChart] = useState(false);
  const [errorChart, setErrorChart] = useState("");

  useEffect(() => {
    if (!student || !open) return;

    // Lấy feedback
    const fetchFeedbacks = async () => {
      setLoadingFeedback(true);
      setErrorFeedback(null);
      try {
        const feedbackData = await feedbackService.getFeedbackByStudentId(student.id);
        setFeedbacks(feedbackData);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        setErrorFeedback(error.message || "Error fetching feedback");
      } finally {
        setLoadingFeedback(false);
      }
    };

    // Lấy dữ liệu biểu đồ check-in
    const fetchChartData = async () => {
      setLoadingChart(true);
      setErrorChart("");
      try {
        const studentData = await studentService.getStudentById(student.id);
        const classId = studentData.class?.id;

        if (!classId) {
          setErrorChart("No class found for this student.");
          setLoadingChart(false);
          return;
        }

        const lessonByScheduleData = await lessonByScheduleService.getAllLessonBySchedulesOfClass(
          classId
        );
        const checkinData = await checkinService.getAllCheckinOfStudent(student.id);

        const statusCountData = { absent: 0, present: 0, permission: 0, pending: 0 };
        lessonByScheduleData?.forEach((sch) => {
          const status =
            checkinData?.find((checkin) => checkin.lessonBySchedule.id === sch.id)?.present ??
            "pending";
          if (status === 0) statusCountData.absent++;
          else if (status === 1) statusCountData.present++;
          else if (status === 2) statusCountData.permission++;
          else statusCountData.pending++;
        });

        setChartData({
          labels: ["Absent", "Present", "Permission", "Pending"],
          datasets: [
            {
              data: Object.values(statusCountData),
              backgroundColor: ["#FF4D4F", "#52C41A", "#FAAD14", "#BFBFBF"],
              hoverOffset: 4,
            },
          ],
        });
      } catch (err) {
        setErrorChart("Error fetching check-in statistics.");
        console.error(err);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchFeedbacks();
    fetchChartData();
  }, [student, open]);

  const formatDate = (isoString) => {
    return format(new Date(isoString), "dd/MM/yyyy HH:mm");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle sx={{ backgroundColor: colors.deepGreen, color: colors.white }}>
        Student Overview: {student?.name}
      </DialogTitle>
      <DialogContent>
        <MDBox mt={3}>
          {/* Phần điểm số */}
          <MDTypography variant="h6">Score Details</MDTypography>
          <StudentScoreTab studentId={student?.id} colors={colors} />

          {/* Phần feedback */}
          <MDTypography variant="h6" mt={3} sx={{ mb: 2, color: colors.deepGreen }}>
            Feedback
          </MDTypography>
          {loadingFeedback ? (
            <MDTypography variant="body2" color="info">
              Loading feedback...
            </MDTypography>
          ) : errorFeedback ? (
            <MDTypography variant="body2" color="error">
              {errorFeedback}
            </MDTypography>
          ) : feedbacks.length > 0 ? (
            feedbacks.map((fb, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  boxShadow: 3,
                  borderLeft:
                    fb.type === "positive"
                      ? `4px solid ${colors.midGreen}`
                      : `4px solid ${colors.error}`,
                }}
              >
                <CardContent sx={{ display: "flex", alignItems: "center" }}>
                  <MDAvatar src={fb.student.imgUrl} alt={fb.student.name} size="sm" />
                  <MDBox mx={3}>
                    <MDTypography
                      variant="h6"
                      sx={{ fontWeight: "medium", color: colors.darkGreen }}
                    >
                      {fb.title || "No Title"}
                    </MDTypography>
                    <MDTypography
                      variant="body2"
                      sx={{ mt: 1, color: colors.textSecondary, lineHeight: 1.5 }}
                    >
                      {fb.description || "No Description"}
                    </MDTypography>
                    <Divider sx={{ my: 1 }} />
                    <MDTypography variant="caption" color="textSecondary">
                      Date: {fb.datetime ? formatDate(fb.datetime) : "N/A"}
                    </MDTypography>
                  </MDBox>
                </CardContent>
              </Card>
            ))
          ) : (
            <MDTypography variant="body2">No feedback available.</MDTypography>
          )}

          {/* Phần Check-in Statistics (chỉ hiển thị biểu đồ Pie) */}
          <MDTypography variant="h6" mt={3} sx={{ mb: 2, color: colors.deepGreen }}>
            Check-in Statistics
          </MDTypography>
          <MDBox sx={{ width: "400px", margin: "auto" }}>
            {loadingChart ? (
              <MDTypography variant="h6" color="info" align="center">
                Loading...
              </MDTypography>
            ) : errorChart ? (
              <MDTypography variant="h6" color="error" align="center">
                {errorChart}
              </MDTypography>
            ) : chartData.datasets ? (
              <Pie data={chartData} />
            ) : (
              <MDTypography variant="body2" align="center">
                No check-in data available.
              </MDTypography>
            )}
          </MDBox>
        </MDBox>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{ color: colors.midGreen, "&:hover": { color: colors.darkGreen } }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

StudentOverviewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
  }),
};
