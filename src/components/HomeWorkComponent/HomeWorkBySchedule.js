import { Empty, Modal, Pagination, Select } from "antd";
import { colors } from "assets/theme/color";
import React, { useState } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const paginatedData = lessonByScheduleData?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
        if (newSet.size === 0) {
          newSet.add(index);
        }
      }
      return newSet;
    });
  };
  return (
    <div
      style={{
        width: "90%",
        height: "80%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {paginatedData?.length > 0 ? (
        <>
          {paginatedData.map((item, index) => {
            const realIndex = (currentPage - 1) * pageSize + index;

            const isSelected = selected.has(item.id);
            const isAssigned = !!item.homeWorkId;

            const commonStyle = {
              padding: "16px",
              marginBottom: "12px",
              borderRadius: "8px",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              gap: "10px",
              height: "15%",
              width: "100%",
              transition: "all 0.3s ease-in-out",
            };

            if (!isAssigned) {
              return (
                <div
                  key={realIndex}
                  style={{
                    ...commonStyle,
                    border: isSelected ? "2px solid #2ECC71" : `1px solid ${colors.lightGreen}`,
                    backgroundColor: isSelected ? "#27AE60" : colors.paleGreen,
                    boxShadow: isSelected ? "0 4px 10px rgba(194, 240, 215, 0.8)" : "none",
                    transform: isSelected ? "scale(1.1)" : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSelect(item.id)}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: isSelected ? "#fff" : colors.darkGreen,
                      flex: 1,
                      marginBottom: isMobile ? "10px" : 0,
                    }}
                  >
                    📅 {daysOfWeek[item.schedule.dayOfWeek]} | {item.date} | 🕒{" "}
                    {item.schedule.startTime} - {item.schedule.endTime}
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={realIndex}
                  style={{
                    ...commonStyle,
                    border: "2px solid #BDC3C7",
                    backgroundColor: "#ECF0F1",
                    color: "#7F8C8D",
                    opacity: 0.6,
                    cursor: "not-allowed",
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
                </div>
              );
            }
          })}

          {/* Pagination */}
          {lessonByScheduleData.length > pageSize && (
            <Pagination
              size="small"
              current={currentPage}
              pageSize={pageSize}
              total={lessonByScheduleData.length}
              onChange={(page) => setCurrentPage(page)}
              style={{ textAlign: "center", marginTop: 20 }}
              showSizeChanger={false}
            />
          )}
        </>
      ) : (
        <Empty description="Không có lịch học nào." />
      )}
    </div>
  );
}
HomeWorkBySchedule.propTypes = {
  lessonByScheduleData: PropTypes.array.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  homeWorksData: PropTypes.array.isRequired,
  setLessonByScheduleData: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  setSelected: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};
