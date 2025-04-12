import { useEffect, useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
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

function CheckinManagement() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClass, setSelectedClass] = useState(""); // State cho lớp được chọn
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]); // State lưu danh sách lớp
  const [selectedMonth, setSelectedMonth] = useState("");
  const [lessonDaysByMonth, setLessonDaysByMonth] = useState({});
  const [lessonDays, setLessonDays] = useState([]);

  // Fetch danh sách giáo viên, lớp và lessonBySchedule
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch danh sách giáo viên
        const teacherData = await teacherService.getAllTeachers();
        setTeachers(teacherData);

        // Fetch danh sách lớp
        const classData = await classService.getAllClasses(); // Giả định có API này
        setClasses(classData);

        // Fetch danh sách ngày từ lessonBySchedule và nhóm theo tháng
        const lessons = await lessonByScheduleService.getAllLessonBySchedules();
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
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Error fetching teachers, classes, or lesson schedules!");
      }
    };

    fetchInitialData();
  }, []);

  // Cập nhật cột khi chọn tháng
  useEffect(() => {
    if (selectedMonth && lessonDaysByMonth[selectedMonth]) {
      const days = lessonDaysByMonth[selectedMonth];
      setLessonDays(days);

      // Tạo cột cho bảng
      const dynamicColumns = [
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
        { Header: "Student Name", accessor: "studentName", width: "20%" },
        { Header: "Teacher", accessor: "teacher", width: "20%" },
      ]);
    }
  }, [selectedMonth, lessonDaysByMonth]);

  // Lấy dữ liệu học sinh, lớp và check-in
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const students = await studentService.getAllStudents();
        const checkins = await checkinService.getAllCheckins();
        const lessons = await lessonByScheduleService.getAllLessonBySchedules();

        // Tạo hàng cho bảng
        const formattedRows = await Promise.all(
          students.map(async (student) => {
            let row = {
              id: student.id,
              studentName: student.name,
              teacher: "N/A",
              teacherId: null,
              classId: student.class?.id || null, // Lưu classId để lọc
            };

            // Lấy thông tin lớp và giáo viên
            if (student.class?.id) {
              try {
                const classData = await classService.getClassById(student.class.id);
                row.teacher = classData.teacher?.name || "N/A";
                row.teacherId = classData.teacher?.id || null;
              } catch (err) {
                console.error(`Error fetching class for student ${student.id}:`, err);
              }
            }

            // Thêm trạng thái check-in cho từng ngày có lịch học
            lessonDays.forEach((day) => {
              const [year, month] = selectedMonth.split("-").map(Number);
              const checkinDate = new Date(year, month - 1, day);
              const formattedDate = checkinDate.toISOString().split("T")[0]; // YYYY-MM-DD

              // Kiểm tra xem học sinh có lịch học vào ngày đó không
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
                    row[`day${day}`] = "✔"; // Có mặt
                  } else if (checkin.present === 0) {
                    row[`day${day}`] = "✖"; // Nghỉ học
                  } else if (checkin.present === 2) {
                    row[`day${day}`] = "🕒"; // Đi trễ
                  }
                } else {
                  row[`day${day}`] = "✖"; // Có lịch học nhưng chưa check-in
                }
              } else {
                row[`day${day}`] = "-"; // Không có lịch học
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
  }, [lessonDays, selectedMonth]);

  // Lọc dữ liệu theo tên, giáo viên và lớp
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const nameMatch = (row.studentName || "").toLowerCase().includes(searchName.toLowerCase());
      const teacherMatch = selectedTeacher ? row.teacherId === selectedTeacher : true;
      const classMatch = selectedClass ? row.classId === selectedClass : true;
      return nameMatch && teacherMatch && classMatch;
    });
  }, [rows, searchName, selectedTeacher, selectedClass]);

  // Xử lý thay đổi tháng
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Xử lý thay đổi giáo viên
  const handleTeacherChange = (event) => {
    setSelectedTeacher(event.target.value);
  };

  // Xử lý thay đổi lớp
  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  // Chú thích trạng thái check-in
  const checkinLegend = [
    { symbol: "✔", description: "Có mặt" },
    { symbol: "✖", description: "Nghỉ học" },
    { symbol: "🕒", description: "Đi trễ" },
    { symbol: "-", description: "Không có lịch học" },
  ];

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
                borderRadius="lg"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ backgroundColor: colors.deepGreen, color: colors.white }}
              >
                <MDTypography variant="h6" color="white">
                  Check-in Management
                </MDTypography>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    "&:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={() => message.info("Create check-in functionality coming soon!")}
                >
                  Create
                </Button>
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
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CheckinManagement;
