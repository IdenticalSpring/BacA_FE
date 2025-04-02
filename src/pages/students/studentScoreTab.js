import React, { useState, useEffect } from "react";
import {
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
import classTestScheduleSerivce from "services/classTestScheduleService";

const { Title, Text } = Typography;

const StudentScoreTab = ({ studentId, colors }) => {
  const [loading, setLoading] = useState(false);
  const [scoreDetailsData, setScoreDetailsData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch detailed scores
        const scoreDetails = await studentScoreService.getScoreDetailsByStudentId(studentId);
        const sortedScoreDetails = Array.isArray(scoreDetails) ? [...scoreDetails] : [scoreDetails];

        // Get unique classTestScheduleIDs
        const uniqueScheduleIds = [
          ...new Set(sortedScoreDetails.map((score) => score.studentScore.classTestScheduleID)),
        ];

        // Fetch class test schedule details
        const testSchedules = await Promise.all(
          uniqueScheduleIds.map(async (id) => {
            const schedule = await classTestScheduleSerivce.getClassTestScheduleByID(id);
            return {
              id,
              testName: schedule.test?.name || "Bài kiểm tra",
              date: schedule.date || "N/A",
            };
          })
        );

        // Integrate test schedule info into score details
        const enrichedScoreDetails = sortedScoreDetails.map((score) => {
          const schedule = testSchedules.find(
            (s) => s.id === score.studentScore.classTestScheduleID
          );
          return {
            ...score,
            studentScore: {
              ...score.studentScore,
              classTestSchedule: {
                ...score.studentScore.classTestSchedule,
                testName: schedule?.testName,
                date: schedule?.date,
              },
            },
          };
        });

        // Sort by date (most recent first)
        enrichedScoreDetails.sort((a, b) => {
          const dateA = a.studentScore?.classTestSchedule?.date
            ? new Date(a.studentScore.classTestSchedule.date)
            : new Date(0);
          const dateB = b.studentScore?.classTestSchedule?.date
            ? new Date(b.studentScore.classTestSchedule.date)
            : new Date(0);
          return dateB - dateA;
        });

        setScoreDetailsData(enrichedScoreDetails);

        // Fetch student information
        const studentData = await studentService.getStudentById(studentId);
        setStudentInfo(studentData);

        console.log("Enriched score details retrieved and sorted:", enrichedScoreDetails);
        console.log("Student data retrieved:", studentData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Không thể tải thông tin học sinh và điểm số");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const groupScoresByTest = () => {
    const grouped = {};
    scoreDetailsData.forEach((score) => {
      const key = score.studentScoreID;
      if (!grouped[key]) {
        grouped[key] = {
          studentScoreID: score.studentScoreID,
          testName: score.studentScore.classTestSchedule?.testName || "Bài kiểm tra",
          date: score.studentScore.classTestSchedule?.date || "N/A",
          writingScore: null,
          readingScore: null,
          speakingScore: null,
          listeningScore: null,
        };
      }
      const skillName = score.testSkill.name.toLowerCase();
      grouped[key][`${skillName}Score`] = score.score;
    });
    return Object.values(grouped).sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
  };

  const getMostRecentScores = () => {
    const groupedScores = groupScoresByTest();
    if (!groupedScores || groupedScores.length === 0) return null;
    return groupedScores[0];
  };

  const calculateAverage = () => {
    const mostRecentScore = getMostRecentScores();
    if (!mostRecentScore) return 0;

    const writingScore = parseFloat(mostRecentScore.writingScore) || 0;
    const readingScore = parseFloat(mostRecentScore.readingScore) || 0;
    const speakingScore = parseFloat(mostRecentScore.speakingScore) || 0;
    const listeningScore = parseFloat(mostRecentScore.listeningScore) || 0;

    const average = (writingScore + readingScore + speakingScore + listeningScore) / 4;
    return average.toFixed(1);
  };

  const getScoreColor = (score) => {
    score = parseFloat(score);
    if (isNaN(score)) return colors.lightGreen || "#d9d9d9";
    if (score >= 8.5) return colors.deepGreen || "#52c41a";
    if (score >= 7) return colors.lightGreen || "#1890ff";
    if (score >= 5) return "#faad14";
    return "#f5222d";
  };

  const getProgressPercent = () => {
    const avg = parseFloat(calculateAverage());
    return Math.min(Math.round((avg / 10) * 100), 100);
  };

  const groupedScores = groupScoresByTest();
  const recentScores = getMostRecentScores();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "30px 0" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={error}
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  return (
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
              src={studentInfo?.imgUrl}
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
          {recentScores.date && (
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <Text type="secondary">
                Bài thi: {recentScores.testName || "Bài kiểm tra"} | Ngày thi: {recentScores.date}
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

      {groupedScores && groupedScores.length > 0 ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {/* Bảng thông tin bài thi */}
          <Col xs={24} md={12}>
            <div className="test-info-table" style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: `1px solid ${colors.borderGreen}`,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: colors.paleGreen }}>
                    <th style={{ padding: "8px", border: `1px solid ${colors.borderGreen}` }}>
                      Bài kiểm tra
                    </th>
                    <th style={{ padding: "8px", border: `1px solid ${colors.borderGreen}` }}>
                      Ngày thi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedScores.map((score, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          padding: "8px",
                          border: `1px solid ${colors.borderGreen}`,
                          textAlign: "center",
                        }}
                      >
                        {score.testName}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: `1px solid ${colors.borderGreen}`,
                          textAlign: "center",
                        }}
                      >
                        {score.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Col>

          {/* Bảng điểm số */}
          <Col xs={24} md={12}>
            <div className="score-table" style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: `1px solid ${colors.borderGreen}`,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: colors.paleGreen }}>
                    <th style={{ padding: "8px", border: `1px solid ${colors.borderGreen}` }}>
                      Viết
                    </th>
                    <th style={{ padding: "8px", border: `1px solid ${colors.borderGreen}` }}>
                      Đọc
                    </th>
                    <th style={{ padding: "8px", border: `1px solid ${colors.borderGreen}` }}>
                      Nói
                    </th>
                    <th style={{ padding: "8px", border: `1px solid ${colors.borderGreen}` }}>
                      Nghe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedScores.map((score, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          padding: "8px",
                          border: `1px solid ${colors.borderGreen}`,
                          textAlign: "center",
                        }}
                      >
                        <Tag
                          color={getScoreColor(score.writingScore)}
                          style={{ fontSize: "14px", padding: "1px 8px" }}
                        >
                          {score.writingScore || "N/A"}
                        </Tag>
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: `1px solid ${colors.borderGreen}`,
                          textAlign: "center",
                        }}
                      >
                        <Tag
                          color={getScoreColor(score.readingScore)}
                          style={{ fontSize: "14px", padding: "1px 8px" }}
                        >
                          {score.readingScore || "N/A"}
                        </Tag>
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: `1px solid ${colors.borderGreen}`,
                          textAlign: "center",
                        }}
                      >
                        <Tag
                          color={getScoreColor(score.speakingScore)}
                          style={{ fontSize: "14px", padding: "1px 8px" }}
                        >
                          {score.speakingScore || "N/A"}
                        </Tag>
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: `1px solid ${colors.borderGreen}`,
                          textAlign: "center",
                        }}
                      >
                        <Tag
                          color={getScoreColor(score.listeningScore)}
                          style={{ fontSize: "14px", padding: "1px 8px" }}
                        >
                          {score.listeningScore || "N/A"}
                        </Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      ) : (
        <Empty description="Chưa có dữ liệu điểm số" style={{ padding: "30px 0" }} />
      )}
    </>
  );
};

const ColorPropTypes = PropTypes.shape({
  lightGreen: PropTypes.string,
  deepGreen: PropTypes.string,
  softShadow: PropTypes.string,
  darkGreen: PropTypes.string,
  paleGreen: PropTypes.string,
  borderGreen: PropTypes.string,
});

StudentScoreTab.propTypes = {
  studentId: PropTypes.string.isRequired,
  colors: ColorPropTypes.isRequired,
};

export default StudentScoreTab;
