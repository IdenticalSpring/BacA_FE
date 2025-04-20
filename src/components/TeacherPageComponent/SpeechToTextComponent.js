import React, { useState } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import { Button, Card, List, Typography, Badge, Space, Divider, Tag } from "antd";
import { AudioOutlined, AudioMutedOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function SpeechToTextComponent() {
  const [collapsed, setCollapsed] = useState(false);

  const { error, interimResult, isRecording, results, startSpeechToText, stopSpeechToText } =
    useSpeechToText({
      continuous: true,
      useLegacyResults: false,
    });

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  if (error) {
    return (
      <Card>
        <Text type="danger">Web Speech API is not available in this browser 🤷‍</Text>
      </Card>
    );
  }

  return (
    <Card
      style={{
        width: "100%",
        boxShadow: "none",
        border: "1px solid #f0f0f0",
        borderRadius: "8px",
        marginBottom: "16px",
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Speech to Text
            </Title>
            <Tag color={isRecording ? "error" : "default"}>
              {isRecording ? "Recording" : "Idle"}
            </Tag>
          </Space>

          <Button
            type={isRecording ? "primary" : "default"}
            danger={isRecording}
            icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
            onClick={isRecording ? stopSpeechToText : startSpeechToText}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </div>

        <Divider style={{ margin: "12px 0" }} />

        <div
          style={{
            maxHeight: collapsed ? "100px" : "300px",
            overflowY: "auto",
            transition: "max-height 0.3s",
          }}
        >
          <List
            size="small"
            bordered={false}
            dataSource={results}
            renderItem={(item) => (
              <List.Item style={{ padding: "8px 0" }}>
                <Text>{item.transcript}</Text>
              </List.Item>
            )}
            footer={
              interimResult && (
                <List.Item style={{ padding: "8px 0" }}>
                  <Text type="secondary" italic>
                    {interimResult}
                  </Text>
                </List.Item>
              )
            }
          />
        </div>

        {results.length > 3 && (
          <Button
            type="link"
            onClick={toggleCollapse}
            icon={collapsed ? <DownOutlined /> : <UpOutlined />}
            style={{ padding: 0, textAlign: "right", display: "block", marginLeft: "auto" }}
          >
            {collapsed ? "Show all transcripts" : "Collapse transcripts"}
          </Button>
        )}
      </Space>
    </Card>
  );
}
