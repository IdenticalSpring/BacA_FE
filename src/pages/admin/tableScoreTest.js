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

const TableScoreTest = ({ onError }) => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false); // New state for no data
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
        const studentData = await studentService.getAllStudents();
        setStudents(studentData);

        const classData = await classService.getAllClasses();
        setClasses(classData);

        const teacherData = await teacherService.getAllTeachers();
        setTeachers(teacherData);

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
          message: "Failed to load filter options: " + error,
          severity: "error",
        });
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setNoData(false); // Reset noData state before fetching
      try {
        // Fetch students (filtered by class if selected)
        let studentData = await studentService.getAllStudents();
        if (selectedClass) {
          studentData = await studentService.getAllStudentsbyClass(selectedClass);
        }

        // Fetch classes and teachers
        const classData = await classService.getAllClasses();
        const teacherData = await teacherService.getAllTeachers();

        // Fetch class test schedules (filtered by date or teacher)
        let classTestSchedules = await classTestScheduleService.getAllClassTestSchedule();
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

        // Fetch score details and student scores
        const scoreDetails = await StudentScoreService.getAllStudentScoreDetailsProcessed();
        const studentIds = selectedStudent ? [selectedStudent] : studentData.map((s) => s.id);
        const studentScores = await StudentScoreService.getCombinedStudentScores(studentIds);

        // Create maps for quick lookup
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

        // Combine data with filters applied
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
              studentName: studentMap[score.studentID] || "Unknown",
              testDate: schedule.date || "-",
              className: classMap[schedule.classID] || "Unknown",
              teacherName: teacherMap[schedule.teacherID] || "Unknown",
              skillScores: detail.scores || {},
              avgScore: detail.avgScore || "-",
            };
          });

        // Check if data is empty
        if (combinedData.length === 0) {
          setNoData(true);
        } else {
          setNoData(false);
        }

        setDataSource(combinedData);
      } catch (error) {
        const errorMessage = "Failed to load data: " + error;
        setNotification({ open: true, message: errorMessage, severity: "error" });
        if (onError) onError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedStudent, selectedTestDate, selectedClass, selectedTeacher, onError]);

  // Get unique skills
  const uniqueSkills = Array.from(
    new Set(dataSource.flatMap((item) => Object.keys(item.skillScores)))
  );

  // Define table columns
  const baseColumns = [
    { Header: "Student Name", accessor: "studentName", width: "20%" },
    { Header: "Class Name", accessor: "className", width: "15%" },
    // { Header: "Teacher Name", accessor: "teacherName", width: "15%" },
    { Header: "Test Date", accessor: "testDate", width: "15%" },
    { Header: "Average Score", accessor: "avgScore", width: "10%" },
  ];

  const skillColumns = uniqueSkills.map((skill) => ({
    Header: skill,
    id: `skill_${skill}`,
    accessor: "skillScores",
    width: `${25 / Math.max(1, uniqueSkills.length)}%`,
    Cell: ({ value }) => value[skill] || "-",
  }));

  const columns = [...baseColumns, ...skillColumns];

  // Prepare table rows
  const rows = dataSource.map((item) => ({
    studentName: item.studentName,
    className: item.className,
    teacherName: item.teacherName,
    testDate: item.testDate,
    avgScore: item.avgScore,
    skillScores: item.skillScores,
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
            Student Scores
          </MDTypography>
        </MDBox>
        <MDBox pt={3} px={3}>
          {/* Filter UI */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  label="Student"
                  sx={{
                    height: "40px",
                  }}
                >
                  <MenuItem value="">All Students</MenuItem>
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Test Date</InputLabel>
                <Select
                  value={selectedTestDate}
                  onChange={(e) => setSelectedTestDate(e.target.value)}
                  label="Test Date"
                  sx={{
                    height: "40px",
                  }}
                >
                  <MenuItem value="">All Dates</MenuItem>
                  {testDates.map((date) => (
                    <MenuItem key={date} value={date}>
                      {date}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="Class"
                  sx={{
                    height: "40px",
                  }}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  label="Teacher"
                  sx={{
                    height: "40px",
                  }}
                >
                  <MenuItem value="">All Teachers</MenuItem>
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid> */}
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
