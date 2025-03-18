import React from "react";
import { Card, Typography } from "antd";
import PropTypes from "prop-types";

const { Title, Paragraph } = Typography;

const StepCard = ({ number, title, description, color, reverse }) => {
  return (
    <Card
      style={{
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "24px",
        position: "relative",
        marginLeft: reverse ? "16px" : "0",
        marginRight: !reverse ? "16px" : "0",
      }}
    >
      <div
        style={{
          backgroundColor: color || "#1890ff",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          position: "absolute",
          top: "-16px",
          left: reverse ? "auto" : "-16px",
          right: reverse ? "-16px" : "auto",
        }}
      >
        {number}
      </div>
      <Title level={4} style={{ marginTop: "8px", marginBottom: "8px" }}>
        {title}
      </Title>
      <Paragraph type="secondary">{description}</Paragraph>
    </Card>
  );
};

StepCard.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  color: PropTypes.string,
  reverse: PropTypes.bool,
};

StepCard.defaultProps = {
  reverse: false,
};

export default StepCard;
