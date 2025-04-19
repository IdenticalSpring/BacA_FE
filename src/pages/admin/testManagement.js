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
import CircularProgress from "@mui/material/CircularProgress"; // Thêm CircularProgress cho loading
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
import testSkillService from "services/testSkillService"; // Thêm service cho TestSkill
import { colors } from "assets/theme/color";
import AssessmentManagement from "./assessmentsManagement";

function TestManagement() {
  // State cho Test Schedules
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClassLabel, setSelectedClassLabel] = useState("Choose Class");
  const [selectedTestType, setSelectedTestType] = useState("");
  const [selectedTestTypeLabel, setSelectedTestTypeLabel] = useState("Choose Test Type");
  const [selectedDate, setSelectedDate] = useState("");

  // State cho Test Types
  const [newTestTypeName, setNewTestTypeName] = useState("");
  const [testTypes, setTestTypes] = useState([]);

  // State cho Test Skills
  const [testSkillName, setTestSkillName] = useState("");
  const [testSkills, setTestSkills] = useState([]);

  // State chung
  const [classes, setClasses] = useState([]);
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
  const [editTestSkillDialogOpen, setEditTestSkillDialogOpen] = useState(false); // Thêm cho TestSkill
  const [deleteTestSkillDialogOpen, setDeleteTestSkillDialogOpen] = useState(false); // Thêm cho TestSkill
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
    testSkillName: false, // Thêm cho TestSkill
    editTestSkillName: false, // Thêm cho TestSkill
  });

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch tất cả dữ liệu từ API
  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchClasses(),
        fetchTestTypes(),
        fetchTestSchedules(),
        fetchTestSkills(),
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
      const activeClasses = data.filter((cls) => !cls.isDelete);
      setClasses(activeClasses);
      return activeClasses;
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
      const schedules = data.map((test) => ({
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

  const fetchTestSkills = async () => {
    try {
      const data = await testSkillService.getAllTestSkill();
      setTestSkills(data);
      return data;
    } catch (error) {
      console.error("Error fetching test skills:", error);
      throw error;
    }
  };

  // Menu handlers cho Test Schedules
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

  // Edit menu handlers
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

  // Chuẩn bị dữ liệu cho các bảng
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

  const testSkillColumns = [
    { Header: "Name", accessor: "name", width: "70%" },
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

  const testTypeRows = testTypes.map((type) => ({
    name: type.name,
    actions: (
      <MDBox display="flex" gap={2}>
        <MDButton
          variant="text"
          sx={{
            backgroundColor: colors.midGreen,
            color: colors.white,
            " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
          }}
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

  const testSkillRows =
    testSkills.length > 0
      ? testSkills.map((testSkill) => ({
          name: testSkill.name,
          actions: (
            <MDBox display="flex" gap={2}>
              <MDButton
                variant="text"
                sx={{
                  backgroundColor: colors.midGreen,
                  color: colors.white,
                  " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                }}
                onClick={() => handleEditTestSkillClick(testSkill)}
              >
                Edit
              </MDButton>
              <MDButton
                variant="text"
                color="error"
                onClick={() => handleDeleteTestSkillClick(testSkill)}
              >
                Delete
              </MDButton>
            </MDBox>
          ),
        }))
      : [{ name: "No Data", actions: "" }];

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
    const newErrors = { newTestTypeName: !newTestTypeName.trim() };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  const validateEditTestTypeForm = () => {
    const newErrors = { editTestTypeName: !currentEditItem || !currentEditItem.name.trim() };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  const validateTestSkillForm = () => {
    const newErrors = { testSkillName: !testSkillName.trim() };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  const validateEditTestSkillForm = () => {
    const newErrors = { editTestSkillName: !currentEditItem || !currentEditItem.name.trim() };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  // Handlers cho Test Schedules
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

  // Handlers cho Test Types
  const handleAddTestType = async () => {
    if (!validateTestTypeForm()) return;

    if (
      testTypes.some((type) => type.name.toLowerCase() === newTestTypeName.trim().toLowerCase())
    ) {
      setNotification({ open: true, message: "Test type already exists", severity: "error" });
      return;
    }

    try {
      const newTestTypeData = { name: newTestTypeName.trim(), type: "type" };
      await testService.createTest(newTestTypeData);
      fetchTestTypes();
      setNewTestTypeName("");
      setNotification({ open: true, message: "Test type added", severity: "success" });
    } catch (error) {
      setNotification({ open: true, message: error.toString(), severity: "error" });
    }
  };

  const handleEditTestTypeClick = (type) => {
    setCurrentEditItem({ ...type });
    setEditTestTypeDialogOpen(true);
  };

  const handleEditTestTypeSave = async () => {
    if (!validateEditTestTypeForm()) return;

    if (
      testTypes.some(
        (type) =>
          type.id !== currentEditItem.id &&
          type.name.toLowerCase() === currentEditItem.name.trim().toLowerCase()
      )
    ) {
      setNotification({ open: true, message: "Test type already exists", severity: "error" });
      return;
    }

    try {
      const updatedTestTypeData = { name: currentEditItem.name.trim() };
      await testService.editTest(currentEditItem.id, updatedTestTypeData);
      fetchData();
      setEditTestTypeDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({ open: true, message: "Test type updated", severity: "success" });
    } catch (error) {
      setNotification({ open: true, message: error.toString(), severity: "error" });
    }
  };

  const handleDeleteTestTypeClick = (type) => {
    setCurrentEditItem(type);
    setDeleteTestTypeDialogOpen(true);
  };

  const handleDeleteTestTypeConfirm = async () => {
    if (!currentEditItem) return;

    if (testSchedules.some((test) => test.testID === currentEditItem.id)) {
      setNotification({ open: true, message: "Test type is in use", severity: "error" });
      setDeleteTestTypeDialogOpen(false);
      setCurrentEditItem(null);
      return;
    }

    try {
      await testService.deleteTest(currentEditItem.id);
      fetchTestTypes();
      setDeleteTestTypeDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({ open: true, message: "Test type deleted", severity: "success" });
    } catch (error) {
      setNotification({ open: true, message: error.toString(), severity: "error" });
    }
  };

  // Handlers cho Test Skills
  const handleAddTestSkill = async () => {
    if (!validateTestSkillForm()) return;

    if (testSkills.some((s) => s.name.toLowerCase() === testSkillName.trim().toLowerCase())) {
      setNotification({ open: true, message: "Test skill already exists", severity: "error" });
      return;
    }

    try {
      const newTestSkillData = { name: testSkillName.trim() };
      await testSkillService.createTestSkill(newTestSkillData);
      fetchTestSkills();
      setTestSkillName("");
      setNotification({ open: true, message: "Test skill added", severity: "success" });
    } catch (error) {
      setNotification({ open: true, message: error.toString(), severity: "error" });
    }
  };

  const handleEditTestSkillClick = (testSkill) => {
    setCurrentEditItem({ ...testSkill });
    setEditTestSkillDialogOpen(true);
  };

  const handleEditTestSkillSave = async () => {
    if (!validateEditTestSkillForm()) return;

    if (
      testSkills.some(
        (s) =>
          s.id !== currentEditItem.id &&
          s.name.toLowerCase() === currentEditItem.name.trim().toLowerCase()
      )
    ) {
      setNotification({ open: true, message: "Test skill already exists", severity: "error" });
      return;
    }

    try {
      const updatedTestSkillData = { name: currentEditItem.name.trim() };
      await testSkillService.editTestSkill(currentEditItem.id, updatedTestSkillData);
      fetchTestSkills();
      setEditTestSkillDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({ open: true, message: "Test skill updated", severity: "success" });
    } catch (error) {
      setNotification({ open: true, message: error.toString(), severity: "error" });
    }
  };

  const handleDeleteTestSkillClick = (testSkill) => {
    setCurrentEditItem(testSkill);
    setDeleteTestSkillDialogOpen(true);
  };

  const handleDeleteTestSkillConfirm = async () => {
    if (!currentEditItem) return;

    try {
      await testSkillService.deleteTestSkill(currentEditItem.id);
      fetchTestSkills();
      setDeleteTestSkillDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({ open: true, message: "Test skill deleted", severity: "success" });
    } catch (error) {
      setNotification({ open: true, message: error.toString(), severity: "error" });
    }
  };

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
            <AssessmentManagement />
          </Grid>

          {/* Right Column - Test Types và Test Skills */}
          <Grid item xs={12} md={6}>
            {/* Test Types */}
            <Card
              sx={{
                backgroundColor: colors.cardBg,
                boxShadow: `0 4px 12px ${colors.softShadow}`,
                mb: 6,
              }}
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
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : "Add"}
                    </MDButton>
                  </Grid>
                </Grid>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" py={3}>
                    <CircularProgress sx={{ color: colors.deepGreen }} />
                  </MDBox>
                ) : (
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
                )}
              </MDBox>
            </Card>

            {/* Test Skills */}
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
                  Test Skills
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3}>
                <Grid container spacing={2} mb={3} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <MDInput
                      fullWidth
                      label="Test Skill Name"
                      value={testSkillName}
                      onChange={(e) => {
                        setTestSkillName(e.target.value);
                        setErrors({ ...errors, testSkillName: false });
                      }}
                      error={errors.testSkillName}
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
                      onClick={handleAddTestSkill}
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : "Add"}
                    </MDButton>
                  </Grid>
                </Grid>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" py={3}>
                    <CircularProgress sx={{ color: colors.deepGreen }} />
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns: testSkillColumns, rows: testSkillRows }}
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
            Are you sure you want to delete the test “{currentEditItem?.name}” scheduled for{" "}
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Save"}
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
            Are you sure you want to delete the test type “{currentEditItem?.name}”?
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Test Skill Dialog */}
      <Dialog open={editTestSkillDialogOpen} onClose={() => setEditTestSkillDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Edit Test Skill
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          <TextField
            autoFocus
            margin="dense"
            label="Test Skill Name"
            type="text"
            fullWidth
            value={currentEditItem?.name || ""}
            onChange={(e) => setCurrentEditItem({ ...currentEditItem, name: e.target.value })}
            error={errors.editTestSkillName}
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
          <Button onClick={() => setEditTestSkillDialogOpen(false)} sx={{ color: colors.darkGray }}>
            Cancel
          </Button>
          <Button
            onClick={handleEditTestSkillSave}
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

      {/* Delete Test Skill Dialog */}
      <Dialog open={deleteTestSkillDialogOpen} onClose={() => setDeleteTestSkillDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Delete Test Skill
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          <DialogContentText sx={{ color: colors.darkGray }}>
            Are you sure you want to delete the test skill “{currentEditItem?.name}”?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.paleGreen }}>
          <Button
            onClick={() => setDeleteTestSkillDialogOpen(false)}
            sx={{ color: colors.darkGray }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTestSkillConfirm}
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

      <Footer />
    </DashboardLayout>
  );
}

export default TestManagement;
