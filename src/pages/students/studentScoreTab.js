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
  Table,
  Modal,
} from "antd";
import {
  TrophyOutlined,
  UserOutlined,
  ReadOutlined,
  EditOutlined,
  SoundOutlined,
  AudioOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import studentScoreService from "services/studentScoreService";
import studentService from "services/studentService";
import testSkillService from "services/testSkillService";
import classTestScheduleSerivce from "services/classTestScheduleService";
import EvaluationStudent from "./evaluationStudent";
import PropTypes from "prop-types";

ChartJS.register(ArcElement, Tooltip, Legend);

const { Title, Text } = Typography;

const StudentScoreTab = ({ studentId, colors }) => {
  const [loading, setLoading] = useState(false);
  const [scoreDetailsData, setScoreDetailsData] = useState([]);
  const [assessmentData, setAssessmentData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [testSkills, setTestSkills] = useState([]);
  
  // Lấy role từ sessionStorage
  const userRole = sessionStorage.getItem("role");

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) return;

      setLoading(true);
      setError(null);

      try {
        const skills = await testSkillService.getAllTestSkill();
        setTestSkills(skills);

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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const groupScoresByTest = () => {
    const grouped = {};
    scoreDetailsData.forEach((score) => {
      const key = score.studentScoreID;
      if (!grouped[key]) {
        grouped[key] = {
          studentScoreID: score.studentScoreID,
          testName: score.studentScore.classTestSchedule?.testName || "Bài kiểm tra",
          date: score.studentScore.classTestSchedule?.date || "N/A",
          teacher: null,
          assessment: null,
          comment: null,
        };
      }
      const skill = testSkills.find((s) => s.id === score.testSkill.id);
      const skillName = skill?.name.toLowerCase() || score.testSkill.name.toLowerCase();
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

    const skillScores = testSkills
      .map((skill) => {
        const skillName = skill.name.toLowerCase();
        return parseFloat(mostRecentScore[`${skillName}Score`]) || 0;
      })
      .filter((score) => score > 0);

    const average =
      skillScores.length > 0 ? skillScores.reduce((sum, s) => sum + s, 0) / skillScores.length : 0;
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

  const getPieChartData = () => {
    const groupedScores = groupScoresByTest();
    if (!groupedScores || groupedScores.length === 0 || !testSkills || testSkills.length === 0)
      return null;

    const skillAverages = testSkills.map((skill) => {
      const skillName = skill.name.toLowerCase();
      const scores = groupedScores
        .map((score) => parseFloat(score[`${skillName}Score`]) || 0)
        .filter((score) => score > 0);
      const average = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
      return Number(average.toFixed(1));
    });

    return {
      labels: testSkills.map((skill) => skill.name),
      datasets: [
        {
          label: "Điểm trung bình các kỹ năng",
          data: skillAverages,
          backgroundColor: ["#52c41a", "#1890ff", "#faad14", "#f5222d", "#722ed1"],
          borderColor: colors.borderGreen || "#d9d9d9",
          borderWidth: 1,
        },
      ],
    };
  };

  const scoreHistoryColumns = [
    {
      title: "Ngày thi",
      dataIndex: "date",
      key: "date",
      align: "center",
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" },
      }),
    },
    {
      title: "Giáo viên",
      dataIndex: "teacher",
      key: "teacher",
      align: "center",
      render: (text) => text || "N/A",
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" },
      }),
    },
    {
      title: "Bài kiểm tra",
      dataIndex: "testName",
      key: "testName",
      align: "center",
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" },
      }),
    },
    ...testSkills.map((skill) => ({
      title: skill.name,
      dataIndex: `${skill.name.toLowerCase()}Score`,
      key: `${skill.name.toLowerCase()}Score`,
      align: "center",
      render: (score) => (
        <Tag color={getScoreColor(score)} style={{ fontSize: "14px", padding: "1px 8px" }}>
          {score || "N/A"}
        </Tag>
      ),
      onHeaderCell: () => ({
        style: { backgroundColor: colors.paleGreen || "#f6ffed" },
      }),
    })),
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

  const recentScores = getMostRecentScores();
  const pieChartData = getPieChartData();

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
                cursor: "pointer",
              }}
              src={studentInfo?.imgUrl}
              onClick={showModal}
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

      {/* Chỉ hiển thị EvaluationStudent cho admin và teacher */}
      {(userRole === "admin" || userRole === "teacher") && (
        <EvaluationStudent studentId={studentId} colors={colors} />
      )}

      <Modal
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        centered
        bodyStyle={{ padding: 0, textAlign: "center" }}
        zIndex={2000}
      >
        <img
          src={
            studentInfo?.imgUrl ||
            "https://th.bing.com/th/id/R.f12f27774ae0581703453af531f3e839?rik=WQri2jZdiFUpEQ&pid=ImgRaw&r=0"
          }
          alt={studentInfo?.name || "Student Avatar"}
          style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8 }}
        />
      </Modal>

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
            {testSkills.map((skill) => (
              <Col xs={24} sm={12} md={6} key={skill.id}>
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
                        {skill.name.toLowerCase().includes("writ") ? (
                          <EditOutlined />
                        ) : skill.name.toLowerCase().includes("read") ? (
                          <ReadOutlined />
                        ) : skill.name.toLowerCase().includes("speak") ? (
                          <SoundOutlined />
                        ) : skill.name.toLowerCase().includes("listen") ? (
                          <AudioOutlined />
                        ) : (
                          <TrophyOutlined />
                        )}
                        <Text strong>{skill.name}</Text>
                      </Space>
                    }
                    value={recentScores[`${skill.name.toLowerCase()}Score`] || "N/A"}
                    valueStyle={{
                      color: getScoreColor(recentScores[`${skill.name.toLowerCase()}Score`]),
                      fontWeight: "bold",
                    }}
                    suffix="/9"
                  />
                </Card>
              </Col>
            ))}
          </Row>
          {recentScores.date && (
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <Text type="secondary">
                Bài thi: {recentScores.testName || "Bài kiểm tra"} | Ngày thi: {recentScores.date}
              </Text>
            </div>
          )}

          {/* Feedback Section */}
          {(recentScores.assessment || recentScores.comment) && (
            <>
              <Divider style={{ margin: "16px 0" }}>Feedback</Divider>
              <Card
                size="small"
                style={{
                  backgroundColor: "#f9f9f9",
                  border: `1px solid ${colors.paleGreen || "#d9f7be"}`,
                }}
              >
                {recentScores.teacher && (
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ color: colors.darkGreen }}>
                      Giáo viên:{" "}
                    </Text>
                    <Text>{recentScores.teacher}</Text>
                  </div>
                )}
                {recentScores.assessment && (
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ color: colors.darkGreen }}>
                      Đánh giá:{" "}
                    </Text>
                    <Tag color="blue">{recentScores.assessment}</Tag>
                  </div>
                )}
                {recentScores.comment && (
                  <div>
                    <Text strong style={{ color: colors.darkGreen }}>
                      Bình luận:{" "}
                    </Text>
                    <Text>{recentScores.comment}</Text>
                  </div>
                )}
              </Card>
            </>
          )}
        </Card>
      )}

      <Divider style={{ margin: "16px 0" }} orientation="left">
        <Space>
          <TrophyOutlined />
          <span>Thống kê điểm trung bình các kỹ năng</span>
        </Space>
      </Divider>

      {pieChartData && pieChartData.datasets[0].data.some((score) => score > 0) ? (
        <Card
          style={{
            marginBottom: 16,
            borderRadius: 8,
            boxShadow: `0 2px 8px ${colors.softShadow || "rgba(0,0,0,0.1)"}`,
          }}
        >
          <Pie
            data={pieChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: "50%",
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    font: {
                      size: 14,
                    },
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || "";
                      const value = context.raw || 0;
                      return `${label}: ${value}/9`;
                    },
                  },
                },
              },
            }}
            height={400}
          />
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

      {groupScoresByTest().length > 0 ? (
        <Table
          columns={scoreHistoryColumns}
          dataSource={groupScoresByTest().map((score, index) => ({ ...score, key: index }))}
          pagination={{
            pageSize: 4,
            showSizeChanger: false,
          }}
          scroll={{ x: true }}
          expandable={{
            expandedRowRender: (record) => (
              <Card
                size="small"
                style={{
                  backgroundColor: "#f9f9f9",
                  border: `1px solid ${colors.paleGreen || "#d9f7be"}`,
                  margin: "8px 0",
                }}
              >
                <Row gutter={[16, 8]}>
                  <Col xs={24} md={8}>
                    <Text strong style={{ color: colors.darkGreen }}>
                      Giáo viên:
                    </Text>{" "}
                    <Text>{record.teacher || "N/A"}</Text>
                  </Col>
                  <Col xs={24} md={8}>
                    <Text strong style={{ color: colors.darkGreen }}>
                      Đánh giá:
                    </Text>{" "}
                    <Tag color="blue">{record.assessment || "N/A"}</Tag>
                  </Col>
                  <Col xs={24} md={8}>
                    <Text strong style={{ color: colors.darkGreen }}>
                      Bình luận:
                    </Text>{" "}
                    <Text>{record.comment || "Chưa có bình luận"}</Text>
                  </Col>
                </Row>
              </Card>
            ),
            defaultExpandAllRows: true,
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <DownOutlined
                  onClick={(e) => onExpand(record, e)}
                  style={{ color: colors.darkGreen }}
                />
              ) : (
                <RightOutlined
                  onClick={(e) => onExpand(record, e)}
                  style={{ color: colors.darkGreen }}
                />
              ),
          }}
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
