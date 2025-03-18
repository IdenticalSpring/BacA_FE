import React from "react";
import { Card, Typography } from "antd";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

const StatCard = ({ number, label, icon }) => {
  return (
    <Card
      style={{
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        padding: "24px",
      }}
    >
      {icon && (
        <div
          style={{
            color: "#1890ff",
            marginBottom: "12px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      )}
      <Title level={3} style={{ margin: "0 0 4px 0" }}>
        {number}
      </Title>
      <Text type="secondary">{label}</Text>
    </Card>
  );
};

StatCard.propTypes = {
  number: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
};

export default StatCard;
