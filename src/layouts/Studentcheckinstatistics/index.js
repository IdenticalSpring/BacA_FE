import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { colors } from "assets/theme/color";
import classService from "services/classService";
import studentService from "services/studentService";
import levelService from "services/levelService";
import { Button, Space, Tag } from "antd";
import lessonByScheduleService from "services/lessonByScheduleService";
import checkinService from "services/checkinService";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);
const daysOfWeek = [
  "Choose day of week",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const getStatusTag = (status) => {
  switch (status) {
    case 0:
      return (
        <Tag style={{ margin: 0 }} color="red">
          Absent
        </Tag>
      );
    case 1:
      return (
        <Tag style={{ margin: 0 }} color="green">
          Present
        </Tag>
      );
    case 2:
      return (
        <Tag style={{ margin: 0 }} color="gold">
          Permission
        </Tag>
      );
    default:
      return (
        <Tag style={{ margin: 0 }} color="gray">
          pending
        </Tag>
      );
  }
};
export default function StudentCheckinStatistics() {
  const [studentColumns] = useState([
    {
      Header: "Student Name",
      accessor: "name",
      width: "20%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer" }}
          className="truncate-text"
          onClick={() => {
            setSelectedStudent(row.original);
            setOpen(true);
          }}
        >
          {row.values.name}
        </span>
      ),
    },
    {
      Header: "Student Phone",
      accessor: "phone",
      width: "10%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer" }}
          className="truncate-text"
          onClick={() => {
            setSelectedStudent(row.original);
            setOpen(true);
          }}
        >
          {row.values.phone}
        </span>
      ),
    },
    {
      Header: "Student Image",
      accessor: "imgUrl",
      width: "30%",
      Cell: ({ row }) => (
        <img
          src={row.values.imgUrl}
          style={{ cursor: "pointer" }}
          className="truncate-text"
          onClick={() => {
            setSelectedStudent(row.original);
            setOpen(true);
          }}
        />
      ),
    },
    // { Header: "Actions", accessor: "actions", width: "20%" },
  ]);
  const [lessonByScheduleColumns] = useState([
    {
      Header: "Day of week",
      accessor: "dayOfWeek",
      width: "10%",
    },
    {
      Header: "Date",
      accessor: "date",
      width: "20%",
    },
    {
      Header: "Start time",
      accessor: "startTime",
      width: "20%",
    },
    {
      Header: "End time",
      accessor: "endTime",
      width: "20%",
    },
    {
      Header: "Status",
      accessor: "status",
      width: "30%",
      Cell: ({ row }) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100px",
            height: "40px",
          }}
        >
          {getStatusTag(row.values.status)}
        </div>
      ),
    },
    // { Header: "Actions", accessor: "actions", width: "20%" },
  ]);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [studentrows, setStudentRows] = useState([]);
  const [lessonBySchedulerows, setLessonByScheduleRows] = useState([]);
  const [loadingClass, setLoadingClass] = useState(false);
  const [errorClass, setErrorClass] = useState("");
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [errorStudent, setErrorStudent] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [levels, setLevels] = useState([]);
  const [classesData, setClassesData] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [studentsData, setStudentsData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [lessonBySchedule, setLessonBySchedule] = useState([]);
  const [loadingLessonBySchedule, setLoadingLessonBySchedule] = useState(false);
  const [errorLessonBySchedule, setErrorLessonBySchedule] = useState("");
  const [statusCount, setStatusCount] = useState({});
  const [open, setOpen] = useState(false);
  const [chartData, setChartData] = useState({});
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 768;
  useEffect(() => {
    fetchClasses();
  }, [levels]);
  useEffect(() => {
    fetchLevels();
  }, []);
  useEffect(() => {
    if (!selectedClass) {
      return;
    }
    const fetchStudents = async () => {
      setLoadingStudent(true);
      try {
        const data = await studentService.getAllStudentsbyClass(selectedClass.id);

        const formattedRows = data?.map((std) => ({
          id: std.id,
          name: std.name || "N/A",
          phone: std.phone || "N/A",
          imgUrl: std.imgUrl || "N/A",
        }));
        // console.log(formattedRows);
        setStudentRows(formattedRows);
        setStudentsData(data);
      } catch (err) {
        setErrorStudent(err);
      } finally {
        setLoadingStudent(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);
  //   console.log(selectedStudent);

  useEffect(() => {
    if (!selectedStudent) {
      return;
    }
    const fetchLessonBySchedules = async () => {
      setLoadingLessonBySchedule(true);
      const statusCountData = { absent: 0, present: 0, permission: 0, pending: 0 };
      try {
        const lessonByScheduleData = await lessonByScheduleService.getAllLessonBySchedulesOfClass(
          selectedClass.id
        );
        const checkinData = await checkinService.getAllCheckinOfStudent(selectedStudent.id);

        const formattedRows = lessonByScheduleData?.map((sch) => {
          const status =
            checkinData?.find((checkin) => checkin.lessonBySchedule.id === sch.id)?.present ??
            "pending";
          if (status === 0) statusCountData.absent++;
          else if (status === 1) statusCountData.present++;
          else if (status === 2) statusCountData.permission++;
          else statusCountData.pending++;
          return {
            id: sch.id,
            dayOfWeek: daysOfWeek[sch.schedule.dayOfWeek] || "N/A",
            date: sch.date || "N/A",
            startTime: sch.startTime || "N/A",
            endTime: sch.endTime || "N/A",
            endTime: sch.endTime || "N/A",
            status: status,
          };
        });
        // console.log(formattedRows);
        setStatusCount(statusCountData);
        setLessonByScheduleRows(formattedRows);
        // setLessonBySchedule(lessonByScheduleData);
      } catch (err) {
        setErrorLessonBySchedule(err);
        // console.log(err);
      } finally {
        setLoadingLessonBySchedule(false);
      }
    };
    fetchLessonBySchedules();
  }, [selectedStudent]);
  useEffect(() => {
    const data = {
      labels: ["Absent", "Present", "Permission", "Pending"],
      datasets: [
        {
          data: Object.values(statusCount),
          backgroundColor: ["#FF4D4F", "#52C41A", "#FAAD14", "#BFBFBF"],
          hoverOffset: 4,
        },
      ],
    };
    setChartData(data);
  }, [statusCount]);
  const fetchClasses = async () => {
    try {
      setLoadingClass(true);
      const data = await classService.getAllClasses();

      //   const formattedRows = data?.map(async (cls) => ({
      //     id: cls.id,
      //     name: cls.name,
      //     totalStudent: (await studentService.countAllStudentOfCall(cls.id)) ?? "0",
      //     // startDate: cls.startDate,
      //     // endDate: cls.endDate,
      //     teacher: cls.teacher?.name || "N/A",
      //     // actions: (
      //     //   <>
      //     //     <IconButton color="primary" onClick={() => handleEdit(cls)}>
      //     //       <EditIcon />
      //     //     </IconButton>
      //     //     {/* <IconButton color="secondary" onClick={() => handleDelete(cls.id)}>
      //     //       <DeleteIcon />
      //     //     </IconButton> */}
      //     //   </>
      //     // ),
      //   }));
      //   const row = await Promise.all(formattedRows);
      setClassesData(data);
      //   setClassRows(row);
    } catch (err) {
      setErrorClass("Lỗi khi tải dữ liệu lớp học!");
    } finally {
      setLoadingClass(false);
    }
  };
  const fetchLevels = async () => {
    try {
      const data = await levelService.getAllLevels();
      setLevels(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách level:", error);
    }
  };
  //   console.log(selectedClass);
  //   console.log(selectedStudent);

  return (
    <DashboardLayout>
      <style>
        {`
          .truncate-text {
          display: inline-block;
          max-width: 100px;
          white-space: nowrap; /* Ngăn chữ xuống dòng */
          overflow: hidden; /* Ẩn phần dư */
          text-overflow: ellipsis; /* Hiển thị "..." khi bị tràn */
        }
          `}
      </style>
      <DashboardNavbar />
      <MDBox pt={6} pb={3} mx={3}>
        <Grid container spacing={6} mx={isMobile ? -3 : -6} mt={-3}>
          <Card style={{ width: "100%" }}>
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
                Student Check In Statistics
              </MDTypography>
            </MDBox>

            <MDBox pt={3}>
              {loadingClass ? (
                <MDTypography variant="h6" color="info" align="center">
                  Loading...
                </MDTypography>
              ) : errorClass ? (
                <MDTypography variant="h6" color="error" align="center">
                  {errorClass}
                </MDTypography>
              ) : (
                <Grid container spacing={3}>
                  {/* Danh sách lớp */}
                  <Grid item xs={12} sm={3}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: isMobile ? "row" : "column",
                        gap: "10px",
                        flexWrap: isMobile ? "wrap" : "none",
                        padding: "10px 0",
                        height: isMobile ? "30vh" : "70vh",
                        maxHeight: isMobile ? "30vh" : "80vh",
                        overflow: "auto",
                        width: "100%",
                        padding: "0 10px",
                        justifyContent: "center",
                      }}
                    >
                      {classesData?.map((cls, index) => (
                        <Button
                          key={index}
                          //   type={}

                          onClick={() => setSelectedClass(cls)}
                          style={{
                            width: isMobile ? "40%" : "100%",
                            padding: "0 5px",
                            height: "45px",
                            backgroundColor: selectedClass?.id === cls?.id ? "#368A68" : "#8ED1B0",
                            color: selectedClass?.id === cls?.id ? "#fff" : "#000",
                            borderColor: selectedClass?.id === cls?.id ? "#A8E6C3" : "#FFFFFF",
                            transition: "all 0.4s",
                            scale: selectedClass?.id === cls?.id ? "1.05" : "1",
                          }}
                        >
                          {cls?.name}
                        </Button>
                      ))}
                    </div>
                  </Grid>

                  {/* Danh sách sinh viên */}
                  <Grid item xs={12} sm={9}>
                    {studentsData && (
                      <MDBox
                        pt={3}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          height: isMobile ? "30vh" : "70vh",
                          maxHeight: isMobile ? "30vh" : "80vh",
                          overflow: "auto",
                          width: "100%",
                        }}
                      >
                        {loadingStudent ? (
                          <MDTypography variant="h6" color="info" align="center">
                            Loading...
                          </MDTypography>
                        ) : errorStudent ? (
                          <MDTypography variant="h6" color="error" align="center">
                            {errorStudent}
                          </MDTypography>
                        ) : (
                          <>
                            {studentsData.length > 0 && (
                              <MDTypography variant="h6">
                                <p style={{ color: "#368A68" }}>Student List</p>
                              </MDTypography>
                            )}

                            {/* {studentsData?.map((std, index) => (
                              <Button
                                key={index}
                                type={selectedStudent?.id === std?.id ? "primary" : "default"}
                                onClick={() => setSelectedStudent(std)}
                                style={{ width: "100%", padding: "0 5px", height: "45px" }}
                              >
                                {std?.name}
                              </Button>
                            ))} */}
                            <DataTable
                              table={{ columns: studentColumns, rows: studentrows }}
                              isSorted={false}
                              entriesPerPage={false}
                              showTotalEntries={false}
                              noEndBorder
                            />
                          </>
                        )}
                      </MDBox>
                    )}
                  </Grid>
                </Grid>
              )}
            </MDBox>
          </Card>
        </Grid>
      </MDBox>
      <Footer />
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setLessonByScheduleRows([]);
        }}
        fullWidth
        maxWidth="xl" // Cỡ lớn nhất có thể
        PaperProps={{
          sx: {
            width: "90vw", // Chiếm 90% chiều rộng màn hình
            height: "90vh", // Chiếm 90% chiều cao màn hình
            maxWidth: "none", // Bỏ giới hạn mặc định
          },
        }}
      >
        <DialogTitle>{"Checkin Statistic"}</DialogTitle>
        <DialogContent sx={{ height: "100%", overflowY: "auto" }}>
          {loadingLessonBySchedule ? (
            <MDTypography variant="h6" color="info" align="center">
              Loading...
            </MDTypography>
          ) : errorLessonBySchedule ? (
            <MDTypography variant="h6" color="error" align="center">
              {errorLessonBySchedule}
            </MDTypography>
          ) : (
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
              <DataTable
                table={{
                  columns: lessonByScheduleColumns,
                  rows: lessonBySchedulerows,
                }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
              <div
                style={{
                  width: isMobile ? "300px" : "400px",
                  display: "flex",
                  alignItems: "start",
                }}
              >
                {chartData.datasets && <Pie data={chartData} />}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            // sx={{ color: colors.midGreen, " &:hover": { color: colors.darkGreen } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
StudentCheckinStatistics.propTypes = {
  value: PropTypes.func.isRequired,
  row: PropTypes.func.isRequired,
};
