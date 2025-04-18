import { useEffect, useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import studentService from "services/studentService";
import classService from "services/classService";
import checkinService from "services/checkinService";
import lessonByScheduleService from "services/lessonByScheduleService";
import teacherService from "services/teacherService";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { colors } from "assets/theme/color";
import { message } from "antd";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

function CheckinManagement({ classId }) {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClass, setSelectedClass] = useState(classId || "");
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [lessonDaysByMonth, setLessonDaysByMonth] = useState({});
  const [lessonDays, setLessonDays] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const teacherData = await teacherService.getAllTeachers();
        setTeachers(teacherData);

        const classData = await classService.getAllClasses();
        setClasses(classData);

        const lessons = await lessonByScheduleService.getAllLessonBySchedules();
        const groupedByMonth = {};

        lessons
          .filter((lesson) => !classId || lesson.class?.id === classId)
          .forEach((lesson) => {
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

        Object.keys(groupedByMonth).forEach((key) => {
          groupedByMonth[key] = Array.from(groupedByMonth[key]).sort((a, b) => a - b);
        });

        setLessonDaysByMonth(groupedByMonth);

        const today = new Date();
        const defaultMonth = `${today.getFullYear()}-${(today.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        setSelectedMonth(defaultMonth);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Error fetching teachers, classes, or lesson schedules!");
      }
    };

    fetchInitialData();
  }, [classId]);

  // Hàm mở modal và hiển thị ghi chú
  const handleOpenModal = (note) => {
    setSelectedNote(note || "Không có ghi chú");
    setOpenModal(true);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedNote("");
  };

  // Update columns based on selected month
  useEffect(() => {
    if (selectedMonth && lessonDaysByMonth[selectedMonth]) {
      const days = lessonDaysByMonth[selectedMonth];
      setLessonDays(days);

      const dynamicColumns = [
        { Header: "Avatar", accessor: "avatar", width: "10%", align: "center" },
        { Header: "Student Name", accessor: "studentName", width: "20%" },
        { Header: "Teacher", accessor: "teacher", width: "20%" },
        ...days.map((day) => ({
          Header: `${day}`,
          accessor: `day${day}`,
          width: "5%",
          align: "center",
        })),
      ];
      setColumns(dynamicColumns);
    } else {
      setLessonDays([]);
      setColumns([
        { Header: "Avatar", accessor: "avatar", width: "10%", align: "center" },
        { Header: "Student Name", accessor: "studentName", width: "20%" },
        { Header: "Teacher", accessor: "teacher", width: "20%" },
      ]);
    }
  }, [selectedMonth, lessonDaysByMonth]);

  // Fetch student and check-in data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const students = await studentService.getAllStudents();
        const checkins = await checkinService.getAllCheckins();
        const lessons = await lessonByScheduleService.getAllLessonBySchedules();

        const filteredStudents = classId
          ? students.filter((student) => student.class?.id === classId)
          : students;

        const formattedRows = await Promise.all(
          filteredStudents.map(async (student) => {
            let row = {
              id: student.id,
              studentName: student.name,
              teacher: "N/A",
              teacherId: null,
              classId: student.class?.id || null,
              avatar: student.imgUrl ? (
                <img
                  src={student.imgUrl}
                  alt={student.name}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: colors.midGreen,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {student.name.charAt(0).toUpperCase()}
                </div>
              ),
            };

            if (student.class?.id) {
              try {
                const classData = await classService.getClassById(student.class.id);
                row.teacher = classData.teacher?.name || "N/A";
                row.teacherId = classData.teacher?.id || null;
              } catch (err) {
                console.error(`Error fetching class for student ${student.id}:`, err);
              }
            }

            lessonDays.forEach((day) => {
              const [year, month] = selectedMonth.split("-").map(Number);
              const checkinDate = new Date(year, month - 1, day);
              const formattedDate = checkinDate.toISOString().split("T")[0];

              const hasLesson = lessons.some(
                (lesson) =>
                  lesson.class?.id === student.class?.id &&
                  new Date(lesson.date).toISOString().split("T")[0] === formattedDate
              );

              if (hasLesson) {
                const checkin = checkins.find(
                  (checkin) =>
                    checkin.student?.id === student.id &&
                    new Date(checkin.date).toISOString().split("T")[0] === formattedDate
                );
                if (checkin) {
                  if (checkin.present === 1) {
                    row[`day${day}`] = (
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOpenModal(checkin.note)}
                      >
                        ✔
                      </span>
                    );
                  } else if (checkin.present === 0) {
                    row[`day${day}`] = (
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOpenModal(checkin.note)}
                      >
                        ✖
                      </span>
                    );
                  } else if (checkin.present === 2) {
                    row[`day${day}`] = (
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOpenModal(checkin.note)}
                      >
                        🕒
                      </span>
                    );
                  }
                } else {
                  row[`day${day}`] = "✖";
                }
              } else {
                row[`day${day}`] = "-";
              }
            });

            return row;
          })
        );

        setRows(formattedRows);
      } catch (err) {
        setError("Error fetching check-in data!");
        console.error(err);
        message.error("Error fetching check-in data!");
      } finally {
        setLoading(false);
      }
    };

    if (lessonDays.length > 0) {
      fetchData();
    }
  }, [lessonDays, selectedMonth, classId]);

  // Filter rows based on search and selections
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const nameMatch = (row.studentName || "").toLowerCase().includes(searchName.toLowerCase());
      const teacherMatch = selectedTeacher ? row.teacherId === selectedTeacher : true;
      const classMatch = selectedClass ? row.classId === selectedClass : true;
      return nameMatch && teacherMatch && classMatch;
    });
  }, [rows, searchName, selectedTeacher, selectedClass]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleTeacherChange = (event) => {
    setSelectedTeacher(event.target.value);
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const checkinLegend = [
    { symbol: "✔", description: "Có mặt" },
    { symbol: "✖", description: "Nghỉ học" },
    { symbol: "🕒", description: "Đi trễ" },
    { symbol: "-", description: "Không có lịch học" },
  ];

  // Modal style
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <MDBox pt={3} pb={3}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              borderRadius="lg"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ backgroundColor: colors.deepGreen, color: colors.white }}
            >
              <MDTypography variant="h6" color="white">
                Check-in Management
              </MDTypography>
            </MDBox>
            <MDBox
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={2}
              px={2}
              py={1}
            >
              <TextField
                label="Select Month"
                type="month"
                value={selectedMonth}
                onChange={handleMonthChange}
                InputLabelProps={{ shrink: true }}
                sx={{ backgroundColor: "white", borderRadius: "4px", width: "150px" }}
              />
              <TextField
                label="Search by Student Name"
                variant="outlined"
                size="small"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                sx={{ backgroundColor: "white", borderRadius: "4px" }}
              />
              <TextField
                select
                label="Filter by Teacher"
                value={selectedTeacher}
                onChange={handleTeacherChange}
                size="small"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "4px",
                  minWidth: "150px",
                  "& .MuiInputBase-root": { height: "40px" },
                  "& .MuiOutlinedInput-input": { padding: "14px 14px" },
                }}
              >
                <MenuItem value="">All Teachers</MenuItem>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Filter by Class"
                value={selectedClass}
                onChange={handleClassChange}
                size="small"
                sx={{
                  backgroundColor: "white",
                  borderRadius: "4px",
                  minWidth: "150px",
                  "& .MuiInputBase-root": { height: "40px" },
                  "& .MuiOutlinedInput-input": { padding: "14px 14px" },
                }}
              >
                <MenuItem value="">All Classes</MenuItem>
                {classes.map((classItem) => (
                  <MenuItem key={classItem.id} value={classItem.id}>
                    {classItem.name || `Class ${classItem.id}`}
                  </MenuItem>
                ))}
              </TextField>
            </MDBox>
            <MDBox px={2} py={1}>
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
            <MDBox pt={3}>
              {loading ? (
                <MDTypography variant="h6" color="info" align="center">
                  Loading...
                </MDTypography>
              ) : error ? (
                <MDTypography variant="h6" color="error" align="center">
                  {error}
                </MDTypography>
              ) : lessonDays.length === 0 ? (
                <MDTypography variant="h6" color="info" align="center">
                  No lessons scheduled in this month
                </MDTypography>
              ) : (
                <DataTable
                  table={{ columns, rows: filteredRows }}
                  isSorted={false}
                  entriesPerPage={10}
                  showTotalEntries={false}
                  noEndBorder
                />
              )}
            </MDBox>
          </Card>
        </Grid>
      </Grid>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <MDTypography id="modal-modal-title" variant="h6" component="h2">
            Note
          </MDTypography>
          <MDTypography id="modal-modal-description" sx={{ mt: 2 }}>
            {selectedNote}
          </MDTypography>
          <MDBox mt={3} display="flex" justifyContent="flex-end">
            <Button onClick={handleCloseModal} color="primary">
              Close
            </Button>
          </MDBox>
        </Box>
      </Modal>
    </MDBox>
  );
}

CheckinManagement.propTypes = {
  classId: PropTypes.string,
};

export default CheckinManagement;
