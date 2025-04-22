import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Card,
  Grid,
  Pagination,
  TextField,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { colors } from "assets/theme/color";
import feedbackService from "services/feedbackService";
import PropTypes from "prop-types";
import { format } from "date-fns";
import DataTable from "examples/Tables/DataTable";
import studentService from "services/studentService";
import lessonByScheduleService from "services/lessonByScheduleService";
import checkinService from "services/checkinService";
import StudentScoreTab from "pages/students/studentScoreTab";
import MDAvatar from "components/MDAvatar";
import EvaluationStudent from "pages/students/evaluationStudent";

export default function StudentOverviewModal({ open, onClose, student }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState(null);
  const [loadingCheckin, setLoadingCheckin] = useState(false);
  const [errorCheckin, setErrorCheckin] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [lessonDaysByMonth, setLessonDaysByMonth] = useState({});
  const [lessonDays, setLessonDays] = useState([]);
  const [checkinColumns, setCheckinColumns] = useState([]);
  const [checkinRows, setCheckinRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const feedbacksPerPage = 3;

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

    // Lấy dữ liệu check-in
    const fetchCheckinData = async () => {
      setLoadingCheckin(true);
      setErrorCheckin("");
      try {
        const studentData = await studentService.getStudentById(student.id);
        const classId = studentData.class?.id;

        if (!classId) {
          setErrorCheckin("No class found for this student.");
          setLoadingCheckin(false);
          return;
        }

        // Lấy danh sách lịch học của lớp
        const lessons = await lessonByScheduleService.getAllLessonBySchedulesOfClass(classId);
        const checkins = await checkinService.getAllCheckinOfStudent(student.id);

        // Nhóm lịch học theo tháng
        const groupedByMonth = {};
        lessons.forEach((lesson) => {
          const lessonDate = new Date(lesson.date);
          const year = lessonDate.getFullYear();
          const month = lessonDate.getMonth() + 1;
          const day = lessonDate.getDate();

          const monthKey = `${year}-${month.toString().padStart(2, "0")}`;
          if (!groupedByMonth[monthKey]) {
            groupedByMonth[monthKey] = new Set();
          }
          groupedByMonth[monthKey].add(day);
        });

        // Chuyển Set thành mảng và sắp xếp
        Object.keys(groupedByMonth).forEach((key) => {
          groupedByMonth[key] = Array.from(groupedByMonth[key]).sort((a, b) => a - b);
        });

        setLessonDaysByMonth(groupedByMonth);

        // Mặc định chọn tháng hiện tại
        const today = new Date();
        const defaultMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        setSelectedMonth(defaultMonth);

        // Tạo dữ liệu check-in cho học sinh
        const checkinRow = { studentName: student.name };
        if (groupedByMonth[defaultMonth]) {
          groupedByMonth[defaultMonth].forEach((day) => {
            const checkinDate = new Date(today.getFullYear(), today.getMonth(), day);
            const formattedDate = checkinDate.toLocaleDateString("en-CA", {
              timeZone: "Asia/Ho_Chi_Minh",
            });

            const hasLesson = lessons.some(
              (lesson) =>
                lesson.class?.id === classId &&
                new Date(lesson.date).toLocaleDateString("en-CA", {
                  timeZone: "Asia/Ho_Chi_Minh",
                }) === formattedDate
            );

            if (hasLesson) {
              const checkin = checkins.find(
                (checkin) =>
                  checkin.student?.id === student.id &&
                  new Date(checkin.date).toLocaleDateString("en-CA", {
                    timeZone: "Asia/Ho_Chi_Minh",
                  }) === formattedDate
              );
              if (checkin) {
                if (checkin.present === 1) {
                  checkinRow[`day${day}`] = "✔";
                } else if (checkin.present === 0) {
                  checkinRow[`day${day}`] = "✖";
                } else if (checkin.present === 2) {
                  checkinRow[`day${day}`] = "🕒";
                }
              } else {
                checkinRow[`day${day}`] = "✖";
              }
            } else {
              checkinRow[`day${day}`] = "-";
            }
          });
        }
        setCheckinRows([checkinRow]);
      } catch (err) {
        setErrorCheckin("Error fetching check-in data.");
        console.error(err);
      } finally {
        setLoadingCheckin(false);
      }
    };

    fetchFeedbacks();
    fetchCheckinData();
  }, [student, open]);

  // Cập nhật cột khi thay đổi tháng
  useEffect(() => {
    if (selectedMonth && lessonDaysByMonth[selectedMonth]) {
      const days = lessonDaysByMonth[selectedMonth];
      setLessonDays(days);

      // Tạo cột cho DataTable
      const dynamicColumns = [
        { Header: "Student Name", accessor: "studentName", width: "20%" },
        ...days.map((day) => ({
          Header: `${day}`,
          accessor: `day${day}`,
          width: "5%",
          align: "center",
        })),
      ];
      setCheckinColumns(dynamicColumns);
    } else {
      setLessonDays([]);
      setCheckinColumns([{ Header: "Student Name", accessor: "studentName", width: "20%" }]);
      setCheckinRows([]);
    }
  }, [selectedMonth, lessonDaysByMonth]);

  const formatDate = (isoString) => {
    return format(new Date(isoString), "dd/MM/yyyy HH:mm");
  };

  // Logic phân trang cho feedback
  const totalFeedbackPages = Math.ceil(feedbacks.length / feedbacksPerPage);
  const indexOfLastFeedback = currentPage * feedbacksPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
  const currentFeedbacks = feedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Chú thích trạng thái check-in
  const checkinLegend = [
    { symbol: "✔", description: "Có mặt" },
    { symbol: "✖", description: "Nghỉ học" },
    { symbol: "🕒", description: "Đi trễ" },
    { symbol: "-", description: "Không có lịch học" },
  ];

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
          <EvaluationStudent studentId={student?.id} colors={colors} />
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
          ) : feedbacks.length === 0 ? (
            <MDTypography variant="body2">No feedback available.</MDTypography>
          ) : (
            <>
              <Grid container spacing={2}>
                {currentFeedbacks.map((fb) => (
                  <Grid item xs={12} sm={6} md={4} key={fb.id}>
                    <Card
                      sx={{
                        padding: 2,
                        borderRadius: "8px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                        borderLeft:
                          fb.type === "positive"
                            ? `4px solid ${colors.midGreen}`
                            : `4px solid ${colors.error}`,
                      }}
                    >
                      <MDBox display="flex" alignItems="center" mb={1}>
                        <MDAvatar src={fb.student?.imgUrl} alt={fb.student?.name} size="sm" />
                        <MDTypography
                          variant="h6"
                          sx={{
                            ml: 2,
                            fontWeight: "medium",
                            color: colors.darkGreen,
                          }}
                        >
                          {fb.title || "No Title"}
                        </MDTypography>
                      </MDBox>
                      <MDTypography variant="body2" sx={{ mb: 1 }}>
                        <strong>Description:</strong> {fb.description || "No Description"}
                      </MDTypography>
                      <MDTypography variant="body2">
                        <strong>Created At:</strong> {fb.datetime ? formatDate(fb.datetime) : "N/A"}
                      </MDTypography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <MDBox display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalFeedbackPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: colors.midGreen,
                      "&.Mui-selected": {
                        backgroundColor: colors.highlightGreen,
                        color: colors.white,
                      },
                      "&:hover": {
                        backgroundColor: colors.lightGreen,
                      },
                    },
                  }}
                />
              </MDBox>
            </>
          )}
          {/* Phần Check-in Statistics */}
          <MDTypography variant="h6" mt={3} sx={{ mb: 2, color: colors.deepGreen }}>
            Check-in Statistics
          </MDTypography>
          <MDBox display="flex" justifyContent="flex-end" mb={2}>
            <TextField
              label="Select Month"
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              InputLabelProps={{ shrink: true }}
              sx={{ backgroundColor: "white", borderRadius: "4px", width: "150px" }}
            />
          </MDBox>
          <MDBox mb={2}>
            <MDTypography variant="caption" color="text">
              Chú thích trạng thái:
              {checkinLegend.map((item, index) => (
                <span key={item.symbol}>
                  {index > 0 && " | "}
                  {item.symbol}: {item.description}
                </span>
              ))}
            </MDTypography>
          </MDBox>
          <MDBox>
            {loadingCheckin ? (
              <MDTypography variant="body2" color="info">
                Loading check-in data...
              </MDTypography>
            ) : errorCheckin ? (
              <MDTypography variant="body2" color="error">
                {errorCheckin}
              </MDTypography>
            ) : lessonDays.length === 0 ? (
              <MDTypography variant="body2">No lessons scheduled in this month.</MDTypography>
            ) : (
              <DataTable
                table={{ columns: checkinColumns, rows: checkinRows }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
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
