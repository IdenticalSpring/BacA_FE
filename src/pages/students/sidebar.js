import React, { useEffect, useState } from "react"; // Thêm useEffect
import PropTypes from "prop-types";
import { Layout, Typography, List, Divider } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import lessonService from "services/lessonService";

const { Title, Text } = Typography;

const daysOfWeek = [
  "Chọn ngày trong tuần",
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];

const Sidebar = ({
  lessonsBySchedule,
  selectedLessonBySchedule,
  onSelectLessonBySchedule,
  colors,
  isMobile,
  student,
}) => {
  // Lọc ra các bài học của ngày hiện tại và ngày đã qua
  const today = dayjs().startOf("day");
  const filteredLessons = lessonsBySchedule
    .filter((lesson) => {
      const lessonDate = dayjs(lesson.date).startOf("day");
      return lessonDate.isSame(today) || lessonDate.isBefore(today);
    })
    .sort((a, b) => {
      return dayjs(b.date).valueOf() - dayjs(a.date).valueOf(); // Sắp xếp giảm dần (mới nhất trước)
    });
  const [lessonNames, setLessonNames] = useState({});
  // Lấy tên bài học từ API dựa trên lessonID
  useEffect(() => {
    const fetchLessonNames = async () => {
      const allLessons = [...filteredLessons, ...upcomingLessons];
      const newLessonNames = { ...lessonNames };

      for (const lesson of allLessons) {
        if (lesson.lessonID && !newLessonNames[lesson.lessonID]) {
          try {
            const lessonData = await lessonService.getLessonById(lesson.lessonID);
            newLessonNames[lesson.lessonID] = lessonData.name || "Bài học không có tên";
          } catch (error) {
            console.error(`Error fetching name for lesson ${lesson.lessonID}:`, error);
            newLessonNames[lesson.lessonID] = "Bài học không có tên";
          }
        }
      }

      setLessonNames(newLessonNames);
    };

    fetchLessonNames();
  }, [lessonsBySchedule]);

  // // Lọc ra các bài học sắp tới
  // const upcomingLessons = lessonsBySchedule
  //   .filter((lesson) => {
  //     const lessonDate = dayjs(lesson.date).startOf("day");
  //     return lessonDate.isAfter(today);
  //   })
  //   .sort((a, b) => {
  //     return dayjs(a.date).valueOf() - dayjs(b.date).valueOf(); // Sắp xếp tăng dần
  //   });

  // Lọc ra các bài học sắp tới
  const upcomingLessons = lessonsBySchedule
    .filter((lesson) => {
      const lessonDate = dayjs(lesson.date).startOf("day");
      // console.log("lesson.isHomeWorkSent", lesson.isHomeWorkSent);
      // console.log("lesson.isLessonSent", lesson.isLessonSent);
      return (
        lessonDate.isAfter(today) &&
        (lesson.isHomeWorkSent === true || lesson.isLessonSent === true)
      );
    })
    .sort((a, b) => {
      return dayjs(a.date).valueOf() - dayjs(b.date).valueOf(); // Sắp xếp tăng dần
    });

  // Thêm useEffect để chọn bài học mới nhất mặc định
  useEffect(() => {
    if (!selectedLessonBySchedule && filteredLessons.length > 0) {
      // Nếu chưa có bài học nào được chọn và có bài học trong filteredLessons
      // const latestLesson = filteredLessons[0]; // Bài học mới nhất (đầu tiên trong danh sách đã sắp xếp)
      // onSelectLessonBySchedule(latestLesson.id); // Chọn bài học mới nhất
    }
  }, [lessonsBySchedule, selectedLessonBySchedule, onSelectLessonBySchedule, filteredLessons]);

  // Hàm render danh sách bài học chung
  const renderLessonList = (lessons, isSelectable = true) => {
    if (lessons.length === 0) {
      return (
        <div
          style={{
            padding: 24,
            textAlign: "center",
            color: colors.darkGray,
            backgroundColor: colors.white,
            borderRadius: 12,
            boxShadow: `0 2px 6px ${colors.softShadow}`,
          }}
        >
          <CalendarOutlined style={{ fontSize: 28, color: colors.midGreen, marginBottom: 12 }} />
          <Text style={{ display: "block", fontWeight: 500, color: colors.darkGreen }}>
            {isSelectable ? "Không có bài học nào" : "Không có bài học sắp tới"}
          </Text>
          <Text style={{ fontSize: "0.9rem", color: colors.darkGray }}>
            {isSelectable
              ? "Hiện không có bài học nào của ngày hiện tại hoặc ngày đã qua"
              : "Hiện không có bài học nào trong tương lai"}
          </Text>
        </div>
      );
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={lessons}
        renderItem={(item) => {
          const isSelected = isSelectable && selectedLessonBySchedule === item.id;
          return (
            <List.Item
              style={{
                padding: 0,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: isMobile ? "12px 14px" : "14px 16px",
                  borderRadius: 12,
                  cursor: isSelectable ? "pointer" : "default",
                  backgroundColor: isSelected ? colors.lightGreen : colors.white,
                  width: "100%",
                  transition: "all 0.2s ease",
                  boxShadow: isSelected
                    ? `0 4px 8px ${colors.softShadow}`
                    : `0 2px 4px ${colors.softShadow}`,
                  border: `1px solid ${isSelected ? colors.borderGreen : "transparent"}`,
                  transform: isSelected ? "translateY(-2px)" : "none",
                }}
                onClick={isSelectable ? () => onSelectLessonBySchedule(item.id) : undefined}
              >
                <div
                  style={{
                    backgroundColor: isSelected ? colors.midGreen : colors.paleGreen,
                    borderRadius: "10px",
                    padding: "12px",
                    marginRight: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: isMobile ? "40px" : "48px",
                  }}
                >
                  <CalendarOutlined />
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    rowGap: "5px",
                  }}
                >
                  {/* <Text
                    style={{
                      color: isSelected ? colors.darkGreen : colors.darkGray,
                      fontWeight: "600",
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      display: "block",
                      lineHeight: "1.2",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {"Bài học ngày"}
                  </Text> */}

                  <Text
                    style={{
                      color: isSelected ? colors.darkGreen : colors.darkGray,
                      fontWeight: "600",
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      display: "block",
                      lineHeight: "1.2",
                    }}
                  >
                    {new Date(item.date).toLocaleDateString("vi-VN")}
                  </Text>
                  <Text
                    style={{
                      color: isSelected ? colors.darkGreen : colors.darkGray,
                      fontWeight: "600",
                      fontSize: isMobile ? "0.9rem" : "1rem",
                      display: "block",
                      lineHeight: "1.2",
                      width: "100%",
                      textAlign: "center",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap", // Ngăn văn bản xuống dòng
                      overflow: "hidden",
                      maxWidth: isMobile ? "150px" : "130px",
                    }}
                  >
                    {lessonNames[item.lessonID] || "Đang tải..."}
                  </Text>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  return (
    <div
      style={{
        backgroundColor: colors.paleGreen,
        boxShadow: `0 2px 12px ${colors.softShadow}`,
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "0px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "16px" : "14px",
          backgroundColor: colors.midGreen,
          color: colors.white,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {student?.avatarUrl ? (
            <img
              src={student.imgUrl}
              alt={student?.name || "Student"}
              style={{
                width: isMobile ? 30 : 38,
                height: isMobile ? 30 : 38,
                borderRadius: "50%",
                objectFit: "cover",
                marginRight: 12,
              }}
            />
          ) : (
            <div
              style={{
                width: isMobile ? 30 : 38,
                height: isMobile ? 30 : 38,
                borderRadius: "50%",
                backgroundColor: colors.deepGreen,
                color: colors.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isMobile ? 16 : 20,
                marginRight: 12,
              }}
            >
              {student?.name?.charAt(0).toUpperCase() || ""}
            </div>
          )}
          <Title
            level={isMobile ? 5 : 4}
            style={{
              margin: 0,
              color: colors.white,
              fontWeight: "600",
              fontSize: isMobile ? "1rem" : "1.2rem",
              letterSpacing: "0.5px",
            }}
          >
            Xin chào {student?.name || ""}
          </Title>
        </div>
      </div>

      {/* Container for Previous and Upcoming Lessons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100% - 80px)",
          overflow: "hidden",
        }}
      >
        {/* Previous Lessons Section */}
        <div
          style={{
            flex: "0 0 50%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "5px 16px", backgroundColor: colors.paleGreen }}>
            <div
              style={{
                margin: "0 auto",
                padding: "5px 0",
                width: "80%",
                textAlign: "center",
                borderBottom: `1px solid ${colors.lightGreen}`,
                marginBottom: "10px",
              }}
            >
              <Text
                style={{
                  fontWeight: 700,
                  color: colors.darkGreen,
                }}
              >
                Nội dung đã học
              </Text>
            </div>
          </div>

          <div
            style={{
              padding: "0px 12px",
              overflowY: "auto",
              flex: 1,
            }}
          >
            {renderLessonList(filteredLessons, true)}
          </div>
        </div>

        {/* Divider */}
        <Divider
          style={{
            margin: "10px 0",
            backgroundColor: colors.lightGreen,
            height: 2,
          }}
        />

        {/* Upcoming Lessons Section */}
        <div
          style={{
            flex: "0 0 50%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "5px 16px", backgroundColor: colors.paleGreen }}>
            <div
              style={{
                margin: "0 auto",
                padding: "5px 0",
                width: "80%",
                textAlign: "center",
                borderBottom: `1px solid ${colors.lightGreen}`,
                marginBottom: "10px",
              }}
            >
              <Text
                style={{
                  fontWeight: 700,
                  color: colors.darkGreen,
                }}
              >
                Nội dung sắp tới
              </Text>
            </div>
          </div>

          <div
            style={{
              padding: "0px 12px",
              overflowY: "auto",
              flex: 1,
            }}
          >
            {renderLessonList(upcomingLessons, true)}
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes and defaultProps remain the same
Sidebar.propTypes = {
  student: PropTypes.object,
  lessonsBySchedule: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      date: PropTypes.string,
      schedule: PropTypes.shape({
        dayOfWeek: PropTypes.number,
        startTime: PropTypes.string,
        endTime: PropTypes.string,
      }),
    })
  ).isRequired,
  selectedLessonBySchedule: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelectLessonBySchedule: PropTypes.func.isRequired,
  colors: PropTypes.shape({
    lightGreen: PropTypes.string,
    deepGreen: PropTypes.string,
    white: PropTypes.string,
    darkGray: PropTypes.string,
    paleGreen: PropTypes.string,
    softShadow: PropTypes.string,
    borderGreen: PropTypes.string,
    midGreen: PropTypes.string,
    darkGreen: PropTypes.string,
  }).isRequired,
  isMobile: PropTypes.bool,
};

Sidebar.defaultProps = {
  selectedLessonBySchedule: null,
  isMobile: false,
};

export default Sidebar;
