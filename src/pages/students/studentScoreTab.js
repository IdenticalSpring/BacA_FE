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
  Table, // Thêm Table từ Ant Design
} from "antd";
import {
  TrophyOutlined,
  UserOutlined,
  ReadOutlined,
  EditOutlined,
  SoundOutlined,
  AudioOutlined,
} from "@ant-design/icons";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import studentScoreService from "services/studentScoreService";
import studentService from "services/studentService";
import PropTypes from "prop-types";
import classTestScheduleSerivce from "services/classTestScheduleService";

const { Title, Text } = Typography;

const StudentScoreTab = ({ studentId, colors }) => {
  const [loading, setLoading] = useState(false);
  const [scoreDetailsData, setScoreDetailsData] = useState([]);
  const [assessmentData, setAssessmentData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) return;

      setLoading(true);
      setError(null);

      try {
        const scoreDetails = await studentScoreService.getScoreDetailsByStudentId(studentId);
        const sortedScoreDetails = Array.isArray(scoreDetails) ? [...scoreDetails] : [scoreDetails];

        const uniqueScheduleIds = [
          ...new Set(sortedScoreDetails.map((score) => score.studentScore.classTestScheduleID)),
        ];

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

        const scores = await studentScoreService.getScorebyStudentID(studentId);
        const sortedScores = Array.isArray(scores) ? [...scores] : [scores];
        sortedScores.sort((a, b) => {
          const dateA = a.classTestSchedule?.date
            ? new Date(a.classTestSchedule.date)
            : new Date(0);
          const dateB = b.classTestSchedule?.date
            ? new Date(b.classTestSchedule.date)
            : new Date(0);
          return dateB - dateA;
        });
        setAssessmentData(sortedScores);

        const studentData = await studentService.getStudentById(studentId);
        setStudentInfo(studentData);
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
          teacher: null,
          assessment: null,
          comment: null,
        };
      }
      const skillName = score.testSkill.name.toLowerCase();
      grouped[key][`${skillName}Score`] = score.score;

      const assessment = assessmentData.find(
        (a) => a.classTestScheduleID === score.studentScore.classTestScheduleID
      );
      if (assessment) {
        grouped[key].teacher = assessment.teacher?.name || "N/A";
        grouped[key].assessment = assessment.assessment?.name || "N/A";
        grouped[key].comment = assessment.teacherComment || "Chưa có bình luận";
      }
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

  const getAverageScoresForChart = () => {
    const groupedScores = groupScoresByTest();
    return groupedScores
      .map((score) => {
        const validScores = [
          parseFloat(score.writingScore) || 0,
          parseFloat(score.readingScore) || 0,
          parseFloat(score.speakingScore) || 0,
          parseFloat(score.listeningScore) || 0,
        ].filter((score) => score > 0);

        const average =
          validScores.length > 0
            ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
            : 0;

        return {
          date: score.date,
          average: Number(average.toFixed(1)),
        };
      })
      .reverse();
  };

  const groupedScores = groupScoresByTest();
  const recentScores = getMostRecentScores();
  const chartData = getAverageScoresForChart();

  // Cấu hình dữ liệu cho DefaultLineChart của Material Dashboard 2
  const lineChartData = {
    labels: chartData.map((item) => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: "Điểm trung bình",
        data: chartData.map((item) => item.average),
        fill: false,
        borderColor: colors.deepGreen || "#1890ff",
        tension: 0.4,
      },
    ],
  };

  // Cấu hình cột cho bảng Lịch sử điểm số
  const scoreHistoryColumns = [
    {
      title: "Ngày thi",
      dataIndex: "date",
      key: "date",
      align: "center",
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" }, // Màu nền cho header
      }),
    },
    {
      title: "Giáo viên",
      dataIndex: "teacher",
      key: "teacher",
      align: "center",
      render: (text) => text || "N/A",
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" }, // Màu nền cho header
      }),
    },
    {
      title: "Bài kiểm tra",
      dataIndex: "testName",
      key: "testName",
      align: "center",
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" }, // Màu nền cho header
      }),
    },
    {
      title: "Nghe",
      dataIndex: "listeningScore",
      key: "listeningScore",
      align: "center",
      render: (score) => (
        <Tag color={getScoreColor(score)} style={{ fontSize: "14px", padding: "1px 8px" }}>
          {score || "N/A"}
        </Tag>
      ),
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" }, // Màu nền cho header
      }),
    },
    {
      title: "Nói",
      dataIndex: "speakingScore",
      key: "speakingScore",
      align: "center",
      render: (score) => (
        <Tag color={getScoreColor(score)} style={{ fontSize: "14px", padding: "1px 8px" }}>
          {score || "N/A"}
        </Tag>
      ),
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" }, // Màu nền cho header
      }),
    },
    {
      title: "Đọc",
      dataIndex: "readingScore",
      key: "readingScore",
      align: "center",
      render: (score) => (
        <Tag color={getScoreColor(score)} style={{ fontSize: "14px", padding: "1px 8px" }}>
          {score || "N/A"}
        </Tag>
      ),
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" }, // Màu nền cho header
      }),
    },
    {
      title: "Viết",
      dataIndex: "writingScore",
      key: "writingScore",
      align: "center",
      render: (score) => (
        <Tag color={getScoreColor(score)} style={{ fontSize: "14px", padding: "1px 8px" }}>
          {score || "N/A"}
        </Tag>
      ),
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" }, // Màu nền cho header
      }),
    },
    {
      title: "Đánh giá",
      dataIndex: "assessment",
      key: "assessment",
      align: "center",
      render: (text) => text || "N/A",
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" }, // Màu nền cho header
      }),
    },
    {
      title: "Bình luận",
      dataIndex: "comment",
      key: "comment",
      align: "center",
      render: (text) => text || "Chưa có bình luận",
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" }, // Màu nền cho header
      }),
    },
  ];

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
          <span>Thống kê điểm trung bình</span>
        </Space>
      </Divider>

      {chartData && chartData.length > 0 ? (
        <Card
          style={{
            marginBottom: 16,
            borderRadius: 8,
            boxShadow: `0 2px 8px ${colors.softShadow || "rgba(0,0,0,0.1)"}`,
          }}
        >
          <DefaultLineChart chart={lineChartData} height="300px" />
        </Card>
      ) : (
        <Empty description="Chưa có dữ liệu để hiển thị biểu đồ" style={{ padding: "30px 0" }} />
      )}

      <Divider style={{ margin: "16px 0" }} orientation="left">
        <Space>
          <TrophyOutlined />
          <span>Lịch sử điểm số</span>
        </Space>
      </Divider>

      {groupedScores && groupedScores.length > 0 ? (
        <Table
          columns={scoreHistoryColumns}
          dataSource={groupedScores.map((score, index) => ({ ...score, key: index }))} // Thêm key cho mỗi row
          pagination={{
            pageSize: 4, // Giới hạn 4 rows mỗi trang
            showSizeChanger: false, // Ẩn tùy chọn thay đổi số lượng rows mỗi trang
          }}
          scroll={{ x: true }} // Thêm scroll ngang nếu bảng quá rộng
        />
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
