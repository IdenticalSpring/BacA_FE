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
import skillService from "services/skillService";
import { colors } from "assets/theme/color";

function EvaluationManagement() {
  // State for form inputs
  const [skillName, setSkillName] = useState("");
  const [skillType, setSkillType] = useState(""); // 1 for Skill, 0 for Behavior
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [editSkillDialogOpen, setEditSkillDialogOpen] = useState(false);
  const [deleteSkillDialogOpen, setDeleteSkillDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Validation states
  const [errors, setErrors] = useState({
    skillName: false,
    skillType: false,
    editSkillName: false,
    editSkillType: false,
  });

  // Fetch skills on component mount
  useEffect(() => {
    fetchSkills();
  }, []);

  // Fetch skills from API
  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await skillService.getAllSkill();
      setSkills(data);
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

  // Prepare data for tables
  const skillColumns = [
    { Header: "Name", accessor: "name", width: "70%" },
    { Header: "Actions", accessor: "actions", width: "30%" },
  ];

  const skillRows = skills
    .filter((skill) => skill.type === 1)
    .map((skill) => ({
      name: skill.name,
      actions: (
        <MDBox display="flex" gap={2}>
          <MDButton
            variant="text"
            sx={{ color: colors.deepGreen, " &:hover": { color: colors.highlightGreen } }}
            onClick={() => handleEditSkillClick(skill)}
          >
            Edit
          </MDButton>
          <MDButton variant="text" color="error" onClick={() => handleDeleteSkillClick(skill)}>
            Delete
          </MDButton>
        </MDBox>
      ),
    }));

  const behaviorRows = skills
    .filter((skill) => skill.type === 0)
    .map((skill) => ({
      name: skill.name,
      actions: (
        <MDBox display="flex" gap={2}>
          <MDButton
            variant="text"
            sx={{ color: colors.deepGreen, " &:hover": { color: colors.highlightGreen } }}
            onClick={() => handleEditSkillClick(skill)}
          >
            Edit
          </MDButton>
          <MDButton variant="text" color="error" onClick={() => handleDeleteSkillClick(skill)}>
            Delete
          </MDButton>
        </MDBox>
      ),
    }));

  // Validate form inputs
  const validateSkillForm = () => {
    const newErrors = {
      skillName: !skillName.trim(),
      skillType: skillType === "",
    };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  const validateEditSkillForm = () => {
    const newErrors = {
      editSkillName: !currentEditItem || !currentEditItem.name.trim(),
      editSkillType: !currentEditItem || currentEditItem.type === "",
    };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  // Handlers for skills
  const handleAddSkill = async () => {
    if (!validateSkillForm()) return;

    if (skills.some((s) => s.name.toLowerCase() === skillName.trim().toLowerCase())) {
      setNotification({
        open: true,
        message: "Skill with this name already exists",
        severity: "error",
      });
      return;
    }

    try {
      const newSkillData = {
        name: skillName.trim(),
        type: parseInt(skillType, 10),
      };

      await skillService.createSkill(newSkillData);
      fetchSkills();
      setSkillName("");
      setSkillType("");
      setNotification({
        open: true,
        message: "Skill added successfully",
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

  const handleEditSkillClick = (skill) => {
    setCurrentEditItem({ ...skill });
    setEditSkillDialogOpen(true);
  };

  const handleEditSkillSave = async () => {
    if (!validateEditSkillForm()) return;

    if (
      skills.some(
        (s) =>
          s.id !== currentEditItem.id &&
          s.name.toLowerCase() === currentEditItem.name.trim().toLowerCase()
      )
    ) {
      setNotification({
        open: true,
        message: "Skill with this name already exists",
        severity: "error",
      });
      return;
    }

    try {
      const updatedSkillData = {
        name: currentEditItem.name.trim(),
        type: parseInt(currentEditItem.type, 10),
      };

      await skillService.editSkill(currentEditItem.id, updatedSkillData);
      fetchSkills();
      setEditSkillDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({
        open: true,
        message: "Skill updated successfully",
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

  const handleDeleteSkillClick = (skill) => {
    setCurrentEditItem(skill);
    setDeleteSkillDialogOpen(true);
  };

  const handleDeleteSkillConfirm = async () => {
    if (!currentEditItem) return;

    try {
      await skillService.deleteSkill(currentEditItem.id);
      fetchSkills();
      setDeleteSkillDialogOpen(false);
      setCurrentEditItem(null);
      setNotification({
        open: true,
        message: "Skill deleted successfully",
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
          {/* Form thêm skill/behavior */}
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
                  Add Skill/Behavior
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={3}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <MDInput
                      fullWidth
                      label="Skill Name"
                      value={skillName}
                      onChange={(e) => {
                        setSkillName(e.target.value);
                        setErrors({ ...errors, skillName: false });
                      }}
                      error={errors.skillName}
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
                    <TextField
                      select
                      fullWidth
                      label="Type"
                      value={skillType}
                      onChange={(e) => {
                        setSkillType(e.target.value);
                        setErrors({ ...errors, skillType: false });
                      }}
                      error={errors.skillType}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: colors.inputBorder },
                          "&:hover fieldset": { borderColor: colors.midGreen },
                          "&.Mui-focused fieldset": { borderColor: colors.inputFocus },
                          // Đảm bảo chiều cao không bị thu hẹp
                          height: "44px", // Chiều cao tiêu chuẩn của TextField
                        },
                        "& .MuiInputLabel-root": { color: colors.darkGray },
                        "& .MuiInputLabel-root.Mui-focused": { color: colors.inputFocus },
                        "& .MuiSelect-select": {
                          height: "100%", // Đảm bảo nội dung select đầy đủ chiều cao
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
                    >
                      <MenuItem value="1">Skill</MenuItem>
                      <MenuItem value="0">Behavior</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton
                      variant="gradient"
                      sx={{
                        backgroundColor: colors.safeGreen,
                        color: colors.white,
                        "&:hover": { backgroundColor: colors.highlightGreen },
                      }}
                      onClick={handleAddSkill}
                      fullWidth
                    >
                      Add
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>

          {/* Skills Table */}
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
                  Skills
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3}>
                <DataTable
                  table={{ columns: skillColumns, rows: skillRows }}
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

          {/* Behaviors Table */}
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
                  Behaviors
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3}>
                <DataTable
                  table={{ columns: skillColumns, rows: behaviorRows }}
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

      {/* Edit Skill Dialog */}
      <Dialog open={editSkillDialogOpen} onClose={() => setEditSkillDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Edit Skill
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          <TextField
            autoFocus
            margin="dense"
            label="Skill Name"
            type="text"
            fullWidth
            value={currentEditItem?.name || ""}
            onChange={(e) => setCurrentEditItem({ ...currentEditItem, name: e.target.value })}
            error={errors.editSkillName}
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
          <TextField
            select
            margin="dense"
            label="Type"
            fullWidth
            value={currentEditItem?.type || ""}
            onChange={(e) => setCurrentEditItem({ ...currentEditItem, type: e.target.value })}
            error={errors.editSkillType}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: colors.inputBorder },
                "&:hover fieldset": { borderColor: colors.midGreen },
                "&.Mui-focused fieldset": { borderColor: colors.inputFocus },
                height: "56px", // Chiều cao tiêu chuẩn của TextField
              },
              "& .MuiInputLabel-root": { color: colors.darkGray },
              "& .MuiInputLabel-root.Mui-focused": { color: colors.inputFocus },
              "& .MuiSelect-select": {
                height: "100%", // Đảm bảo nội dung select đầy đủ chiều cao
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            <MenuItem value="1">Skill</MenuItem>
            <MenuItem value="0">Behavior</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.paleGreen }}>
          <Button onClick={() => setEditSkillDialogOpen(false)} sx={{ color: colors.darkGray }}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSkillSave}
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

      {/* Delete Skill Dialog */}
      <Dialog open={deleteSkillDialogOpen} onClose={() => setDeleteSkillDialogOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Delete Skill
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          <DialogContentText sx={{ color: colors.darkGray }}>
            Are you sure you want to delete the {currentEditItem?.type === 1 ? "skill" : "behavior"}{" "}
            “{currentEditItem?.name}”? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.paleGreen }}>
          <Button onClick={() => setDeleteSkillDialogOpen(false)} sx={{ color: colors.darkGray }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteSkillConfirm}
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

export default EvaluationManagement;
