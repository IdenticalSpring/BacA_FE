import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  TextField,
  MenuItem,
  Button,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import classService from "services/classService";
import teacherService from "services/teacherService";
import scheduleService from "services/scheduleService";
import lessonByScheduleService from "services/lessonByScheduleService";
import levelService from "services/levelService";
import { colors } from "assets/theme/color";
import { message, Modal, Spin, TimePicker } from "antd";
import dayjs from "dayjs";
import classScheduleService from "services/classScheduleService";
import CheckinManagement from "pages/admin/checkinManagement";
import moment from "moment";

function generateAccessId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  let accessId = "";

  for (let i = 0; i < 2; i++) {
    accessId += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  for (let i = 0; i < 3; i++) {
    accessId += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  return accessId;
}
const isConflictWithExisting = (newSchedule, existingSchedules) => {
  const { dayOfWeek, startTime, endTime } = newSchedule;

  if (startTime == null || endTime == null || dayOfWeek == null) {
    message.warning("Please fill in every field to continue");
    return false;
  }
  // const formattedStart = moment(startTime).format("HH:mm");
  // const formattedEnd = moment(endTime).format("HH:mm");

  return existingSchedules.some((item) => {
    // const existingStart = item.startTime?.substring(0, 5); // "19:08:00" => "19:08"
    // const existingEnd = item.endTime?.substring(0, 5); // "21:08:00" => "21:08"
    // console.log("item", item.startTime, item.endTime, item.dayOfWeek);
    // console.log("dayOfWeek", dayOfWeek);
    // console.log("startTime", startTime);
    // console.log("endTime", endTime);
    return item.dayOfWeek === dayOfWeek && item.startTime === startTime && item.endTime === endTime;
  });
};
function CreateClass() {
  const navigate = useNavigate();

  // State for CreateClass
  const [classDataForCreate, setClassDataForCreate] = useState({
    name: "",
    level: "",
    teacherID: "",
    scheduleId: "",
  });
  const [classDataForUpdate, setClassDataForUpdate] = useState({
    id: "",
    name: "",
    level: "",
    teacherID: "",
    scheduleId: "",
  });
  const [dayOfWeekForCreate, setDayOfWeekForCreate] = useState(0);
  const [dayOfWeekForUpdate, setDayOfWeekForUpdate] = useState(0);
  const [filterSchedule, setFilterSchedule] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [selectedSchedulesForCreate, setSelectedSchedulesForCreate] = useState([]);
  const [selectedSchedulesForUpdate, setSelectedSchedulesForUpdate] = useState([]);
  const [levels, setLevels] = useState([]);
  const [classColumns] = useState([
    { Header: "Class Name", accessor: "name", width: "20%" },
    { Header: "Level", accessor: "level", width: "10%" },
    { Header: "Teacher", accessor: "teacher", width: "20%" },
    { Header: "Access ID", accessor: "accessId", width: "20%" },
    { Header: "Schedule", accessor: "schedule", width: "20%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ]);
  const [scheduleColumns] = useState([
    { Header: "Day Of Week", accessor: "dayOfWeek", width: "30%" },
    { Header: "Start Time", accessor: "startTime", width: "30%" },
    { Header: "End Time", accessor: "endTime", width: "30%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ]);
  const [scheduleRows, setScheduleRows] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [classRows, setClassRows] = useState([]);
  const [loadingClass, setLoadingClass] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingCreateClass, setLoadingCreateClass] = useState(false);
  const [loadingCreateSchedule, setLoadingCreateSchedule] = useState(false);
  const [loadingUpdateClass, setLoadingUpdateClass] = useState(false);
  const [errorClass, setErrorClass] = useState("");
  const [errorSchedule, setErrorSchedule] = useState("");
  const [openEditClass, setOpenEditClass] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classAccessId, setClassAccessId] = useState("");
  const [rawClasses, setRawClasses] = useState([]);
  const [openCheckinDialog, setOpenCheckinDialog] = useState(false); // State for check-in dialog
  const [selectedClassId, setSelectedClassId] = useState(""); // State for selected class ID
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
  const [filterLevel, setFilterLevel] = useState("");
  const [filterClass, setFilterClass] = useState("");

  useEffect(() => {
    if (rawClasses.length > 0 && levels.length > 0) {
      let filteredClasses = rawClasses;

      if (filterSchedule) {
        filteredClasses = filteredClasses.filter((cls) =>
          cls.schedules?.some((sch) => sch.dayOfWeek === parseInt(filterSchedule))
        );
      }

      if (filterClass) {
        filteredClasses = filteredClasses.filter((cls) =>
          cls.name.toLowerCase().includes(filterClass.toLowerCase())
        );
      }

      if (filterLevel) {
        filteredClasses = filteredClasses.filter((cls) => cls.level === filterLevel);
      }

      const formattedRows = filteredClasses.map((cls) => ({
        id: cls.id,
        name: cls.name,
        level: levels.find((lv) => lv.id === cls.level)?.name || "N/A",
        teacher: cls.teacher?.name || "N/A",
        accessId: cls.accessId || "N/A",
        schedule:
          cls.schedules?.length > 0
            ? cls.schedules
                .slice(0, 2)
                .map((sch) => `${daysOfWeek[sch.dayOfWeek]}: ${sch.startTime}-${sch.endTime}`)
                .join(", ") + (cls.schedules.length > 2 ? "..." : "")
            : "No Schedule",
        actions: (
          <>
            <IconButton
              onClick={() => {
                setSelectedClassId(cls.id);
                setOpenCheckinDialog(true);
              }}
              sx={{
                color: colors.midGreen,
              }}
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton color="primary" onClick={() => handleEdit(cls)}>
              <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => handleDeleteClass(cls.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
      }));
      setClassRows(formattedRows);
    }
  }, [rawClasses, levels, filterSchedule, filterClass, filterLevel]);

  // State for LevelManagement
  const [levelName, setLevelName] = useState("");
  const [levelDescription, setLevelDescription] = useState("");
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [editLevelDialogOpen, setEditLevelDialogOpen] = useState(false);
  const [deleteLevelDialogOpen, setDeleteLevelDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({
    levelName: false,
    levelDescription: false,
    editLevelName: false,
  });
  const [openUpdateSchedule, setOpenUpdateSchedule] = useState(false);
  const [editScheduleMode, setEditScheduleMode] = useState(false);
  const [selectedScheduleForUpdate, setSelectedScheduleForUpdate] = useState(null);
  const [scheduleDataForUpdate, setScheduleDataForUpdate] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });
  const levelColumns = [
    { Header: "Name", accessor: "name", width: "70%" },
    { Header: "Actions", accessor: "actions", width: "30%" },
  ];
  const [loadingUpdateSchedule, setLoadingUpdateSchedule] = useState(false);
  const levelRows =
    levels.length > 0
      ? levels.map((level) => ({
          name: level.name,
          actions: (
            <MDBox display="flex" gap={2}>
              <MDButton
                variant="text"
                sx={{
                  backgroundColor: colors.midGreen,
                  color: colors.white,
                  " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                }}
                onClick={() => handleEditLevelClick(level)}
              >
                Edit
              </MDButton>
              <MDButton variant="text" color="error" onClick={() => handleDeleteLevelClick(level)}>
                Delete
              </MDButton>
            </MDBox>
          ),
        }))
      : [
          {
            name: "No Data",
            actions: "",
          },
        ];

  // Fetch data
  useEffect(() => {
    fetchLevels();
    fetchTeachers();
    fetchClasses();
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoadingSchedule(true);
      const data = await scheduleService.getAllSchedules();
      const formattedRows = data.map((schedule) => ({
        id: schedule.id,
        dayOfWeek: daysOfWeek[schedule.dayOfWeek],
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        actions: (
          <>
            <IconButton color="primary" onClick={() => handleEditSchedule(schedule)}>
              <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => handleDeleteSchedule(schedule.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
      }));
      setScheduleRows(formattedRows);
    } catch (err) {
      setErrorSchedule("Lỗi khi tải dữ liệu lịch học!");
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    fetchSchedulesByDayOfWeek(dayOfWeekForCreate);
  }, [dayOfWeekForCreate]);

  const fetchSchedulesByDayOfWeek = async (dayOfWeek) => {
    try {
      const data = await scheduleService.getScheduleByDayOfWeek({ dayOfWeek: dayOfWeek });
      setSchedules(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lịch học theo ngày trong tuần");
    }
  };
  useEffect(() => {
    fetchAllSchedules();
  }, []);
  const fetchAllSchedules = async () => {
    try {
      const data = await scheduleService.getAllSchedules();
      setAllSchedules(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lịch học");
    }
  };
  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách giáo viên");
    }
  };

  const fetchLevels = async () => {
    setLoadingLevels(true);
    try {
      const data = await levelService.getAllLevels();
      setLevels(data);
    } catch (error) {
      setNotification({
        open: true,
        message: error.toString(),
        severity: "error",
      });
    } finally {
      setLoadingLevels(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoadingClass(true);
      const data = await classService.getAllClasses();

      const classesWithSchedules = await Promise.all(
        data.map(async (cls) => {
          const schedules = await lessonByScheduleService.getSchedulesByClass(cls.id);
          return { ...cls, schedules };
        })
      );

      setRawClasses(classesWithSchedules);
    } catch (err) {
      setErrorClass("Lỗi khi tải dữ liệu lớp học!");
    } finally {
      setLoadingClass(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
      try {
        setLoadingClass(true);
        await classService.deleteClass(id);
        setClassRows((pre) => pre?.filter((cls) => cls.id !== id));
        message.success("delete class success");
      } catch (err) {
        message.error("delete class failed! " + err);
      } finally {
        setLoadingClass(false);
      }
    }
  };

  // Handlers for LevelManagement
  const validateLevelForm = () => {
    const newErrors = {
      levelName: !levelName.trim(),
    };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  const validateEditLevelForm = () => {
    const newErrors = {
      editLevelName: !currentEditItem || !currentEditItem.name.trim(),
    };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleAddLevel = async () => {
    if (!validateLevelForm()) return;

    if (levels.some((l) => l.name.toLowerCase() === levelName.trim().toLowerCase())) {
      setNotification({
        open: true,
        message: "Level with this name already exists",
        severity: "error",
      });
      return;
    }

    try {
      const newLevelData = {
        name: levelName.trim(),
        description: "meomeo",
      };
      await levelService.createLevel(newLevelData);
      fetchLevels();
      setLevelName("");
      setLevelDescription("");
      setNotification({
        open: true,
        message: "Level added successfully",
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.toString(),
        severity: "error",
      });
    }
  };

  const handleEditLevelClick = (level) => {
    setCurrentEditItem({ ...level });
    setEditLevelDialogOpen(true);
  };

  const handleEditLevelSave = async () => {
    if (!validateEditLevelForm()) return;

    if (
      levels.some(
        (l) =>
          l.id !== currentEditItem.id &&
          l.name.toLowerCase() === currentEditItem.name.trim().toLowerCase()
      )
    ) {
      setNotification({
        open: true,
        message: "Level with this name already exists",
        severity: "error",
      });
      return;
    }

    try {
      const updatedLevelData = {
        name: currentEditItem.name.trim(),
      };
      await levelService.editLevel(currentEditItem.id, updatedLevelData);
      fetchLevels();
      setEditLevelDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({
        open: true,
        message: "Level updated successfully",
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.toString(),
        severity: "error",
      });
    }
  };

  const handleDeleteLevelClick = (level) => {
    setCurrentEditItem(level);
    setDeleteLevelDialogOpen(true);
  };

  const handleDeleteLevelConfirm = async () => {
    if (!currentEditItem) return;

    try {
      await levelService.deleteLevel(currentEditItem.id);
      fetchLevels();
      setDeleteLevelDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({
        open: true,
        message: "Level deleted successfully",
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.toString(),
        severity: "error",
      });
    }
  };

  const handleNotificationClose = (event, reason) => {
    if (reason === "clickaway") return;
    setNotification({ ...notification, open: false });
  };

  // Handlers for CreateClass
  const handleEdit = async (cls) => {
    setEditMode(true);
    setSelectedClass(cls);
    const schedulesData = await lessonByScheduleService.getSchedulesByClass(cls.id);
    setSelectedSchedule(schedulesData);
    setClassDataForUpdate({
      id: cls.id,
      name: cls.name,
      level: cls.level,
      teacherID: cls.teacher?.id || "",
      scheduleId: cls.schedule?.id || "",
    });
    setOpenEditClass(true);
  };

  const handleEditSchedule = async (sch) => {
    setEditScheduleMode(true);
    setSelectedScheduleForUpdate(sch);
    setScheduleDataForUpdate({
      dayOfWeek: sch.dayOfWeek,
      startTime: dayjs(sch.startTime, "HH:mm"),
      endTime: dayjs(sch.endTime, "HH:mm"),
    });
    setOpenUpdateSchedule(true);
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch học này?")) {
      try {
        await scheduleService.deleteSchedule(id);
        setScheduleRows(scheduleRows.filter((row) => row.id !== id));
      } catch (err) {
        alert("Lỗi khi xóa lịch học! " + err);
      }
    }
  };

  const handleSaveClass = async () => {
    setLoadingCreateClass(true);
    const genAccessId = generateAccessId();
    try {
      const payload = {
        name: classDataForCreate.name,
        level: classDataForCreate.level,
        accessId: genAccessId,
        teacherID: classDataForCreate.teacherID,
      };
      const classEntity = await classService.createClass(payload);
      if (selectedSchedulesForCreate.length > 0) {
        const dataForLessonBySchedule = {
          lessons: getDatesForSelectedSchedules(selectedSchedulesForCreate, classEntity),
        };
        await lessonByScheduleService.createLessonBySchedule(dataForLessonBySchedule);
        const classScheduleDatas = [];
        selectedSchedulesForCreate.forEach((schedule) => {
          const classScheduleData = {
            classID: classEntity.id,
            scheduleID: schedule.scheduleId,
          };
          classScheduleDatas.push(classScheduleData);
        });
        await classScheduleService.createClassSchedule(classScheduleDatas);
      }

      setClassRows([
        ...classRows,
        {
          id: classEntity.id,
          name: classEntity.name,
          level: levels.find((lv) => lv.id === classEntity.level)?.name || "N/A",
          teacher: classEntity.teacher?.name || "N/A",
          accessId: classEntity.accessId || "N/A",
          actions: (
            <>
              <IconButton color="primary" onClick={() => handleEdit(classEntity)}>
                <EditIcon />
              </IconButton>
              <IconButton color="secondary" onClick={() => handleDeleteClass(classEntity?.id)}>
                <DeleteIcon />
              </IconButton>
              <IconButton
                color="info"
                onClick={() => {
                  setSelectedClassId(classEntity.id);
                  setOpenCheckinDialog(true);
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </>
          ),
        },
      ]);
      setClassDataForCreate({
        id: "",
        name: "",
        level: "",
        teacherID: "",
        scheduleId: "",
      });
      setSelectedSchedulesForCreate([]);
      setClassAccessId(genAccessId);
      message.success("Create class success!");
    } catch (err) {
      message.error("Create class failed! " + err);
    } finally {
      setLoadingCreateClass(false);
    }
  };

  const handleUpdateClass = async () => {
    setLoadingUpdateClass(true);
    try {
      const payload = {
        name: classDataForUpdate.name,
        level: classDataForUpdate.level,
        teacherID: classDataForUpdate.teacherID,
      };
      const classEntity = await classService.editClass(selectedClass.id, payload);
      if (selectedSchedulesForUpdate?.length > 0) {
        const dataForLessonBySchedule = {
          lessons: getDatesForSelectedSchedules(selectedSchedulesForUpdate, classEntity),
        };
        await lessonByScheduleService.createLessonBySchedule(dataForLessonBySchedule);
        const classScheduleDatas = [];
        selectedSchedulesForUpdate.forEach((schedule) => {
          const classScheduleData = {
            classID: classEntity.id,
            scheduleID: schedule.scheduleId,
          };
          classScheduleDatas.push(classScheduleData);
        });
        await classScheduleService.createClassSchedule(classScheduleDatas);
      }

      setClassRows(
        classRows.map((row) => {
          return row.id === classEntity.id
            ? {
                ...row,
                actions: (
                  <>
                    <IconButton color="primary" onClick={() => handleEdit(classEntity)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDeleteClass(classEntity.id)}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      color="info"
                      onClick={() => {
                        setSelectedClassId(classEntity.id);
                        setOpenCheckinDialog(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </>
                ),
                ...payload,
                teacher: classEntity.teacher?.name || "N/A",
                level: levels.find((lv) => lv.id === classEntity.level)?.name || "N/A",
              }
            : row;
        })
      );
      setSelectedSchedule([]);
      setSelectedSchedulesForUpdate([]);
      setOpenEditClass(false);
      setClassDataForUpdate({
        id: "",
        name: "",
        level: "",
        teacherID: "",
        scheduleId: "",
      });
      message.success("Update class success!");
    } catch (err) {
      message.error("Update class failed!" + err);
    } finally {
      setLoadingUpdateClass(false);
    }
  };

  const handleAddScheduleForCreate = () => {
    if (!classDataForCreate.scheduleId) return;
    const selectedSchedule = schedules.find((sch) => sch.id === classDataForCreate.scheduleId);
    if (!selectedSchedule) return;
    if (
      selectedSchedulesForCreate.some((sch) => classDataForCreate.scheduleId === sch.scheduleId)
    ) {
      return;
    }
    setSelectedSchedulesForCreate((prev) => [
      ...prev,
      {
        scheduleId: selectedSchedule.id,
        day: daysOfWeek[selectedSchedule.dayOfWeek],
        startTime: selectedSchedule.startTime,
        endTime: selectedSchedule.endTime,
      },
    ]);
  };

  const handleRemoveScheduleForCreate = (id) => {
    setSelectedSchedulesForCreate((prev) => prev.filter((schedule) => schedule.scheduleId !== id));
  };

  const handleAddScheduleForUpdate = () => {
    if (!classDataForUpdate.scheduleId) return;
    const selectedScheduleData = schedules.find((sch) => sch.id === classDataForUpdate.scheduleId);
    if (!selectedScheduleData) return;
    if (
      selectedSchedulesForUpdate.some((sch) => classDataForUpdate.scheduleId === sch.scheduleId)
    ) {
      return;
    }
    if (selectedSchedule.some((sch) => classDataForUpdate.scheduleId === sch.id)) {
      return;
    }
    setSelectedSchedulesForUpdate((prev) => [
      ...prev,
      {
        scheduleId: selectedScheduleData.id,
        day: daysOfWeek[selectedScheduleData.dayOfWeek],
        startTime: selectedScheduleData.startTime,
        endTime: selectedScheduleData.endTime,
      },
    ]);
  };

  const handleRemoveScheduleForUpdate = (id) => {
    setSelectedSchedulesForUpdate((prev) => prev.filter((schedule) => schedule.scheduleId !== id));
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

  const [scheduleData, setScheduleData] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });

  const handleSaveSchedule = async () => {
    setLoadingCreateSchedule(true);
    try {
      const data = {
        dayOfWeek: scheduleData.dayOfWeek,
        startTime: scheduleData.startTime.format("HH:mm:ss"),
        endTime: scheduleData.endTime.format("HH:mm:ss"),
      };
      if (isConflictWithExisting(data, allSchedules)) {
        message.warning("Schedule conflicts with existing schedule!");
        return;
      }
      const scheduleEntity = await scheduleService.createSchedule(data);
      setScheduleData({
        dayOfWeek: "",
        startTime: "",
        endTime: "",
      });
      setScheduleRows([
        ...scheduleRows,
        {
          id: scheduleEntity.id,
          dayOfWeek: daysOfWeek[scheduleEntity.dayOfWeek],
          startTime: scheduleEntity.startTime,
          endTime: scheduleEntity.endTime,
          actions: (
            <>
              <IconButton color="primary" onClick={() => handleEditSchedule(scheduleEntity)}>
                <EditIcon />
              </IconButton>
              <IconButton color="secondary" onClick={() => handleDeleteSchedule(scheduleEntity.id)}>
                <DeleteIcon />
              </IconButton>
            </>
          ),
        },
      ]);
      setAllSchedules((prev) => [...prev, scheduleEntity]);
      message.success("Create schedule success!");
    } catch (err) {
      message.error("Create schedule failed!" + err);
    } finally {
      setLoadingCreateSchedule(false);
    }
  };

  const handleSaveScheduleUpdate = async () => {
    setLoadingUpdateSchedule(true);
    try {
      const data = {
        dayOfWeek: scheduleDataForUpdate.dayOfWeek,
        startTime: scheduleDataForUpdate.startTime.format("HH:mm"),
        endTime: scheduleDataForUpdate.endTime.format("HH:mm"),
      };
      const scheduleEntity = await scheduleService.editSchedule(selectedScheduleForUpdate.id, data);
      setScheduleRows(
        scheduleRows.map((row) => {
          return row.id === selectedScheduleForUpdate.id
            ? {
                ...row,
                ...data,
                dayOfWeek: daysOfWeek[data.dayOfWeek],
                actions: (
                  <>
                    <IconButton color="primary" onClick={() => handleEditSchedule(scheduleEntity)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDeleteSchedule(scheduleEntity.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                ),
              }
            : row;
        })
      );
      setOpenUpdateSchedule(false);
      message.success("Update schedule success!");
    } catch (err) {
      message.error("Update schedule failed!" + err);
    } finally {
      setLoadingUpdateSchedule(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{ backgroundColor: colors.cardBg, boxShadow: `0 4px 12px ${colors.softShadow}` }}
            >
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                borderRadius="lg"
                sx={{ backgroundColor: colors.deepGreen }}
              >
                <MDTypography variant="h6" sx={{ color: colors.white }}>
                  Level Management
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={3}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <MDInput
                      fullWidth
                      label="Level Name"
                      value={levelName}
                      onChange={(e) => {
                        setLevelName(e.target.value);
                        setErrors({ ...errors, levelName: false });
                      }}
                      error={errors.levelName}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: colors.inputBorder },
                          "&:hover fieldset": { borderColor: colors.midGreen },
                          "&.Mui-focused fieldset": { borderColor: colors.inputFocus },
                        },
                        "& .MuiInputLabel-root": { color: colors.darkGray },
                        "& .MuiInputLabel-root.Mui-focused": { color: colors.inputFocus },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton
                      variant="gradient"
                      sx={{
                        backgroundColor: colors.midGreen,
                        color: colors.white,
                        " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                      }}
                      onClick={handleAddLevel}
                      fullWidth
                      disabled={loadingLevels}
                    >
                      {loadingLevels ? <CircularProgress size={20} color="inherit" /> : "Add"}
                    </MDButton>
                  </Grid>
                </Grid>
                <MDBox pt={3} display="flex" justifyContent="center">
                  {loadingLevels ? (
                    <CircularProgress sx={{ color: colors.deepGreen }} />
                  ) : (
                    <DataTable
                      table={{ columns: levelColumns, rows: levelRows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                padding: 3,
                backgroundColor: colors.white,
                backdropFilter: "blur(10px)",
                boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <TextField
                label="Class Name"
                fullWidth
                margin="normal"
                value={classDataForCreate.name}
                onChange={(e) =>
                  setClassDataForCreate({ ...classDataForCreate, name: e.target.value })
                }
              />
              <TextField
                select
                label="Level"
                fullWidth
                sx={{
                  "& .css-1cohrqd-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select":
                    {
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                    },
                }}
                InputProps={{
                  sx: {
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                margin="normal"
                value={classDataForCreate.level}
                onChange={(e) =>
                  setClassDataForCreate({ ...classDataForCreate, level: e.target.value })
                }
              >
                {levels.map((d, index) => (
                  <MenuItem key={index} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Teacher"
                fullWidth
                InputProps={{
                  sx: {
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                margin="normal"
                value={classDataForCreate.teacherID}
                onChange={(e) =>
                  setClassDataForCreate({ ...classDataForCreate, teacherID: e.target.value })
                }
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </TextField>
              <div style={{ width: "100%", display: "flex", gap: "10px", alignItems: "center" }}>
                <TextField
                  select
                  label="Day of Week"
                  fullWidth
                  InputProps={{
                    sx: {
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                  margin="normal"
                  value={dayOfWeekForCreate}
                  onChange={(e) => setDayOfWeekForCreate(+e.target.value)}
                >
                  {daysOfWeek.map((d, index) => (
                    <MenuItem key={index} value={index}>
                      {d}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Schedule"
                  fullWidth
                  InputProps={{
                    sx: {
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                  margin="normal"
                  value={classDataForCreate.scheduleId}
                  onChange={(e) =>
                    setClassDataForCreate({ ...classDataForCreate, scheduleId: e.target.value })
                  }
                >
                  {schedules.map((schedule) => (
                    <MenuItem key={schedule.id} value={schedule.id}>
                      {daysOfWeek[schedule.dayOfWeek]} - {schedule.startTime} to {schedule.endTime}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="text"
                  style={{ height: "30px" }}
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={handleAddScheduleForCreate}
                >
                  Add
                </Button>
              </div>
              {selectedSchedulesForCreate.length > 0 && (
                <TableContainer component={Paper} sx={{ marginTop: 2, width: "100%" }}>
                  <Table>
                    <TableHead style={{ display: "table-header-group" }}>
                      <TableRow>
                        <TableCell>Day</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedSchedulesForCreate.map((schedule, index) => (
                        <TableRow key={index}>
                          <TableCell>{schedule.day}</TableCell>
                          <TableCell>
                            {schedule.startTime} - {schedule.endTime}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleRemoveScheduleForCreate(schedule.scheduleId)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={handleSaveClass}
                >
                  {loadingCreateClass && <Spin size="small" style={{ marginRight: "10px" }} />}
                  Create
                </Button>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                padding: 3,
                backgroundColor: colors.white,
                backdropFilter: "blur(10px)",
                boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <TextField
                select
                label="Day of Week"
                fullWidth
                InputProps={{
                  sx: {
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                margin="normal"
                value={scheduleData.dayOfWeek}
                onChange={(e) => setScheduleData({ ...scheduleData, dayOfWeek: e.target.value })}
              >
                {daysOfWeek.map((d, index) => (
                  <MenuItem key={index} value={index}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
              <label style={{ fontSize: "14px" }}>Time Start</label>
              <TimePicker
                format="HH:mm"
                value={scheduleData.startTime}
                onChange={(time, timeString) => {
                  setScheduleData({ ...scheduleData, startTime: time });
                }}
                style={{ height: "40px", width: "100%", marginBottom: "8px" }}
              />
              <label style={{ fontSize: "14px" }}>Time End</label>
              <TimePicker
                format="HH:mm"
                value={scheduleData.endTime}
                onChange={(time, timeString) => {
                  setScheduleData({ ...scheduleData, endTime: time });
                }}
                style={{ height: "40px", width: "100%", marginBottom: "8px" }}
              />
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={handleSaveSchedule}
                >
                  {loadingCreateSchedule && <Spin size="small" style={{ marginRight: "10px" }} />}
                  Create
                </Button>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                borderRadius="lg"
                sx={{ backgroundColor: colors.deepGreen, color: colors.white }}
              >
                <MDTypography variant="h6" color="white">
                  Schedule Tables
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {loadingSchedule ? (
                  <MDTypography variant="h6" color="info" align="center">
                    <Spin size="default" style={{ marginRight: "10px" }} />
                    Loading...
                  </MDTypography>
                ) : errorSchedule ? (
                  <MDTypography variant="h6" color="error" align="center">
                    {errorSchedule}
                  </MDTypography>
                ) : (
                  <DataTable
                    table={{ columns: scheduleColumns, rows: scheduleRows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={0}
                py={3}
                px={2}
                variant="gradient"
                borderRadius="lg"
                sx={{ backgroundColor: colors.deepGreen, color: colors.white }}
              >
                <MDTypography variant="h6" color="white">
                  Class Tables
                </MDTypography>
              </MDBox>
              <MDBox
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                gap={2}
                px={2}
                py={1}
              >
                <TextField
                  label="Filter by Class"
                  variant="outlined"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  sx={{
                    width: "10vw",
                    minWidth: "120px",
                    "& .MuiInputBase-root": {
                      height: "48px",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: "14px 14px",
                    },
                  }}
                />
                <TextField
                  py={3}
                  px={2}
                  select
                  label="Filter by Level"
                  variant="outlined"
                  value={filterLevel}
                  defaultValue=""
                  onChange={(e) => setFilterLevel(e.target.value)}
                  sx={{
                    width: "10vw",
                    minWidth: "80px",
                    "& .MuiInputBase-root": {
                      height: "48px",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: "14px 14px",
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Levels</em>
                  </MenuItem>
                  {levels.map((level) => (
                    <MenuItem key={level.id} value={level.id}>
                      {level.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Filter by Schedule"
                  variant="outlined"
                  value={filterSchedule}
                  defaultValue=""
                  onChange={(e) => setFilterSchedule(e.target.value)}
                  sx={{
                    width: "10vw",
                    minWidth: "80px",
                    "& .MuiInputBase-root": {
                      height: "48px",
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: "14px 14px",
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Schedules</em>
                  </MenuItem>
                  {daysOfWeek.slice(1).map((day, index) => (
                    <MenuItem key={index} value={index + 1}>
                      {day}
                    </MenuItem>
                  ))}
                </TextField>
              </MDBox>
              <MDBox pt={3}>
                {loadingClass ? (
                  <MDTypography variant="h6" color="info" align="center">
                    <Spin size="default" style={{ marginRight: "10px" }} />
                    Loading...
                  </MDTypography>
                ) : errorClass ? (
                  <MDTypography variant="h6" color="error" align="center">
                    {errorClass}
                  </MDTypography>
                ) : (
                  <DataTable
                    table={{ columns: classColumns, rows: classRows }}
                    isSorted={false}
                    entriesPerPage={5}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog open={editLevelDialogOpen} onClose={() => setEditLevelDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Edit Level
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          <TextField
            autoFocus
            margin="dense"
            label="Level Name"
            type="text"
            fullWidth
            value={currentEditItem?.name || ""}
            onChange={(e) => setCurrentEditItem({ ...currentEditItem, name: e.target.value })}
            error={errors.editLevelName}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: colors.inputBorder },
                "&:hover fieldset": { borderColor: colors.midGreen },
                "&.Mui-focused fieldset": { borderColor: colors.inputFocus },
              },
              "& .MuiInputLabel-root": { color: colors.darkGray },
              "& .MuiInputLabel-root.Mui-focused": { color: colors.inputFocus },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.paleGreen }}>
          <Button onClick={() => setEditLevelDialogOpen(false)} sx={{ color: colors.darkGray }}>
            Cancel
          </Button>
          <Button
            onClick={handleEditLevelSave}
            sx={{
              color: colors.white,
              backgroundColor: colors.safeGreen,
              "&:hover": { backgroundColor: colors.highlightGreen },
            }}
            disabled={loadingLevels}
          >
            {loadingLevels ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteLevelDialogOpen} onClose={() => setDeleteLevelDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Delete Level
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          <DialogContentText sx={{ color: colors.darkGray }}>
            Are you sure you want to delete the level {currentEditItem?.name}? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.paleGreen }}>
          <Button onClick={() => setDeleteLevelDialogOpen(false)} sx={{ color: colors.darkGray }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteLevelConfirm}
            sx={{
              color: colors.white,
              backgroundColor: colors.errorRed,
              "&:hover": { backgroundColor: "#FF8787" },
            }}
            disabled={loadingLevels}
          >
            {loadingLevels ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          sx={{
            width: "100%",
            backgroundColor:
              notification.severity === "success" ? colors.safeGreen : colors.errorRed,
            color: colors.white,
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={openEditClass}
        onClose={() => {
          setSelectedSchedule([]);
          setSelectedSchedulesForUpdate([]);
          setOpenEditClass(false);
        }}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            width: "90vw",
            height: "90vh",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>{"Edit Class"}</DialogTitle>
        <DialogContent sx={{ height: "100%", overflowY: "auto" }}>
          <Card
            sx={{
              padding: 3,
              backgroundColor: colors.white,
              backdropFilter: "blur(10px)",
              boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              height: "100%",
            }}
          >
            <TextField
              label="Class Name"
              fullWidth
              margin="normal"
              value={classDataForUpdate.name}
              onChange={(e) =>
                setClassDataForUpdate({ ...classDataForUpdate, name: e.target.value })
              }
            />
            <TextField
              select
              label="Level"
              fullWidth
              sx={{
                "& .css-1cohrqd-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select":
                  {
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                  },
              }}
              InputProps={{
                sx: {
                  minHeight: "48px",
                  display: "flex",
                  alignItems: "center",
                },
              }}
              margin="normal"
              value={classDataForUpdate.level}
              onChange={(e) =>
                setClassDataForUpdate({ ...classDataForUpdate, level: e.target.value })
              }
            >
              {levels.map((d, index) => (
                <MenuItem key={index} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Teacher"
              fullWidth
              InputProps={{
                sx: {
                  minHeight: "48px",
                  display: "flex",
                  alignItems: "center",
                },
              }}
              margin="normal"
              value={classDataForUpdate.teacherID}
              onChange={(e) =>
                setClassDataForUpdate({ ...classDataForUpdate, teacherID: e.target.value })
              }
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </TextField>
            <div style={{ width: "100%", display: "flex", gap: "10px", alignItems: "center" }}>
              <TextField
                select
                label="Day of Week"
                fullWidth
                InputProps={{
                  sx: {
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                margin="normal"
                value={dayOfWeekForCreate}
                onChange={(e) => setDayOfWeekForCreate(+e.target.value)}
              >
                {daysOfWeek.map((d, index) => (
                  <MenuItem key={index} value={index}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Schedule"
                fullWidth
                InputProps={{
                  sx: {
                    minHeight: "48px",
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                margin="normal"
                value={classDataForUpdate.scheduleId}
                onChange={(e) =>
                  setClassDataForUpdate({ ...classDataForUpdate, scheduleId: e.target.value })
                }
              >
                {schedules.map((schedule) => (
                  <MenuItem key={schedule.id} value={schedule.id}>
                    {daysOfWeek[schedule.dayOfWeek]} - {schedule.startTime} to {schedule.endTime}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="text"
                style={{ height: "30px" }}
                sx={{
                  backgroundColor: colors.midGreen,
                  color: colors.white,
                  " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                }}
                onClick={handleAddScheduleForUpdate}
              >
                Add
              </Button>
            </div>
            {(selectedSchedule?.length > 0 || selectedSchedulesForUpdate.length > 0) && (
              <TableContainer component={Paper} sx={{ marginTop: 2, width: "100%" }}>
                <Table>
                  <TableHead style={{ display: "table-header-group" }}>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSchedule?.map((schedule, index) => (
                      <TableRow key={schedule.id}>
                        <TableCell>{daysOfWeek[schedule.dayOfWeek]}</TableCell>
                        <TableCell>
                          {schedule.startTime} - {schedule.endTime}
                        </TableCell>
                      </TableRow>
                    ))}
                    {selectedSchedulesForUpdate.map((schedule, index) => (
                      <TableRow key={schedule.id}>
                        <TableCell>{schedule.day}</TableCell>
                        <TableCell>
                          {schedule.startTime} - {schedule.endTime}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleRemoveScheduleForUpdate(schedule.scheduleId)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <MDBox display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="text"
                sx={{ color: colors.midGreen, " &:hover": { color: colors.darkGreen } }}
                onClick={() => setOpenEditClass(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: colors.midGreen,
                  color: colors.white,
                  " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                }}
                onClick={handleUpdateClass}
              >
                {loadingUpdateClass && <Spin size="small" style={{ marginRight: "10px" }} />}
                Save
              </Button>
            </MDBox>
          </Card>
        </DialogContent>
      </Dialog>

      <Modal
        open={classAccessId.length > 0}
        onCancel={() => setClassAccessId("")}
        onClose={() => setClassAccessId("")}
        footer={<></>}
      >
        <div>
          {"Class created successfully. This is your class access ID:"} {classAccessId}
        </div>
      </Modal>
      <Modal
        centered
        title={"Modify Schedule"}
        open={openUpdateSchedule}
        onCancel={() => {
          setOpenUpdateSchedule(false);
          setScheduleDataForUpdate({
            dayOfWeek: "",
            startTime: "",
            endTime: "",
          });
        }}
        footer={[
          <Button key="cancel" onClick={() => setOpenUpdateSchedule(false)}>
            Cancel
          </Button>,
          <Button
            loading={loadingUpdateSchedule}
            key="submit"
            type="primary"
            onClick={handleSaveScheduleUpdate}
            style={{
              color: colors.white,
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            {"Save"}
          </Button>,
        ]}
        width={720}
      >
        <TextField
          select
          label="Day of Week"
          fullWidth
          sx={{
            "& .css-1cohrqd-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select":
              {
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
              },
          }}
          margin="normal"
          value={scheduleDataForUpdate.dayOfWeek}
          onChange={(e) => {
            setScheduleDataForUpdate({ ...scheduleDataForUpdate, dayOfWeek: e.target.value });
          }}
        >
          {daysOfWeek.map((d, index) => (
            <MenuItem key={index} value={index}>
              {d}
            </MenuItem>
          ))}
        </TextField>
        <label>Time Start</label>
        <TimePicker
          format="HH:mm"
          value={scheduleDataForUpdate.startTime}
          getPopupContainer={() => document.body}
          onChange={(time, timeString) => {
            setScheduleDataForUpdate({ ...scheduleDataForUpdate, startTime: time });
          }}
          style={{ height: "40px", width: "100%", marginBottom: "8px" }}
        />
        <label>Time End</label>
        <TimePicker
          format="HH:mm"
          value={scheduleDataForUpdate.endTime}
          onChange={(time, timeString) => {
            setScheduleDataForUpdate({ ...scheduleDataForUpdate, endTime: time });
          }}
          getPopupContainer={() => document.body}
          style={{ height: "40px", width: "100%", marginBottom: "8px" }}
        />
      </Modal>

      {/* Dialog for CheckinManagement */}
      <Dialog
        open={openCheckinDialog}
        onClose={() => setOpenCheckinDialog(false)}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            width: "90vw",
            height: "90vh",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>Check-in Management for Class</DialogTitle>
        <DialogContent sx={{ height: "100%", overflowY: "auto" }}>
          <CheckinManagement classId={selectedClassId} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCheckinDialog(false)} sx={{ color: colors.darkGray }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default CreateClass;
