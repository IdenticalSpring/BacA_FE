import React from "react";
import { Button, Space, Dropdown, Menu } from "antd";
import {
  BookOutlined,
  FormOutlined,
  BarChartOutlined,
  EditOutlined,
  EllipsisOutlined,
  QqOutlined,
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

const Toolbox = ({
  onHomework,
  onAssignment,
  onClassReview,
  onEnterScores,
  onAttendanceCheck,
  setOpenHomeworkStatisticsDashboard,
}) => {
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
          <span className="button-text">Nội dung bài học</span>
        </Button>
        <Button
          type="primary"
          icon={<BookOutlined />}
          onClick={onHomework}
          style={{
            backgroundColor: colors.deepGreen,
            borderColor: colors.deepGreen,
            color: colors.white,
          }}
        >
          <span className="button-text">Bài về nhà</span>
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
          <span className="button-text"> Đánh giá</span>
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
          <span className="button-text">Nhập điểm thi</span>
        </Button>

        <Button
          type="primary"
          icon={<QqOutlined />}
          onClick={onAttendanceCheck}
          style={{
            backgroundColor: colors.safeGreen,
            borderColor: colors.safeGreen,
            color: colors.white,
          }}
        >
          <span className="button-text">Điểm Danh</span>
        </Button>
        <Button
          type="primary"
          icon={<BarChartOutlined />}
          onClick={() => setOpenHomeworkStatisticsDashboard(true)}
          style={{
            backgroundColor: colors.safeGreen,
            borderColor: colors.safeGreen,
            color: colors.white,
          }}
        >
          <span className="button-text">Tình hình lớp học</span>
        </Button>
      </Space>

      <style>{`
        @media (max-width: 1200px) {
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
  onHomework: PropTypes.func.isRequired,
  onAssignment: PropTypes.func.isRequired,
  onClassReview: PropTypes.func.isRequired,
  onEnterScores: PropTypes.func.isRequired,
  onAttendanceCheck: PropTypes.func.isRequired,
  setOpenHomeworkStatisticsDashboard: PropTypes.func.isRequired,
};

export default Toolbox;
