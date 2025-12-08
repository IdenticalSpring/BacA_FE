import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Card,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import studentService from "services/studentService";
import classService from "services/classService";
import teacherService from "services/teacherService";
import classTestScheduleService from "services/classTestScheduleService";
import StudentScoreService from "services/studentScoreService";
import { colors } from "assets/theme/color";
import Tooltip from "@mui/material/Tooltip";

const CommentCell = ({ value }) => (
  <Tooltip title={value || ""} placement="top" arrow>
    <div
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "250px",
        cursor: "pointer",
      }}
    >
      {value}
    </div>
  </Tooltip>
);

CommentCell.propTypes = {
  value: PropTypes.string,
};

const TableScoreTest = ({ onError }) => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  // Filter states
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTestDate, setSelectedTestDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  // Filter options
  const [students, setStudents] = useState([]);
  const [testDates, setTestDates] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const classData = await classService.getAllClasses();
        setClasses(classData);

        const teacherData = await teacherService.getAllTeachers();
        setTeachers(teacherData);

        // Lấy toàn bộ học sinh nếu chưa chọn lớp
        const studentData = await studentService.getAllStudents();
        setStudents(studentData);

        // Lấy toàn bộ ngày kiểm tra nếu chưa chọn lớp
        const classTestSchedules = await classTestScheduleService.getAllClassTestSchedule();
        const uniqueDates = [
          ...new Set(
            classTestSchedules
              .filter((schedule) => schedule.date)
              .map((schedule) => new Date(schedule.date).toISOString().split("T")[0])
          ),
        ];
        setTestDates(uniqueDates);
      } catch (error) {
        setNotification({
          open: true,
          message: "Không thể tải tùy chọn bộ lọc: " + error,
          severity: "error",
        });
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchClassBasedFilters = async () => {
      if (selectedClass) {
        try {
          // Lấy danh sách học sinh theo lớp
          const studentData = await studentService.getAllStudentsbyClass(selectedClass);
          setStudents(studentData);

          // Lấy danh sách lịch kiểm tra theo lớp
          const classTestSchedules = await classTestScheduleService.getAllClassTestSchedule();
          const filteredSchedules = classTestSchedules.filter(
            (schedule) => schedule.classID === selectedClass
          );
          const uniqueDates = [
            ...new Set(
              filteredSchedules
                .filter((schedule) => schedule.date)
                .map((schedule) => new Date(schedule.date).toISOString().split("T")[0])
            ),
          ];
          setTestDates(uniqueDates);

          // Reset các bộ lọc con khi thay đổi lớp
          setSelectedStudent("");
          setSelectedTestDate("");
        } catch (error) {
          setNotification({
            open: true,
            message: "Không thể tải dữ liệu học sinh hoặc ngày kiểm tra: " + error,
            severity: "error",
          });
        }
      } else {
        // Nếu không chọn lớp, lấy toàn bộ học sinh và ngày kiểm tra
        try {
          const studentData = await studentService.getAllStudents();
          setStudents(studentData);

          const classTestSchedules = await classTestScheduleService.getAllClassTestSchedule();
          const uniqueDates = [
            ...new Set(
              classTestSchedules
                .filter((schedule) => schedule.date)
                .map((schedule) => new Date(schedule.date).toISOString().split("T")[0])
            ),
          ];
          setTestDates(uniqueDates);
        } catch (error) {
          setNotification({
            open: true,
            message: "Không thể tải dữ liệu học sinh hoặc ngày kiểm tra: " + error,
            severity: "error",
          });
        }
      }
    };

    fetchClassBasedFilters();
  }, [selectedClass]);

  const calculateAvgScore = (scores) => {
    const validScores = Object.values(scores).filter(
      (score) => score !== undefined && score !== null && !isNaN(parseFloat(score))
    );

    if (validScores.length === 0) {
      return "-";
    }

    const sum = validScores.reduce((acc, score) => acc + parseFloat(score), 0);
    return (sum / validScores.length).toFixed(2);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setNoData(false);
      try {
        // Lấy dữ liệu học sinh (theo lớp nếu đã chọn, nếu không thì lấy tất cả)
        let studentData = selectedClass
          ? await studentService.getAllStudentsbyClass(selectedClass)
          : await studentService.getAllStudents();

        // Lấy dữ liệu lớp và giáo viên
        const classData = await classService.getAllClasses();
        const teacherData = await teacherService.getAllTeachers();

        // Lấy lịch kiểm tra (lọc theo lớp nếu đã chọn)
        let classTestSchedules = await classTestScheduleService.getAllClassTestSchedule();
        if (selectedClass) {
          classTestSchedules = classTestSchedules.filter(
            (schedule) => schedule.classID === selectedClass
          );
        }
        if (selectedTestDate) {
          classTestSchedules = classTestSchedules.filter(
            (schedule) =>
              schedule.date &&
              new Date(schedule.date).toISOString().split("T")[0] === selectedTestDate
          );
        }
        if (selectedTeacher) {
          const teacherClasses = await classService.getAllClassesByTeacher(selectedTeacher);
          const classIds = teacherClasses.map((cls) => cls.id);
          classTestSchedules = classTestSchedules.filter((schedule) =>
            classIds.includes(schedule.classID)
          );
        }

        // Lấy chi tiết điểm và điểm học sinh
        const scoreDetails = await StudentScoreService.getAllStudentScoreDetailsProcessed();
        const studentIds = selectedStudent ? [selectedStudent] : studentData.map((s) => s.id);
        const studentScores = await StudentScoreService.getCombinedStudentScores(studentIds);

        // Tạo map để tra cứu nhanh
        const studentMap = studentData.reduce((acc, student) => {
          acc[student.id] = student.name;
          return acc;
        }, {});

        const classMap = classData.reduce((acc, cls) => {
          acc[cls.id] = cls.name;
          return acc;
        }, {});

        const teacherMap = teacherData.reduce((acc, teacher) => {
          acc[teacher.id] = teacher.name;
          return acc;
        }, {});

        const testScheduleMap = classTestSchedules.reduce((acc, schedule) => {
          acc[schedule.id] = {
            date: schedule.date ? new Date(schedule.date).toISOString().split("T")[0] : "-",
            classID: schedule.classID,
            teacherID: classData.find((cls) => cls.id === schedule.classID)?.teacherID,
          };
          return acc;
        }, {});

        // Kết hợp dữ liệu với các bộ lọc
        const combinedData = studentScores
          .filter((score) => {
            const matchesStudent = !selectedStudent || score.studentID === selectedStudent;
            const matchesTestDate =
              !selectedTestDate ||
              testScheduleMap[score.classTestScheduleID]?.date === selectedTestDate;
            return matchesStudent && matchesTestDate;
          })
          .map((score) => {
            const detail =
              scoreDetails.find((d) => d.studentScoreID === score.studentScoreID) || {};
            const schedule = testScheduleMap[score.classTestScheduleID] || {};
            return {
              key: score.studentScoreID,
              studentName: studentMap[score.studentID] || "Không xác định",
              testDate: schedule.date || "-",
              className: classMap[schedule.classID] || "Không xác định",
              teacherName: teacherMap[schedule.teacherID] || "Không xác định",
              skillScores: detail.scores || {},
              avgScore: calculateAvgScore(detail.scores || {}),
              teacherComment: score.teacherComment || "-",
            };
          });

        if (combinedData.length === 0) {
          setNoData(true);
        } else {
          setNoData(false);
        }

        setDataSource(combinedData);
      } catch (error) {
        const errorMessage = "Không thể tải dữ liệu: " + error;
        setNotification({ open: true, message: errorMessage, severity: "error" });
        if (onError) onError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedStudent, selectedTestDate, selectedClass, selectedTeacher, onError]);

  const uniqueSkills = Array.from(
    new Set(dataSource.flatMap((item) => Object.keys(item.skillScores)))
  );

  const baseColumns = [
    { Header: "Tên Học Sinh", accessor: "studentName", width: "20%" },
    { Header: "Tên Lớp", accessor: "className", width: "15%" },
    { Header: "Ngày Kiểm Tra", accessor: "testDate", width: "15%" },
    { Header: "Điểm Trung Bình", accessor: "avgScore", width: "10%" },
    {
      Header: "Nhận xét GV",
      accessor: "teacherComment",
      width: "25%",
      Cell: CommentCell,
    },
  ];

  const skillColumns = uniqueSkills.map((skill) => ({
    Header: skill,
    id: `skill_${skill}`,
    accessor: "skillScores",
    width: `${25 / Math.max(1, uniqueSkills.length)}%`,
    Cell: ({ value }) => value[skill] || "-",
  }));

  const columns = [...baseColumns, ...skillColumns];

  const rows = dataSource.map((item) => ({
    studentName: item.studentName,
    className: item.className,
    teacherName: item.teacherName,
    testDate: item.testDate,
    avgScore: item.avgScore,
    skillScores: item.skillScores,
    teacherComment: item.teacherComment || "-",
  }));

  const handleNotificationClose = (event, reason) => {
    if (reason === "clickaway") return;
    setNotification({ ...notification, open: false });
  };

  const isValidSeverity = ["success", "error", "warning", "info"].includes(notification.severity);

  return (
    <MDBox pt={3} pb={3}>
      <Card sx={{ backgroundColor: colors.cardBg, boxShadow: `0 4px 12px ${colors.softShadow}` }}>
        <MDBox
          mx={2}
          mt={-3}
          py={3}
          px={2}
          variant="gradient"
          borderRadius="lg"
          sx={{ backgroundColor: colors.deepGreen }}
        >
          <MDTypography variant="h6" sx={{ color: colors.white }}>
            Điểm Học Sinh
          </MDTypography>
        </MDBox>
        <MDBox pt={3} px={3}>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Lớp</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="Lớp"
                  sx={{ height: "40px" }}
                >
                  <MenuItem value="">Tất Cả Lớp</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth disabled={!selectedClass}>
                <InputLabel>Ngày Kiểm Tra</InputLabel>
                <Select
                  value={selectedTestDate}
                  onChange={(e) => setSelectedTestDate(e.target.value)}
                  label="Ngày Kiểm Tra"
                  sx={{ height: "40px" }}
                >
                  <MenuItem value="">Tất Cả Ngày</MenuItem>
                  {testDates.map((date) => (
                    <MenuItem key={date} value={date}>
                      {date}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth disabled={!selectedClass}>
                <InputLabel>Học Sinh</InputLabel>
                <Select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  label="Học Sinh"
                  sx={{ height: "40px" }}
                >
                  <MenuItem value="">Tất Cả Học Sinh</MenuItem>
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {loading ? (
            <MDBox display="flex" justifyContent="center" py={3}>
              <CircularProgress sx={{ color: colors.deepGreen }} />
            </MDBox>
          ) : noData ? (
            <MDBox display="flex" justifyContent="center" py={3}>
              <MDTypography variant="body2" color="textSecondary">
                Không có dữ liệu cho bộ lọc đã chọn
              </MDTypography>
            </MDBox>
          ) : (
            <DataTable
              table={{ columns, rows }}
              isSorted={false}
              entriesPerPage={{ defaultValue: 10, entries: [5, 10, 15, 20] }}
              showTotalEntries={true}
              noEndBorder
              sx={{
                "& .MuiTableHead-root": { backgroundColor: colors.tableHeaderBg },
                "& .MuiTableRow-root:hover": { backgroundColor: colors.tableRowHover },
              }}
            />
          )}
        </MDBox>
      </Card>
      {isValidSeverity && (
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleNotificationClose}
            severity={notification.severity}
            sx={{
              width: "100%",
              backgroundColor:
                notification.severity === "success" ? colors.safeGreen : colors.errorRed,
              color: colors.white,
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </MDBox>
  );
};

TableScoreTest.propTypes = {
  onError: PropTypes.func,
};

export default TableScoreTest;
