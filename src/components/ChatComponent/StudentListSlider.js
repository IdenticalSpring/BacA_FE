import React from "react";
import { List, Typography, Layout } from "antd";
import PropTypes from "prop-types";
import { colors } from "pages/teachers/teacherPage";

const { Sider } = Layout;
const { Text } = Typography;

const StudentListSider = ({
  students,
  selectedStudent,
  onSelectStudent,
  onSelectGroupChat,
}) => {
  return (
    <Sider
      width={320}
      theme="light"
      style={{
        borderRight: `1px solid ${colors.gray}`,
        background: colors.white,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ✅ Class Group Chat at the top */}
      <div
        onClick={onSelectGroupChat}
        style={{
          cursor: "pointer",
          padding: "14px 20px",
          borderBottom: `1px solid ${colors.gray}`,
          backgroundColor:
            selectedStudent?.id === "group" ? colors.lightGreen : "transparent",
          transition: "background-color 0.3s ease",
        }}
      >
        <Text
          strong
          style={{
            color:
              selectedStudent?.id === "group"
                ? colors.deepGreen
                : colors.darkGray,
            fontSize: 16,
          }}
        >
          💬 Class Group Chat
        </Text>
      </div>

      {/* ✅ Divider */}
      <div
        style={{
          padding: "8px 20px",
          color: colors.gray,
          fontSize: 13,
          borderBottom: `1px solid ${colors.gray}`,
        }}
      >
        Private Chats
      </div>

      {/* ✅ Student list */}
      <List
        itemLayout="horizontal"
        dataSource={students}
        locale={{ emptyText: "No students in class." }}
        renderItem={(student) => (
          <List.Item
            style={{
              cursor: "pointer",
              backgroundColor:
                selectedStudent?.id === student.id
                  ? colors.lightGreen
                  : "transparent",
              padding: "10px 20px",
              borderBottom: `1px solid ${colors.gray}`,
              transition: "background-color 0.3s ease",
            }}
            onClick={() => onSelectStudent(student)}
          >
            <List.Item.Meta
              title={
                <Text
                  strong
                  style={{
                    color:
                      selectedStudent?.id === student.id
                        ? colors.deepGreen
                        : colors.darkGray,
                    fontSize: 15,
                  }}
                >
                  {student.name}
                </Text>
              }
              description={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {student.lastMessage || "No messages yet"}
                </Text>
              }
            />
          </List.Item>
        )}
        style={{
          overflowY: "auto",
          flex: 1,
        }}
      />
    </Sider>
  );
};

StudentListSider.propTypes = {
  students: PropTypes.array.isRequired,
  selectedStudent: PropTypes.object,
  onSelectStudent: PropTypes.func.isRequired,
  onSelectGroupChat: PropTypes.func.isRequired,
};

export default StudentListSider;
