import React from "react";
import { Card, Image, Typography } from "antd";
import PropTypes from "prop-types";
import PlayAudioButton from "./PlayAudioButton";
import { colors } from "pages/teachers/teacherPage";

const { Text } = Typography;

const MessageBubble = ({ chat, isMyMessage }) => {
  const bubbleStyle = {
    backgroundColor: isMyMessage ? colors.deepGreen : colors.white,
    color: isMyMessage ? colors.white : colors.darkGray,
    padding: "8px 12px",
    borderRadius: "18px",
    border: `1px solid ${isMyMessage ? colors.deepGreen : colors.gray}`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.07)",
    maxWidth: "100%",
  };

  if (chat.isRevoked)
    return (
      <Card bodyStyle={bubbleStyle} bordered={false}>
        <Text italic disabled>
          Tin nhắn đã bị thu hồi
        </Text>
      </Card>
    );

  return (
    <Card bodyStyle={bubbleStyle} bordered={false}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {chat.imageUrl && (
          <Image
            src={chat.imageUrl}
            style={{
              width: "100%",
              maxWidth: "250px",
              borderRadius: "8px",
              marginBottom: chat.message || chat.audioUrl ? "8px" : "0px",
            }}
            preview={{ mask: "Xem ảnh" }}
          />
        )}
        {(chat.message || chat.audioUrl) && (
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
            {chat.message && (
              <Text style={{ color: "inherit", whiteSpace: "pre-wrap" }}>
                {chat.message}
              </Text>
            )}
            {chat.audioUrl && <PlayAudioButton audioUrl={chat.audioUrl} />}
          </div>
        )}
      </div>
    </Card>
  );
};

MessageBubble.propTypes = {
  chat: PropTypes.object.isRequired,
  isMyMessage: PropTypes.bool.isRequired,
};
export default React.memo(MessageBubble);
