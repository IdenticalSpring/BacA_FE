import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Typography, Button, Modal, Dropdown, message, Input } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  LaptopOutlined,
  EditOutlined,
  CloseOutlined,
  PlusCircleOutlined,
  FormOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import sidebarLinkService from "services/sidebarLinkService";
import CreateClassForTeacher from "./CreateClassForTeacher";
import { DeleteOutlined } from "@ant-design/icons";
import notificationService from "services/notificationService";

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
  refreshClasses,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [wordwallEmbed, setWordwallEmbed] = useState(null);
  const [sidebarLinks, setSidebarLinks] = useState([]);
  const [isCreateClassModalVisible, setIsCreateClassModalVisible] = useState(false);
  const [deleteRequestedClassIds, setDeleteRequestedClassIds] = useState([]);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [renameClassItem, setRenameClassItem] = useState(null);
  const [newClassName, setNewClassName] = useState("");
  const [renameRequestedClassIds, setRenameRequestedClassIds] = useState([]);

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
  const handleRequestDeleteClass = async (classItem) => {
    if (deleteRequestedClassIds.includes(classItem.id)) {
      message.info("Bạn đã gửi yêu cầu xóa lớp này rồi.");
      return;
    }

    Modal.confirm({
      title: "Yêu cầu xóa lớp",
      content: `Bạn có chắc muốn gửi yêu cầu admin xóa lớp "${classItem.name}"?`,
      okText: "Gửi yêu cầu",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const notificationPayload = {
            title: `Yêu cầu xóa lớp: ${classItem.name}`,
            general: true,
            type: true,
            detail: `Giáo viên ${teacherName} yêu cầu admin xóa lớp ID ${classItem.id} - ${classItem.name}.`,
            classID: classItem.id,
          };

          await notificationService.createNotification(notificationPayload);

          setDeleteRequestedClassIds((prev) => [...prev, classItem.id]);
          message.success("Đã gửi yêu cầu xóa lớp tới admin.");
        } catch (err) {
          console.error(err);
          message.error("Gửi yêu cầu xóa lớp thất bại.");
        }
      },
    });
  };

  const handleRequestRenameClass = (classItem) => {
    setRenameClassItem(classItem);
    setNewClassName("");
    setIsRenameModalVisible(true);
  };

  const handleSubmitRenameRequest = async () => {
    if (!newClassName.trim()) {
      message.warning("Vui lòng nhập tên lớp mới.");
      return;
    }

    if (renameRequestedClassIds.includes(renameClassItem.id)) {
      message.info("Bạn đã gửi yêu cầu đổi tên lớp này rồi.");
      setIsRenameModalVisible(false);
      return;
    }

    try {
      const notificationPayload = {
        title: `Yêu cầu đổi tên lớp: ${renameClassItem.name}`,
        general: true,
        type: true,
        detail: `Giáo viên ${teacherName} yêu cầu admin đổi tên lớp ID ${renameClassItem.id} - "${renameClassItem.name}" thành "${newClassName.trim()}".`,
        classID: renameClassItem.id,
      };

      await notificationService.createNotification(notificationPayload);

      setRenameRequestedClassIds((prev) => [...prev, renameClassItem.id]);
      message.success("Đã gửi yêu cầu đổi tên lớp tới admin.");
    } catch (err) {
      console.error(err);
      message.error("Gửi yêu cầu đổi tên lớp thất bại.");
    } finally {
      setIsRenameModalVisible(false);
      setRenameClassItem(null);
      setNewClassName("");
    }
  };

  const getClassContextMenu = (classItem) => (
    <Menu
      onClick={({ key }) => {
        if (key === "delete-class") {
          handleRequestDeleteClass(classItem);
        } else if (key === "rename-class") {
          handleRequestRenameClass(classItem);
        }
      }}
    >
      <Menu.Item key="rename-class" icon={<FormOutlined />}>
        Yêu cầu đổi tên lớp
      </Menu.Item>
      <Menu.Item key="delete-class" danger icon={<DeleteOutlined />}>
        Yêu cầu xóa lớp
      </Menu.Item>
    </Menu>
  );

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
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={() => setIsCreateClassModalVisible(true)}
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
          backgroundColor: colors.deepGreen,
          borderColor: colors.deepGreen,
          color: colors.white,
        }}
      >
        <span className="button-text">Tạo lớp học</span>
      </Button>

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
              <Dropdown
                key={classItem.id}
                overlay={getClassContextMenu(classItem)}
                trigger={["contextMenu"]} // 👈 right-click
              >
                <Menu.Item
                  onClick={() => handleClassSelect(classItem.id)} // 👈 left-click vẫn chọn lớp bình thường
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
              </Dropdown>
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
      <div style={{ padding: 0, width: "100%", maxHeight: "20%", overflow: "auto" }}>
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
        <EditOutlined />
        <Text style={{ fontWeight: 700, color: colors.darkGreen }}>Công cụ giao bài tập</Text>
      </div>
      <div style={{ padding: 0, width: "100%", maxHeight: "20%", overflow: "auto" }}>
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
      </div>
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

      <CreateClassForTeacher
        visible={isCreateClassModalVisible}
        onClose={() => setIsCreateClassModalVisible(false)}
        refreshClasses={refreshClasses}
      />

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FormOutlined />
            <span>Yêu cầu đổi tên lớp</span>
          </div>
        }
        open={isRenameModalVisible}
        onCancel={() => {
          setIsRenameModalVisible(false);
          setRenameClassItem(null);
          setNewClassName("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsRenameModalVisible(false);
              setRenameClassItem(null);
              setNewClassName("");
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={{
              backgroundColor: colors.deepGreen,
              borderColor: colors.deepGreen,
            }}
            onClick={handleSubmitRenameRequest}
          >
            Gửi yêu cầu
          </Button>,
        ]}
        centered
      >
        <div style={{ marginBottom: "12px" }}>
          <Typography.Text>Tên lớp hiện tại: <strong>{renameClassItem?.name}</strong></Typography.Text>
        </div>
        <Input
          placeholder="Nhập tên lớp mới muốn đổi"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          onPressEnter={handleSubmitRenameRequest}
          size="large"
        />
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
  refreshClasses: PropTypes.func,
};

Sidebar.defaultProps = {
  classes: [],
  selectedClass: null,
};

export default Sidebar;
