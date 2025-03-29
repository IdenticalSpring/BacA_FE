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
import CircularProgress from "@mui/material/CircularProgress";
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
import levelService from "services/levelService";

function LevelManagement() {
  // State cho form inputs
  const [levelName, setLevelName] = useState("");
  const [levelDescription, setLevelDescription] = useState(""); // Thêm state cho description
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [editLevelDialogOpen, setEditLevelDialogOpen] = useState(false);
  const [deleteLevelDialogOpen, setDeleteLevelDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Validation states
  const [errors, setErrors] = useState({
    levelName: false,
    levelDescription: false, // Thêm validation cho description
    editLevelName: false,
  });

  // Fetch levels khi component mount
  useEffect(() => {
    fetchLevels();
  }, []);

  // Fetch levels từ API
  const fetchLevels = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  // Chuẩn bị dữ liệu cho bảng
  const levelColumns = [
    { Header: "Name", accessor: "name", width: "70%" },
    { Header: "Actions", accessor: "actions", width: "30%" },
  ];

  const levelRows =
    levels.length > 0
      ? levels.map((level) => ({
          name: level.name,
          actions: (
            <MDBox display="flex" gap={2}>
              <MDButton
                variant="text"
                sx={{ color: colors.deepGreen, " &:hover": { color: colors.highlightGreen } }}
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

  // Validate form inputs
  const validateLevelForm = () => {
    const newErrors = {
      levelName: !levelName.trim(),
      levelDescription: !levelDescription.trim(), // Validation cho description
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

  // Handlers cho levels
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
        description: levelDescription.trim(), // Thêm description vào dữ liệu gửi lên
      };

      await levelService.createLevel(newLevelData);
      fetchLevels();
      setLevelName("");
      setLevelDescription(""); // Reset description sau khi thêm
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3} bgColor={colors.gray}>
        <Grid container spacing={6}>
          {/* Form thêm level */}
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
                  Add Level
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
                  <Grid item xs={12} md={5}>
                    <MDInput
                      fullWidth
                      label="Description"
                      value={levelDescription}
                      onChange={(e) => {
                        setLevelDescription(e.target.value);
                        setErrors({ ...errors, levelDescription: false });
                      }}
                      error={errors.levelDescription}
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
                      onClick={handleAddLevel}
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} color="inherit" /> : "Add"}
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>

          {/* Levels Table */}
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
                  Levels
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={3} display="flex" justifyContent="center">
                {loading ? (
                  <CircularProgress sx={{ color: colors.deepGreen }} />
                ) : (
                  <DataTable
                    table={{ columns: levelColumns, rows: levelRows }}
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

      {/* Edit Level Dialog */}
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Level Dialog */}
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

export default LevelManagement;
