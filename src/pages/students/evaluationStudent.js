import React, { useEffect, useState } from "react";
import { Card, List, Typography, Space, Divider, Pagination, Select, Row, Col } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import studentService from "services/studentService";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";

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

        // Tìm ngày mới nhất từ skillEvaluations
        const uniqueDates = [...new Set(skillData.map((s) => s.date))].sort(
          (a, b) => new Date(b) - new Date(a) // Sắp xếp giảm dần để lấy ngày mới nhất
        );
        if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]); // Đặt ngày mới nhất làm mặc định
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

  // Hàm format ngày thành DD/MM/YYYY
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
    const skills = skillEvaluations.filter((skill) => skill.skillType === type);
    const uniqueDates = getUniqueDates();
    const uniqueSkills = [...new Set(skills.map((s) => s.skill.name))];

    const datasets = uniqueSkills.map((skillName, index) => ({
      label: skillName,
      color: ["info", "warning", "success", "error", "secondary", "dark"][index % 6],
      data: uniqueDates.map((date) => {
        const skillOnDate = skills.find((s) => s.date === date && s.skill.name === skillName);
        return skillOnDate ? (skillOnDate.score / 5) * 100 : 0;
      }),
    }));

    return {
      labels: uniqueDates.map((date) => formatDate(date)), // Format ngày cho biểu đồ
      datasets,
    };
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
                  Giáo viên: {item.teacher.name} | Ngày: {formatDate(item.date)} {/* Format ngày */}
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
    return chartData.datasets.length ? (
      <DefaultLineChart chart={chartData} height="300px" />
    ) : (
      <Text>{`Chưa có dữ liệu ${title.toLowerCase()}.`}</Text>
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
                {formatDate(date)} {/* Format ngày trong Select */}
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
        <BarChartOutlined /> Tình Hình Học Tập
      </Title>

      {evaluations.length || skillEvaluations.length ? (
        <>
          <Divider orientation="left" style={{ color: colors.darkGreen }}>
            Nhận xét của giáo viên
          </Divider>
          {renderComments()}

          {renderSkillDetails()}

          <Divider orientation="left" style={{ color: colors.darkGreen }}>
            Kỹ năng
          </Divider>
          {renderSkillsChart("1", " Kỹ năng")}

          <Divider orientation="left" style={{ color: colors.darkGreen }}>
            Tình hình học tập
          </Divider>
          {renderSkillsChart("0", "Tình hình học tập")}
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
