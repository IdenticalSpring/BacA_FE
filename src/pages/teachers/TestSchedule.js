import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";

import classTestScheduleService from "services/classTestScheduleService";
import classService from "services/classService";
import testService from "services/testService";
import { colors } from "assets/theme/color";

function TestSchedule({ classId, classTestSchedules }) {
  // State cho Test Schedules
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClassLabel, setSelectedClassLabel] = useState("Choose Class");
  const [selectedTestType, setSelectedTestType] = useState("");
  const [selectedTestTypeLabel, setSelectedTestTypeLabel] = useState("Choose Test Type");
  const [selectedDate, setSelectedDate] = useState("");
  const [classes, setClasses] = useState([]);
  const [testTypes, setTestTypes] = useState([]);
  const [testSchedules, setTestSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  // Menu anchor states
  const [classMenuAnchor, setClassMenuAnchor] = useState(null);
  const [testTypeMenuAnchor, setTestTypeMenuAnchor] = useState(null);
  const [editClassMenuAnchor, setEditClassMenuAnchor] = useState(null);
  const [editTestTypeMenuAnchor, setEditTestTypeMenuAnchor] = useState(null);

  // Dialog states
  const [editTestDialogOpen, setEditTestDialogOpen] = useState(false);
  const [deleteTestDialogOpen, setDeleteTestDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Validation states
  const [errors, setErrors] = useState({
    selectedClass: false,
    selectedTestType: false,
    selectedDate: false,
  });

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    if (classTestSchedules && classTestSchedules.length > 0) {
      setTestSchedules(
        classTestSchedules.map((test) => ({
          id: test.id,
          name: test.test?.name || "Unknown Test",
          date: new Date(test.date).toISOString().split("T")[0],
          className: test.class?.name || "Unknown Class",
          classID: test.classID,
          testID: test.testID,
        }))
      );
    }
    fetchData();
  }, [classTestSchedules]);

  // Fetch tất cả dữ liệu từ API
  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchClasses(),
        fetchTestTypes(),
        classTestSchedules && classTestSchedules.length > 0
          ? Promise.resolve()
          : fetchTestSchedules(),
      ]);
    } catch (error) {
      setNotification({
        open: true,
        message: error.toString(),
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await classService.getAllClasses();
      // Lọc lớp theo classId
      const filteredClasses = data.filter((cls) => !cls.isDelete && cls.id === classId);
      setClasses(filteredClasses);
      if (filteredClasses.length === 1) {
        // Tự động chọn lớp nếu chỉ có một lớp
        setSelectedClass(filteredClasses[0].id);
        setSelectedClassLabel(filteredClasses[0].name);
      }
      return filteredClasses;
    } catch (error) {
      console.error("Error fetching classes:", error);
      throw error;
    }
  };

  const fetchTestTypes = async () => {
    try {
      const data = await testService.getAllTest();
      setTestTypes(data);
      return data;
    } catch (error) {
      console.error("Error fetching test types:", error);
      throw error;
    }
  };

  const fetchTestSchedules = async () => {
    try {
      const data = await classTestScheduleService.getAllClassTestSchedule();
      const schedules = data
        .filter((test) => test.classID === classId) // Lọc test schedules theo classId
        .map((test) => ({
          id: test.id,
          name: test.test?.name || "Unknown Test",
          date: new Date(test.date).toISOString().split("T")[0],
          className: test.class?.name || "Unknown Class",
          classID: test.classID,
          testID: test.testID,
        }));
      setTestSchedules(schedules);
      return schedules;
    } catch (error) {
      console.error("Error fetching test schedules:", error);
      throw error;
    }
  };

  // Menu handlers
  const handleClassMenuOpen = (event) => setClassMenuAnchor(event.currentTarget);
  const handleClassMenuClose = () => setClassMenuAnchor(null);
  const handleClassSelect = (classId, className) => {
    setSelectedClass(classId);
    setSelectedClassLabel(className);
    setErrors({ ...errors, selectedClass: false });
    handleClassMenuClose();
  };

  const handleTestTypeMenuOpen = (event) => setTestTypeMenuAnchor(event.currentTarget);
  const handleTestTypeMenuClose = () => setTestTypeMenuAnchor(null);
  const handleTestTypeSelect = (typeId, typeName) => {
    setSelectedTestType(typeId);
    setSelectedTestTypeLabel(typeName);
    setErrors({ ...errors, selectedTestType: false });
    handleTestTypeMenuClose();
  };

  const handleEditClassMenuOpen = (event) => setEditClassMenuAnchor(event.currentTarget);
  const handleEditClassMenuClose = () => setEditClassMenuAnchor(null);
  const handleEditClassSelect = (classId, className) => {
    setCurrentEditItem({ ...currentEditItem, classID: classId, className: className });
    handleEditClassMenuClose();
  };

  const handleEditTestTypeMenuOpen = (event) => setEditTestTypeMenuAnchor(event.currentTarget);
  const handleEditTestTypeMenuClose = () => setEditTestTypeMenuAnchor(null);
  const handleEditTestTypeSelect = (typeId, typeName) => {
    setCurrentEditItem({ ...currentEditItem, testID: typeId, name: typeName });
    handleEditTestTypeMenuClose();
  };

  // Chuẩn bị dữ liệu cho bảng
  const testScheduleColumns = [
    { Header: "Name", accessor: "name", width: "25%" },
    { Header: "Date", accessor: "date", width: "20%" },
    { Header: "Class Name", accessor: "className", width: "25%" },
    { Header: "Actions", accessor: "actions", width: "30%" },
  ];

  const testScheduleRows = testSchedules.map((test) => ({
    name: test.name,
    date: test.date,
    className: test.className,
    actions: (
      <MDBox display="flex" gap={2}>
        <MDButton
          variant="text"
          sx={{
            backgroundColor: colors.midGreen,
            color: colors.white,
            " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
          }}
          onClick={() => handleEditTestClick(test)}
        >
          Edit
        </MDButton>
        <MDButton variant="text" color="error" onClick={() => handleDeleteTestClick(test)}>
          Delete
        </MDButton>
      </MDBox>
    ),
  }));

  // Validate form inputs
  const validateTestForm = () => {
    const newErrors = {
      selectedClass: !selectedClass,
      selectedTestType: !selectedTestType,
      selectedDate: !selectedDate,
    };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  // Handlers
  const handleCreateTest = async () => {
    if (!validateTestForm()) return;

    const selectedClassObj = classes.find((cls) => cls.id === selectedClass);
    const selectedTestTypeObj = testTypes.find((type) => type.id === selectedTestType);

    if (!selectedClassObj || !selectedTestTypeObj) {
      setNotification({ open: true, message: "Invalid selection", severity: "error" });
      return;
    }

    try {
      const newTestData = { date: selectedDate, classID: selectedClass, testID: selectedTestType };
      await classTestScheduleService.createClassTestSchedule(newTestData);
      fetchTestSchedules();
      setSelectedClass("");
      setSelectedClassLabel("Choose Class");
      setSelectedTestType("");
      setSelectedTestTypeLabel("Choose Test Type");
      setSelectedDate("");
      setNotification({ open: true, message: "Test schedule created", severity: "success" });
    } catch (error) {
      setNotification({ open: true, message: error.toString(), severity: "error" });
    }
  };

  const handleEditTestClick = (test) => {
    const testSchedule = testSchedules.find((t) => t.id === test.id);
    if (testSchedule) {
      setCurrentEditItem({ ...testSchedule });
      setEditTestDialogOpen(true);
    }
  };

  const handleEditTestSave = async () => {
    if (
      !currentEditItem ||
      !currentEditItem.classID ||
      !currentEditItem.testID ||
      !currentEditItem.date
    ) {
      setNotification({ open: true, message: "Please fill all fields", severity: "error" });
      return;
    }

    try {
      const updatedTestData = {
        date: currentEditItem.date,
        classID: currentEditItem.classID,
        testID: currentEditItem.testID,
      };
      await classTestScheduleService.editClassTestSchedule(currentEditItem.id, updatedTestData);
      fetchTestSchedules();
      setEditTestDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({ open: true, message: "Test schedule updated", severity: "success" });
    } catch (error) {
      setNotification({ open: true, message: error.toString(), severity: "error" });
    }
  };

  const handleDeleteTestClick = (test) => {
    const testSchedule = testSchedules.find((t) => t.id === test.id);
    if (testSchedule) {
      setCurrentEditItem(testSchedule);
      setDeleteTestDialogOpen(true);
    }
  };

  const handleDeleteTestConfirm = async () => {
    if (!currentEditItem) return;

    try {
      await classTestScheduleService.deleteClassTestSchedule(currentEditItem.id);
      fetchTestSchedules();
      setDeleteTestDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({ open: true, message: "Test schedule deleted", severity: "success" });
    } catch (error) {
      setNotification({ open: true, message: error.toString(), severity: "error" });
    }
  };

  const handleNotificationClose = (event, reason) => {
    if (reason === "clickaway") return;
    setNotification({ ...notification, open: false });
  };

  return (
    <Grid item xs={12}>
      <Card sx={{ backgroundColor: colors.cardBg, boxShadow: `0 4px 12px ${colors.softShadow}` }}>
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
            Test Schedule
          </MDTypography>
        </MDBox>
        <MDBox pt={3} px={3}>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={4}>
              <MDButton
                fullWidth
                variant={errors.selectedClass ? "outlined" : "contained"}
                color={errors.selectedClass ? "error" : "info"}
                onClick={handleClassMenuOpen}
                sx={{
                  backgroundColor: errors.selectedClass ? "transparent" : colors.deepGreen,
                  color: errors.selectedClass ? colors.errorRed : colors.white,
                  borderColor: errors.selectedClass ? colors.errorRed : colors.borderGreen,
                  "&:hover": { backgroundColor: colors.buttonHover },
                }}
              >
                {selectedClassLabel}
              </MDButton>
              <Menu
                anchorEl={classMenuAnchor}
                open={Boolean(classMenuAnchor)}
                onClose={handleClassMenuClose}
                PaperProps={{ sx: { backgroundColor: colors.cardBg } }}
              >
                {classes.map((cls) => (
                  <MenuItem
                    key={cls.id}
                    onClick={() => handleClassSelect(cls.id, cls.name)}
                    sx={{
                      "&:hover": { backgroundColor: colors.tableRowHover },
                      color: colors.darkGray,
                    }}
                  >
                    {cls.name}
                  </MenuItem>
                ))}
              </Menu>
            </Grid>
            <Grid item xs={12} md={4}>
              <MDButton
                fullWidth
                variant={errors.selectedTestType ? "outlined" : "contained"}
                color={errors.selectedTestType ? "error" : "info"}
                onClick={handleTestTypeMenuOpen}
                sx={{
                  backgroundColor: errors.selectedTestType ? "transparent" : colors.deepGreen,
                  color: errors.selectedTestType ? colors.errorRed : colors.white,
                  borderColor: errors.selectedTestType ? colors.errorRed : colors.borderGreen,
                  "&:hover": { backgroundColor: colors.buttonHover },
                }}
              >
                {selectedTestTypeLabel}
              </MDButton>
              <Menu
                anchorEl={testTypeMenuAnchor}
                open={Boolean(testTypeMenuAnchor)}
                onClose={handleTestTypeMenuClose}
                PaperProps={{ sx: { backgroundColor: colors.cardBg } }}
              >
                {testTypes.map((type) => (
                  <MenuItem
                    key={type.id}
                    onClick={() => handleTestTypeSelect(type.id, type.name)}
                    sx={{
                      "&:hover": { backgroundColor: colors.tableRowHover },
                      color: colors.darkGray,
                    }}
                  >
                    {type.name}
                  </MenuItem>
                ))}
              </Menu>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Choose Date"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setErrors({ ...errors, selectedDate: false });
                }}
                InputLabelProps={{ shrink: true }}
                error={errors.selectedDate}
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
          </Grid>
          <MDBox mb={3} display="flex" justifyContent="flex-end">
            <MDButton
              variant="gradient"
              sx={{
                backgroundColor: colors.safeGreen,
                color: colors.white,
                "&:hover": { backgroundColor: colors.highlightGreen },
              }}
              onClick={handleCreateTest}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Create"}
            </MDButton>
          </MDBox>
          {loading ? (
            <MDBox display="flex" justifyContent="center" py={3}>
              <CircularProgress sx={{ color: colors.deepGreen }} />
            </MDBox>
          ) : (
            <DataTable
              table={{ columns: testScheduleColumns, rows: testScheduleRows }}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries={false}
              noEndBorder
              sx={{
                "& .MuiTableHead-root": { backgroundColor: colors.tableHeaderBg },
                "& .MuiTableRow-root:hover": { backgroundColor: colors.tableRowHover },
              }}
            />
          )}
        </MDBox>
      </Card>

      {/* Edit Test Dialog */}
      <Dialog open={editTestDialogOpen} onClose={() => setEditTestDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Edit Test
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <MDButton
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: colors.deepGreen,
                  color: colors.white,
                  "&:hover": { backgroundColor: colors.buttonHover },
                }}
                onClick={handleEditClassMenuOpen}
              >
                {currentEditItem?.className || "Choose Class"}
              </MDButton>
              <Menu
                anchorEl={editClassMenuAnchor}
                open={Boolean(editClassMenuAnchor)}
                onClose={handleEditClassMenuClose}
                PaperProps={{ sx: { backgroundColor: colors.cardBg } }}
              >
                {classes.map((cls) => (
                  <MenuItem
                    key={cls.id}
                    onClick={() => handleEditClassSelect(cls.id, cls.name)}
                    sx={{
                      "&:hover": { backgroundColor: colors.tableRowHover },
                      color: colors.darkGray,
                    }}
                  >
                    {cls.name}
                  </MenuItem>
                ))}
              </Menu>
            </Grid>
            <Grid item xs={12}>
              <MDButton
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: colors.deepGreen,
                  color: colors.white,
                  "&:hover": { backgroundColor: colors.buttonHover },
                }}
                onClick={handleEditTestTypeMenuOpen}
              >
                {currentEditItem?.name || "Choose Test Type"}
              </MDButton>
              <Menu
                anchorEl={editTestTypeMenuAnchor}
                open={Boolean(editTestTypeMenuAnchor)}
                onClose={handleEditTestTypeMenuClose}
                PaperProps={{ sx: { backgroundColor: colors.cardBg } }}
              >
                {testTypes.map((type) => (
                  <MenuItem
                    key={type.id}
                    onClick={() => handleEditTestTypeSelect(type.id, type.name)}
                    sx={{
                      "&:hover": { backgroundColor: colors.tableRowHover },
                      color: colors.darkGray,
                    }}
                  >
                    {type.name}
                  </MenuItem>
                ))}
              </Menu>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Choose Date"
                type="date"
                value={currentEditItem?.date || ""}
                onChange={(e) => setCurrentEditItem({ ...currentEditItem, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
          </Grid>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.paleGreen }}>
          <Button onClick={() => setEditTestDialogOpen(false)} sx={{ color: colors.darkGray }}>
            Cancel
          </Button>
          <Button
            onClick={handleEditTestSave}
            sx={{
              color: colors.white,
              backgroundColor: colors.safeGreen,
              "&:hover": { backgroundColor: colors.highlightGreen },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Test Dialog */}
      <Dialog open={deleteTestDialogOpen} onClose={() => setDeleteTestDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Delete Test
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          <DialogContentText sx={{ color: colors.darkGray }}>
            Are you sure you want to delete the test {currentEditItem?.name} scheduled for{" "}
            {currentEditItem?.date} in {currentEditItem?.className}?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.paleGreen }}>
          <Button onClick={() => setDeleteTestDialogOpen(false)} sx={{ color: colors.darkGray }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTestConfirm}
            sx={{
              color: colors.white,
              backgroundColor: colors.errorRed,
              "&:hover": { backgroundColor: "#FF8787" },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
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
    </Grid>
  );
}

// PropTypes validation
TestSchedule.propTypes = {
  classId: PropTypes.string.isRequired,
  classTestSchedules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      classID: PropTypes.string.isRequired,
      testID: PropTypes.string.isRequired,
      test: PropTypes.shape({
        name: PropTypes.string,
      }),
      class: PropTypes.shape({
        name: PropTypes.string,
      }),
    })
  ),
};

export default TestSchedule;
