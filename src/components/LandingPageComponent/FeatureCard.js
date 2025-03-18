import React from "react";
import { Card, Typography } from "antd";
import PropTypes from "prop-types";

const { Title, Paragraph } = Typography;

const FeatureCard = ({ icon, title, description, color, delay }) => {
  return (
    <Card
      style={{
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "16px",
        borderTop: color ? `3px solid ${color}` : undefined,
        transition: "all 0.3s ease",
        // Could implement delay with useEffect if this were a real app
      }}
    >
      <div style={{ color: "#1890ff", marginBottom: "16px" }}>{icon}</div>
      <Title level={4} style={{ marginBottom: "8px" }}>
        {title}
      </Title>
      <Paragraph type="secondary">{description}</Paragraph>
    </Card>
  );
};

FeatureCard.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  color: PropTypes.string,
  delay: PropTypes.number,
};

export default FeatureCard;
