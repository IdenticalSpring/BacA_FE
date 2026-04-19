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

// Material Dashboard 2 React example components (keep wrapper layout)
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Select,
  Table,
  Avatar,
  Tag,
  Space,
  Spin,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  EyeOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

import studentService from "services/studentService";
import teacherService from "services/teacherService";
import lessonService from "services/lessonService";
import homeWorkService from "services/homeWorkService";
import checkinService from "services/checkinService";
import pagevisitService from "services/pagevisitService";
import feedbackService from "services/feedbackService";
import teacherFeedbackService from "services/teacherFeedbackService";

const { Title, Text } = Typography;
const { Option } = Select;

const colors = {
  deepGreen: "#368A68",
  midGreen: "#5FAE8C",
  lightGreen: "#8ED1B0",
  paleGreen: "#E8F5EE",
  emerald: "#2ecc71",
  darkGreen: "#224922",
  white: "#FFFFFF",
  statStudent: { bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", icon: "#667eea" },
  statTeacher: { bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", icon: "#f5576c" },
  statLesson: { bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", icon: "#4facfe" },
  statHomework: { bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", icon: "#43e97b" },
};

function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    lessons: 0,
    homeworks: 0,
  });

  const [visitorChartData, setVisitorChartData] = useState([]);
  const [period, setPeriod] = useState("weekly");
  const [studentFeedbacks, setStudentFeedbacks] = useState([]);
  const [teacherFeedbacks, setTeacherFeedbacks] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingVisitors, setLoadingVisitors] = useState(true);

  // Fetch overview stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
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
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const [stuFb, tchFb] = await Promise.all([
          feedbackService.getAllFeedback(),
          teacherFeedbackService.getAllteacherFeedbackk(),
        ]);
        setStudentFeedbacks(stuFb || []);
        setTeacherFeedbacks(tchFb || []);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };
    fetchFeedbacks();
  }, []);

  // Fetch and process visitor stats
  useEffect(() => {
    const fetchVisitorStats = async () => {
      try {
        setLoadingVisitors(true);
        const stats = await pagevisitService.getStatsVisitor();

        if (!stats || stats.length === 0) {
          console.warn("No visitor data available");
          return;
        }

        const getWeekNumber = (date) => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          d.setDate(d.getDate() + 4 - (d.getDay() || 7));
          const yearStart = new Date(d.getFullYear(), 0, 1);
          return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
        };

        const groupedData = stats.reduce((acc, entry) => {
          const date = new Date(entry.date);
          let key;

          if (period === "daily") {
            key = date.toISOString().split("T")[0];
          } else if (period === "weekly") {
            const year = date.getFullYear();
            const week = getWeekNumber(date);
            key = `${year}-W${week}`;
          } else if (period === "monthly") {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            key = `${year}-${month}`;
          }

          if (!acc[key]) {
            acc[key] = 0;
          }
          acc[key] += entry.visitCount;
          return acc;
        }, {});

        const labels = Object.keys(groupedData).sort();
        const chartData = labels.map((label) => ({
          name: label,
          visitors: groupedData[label],
        }));

        setVisitorChartData(chartData);
      } catch (error) {
        console.error("Error fetching visitor stats:", error);
      } finally {
        setLoadingVisitors(false);
      }
    };

    fetchVisitorStats();
  }, [period]);

  const statCards = [
    {
      title: "Students",
      value: stats.students,
      icon: <TeamOutlined style={{ fontSize: "28px", color: colors.white }} />,
      gradient: colors.statStudent.bg,
      subtitle: "Total students",
    },
    {
      title: "Teachers",
      value: stats.teachers,
      icon: <UserOutlined style={{ fontSize: "28px", color: colors.white }} />,
      gradient: colors.statTeacher.bg,
      subtitle: "Total teachers",
    },
    {
      title: "Lessons",
      value: stats.lessons,
      icon: <BookOutlined style={{ fontSize: "28px", color: colors.white }} />,
      gradient: colors.statLesson.bg,
      subtitle: "Total lessons",
    },
    {
      title: "Homeworks",
      value: stats.homeworks,
      icon: <FileTextOutlined style={{ fontSize: "28px", color: colors.white }} />,
      gradient: colors.statHomework.bg,
      subtitle: "Total homeworks",
    },
  ];

  const studentFeedbackColumns = [
    {
      title: "Student",
      dataIndex: "student",
      key: "student",
      width: "30%",
      render: (student) => (
        <Space>
          <Avatar src={student?.imgUrl} size="small">
            {student?.name?.charAt(0)}
          </Avatar>
          <Text>{student?.name}</Text>
        </Space>
      ),
    },
    {
      title: "Feedback",
      dataIndex: "title",
      key: "title",
      width: "70%",
      render: (text) => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
    },
  ];

  const teacherFeedbackColumns = [
    {
      title: "Teacher",
      dataIndex: "teacher",
      key: "teacher",
      width: "30%",
      render: (teacher) => (
        <Space>
          <Avatar style={{ backgroundColor: colors.deepGreen }} size="small">
            {teacher?.name?.charAt(0)}
          </Avatar>
          <Text>{teacher?.name}</Text>
        </Space>
      ),
    },
    {
      title: "Feedback",
      dataIndex: "title",
      key: "title",
      width: "70%",
      render: (text) => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <div style={{ padding: "24px 0" }}>
        {/* Stat Cards */}
        <Row gutter={[20, 20]} style={{ marginBottom: "24px" }}>
          {statCards.map((card, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card
                bordered={false}
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
                hoverable
                bodyStyle={{ padding: "20px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Text style={{ fontSize: "13px", color: "#8c8c8c", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {card.title}
                    </Text>
                    {loadingStats ? (
                      <Spin size="small" style={{ display: "block", marginTop: "8px" }} />
                    ) : (
                      <div style={{ fontSize: "32px", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.2, marginTop: "4px" }}>
                        {card.value}
                      </div>
                    )}
                    <Text style={{ fontSize: "12px", color: "#8c8c8c", marginTop: "4px", display: "block" }}>
                      {card.subtitle}
                    </Text>
                  </div>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "12px",
                      background: card.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Visitor Statistics Chart */}
        <Row gutter={[20, 20]} style={{ marginBottom: "24px" }}>
          <Col xs={24}>
            <Card
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <Title level={5} style={{ margin: 0, color: colors.darkGreen }}>
                    <EyeOutlined style={{ marginRight: "8px" }} />
                    Visitor Statistics ({period === "daily" ? "Daily" : period === "weekly" ? "Weekly" : "Monthly"})
                  </Title>
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    Trends of page visits
                  </Text>
                </div>
                <Select
                  value={period}
                  onChange={(value) => setPeriod(value)}
                  style={{ width: 140 }}
                  size="middle"
                >
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                </Select>
              </div>
              {loadingVisitors ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <Spin size="large" />
                </div>
              ) : visitorChartData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#8c8c8c" }}>
                  No visitor data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={visitorChartData}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.deepGreen} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.deepGreen} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#8c8c8c" }}
                      axisLine={{ stroke: "#e8e8e8" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#8c8c8c" }}
                      axisLine={{ stroke: "#e8e8e8" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke={colors.deepGreen}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorVisitors)"
                      dot={{ r: 4, fill: colors.deepGreen, strokeWidth: 2, stroke: colors.white }}
                      activeDot={{ r: 6, fill: colors.deepGreen, stroke: colors.white, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Col>
        </Row>

        {/* Feedback Tables */}
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                height: "100%",
              }}
              bodyStyle={{ padding: "0" }}
            >
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Title level={5} style={{ margin: 0, color: colors.darkGreen }}>
                    Student Feedbacks
                  </Title>
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    <strong>{studentFeedbacks.length} feedbacks</strong> received
                  </Text>
                </div>
                <Tag color="green" style={{ borderRadius: "12px" }}>
                  {studentFeedbacks.length}
                </Tag>
              </div>
              <div style={{ padding: "0 8px" }}>
                <Table
                  dataSource={studentFeedbacks.slice(0, 5)}
                  columns={studentFeedbackColumns}
                  rowKey={(record) => record.id || Math.random()}
                  pagination={false}
                  size="small"
                  showHeader={false}
                  style={{ border: "none" }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                height: "100%",
              }}
              bodyStyle={{ padding: "0" }}
            >
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <Title level={5} style={{ margin: 0, color: colors.darkGreen }}>
                    Teacher Feedback
                  </Title>
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    <strong>{teacherFeedbacks.length} feedbacks</strong> received
                  </Text>
                </div>
                <Tag color="blue" style={{ borderRadius: "12px" }}>
                  {teacherFeedbacks.length}
                </Tag>
              </div>
              <div style={{ padding: "0 8px" }}>
                <Table
                  dataSource={teacherFeedbacks.slice(0, 5)}
                  columns={teacherFeedbackColumns}
                  rowKey={(record) => record.id || Math.random()}
                  pagination={false}
                  size="small"
                  showHeader={false}
                  style={{ border: "none" }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
