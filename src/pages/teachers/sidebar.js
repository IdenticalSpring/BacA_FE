import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Typography, Button, Drawer, Modal } from "antd"; // Thêm Modal
import {
  BookOutlined,
  MenuOutlined,
  CloseOutlined,
  TeamOutlined,
  LaptopOutlined,
  EditOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

// Giả sử các icon được đặt trong thư mục src/assets
import kahootIcon from "assets/icon/kahoot-icon.png";
import quizizzIcon from "assets/icon/quizizz-icon.png";
import padletIcon from "assets/icon/padlet-logo.png";
import blootket from "assets/icon/Blooket-Logo.png";
import baamboozle from "assets/icon/baamboozle.png";
import wordwallIcon from "assets/icon/wordwall-icon.png"; // Icon cho Wordwall
import googleDriveIcon from "assets/icon/icons8-google-drive.svg";
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
}) => {
  const [visible, setVisible] = useState(false); // Trạng thái Drawer
  const [isMobile, setIsMobile] = useState(false); // Kiểm tra mobile
  const [wordwallEmbed, setWordwallEmbed] = useState(null); // Mã nhúng từ oEmbed
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái Modal

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1200);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Hàm lấy mã nhúng từ Wordwall oEmbed
  const fetchWordwallEmbed = async (resourceUrl) => {
    try {
      const response = await fetch(
        `https://wordwall.net/api/oembed?url=${encodeURIComponent(resourceUrl)}` // Sửa endpoint thành oEmbed chính xác
      );
      const data = await response.json();
      setWordwallEmbed(data.html); // Lưu mã nhúng vào state
      setIsModalVisible(true); // Mở Modal sau khi lấy được mã nhúng
    } catch (error) {
      console.error("Error fetching Wordwall oEmbed:", error);
    }
  };

  // Đóng Modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setWordwallEmbed(null); // Xóa mã nhúng khi đóng Modal (tùy chọn)
  };

  const showDrawer = () => setVisible(true);
  const onClose = () => setVisible(false);

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

      {/* Công cụ giảng dạy */}
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
      <div
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
        onClick={() => openLink("https://kahoot.com")}
      >
        <img src={kahootIcon} alt="Kahoot" style={{ width: 20, height: 20 }} />
        <Text style={{ color: colors.darkGreen }}>Kahoot</Text>
      </div>
      <div
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
        onClick={() => openLink("https://quizizz.com")}
      >
        <img src={quizizzIcon} alt="Quizizz" style={{ width: 20, height: 20 }} />
        <Text style={{ color: colors.darkGreen }}>Quizizz</Text>
      </div>
      <div
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
        onClick={() => openLink("https://www.baamboozle.com/")}
      >
        <img src={baamboozle} alt="Baamboozle" style={{ width: 20, height: 20 }} />
        <Text style={{ color: colors.darkGreen }}>Baamboozle</Text>
      </div>
      {/* Thêm Wordwall */}
      <div
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
        onClick={() => window.open("https://wordwall.net/myactivities")}
      >
        <img src={wordwallIcon} alt="Wordwall" style={{ width: 20, height: 20 }} />
        <Text style={{ color: colors.darkGreen }}>Wordwall</Text>
      </div>
      <div
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
        onClick={() => window.open(googleDriveLink)}
      >
        <img src={googleDriveIcon} alt="googleDrive" style={{ width: 20, height: 20 }} />
        <Text style={{ color: colors.darkGreen }}>Google Drive</Text>
      </div>

      {/* Công cụ giao bài tập */}
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
      <div
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
        onClick={() => openLink("https://padlet.com")}
      >
        <img src={padletIcon} alt="Padlet" style={{ width: 20, height: 20 }} />
        <Text style={{ color: colors.darkGreen }}>Padlet</Text>
      </div>
      <div
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
        onClick={() => openLink("https://www.blooket.com/")}
      >
        <img src={blootket} alt="Blooket" style={{ width: 20, height: 20 }} />
        <Text style={{ color: colors.darkGreen }}>Blooket</Text>
      </div>

      {/* Chi tiết tình hình học */}
      {/* <div
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
          cursor: "pointer",
          borderRadius: "5px",
          padding: "5px 3px",
          transition: "all 0.1s ease-in-out",
        }}
        className="HomeworkStatisticsDashboard"
        onClick={() => setOpenHomeworkStatisticsDashboard(true)}
      >
        <Text style={{ fontWeight: 700 }} className="hoverChangeColor">
          <BarChartOutlined style={{ marginRight: "3px" }} />
          Tình hình lớp học
        </Text>
      </div> */}
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

      {/* Modal hiển thị nội dung Wordwall */}
      <Modal
        title="Wordwall Activity"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600} // Điều chỉnh chiều rộng Modal
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
};

Sidebar.defaultProps = {
  classes: [],
  selectedClass: null,
};

export default Sidebar;
