import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Progress,
  Statistic,
  Tabs,
  Empty,
  Spin,
  Button,
  message,
  Select,
  Carousel,
  Badge,
  Tag,
  Avatar,
} from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  BookOutlined,
  UserOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { colors } from "assets/theme/color";
import PropTypes from "prop-types";
import student_homework_countService from "services/student_homework_countService";
import student_lesson_countService from "services/student_lesson_countService";
import checkinService from "services/checkinService";

// Sample data - you would replace this with your actual data
const mockData = [
  { id: 1, count: 3, isDelete: 0, studentId: 1, lessonId: 30 },
  { id: 2, count: 5, isDelete: 0, studentId: 2, lessonId: 30 },
  { id: 3, count: 2, isDelete: 0, studentId: 3, lessonId: 31 },
  { id: 4, count: 4, isDelete: 0, studentId: 4, lessonId: 32 },
  { id: 5, count: 1, isDelete: 0, studentId: 5, lessonId: 30 },
  { id: 6, count: 6, isDelete: 0, studentId: 6, lessonId: 33 },
  { id: 7, count: 0, isDelete: 0, studentId: 7, lessonId: 34 },
  { id: 8, count: 4, isDelete: 0, studentId: 8, lessonId: 31 },
  { id: 9, count: 3, isDelete: 0, studentId: 9, lessonId: 32 },
  { id: 10, count: 5, isDelete: 0, studentId: 10, lessonId: 33 },
];
const contentStyle = {
  margin: 0,
  height: "160px",
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  background: "#364d79",
};
const getStatusTag = (status) => {
  switch (status) {
    case 0:
      return (
        <Tag style={{ margin: 0 }} color="red">
          Vắng mặt
        </Tag>
      );
    case 1:
      return (
        <Tag style={{ margin: 0 }} color="green">
          Có mặt
        </Tag>
      );
    case 2:
      return (
        <Tag style={{ margin: 0 }} color="gold">
          Có phép
        </Tag>
      );
    default:
      return (
        <Tag style={{ margin: 0 }} color="gray">
          Đang xử lí
        </Tag>
      );
  }
};
const dayssOfWeek = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
let countLesson = 0;
let countHomework = 0;
const HomeworkStatisticsDashboard = ({ students, lessonByScheduleData, daysOfWeek, isMobile }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [student_homework_countData, setStudent_homework_countData] = useState([]);
  const [student_lesson_countData, setStudent_lesson_countData] = useState([]);
  const [student_data_for_table, setStudent_data_for_table] = useState([]);
  const [lessonByScheduleDiv, setLessonByScheduleDiv] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(lessonByScheduleData[0] ?? null);
  const [checkinData, setCheckinData] = useState(null);
  // const [countLesson, setCountLesson] = useState(0);
  // const [countHomework, setCountHomework] = useState(0);
  useMemo(() => {
    lessonByScheduleData.map((item) => {
      if (item.lessonID) {
        countLesson++;
      }
      if (item.homeWorkId) {
        countHomework++;
      }
    });
    // setCountLesson(countLessonData);
    // setCountHomework(countHomeworkData);
  }, [lessonByScheduleData]);
  // console.log(countLesson, countHomework);
  // useEffect(() => {
  //   setSelectedSchedule(lessonByScheduleData[0] ?? null);
  // }, [lessonByScheduleData]);
  useEffect(() => {
    const fetchCheckinData = async () => {
      try {
        // setLoading(true);
        const data = await checkinService.getAllCheckinOfLessonBySchedule(selectedSchedule?.id);
        setCheckinData(data);
      } catch (err) {
        console.log(err);
      } finally {
        // setLoading(false);
      }
    };
    fetchCheckinData();
  }, [selectedSchedule, students]);
  // console.log(checkinData);

  useEffect(() => {
    const fetchLessonAndHomeworkCountData = async () => {
      try {
        setLoading(true);
        const studentIds = students?.map((std) => {
          return {
            studentId: std?.id,
          };
        });
        const data = { students: studentIds };
        let homeworkCountData = await student_homework_countService.getAllCount(data);
        let lessonCountData = await student_lesson_countService.getAllCount(data);
        const tableData = students?.map((std) => {
          return {
            studentId: std?.id,
            studentName: std.name,
            studentImage: std.imgUrl,
            isDoneHomework: homeworkCountData?.find(
              (item) =>
                item.student?.id === std?.id && item.lessonBySchedule?.id === selectedSchedule?.id
            ),
            isDoneLesson: lessonCountData?.find(
              (item) =>
                item.student?.id === std?.id && item.lessonBySchedule?.id === selectedSchedule?.id
            ),
            isCheckin:
              checkinData?.find(
                (item) =>
                  item.student?.id === std?.id && item.lessonBySchedule?.id === selectedSchedule?.id
              )?.present ?? -1,
          };
        });
        homeworkCountData = homeworkCountData.map((item) => {
          return {
            id: item.id,
            count: item.count,
            studentId: item.student.id,
            studentName: item.student.name,
            studentImage: item.student.imgUrl,
            homeworkId: item.homework.id,
            homeworkTitle: item.homework.title,
            level: item.student.level,
            isDelete: item.student.isDelete ? 1 : 0,
            lessonByScheduleId: item.lessonBySchedule.id,
          };
        });
        lessonCountData = lessonCountData.map((item) => {
          return {
            id: item.id,
            count: item.count,
            studentId: item.student.id,
            studentName: item.student.name,
            studentImage: item.student.imgUrl,
            lessonId: item.lesson.id,
            lessonName: item.lesson.name,
            level: item.student.level,
            isDelete: item.student.isDelete ? 1 : 0,
            lessonByScheduleId: item.lessonBySchedule.id,
          };
        });
        // console.log(homeworkCountData, lessonCountData);
        setStudent_homework_countData(homeworkCountData);
        setStudent_data_for_table(tableData);
        setStudent_lesson_countData(lessonCountData);
      } catch (err) {
        message.error(
          "có lỗi trong quá trình lấy dữ liệu vui lòng tải lại trang để thử lại!" + err
        );
      } finally {
        setLoading(false);
      }
    };
    fetchLessonAndHomeworkCountData();
  }, [checkinData]);
  useEffect(() => {
    let lessonByScheduleDiv1 = [];
    const firstDate = new Date(lessonByScheduleData[0]?.date);
    const lastDate = new Date(firstDate);
    lastDate.setMonth(firstDate.getMonth() + 6);
    // Xác định ngày đầu tiên của tuần chứa firstDate (Chủ Nhật hoặc Thứ Hai)
    const firstWeekStart = new Date(firstDate);
    firstWeekStart.setDate(firstWeekStart.getDate() - firstWeekStart.getDay()); // Lùi về Chủ Nhật

    let currentDate = new Date(firstWeekStart);
    while (currentDate <= lastDate) {
      let week = []; // Tạo một mảng chứa JSX của từng tuần
      for (let i = 0; i < 7; i++) {
        if (currentDate > lastDate) break;

        // Tìm lịch trình của ngày hiện tại
        const scheduleItem = lessonByScheduleData.find(
          (item) => new Date(item?.date || "").getTime() === currentDate.getTime()
        );

        // Tạo UI cho ngày
        week.push(
          <Card
            key={currentDate.getTime()}
            hoverable
            style={{
              width: isMobile ? 100 : 150,
              textAlign: "center",
              border: scheduleItem ? "2px solid red" : "1px solid #ccc",
              backgroundColor: scheduleItem ? "#fff5f5" : "#f5f5f5",
              opacity: scheduleItem ? 1 : 0.5, // Giảm độ sáng
              cursor: scheduleItem ? "pointer" : "not-allowed",
              // scale: scheduleItem && scheduleItem.id === selectedSchedule.id ? "1.05" : "1",
            }}
            onClick={() => scheduleItem && setSelectedSchedule(scheduleItem)}
          >
            <Badge
              count={scheduleItem ? "📅" : 0}
              offset={[5, -5]}
              style={{
                backgroundColor: scheduleItem ? "red" : "transparent",
                color: "white",
              }}
            />
            <div
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: scheduleItem ? "red" : "black",
              }}
            >
              {dayssOfWeek[currentDate.getDay()]}
              <br />
              {currentDate.toLocaleDateString("vi-VN", {
                timeZone: "UTC",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
          </Card>
        );

        currentDate.setDate(currentDate.getDate() + 1);
      }
      lessonByScheduleDiv1.push(week);
    }
    setLessonByScheduleDiv(lessonByScheduleDiv1);
  }, [students]);
  // console.log(lessonByScheduleDiv);

  // useEffect(() => {
  //   // Simulate loading data
  //   setTimeout(() => {
  //     setData(mockData);
  //     setLoading(false);
  //   }, 800);
  // }, []);

  // Calculate statistics
  // console.log(lessonByScheduleData[0], selectedSchedule, student_lesson_countData);
  // console.log(checkinData, students);

  const totalLessonSubmissions = student_lesson_countData?.reduce((sum, item) => {
    // console.log(item?.lessonByScheduleId === selectedSchedule?.id && sum + item?.count, item);
    return item?.lessonByScheduleId === selectedSchedule?.id ? sum + item?.count : sum + 0;
  }, 0);
  const totalHomeworkSubmissions = student_homework_countData?.reduce((sum, item) => {
    // console.log(item?.lessonByScheduleId === selectedSchedule?.id && sum + item?.count, item);
    return item?.lessonByScheduleId === selectedSchedule?.id ? sum + item?.count : sum + 0;
  }, 0);
  const totalLessonAssign = lessonByScheduleData?.reduce(
    (sum, item) =>
      item?.class?.id === selectedSchedule?.class?.id && item?.isLessonSent ? sum + 1 : sum + 0,
    0
  );
  const totalHomeworkAssign = lessonByScheduleData?.reduce(
    (sum, item) =>
      item?.class?.id === selectedSchedule?.class?.id && item?.isHomeWorkSent ? sum + 1 : sum + 0,
    0
  );
  const totalStudents = [...new Set(students?.map((item) => item.id))].length;
  // const totalLessons = [...new Set(student_lesson_countData?.map((item) => item.lessonId))].length;
  const totalCheckin = [
    ...new Set(checkinData?.filter((item) => item.present === 1 || item.present === 2)),
  ].length;
  const averageCheckin = totalStudents ? (totalCheckin / totalStudents).toFixed(4) * 100 : 0;
  // console.log(
  //   totalCheckin,
  //   totalStudents,
  //   [...new Set(students.map((item) => item.id))],
  //   [...new Set(checkinData.filter((item) => item.present === 1))]
  // );

  // Find top performing students
  // const studentCounts = student_lesson_countData.reduce((acc, item) => {
  //   acc[item.studentId] = (acc[item.studentId] || 0) + item.count;
  //   return acc;
  // }, {});

  // const topStudents = Object.entries(studentCounts)
  //   .map(([studentId, count]) => ({ studentId: parseInt(studentId), count }))
  //   .sort((a, b) => b.count - a.count)
  //   .slice(0, 5);

  // Find most active lessons
  // const lessonCounts = student_lesson_countData.reduce((acc, item) => {
  //   acc[item.lessonId] = (acc[item.lessonId] || 0) + item.count;
  //   return acc;
  // }, {});

  // const topLessons = Object.entries(lessonCounts)
  //   .map(([lessonId, count]) => ({ lessonId: parseInt(lessonId), count }))
  //   .sort((a, b) => b.count - a.count)
  //   .slice(0, 5);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Define table columns
  // const submissionColumns = [
  //   {
  //     title: "Học sinh",
  //     dataIndex: "studentName",
  //     key: "studentName",
  //     render: (text) => <div style={{ fontWeight: 500, color: colors.darkGreen }}>{text}</div>,
  //   },
  //   {
  //     title: "Tình hình nộp bài",
  //     dataIndex: "count",
  //     key: "count",
  //     sorter: (a, b) => a.count - b.count,
  //     render: (count) => (
  //       <Progress
  //         percent={Math.min(count * 10, 100)}
  //         strokeColor={{
  //           "0%": colors.midGreen,
  //           "100%": colors.emerald,
  //         }}
  //         strokeWidth={8}
  //         format={() => count}
  //         style={{ marginRight: 8 }}
  //       />
  //     ),
  //   },
  // ];

  // const lessonColumns = [
  //   {
  //     title: "Lesson ID",
  //     dataIndex: "lessonId",
  //     key: "lessonId",
  //     render: (text) => <div style={{ fontWeight: 500, color: colors.deepGreen }}>{text}</div>,
  //   },
  //   {
  //     title: "Completion Count",
  //     dataIndex: "count",
  //     key: "count",
  //     sorter: (a, b) => a.count - b.count,
  //     render: (count) => (
  //       <Progress
  //         percent={Math.min(count * 5, 100)}
  //         strokeColor={{
  //           "0%": colors.accent,
  //           "100%": colors.safeGreen,
  //         }}
  //         strokeWidth={8}
  //         format={() => count}
  //       />
  //     ),
  //   },
  // ];

  // Card style
  const cardStyle = {
    borderRadius: 12,
    boxShadow: `0 4px 12px ${colors.softShadow}`,
    margin: "0 0 16px 0",
    border: `1px solid ${colors.borderGreen}`,
    background: colors.cardBg,
    overflow: "hidden",
  };

  const headerStyle = {
    background: colors.paleGreen,
    padding: "12px 16px",
    borderBottom: `1px solid ${colors.borderGreen}`,
    color: colors.darkGreen,
    fontSize: "16px",
    fontWeight: 600,
  };

  // Render component based on loading state
  // if (loading) {
  //   return (
  //     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
  //       <Spin size="large" tip="Loading statistics..." />
  //     </div>
  //   );
  // }

  return (
    <div style={{ padding: "16px", borderRadius: 8 }}>
      <div
        style={{
          background: colors.headerBg,
          padding: "16px",
          borderRadius: "8px 8px 0 0",
          color: colors.white,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <BarChartOutlined style={{ fontSize: 24, marginRight: 8 }} />
          <h2 style={{ margin: 0, fontSize: "20px" }}>Tình hình học</h2>
        </div>
        {/* <Button
          type="primary"
          style={{
            background: colors.accent,
            borderColor: colors.accent,
            color: colors.darkGray,
            fontWeight: 500,
          }}
        >
          Xuất báo cáo
        </Button> */}
      </div>
      <Carousel
        arrows
        infinite={false}
        dots={false}
        style={{ padding: "20px", backgroundColor: colors.lightGreen, borderRadius: 8 }}
      >
        {lessonByScheduleDiv.length > 0 &&
          lessonByScheduleDiv.map((week, weekIndex) => (
            <div key={weekIndex} style={{}}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  flexWrap: isMobile ? "wrap" : "nowrap",
                  // width: "100px",
                }}
              >
                {week}
              </div>
            </div>
          ))}
      </Carousel>
      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}
        >
          <Spin size="large" tip="Loading statistics..." />
        </div>
      ) : (
        <>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: 16 }}
            tabBarStyle={{ marginBottom: 16, borderBottom: `2px solid ${colors.mintGreen}` }}
            items={[
              {
                key: "overview",
                label: (
                  <span>
                    <LineChartOutlined /> Tổng quan
                  </span>
                ),
                children: (
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      flexWrap: "nowrap",
                      overflowX: "auto",
                      flexDirection: isMobile ? "column" : "row",
                    }}
                  >
                    <Card
                      style={{
                        ...cardStyle,
                        borderTop: `3px solid ${colors.deepGreen}`,
                        flexGrow: 1,
                      }}
                    >
                      <Statistic
                        title="Tổng số bài học đã giao"
                        value={totalLessonAssign}
                        prefix={<FileDoneOutlined />}
                        valueStyle={{ color: colors.deepGreen }}
                      />
                    </Card>
                    <Card
                      style={{
                        ...cardStyle,
                        borderTop: `3px solid ${colors.deepGreen}`,
                        flexGrow: 1,
                      }}
                    >
                      <Statistic
                        title="Tổng số bài tập đã giao"
                        value={totalHomeworkAssign}
                        prefix={<FileDoneOutlined />}
                        valueStyle={{ color: colors.deepGreen }}
                      />
                    </Card>
                    <Card
                      style={{
                        ...cardStyle,
                        borderTop: `3px solid ${colors.midGreen}`,
                        flexGrow: 1,
                      }}
                    >
                      <Statistic
                        title="Số lượt xem bài học"
                        value={totalLessonSubmissions}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: colors.deepGreen }}
                      />
                    </Card>
                    <Card
                      style={{ ...cardStyle, borderTop: `3px solid ${colors.accent}`, flexGrow: 1 }}
                    >
                      <Statistic
                        title="Số lượt xem bài tập"
                        value={totalHomeworkSubmissions}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: colors.deepGreen }}
                      />
                    </Card>
                    <Card
                      style={{
                        ...cardStyle,
                        borderTop: `3px solid ${colors.emerald}`,
                        flexGrow: 1,
                      }}
                    >
                      <Statistic
                        title="Điểm danh"
                        value={averageCheckin + "%"}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{
                          color: averageCheckin >= 50 ? colors.deepGreen : colors.errorRed,
                        }}
                      />
                    </Card>
                  </div>
                ),
              },
              // {
              //   key: "students",
              //   label: (
              //     <span>
              //       <UserOutlined /> Học sinh
              //     </span>
              //   ),
              //   children: (
              //     <Card
              //       title="Top Học sinh hoàn thành bài tập"
              //       style={cardStyle}
              //       headStyle={headerStyle}
              //     >
              //       {topStudents.length > 0 ? (
              //         <Table
              //           dataSource={topStudents}
              //           columns={submissionColumns}
              //           pagination={false}
              //           rowKey="studentId"
              //           style={{ borderRadius: 8 }}
              //           onRow={(record) => ({
              //             style: {
              //               background: colors.white,
              //               "&:hover": {
              //                 background: colors.tableRowHover,
              //               },
              //             },
              //           })}
              //         />
              //       ) : (
              //         <Empty description="Không có dữ liệu" />
              //       )}
              //     </Card>
              //   ),
              // },
              // {
              //   key: "lessons",
              //   label: (
              //     <span>
              //       <BookOutlined /> Bài học
              //     </span>
              //   ),
              //   children: (
              //     <Card
              //       title="Bài học được hoàn thành nhiều nhất"
              //       style={cardStyle}
              //       headStyle={headerStyle}
              //     >
              //       {topLessons.length > 0 ? (
              //         <Table
              //           dataSource={topLessons}
              //           columns={lessonColumns}
              //           pagination={false}
              //           rowKey="lessonId"
              //           style={{ borderRadius: 8 }}
              //         />
              //       ) : (
              //         <Empty description="Không có dữ liệu" />
              //       )}
              //     </Card>
              //   ),
              // },
            ]}
          />

          <Card title="Chi tiết hoàn thành bài tập" style={cardStyle} headStyle={headerStyle}>
            <Table
              dataSource={student_data_for_table}
              columns={[
                {
                  title: "ID",
                  dataIndex: "studentId",
                  key: "studentId",
                  width: 60,
                },
                {
                  title: "Avatar",
                  dataIndex: "studentImage",
                  key: "studentImage",
                  render: (text) => (
                    <Avatar
                      src={text}
                      icon={<UserOutlined />}
                      style={{ maxWidth: "50px", width: "50px", height: "50px" }}
                    />
                  ),
                },
                {
                  title: "Học sinh",
                  dataIndex: "studentName",
                  key: "studentName",
                  render: (text) => (
                    <span style={{ color: colors.darkGreen, fontWeight: 500 }}> {text}</span>
                  ),
                },
                {
                  title: "Tình hình luyện tập",
                  dataIndex: "isDoneLesson",
                  key: "isDoneLesson",
                  render: (text) => {
                    // console.log(text);

                    return text ? (
                      <Tag style={{ margin: 0 }} color="green">
                        Đã luyện tập
                      </Tag>
                    ) : (
                      <Tag style={{ margin: 0 }} color="red">
                        Chưa luyện tập
                      </Tag>
                    );
                  },
                },
                {
                  title: "Tình hình làm bài tập về nhà",
                  dataIndex: "isDoneHomework",
                  key: "isDoneHomework",
                  render: (text) => {
                    // console.log(text);

                    return text ? (
                      <Tag style={{ margin: 0 }} color="green">
                        Đã làm bài
                      </Tag>
                    ) : (
                      <Tag style={{ margin: 0 }} color="red">
                        Chưa làm bài
                      </Tag>
                    );
                  },
                },
                {
                  title: "Điểm danh",
                  dataIndex: "isCheckin",
                  key: "isCheckin",
                  render: (text) => {
                    // console.log(text);

                    return getStatusTag(text);
                  },
                },
              ]}
              pagination={{
                pageSize: 5,
                current: currentPage,
                onChange: handlePageChange,
                style: { marginTop: 16 },
                itemRender: (page, type, originalElement) => {
                  if (type === "page") {
                    return (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: page === currentPage ? colors.deepGreen : colors.white,
                          color: page === currentPage ? colors.white : colors.darkGray,
                          borderRadius: "50%",
                          cursor: "pointer",
                          border: page === currentPage ? "none" : `1px solid ${colors.borderGreen}`,
                          transition: "all 0.3s ease",
                        }}
                      >
                        {page}
                      </div>
                    );
                  }
                  return originalElement;
                },
              }}
              style={{ borderRadius: 8, maxWidth: "100%", overflowX: "auto" }}
              rowKey="id"
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default HomeworkStatisticsDashboard;
HomeworkStatisticsDashboard.propTypes = {
  students: PropTypes.array.isRequired,
  lessonByScheduleData: PropTypes.array.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  isMobile: PropTypes.array.isRequired,
};
