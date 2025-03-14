/* eslint-disable react/prop-types */
import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Avatar,
  ListItemIcon,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { styled } from "@mui/material/styles";

// Container của Sidebar
const SidebarContainer = styled(Box)({
  width: 260,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#121212",
  boxShadow: "2px 0px 10px rgba(0, 0, 0, 0.3)",
  position: "fixed",
  left: 0,
  top: 0,
});

// Header của Sidebar
const SidebarHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "16px",
  backgroundColor: "#FFC107",
  color: "#121212",
  borderRadius: "0px 0px 10px 10px",
});

// Danh sách lớp học
const ListWrapper = styled(Box)({
  flexGrow: 1,
  overflowY: "auto",
  padding: "10px",
});

// Nút chọn lớp học
const StyledListItem = styled(ListItemButton)({
  borderRadius: "8px",
  marginBottom: "8px",
  padding: "10px",
  transition: "0.3s",
  color: "white",
  "&:hover": {
    backgroundColor: "#FFD54F",
    color: "black",
  },
  "&.Mui-selected": {
    backgroundColor: "#FFD54F",
    color: "black",
    "& .MuiSvgIcon-root": {
      color: "black",
    },
  },
});
const daysOfWeek = [
  "Choose day of week",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const Sidebar = ({ lessonsBySchedule, selectedLessonBySchedule, onSelectLessonBySchedule }) => {
  return (
    <SidebarContainer>
      {/* Header */}
      <SidebarHeader>
        <Avatar sx={{ bgcolor: "#121212", color: "#FFC107", marginRight: 1 }}>
          <MenuBookIcon />
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          Lessons By Schedule
        </Typography>
      </SidebarHeader>

      <Divider sx={{ backgroundColor: "#FFC107" }} />

      {/* List of classes */}
      <ListWrapper>
        <List>
          {lessonsBySchedule.length > 0 ? (
            lessonsBySchedule.map((lessonByScheduleItem) => (
              <ListItem key={lessonByScheduleItem.id} disablePadding>
                <StyledListItem
                  selected={selectedLessonBySchedule === lessonByScheduleItem.id}
                  onClick={() => onSelectLessonBySchedule(lessonByScheduleItem.id)}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor:
                          selectedLessonBySchedule === lessonByScheduleItem.id
                            ? "#FFD54F"
                            : "#FFC107",
                        color:
                          selectedLessonBySchedule === lessonByScheduleItem.id ? "black" : "white",
                      }}
                    >
                      <SchoolIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={`📅 ${daysOfWeek[lessonByScheduleItem.schedule.dayOfWeek]} | ${
                      lessonByScheduleItem.date
                    } | 🕒${" "}
                        ${lessonByScheduleItem.schedule.startTime} - ${
                      lessonByScheduleItem.schedule.endTime
                    }`}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight:
                        selectedLessonBySchedule === lessonByScheduleItem.id ? "bold" : "normal",
                    }}
                  />
                </StyledListItem>
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" sx={{ p: 2, textAlign: "center", color: "white" }}>
              No lessons by schedule available
            </Typography>
          )}
        </List>
      </ListWrapper>
    </SidebarContainer>
  );
};

export default Sidebar;
