import React from "react";
import { Typography, Collapse } from "antd";
import PropTypes from "prop-types";

const { Panel } = Collapse;
const { Paragraph } = Typography;

const FaqItem = ({ question, answer }) => {
  return (
    <Collapse bordered={false} expandIconPosition="end">
      <Panel
        header={<span style={{ fontWeight: "500" }}>{question}</span>}
        key="1"
        style={{ padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}
      >
        <Paragraph style={{ color: "#666" }}>{answer}</Paragraph>
      </Panel>
    </Collapse>
  );
};

FaqItem.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
};

export default FaqItem;
