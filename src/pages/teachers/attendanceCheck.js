import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Button,
  Select,
  Space,
  Card,
  Avatar,
  DatePicker,
  Row,
  Col,
  message,
  Breadcrumb,
  Spin,
  Grid,
  Modal,
  Form,
  Input,
} from "antd";
import {
  UserOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import studentService from "services/studentService";
import lessonByScheduleService from "services/lessonByScheduleService";
import teacherService from "services/teacherService";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

// Sử dụng color palette từ TeacherPage
const colors = {
  lightGreen: "#8ED1B0",
  deepGreen: "#368A68",
  white: "#FFFFFF",
  gray: "#F5F5F5",
  darkGray: "#333333",
  accent: "#FFD166",
  lightAccent: "#FFEDC2",
  darkGreen: "#224922",
  paleGreen: "#E8F5EE",
  midGreen: "#5FAE8C",
  errorRed: "#FF6B6B",
  mintGreen: "#C2F0D7",
  paleBlue: "#E6F7FF",
  softShadow: "rgba(0, 128, 96, 0.1)",
  emerald: "#2ECC71",
  highlightGreen: "#43D183",
  safeGreen: "#27AE60",
  borderGreen: "#A8E6C3",
};

const AttendanceCheck = () => {
  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  // State variables
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedLessonByScheduleId, setSelectedLessonByScheduleId] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [attendanceNote, setAttendanceNote] = useState("");

  // Form reference
  const [form] = Form.useForm();

  // Navigation
  const navigate = useNavigate();
  const location = useLocation();

  // Decode JWT to get user info
  const userId = jwtDecode(sessionStorage.getItem("token"));
  const teacherId = userId.userId;

  // Lấy thông tin từ location state khi chuyển trang
  useEffect(() => {
    if (location.state) {
      const { classId, students: studentsData, lessonByScheduleData } = location.state;

      if (classId) {
        setSelectedClass(classId);
      }

      if (studentsData && studentsData.length > 0) {
        setStudents(studentsData);
        // Khởi tạo trạng thái điểm danh
        const initialAttendance = studentsData.map((student) => ({
          studentId: student.id,
          present: 1, // Mặc định là có mặt (1)
          note: "",
        }));
        setAttendance(initialAttendance);
      } else {
        // Nếu không có dữ liệu học sinh từ state, tải từ API
        fetchStudents();
      }

      if (lessonByScheduleData && lessonByScheduleData.length > 0) {
        // Lọc các schedule cho ngày hiện tại
        const todayFormatted = new Date().toISOString().split("T")[0];
        const todaySchedules = lessonByScheduleData
          .filter((schedule) => schedule.date === todayFormatted)
          .map((schedule) => ({
            id: schedule.schedule.id,
            lessonByScheduleId: schedule.id, // Lưu lại lessonByScheduleId
            time: `${schedule.schedule.startTime} - ${schedule.schedule.endTime}`,
            fullData: schedule,
          }));

        setScheduleOptions(todaySchedules);
        if (todaySchedules.length > 0) {
          setSelectedSchedule(todaySchedules[0].id);
          setSelectedLessonByScheduleId(todaySchedules[0].lessonByScheduleId);
        }
      }

      setLoading(false);
    } else {
      // Không có state, quay lại trang TeacherPage
      message.warning("Missing class information. Redirecting back...");
      setTimeout(() => navigate("/teacherpage"), 1500);
    }
  }, [location.state, navigate]);

  // Fetch students nếu cần
  const fetchStudents = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const data = await studentService.getAllStudentsbyClass(selectedClass);
      setStudents(data);

      // Khởi tạo trạng thái điểm danh
      const initialAttendance = data.map((student) => ({
        studentId: student.id,
        present: 1, // Mặc định là có mặt (1)
        note: "",
      }));
      setAttendance(initialAttendance);
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedules cho ngày đã chọn
  const fetchSchedulesForDate = async (date) => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      // Format date to YYYY-MM-DD
      const formattedDate = date.toISOString().split("T")[0];

      const data = await lessonByScheduleService.getAllLessonBySchedulesOfClass(selectedClass);

      // Lọc schedule theo ngày đã chọn
      const dateSchedules = data
        .filter((schedule) => schedule.date === formattedDate)
        .map((schedule) => ({
          id: schedule.schedule.id,
          lessonByScheduleId: schedule.id, // Lưu lại lessonByScheduleId
          time: `${schedule.schedule.startTime} - ${schedule.schedule.endTime}`,
          fullData: schedule,
        }));

      setScheduleOptions(dateSchedules);
      if (dateSchedules.length > 0) {
        setSelectedSchedule(dateSchedules[0].id);
        setSelectedLessonByScheduleId(dateSchedules[0].lessonByScheduleId);
      } else {
        setSelectedSchedule(null);
        setSelectedLessonByScheduleId(null);
        message.info("No classes scheduled for selected date");
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      message.error("Failed to load class schedules");
    } finally {
      setLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date.toDate());
      fetchSchedulesForDate(date.toDate());
      // Reset attendance when date changes
      resetAttendance();
    }
  };

  // Reset attendance state
  const resetAttendance = () => {
    const initialAttendance = students.map((student) => ({
      studentId: student.id,
      present: 1, // Mặc định là có mặt (1)
      note: "",
    }));
    setAttendance(initialAttendance);
    setHasSubmitted(false);
  };

  // Handle status change
  const handleStatusChange = (studentId, present) => {
    setAttendance((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, present } : item))
    );
  };

  // Handle schedule change
  const handleScheduleChange = (scheduleId) => {
    setSelectedSchedule(scheduleId);
    // Tìm lessonByScheduleId tương ứng
    const schedule = scheduleOptions.find((s) => s.id === scheduleId);
    if (schedule) {
      setSelectedLessonByScheduleId(schedule.lessonByScheduleId);
    }
  };

  // Open note modal
  const openNoteModal = (student) => {
    setCurrentStudent(student);
    const studentAttendance = attendance.find((a) => a.studentId === student.id);
    setAttendanceNote(studentAttendance?.note || "");
    setNoteModalVisible(true);
  };

  // Save note
  const handleSaveNote = () => {
    if (!currentStudent) return;

    setAttendance((prev) =>
      prev.map((item) =>
        item.studentId === currentStudent.id ? { ...item, note: attendanceNote } : item
      )
    );

    setNoteModalVisible(false);
    setCurrentStudent(null);
    setAttendanceNote("");
  };

  // Submit attendance
  const handleSubmitAttendance = async () => {
    if (!selectedSchedule || !selectedLessonByScheduleId) {
      message.warning("Please select a schedule");
      return;
    }

    try {
      setLoading(true);
      // Gửi dữ liệu điểm danh đã chỉnh sửa
      await teacherService.attendanceStudent({
        // scheduleId: selectedSchedule,
        lessonByScheduleId: selectedLessonByScheduleId,
        // date: selectedDate.toISOString().split("T")[0],
        attendanceData: attendance, // Đã chỉnh sửa với format mới: studentId, present (1/0), note
      });

      // Giả lập lưu thành công
      setTimeout(() => {
        message.success("Attendance submitted successfully");
        setHasSubmitted(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error submitting attendance:", error);
      message.error("Failed to submit attendance");
      setLoading(false);
    }
  };

  // Go back to TeacherPage
  const handleGoBack = () => {
    navigate("/teacherpage");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          backgroundColor: colors.lightGreen,
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: `0 2px 8px ${colors.softShadow}`,
          zIndex: 10,
          position: "sticky",
          top: 0,
          height: isMobile ? 60 : 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
            style={{
              marginRight: 16,
              backgroundColor: colors.deepGreen,
              color: colors.white,
              border: "none",
            }}
          />
          <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: colors.darkGreen }}>
            ATTENDANCE CHECK
          </Title>
        </div>
      </Header>

      <Content
        style={{
          padding: isMobile ? 16 : 24,
          backgroundColor: colors.gray,
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[{ title: "Dashboard", onClick: handleGoBack }, { title: "Attendance Check" }]}
        />

        <Card
          style={{
            marginBottom: 16,
            borderRadius: 8,
            boxShadow: `0 2px 8px ${colors.softShadow}`,
          }}
        >
          <Row gutter={16} align="middle">
            <Col xs={24} md={8}>
              {/* <Form.Item label="Select Date" style={{ marginBottom: 0 }}>
                <DatePicker
                  style={{ width: "100%" }}
                  defaultValue={null}
                  onChange={handleDateChange}
                  format="YYYY-MM-DD"
                  allowClear={false}
                />
              </Form.Item> */}
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Class Schedule" style={{ marginBottom: 0 }}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select schedule"
                  value={selectedSchedule}
                  onChange={handleScheduleChange}
                  disabled={scheduleOptions.length === 0}
                >
                  {scheduleOptions.map((schedule) => (
                    <Option key={schedule.id} value={schedule.id}>
                      {schedule.time}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: isMobile ? "left" : "right" }}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleSubmitAttendance}
                style={{
                  backgroundColor: colors.deepGreen,
                  borderColor: colors.deepGreen,
                  marginTop: isMobile ? 16 : 0,
                }}
                disabled={!selectedSchedule || hasSubmitted || loading}
                loading={loading}
              >
                Submit Attendance
              </Button>
            </Col>
          </Row>
        </Card>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading...</div>
          </div>
        ) : (
          <div>
            {students.length > 0 ? (
              <>
                {hasSubmitted && (
                  <div
                    style={{
                      backgroundColor: colors.mintGreen,
                      padding: 16,
                      borderRadius: 8,
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <CheckCircleOutlined
                      style={{ color: colors.deepGreen, fontSize: 20, marginRight: 8 }}
                    />
                    <Text strong style={{ color: colors.darkGreen }}>
                      Attendance has been successfully submitted!
                    </Text>
                  </div>
                )}
                <Row gutter={[16, 16]}>
                  {students.map((student) => {
                    const studentAttendance = attendance.find(
                      (a) => a.studentId === student.id
                    ) || {
                      present: 1,
                      note: "",
                    };

                    return (
                      <Col xs={24} sm={12} md={8} lg={6} key={student.id}>
                        <Card
                          style={{
                            borderRadius: 8,
                            boxShadow: `0 2px 8px ${colors.softShadow}`,
                            backgroundColor: hasSubmitted
                              ? studentAttendance.present === 1
                                ? colors.paleGreen
                                : colors.lightAccent
                              : colors.white,
                            border: `1px solid ${
                              studentAttendance.present === 1 ? colors.borderGreen : colors.accent
                            }`,
                          }}
                          bodyStyle={{ padding: 16 }}
                        >
                          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                            <Avatar
                              size={40}
                              style={{ backgroundColor: colors.deepGreen }}
                              icon={<UserOutlined />}
                            />
                            <div style={{ marginLeft: 12 }}>
                              <Text strong style={{ fontSize: 16, display: "block" }}>
                                {student.name}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Level: {student.level || "N/A"}
                              </Text>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Select
                              value={studentAttendance.present}
                              onChange={(value) => handleStatusChange(student.id, value)}
                              style={{ width: "75%" }}
                              disabled={hasSubmitted}
                            >
                              <Option value={1}>
                                <Space>
                                  <CheckCircleOutlined style={{ color: colors.safeGreen }} />
                                  Present
                                </Space>
                              </Option>
                              <Option value={0}>
                                <Space>
                                  <CloseCircleOutlined style={{ color: colors.errorRed }} />
                                  Absent
                                </Space>
                              </Option>
                            </Select>
                            <Button
                              icon={<EditOutlined />}
                              onClick={() => openNoteModal(student)}
                              disabled={hasSubmitted}
                              style={{
                                marginLeft: 8,
                                backgroundColor: studentAttendance.note ? colors.paleBlue : "",
                              }}
                            />
                          </div>

                          {studentAttendance.note && (
                            <div style={{ marginTop: 8, fontSize: 12 }}>
                              <Text type="secondary" italic>
                                Note: {studentAttendance.note.substring(0, 30)}
                                {studentAttendance.note.length > 30 ? "..." : ""}
                              </Text>
                            </div>
                          )}
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </>
            ) : (
              <Card style={{ textAlign: "center", padding: 32 }}>
                <Text type="secondary">No students found for this class.</Text>
              </Card>
            )}
          </div>
        )}
      </Content>

      {/* Note Modal */}
      <Modal
        title={`Attendance Note - ${currentStudent?.name || ""}`}
        open={noteModalVisible}
        onCancel={() => setNoteModalVisible(false)}
        onOk={handleSaveNote}
        okText="Save Note"
        okButtonProps={{
          style: {
            backgroundColor: colors.deepGreen,
            borderColor: colors.deepGreen,
          },
        }}
      >
        <Form.Item label="Note">
          <Input.TextArea
            rows={4}
            value={attendanceNote}
            onChange={(e) => setAttendanceNote(e.target.value)}
            placeholder="Enter attendance note here..."
          />
        </Form.Item>
      </Modal>
    </Layout>
  );
};

export default AttendanceCheck;
