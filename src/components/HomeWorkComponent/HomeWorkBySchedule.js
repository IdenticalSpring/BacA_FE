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
  return (
    <>
      {lessonByScheduleData.length > 0 ? (
        lessonByScheduleData?.map((item, index) => (
          <div
            key={index}
            style={{
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
              height: isMobile ? "40%" : "25%",
              width: "100%",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                color: colors.darkGreen,
                flex: 1,
                marginBottom: isMobile ? "10px" : 0,
              }}
            >
              📅 {daysOfWeek[item.schedule.dayOfWeek]} | {item.date} | 🕒 {item.schedule.startTime}{" "}
              - {item.schedule.endTime}
            </div>

            <Select
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
                  {homeWork.name}
                </Option>
              ))}
            </Select>
          </div>
        ))
      ) : (
        <Empty description="No lesson schedules found" />
      )}
    </>
  );
}
HomeWorkBySchedule.propTypes = {
  lessonByScheduleData: PropTypes.func.isRequired,
  daysOfWeek: PropTypes.func.isRequired,
  homeWorksData: PropTypes.func.isRequired,
  setLessonByScheduleData: PropTypes.func.isRequired,
  isMobile: PropTypes.func.isRequired,
};
