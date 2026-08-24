import { Empty, Modal, Pagination, Select } from "antd";
import { colors } from "assets/theme/color";
import React, { useEffect, useMemo, useState } from "react";
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
  const visibleLessonByScheduleData = useMemo(() => {
    const groupedSlots = new Map();

    (lessonByScheduleData || []).forEach((item) => {
      const dateOnly = String(item.date || "").split("T")[0];
      const scheduleId = item.schedule?.id ?? "unknown";
      const key = `${scheduleId}|${dateOnly}`;
      const group = groupedSlots.get(key) || [];
      group.push(item);
      groupedSlots.set(key, group);
    });

    return Array.from(groupedSlots.values()).flatMap((group) => {
      if (group.length === 1) return group;

      const pickRepresentative = (items) =>
        [...items].sort((left, right) => {
          const leftHasHomework = Boolean(left.homeWorkId);
          const rightHasHomework = Boolean(right.homeWorkId);
          if (leftHasHomework !== rightHasHomework) {
            return leftHasHomework ? -1 : 1;
          }
          return Number(left.id) - Number(right.id);
        })[0];

      // Never hide distinct lessons already assigned by a teacher. Empty
      // duplicate rows are only collapsed in this picker; database rows and
      // their homework/check-in links remain untouched.
      const assignedLessons = group.filter((item) => item.lessonID);
      if (assignedLessons.length > 0) {
        const byLesson = new Map();
        assignedLessons.forEach((item) => {
          const items = byLesson.get(item.lessonID) || [];
          items.push(item);
          byLesson.set(item.lessonID, items);
        });
        return Array.from(byLesson.values())
          .map(pickRepresentative)
          .filter(Boolean);
      }

      const representative = pickRepresentative(group);
      return representative ? [representative] : [];
    });
  }, [lessonByScheduleData]);

  const nearestSchedule = useMemo(() => {
    if (visibleLessonByScheduleData.length === 0) return null;

    const today = new Date();
    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    const datedSchedules = visibleLessonByScheduleData
      .map((item, index) => ({
        item,
        index,
        date: String(item.date || "").split("T")[0],
      }))
      .filter(({ date }) => /^\d{4}-\d{2}-\d{2}$/.test(date));

    const todaySchedule = datedSchedules.find(({ date }) => date === todayString);
    if (todaySchedule) return todaySchedule;

    const nextSchedule = datedSchedules
      .filter(({ date }) => date > todayString)
      .sort((left, right) => left.date.localeCompare(right.date) || left.index - right.index)[0];
    if (nextSchedule) return nextSchedule;

    return datedSchedules
      .filter(({ date }) => date < todayString)
      .sort((left, right) => right.date.localeCompare(left.date) || left.index - right.index)[0];
  }, [visibleLessonByScheduleData]);

  const nearestSchedulePage = nearestSchedule
    ? Math.floor(nearestSchedule.index / pageSize) + 1
    : 1;
  const nearestScheduleKey = nearestSchedule
    ? `${nearestSchedule.item.id}|${nearestSchedule.date}|${nearestSchedule.index}`
    : "empty";

  useEffect(() => {
    setCurrentPage(nearestSchedulePage);
  }, [nearestScheduleKey, nearestSchedulePage]);

  // Tính dữ liệu trang hiện tại
  const paginatedData = visibleLessonByScheduleData.slice(
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
          {paginatedData.map((item) => {
            return !item.lessonID ? (
              <div
                key={item.id}
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
                key={item.id}
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
          {visibleLessonByScheduleData.length > pageSize && (
            <Pagination
              size="small"
              current={currentPage}
              pageSize={pageSize}
              total={visibleLessonByScheduleData.length}
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
LessonBySchedule.propTypes = {
  lessonByScheduleData: PropTypes.array.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  lessonsData: PropTypes.array.isRequired,
  setLessonByScheduleData: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  selected: PropTypes.bool.isRequired,
  setSelected: PropTypes.func.isRequired,
};
