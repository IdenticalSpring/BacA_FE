import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Card,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Table, Button as AntButton, Modal, Descriptions, Tag } from "antd";
import { DeleteOutlined, DownOutlined, RightOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import studentService from "services/studentService";
import classService from "services/classService";
import teacherService from "services/teacherService";
import classTestScheduleService from "services/classTestScheduleService";
import StudentScoreService from "services/studentScoreService";
import testSkillService from "services/testSkillService";
import assessmentService from "services/assessmentService";
import { colors } from "assets/theme/color";
import EditScoreModal from "../teachers/EditScoreModal";

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
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scoreToDelete, setScoreToDelete] = useState(null);
  // Edit score modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editScoreData, setEditScoreData] = useState(null);  
  const [editLoading, setEditLoading] = useState(false);
  // Test skills and assessments for edit modal
  const [testSkills, setTestSkills] = useState([]);
  const [selectedTestSkills, setSelectedTestSkills] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [previousScores, setPreviousScores] = useState([]);
  // Expanded Keys for Ant Design Table
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  // View detail modal for mobile
  const [viewDetailModalVisible, setViewDetailModalVisible] = useState(false);
  const [viewDetailData, setViewDetailData] = useState(null);
  
  // Responsive hook
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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

    const fetchSkillsAndAssessments = async () => {
      try {
        const [skills, assmts] = await Promise.all([
          testSkillService.getAllTestSkill(),
          assessmentService.getAllAssessments(),
        ]);
        setTestSkills(skills || []);
        setAssessments(assmts || []);
      } catch (err) {
        setNotification({ open: true, message: "Không thể tải test skills/assessments: " + err, severity: "warning" });
      }
    };

    fetchFilterOptions();
    fetchSkillsAndAssessments();
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
          const classInfo = classData.find((cls) => cls.id === schedule.classID);
          acc[schedule.id] = {
            date: schedule.date ? new Date(schedule.date).toISOString().split("T")[0] : "-",
            classID: schedule.classID,
            // Lấy teacherID từ teacher object hoặc trực tiếp từ teacherID field
            teacherID: classInfo?.teacher?.id || classInfo?.teacherID || null,
            // Lưu trực tiếp tên giáo viên nếu có trong class data
            teacherNameDirect: classInfo?.teacher?.name || null,
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
            
            // Ưu tiên lấy tên từ teacherMap, nếu không có thì lấy từ teacherNameDirect
            const resolvedTeacherName = 
              teacherMap[schedule.teacherID] || 
              schedule.teacherNameDirect || 
              "Không xác định";
            
            return {
              key: score.studentScoreID,
              studentScoreID: score.studentScoreID,
              studentID: score.studentID,
              assessmentID: score.assessmentID || null,
              classTestScheduleID: score.classTestScheduleID,
              studentName: studentMap[score.studentID] || "Không xác định",
              testDate: schedule.date || "-",
              className: classMap[schedule.classID] || "Không xác định",
              teacherName: resolvedTeacherName,
              skillScores: detail.scores || {},
              scores: detail.scores || {},
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
    new Set(dataSource.flatMap((item) => Object.keys(item.skillScores || {})))
  ).sort();

  // Helper function to get score color
  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return "default";
    if (numScore >= 8.5) return "success";
    if (numScore >= 7) return "processing";
    if (numScore >= 5) return "warning";
    return "error";
  };

  // Handle view detail click
  const handleViewDetailClick = (record) => {
    setViewDetailData(record);
    setViewDetailModalVisible(true);
  };

  const handleViewDetailClose = () => {
    setViewDetailModalVisible(false);
    setViewDetailData(null);
  };

  // Cấu hình cột cho Desktop (đầy đủ thông tin)
  const desktopColumns = [
    {
      title: "Tên Học Sinh",
      dataIndex: "studentName",
      key: "studentName",
      width: 200,
      fixed: "left",
      render: (text) => <MDTypography variant="caption" fontWeight="bold">{text}</MDTypography>,
    },
    {
      title: "Tên Lớp",
      dataIndex: "className",
      key: "className",
      width: 150,
      render: (text) => <MDTypography variant="caption" fontWeight="medium">{text}</MDTypography>,
    },
    {
      title: "Ngày Kiểm Tra",
      dataIndex: "testDate",
      key: "testDate",
      width: 120,
      render: (text) => <MDTypography variant="caption">{text}</MDTypography>,
    },
    // Tạo cột động cho các kỹ năng
    ...uniqueSkills.map((skill) => ({
      title: skill,
      dataIndex: ["skillScores", skill],
      key: skill,
      width: 100,
      align: "center",
      render: (value) => <MDTypography variant="caption">{value || "-"}</MDTypography>,
    })),
    {
      title: "Điểm TB",
      dataIndex: "avgScore",
      key: "avgScore",
      width: 100,
      align: "center",
      fixed: "right",
      render: (value) => <MDTypography variant="caption" fontWeight="bold">{value}</MDTypography>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <MDBox display="flex" gap={1} justifyContent="center">
          <AntButton
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record)}
          />
          <AntButton
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
          />
        </MDBox>
      ),
    },
  ];

  // Cấu hình cột cho Mobile (rút gọn với nút Xem chi tiết)
  const mobileColumns = [
    {
      title: "Học Sinh",
      dataIndex: "studentName",
      key: "studentName",
      width: 120,
      render: (text) => <MDTypography variant="caption" fontWeight="bold">{text}</MDTypography>,
    },
    {
      title: "Điểm TB",
      dataIndex: "avgScore",
      key: "avgScore",
      width: 80,
      align: "center",
      render: (value) => (
        <Tag color={getScoreColor(value)} style={{ fontWeight: "bold" }}>
          {value}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <MDBox display="flex" gap={0.5} justifyContent="center" flexWrap="wrap">
          <AntButton
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetailClick(record)}
            style={{ backgroundColor: colors.midGreen, borderColor: colors.midGreen }}
          >
            Xem
          </AntButton>
          <AntButton
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record)}
          />
          <AntButton
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
          />
        </MDBox>
      ),
    },
  ];

  // Chọn columns dựa trên responsive
  const columns = isMobile ? mobileColumns : desktopColumns;

  const handleDeleteClick = (row) => {
    setScoreToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Call delete API here
      await StudentScoreService.deleteScoreStudent(scoreToDelete.key);
      
      setNotification({
        open: true,
        message: "Xóa điểm thành công",
        severity: "success",
      });
      
      // Refresh data after delete
      setDataSource(dataSource.filter(item => item.key !== scoreToDelete.key));
      setDeleteDialogOpen(false);
      setScoreToDelete(null);
    } catch (error) {
      setNotification({
        open: true,
        message: "Không thể xóa điểm: " + error,
        severity: "error",
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setScoreToDelete(null);
  };

  const handleEditClick = (record) => {
    setEditScoreData(record);
    setEditModalVisible(true);
  };

  const handleEditModalOk = (updatedScore) => {
    // Update the displayed table row with the updated score data
    setDataSource((prev) =>
      prev.map((item) =>
        item.key === updatedScore.studentScoreID
          ? {
              ...item,
              skillScores: updatedScore.scores || item.skillScores,
              avgScore: calculateAvgScore(updatedScore.scores || item.skillScores),
              teacherComment: updatedScore.teacherComment ?? item.teacherComment,
            }
          : item
      )
    );
    setEditModalVisible(false);
    setEditScoreData(null);
  };

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
    setEditScoreData(null);
  };

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
            <Table
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              rowKey="key"
              scroll={{ x: 'max-content' }}
              pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [5, 10, 15, 20] }}
              expandable={{
                expandedRowRender: (record) => (
                  <MDBox 
                    p={2} 
                    sx={{ 
                      backgroundColor: "#f9f9f9", 
                      borderRadius: "8px", 
                      border: `1px solid ${colors.paleGreen || "#eee"}` 
                    }}
                  >
                    <MDTypography variant="h6" gutterBottom color="dark">
                      Teacher Comment:
                    </MDTypography>
                    <MDTypography 
                      variant="body2" 
                      color="textSecondary" 
                      sx={{ 
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word"
                      }}
                    >
                      {record.teacherComment || "Không có nhận xét"}
                    </MDTypography>
                  </MDBox>
                ),
                expandedRowKeys: expandedRowKeys,
                onExpand: (expanded, record) => {
                  const keys = expanded
                    ? [...expandedRowKeys, record.key]
                    : expandedRowKeys.filter((key) => key !== record.key);
                  setExpandedRowKeys(keys);
                },
                expandIcon: ({ expanded, onExpand, record }) =>
                  expanded ? (
                    <DownOutlined 
                      onClick={(e) => onExpand(record, e)} 
                      style={{ color: colors.deepGreen }} 
                    />
                  ) : (
                    <RightOutlined 
                      onClick={(e) => onExpand(record, e)} 
                      style={{ color: colors.deepGreen }} 
                    />
                  ),
              }}
            />
          )}
        </MDBox>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Xác nhận xóa</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2">
            Bạn có chắc chắn muốn xóa điểm của học sinh{" "}
            <strong>{scoreToDelete?.studentName}</strong> vào ngày{" "}
            <strong>{scoreToDelete?.testDate}</strong> không?
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Hủy
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Score Modal */}
      <EditScoreModal
                visible={editModalVisible}
                onCancel={handleEditModalCancel}
                onOk={handleEditModalOk}
                scoreData={editScoreData}
                testSkills={testSkills}
                assessments={assessments}
                studentName={editScoreData?.studentName}
                loading={editLoading}
      />

      {/* View Detail Modal for Mobile */}
      <Modal
        title={
          <MDTypography variant="h6" fontWeight="bold" style={{ color: colors.darkGreen }}>
            Chi tiết điểm số
          </MDTypography>
        }
        open={viewDetailModalVisible}
        onCancel={handleViewDetailClose}
        footer={[
          <Button key="edit" onClick={() => { handleViewDetailClose(); handleEditClick(viewDetailData); }} style={{ marginRight: 8 }}>
            Sửa điểm
          </Button>,
          <Button key="close" type="primary" onClick={handleViewDetailClose} style={{ backgroundColor: colors.midGreen, borderColor: colors.midGreen }}>
            Đóng
          </Button>,
        ]}
        width={400}
      >
        {viewDetailData && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Học sinh">
              <strong>{viewDetailData.studentName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Lớp">
              {viewDetailData.className}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kiểm tra">
              {viewDetailData.testDate}
            </Descriptions.Item>
            <Descriptions.Item label="Giáo viên">
              {viewDetailData.teacherName || "N/A"}
            </Descriptions.Item>
            {Object.entries(viewDetailData.skillScores || {}).map(([skill, score]) => (
              <Descriptions.Item key={skill} label={skill}>
                <Tag color={getScoreColor(score)} style={{ fontWeight: "bold" }}>
                  {score || "-"}/10
                </Tag>
              </Descriptions.Item>
            ))}
            <Descriptions.Item label="Điểm trung bình">
              <Tag color={getScoreColor(viewDetailData.avgScore)} style={{ fontWeight: "bold", fontSize: "14px" }}>
                {viewDetailData.avgScore}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Nhận xét">
              {viewDetailData.teacherComment || "Chưa có nhận xét"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

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
