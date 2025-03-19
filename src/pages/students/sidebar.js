import React from "react";
import PropTypes from "prop-types";
import { Layout, Typography, List, Avatar, Divider } from "antd";
import { BookOutlined, ScheduleOutlined } from "@ant-design/icons";

const { Sider } = Layout;
const { Title, Text } = Typography;

const daysOfWeek = [
  "Choose day of week",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
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
        boxShadow: `2px 0px 10px ${colors.softShadow}`,
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: isMobile ? "12px 16px" : "16px",
          backgroundColor: colors.midGreen,
          color: colors.white,
          borderRadius: "0 0 10px 10px",
        }}
      >
        <Avatar
          style={{
            backgroundColor: colors.deepGreen,
            color: colors.white,
            marginRight: 10,
            size: isMobile ? "small" : "default",
          }}
          icon={<BookOutlined />}
        />
        <Title
          level={isMobile ? 5 : 4}
          style={{
            margin: 0,
            color: colors.white,
            fontWeight: "bold",
          }}
        >
          Lessons By Schedule
        </Title>
      </div>

      <Divider style={{ backgroundColor: colors.borderGreen, margin: "0 0 8px 0" }} />

      {/* List of lessons by schedule */}
      <div
        style={{
          padding: isMobile ? "0 6px" : "0 8px",
          marginTop: 10,
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
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: isMobile ? "10px 6px" : "12px 8px",
                      borderRadius: 8,
                      cursor: "pointer",
                      backgroundColor: isSelected ? colors.lightGreen : "transparent",
                      width: "100%",
                      transition: "all 0.3s ease",
                      boxShadow: isSelected ? `0 2px 6px ${colors.softShadow}` : "none",
                      border: isSelected ? `1px solid ${colors.borderGreen}` : "none",
                    }}
                    onClick={() => onSelectLessonBySchedule(item.id)}
                  >
                    <Avatar
                      size={isMobile ? "small" : "default"}
                      style={{
                        backgroundColor: isSelected ? colors.deepGreen : colors.midGreen,
                        color: colors.white,
                        marginRight: isMobile ? 8 : 12,
                      }}
                      icon={<ScheduleOutlined />}
                    />
                    <div>
                      <Text
                        style={{
                          color: isSelected ? colors.darkGreen : colors.darkGray,
                          fontWeight: isSelected ? "bold" : "normal",
                          fontSize: isMobile ? "0.8rem" : "0.9rem",
                          display: "block",
                          lineHeight: "1.2",
                        }}
                      >
                        {`📅 ${daysOfWeek[item.schedule.dayOfWeek]} | ${item.date}`}
                      </Text>
                      <Text
                        style={{
                          color: isSelected ? colors.darkGreen : colors.darkGray,
                          fontSize: isMobile ? "0.75rem" : "0.85rem",
                          marginTop: "4px",
                          display: "block",
                        }}
                      >
                        {`🕒 ${item.schedule.startTime} - ${item.schedule.endTime}`}
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
              padding: 16,
              textAlign: "center",
              color: colors.darkGray,
            }}
          >
            <Text>No lessons by schedule available</Text>
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
