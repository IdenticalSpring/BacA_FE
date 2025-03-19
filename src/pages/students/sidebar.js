import React from "react";
import PropTypes from "prop-types";
import { Layout, Typography, List, Avatar, Divider, Badge } from "antd";
import { BookOutlined, ScheduleOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Sider } = Layout;
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
}) => {
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
          padding: isMobile ? "16px" : "20px",
          backgroundColor: colors.midGreen,
          color: colors.white,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            style={{
              backgroundColor: colors.deepGreen,
              color: colors.white,
              marginRight: 12,
              fontSize: isMobile ? 16 : 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            icon={<CalendarOutlined />}
          />
          <Title
            level={isMobile ? 5 : 4}
            style={{
              margin: 0,
              color: colors.white,
              fontWeight: "600",
              letterSpacing: "0.5px",
            }}
          >
            Lịch học
          </Title>
        </div>
        <Badge
          count={lessonsBySchedule.length}
          overflowCount={99}
          style={{ backgroundColor: colors.deepGreen }}
        />
      </div>

      <div style={{ padding: "12px 16px", backgroundColor: colors.paleGreen }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: colors.darkGreen,
              fontSize: isMobile ? "0.8rem" : "0.9rem",
              fontWeight: 500,
            }}
          >
            BÀI HỌC SẮP TỚI
          </Text>
          <Text
            style={{
              color: colors.deepGreen,
              fontSize: isMobile ? "0.8rem" : "0.9rem",
              fontWeight: 500,
            }}
          >
            {lessonsBySchedule.length} lessons
          </Text>
        </div>
      </div>

      {/* List of lessons by schedule */}
      <div
        style={{
          padding: "8px 12px",
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        {lessonsBySchedule.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={lessonsBySchedule}
            renderItem={(item) => {
              const isSelected = selectedLessonBySchedule === item.id;
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
                      cursor: "pointer",
                      backgroundColor: isSelected ? colors.lightGreen : colors.white,
                      width: "100%",
                      transition: "all 0.2s ease",
                      boxShadow: isSelected
                        ? `0 4px 8px ${colors.softShadow}`
                        : `0 2px 4px ${colors.softShadow}`,
                      border: `1px solid ${isSelected ? colors.borderGreen : "transparent"}`,
                      transform: isSelected ? "translateY(-2px)" : "none",
                    }}
                    onClick={() => onSelectLessonBySchedule(item.id)}
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
                      <Text
                        style={{
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          fontWeight: "700",
                          color: isSelected ? colors.white : colors.darkGreen,
                          lineHeight: "1",
                        }}
                      >
                        {dayjs(item.date).format("DD")}
                      </Text>
                      <Text
                        style={{
                          fontSize: isMobile ? "0.7rem" : "0.8rem",
                          fontWeight: "500",
                          color: isSelected ? colors.white : colors.darkGray,
                          lineHeight: "1.2",
                          marginTop: 4,
                        }}
                      >
                        {dayjs(item.date).format("MMM")}
                      </Text>
                    </div>

                    <div style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: isSelected ? colors.darkGreen : colors.darkGray,
                          fontWeight: "600",
                          fontSize: isMobile ? "0.9rem" : "1rem",
                          display: "block",
                          lineHeight: "1.2",
                        }}
                      >
                        {daysOfWeek[item.schedule.dayOfWeek]}
                      </Text>
                      <Text
                        style={{
                          color: colors.darkGray,
                          fontSize: isMobile ? "0.8rem" : "0.9rem",
                          display: "flex",
                          alignItems: "center",
                          marginTop: 6,
                        }}
                      >
                        {`${item.schedule.startTime} - ${item.schedule.endTime}`}
                      </Text>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
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
              Chưa có bài học nào được lên lịch
            </Text>
            <Text style={{ fontSize: "0.9rem", color: colors.darkGray }}>
              Bài học sẽ xuất hiện ở đây khi được lên lịch
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

// Define PropTypes
Sidebar.propTypes = {
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

// Default props
Sidebar.defaultProps = {
  selectedLessonBySchedule: null,
  isMobile: false,
};

export default Sidebar;
