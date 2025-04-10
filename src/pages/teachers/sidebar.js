import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Typography, Button, Modal } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  LaptopOutlined,
  EditOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import sidebarLinkService from "services/sidebarLinkService";

const { Sider } = Layout;
const { Text } = Typography;

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

const Sidebar = ({
  teacherName,
  classes,
  selectedClass,
  onSelectClass,
  setOpenHomeworkStatisticsDashboard,
  googleDriveLink,
  isMobile,
  onClose,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [wordwallEmbed, setWordwallEmbed] = useState(null);
  const [sidebarLinks, setSidebarLinks] = useState([]);

  useEffect(() => {
    const fetchSidebarLinks = async () => {
      try {
        const data = await sidebarLinkService.getAllSidebars();
        setSidebarLinks(data);
      } catch (error) {
        console.error("Error fetching sidebar links:", error);
      }
    };
    fetchSidebarLinks();
  }, []);

  const fetchWordwallEmbed = async (resourceUrl) => {
    try {
      const response = await fetch(
        `https://wordwall.net/api/oembed?url=${encodeURIComponent(resourceUrl)}`
      );
      const data = await response.json();
      setWordwallEmbed(data.html);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching Wordwall oEmbed:", error);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setWordwallEmbed(null);
  };

  const handleClassSelect = (classId) => {
    onSelectClass(classId);
    if (isMobile) onClose();
  };

  const openLink = (url) => {
    window.open(url, "_blank");
  };

  const SidebarContent = () => (
    <>
      <div
        style={{
          padding: "15.5px 16px",
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
          <Text style={{ color: colors.white, fontSize: 18, fontWeight: 600 }}>
            Xin chào {teacherName}
          </Text>
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
          margin: "0 auto",
          padding: "5px 0",
          width: "80%",
          textAlign: "start",
          borderBottom: `1px solid ${colors.lightGreen}`,
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "5px 3px",
        }}
      >
        <TeamOutlined />
        <Text style={{ fontWeight: 700, color: colors.darkGreen }}>Toàn bộ lớp học</Text>
      </div>

      <div
        style={{
          padding: "0",
          overflowY: "auto",
          maxHeight: "25%",
          overflowX: "hidden",
        }}
      >
        {classes?.length > 0 ? (
          <Menu
            mode="inline"
            selectedKeys={[selectedClass?.toString() || ""]}
            style={{
              background: colors.paleGreen,
              border: "none",
              marginLeft: "10px",
            }}
          >
            {classes?.map((classItem) => (
              <Menu.Item
                key={classItem.id}
                onClick={() => handleClassSelect(classItem.id)}
                style={{
                  margin: "0",
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
                <span
                  style={{
                    fontWeight: selectedClass === classItem.id ? 600 : 400,
                    maxWidth: "100%",
                    textOverflow: "ellipsis",
                  }}
                >
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

      <div
        style={{
          margin: "0 auto",
          padding: "5px 0",
          width: "80%",
          textAlign: "start",
          borderBottom: `1px solid ${colors.lightGreen}`,
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "5px 3px",
        }}
      >
        <LaptopOutlined />
        <Text style={{ fontWeight: 700, color: colors.darkGreen }}>Công cụ giảng dạy</Text>
      </div>

      {sidebarLinks
        .filter((link) => link.type === 0)
        .map((link) => (
          <div
            key={link.id}
            style={{
              margin: "0 auto",
              padding: "5px 0",
              width: "80%",
              textAlign: "start",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 3px",
              cursor: "pointer",
            }}
            onClick={() => openLink(link.link)}
          >
            {link.imgUrl ? (
              <img src={link.imgUrl} alt={link.name} style={{ width: 20, height: 20 }} />
            ) : (
              <LaptopOutlined style={{ fontSize: 20, color: colors.darkGreen }} />
            )}
            <Text style={{ color: colors.darkGreen }}>{link.name}</Text>
          </div>
        ))}

      <div
        style={{
          margin: "0 auto",
          padding: "5px 0",
          width: "80%",
          textAlign: "start",
          borderBottom: `1px solid ${colors.lightGreen}`,
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "5px 3px",
        }}
      >
        <EditOutlined />
        <Text style={{ fontWeight: 700, color: colors.darkGreen }}>Công cụ giao bài tập</Text>
      </div>

      {sidebarLinks
        .filter((link) => link.type === 1)
        .map((link) => (
          <div
            key={link.id}
            style={{
              margin: "0 auto",
              padding: "5px 0",
              width: "80%",
              textAlign: "start",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 3px",
              cursor: "pointer",
            }}
            onClick={() => openLink(link.link)}
          >
            {link.imgUrl ? (
              <img src={link.imgUrl} alt={link.name} style={{ width: 20, height: 20 }} />
            ) : (
              <EditOutlined style={{ fontSize: 20, color: colors.darkGreen }} />
            )}
            <Text style={{ color: colors.darkGreen }}>{link.name}</Text>
          </div>
        ))}
    </>
  );

  return (
    <>
      <style>
        {`
        .HomeworkStatisticsDashboard:hover{
          background-color: #368A68;
          transform: scale(1.05);
          box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2);
          color:white
        }
        .hoverChangeColor:hover{
          color:white
        }
        .hoverChangeColor{
          color: ${colors.darkGreen}
        }
        `}
      </style>
      {isMobile ? (
        <SidebarContent />
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

      <Modal
        title="Wordwall Activity"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        {wordwallEmbed ? (
          <div
            style={{ textAlign: "center" }}
            dangerouslySetInnerHTML={{ __html: wordwallEmbed }}
          />
        ) : (
          <p>Đang tải nội dung...</p>
        )}
      </Modal>
    </>
  );
};

Sidebar.propTypes = {
  teacherName: PropTypes.string.isRequired,
  classes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedClass: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelectClass: PropTypes.func.isRequired,
  setOpenHomeworkStatisticsDashboard: PropTypes.func.isRequired,
  googleDriveLink: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

Sidebar.defaultProps = {
  classes: [],
  selectedClass: null,
};

export default Sidebar;
