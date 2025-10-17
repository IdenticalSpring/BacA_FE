import React from "react";
import { Layout, List, Avatar, Typography, Badge, Empty } from "antd";
import { UserOutlined, PictureOutlined, SoundOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { colors } from "pages/teachers/teacherPage";

const { Content, Title, Text } = Typography;

const StudentListSider = ({ students, selectedStudent, onSelectStudent }) => {
  const getPreview = (msg) => {
    if (!msg) return "Bắt đầu cuộc trò chuyện";
    if (msg.isRevoked) return <Text italic>Tin nhắn đã bị thu hồi</Text>;
    let preview = msg.isMyLastMessage ? "Bạn: " : "";
    if (msg.text) preview += msg.text;
    else if (msg.imageUrl) preview += "[Hình ảnh]";
    else if (msg.audioUrl) preview += "[Ghi âm]";
    const icon = !msg.text
      ? msg.imageUrl
        ? <PictureOutlined style={{ marginRight: 4 }} />
        : msg.audioUrl
        ? <SoundOutlined style={{ marginRight: 4 }} />
        : null
      : null;
    return <>{icon}{preview}</>;
  };

  return (
    <Layout style={{ height: "100%", backgroundColor: colors.white }}>
      <header style={{ padding: 16, borderBottom: `1px solid ${colors.gray}` }}>
        <Title level={4} style={{ margin: 0, color: colors.darkGreen }}>
          Chit Chat
        </Title>
      </header>
      <Content style={{ overflowY: "auto" }}>
        {students.length ? (
          <List
            dataSource={students}
            renderItem={(student) => (
              <List.Item
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedStudent?.id === student.id ? colors.paleGreen : "transparent",
                  borderLeft: `4px solid ${
                    selectedStudent?.id === student.id ? colors.deepGreen : "transparent"
                  }`,
                  transition: "all 0.2s ease",
                }}
                onClick={() => onSelectStudent(student)}
              >
                <List.Item.Meta
                  avatar={<Avatar size="large" src={student.imgUrl} icon={<UserOutlined />} />}
                  title={<Text strong>{student.name}</Text>}
                  description={
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text
                        type="secondary"
                        ellipsis
                        style={{ flex: 1, fontWeight: student.unreadCount ? "bold" : "normal" }}
                      >
                        {getPreview(student.lastMessage)}
                      </Text>
                      {student.unreadCount > 0 && <Badge count={student.unreadCount} />}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Chưa có học sinh trong lớp" style={{ marginTop: 40 }} />
        )}
      </Content>
    </Layout>
  );
};

StudentListSider.propTypes = {
  students: PropTypes.array.isRequired,
  selectedStudent: PropTypes.object,
  onSelectStudent: PropTypes.func.isRequired,
};

export default React.memo(StudentListSider);
