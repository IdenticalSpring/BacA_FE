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
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
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
import { colors } from "assets/theme/color";

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
        const readNotifications = JSON.parse(localStorage.getItem("readNotifications")) || [];
        const adminNotifications = data
          .filter((notification) => notification.type === true)
          .map((notification) => ({
            ...notification,
            isRead: readNotifications.includes(notification.id) || notification.isRead,
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(adminNotifications);
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Xử lý nhấp vào thông báo để xem chi tiết
  const handleNotificationClick = (id) => {
    try {
      const notification = notifications.find((notif) => notif.id === id);
      setSelectedNotification(notification);
      setOpenDetailModal(true);
      handleCloseMenu();

      // Cập nhật trạng thái đã đọc trong state và localStorage
      if (!notification.isRead) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
        );
        const readNotifications = JSON.parse(localStorage.getItem("readNotifications")) || [];
        if (!readNotifications.includes(id)) {
          readNotifications.push(id);
          localStorage.setItem("readNotifications", JSON.stringify(readNotifications));
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý thông báo:", error);
    }
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedNotification(null);
  };

  // Đánh dấu tất cả là đã đọc
  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    localStorage.setItem("readNotifications", JSON.stringify(allIds));
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

  // Format thời gian
  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

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
        "& .MuiPaper-root": {
          maxHeight: "500px",
          overflowY: "auto",
          width: "380px",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Header của menu notification */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${colors.borderGreen}`,
          background: `linear-gradient(135deg, ${colors.deepGreen} 0%, ${colors.darkGreen} 100%)`,
          color: colors.white,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: colors.white }}>
            Thông báo
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} mới`}
              size="small"
              sx={{
                backgroundColor: colors.highlightGreen,
                color: colors.white,
                fontWeight: 600,
              }}
            />
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={handleMarkAllRead}
            sx={{
              color: colors.white,
              textTransform: "none",
              fontSize: "12px",
              minWidth: "auto",
              p: 0.5,
              "&:hover": {
                backgroundColor: colors.safeGreen,
              },
            }}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </Box>

      {/* Danh sách thông báo */}
      <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <Box key={notification.id}>
              <Box
                onClick={() => handleNotificationClick(notification.id)}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  borderLeft: notification.isRead
                    ? "4px solid transparent"
                    : `4px solid ${colors.emerald}`,
                  backgroundColor: notification.isRead ? "transparent" : colors.paleGreen,
                  "&:hover": {
                    backgroundColor: notification.isRead ? colors.gray : colors.tableRowHover,
                    transform: "translateX(2px)",
                  },
                  position: "relative",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  {/* Icon thông báo */}
                  <Box
                    sx={{
                      minWidth: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: notification.isRead ? colors.gray : colors.emerald,
                      color: notification.isRead ? colors.darkGray : colors.white,
                    }}
                  >
                    <Icon fontSize="small">notifications</Icon>
                  </Box>

                  {/* Nội dung thông báo */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: notification.isRead ? 400 : 600,
                        color: notification.isRead ? colors.darkGray : colors.darkGreen,
                        mb: 0.5,
                        lineHeight: 1.3,
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: notification.isRead ? colors.darkGray : colors.seaGreen,
                        lineHeight: 1.4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {notification.detail}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.darkGray,
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {formatTime(notification.createdAt)}
                    </Typography>
                  </Box>

                  {/* Chấm tròn cho thông báo chưa đọc */}
                  {!notification.isRead && (
                    <Box
                      sx={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: colors.emerald,
                        mt: 0.5,
                      }}
                    />
                  )}
                </Box>
              </Box>
              {index < notifications.length - 1 && (
                <Divider sx={{ borderColor: colors.borderGreen }} />
              )}
            </Box>
          ))
        ) : (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              color: colors.darkGray,
            }}
          >
            <Icon sx={{ fontSize: 48, mb: 2, opacity: 0.3, color: colors.midGreen }}>
              notifications_none
            </Icon>
            <Typography variant="body2">Không có thông báo nào</Typography>
          </Box>
        )}
      </Box>
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

                {/* Icon thông báo với UI cải tiến - hiển thị cả icon và số lượng */}
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={{
                    ...navbarIconButton,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    padding: "6px 8px",
                    borderRadius: "8px",
                    minWidth: unreadCount > 0 ? "50px" : "auto",
                    transition: "all 0.3s ease",
                    ...(unreadCount > 0 && {
                      backgroundColor: "#FF6B6B",
                      border: "2px solid #FF4757",
                      boxShadow: "0 4px 15px rgba(255, 71, 87, 0.3)",
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%": {
                          transform: "scale(1)",
                          boxShadow: "0 4px 15px rgba(255, 71, 87, 0.3)",
                        },
                        "50%": {
                          transform: "scale(1.08)",
                          boxShadow: "0 6px 20px rgba(255, 71, 87, 0.5)",
                        },
                        "100%": {
                          transform: "scale(1)",
                          boxShadow: "0 4px 15px rgba(255, 71, 87, 0.3)",
                        },
                      },
                      "&:hover": {
                        backgroundColor: "#FF5722",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(255, 87, 34, 0.4)",
                      },
                    }),
                  }}
                  aria-controls="notification-menu"
                  aria-haspopup="true"
                  variant="contained"
                  onClick={handleOpenMenu}
                >
                  {/* Icon chuông thông báo */}
                  <Icon
                    sx={{
                      ...iconsStyle,
                      fontSize: "22px",
                      ...(unreadCount > 0 && {
                        color: "#FFFFFF !important",
                        filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))",
                        animation: "glow 1.5s ease-in-out infinite alternate",
                        "@keyframes glow": {
                          from: {
                            filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))",
                          },
                          to: {
                            filter: "drop-shadow(0 0 15px rgba(255, 255, 255, 1))",
                          },
                        },
                      }),
                    }}
                  >
                    {unreadCount > 0 ? "notifications_active" : "notifications"}
                  </Icon>

                  {/* Hiển thị số lượng thông báo bên cạnh icon */}
                  {unreadCount > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        backgroundColor: "#FFD700",
                        color: "#D32F2F",
                        borderRadius: "14px",
                        padding: "3px 8px",
                        fontSize: "12px",
                        fontWeight: 700,
                        minWidth: "20px",
                        textAlign: "center",
                        lineHeight: 1.1,
                        border: "2px solid #FFFFFF",
                        boxShadow: "0 2px 8px rgba(255, 215, 0, 0.6)",
                        animation: "bounce 2s infinite",
                        "@keyframes bounce": {
                          "0%, 20%, 50%, 80%, 100%": {
                            transform: "translateY(0) scale(1)",
                          },
                          "40%": {
                            transform: "translateY(-3px) scale(1.1)",
                          },
                          "60%": {
                            transform: "translateY(-1px) scale(1.05)",
                          },
                        },
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Typography>
                  )}
                </IconButton>
                {renderMenu()}
              </MDBox>
            </MDBox>
          )}
        </Toolbar>
      </AppBar>
      <EditAdminModal open={openModal} handleClose={handleCloseModal} adminId={adminId} />

      {/* Enhanced Detail Modal */}
      <Dialog
        open={openDetailModal}
        onClose={handleCloseDetailModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${colors.deepGreen} 0%, ${colors.darkGreen} 100%)`,
            color: colors.white,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Icon>notifications</Icon>
          {selectedNotification?.title || "Chi tiết thông báo"}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            {selectedNotification?.detail || "Không có chi tiết thông báo."}
          </Typography>
          {selectedNotification?.createdAt && (
            <Box
              sx={{
                p: 2,
                backgroundColor: colors.paleGreen,
                borderRadius: "8px",
                borderLeft: `4px solid ${colors.emerald}`,
              }}
            >
              <Typography variant="caption" sx={{ color: colors.darkGray }}>
                <strong>Thời gian:</strong>{" "}
                {new Date(selectedNotification.createdAt).toLocaleString("vi-VN")}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDetailModal}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${colors.deepGreen} 0%, ${colors.darkGreen} 100%)`,
              textTransform: "none",
              borderRadius: "8px",
              "&:hover": {
                background: `linear-gradient(135deg, ${colors.safeGreen} 0%, ${colors.deepGreen} 100%)`,
              },
              color: colors.white,
            }}
          >
            Đóng
          </Button>
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
