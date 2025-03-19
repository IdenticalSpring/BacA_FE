import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Avatar,
  Menu,
  Dropdown,
  Button,
  Card,
  Table,
  Space,
  Divider,
  Drawer,
  Grid,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import Sidebar from "./sidebar";
import Toolbox from "./toolbox";
import classService from "services/classService";
import studentService from "services/studentService";
import { jwtDecode } from "jwt-decode";
import lessonByScheduleService from "services/lessonByScheduleService";
import lessonService from "services/lessonService";
import { colors } from "assets/theme/color";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const StudentPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedLessonBySchedule, setSelectedLessonBySchedule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [student, setStudent] = useState(null);
  const userId = jwtDecode(sessionStorage.getItem("token"));
  const studentId = userId.userId;
  const userName = userId.username || "Student";
  const [lessonsBySchedule, setLessonsBySchedule] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Use Ant Design's Grid breakpoints
  const screens = useBreakpoint();

  // Determine if we're on mobile or tablet
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  useEffect(() => {
    const fetchStudentById = async () => {
      try {
        const data = await studentService.getStudentById(studentId);
        setStudent(data);
      } catch (error) {
        console.error("Error fetching student info:", error);
      }
    };
    fetchStudentById();
  }, [studentId]);

  useEffect(() => {
    if (student && student.class.id) {
      const fetchLessonByScheduleOfClasses = async () => {
        try {
          const data = await lessonByScheduleService.getAllLessonBySchedulesOfClass(
            student.class.id
          );
          setLessonsBySchedule(data);
        } catch (error) {
          console.error("Error fetching lessons by schedule:", error);
        }
      };
      fetchLessonByScheduleOfClasses();
    }
  }, [student]);

  useEffect(() => {
    const findSelectedLessonBySchedule = lessonsBySchedule.find(
      (lessonBySchedule) => lessonBySchedule.id === selectedLessonBySchedule
    );

    if (findSelectedLessonBySchedule && findSelectedLessonBySchedule.lessonID) {
      const fetchLessonById = async () => {
        try {
          const data = await lessonService.getLessonById(findSelectedLessonBySchedule.lessonID);
          setLessons([data]);
        } catch (error) {
          console.error("Error fetching lesson:", error);
          setLessons([]);
        }
      };
      fetchLessonById();
    } else {
      setLessons([]);
    }
  }, [selectedLessonBySchedule]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.location.href = "/auth/sign-in";
  };

  const handleSelectLessonBySchedule = (lessonByScheduleId) => {
    setSelectedLessonBySchedule(lessonByScheduleId);
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Toolbox handlers
  const handleAddStudent = () => console.log("Add assignment");
  const handleEditClass = () => console.log("Add homework");
  const handleDeleteClass = () => console.log("Review lesson");
  const handleViewReport = () => console.log("Enter test scores");

  // Dropdown menu
  const menu = (
    <Menu style={{ backgroundColor: colors.paleGreen, borderRadius: "8px" }}>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{
          color: colors.darkGreen,
          "&:hover": { backgroundColor: colors.mintGreen },
        }}
      >
        Log out
      </Menu.Item>
    </Menu>
  );

  // Table columns with responsive adjustments
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: isMobile ? "15%" : "10%",
      align: "left",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: isMobile ? "40%" : isTablet ? "30%" : "20%",
      align: "left",
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: "15%",
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      width: "15%",
      align: "center",
      responsive: ["lg"],
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: isMobile ? "45%" : isTablet ? "40%" : "40%",
      align: "left",
      ellipsis: true,
    },
  ];

  // Table data
  const tableData = lessons.map((lesson) => ({
    key: lesson.id,
    id: lesson.id,
    name: lesson.name,
    level: lesson.level || "N/A",
    link: lesson.link || "N/A",
    description: lesson.description || "N/A",
  }));

  const SidebarComponent = () => (
    <Sidebar
      lessonsBySchedule={lessonsBySchedule}
      selectedLessonBySchedule={selectedLessonBySchedule}
      onSelectLessonBySchedule={handleSelectLessonBySchedule}
      colors={colors}
      isMobile={isMobile}
    />
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div style={{ width: "260px", height: "100%", position: "fixed", zIndex: 1001 }}>
          <SidebarComponent />
        </div>
      )}

      {/* Mobile Drawer Sidebar */}
      {isMobile && (
        <Drawer
          placement="left"
          closable={true}
          onClose={() => setSidebarVisible(false)}
          open={sidebarVisible}
          width="85%"
          bodyStyle={{ padding: 0 }}
          headerStyle={{ display: "none" }}
        >
          <SidebarComponent />
        </Drawer>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : 260 }}>
        <Header
          style={{
            backgroundColor: colors.lightGreen,
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: `0 2px 8px ${colors.softShadow}`,
            height: 64,
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {isMobile && (
              <Button
                type="text"
                icon={sidebarVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                onClick={toggleSidebar}
                style={{
                  fontSize: "16px",
                  marginRight: "12px",
                  color: colors.darkGreen,
                }}
              />
            )}
            <Title
              level={isMobile ? 5 : 4}
              style={{
                margin: 0,
                color: colors.darkGreen,
                fontWeight: "bold",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              STUDENT DASHBOARD
            </Title>
          </div>

          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Avatar
              style={{
                backgroundColor: colors.deepGreen,
                color: colors.white,
                cursor: "pointer",
                border: `2px solid ${colors.borderGreen}`,
              }}
              icon={<UserOutlined />}
            >
              {userName.charAt(0)}
            </Avatar>
          </Dropdown>
        </Header>

        <Content
          style={{
            padding: isMobile ? "16px" : "24px",
            marginBottom: selectedLessonBySchedule ? (isMobile ? 140 : 70) : 0,
          }}
        >
          {!selectedLessonBySchedule ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
                flexDirection: "column",
              }}
            >
              <Avatar
                style={{
                  backgroundColor: colors.mintGreen,
                  color: colors.deepGreen,
                  fontSize: isMobile ? 28 : 40,
                  width: isMobile ? 60 : 80,
                  height: isMobile ? 60 : 80,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                ?
              </Avatar>
              <Text
                style={{
                  fontSize: isMobile ? 16 : 18,
                  color: colors.deepGreen,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Please select a lesson by schedule
              </Text>
            </div>
          ) : (
            <Card
              style={{
                borderRadius: 12,
                boxShadow: `0 4px 12px ${colors.softShadow}`,
                border: `1px solid ${colors.borderGreen}`,
              }}
              headStyle={{
                backgroundColor: colors.lightGreen,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                color: colors.darkGreen,
              }}
              title={
                <div
                  style={{
                    padding: isMobile ? "12px 0" : "16px 0",
                    color: colors.darkGreen,
                    fontWeight: "bold",
                    fontSize: isMobile ? "16px" : "18px",
                  }}
                >
                  List of lessons
                </div>
              }
            >
              <div style={{ overflowX: "auto" }}>
                <Table
                  columns={columns}
                  dataSource={tableData}
                  pagination={false}
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                  rowClassName={() => "lesson-row"}
                  scroll={{ x: isMobile ? 500 : 800 }}
                  size={isMobile ? "small" : "middle"}
                />
              </div>
            </Card>
          )}
        </Content>

        {selectedLessonBySchedule && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              width: isMobile ? "100%" : `calc(100% - 260px)`,
              right: 0,
              backgroundColor: colors.white,
              borderTop: `1px solid ${colors.borderGreen}`,
              zIndex: 1000,
              boxShadow: `0 -2px 8px ${colors.softShadow}`,
              padding: isMobile ? "12px 8px" : "12px 0",
            }}
          >
            <Toolbox
              onAddStudent={handleAddStudent}
              onEditClass={handleEditClass}
              onDeleteClass={handleDeleteClass}
              onViewReport={handleViewReport}
              colors={colors}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </div>
        )}
      </Layout>
    </Layout>
  );
};

export default StudentPage;
