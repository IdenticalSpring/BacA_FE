import React from "react";
import PropTypes from "prop-types";
import { Button, Space, Row, Col } from "antd";
import { FileAddOutlined, BookOutlined, CommentOutlined, EditOutlined } from "@ant-design/icons";

const Toolbox = ({
  onAddStudent,
  viewScores,
  onDeleteClass,
  onViewReport,
  colors,
  isMobile,
  isTablet,
}) => {
  const buttonStyle = {
    backgroundColor: colors.lightGreen,
    color: colors.darkGreen,
    borderColor: colors.borderGreen,
    fontWeight: "500",
    transition: "all 0.3s",
    boxShadow: `0 2px 4px ${colors.softShadow}`,
    borderRadius: "8px",
    height: isMobile ? "36px" : "40px",
    padding: isMobile ? "0 8px" : "0 16px",
    fontSize: isMobile ? "12px" : "14px",
    width: isMobile ? "100%" : "auto",
  };

  const hoverStyle = {
    backgroundColor: colors.mintGreen,
    color: colors.deepGreen,
    borderColor: colors.midGreen,
  };

  const buttons = [
    {
      key: "assignment",
      icon: <FileAddOutlined />,
      onClick: onAddStudent,
      text: "Bài tập về nhà",
    },
    // {
    //   key: "homework",
    //   icon: <BookOutlined />,
    //   onClick: viewScores,
    //   text: "Xem điểm",
    // },
    {
      key: "review",
      icon: <CommentOutlined />,
      onClick: onDeleteClass,
      text: "Đánh giá giáo viên",
    },

    // {
    //   key: "scores",
    //   icon: <EditOutlined />,
    //   onClick: onViewReport,
    //   text: "Enter test scores",
    // },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      {isMobile ? (
        <Row gutter={[8, 8]} style={{ width: "100%" }}>
          {buttons.map((button) => (
            <Col span={12} key={button.key}>
              <Button
                icon={button.icon}
                onClick={button.onClick}
                style={{
                  ...buttonStyle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor;
                  e.currentTarget.style.color = hoverStyle.color;
                  e.currentTarget.style.borderColor = hoverStyle.borderColor;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor;
                  e.currentTarget.style.color = buttonStyle.color;
                  e.currentTarget.style.borderColor = buttonStyle.borderColor;
                }}
              >
                {button.text}
              </Button>
            </Col>
          ))}
        </Row>
      ) : (
        <Space size={isTablet ? "small" : "middle"} wrap={isTablet}>
          {buttons.map((button) => (
            <Button
              key={button.key}
              icon={button.icon}
              onClick={button.onClick}
              style={buttonStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor;
                e.currentTarget.style.color = hoverStyle.color;
                e.currentTarget.style.borderColor = hoverStyle.borderColor;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor;
                e.currentTarget.style.color = buttonStyle.color;
                e.currentTarget.style.borderColor = buttonStyle.borderColor;
              }}
            >
              {button.text}
            </Button>
          ))}
        </Space>
      )}
    </div>
  );
};

// Define PropTypes
Toolbox.propTypes = {
  onAddStudent: PropTypes.func.isRequired,
  viewScores: PropTypes.func.isRequired,
  onDeleteClass: PropTypes.func.isRequired,
  onViewReport: PropTypes.func.isRequired,
  colors: PropTypes.shape({
    lightGreen: PropTypes.string,
    darkGreen: PropTypes.string,
    deepGreen: PropTypes.string,
    mintGreen: PropTypes.string,
    midGreen: PropTypes.string,
    borderGreen: PropTypes.string,
    softShadow: PropTypes.string,
  }).isRequired,
  isMobile: PropTypes.bool,
  isTablet: PropTypes.bool,
};

// Default props
Toolbox.defaultProps = {
  isMobile: false,
  isTablet: false,
};

export default Toolbox;
