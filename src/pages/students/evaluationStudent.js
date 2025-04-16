import React, { useEffect, useState } from "react";
import { Card, List, Typography, Space, Divider, Select, Row, Col, Pagination } from "antd";
import { PieChartOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import studentService from "services/studentService";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const { Title, Text } = Typography;
const { Option } = Select;

const EvaluationStudent = ({ studentId, colors }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [skillEvaluations, setSkillEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const pageSize = 3;

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const [evalData, skillData] = await Promise.all([
          studentService.getEvaluationStudent(studentId),
          studentService.getEvaluationSkillStudent(studentId),
        ]);
        setEvaluations(Array.isArray(evalData) ? evalData : [evalData]);
        setSkillEvaluations(skillData);

        const uniqueDates = [...new Set(skillData.map((s) => s.date))].sort(
          (a, b) => new Date(b) - new Date(a)
        );
        if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]);
        }
      } catch (error) {
        console.error("Error fetching evaluations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, [studentId]);

  const getScoreDescription = (score) => {
    const descriptions = {
      1: "Cần cải thiện",
      2: "Cố gắng hơn",
      3: "Khá",
      4: "Giỏi",
      5: "Xuất sắc",
    };
    return descriptions[score] || "Không xác định";
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getUniqueDates = () =>
    [...new Set(skillEvaluations.map((s) => s.date))].sort((a, b) => new Date(a) - new Date(b));

  const getSkillsChartData = (type) => {
    if (!selectedDate) return { labels: [], datasets: [] };

    const skills = skillEvaluations.filter(
      (skill) => skill.skillType === type && skill.date === selectedDate
    );

    if (skills.length === 0) return { labels: [], datasets: [] };

    const labels = skills.map((skill) => skill.skill.name);
    const data = skills.map((skill) => skill.score); // Use raw score for pie chart
    const backgroundColors = [
      "#FF6B6B", // Coral
      "#4ECDC4", // Turquoise
      "#45B7D1", // Sky Blue
      "#96CEB4", // Mint
      "#FFEEAD", // Light Yellow
      "#D4A5A5", // Soft Pink
    ].slice(0, skills.length);

    return {
      labels,
      datasets: [
        {
          label: "Phân bố điểm",
          data,
          backgroundColor: backgroundColors,
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 20, // Makes segments pop out on hover
        },
      ],
    };
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14 },
          color: colors.darkGreen,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw;
            return `${label}: ${getScoreDescription(value)} (${value}/5)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    cutout: "50%", // Thêm dòng này để tạo phần trống ở giữa (Donut Chart)
  };

  const renderComments = () => {
    const paginatedEvaluations = evaluations.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

    return (
      <>
        <List
          dataSource={paginatedEvaluations}
          renderItem={(item) => (
            <List.Item>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: colors.darkGreen }}>
                  Giáo viên: {item.teacher.name} | Ngày: {formatDate(item.date)}
                </Text>
                <Text>{item.comment}</Text>
              </Space>
            </List.Item>
          )}
        />
        {evaluations.length > pageSize && (
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={evaluations.length}
            onChange={setCurrentPage}
            style={{ marginTop: 16, textAlign: "center" }}
          />
        )}
      </>
    );
  };

  const renderSkillsChart = (type, title) => {
    const chartData = getSkillsChartData(type);
    return chartData.labels.length ? (
      <div style={{ height: "300px", position: "relative" }}>
        <Pie data={chartData} options={chartOptions} />
      </div>
    ) : (
      <Text>{`Chưa có dữ liệu ${title.toLowerCase()} cho ngày đã chọn.`}</Text>
    );
  };

  const renderSkillDetails = () => {
    const uniqueDates = getUniqueDates();
    return (
      <>
        <Divider orientation="left" style={{ color: colors.darkGreen }}>
          Chi tiết đánh giá theo ngày
        </Divider>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text>Chọn ngày để xem từng chi tiết:</Text>
          <Select
            style={{ width: 200 }}
            placeholder="Chọn ngày"
            value={selectedDate}
            onChange={setSelectedDate}
            allowClear
          >
            {uniqueDates.map((date) => (
              <Option key={date} value={date}>
                {formatDate(date)}
              </Option>
            ))}
          </Select>
          {selectedDate && (
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Kỹ năng:</Text>
                <List
                  dataSource={skillEvaluations.filter(
                    (s) => s.date === selectedDate && s.skillType === "1"
                  )}
                  renderItem={(skill) => (
                    <List.Item>
                      <Text>
                        {skill.skill.name}: {getScoreDescription(skill.score)}
                      </Text>
                    </List.Item>
                  )}
                  locale={{ emptyText: "Chưa có kỹ năng." }}
                />
              </Col>
              <Col span={12}>
                <Text strong>Tình hình trong lớp:</Text>
                <List
                  dataSource={skillEvaluations.filter(
                    (s) => s.date === selectedDate && s.skillType === "0"
                  )}
                  renderItem={(skill) => (
                    <List.Item>
                      <Text>
                        {skill.skill.name}: {getScoreDescription(skill.score)}
                      </Text>
                    </List.Item>
                  )}
                  locale={{ emptyText: "Chưa có kỹ năng hành vi." }}
                />
              </Col>
            </Row>
          )}
        </Space>
      </>
    );
  };

  return (
    <Card
      style={{ borderRadius: 12, boxShadow: `0 2px 8px ${colors.softShadow}` }}
      loading={loading}
    >
      <Title level={3} style={{ color: colors.darkGreen, marginBottom: 20 }}>
        <PieChartOutlined /> Tình Hình Học Tập
      </Title>

      {evaluations.length || skillEvaluations.length ? (
        <>
          <Divider orientation="left" style={{ color: colors.darkGreen }}>
            Nhận xét của giáo viên
          </Divider>
          {renderComments()}

          {renderSkillDetails()}

          <Divider orientation="left" style={{ color: colors.darkGreen }}>
            Biểu đồ đánh giá
          </Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Card
                title={
                  <Text strong style={{ color: colors.darkGreen }}>
                    Kỹ năng
                  </Text>
                }
                style={{
                  borderRadius: 8,
                  boxShadow: `0 2px 4px ${colors.softShadow}`,
                }}
              >
                {renderSkillsChart("1", "Kỹ năng")}
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={
                  <Text strong style={{ color: colors.darkGreen }}>
                    Tình hình học tập
                  </Text>
                }
                style={{
                  borderRadius: 8,
                  boxShadow: `0 2px 4px ${colors.softShadow}`,
                }}
              >
                {renderSkillsChart("0", "Tình hình học tập")}
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Text>Chưa có đánh giá nào.</Text>
      )}
    </Card>
  );
};

EvaluationStudent.propTypes = {
  studentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  colors: PropTypes.shape({
    deepGreen: PropTypes.string.isRequired,
    paleGreen: PropTypes.string.isRequired,
    softShadow: PropTypes.string.isRequired,
    darkGreen: PropTypes.string.isRequired,
  }).isRequired,
};

export default EvaluationStudent;
