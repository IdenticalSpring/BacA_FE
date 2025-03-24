// @mui material components
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
import { useState, useEffect } from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Services
import testService from "services/testService";
import classTestScheduleService from "services/classTestScheduleService";
import classService from "services/classService";
import { colors } from "assets/theme/color";

function TestManagement() {
  // State for form inputs
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClassLabel, setSelectedClassLabel] = useState("Choose Class");
  const [selectedTestType, setSelectedTestType] = useState("");
  const [selectedTestTypeLabel, setSelectedTestTypeLabel] = useState("Choose Test Type");
  const [selectedDate, setSelectedDate] = useState("");
  const [newTestTypeName, setNewTestTypeName] = useState("");

  // State for test schedules and types
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
  const [editTestTypeDialogOpen, setEditTestTypeDialogOpen] = useState(false);
  const [deleteTestTypeDialogOpen, setDeleteTestTypeDialogOpen] = useState(false);
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
    newTestTypeName: false,
    editTestTypeName: false,
  });

  // Fetch test data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all data from APIs
  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchClasses(), fetchTestTypes(), fetchTestSchedules()]);
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
      console.log("Data", data);
      // Filter out deleted classes if needed
      const activeClasses = data.filter((cls) => !cls.isDelete);
      setClasses(activeClasses);
      return activeClasses;
    } catch (error) {
      console.error("Error fetching classes:", error);
      throw error;
    }
  };

  // Fetch test types from API
  const fetchTestTypes = async () => {
    try {
      const data = await testService.getAllTest();
      const types = data;
      setTestTypes(types);
      return types;
    } catch (error) {
      console.error("Error fetching test types:", error);
      throw error;
    }
  };

  // Fetch test schedules from API
  const fetchTestSchedules = async () => {
    try {
      const data = await classTestScheduleService.getAllClassTestSchedule();

      // Map the data to match our component's expected format
      const schedules = data.map((test) => ({
        id: test.id,
        name: test.test?.name || "Unknown Test",
        date: new Date(test.date).toISOString().split("T")[0], // Format date as YYYY-MM-DD
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
  const handleClassMenuOpen = (event) => {
    setClassMenuAnchor(event.currentTarget);
  };

  const handleClassMenuClose = () => {
    setClassMenuAnchor(null);
  };

  const handleClassSelect = (classId, className) => {
    setSelectedClass(classId);
    setSelectedClassLabel(className);
    setErrors({ ...errors, selectedClass: false });
    handleClassMenuClose();
  };

  const handleTestTypeMenuOpen = (event) => {
    setTestTypeMenuAnchor(event.currentTarget);
  };

  const handleTestTypeMenuClose = () => {
    setTestTypeMenuAnchor(null);
  };

  const handleTestTypeSelect = (typeId, typeName) => {
    setSelectedTestType(typeId);
    setSelectedTestTypeLabel(typeName);
    setErrors({ ...errors, selectedTestType: false });
    handleTestTypeMenuClose();
  };

  // Edit menu handlers
  const handleEditClassMenuOpen = (event) => {
    setEditClassMenuAnchor(event.currentTarget);
  };

  const handleEditClassMenuClose = () => {
    setEditClassMenuAnchor(null);
  };

  const handleEditClassSelect = (classId, className) => {
    setCurrentEditItem({ ...currentEditItem, classID: classId, className: className });
    handleEditClassMenuClose();
  };

  const handleEditTestTypeMenuOpen = (event) => {
    setEditTestTypeMenuAnchor(event.currentTarget);
  };

  const handleEditTestTypeMenuClose = () => {
    setEditTestTypeMenuAnchor(null);
  };

  const handleEditTestTypeSelect = (typeId, typeName) => {
    setCurrentEditItem({ ...currentEditItem, testID: typeId, name: typeName });
    handleEditTestTypeMenuClose();
  };

  // Prepare data for tables
  const testScheduleColumns = [
    { Header: "Name", accessor: "name", width: "25%" },
    { Header: "Date", accessor: "date", width: "20%" },
    { Header: "Class Name", accessor: "className", width: "25%" },
    { Header: "Actions", accessor: "actions", width: "30%" },
  ];

  const testTypeColumns = [
    { Header: "Name", accessor: "name", width: "70%" },
    { Header: "Actions", accessor: "actions", width: "30%" },
  ];

  // Generate table rows for test schedules
  const testScheduleRows = testSchedules.map((test) => ({
    name: test.name,
    date: test.date,
    className: test.className,
    actions: (
      <MDBox display="flex" gap={2}>
        <MDButton
          variant="text"
          sx={{ color: colors.deepGreen, " &:hover": { color: colors.highlightGreen } }}
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

  // Generate table rows for test types
  const testTypeRows = testTypes.map((type) => ({
    name: type.name,
    actions: (
      <MDBox display="flex" gap={2}>
        <MDButton
          variant="text"
          sx={{ color: colors.deepGreen, " &:hover": { color: colors.highlightGreen } }}
          onClick={() => handleEditTestTypeClick(type)}
        >
          Edit
        </MDButton>
        <MDButton variant="text" color="error" onClick={() => handleDeleteTestTypeClick(type)}>
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

  const validateTestTypeForm = () => {
    const newErrors = {
      newTestTypeName: !newTestTypeName.trim(),
    };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  const validateEditTestTypeForm = () => {
    const newErrors = {
      editTestTypeName: !currentEditItem || !currentEditItem.name.trim(),
    };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  // Handlers for test schedule
  const handleCreateTest = async () => {
    if (!validateTestForm()) return;

    const selectedClassObj = classes.find((cls) => cls.id === selectedClass);
    const selectedTestTypeObj = testTypes.find((type) => type.id === selectedTestType);

    if (!selectedClassObj || !selectedTestTypeObj) {
      setNotification({
        open: true,
        message: "Invalid class or test type selection",
        severity: "error",
      });
      return;
    }

    try {
      const newTestData = {
        date: selectedDate,
        classID: selectedClass,
        testID: selectedTestType,
      };

      await classTestScheduleService.createClassTestSchedule(newTestData);

      // Refresh the test schedules
      fetchTestSchedules();

      // Reset form
      setSelectedClass("");
      setSelectedClassLabel("Choose Class");
      setSelectedTestType("");
      setSelectedTestTypeLabel("Choose Test Type");
      setSelectedDate("");

      setNotification({
        open: true,
        message: "Test schedule created successfully",
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

  const handleEditTestClick = (test) => {
    const testSchedule = testSchedules.find(
      (t) =>
        t.id === test.id ||
        (t.name === test.name && t.date === test.date && t.className === test.className)
    );

    if (testSchedule) {
      setCurrentEditItem({
        ...testSchedule,
        classID: testSchedule.classID,
        testID: testSchedule.testID,
        date: testSchedule.date,
      });
      setEditTestDialogOpen(true);
    }
  };

  const handleEditTestSave = async () => {
    if (!currentEditItem) return;

    const selectedClassObj = classes.find((cls) => cls.id === currentEditItem.classID);
    const selectedTestTypeObj = testTypes.find((type) => type.id === currentEditItem.testID);

    if (!selectedClassObj || !selectedTestTypeObj || !currentEditItem.date) {
      setNotification({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    try {
      const updatedTestData = {
        date: currentEditItem.date,
        classID: currentEditItem.classID,
        testID: currentEditItem.testID,
      };

      await classTestScheduleService.editClassTestSchedule(currentEditItem.id, updatedTestData);

      // Refresh the test schedules
      fetchTestSchedules();

      setEditTestDialogOpen(false);
      setCurrentEditItem(null);

      setNotification({
        open: true,
        message: "Test schedule updated successfully",
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

  const handleDeleteTestClick = (test) => {
    const testSchedule = testSchedules.find(
      (t) =>
        t.id === test.id ||
        (t.name === test.name && t.date === test.date && t.className === test.className)
    );

    if (testSchedule) {
      setCurrentEditItem(testSchedule);
      setDeleteTestDialogOpen(true);
    }
  };

  const handleDeleteTestConfirm = async () => {
    if (!currentEditItem) return;

    try {
      await classTestScheduleService.deleteClassTestSchedule(currentEditItem.id);

      // Refresh the test schedules
      fetchTestSchedules();

      setDeleteTestDialogOpen(false);
      setCurrentEditItem(null);

      setNotification({
        open: true,
        message: "Test schedule deleted successfully",
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

  // Handlers for test types
  const handleAddTestType = async () => {
    if (!validateTestTypeForm()) return;

    // Check if the test type already exists
    if (
      testTypes.some((type) => type.name.toLowerCase() === newTestTypeName.trim().toLowerCase())
    ) {
      setNotification({
        open: true,
        message: "Test type with this name already exists",
        severity: "error",
      });
      return;
    }

    try {
      const newTestTypeData = {
        name: newTestTypeName.trim(),
        type: "type",
      };

      await testService.createTest(newTestTypeData);

      // Refresh the test types
      fetchTestTypes();

      setNewTestTypeName("");

      setNotification({
        open: true,
        message: "Test type added successfully",
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

  const handleEditTestTypeClick = (type) => {
    setCurrentEditItem({ ...type });
    setEditTestTypeDialogOpen(true);
  };

  const handleEditTestTypeSave = async () => {
    if (!validateEditTestTypeForm()) return;

    // Check if the edited name already exists for another test type
    if (
      testTypes.some(
        (type) =>
          type.id !== currentEditItem.id &&
          type.name.toLowerCase() === currentEditItem.name.trim().toLowerCase()
      )
    ) {
      setNotification({
        open: true,
        message: "Test type with this name already exists",
        severity: "error",
      });
      return;
    }

    try {
      const updatedTestTypeData = {
        name: currentEditItem.name.trim(),
      };

      await testService.editTest(currentEditItem.id, updatedTestTypeData);

      // Refresh data to update both test types and any test schedules using this type
      fetchData();

      setEditTestTypeDialogOpen(false);
      setCurrentEditItem(null);

      setNotification({
        open: true,
        message: "Test type updated successfully",
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

  const handleDeleteTestTypeClick = (type) => {
    setCurrentEditItem(type);
    setDeleteTestTypeDialogOpen(true);
  };

  const handleDeleteTestTypeConfirm = async () => {
    if (!currentEditItem) return;

    // Check if the test type is being used in any test schedule
    const typeInUse = testSchedules.some((test) => test.testID === currentEditItem.id);
    if (typeInUse) {
      setNotification({
        open: true,
        message: "Cannot delete test type that is being used in a test schedule",
        severity: "error",
      });
      setDeleteTestTypeDialogOpen(false);
      setCurrentEditItem(null);
      return;
    }

    try {
      await testService.deleteTest(currentEditItem.id);

      // Refresh the test types
      fetchTestTypes();

      setDeleteTestTypeDialogOpen(false);
      setCurrentEditItem(null);

      setNotification({
        open: true,
        message: "Test type deleted successfully",
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

  // Handle notification close
  const handleNotificationClose = (event, reason) => {
    if (reason === "clickaway") return;
    setNotification({ ...notification, open: false });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3} bgColor={colors.gray}>
        <Grid container spacing={6}>
          {/* Left Column - Test Schedule */}
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
                  >
                    Create
                  </MDButton>
                </MDBox>
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
              </MDBox>
            </Card>
          </Grid>

          {/* Right Column - Test Types */}
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
                  Test Types
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3}>
                <Grid container spacing={2} mb={3} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <MDInput
                      fullWidth
                      label="Test Type Name"
                      value={newTestTypeName}
                      onChange={(e) => {
                        setNewTestTypeName(e.target.value);
                        setErrors({ ...errors, newTestTypeName: false });
                      }}
                      error={errors.newTestTypeName}
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
                  <Grid item xs={12} md={4}>
                    <MDButton
                      variant="gradient"
                      sx={{
                        backgroundColor: colors.safeGreen,
                        color: colors.white,
                        "&:hover": { backgroundColor: colors.highlightGreen },
                      }}
                      onClick={handleAddTestType}
                      fullWidth
                    >
                      Add
                    </MDButton>
                  </Grid>
                </Grid>
                <DataTable
                  table={{ columns: testTypeColumns, rows: testTypeRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                  sx={{
                    "& .MuiTableHead-root": { backgroundColor: colors.tableHeaderBg },
                    "& .MuiTableRow-root:hover": { backgroundColor: colors.tableRowHover },
                  }}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

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
          >
            Save
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
            Are you sure you want to delete the test &ldquo;{currentEditItem?.name}&rdquo; scheduled
            for {currentEditItem?.date} in {currentEditItem?.className}?
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
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Test Type Dialog */}
      <Dialog open={editTestTypeDialogOpen} onClose={() => setEditTestTypeDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Edit Test Type
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          <TextField
            autoFocus
            margin="dense"
            label="Test Type Name"
            type="text"
            fullWidth
            value={currentEditItem?.name || ""}
            onChange={(e) => setCurrentEditItem({ ...currentEditItem, name: e.target.value })}
            error={errors.editTestTypeName}
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
          <Button onClick={() => setEditTestTypeDialogOpen(false)} sx={{ color: colors.darkGray }}>
            Cancel
          </Button>
          <Button
            onClick={handleEditTestTypeSave}
            sx={{
              color: colors.white,
              backgroundColor: colors.safeGreen,
              "&:hover": { backgroundColor: colors.highlightGreen },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Test Type Dialog */}
      <Dialog open={deleteTestTypeDialogOpen} onClose={() => setDeleteTestTypeDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Delete Test Type
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          <DialogContentText sx={{ color: colors.darkGray }}>
            Are you sure you want to delete the test type &ldquo;{currentEditItem?.name}&rdquo;?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.paleGreen }}>
          <Button
            onClick={() => setDeleteTestTypeDialogOpen(false)}
            sx={{ color: colors.darkGray }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTestTypeConfirm}
            sx={{
              color: colors.white,
              backgroundColor: colors.errorRed,
              "&:hover": { backgroundColor: "#FF8787" },
            }}
          >
            Delete
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

      <Footer />
    </DashboardLayout>
  );
}

export default TestManagement;
