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
import { colors } from "assets/theme/color";
import testSkillService from "services/testSkillService";

function TestSkillManagement() {
  // State cho form inputs
  const [testSkillName, setTestSkillName] = useState("");
  const [testSkills, setTestSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [editTestSkillDialogOpen, setEditTestSkillDialogOpen] = useState(false);
  const [deleteTestSkillDialogOpen, setDeleteTestSkillDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Validation states
  const [errors, setErrors] = useState({
    testSkillName: false,
    editTestSkillName: false,
  });

  // Fetch test skills khi component mount
  useEffect(() => {
    fetchTestSkills();
  }, []);

  // Fetch test skills từ API
  const fetchTestSkills = async () => {
    setLoading(true);
    try {
      const data = await testSkillService.getAllTestSkill();
      setTestSkills(data);
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

  // Chuẩn bị dữ liệu cho bảng
  const testSkillColumns = [
    { Header: "Name", accessor: "name", width: "70%" },
    { Header: "Actions", accessor: "actions", width: "30%" },
  ];

  const testSkillRows =
    testSkills.length > 0
      ? testSkills.map((testSkill) => ({
          name: testSkill.name,
          actions: (
            <MDBox display="flex" gap={2}>
              <MDButton
                variant="text"
                sx={{ color: colors.deepGreen, " &:hover": { color: colors.highlightGreen } }}
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
      : // Nếu không có dữ liệu, hiển thị "No Data"
        [
          {
            name: "No Data",
            actions: "",
          },
        ];

  // Validate form inputs
  const validateTestSkillForm = () => {
    const newErrors = {
      testSkillName: !testSkillName.trim(),
    };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  const validateEditTestSkillForm = () => {
    const newErrors = {
      editTestSkillName: !currentEditItem || !currentEditItem.name.trim(),
    };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  // Handlers cho test skills
  const handleAddTestSkill = async () => {
    if (!validateTestSkillForm()) return;

    if (testSkills.some((s) => s.name.toLowerCase() === testSkillName.trim().toLowerCase())) {
      setNotification({
        open: true,
        message: "Test skill with this name already exists",
        severity: "error",
      });
      return;
    }

    try {
      const newTestSkillData = {
        name: testSkillName.trim(),
      };

      await testSkillService.createTestSkill(newTestSkillData);
      fetchTestSkills();
      setTestSkillName("");
      setNotification({
        open: true,
        message: "Test skill added successfully",
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
      setNotification({
        open: true,
        message: "Test skill with this name already exists",
        severity: "error",
      });
      return;
    }

    try {
      const updatedTestSkillData = {
        name: currentEditItem.name.trim(),
      };

      await testSkillService.editTestSkill(currentEditItem.id, updatedTestSkillData);
      fetchTestSkills();
      setEditTestSkillDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({
        open: true,
        message: "Test skill updated successfully",
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
      setNotification({
        open: true,
        message: "Test skill deleted successfully",
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3} bgColor={colors.gray}>
        <Grid container spacing={6}>
          {/* Form thêm test skill */}
          <Grid item xs={12}>
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
                  Add Test Skill
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={3}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={10}>
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
                  <Grid item xs={12} md={2}>
                    <MDButton
                      variant="gradient"
                      sx={{
                        backgroundColor: colors.safeGreen,
                        color: colors.white,
                        "&:hover": { backgroundColor: colors.highlightGreen },
                      }}
                      onClick={handleAddTestSkill}
                      fullWidth
                      disabled={loading} // Vô hiệu hóa nút khi đang loading
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : "Add"}
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>

          {/* Test Skills Table */}
          <Grid item xs={12}>
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
              <MDBox pt={3} px={3} pb={3} display="flex" justifyContent="center">
                {loading ? (
                  <CircularProgress sx={{ color: colors.deepGreen }} />
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
            disabled={loading} // Vô hiệu hóa nút khi đang loading
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
            Are you sure you want to delete the test skill “{currentEditItem?.name}”? This action
            cannot be undone.
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
            disabled={loading} // Vô hiệu hóa nút khi đang loading
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

export default TestSkillManagement;
