import React from "react";
import { Card, Typography, Button, List } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import PropTypes from "prop-types";

const { Title, Paragraph, Text } = Typography;

const PricingCard = ({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  color,
  recommended,
}) => {
  return (
    <Card
      style={{
        borderRadius: "8px",
        boxShadow: recommended ? "0 8px 24px rgba(0, 0, 0, 0.15)" : "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "24px",
        borderTop: `3px solid ${color || "#1890ff"}`,
        transform: recommended ? "scale(1.05)" : "scale(1)",
        zIndex: recommended ? 1 : 0,
        position: "relative",
      }}
    >
      {recommended && (
        <div
          style={{
            position: "absolute",
            top: "-12px",
            right: "24px",
            backgroundColor: color || "#1890ff",
            color: "white",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          RECOMMENDED
        </div>
      )}
      <Title level={4} style={{ marginBottom: "8px" }}>
        {title}
      </Title>
      <div style={{ marginBottom: "16px" }}>
        <Text style={{ fontSize: "28px", fontWeight: "bold" }}>
          {price === "Contact Us" ? price : `$${price}`}
        </Text>
        {period && <Text type="secondary">{period}</Text>}
      </div>
      <Paragraph type="secondary" style={{ marginBottom: "24px" }}>
        {description}
      </Paragraph>
      <List
        itemLayout="horizontal"
        dataSource={features}
        style={{ marginBottom: "24px" }}
        renderItem={(item) => (
          <List.Item style={{ padding: "4px 0", border: "none" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <CheckCircleFilled style={{ color: color || "#52c41a", marginRight: "8px" }} />
              <Text>{item}</Text>
            </div>
          </List.Item>
        )}
      />
      <Button
        type="primary"
        block
        style={{
          fontWeight: "500",
          backgroundColor: color || "#1890ff",
          borderColor: color || "#1890ff",
        }}
      >
        {buttonText || "Get Started"}
      </Button>
    </Card>
  );
};

PricingCard.propTypes = {
  title: PropTypes.string.isRequired,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  period: PropTypes.string,
  description: PropTypes.string.isRequired,
  features: PropTypes.arrayOf(PropTypes.string).isRequired,
  buttonText: PropTypes.string,
  color: PropTypes.string,
  recommended: PropTypes.bool,
};

PricingCard.defaultProps = {
  recommended: false,
  buttonText: "Get Started",
};

export default PricingCard;
