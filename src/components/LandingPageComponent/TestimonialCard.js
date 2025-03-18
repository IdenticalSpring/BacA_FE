import React from "react";
import { Card, Typography, Avatar } from "antd";
import PropTypes from "prop-types";

const { Paragraph, Text } = Typography;

const TestimonialCard = ({ quote, author, role, image, color, delay }) => {
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
      <Paragraph italic style={{ color: "#444", fontSize: "16px", marginBottom: "16px" }}>
        &ldquo;{quote}&rdquo;
      </Paragraph>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Avatar src={image} size={48} style={{ marginRight: "16px" }} />
        <div>
          <Text strong style={{ display: "block" }}>
            {author}
          </Text>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            {role}
          </Text>
        </div>
      </div>
    </Card>
  );
};

TestimonialCard.propTypes = {
  quote: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  color: PropTypes.string,
  delay: PropTypes.number,
};

export default TestimonialCard;
