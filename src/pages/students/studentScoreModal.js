import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Typography,
  Spin,
  Empty,
  Tag,
  Divider,
  Space,
  Alert,
  Avatar,
  Row,
  Col,
  Card,
  Progress,
  Statistic,
} from "antd";
import {
  TrophyOutlined,
  UserOutlined,
  ReadOutlined,
  EditOutlined,
  SoundOutlined,
  AudioOutlined,
} from "@ant-design/icons";
import studentScoreService from "services/studentScoreService";
import studentService from "services/studentService";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

const StudentScoreModal = ({ visible, onCancel, studentId, colors }) => {
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!visible || !studentId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch student scores
        const scoreData = await studentScoreService.getScorebyStudentID(studentId);

        // Ensure we have an array and sort by date (most recent first)
        const sortedScoreData = Array.isArray(scoreData) ? [...scoreData] : [scoreData];

        // Sort by date (most recent first)
        sortedScoreData.sort((a, b) => {
          const dateA = a.classTestSchedule?.date
            ? new Date(a.classTestSchedule.date)
            : new Date(0);
          const dateB = b.classTestSchedule?.date
            ? new Date(b.classTestSchedule.date)
            : new Date(0);
          return dateB - dateA; // Descending order (newest first)
        });

        setScoreData(sortedScoreData);

        // Fetch student information
        const studentData = await studentService.getStudentById(studentId);
        setStudentInfo(studentData);

        console.log("Score data retrieved and sorted:", sortedScoreData);
        console.log("Student data retrieved:", studentData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Không thể tải thông tin học sinh và điểm số");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [visible, studentId]);

  // Get the most recent test scores
  const getMostRecentScores = () => {
    if (!scoreData || scoreData.length === 0) return null;
    return scoreData[0]; // First item is the most recent due to our sorting
  };

  // Calculate average score using only the most recent test
  const calculateAverage = () => {
    if (!scoreData || scoreData.length === 0) return 0;

    // Just use the first item in the sorted array (most recent)
    const mostRecentScore = scoreData[0];

    const writingScore = parseFloat(mostRecentScore.writingScore) || 0;
    const readingScore = parseFloat(mostRecentScore.readingScore) || 0;
    const speakingScore = parseFloat(mostRecentScore.speakingScore) || 0;
    const listeningScore = parseFloat(mostRecentScore.listeningScore) || 0;

    // Calculate average of the four scores
    const average = (writingScore + readingScore + speakingScore + listeningScore) / 4;
    return average.toFixed(1);
  };

  // Get score color based on score value
  const getScoreColor = (score) => {
    score = parseFloat(score);
    if (isNaN(score)) return colors.lightGreen || "#d9d9d9";
    if (score >= 8.5) return colors.deepGreen || "#52c41a";
    if (score >= 7) return colors.lightGreen || "#1890ff";
    if (score >= 5) return "#faad14";
    return "#f5222d";
  };

  // Define table columns for the detailed scores
  const columns = [
    {
      title: "Bài kiểm tra",
      dataIndex: "testName",
      key: "testName",
      render: (text, record) => (
        <Space>
          <ReadOutlined />
          <Text>{text || record.examName || "Bài kiểm tra"}</Text>
        </Space>
      ),
    },
    {
      title: "Ngày thi",
      dataIndex: "testDate",
      key: "testDate",
      render: (_, record) => record.classTestSchedule?.date || "N/A",
    },
    {
      title: (
        <Space>
          <EditOutlined /> Viết
        </Space>
      ),
      dataIndex: "writingScore",
      key: "writingScore",
      render: (score) => (
        <Tag color={getScoreColor(score)} style={{ fontSize: "14px", padding: "1px 8px" }}>
          {score || "N/A"}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <ReadOutlined /> Đọc
        </Space>
      ),
      dataIndex: "readingScore",
      key: "readingScore",
      render: (score) => (
        <Tag color={getScoreColor(score)} style={{ fontSize: "14px", padding: "1px 8px" }}>
          {score || "N/A"}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <SoundOutlined /> Nói
        </Space>
      ),
      dataIndex: "speakingScore",
      key: "speakingScore",
      render: (score) => (
        <Tag color={getScoreColor(score)} style={{ fontSize: "14px", padding: "1px 8px" }}>
          {score || "N/A"}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <AudioOutlined /> Nghe
        </Space>
      ),
      dataIndex: "listeningScore",
      key: "listeningScore",
      render: (score) => (
        <Tag color={getScoreColor(score)} style={{ fontSize: "14px", padding: "1px 8px" }}>
          {score || "N/A"}
        </Tag>
      ),
    },
  ];

  // Calculate the progress percent for the circular progress
  const getProgressPercent = () => {
    const avg = parseFloat(calculateAverage());
    return Math.min(Math.round((avg / 10) * 100), 100);
  };

  // Get most recent scores for display
  const recentScores = getMostRecentScores();

  return (
    <Modal
      title={
        <Title level={4} style={{ color: colors.darkGreen, margin: 0 }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          Bảng điểm học sinh
        </Title>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      bodyStyle={{ padding: "16px 24px" }}
      style={{ top: 20 }}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải dữ liệu...</div>
        </div>
      ) : error ? (
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <>
          <Card
            style={{
              marginBottom: 16,
              borderRadius: 8,
              boxShadow: `0 2px 8px ${colors.softShadow || "rgba(0,0,0,0.1)"}`,
            }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={6} md={5} style={{ textAlign: "center" }}>
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: colors.deepGreen || "#1890ff",
                    boxShadow: `0 2px 8px ${colors.softShadow || "rgba(0,0,0,0.1)"}`,
                  }}
                  src={studentInfo?.avatarUrl}
                />
              </Col>

              <Col xs={24} sm={10} md={11}>
                <Title level={4} style={{ margin: "0 0 8px 0", color: colors.darkGreen }}>
                  {studentInfo?.name || "Học sinh"}
                </Title>
                <Space direction="vertical" size={2}>
                  <Text>
                    <strong>Lớp:</strong> {studentInfo?.class?.name || "N/A"}
                  </Text>
                  <Text>
                    <strong>Mã học sinh:</strong> {studentInfo?.id || studentId}
                  </Text>
                  <Text>
                    <strong>Email:</strong> {studentInfo?.email || "N/A"}
                  </Text>
                </Space>
              </Col>

              <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                <Progress
                  type="circle"
                  percent={getProgressPercent()}
                  format={() => (
                    <span
                      style={{
                        color: getScoreColor(calculateAverage()),
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    >
                      {calculateAverage()}
                    </span>
                  )}
                  strokeColor={getScoreColor(calculateAverage())}
                  width={120}
                />
                <div style={{ marginTop: 8 }}>
                  <Text strong>Điểm trung bình (bài thi gần nhất)</Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Chi tiết điểm của bài thi gần nhất */}
          {recentScores && (
            <Card
              title={
                <Space>
                  <TrophyOutlined />
                  <span>Chi tiết điểm bài thi gần nhất</span>
                </Space>
              }
              style={{
                marginBottom: 16,
                borderRadius: 8,
                boxShadow: `0 2px 8px ${colors.softShadow || "rgba(0,0,0,0.1)"}`,
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card
                    size="small"
                    style={{
                      textAlign: "center",
                      backgroundColor: colors.paleGreen || "#f6ffed",
                    }}
                  >
                    <Statistic
                      title={
                        <Space>
                          <EditOutlined />
                          <Text strong>Viết</Text>
                        </Space>
                      }
                      value={recentScores.writingScore || "N/A"}
                      valueStyle={{
                        color: getScoreColor(recentScores.writingScore),
                        fontWeight: "bold",
                      }}
                      suffix="/9"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card
                    size="small"
                    style={{
                      textAlign: "center",
                      backgroundColor: colors.paleGreen || "#f6ffed",
                    }}
                  >
                    <Statistic
                      title={
                        <Space>
                          <ReadOutlined />
                          <Text strong>Đọc</Text>
                        </Space>
                      }
                      value={recentScores.readingScore || "N/A"}
                      valueStyle={{
                        color: getScoreColor(recentScores.readingScore),
                        fontWeight: "bold",
                      }}
                      suffix="/9"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card
                    size="small"
                    style={{
                      textAlign: "center",
                      backgroundColor: colors.paleGreen || "#f6ffed",
                    }}
                  >
                    <Statistic
                      title={
                        <Space>
                          <SoundOutlined />
                          <Text strong>Nói</Text>
                        </Space>
                      }
                      value={recentScores.speakingScore || "N/A"}
                      valueStyle={{
                        color: getScoreColor(recentScores.speakingScore),
                        fontWeight: "bold",
                      }}
                      suffix="/9"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card
                    size="small"
                    style={{
                      textAlign: "center",
                      backgroundColor: colors.paleGreen || "#f6ffed",
                    }}
                  >
                    <Statistic
                      title={
                        <Space>
                          <AudioOutlined />
                          <Text strong>Nghe</Text>
                        </Space>
                      }
                      value={recentScores.listeningScore || "N/A"}
                      valueStyle={{
                        color: getScoreColor(recentScores.listeningScore),
                        fontWeight: "bold",
                      }}
                      suffix="/9"
                    />
                  </Card>
                </Col>
              </Row>
              {recentScores.classTestSchedule?.date && (
                <div style={{ marginTop: 12, textAlign: "center" }}>
                  <Text type="secondary">
                    Bài thi: {recentScores.testName || recentScores.examName || "Bài kiểm tra"} |
                    Ngày thi: {recentScores.classTestSchedule.date}
                  </Text>
                </div>
              )}
            </Card>
          )}

          <Divider style={{ margin: "16px 0" }} orientation="left">
            <Space>
              <TrophyOutlined />
              <span>Lịch sử điểm số</span>
            </Space>
          </Divider>

          {scoreData && scoreData.length > 0 ? (
            <Table
              dataSource={scoreData.map((item, index) => ({ ...item, key: index }))}
              columns={columns}
              pagination={scoreData.length > 10 ? { pageSize: 10 } : false}
              scroll={{ x: 600 }}
              bordered
              size="middle"
            />
          ) : (
            <Empty description="Chưa có dữ liệu điểm số" style={{ padding: "30px 0" }} />
          )}
        </>
      )}
    </Modal>
  );
};

StudentScoreModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  studentId: PropTypes.string.isRequired,
  colors: PropTypes.shape({
    deepGreen: PropTypes.string,
    lightGreen: PropTypes.string,
    mintGreen: PropTypes.string,
    darkGreen: PropTypes.string,
    paleGreen: PropTypes.string,
    softShadow: PropTypes.string,
  }).isRequired,
};

export default StudentScoreModal;
