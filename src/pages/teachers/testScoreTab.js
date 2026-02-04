import React, { useState, useEffect, useMemo } from "react";
import { Select, Card, Spin, Typography } from "antd";
import PropTypes from "prop-types";
import DataTable from "examples/Tables/DataTable";
import TextField from "@mui/material/TextField";
import studentScoreService from "services/studentScoreService";
import studentService from "services/studentService";
import classTestScheduleService from "services/classTestScheduleService";
import testSkillService from "services/testSkillService";
import assessmentService from "services/assessmentService";
import { colors } from "assets/theme/color";

const { Option } = Select;
const { Text } = Typography;

const ScoreCell = ({ value }) => {
  return value || "-";
};

ScoreCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const AvgScoreCell = ({ value }) => {
  const displayValue =
    value !== null && value !== undefined && value !== "-"
      ? typeof value === "number"
        ? value.toFixed(2)
        : value
      : "-";
  return <strong style={{ color: colors.deepGreen }}>{displayValue}</strong>;
};

AvgScoreCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const TestScoresTab = ({ students, classId, cardStyle, headerStyle }) => {
  const [previousScores, setPreviousScores] = useState([]);
  const [classTestSchedules, setClassTestSchedules] = useState([]);
  const [testSkills, setTestSkills] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [filterTestSchedule, setFilterTestSchedule] = useState("");
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentIds = students.map((s) => s.id);
        const [scheduleData, skillData, assessmentData, scoreData, detailsData] = await Promise.all(
          [
            classTestScheduleService.getAllClassTestSchedule(),
            testSkillService.getAllTestSkill(),
            assessmentService.getAllAssessments(),
            studentScoreService.getCombinedStudentScores(studentIds),
            studentScoreService.getAllStudentScoreDetailsProcessed(),
          ]
        );

        console.log("Raw API data:", {
          scheduleData,
          skillData,
          assessmentData,
          scoreData,
          detailsData,
        });

        // Lọc scheduleData theo classID - sử dụng classId prop hoặc lấy từ students
        let targetClassId = classId;
        if (!targetClassId && students.length > 0) {
          // Fallback: lấy classId từ student đầu tiên
          targetClassId = students[0].class?.id || students[0].classID;
        }
        
        console.log("Target classId:", targetClassId);
        console.log("First schedule item structure:", scheduleData[0]);
        
        // Check both classID and class.id for the filter
        const filteredSchedules = targetClassId 
          ? scheduleData.filter((s) => {
              const scheduleClassId = s.classID || s.classId || s.class?.id;
              return Number(scheduleClassId) === Number(targetClassId);
            })
          : [];

        console.log("filteredSchedules", filteredSchedules);

        // Note: setClassTestSchedules will be called after processing scores
        setTestSkills(skillData);
        setAssessments(assessmentData);

        // Ghép dữ liệu - Use scheduleData (all schedules) to look up schedule info
        const studentScores = scoreData.map((score) => {
          const student = students.find((s) => Number(s.id) === Number(score.studentID));
          const schedule = scheduleData.find((s) => Number(s.id) === Number(score.classTestScheduleID));
          const assessment = assessmentData.find((a) => Number(a.id) === Number(score.assessmentID));
          const detail = detailsData.find((d) => d.studentScoreID === score.studentScoreID);

          // Tính điểm trung bình từ các điểm kỹ năng thực tế
          let avgScore = "-";
          if (detail && detail.scores && typeof detail.scores === "object") {
            const scoreValues = Object.values(detail.scores).filter(
              (val) => val !== null && val !== undefined && val !== "-" && !isNaN(parseFloat(val))
            );
            if (scoreValues.length > 0) {
              const sum = scoreValues.reduce((acc, val) => acc + parseFloat(val), 0);
              avgScore = (sum / scoreValues.length).toFixed(2);
            }
          }

          console.log("Student scores debug:", {
            studentName: student ? student.name : "Unknown",
            scores: detail ? detail.scores : {},
            calculatedAvg: avgScore,
            originalAvg: detail ? detail.avgScore : "-",
          });

          return {
            key: score.studentScoreID,
            studentScoreID: score.studentScoreID,
            studentID: score.studentID,
            studentName: student ? student.name : "Unknown",
            testScheduleID: score.classTestScheduleID,
            testName: schedule?.test?.name || "Không xác định",
            testScheduleName: schedule ? schedule.date : "Unknown", // Đảm bảo lấy schedule.date
            assessmentName: assessment ? assessment.name : "Unknown",
            scores: detail ? detail.scores : {},
            avgScore: avgScore,
            teacherComment: score.teacherComment || "-",
          };
        });

        console.log("Processed previous scores:", studentScores);
        setPreviousScores(studentScores);
        
        // Lấy danh sách schedules từ các scores thực tế của students
        // Thay vì lọc theo classId (có thể không khớp nếu students được chuyển lớp)
        const scheduleIdsFromScores = [...new Set(studentScores.map(s => s.testScheduleID).filter(Boolean))];
        const schedulesForFilter = scheduleData.filter(s => scheduleIdsFromScores.includes(s.id));
        
        console.log("Schedule IDs from scores:", scheduleIdsFromScores);
        console.log("Schedules for filter dropdown:", schedulesForFilter);
        
        setClassTestSchedules(schedulesForFilter);
      } catch (error) {
        console.error("Error fetching test scores:", error);
        setError("Failed to load test scores. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (students.length > 0) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [students, classId]);

  const scoreColumns = [
    {
      Header: "Học sinh",
      accessor: "studentName",
      width: "12%",
    },
    {
      Header: "Tên bài kiểm tra",
      accessor: "testName",
      width: "15%",
    },
    {
      Header: "Ngày kiểm tra",
      accessor: "testScheduleName",
      width: "12%",
    },
    {
      Header: "Đánh giá",
      accessor: "assessmentName",
      width: "15%",
    },
    ...testSkills.map((skill) => ({
      Header: skill.name,
      accessor: `scores.${skill.name}`,
      width: "8%",
      align: "center",
      Cell: ScoreCell,
    })),
    {
      Header: "Điểm trung bình",
      accessor: "avgScore",
      width: "10%",
      align: "center",
      Cell: AvgScoreCell,
    },
    {
      Header: "Teacher Comment",
      accessor: "teacherComment",
      width: "19%",
      Cell: ScoreCell,
    },
  ];

  const filteredScores = useMemo(() => {
    const result = previousScores.filter((score) => {
      const nameMatch = score.studentName.toLowerCase().includes(filterName.toLowerCase());
      const scheduleMatch = filterTestSchedule ? Number(score.testScheduleID) === Number(filterTestSchedule) : true;
      return nameMatch && scheduleMatch;
    });
    console.log("Filtered scores:", result);
    return result;
  }, [previousScores, filterName, filterTestSchedule]);

  return (
    <Card title="Điểm thi" style={cardStyle} headStyle={headerStyle}>
      <Spin spinning={loading}>
        {error && (
          <div style={{ textAlign: "center", padding: "20px", color: colors.errorRed || "red" }}>
            <Text type="danger">{error}</Text>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Select
            placeholder="Lọc theo buổi thi"
            value={filterTestSchedule}
            onChange={(value) => setFilterTestSchedule(value)}
            style={{ width: 200 }}
            allowClear
          >
            {classTestSchedules.map((schedule) => (
              <Option key={schedule.id} value={schedule.id}>
                {schedule.date}
              </Option>
            ))}
          </Select>
          <TextField
            label="Lọc tên học sinh"
            variant="outlined"
            size="small"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            sx={{ backgroundColor: "white", borderRadius: "4px", width: 200 }}
          />
        </div>
        <DataTable
          table={{
            columns: scoreColumns,
            rows: filteredScores,
          }}
          isSorted={false}
          entriesPerPage={10}
          showTotalEntries={false}
          noEndBorder
          loading={loading}
        />
        {!loading && filteredScores.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Text type="secondary">No test scores available.</Text>
          </div>
        )}
      </Spin>
    </Card>
  );
};

TestScoresTab.propTypes = {
  students: PropTypes.array.isRequired,
  classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cardStyle: PropTypes.object,
  headerStyle: PropTypes.object,
};

export default TestScoresTab;
