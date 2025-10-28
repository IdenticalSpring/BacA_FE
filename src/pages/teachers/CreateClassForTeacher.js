import React, { useState, useEffect } from "react";
import {
  Card,
  TextField,
  MenuItem,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import levelService from "services/levelService";
import scheduleService from "services/scheduleService";
import classService from "services/classService";
import lessonByScheduleService from "services/lessonByScheduleService";
import classScheduleService from "services/classScheduleService";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";
import { colors } from "assets/theme/color";

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

function generateAccessId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  let accessId = "";
  for (let i = 0; i < 2; i++)
    accessId += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 3; i++) accessId += digits.charAt(Math.floor(Math.random() * digits.length));
  return accessId;
}

const CreateClassForTeacher = ({ visible, onClose, refreshClasses }) => {
  const [levels, setLevels] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [className, setClassName] = useState("");
  const [levelId, setLevelId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [scheduleId, setScheduleId] = useState("");
  const [isCreateSchedule, setIsCreateSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });
  const [loadingCreateSchedule, setLoadingCreateSchedule] = useState(false);
  const [accessIdModal, setAccessIdModal] = useState("");

  // Lấy teacherId từ token
  const teacherId = jwtDecode(sessionStorage.getItem("token")).userId;

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const data = await levelService.getAllLevels();
        setLevels(data);
      } catch (err) {
        // handle error
      }
    };
    const fetchSchedules = async () => {
      try {
        const data = await scheduleService.getAllSchedules();
        setSchedules(data);
      } catch (err) {
        // handle error
      }
    };
    if (visible) {
      fetchLevels();
      fetchSchedules();
      setSelectedSchedules([]);
      setClassName("");
      setLevelId("");
      setDayOfWeek(0);
      setScheduleId("");
      setAccessIdModal("");
    }
  }, [visible]);

  useEffect(() => {
    if (dayOfWeek > 0) {
      const firstSchedule = schedules.find((sch) => sch.dayOfWeek === dayOfWeek);
      if (firstSchedule) {
        setScheduleId(firstSchedule.id);
      } else {
        setScheduleId("");
      }
    } else {
      setScheduleId("");
    }
  }, [dayOfWeek, schedules]);

  const handleAddSchedule = () => {
    if (!scheduleId) return;
    const schedule = schedules.find((sch) => sch.id === scheduleId);
    if (!schedule) return;
    if (selectedSchedules.some((sch) => scheduleId === sch.scheduleId)) return;
    setSelectedSchedules((prev) => [
      ...prev,
      {
        scheduleId: schedule.id,
        day: daysOfWeek[schedule.dayOfWeek],
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      },
    ]);
  };

  const handleRemoveSchedule = (id) => {
    setSelectedSchedules((prev) => prev.filter((sch) => sch.scheduleId !== id));
  };

  const getDatesForSelectedSchedules = (selectedSchedules, classEntity) => {
    const resultDates = [];
    let currentDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);
    while (currentDate <= endDate) {
      selectedSchedules.forEach((schedule) => {
        if (currentDate.getDay() === daysOfWeek.indexOf(schedule.day) - 1) {
          resultDates.push({
            classID: classEntity.id,
            scheduleID: schedule.scheduleId,
            lessonID: null,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            date: currentDate.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }),
          });
        }
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return resultDates;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!className || !levelId) {
        return;
      }
      const genAccessId = generateAccessId();
      const payload = {
        name: className,
        level: levelId,
        accessId: genAccessId,
        teacherID: teacherId,
      };
      const classEntity = await classService.createClass(payload);
      if (selectedSchedules.length > 0) {
        const dataForLessonBySchedule = {
          lessons: getDatesForSelectedSchedules(selectedSchedules, classEntity),
        };
        await lessonByScheduleService.createLessonBySchedule(dataForLessonBySchedule);
        const classScheduleDatas = selectedSchedules.map((schedule) => ({
          classID: classEntity.id,
          scheduleID: schedule.scheduleId,
        }));
        await classScheduleService.createClassSchedule(classScheduleDatas);
      }
      setAccessIdModal(genAccessId);
      if (refreshClasses) refreshClasses();
      window.location.reload(); // Reload toàn bộ trang
      onClose();
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      setLoadingCreateSchedule(true);
      if (!newSchedule.dayOfWeek || !newSchedule.startTime || !newSchedule.endTime) return;
      const payload = {
        dayOfWeek: newSchedule.dayOfWeek,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
      };
      await scheduleService.createSchedule(payload);
      setIsCreateSchedule(false);
      setNewSchedule({ dayOfWeek: "", startTime: "", endTime: "" });
      // Reload schedules
      const data = await scheduleService.getAllSchedules();
      setSchedules(data);
    } catch (err) {
      // handle error
    } finally {
      setLoadingCreateSchedule(false);
    }
  };

  return (
    <Dialog open={visible} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Class</DialogTitle>
      <DialogContent>
        <Card sx={{ padding: 3, marginBottom: 2 }}>
          <TextField
            label="Class Name"
            fullWidth
            margin="normal"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <TextField
            select
            label="Level"
            fullWidth
            margin="normal"
            sx={{
              width: "100%",
              minWidth: "120px",
              "& .MuiInputBase-root": {
                height: "48px",
              },
              "& .MuiOutlinedInput-input": {
                padding: "14px 14px",
              },
            }}
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
          >
            {levels.map((level) => (
              <MenuItem key={level.id} value={level.id}>
                {level.name}
              </MenuItem>
            ))}
          </TextField>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: 16 }}>
            <TextField
              select
              label="Day of Week"
              sx={{
                width: "100%",
                minWidth: "120px",
                "& .MuiInputBase-root": {
                  height: "48px",
                },
                "& .MuiOutlinedInput-input": {
                  padding: "14px 14px",
                },
              }}
              fullWidth
              margin="normal"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(+e.target.value)}
            >
              {daysOfWeek.map((d, index) => (
                <MenuItem key={index} value={index}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
            {/* <TextField
              select
              label="Schedule"
              sx={{
                width: "100%",
                minWidth: "120px",
                "& .MuiInputBase-root": {
                  height: "48px",
                },
                "& .MuiOutlinedInput-input": {
                  padding: "14px 14px",
                },
              }}
              fullWidth
              margin="normal"
              value={scheduleId}
              onChange={(e) => setScheduleId(e.target.value)}
            >
              {schedules
                .filter((sch) => sch.dayOfWeek === dayOfWeek)
                .map((schedule) => (
                  <MenuItem key={schedule.id} value={schedule.id}>
                    {daysOfWeek[schedule.dayOfWeek]} - {schedule.startTime} to {schedule.endTime}
                  </MenuItem>
                ))}
            </TextField> */}
            <Button
              variant="contained"
              onClick={handleAddSchedule}
              sx={{
                backgroundColor: colors.midGreen,
                color: colors.white,
                " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
              }}
            >
              Add
            </Button>
            {/* <Button
              variant="text"
              onClick={() => setIsCreateSchedule(true)}
              sx={{
                backgroundColor: colors.white,
                color: colors.midGreen,
                " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
              }}
            >
              + New Schedule
            </Button> */}
          </div>
          {selectedSchedules.length > 0 && (
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    {/* <TableCell>Time</TableCell> */}
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedSchedules.map((sch) => (
                    <TableRow key={sch.scheduleId}>
                      <TableCell>{sch.day}</TableCell>
                      {/* <TableCell>
                        {sch.startTime} - {sch.endTime}
                      </TableCell> */}
                      <TableCell>
                        <IconButton onClick={() => handleRemoveSchedule(sch.scheduleId)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              marginTop: 3,
              backgroundColor: colors.midGreen,
              color: colors.white,
              " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Create Class"}
          </Button>
        </Card>
        <Dialog open={isCreateSchedule} onClose={() => setIsCreateSchedule(false)}>
          <DialogTitle>Create New Schedule</DialogTitle>
          <DialogContent>
            <TextField
              select
              label="Day of Week"
              fullWidth
              sx={{
                width: "100%",
                minWidth: "120px",
                "& .MuiInputBase-root": {
                  height: "48px",
                },
                "& .MuiOutlinedInput-input": {
                  padding: "14px 14px",
                },
              }}
              margin="normal"
              value={newSchedule.dayOfWeek}
              onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })}
            >
              {daysOfWeek.slice(1).map((day, idx) => (
                <MenuItem key={idx} value={idx + 1}>
                  {day}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Start Time"
              type="time"
              fullWidth
              margin="normal"
              value={newSchedule.startTime}
              onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Time"
              type="time"
              fullWidth
              margin="normal"
              value={newSchedule.endTime}
              onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setIsCreateSchedule(false)}
              sx={{
                backgroundColor: colors.white,
                color: colors.midGreen,
                " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSchedule}
              disabled={loadingCreateSchedule}
              sx={{
                backgroundColor: colors.midGreen,
                color: colors.white,
                " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
              }}
              variant="contained"
              color="primary"
            >
              {loadingCreateSchedule ? <CircularProgress size={20} color="inherit" /> : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: colors.white,
            color: colors.midGreen,
            " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
          }}
        >
          Close
        </Button>
      </DialogActions>
      <Dialog open={!!accessIdModal} onClose={() => setAccessIdModal("")}>
        <DialogTitle>Class Created</DialogTitle>
        <DialogContent>
          <Typography>
            Class created successfully. This is your class access ID: <b>{accessIdModal}</b>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccessIdModal("")}>OK</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

CreateClassForTeacher.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  refreshClasses: PropTypes.func,
};

CreateClassForTeacher.defaultProps = {
  refreshClasses: undefined,
};

export default CreateClassForTeacher;
