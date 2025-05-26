import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import Badge from "@mui/material/Badge";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";
import EditAdminModal from "./EditAdminModal";
import { jwtDecode } from "jwt-decode";
import notificationService from "services/notificationService";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const route = useLocation().pathname.split("/").slice(1);
  const userId = jwtDecode(sessionStorage.getItem("token"));
  const adminId = userId.userId;

  // Lấy và sắp xếp danh sách thông báo
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getAllNotifications();
        const adminNotifications = data
          .filter((notification) => notification.type === true)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sắp xếp mới nhất lên đầu
        setNotifications(adminNotifications);
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Xử lý nhấp vào thông báo để xem chi tiết
  const handleNotificationClick = async (id) => {
    try {
      const notification = await notificationService.getNotificationById(id);
      setSelectedNotification(notification);
      setOpenDetailModal(true);
      handleCloseMenu();
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết thông báo:", error);
    }
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedNotification(null);
  };

  useEffect(() => {
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Đếm số lượng thông báo chưa đọc
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{
        mt: 2,
        maxHeight: "400px", // Giới hạn chiều cao menu
        "& .MuiPaper-root": {
          maxHeight: "400px",
          overflowY: "auto", // Kích hoạt thanh cuộn
          width: "300px", // Đặt chiều rộng cố định cho menu
        },
      }}
    >
      {notifications.length > 0 ? (
        notifications.map(
          (
            notification // Hiển thị tất cả thông báo
          ) => (
            <NotificationItem
              key={notification.id}
              icon={<Icon>notifications</Icon>}
              title={notification.title}
              description={notification.detail}
              onClick={() => handleNotificationClick(notification.id)}
            />
          )
        )
      ) : (
        <NotificationItem icon={<Icon>info</Icon>} title="Không có thông báo mới" />
      )}
    </Menu>
  );

  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;
      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }
      return colorValue;
    },
  });

  return (
    <>
      <AppBar
        position={absolute ? "absolute" : navbarType}
        color="inherit"
        sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
      >
        <Toolbar sx={(theme) => navbarContainer(theme)}>
          <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
            <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
          </MDBox>
          {isMini ? null : (
            <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
              <MDBox color={light ? "white" : "inherit"}>
                <IconButton
                  sx={navbarIconButton}
                  size="small"
                  disableRipple
                  onClick={handleOpenModal}
                >
                  <Icon sx={iconsStyle}>account_circle</Icon>
                </IconButton>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarMobileMenu}
                  onClick={handleMiniSidenav}
                >
                  <Icon sx={iconsStyle} fontSize="medium">
                    {miniSidenav ? "menu_open" : "menu"}
                  </Icon>
                </IconButton>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={handleConfiguratorOpen}
                >
                  <Icon sx={iconsStyle}>settings</Icon>
                </IconButton>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  aria-controls="notification-menu"
                  aria-haspopup="true"
                  variant="contained"
                  onClick={handleOpenMenu}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <Icon sx={iconsStyle}>notifications</Icon>
                  </Badge>
                </IconButton>
                {renderMenu()}
              </MDBox>
            </MDBox>
          )}
        </Toolbar>
      </AppBar>
      <EditAdminModal open={openModal} handleClose={handleCloseModal} adminId={adminId} />
      <Dialog open={openDetailModal} onClose={handleCloseDetailModal}>
        <DialogTitle>{selectedNotification?.title || "Chi tiết thông báo"}</DialogTitle>
        <DialogContent>
          <p>{selectedNotification?.detail || "Không có chi tiết thông báo."}</p>
          {selectedNotification?.createdAt && (
            <p>
              <strong>Ngày tạo:</strong> {new Date(selectedNotification.createdAt).toLocaleString()}
            </p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailModal}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
