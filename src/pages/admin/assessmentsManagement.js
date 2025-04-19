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

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

import DataTable from "examples/Tables/DataTable";
import assessmentService from "services/assessmentService";
import { colors } from "assets/theme/color";

function AssessmentManagement() {
  const [assessmentName, setAssessmentName] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editAssessmentDialogOpen, setEditAssessmentDialogOpen] = useState(false);
  const [deleteAssessmentDialogOpen, setDeleteAssessmentDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({
    assessmentName: false,
    editAssessmentName: false,
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const data = await assessmentService.getAllAssessments();
      const formattedAssessments = data
        .filter((assessment) => !assessment.isDelete) // Chỉ lấy các assessment có isDelete = false
        .map((assessment) => ({
          id: assessment.id,
          name: assessment.name,
          isDelete: assessment.isDelete,
        }));
      setAssessments(formattedAssessments);
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

  const validateAssessmentForm = () => {
    const newErrors = {
      assessmentName: !assessmentName.trim(),
    };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  const validateEditAssessmentForm = () => {
    const newErrors = {
      editAssessmentName: !currentEditItem || !currentEditItem.name.trim(),
    };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleAddAssessment = async () => {
    if (!validateAssessmentForm()) return;

    try {
      const newAssessmentData = {
        name: assessmentName.trim(),
        isDelete: false, // Mặc định isDelete là false khi tạo mới
      };
      setLoading(true);
      await assessmentService.createAssessments(newAssessmentData);
      fetchAssessments();
      setAssessmentName("");
      setNotification({
        open: true,
        message: "Assessment added successfully",
        severity: "success",
      });
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

  const handleEditAssessmentClick = (assessment) => {
    const assessmentToEdit = assessments.find((a) => a.id === assessment.id);
    if (assessmentToEdit) {
      setCurrentEditItem({ ...assessmentToEdit });
      setEditAssessmentDialogOpen(true);
    }
  };

  const handleEditAssessmentSave = async () => {
    if (!validateEditAssessmentForm()) return;

    try {
      const updatedAssessmentData = {
        name: currentEditItem.name.trim(),
        isDelete: currentEditItem.isDelete, // Giữ nguyên isDelete
      };
      await assessmentService.editAssessments(currentEditItem.id, updatedAssessmentData);
      fetchAssessments();
      setEditAssessmentDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({
        open: true,
        message: "Assessment updated successfully",
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

  const handleDeleteAssessmentClick = (assessment) => {
    const assessmentToDelete = assessments.find((a) => a.id === assessment.id);
    if (assessmentToDelete) {
      setCurrentEditItem(assessmentToDelete);
      setDeleteAssessmentDialogOpen(true);
    }
  };

  const handleDeleteAssessmentConfirm = async () => {
    if (!currentEditItem) return;

    try {
      // Thay vì gọi deleteAssessments, gọi editAssessments để cập nhật isDelete thành true
      const updatedAssessmentData = {
        name: currentEditItem.name,
        isDelete: true, // Soft delete
      };
      await assessmentService.editAssessments(currentEditItem.id, updatedAssessmentData);
      fetchAssessments();
      setDeleteAssessmentDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({
        open: true,
        message: "Assessment deleted successfully",
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

  const assessmentColumns = [
    { Header: "Name", accessor: "name", width: "70%" },
    { Header: "Actions", accessor: "actions", width: "30%" },
  ];

  const assessmentRows = assessments.map((assessment) => ({
    name: assessment.name,
    actions: (
      <MDBox display="flex" gap={2}>
        <MDButton
          variant="text"
          sx={{
            backgroundColor: colors.midGreen,
            color: colors.white,
            " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
          }}
          onClick={() => handleEditAssessmentClick(assessment)}
        >
          Edit
        </MDButton>
        <MDButton
          variant="text"
          color="error"
          onClick={() => handleDeleteAssessmentClick(assessment)}
        >
          Delete
        </MDButton>
      </MDBox>
    ),
  }));

  return (
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
          Assessments
        </MDTypography>
      </MDBox>
      <MDBox pt={3} px={3}>
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4}>
            <MDInput
              fullWidth
              label="Assessment Name"
              value={assessmentName}
              onChange={(e) => {
                setAssessmentName(e.target.value);
                setErrors({ ...errors, assessmentName: false });
              }}
              error={errors.assessmentName}
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
            {/* Placeholder để giữ layout giống Test Schedule */}
          </Grid>
          <Grid item xs={12} md={4}>
            {/* Placeholder để giữ layout giống Test Schedule */}
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
            onClick={handleAddAssessment}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Add"}
          </MDButton>
        </MDBox>
        {loading ? (
          <MDBox display="flex" justifyContent="center" py={3}>
            <CircularProgress sx={{ color: colors.deepGreen }} />
          </MDBox>
        ) : (
          <DataTable
            table={{ columns: assessmentColumns, rows: assessmentRows }}
            isSorted={false}
            entriesPerPage={{ defaultValue: 3, entries: [3, 5, 10] }}
            showTotalEntries={false}
            noEndBorder
            sx={{
              "& .MuiTableHead-root": { backgroundColor: colors.tableHeaderBg },
              "& .MuiTableRow-root:hover": { backgroundColor: colors.tableRowHover },
              "& .MuiPagination-root": {
                mt: 2,
                display: "flex",
                justifyContent: "center",
              },
              "& .MuiPaginationItem-root": {
                borderRadius: "50%",
                color: colors.darkGray,
                "&.Mui-selected": {
                  backgroundColor: colors.deepGreen,
                  color: colors.white,
                },
                "&:hover": {
                  backgroundColor: colors.midGreen,
                  color: colors.white,
                },
              },
            }}
          />
        )}
      </MDBox>

      {/* Edit Assessment Dialog */}
      <Dialog open={editAssessmentDialogOpen} onClose={() => setEditAssessmentDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Edit Assessment
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          <TextField
            autoFocus
            margin="dense"
            label="Assessment Name"
            type="text"
            fullWidth
            value={currentEditItem?.name || ""}
            onChange={(e) => setCurrentEditItem({ ...currentEditItem, name: e.target.value })}
            error={errors.editAssessmentName}
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
          <Button
            onClick={() => setEditAssessmentDialogOpen(false)}
            sx={{ color: colors.darkGray }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditAssessmentSave}
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

      {/* Delete Assessment Dialog */}
      <Dialog
        open={deleteAssessmentDialogOpen}
        onClose={() => setDeleteAssessmentDialogOpen(false)}
      >
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Delete Assessment
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          <DialogContentText sx={{ color: colors.darkGray }}>
            Are you sure you want to delete the assessment “{currentEditItem?.name}”?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.paleGreen }}>
          <Button
            onClick={() => setDeleteAssessmentDialogOpen(false)}
            sx={{ color: colors.darkGray }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAssessmentConfirm}
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
    </Card>
  );
}

export default AssessmentManagement;
