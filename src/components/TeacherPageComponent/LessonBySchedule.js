import { Empty, Modal, Pagination, Select } from "antd";
import { colors } from "assets/theme/color";
import React, { useState } from "react";
import lessonByScheduleService from "services/lessonByScheduleService";
const { Option } = Select;
import PropTypes from "prop-types";
export default function LessonBySchedule({
  lessonByScheduleData,
  daysOfWeek,
  lessonsData,
  setLessonByScheduleData,
  isMobile,
  selected,
  setSelected,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // số lượng hiển thị mỗi trang

  // Tính dữ liệu trang hiện tại
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
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div style={{ width: "90%", margin: "15px 0", height: "80%" }}>
      {paginatedData?.length > 0 ? (
        <>
          {paginatedData.map((item, index) => {
            const realIndex = (currentPage - 1) * pageSize + index;
            return !item.lessonID ? (
              <div
                key={realIndex}
                style={
                  selected.has(item.id)
                    ? {
                        padding: "16px",
                        marginBottom: "12px",
                        border: `2px solid #2ECC71`,
                        borderRadius: "8px",
                        backgroundColor: "#27AE60",
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        justifyContent: "space-between",
                        alignItems: isMobile ? "flex-start" : "center",
                        gap: "10px",
                        height: isMobile ? "15%" : "15%",
                        width: "100%",
                        transition: "all 0.3s ease-in-out",
                        cursor: "pointer",
                        boxShadow: "0 4px 10px rgba(194, 240, 215, 0.8)",
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
                    color: selected.has(item.id) ? "#fff" : colors.darkGreen,
                    flex: 1,
                    marginBottom: isMobile ? "10px" : 0,
                  }}
                >
                  📅 {daysOfWeek[item.schedule.dayOfWeek]} | {item.date} | 🕒{" "}
                  {item.schedule.startTime} - {item.schedule.endTime}
                </div>
              </div>
            ) : (
              <div
                key={realIndex}
                style={{
                  padding: "16px",
                  marginBottom: "12px",
                  border: `2px solid #BDC3C7`,
                  borderRadius: "8px",
                  backgroundColor: "#ECF0F1",
                  color: "#7F8C8D",
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: "10px",
                  height: "15%",
                  width: "100%",
                  transition: "all 0.3s ease-in-out",
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
          })}

          {/* Pagination */}
          {lessonByScheduleData.length > pageSize && (
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={lessonByScheduleData.length}
              onChange={(page) => setCurrentPage(page)}
              style={{ textAlign: "center", marginTop: 20 }}
            />
          )}
        </>
      ) : (
        <Empty description="Không có lịch học nào." />
      )}
    </div>
  );
}
LessonBySchedule.propTypes = {
  lessonByScheduleData: PropTypes.array.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  lessonsData: PropTypes.array.isRequired,
  setLessonByScheduleData: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  selected: PropTypes.bool.isRequired,
  setSelected: PropTypes.func.isRequired,
};
