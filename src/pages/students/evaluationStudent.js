import React, { useEffect, useState } from "react";
import { Card, List, Typography, Space, Divider, Pagination } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import studentService from "services/studentService";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";

const { Title, Text } = Typography;

const EvaluationStudent = ({ studentId, colors }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [skillEvaluations, setSkillEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const evalData = await studentService.getEvaluationStudent(studentId);
        const skillData = await studentService.getEvaluationSkillStudent(studentId);
        setEvaluations(Array.isArray(evalData) ? evalData : [evalData]);
        setSkillEvaluations(skillData);
      } catch (error) {
        console.error("Error fetching evaluations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, [studentId]);

  const getSkillsChartData = (type) => {
    const skills = skillEvaluations.filter((skill) => skill.skillType === type);

    // Lấy danh sách ngày duy nhất từ skillEvaluations
    const uniqueDates = [...new Set(skills.map((s) => s.date))].sort(
      (a, b) => new Date(a) - new Date(b)
    );

    // Tách biệt danh sách kỹ năng duy nhất
    const uniqueSkills = [...new Set(skills.map((s) => s.skill.name))];

    // Tạo dataset cho từng kỹ năng
    const datasets = uniqueSkills.map((skillName, index) => {
      const skillData = skills.filter((s) => s.skill.name === skillName);

      return {
        label: skillName,
        color: getColorForSkill(index), // Gán màu dựa trên index
        data: uniqueDates.map((date) => {
          const skillOnDate = skillData.find((s) => s.date === date);
          return skillOnDate ? (skillOnDate.score / 5) * 100 : 0; // Chuyển đổi điểm thành phần trăm
        }),
      };
    });

    return {
      labels: uniqueDates.map((date) => new Date(date).toLocaleDateString()),
      datasets,
    };
  };

  const getColorForSkill = (index) => {
    // Gán màu cố định dựa trên index để phân biệt các đường
    const colorOptions = [
      "info", // Xanh dương
      "warning", // Cam
      "success", // Xanh lá
      "error", // Đỏ
      "secondary", // Tím hoặc xám
      "dark", // Đen hoặc xám đậm
    ];
    return colorOptions[index % colorOptions.length]; // Lặp lại nếu vượt quá số màu
  };

  const renderComments = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedEvaluations = evaluations.slice(startIndex, startIndex + pageSize);

    return (
      <>
        <List
          dataSource={paginatedEvaluations}
          renderItem={(item) => (
            <List.Item>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text strong style={{ color: colors.darkGreen }}>
                  Giáo viên: {item.teacher.name} | Lịch học: {item.date}
                  {/* Thứ {item.schedule.dayOfWeek + 1} (
                  {item.schedule.startTime} - {item.schedule.endTime}) */}
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
            onChange={(page) => setCurrentPage(page)}
            style={{ marginTop: 16, textAlign: "center" }}
          />
        )}
      </>
    );
  };

  const renderSkillsChart = (type, title) => {
    const chartData = getSkillsChartData(type);
    return chartData.datasets.length > 0 ? (
      <DefaultLineChart chart={chartData} height="300px" />
    ) : (
      <Text>{`Chưa có dữ liệu ${title.toLowerCase()}.`}</Text>
    );
  };

  return (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: `0 2px 8px ${colors.softShadow}`,
        marginBottom: 20,
      }}
      loading={loading}
    >
      <Title level={3} style={{ color: colors.darkGreen, marginBottom: 20 }}>
        <BarChartOutlined /> Tình Hình Học Tập
      </Title>

      {evaluations.length > 0 || skillEvaluations.length > 0 ? (
        <>
          <Divider orientation="left" style={{ color: colors.darkGreen }}>
            Nhận xét của giáo viên
          </Divider>
          {renderComments()}

          <Divider orientation="left" style={{ color: colors.darkGreen }}>
            Kỹ năng học tập (Learning Skills)
          </Divider>
          {renderSkillsChart("1", "Kỹ năng học tập")}

          <Divider orientation="left" style={{ color: colors.darkGreen }}>
            Kỹ năng hành vi (Behavior Skills)
          </Divider>
          {renderSkillsChart("0", "Kỹ năng hành vi")}
        </>
      ) : (
        <Text>Chưa có đánh giá nào cho học sinh này.</Text>
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
