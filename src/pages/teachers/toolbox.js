import React from "react";
import { Button, Space, Dropdown, Menu } from "antd";
import {
  BookOutlined,
  FormOutlined,
  BarChartOutlined,
  EditOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

// Color palette
export const colors = {
  deepGreen: "#368A68",
  white: "#FFFFFF",
  borderGreen: "#A8E6C3",
  softShadow: "rgba(0, 128, 96, 0.1)",
  midGreen: "#5FAE8C",
  safeGreen: "#27AE60",
  emerald: "#2ECC71",
};

const Toolbox = ({ onAssignment, onClassReview, onEnterScores, onAttendanceCheck }) => {
  const menu = (
    <Menu>
      <Menu.Item key="attendance" onClick={onAttendanceCheck}>
        Attendance Check
      </Menu.Item>
    </Menu>
  );
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 16,
        padding: "12px",
        backgroundColor: colors.white,
        borderTop: `1px solid ${colors.borderGreen}`,
        boxShadow: `0 -2px 8px ${colors.softShadow}`,
      }}
    >
      <Space size={12} wrap style={{ justifyContent: "center" }}>
        <Button
          type="primary"
          icon={<BookOutlined />}
          onClick={onAssignment}
          style={{
            backgroundColor: colors.deepGreen,
            borderColor: colors.deepGreen,
            color: colors.white,
          }}
        >
          <span className="button-text">Assignment</span>
        </Button>
        <Button
          type="primary"
          icon={<BarChartOutlined />}
          onClick={onClassReview}
          style={{
            backgroundColor: colors.safeGreen,
            borderColor: colors.safeGreen,
            color: colors.white,
          }}
        >
          <span className="button-text">Class review</span>
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={onEnterScores}
          style={{
            backgroundColor: colors.emerald,
            borderColor: colors.emerald,
            color: colors.white,
          }}
        >
          <span className="button-text">Enter test scores</span>
        </Button>
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button
            shape="circle"
            icon={<EllipsisOutlined />}
            style={{
              borderColor: colors.borderGreen,
              backgroundColor: colors.midGreen,
              color: colors.white,
            }}
          />
        </Dropdown>
      </Space>

      <style>{`
        @media (max-width: 576px) {
          .button-text {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

// Add PropTypes validation
Toolbox.propTypes = {
  onAssignment: PropTypes.func.isRequired,
  onClassReview: PropTypes.func.isRequired,
  onEnterScores: PropTypes.func.isRequired,
  onAttendanceCheck: PropTypes.func.isRequired,
};

export default Toolbox;
