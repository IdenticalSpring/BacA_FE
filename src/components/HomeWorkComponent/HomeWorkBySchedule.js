import { Empty, Modal, Select } from "antd";
import { colors } from "assets/theme/color";
import React from "react";
import lessonByScheduleService from "services/lessonByScheduleService";
const { Option } = Select;
import PropTypes from "prop-types";
export default function HomeWorkBySchedule({
  lessonByScheduleData,
  daysOfWeek,
  homeWorksData,
  setLessonByScheduleData,
  isMobile,
  selected,
  setSelected,
}) {
  const handleUpdateLessonBySchedule = async (id, lessonByScheduleData) => {
    try {
      await lessonByScheduleService.updateLessonBySchedule(id, lessonByScheduleData);
      // Success message
    } catch (err) {
      Modal.error({
        title: "Error",
        content: "Lỗi khi cập nhật lesson_by_schedule!",
      });
    }
  };
  const handleSelect = (index) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  return (
    <div style={{ width: "90%", margin: "15px 0" }}>
      {lessonByScheduleData?.length > 0 ? (
        lessonByScheduleData?.map((item, index) => {
          return !item.homeWorkId ? (
            <div
              key={index}
              style={
                selected.has(item.id)
                  ? {
                      padding: "16px",
                      marginBottom: "12px",
                      border: `1px solid ${colors.borderGreen}`,
                      borderRadius: "8px",
                      backgroundColor: colors.paleGreen,
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      justifyContent: "space-between",
                      alignItems: isMobile ? "flex-start" : "center",
                      gap: "10px",
                      height: isMobile ? "15%" : "15%",
                      width: "100%",
                      transition: "all 0.3s ease-in-out",
                      cursor: "pointer",
                      border: "2px solid #2ECC71" /* Xanh lá cây sáng */,
                      backgroundColor: "#27AE60" /* Xanh lá cây đậm */,
                      boxShadow: "0 4px 10px rgba(194, 240, 215, 0.8)" /* Xanh lá pastel nhẹ */,

                      transform: "scale(1.1)",
                    }
                  : {
                      padding: "16px",
                      marginBottom: "12px",
                      border: `1px solid ${colors.lightGreen}`,
                      borderRadius: "8px",
                      backgroundColor: colors.paleGreen,
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      justifyContent: "space-between",
                      alignItems: isMobile ? "flex-start" : "center",
                      gap: "10px",
                      height: isMobile ? "15%" : "15%",
                      width: "100%",
                      transition: "all 0.3s ease-in-out",
                      cursor: "pointer",
                    }
              }
              onClick={() => handleSelect(item.id)}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: selected.has(index) ? "#fff" : colors.darkGreen,
                  flex: 1,
                  marginBottom: isMobile ? "10px" : 0,
                }}
              >
                📅 {daysOfWeek[item.schedule.dayOfWeek]} | {item.date} | 🕒{" "}
                {item.schedule.startTime} - {item.schedule.endTime}
              </div>

              {/* <Select
                style={{ width: isMobile ? "100%" : "48%" }}
                placeholder="Select lesson"
                value={
                  homeWorksData.some((homeWork) => homeWork.id === item.homeWorkId)
                    ? item.homeWorkId
                    : undefined
                }
                onChange={(value) => {
                  const newData = [...lessonByScheduleData];
                  newData[index] = { ...newData[index], homeWorkId: value };
                  setLessonByScheduleData(newData);
                  handleUpdateLessonBySchedule(item.id, { homeWorkId: value });
                }}
              >
                {homeWorksData?.map((homeWork) => (
                  <Option key={homeWork.id} value={homeWork.id}>
                    {homeWork.title}
                  </Option>
                ))}
              </Select> */}
            </div>
          ) : (
            <div
              key={index}
              style={{
                padding: "16px",
                marginBottom: "12px",
                border: `2px solid #BDC3C7`, // Màu xám nhạt
                borderRadius: "8px",
                backgroundColor: "#ECF0F1", // Xám sáng
                color: "#7F8C8D", // Chữ xám nhạt
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                gap: "10px",
                height: "15%",
                width: "100%",
                transition: "all 0.3s ease-in-out",
                opacity: 0.6, // Làm mờ
                cursor: "not-allowed", // Hiển thị chuột không thể click
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "#7F8C8D",
                  flex: 1,
                  marginBottom: isMobile ? "10px" : 0,
                }}
              >
                📅 {daysOfWeek[item.schedule.dayOfWeek]} | {item.date} | 🕒{" "}
                {item.schedule.startTime} - {item.schedule.endTime}
              </div>

              {/* <Select
            style={{ width: isMobile ? "100%" : "48%" }}
            placeholder="Select lesson"
            value={
              lessonsData.some((lesson) => lesson.id === item.lessonID)
                ? item.lessonID
                : undefined
            }
            onChange={(value) => {
              const newData = [...lessonByScheduleData];
              newData[index] = { ...newData[index], lessonID: value };
              setLessonByScheduleData(newData);
              handleUpdateLessonBySchedule(item.id, { lessonID: value });
            }}
          >
            {lessonsData?.map((lesson) => (
              <Option key={lesson.id} value={lesson.id}>
                {lesson.name}
              </Option>
            ))}
          </Select> */}
            </div>
          );
        })
      ) : (
        <Empty description="No lesson schedules found" />
      )}
    </div>
  );
}
HomeWorkBySchedule.propTypes = {
  lessonByScheduleData: PropTypes.func.isRequired,
  daysOfWeek: PropTypes.func.isRequired,
  homeWorksData: PropTypes.func.isRequired,
  setLessonByScheduleData: PropTypes.func.isRequired,
  isMobile: PropTypes.func.isRequired,
  setSelected: PropTypes.func.isRequired,
  selected: PropTypes.func.isRequired,
};
