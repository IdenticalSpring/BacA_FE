import React, { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Button,
  Card,
  Typography,
  List,
  Avatar,
  Empty,
  Spin,
  Alert,
  Tag,
  Form,
  Space,
  Divider,
  Row,
  Col,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import classService from "services/classService";
import { colors } from "assets/theme/color";
import studentService from "services/studentService";
import { useNavigate } from "react-router-dom";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

// Color palette

export default function DoHomework() {
  const [classID, setClassID] = useState("");
  const [classData, setClassData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [homeworkList, setHomeworkList] = useState([]);
  const navigate = useNavigate();
  // Verify class ID
  const verifyClass = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await classService.getClassById(classID);
      console.log(res);

      setClassData(res);
    } catch (err) {
      setClassData(null);
      setError("Mã lớp không tồn tại! Vui lòng nhập lại!");
    } finally {
      setLoading(false);
    }
  };

  // Handle student selection
  const selectStudent = async (student) => {
    // setSelectedStudent(student);
    setLoading(true);
    setError("");
    try {
      const res = await studentService.getStudentByIdAndLogin(student.id);
      console.log(res);
      navigate("/studentpage");
      message.success("Login successful");
    } catch (err) {
      //   setClassData(null);
      setError("Mã lớp không tồn tại! Vui lòng nhập lại!");
    } finally {
      setLoading(false);
    }
  };

  // Responsive styles
  const getContainerStyle = () => {
    return {
      padding: window.innerWidth < 768 ? "16px" : "24px",
      maxWidth: "1200px",
      margin: "0 auto",
    };
  };

  // Class verification view
  const renderClassVerification = () => (
    <Card
      style={{
        backgroundColor: colors.white,
        boxShadow: `0 4px 12px ${colors.softShadow}`,
        borderRadius: "12px",
        borderColor: colors.borderGreen,
      }}
    >
      <Title level={3} style={{ color: colors.deepGreen, textAlign: "center" }}>
        Nhập mã lớp
      </Title>
      <Paragraph style={{ textAlign: "center", color: colors.darkGray }}>
        Vui lòng nhập mã lớp để tiến hành làm bài tập
      </Paragraph>
      <Form onFinish={verifyClass}>
        <Form.Item>
          <Input
            size="large"
            placeholder="Class ID (e.g. 1)"
            value={classID}
            onChange={(e) => setClassID(e.target.value)}
            prefix={<BookOutlined style={{ color: colors.midGreen }} />}
            style={{
              borderColor: colors.inputBorder,
              borderRadius: "8px",
            }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            icon={<SearchOutlined />}
            style={{
              backgroundColor: colors.deepGreen,
              borderColor: colors.deepGreen,
              height: "44px",
              borderRadius: "8px",
            }}
            disabled={!classID.trim()}
          >
            Verify Class
          </Button>
        </Form.Item>
      </Form>
      {error && <Alert message={error} type="error" showIcon style={{ marginTop: "16px" }} />}
    </Card>
  );

  // Student list view
  const renderStudentList = () => (
    <div>
      <Title level={3} style={{ color: colors.deepGreen }}>
        {classData.name} <Tag color={colors.lightGreen}>{classID}</Tag>
      </Title>
      <Paragraph style={{ color: colors.darkGray }}>
        Chọn đúng tài khoản của mình để tiến hành làm bài tập
      </Paragraph>
      <List
        dataSource={classData.students}
        renderItem={(student) => (
          <List.Item
            key={student.id}
            onClick={() => selectStudent(student)}
            style={{
              cursor: "pointer",
              borderRadius: "8px",
              marginBottom: "8px",
              backgroundColor: colors.white,
              padding: "12px 16px",
              transition: "all 0.3s ease",
              border: `1px solid ${colors.borderGreen}`,
              ":hover": {
                backgroundColor: colors.paleGreen,
                transform: "translateY(-2px)",
                boxShadow: `0 4px 8px ${colors.softShadow}`,
              },
            }}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={!student.imgUrl && <UserOutlined />}
                  src={student.imgUrl || ""}
                  style={{ backgroundColor: colors.midGreen }}
                  size="large"
                />
              }
              title={<Text strong>{student.name}</Text>}
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: colors.paleGreen }}>
      <Header
        style={{
          backgroundColor: colors.headerBg,
          padding: "0 24px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            color: colors.white,
          }}
        >
          <BookOutlined style={{ fontSize: "24px", marginRight: "12px" }} />
          <Title level={3} style={{ color: colors.white, margin: 0 }}>
            Homework Portal
          </Title>
        </div>
      </Header>

      <Content style={{ padding: "24px" }}>
        <div style={getContainerStyle()}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
              <div style={{ marginTop: "16px", color: colors.darkGray }}>Verifying...</div>
            </div>
          ) : !classData ? (
            renderClassVerification()
          ) : (
            renderStudentList()
          )}
        </div>
      </Content>

      <Footer
        style={{
          textAlign: "center",
          backgroundColor: colors.white,
          color: colors.darkGray,
          borderTop: `1px solid ${colors.lightGreen}`,
        }}
      >
        Homework Portal ©{new Date().getFullYear()} Created by Bac A Developer Team
      </Footer>
    </Layout>
  );
}
