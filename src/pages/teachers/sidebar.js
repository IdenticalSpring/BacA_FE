import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Typography, Button, Drawer } from "antd";
import { BookOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const { Sider } = Layout;
const { Text } = Typography;

// Color palette
export const colors = {
  lightGreen: "#8ED1B0",
  deepGreen: "#368A68",
  white: "#FFFFFF",
  paleGreen: "#E8F5EE",
  darkGreen: "#224922",
  midGreen: "#5FAE8C",
  softShadow: "rgba(0, 128, 96, 0.1)",
  borderGreen: "#A8E6C3",
};

const Sidebar = ({ classes, selectedClass, onSelectClass }) => {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleClassSelect = (classId) => {
    onSelectClass(classId);
    if (isMobile) {
      onClose();
    }
  };

  const SidebarContent = () => (
    <>
      <div
        style={{
          padding: "20px 16px",
          background: colors.deepGreen,
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile ? "space-between" : "flex-start",
          borderBottom: `1px solid ${colors.midGreen}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            icon={<BookOutlined />}
            style={{
              backgroundColor: colors.lightGreen,
              color: colors.deepGreen,
              marginRight: 12,
            }}
          />
          <Text style={{ color: colors.white, fontSize: 18, fontWeight: 600 }}>Lớp học</Text>
        </div>

        {isMobile && (
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{ color: colors.white }}
          />
        )}
      </div>

      <div
        style={{
          padding: "10px",
          overflow: "auto",
          height: isMobile ? "calc(100vh - 70px)" : "calc(100vh - 70px)",
        }}
      >
        {classes?.length > 0 ? (
          <Menu
            mode="inline"
            selectedKeys={[selectedClass?.toString() || ""]}
            style={{
              background: colors.paleGreen,
              border: "none",
            }}
          >
            {classes?.map((classItem) => (
              <Menu.Item
                key={classItem.id}
                onClick={() => handleClassSelect(classItem.id)}
                style={{
                  margin: "8px 0",
                  padding: "10px",
                  borderRadius: "8px",
                  color: colors.darkGreen,
                  backgroundColor:
                    selectedClass === classItem.id ? colors.lightGreen : "transparent",
                }}
                icon={
                  <Avatar
                    size="small"
                    style={{
                      backgroundColor:
                        selectedClass === classItem.id ? colors.deepGreen : colors.midGreen,
                      color: colors.white,
                    }}
                  >
                    {classItem.name.charAt(0)}
                  </Avatar>
                }
              >
                <span style={{ fontWeight: selectedClass === classItem.id ? 600 : 400 }}>
                  {classItem.name}
                </span>
              </Menu.Item>
            ))}
          </Menu>
        ) : (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: colors.darkGreen,
            }}
          >
            Không có lớp học nào
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {isMobile ? (
        <>
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={showDrawer}
            style={{
              position: "fixed",
              left: 20,
              top: 20,
              zIndex: 99,
              backgroundColor: colors.deepGreen,
              borderColor: colors.deepGreen,
            }}
          />
          <Drawer
            placement="left"
            closable={false}
            onClose={onClose}
            open={visible}
            width={260}
            bodyStyle={{ padding: 0, backgroundColor: colors.paleGreen }}
            headerStyle={{ display: "none" }}
          >
            <SidebarContent />
          </Drawer>
        </>
      ) : (
        <Sider
          width={260}
          style={{
            background: colors.paleGreen,
            boxShadow: `0 2px 8px ${colors.softShadow}`,
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 100,
          }}
        >
          <SidebarContent />
        </Sider>
      )}
    </>
  );
};

// Add PropTypes validation
Sidebar.propTypes = {
  classes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedClass: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelectClass: PropTypes.func.isRequired,
};

// Add default props
Sidebar.defaultProps = {
  classes: [],
  selectedClass: null,
};

export default Sidebar;
