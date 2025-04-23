import React, { useEffect, useState } from "react";
import {
  Card,
  List,
  Typography,
  Space,
  Divider,
  Select,
  Row,
  Col,
  Pagination,
  DatePicker,
} from "antd";
import { PieChartOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import studentService from "services/studentService";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

const { RangePicker } = DatePicker;
ChartJS.register(ArcElement, Tooltip, Legend);

const { Title, Text } = Typography;
const { Option } = Select;

const EvaluationStudent = ({ studentId, colors }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [skillEvaluations, setSkillEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const pageSize = 3;

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 768;

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
    [...new Set(skillEvaluations.map((s) => s.date))].sort((a, b) => new Date(b) - new Date(a));

  const getFilteredEvaluations = () => {
    // Kiểm tra nếu dateRange là null hoặc không hợp lệ
    if (!dateRange || !dateRange[0] || !dateRange[1]) return evaluations;
    const startDate = new Date(dateRange[0]).setHours(0, 0, 0, 0);
    const endDate = new Date(dateRange[1]).setHours(23, 59, 59, 999);
    return evaluations.filter((item) => {
      const itemDate = new Date(item.date).getTime();
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const getFilteredSkillEvaluations = (type) => {
    // Kiểm tra nếu dateRange là null hoặc không hợp lệ
    if (!dateRange || !dateRange[0] || !dateRange[1])
      return skillEvaluations.filter((s) => s.skillType === type);
    const startDate = new Date(dateRange[0]).setHours(0, 0, 0, 0);
    const endDate = new Date(dateRange[1]).setHours(23, 59, 59, 999);
    return skillEvaluations.filter((s) => {
      const skillDate = new Date(s.date).getTime();
      return s.skillType === type && skillDate >= startDate && skillDate <= endDate;
    });
  };

  const getSkillsChartData = (type) => {
    if (!selectedDate && (!dateRange || !dateRange[0] || !dateRange[1]))
      return { labels: [], datasets: [] };

    let skills;
    if (dateRange && dateRange[0] && dateRange[1]) {
      skills = getFilteredSkillEvaluations(type);
    } else {
      skills = skillEvaluations.filter(
        (skill) => skill.skillType === type && skill.date === selectedDate
      );
    }

    if (skills.length === 0) return { labels: [], datasets: [] };

    let labels, data;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const skillMap = skills.reduce((acc, skill) => {
        const skillName = skill.skill.name;
        if (!acc[skillName]) {
          acc[skillName] = { totalScore: 0, count: 0 };
        }
        acc[skillName].totalScore += skill.score;
        acc[skillName].count += 1;
        return acc;
      }, {});
      labels = Object.keys(skillMap);
      data = labels.map((name) => {
        const { totalScore, count } = skillMap[name];
        return (totalScore / count).toFixed(1);
      });
    } else {
      labels = skills.map((skill) => skill.skill.name);
      data = skills.map((skill) => skill.score);
    }

    const backgroundColors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEEAD",
      "#D4A5A5",
    ].slice(0, labels.length);

    return {
      labels,
      datasets: [
        {
          label: dateRange && dateRange[0] && dateRange[1] ? "Điểm trung bình" : "Phân bố điểm",
          data,
          backgroundColor: backgroundColors,
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 20,
        },
      ],
    };
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: isMobile ? 12 : 14 },
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
        bodyFont: { size: isMobile ? 10 : 12 },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    cutout: "50%",
  };

  const renderComments = () => {
    if (!selectedDate) return <Text>Chưa chọn ngày để hiển thị nhận xét.</Text>;

    const filteredEvaluations = evaluations
      .filter((item) => item.date === selectedDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const paginatedEvaluations = filteredEvaluations.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

    return (
      <>
        {filteredEvaluations.length > 0 ? (
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
            {filteredEvaluations.length > pageSize && (
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredEvaluations.length}
                onChange={setCurrentPage}
                style={{ marginTop: 16, textAlign: "center" }}
              />
            )}
          </>
        ) : (
          <Text>Chưa có nhận xét cho ngày này.</Text>
        )}
      </>
    );
  };

  const renderSkillsChart = (type, title) => {
    const chartData = getSkillsChartData(type);
    return chartData.labels.length ? (
      <div style={{ height: isMobile ? "200px" : "300px", position: "relative" }}>
        <Pie data={chartData} options={chartOptions} />
      </div>
    ) : (
      <Text>{`Chưa có dữ liệu ${title.toLowerCase()} cho khoảng thời gian đã chọn.`}</Text>
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
            <Row gutter={isMobile ? 8 : 16}>
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

  const renderSummary = () => {
    const filteredEvaluations = getFilteredEvaluations();
    const paginatedEvaluations = filteredEvaluations.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

    return (
      <>
        <Divider orientation="left" style={{ color: colors.darkGreen }}>
          Tổng hợp tình hình học tập
        </Divider>
        <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
          <Text>Chọn khoảng thời gian để xem tổng hợp:</Text>
          <RangePicker
            format="DD/MM/YYYY"
            onChange={(dates) => setDateRange(dates || [null, null])} // Xử lý khi người dùng xóa lựa chọn
            style={{ width: isMobile ? "100%" : 300 }}
            popupStyle={{ zIndex: 2000 }}
          />
        </Space>

        {dateRange && dateRange[0] && dateRange[1] ? (
          <>
            {/* <Row gutter={isMobile ? 8 : 16}>
              <Col span={12}>
                <Text strong>Kỹ năng:</Text>
                <List
                  dataSource={getFilteredSkillEvaluations("1")}
                  renderItem={(skill) => (
                    <List.Item>
                      <Text>
                        {skill.skill.name}: {getScoreDescription(skill.score)} ({skill.score}/5)
                      </Text>
                    </List.Item>
                  )}
                  locale={{ emptyText: "Chưa có kỹ năng." }}
                />
              </Col>
              <Col span={12}>
                <Text strong>Tình hình trong lớp:</Text>
                <List
                  dataSource={getFilteredSkillEvaluations("0")}
                  renderItem={(skill) => (
                    <List.Item>
                      <Text>
                        {skill.skill.name}: {getScoreDescription(skill.score)} ({skill.score}/5)
                      </Text>
                    </List.Item>
                  )}
                  locale={{ emptyText: "Chưa có kỹ năng hành vi." }}
                />
              </Col>
            </Row> */}
            <Divider orientation="left" style={{ color: colors.darkGreen }}>
              Nhận xét của giáo viên
            </Divider>
            {filteredEvaluations.length > 0 ? (
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
                {filteredEvaluations.length > pageSize && (
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredEvaluations.length}
                    onChange={setCurrentPage}
                    style={{ marginTop: 16, textAlign: "center" }}
                  />
                )}
              </>
            ) : (
              <Text>Chưa có nhận xét trong khoảng thời gian này.</Text>
            )}
          </>
        ) : (
          <Text>Vui lòng chọn khoảng thời gian để xem tổng hợp.</Text>
        )}
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
          {renderSkillDetails()}
          {renderSummary()}
          <Divider orientation="left" style={{ color: colors.darkGreen }}>
            Nhận xét của giáo viên theo ngày
          </Divider>
          {renderComments()}
          <Divider orientation="left" style={{ color: colors.darkGreen }}>
            Biểu đồ đánh giá
          </Divider>
          <Row gutter={isMobile ? 8 : 16}>
            <Col span={isMobile ? 24 : 12}>
              <Card
                title={
                  <Text strong style={{ color: colors.darkGreen }}>
                    Kỹ năng
                  </Text>
                }
                style={{
                  borderRadius: 8,
                  boxShadow: `0 2px 4px ${colors.softShadow}`,
                  marginBottom: isMobile ? 16 : 0,
                }}
              >
                {renderSkillsChart("1", "Kỹ năng")}
              </Card>
            </Col>
            <Col span={isMobile ? 24 : 12}>
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
