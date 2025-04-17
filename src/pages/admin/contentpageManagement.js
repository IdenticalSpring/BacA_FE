import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Tooltip from "@mui/material/Tooltip";
import { colors } from "assets/theme/color";
import contentPageService from "services/contentpageService";

function ContentPageManagement() {
  const [contentPages, setContentPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({
    editHomepageMainTitle: false,
  });
  const [tabValue, setTabValue] = useState(0);
  const [img1File, setImg1File] = useState(null);
  const [img2File, setImg2File] = useState(null);
  const [img1Preview, setImg1Preview] = useState(null); // State cho preview ảnh 1
  const [img2Preview, setImg2Preview] = useState(null); // State cho preview ảnh 2

  useEffect(() => {
    fetchContentPages();
  }, []);

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "No Prompt";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const fetchContentPages = async () => {
    setLoading(true);
    try {
      const data = await contentPageService.getAllContentPages();
      setContentPages(data);
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

  const contentPageColumns = [
    { Header: "Name Web", accessor: "homepageMainTitle", width: "30%" },
    { Header: "Feature Main Title", accessor: "featureMainTitle", width: "30%" },
    { Header: "Works Main Title", accessor: "worksMainTitle", width: "20%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ];

  const informationColumns = [
    { Header: "Center Name", accessor: "name", width: "40%" },
    { Header: "Footer Email", accessor: "footerEmail", width: "20%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ];

  const promptColumns = [
    { Header: "Prompt Description", accessor: "promptDescription", width: "40%" },
    { Header: "Prompt Lesson Plan", accessor: "promptLessonPlan", width: "40%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ];

  const contentPageRows =
    contentPages.length > 0
      ? contentPages.map((page) => ({
          homepageMainTitle: page.homepageMainTitle || "No Title",
          featureMainTitle: page.featureMainTitle || "No Title",
          worksMainTitle: page.worksMainTitle || "No Title",
          actions: (
            <MDBox display="flex" gap={2}>
              <MDButton
                variant="text"
                sx={{
                  color: colors.white,
                  backgroundColor: colors.deepGreen,
                  " &:hover": { color: colors.paleGreen, backgroundColor: colors.deepGreen },
                }}
                onClick={() => handleEditClick(page)}
              >
                Edit
              </MDButton>
            </MDBox>
          ),
        }))
      : [
          {
            homepageMainTitle: "No Data",
            featureMainTitle: "",
            worksMainTitle: "",
            actions: "",
          },
        ];

  const informationRows =
    contentPages.length > 0
      ? contentPages.map((page) => ({
          name: page.name || "No name",
          footerEmail: page.footerEmail || "No Email",
          actions: (
            <MDBox display="flex" gap={2}>
              <MDButton
                variant="text"
                sx={{
                  color: colors.white,
                  backgroundColor: colors.deepGreen,
                  " &:hover": { color: colors.paleGreen, backgroundColor: colors.deepGreen },
                }}
                onClick={() => handleEditClick(page)}
              >
                Edit
              </MDButton>
            </MDBox>
          ),
        }))
      : [
          {
            footerDescription: "No Data",
            footerEmail: "",
            actions: "",
          },
        ];

  const promptRows =
    contentPages.length > 0
      ? contentPages.map((page) => ({
          promptDescription: (
            <Tooltip title={page.promptDescription || "No Prompt"} placement="top">
              <MDTypography
                variant="body2"
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {truncateText(page.promptDescription, 50)}
              </MDTypography>
            </Tooltip>
          ),
          promptLessonPlan: (
            <Tooltip title={page.promptLessonPlan || "No Prompt"} placement="top">
              <MDTypography
                variant="body2"
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                {truncateText(page.promptLessonPlan, 50)}
              </MDTypography>
            </Tooltip>
          ),
          actions: (
            <MDBox display="flex" gap={2}>
              <MDButton
                variant="text"
                sx={{
                  color: colors.white,
                  backgroundColor: colors.deepGreen,
                  " &:hover": { color: colors.paleGreen, backgroundColor: colors.deepGreen },
                }}
                onClick={() => handleEditClick(page)}
              >
                Edit
              </MDButton>
            </MDBox>
          ),
        }))
      : [
          {
            promptDescription: "No Data",
            promptLessonPlan: "",
            actions: "",
          },
        ];

  const validateEditForm = () => {
    const newErrors = {
      editHomepageMainTitle:
        tabValue === 0 && (!currentEditItem || !currentEditItem.homepageMainTitle.trim()),
    };
    setErrors({ ...errors, ...newErrors });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleEditClick = (page) => {
    setCurrentEditItem({ ...page });
    setImg1File(null);
    setImg2File(null);
    setImg1Preview(page.img1 || null); // Load ảnh hiện tại
    setImg2Preview(page.img2 || null);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (tabValue === 0 && !validateEditForm()) return;

    try {
      const formData = new FormData();
      Object.keys(currentEditItem).forEach((key) => {
        if (key !== "id" && key !== "img1" && key !== "img2") {
          formData.append(key, currentEditItem[key]);
        }
      });
      if (img1File) formData.append("files", img1File);
      if (img2File) formData.append("files", img2File);

      await contentPageService.editContentPage(currentEditItem.id, formData);
      fetchContentPages();
      setEditDialogOpen(false);
      setCurrentEditItem(null);
      setImg1File(null);
      setImg2File(null);
      setImg1Preview(null);
      setImg2Preview(null);
      setNotification({
        open: true,
        message: "Content updated successfully",
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Xử lý khi chọn file ảnh
  const handleImg1Change = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImg1File(file);
      setImg1Preview(URL.createObjectURL(file));
    }
  };

  const handleImg2Change = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImg2File(file);
      setImg2Preview(URL.createObjectURL(file));
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3} bgColor={colors.gray}>
        <Grid container spacing={6}>
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
                  Content Management
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  centered
                  sx={{ backgroundColor: colors.lightGreen, color: colors.white }}
                >
                  <Tab label="Content Pages" />
                  <Tab label="Information" />
                  <Tab label="Prompt Management" />
                </Tabs>
              </MDBox>
              <MDBox pt={3} px={3} pb={3} display="flex" justifyContent="center">
                {loading ? (
                  <CircularProgress sx={{ color: colors.deepGreen }} />
                ) : tabValue === 0 ? (
                  <DataTable
                    table={{ columns: contentPageColumns, rows: contentPageRows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                    sx={{
                      "& .MuiTableHead-root": { backgroundColor: colors.tableHeaderBg },
                      "& .MuiTableRow-root:hover": { backgroundColor: colors.tableRowHover },
                      "& .MuiTableCell-root": {
                        maxWidth: "300px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                  />
                ) : tabValue === 1 ? (
                  <DataTable
                    table={{ columns: informationColumns, rows: informationRows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                    sx={{
                      "& .MuiTableHead-root": { backgroundColor: colors.tableHeaderBg },
                      "& .MuiTableRow-root:hover": { backgroundColor: colors.tableRowHover },
                      "& .MuiTableCell-root": {
                        maxWidth: "300px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                  />
                ) : (
                  <DataTable
                    table={{ columns: promptColumns, rows: promptRows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                    sx={{
                      "& .MuiTableHead-root": { backgroundColor: colors.tableHeaderBg },
                      "& .MuiTableRow-root:hover": { backgroundColor: colors.tableRowHover },
                      "& .MuiTableCell-root": {
                        maxWidth: "300px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: colors.headerBg, color: colors.white }}>
          Edit {tabValue === 0 ? "Content Page" : tabValue === 1 ? "Information" : "Prompts"}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.paleGreen }}>
          {tabValue === 0 ? (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Name Website"
                type="text"
                fullWidth
                value={currentEditItem?.homepageMainTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, homepageMainTitle: e.target.value })
                }
                error={errors.editHomepageMainTitle}
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
                margin="dense"
                label="Homepage Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.homepageDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, homepageDescription: e.target.value })
                }
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
                margin="dense"
                label="Feature Main Title"
                type="text"
                fullWidth
                value={currentEditItem?.featureMainTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, featureMainTitle: e.target.value })
                }
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
                margin="dense"
                label="Feature Main Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.featureMainDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, featureMainDescription: e.target.value })
                }
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
                margin="dense"
                label="Feature First Title"
                type="text"
                fullWidth
                value={currentEditItem?.featureFirstTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, featureFirstTitle: e.target.value })
                }
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
                margin="dense"
                label="Feature First Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.featureFristDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({
                    ...currentEditItem,
                    featureFristDescription: e.target.value,
                  })
                }
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
                margin="dense"
                label="Feature Second Title"
                type="text"
                fullWidth
                value={currentEditItem?.featureSecondTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, featureSecondTitle: e.target.value })
                }
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
                margin="dense"
                label="Feature Second Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.featureSecondDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({
                    ...currentEditItem,
                    featureSecondDescription: e.target.value,
                  })
                }
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
                margin="dense"
                label="Feature Third Title"
                type="text"
                fullWidth
                value={currentEditItem?.featureThirdTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, featureThirdTitle: e.target.value })
                }
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
                margin="dense"
                label="Feature Third Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.featureThirdDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({
                    ...currentEditItem,
                    featureThirdDescription: e.target.value,
                  })
                }
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
                margin="dense"
                label="Feature Fourth Title"
                type="text"
                fullWidth
                value={currentEditItem?.featureFourthTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, featureFourthTitle: e.target.value })
                }
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
                margin="dense"
                label="Feature Fourth Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.featureFourthDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({
                    ...currentEditItem,
                    featureFourthDescription: e.target.value,
                  })
                }
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
                margin="dense"
                label="Feature Fifth Title"
                type="text"
                fullWidth
                value={currentEditItem?.featureFivethTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, featureFivethTitle: e.target.value })
                }
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
                margin="dense"
                label="Feature Fifth Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.featureFivethDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({
                    ...currentEditItem,
                    featureFivethDescription: e.target.value,
                  })
                }
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
                margin="dense"
                label="Feature Sixth Title"
                type="text"
                fullWidth
                value={currentEditItem?.featureSixthTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, featureSixthTitle: e.target.value })
                }
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
                margin="dense"
                label="Feature Sixth Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.featureSixthDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({
                    ...currentEditItem,
                    featureSixthDescription: e.target.value,
                  })
                }
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
                margin="dense"
                label="Works Main Title"
                type="text"
                fullWidth
                value={currentEditItem?.worksMainTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, worksMainTitle: e.target.value })
                }
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
                margin="dense"
                label="Works Main Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.worksMainDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, worksMainDescription: e.target.value })
                }
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
                margin="dense"
                label="Works First Title"
                type="text"
                fullWidth
                value={currentEditItem?.worksFirstTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, worksFirstTitle: e.target.value })
                }
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
                margin="dense"
                label="Works First Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.worksFristDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, worksFristDescription: e.target.value })
                }
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
                margin="dense"
                label="Works Second Title"
                type="text"
                fullWidth
                value={currentEditItem?.worksSecondTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, worksSecondTitle: e.target.value })
                }
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
                margin="dense"
                label="Works Second Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.worksSecondDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, worksSecondDescription: e.target.value })
                }
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
                margin="dense"
                label="Works Third Title"
                type="text"
                fullWidth
                value={currentEditItem?.worksThirdTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, worksThirdTitle: e.target.value })
                }
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
                margin="dense"
                label="Works Third Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.worksThirdDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, worksThirdDescription: e.target.value })
                }
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
                margin="dense"
                label="Works Fourth Title"
                type="text"
                fullWidth
                value={currentEditItem?.worksFourthTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, worksFourthTitle: e.target.value })
                }
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
                margin="dense"
                label="Works Fourth Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.worksFourthDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, worksFourthDescription: e.target.value })
                }
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
                margin="dense"
                label="Testimonials Main Title"
                type="text"
                fullWidth
                value={currentEditItem?.testimonialsMainTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, testimonialsMainTitle: e.target.value })
                }
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
                margin="dense"
                label="Testimonials Main Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.testimonialsMainDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({
                    ...currentEditItem,
                    testimonialsMainDescription: e.target.value,
                  })
                }
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
                margin="dense"
                label="Testimonials First Title"
                type="text"
                fullWidth
                value={currentEditItem?.testimonialsFirstTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, testimonialsFirstTitle: e.target.value })
                }
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
                margin="dense"
                label="Testimonials First Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.testimonialsFristDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({
                    ...currentEditItem,
                    testimonialsFristDescription: e.target.value,
                  })
                }
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
                margin="dense"
                label="Testimonials Second Title"
                type="text"
                fullWidth
                value={currentEditItem?.testimonialsSecondTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({
                    ...currentEditItem,
                    testimonialsSecondTitle: e.target.value,
                  })
                }
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
                margin="dense"
                label="Testimonials Second Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.testimonialsSecondDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({
                    ...currentEditItem,
                    testimonialsSecondDescription: e.target.value,
                  })
                }
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
                margin="dense"
                label="Testimonials Third Title"
                type="text"
                fullWidth
                value={currentEditItem?.testimonialsThirdTitle || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, testimonialsThirdTitle: e.target.value })
                }
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
                margin="dense"
                label="Testimonials Third Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.testimonialsThirdDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({
                    ...currentEditItem,
                    testimonialsThirdDescription: e.target.value,
                  })
                }
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
            </>
          ) : tabValue === 1 ? (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Center Name"
                type="text"
                fullWidth
                value={currentEditItem?.name || ""}
                onChange={(e) => setCurrentEditItem({ ...currentEditItem, name: e.target.value })}
                error={errors.editHomepageMainTitle}
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
                margin="dense"
                label="Footer Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.footerDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, footerDescription: e.target.value })
                }
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
                margin="dense"
                label="Footer Address"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.footerAddress || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, footerAddress: e.target.value })
                }
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
                margin="dense"
                label="Footer Email"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.footerEmail || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, footerEmail: e.target.value })
                }
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
                margin="dense"
                label="Footer Contact"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.footerContact || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, footerContact: e.target.value })
                }
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
                margin="dense"
                label="Link 1"
                type="text"
                fullWidth
                value={currentEditItem?.linkFacebook || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, linkFacebook: e.target.value })
                }
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
                margin="dense"
                label="Youtube Link"
                type="text"
                fullWidth
                value={currentEditItem?.linkYoutube || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, linkYoutube: e.target.value })
                }
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
                margin="dense"
                label="Link 2"
                type="text"
                fullWidth
                value={currentEditItem?.linkZalo || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, linkZalo: e.target.value })
                }
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
                margin="dense"
                label="Adsense ID"
                type="text"
                fullWidth
                value={currentEditItem?.adsenseId || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, adsenseId: e.target.value })
                }
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
              <MDTypography variant="body2" sx={{ marginTop: "8px" }}>
                Image 1 Preview
              </MDTypography>
              {img1Preview ? (
                <img
                  src={img1Preview}
                  alt="Image 1 Preview"
                  style={{ maxWidth: "200px", maxHeight: "200px", margin: "8px 0" }}
                />
              ) : (
                <MDTypography variant="caption" color="textSecondary">
                  No image selected
                </MDTypography>
              )}
              <Button
                variant="contained"
                component="label"
                sx={{
                  margin: "8px 0",
                  backgroundColor: colors.deepGreen,
                  color: colors.white,
                  "&:hover": { backgroundColor: colors.midGreen },
                }}
              >
                Upload Image 1
                <input type="file" accept="image/*" hidden onChange={handleImg1Change} />
              </Button>
              <MDTypography variant="body2" sx={{ marginTop: "8px" }}>
                Image 2 Preview
              </MDTypography>
              {img2Preview ? (
                <img
                  src={img2Preview}
                  alt="Image 2 Preview"
                  style={{ maxWidth: "200px", maxHeight: "200px", margin: "8px 0" }}
                />
              ) : (
                <MDTypography variant="caption" color="textSecondary">
                  No image selected
                </MDTypography>
              )}
              <Button
                variant="contained"
                component="label"
                sx={{
                  margin: "8px 0",
                  backgroundColor: colors.deepGreen,
                  color: colors.white,
                  "&:hover": { backgroundColor: colors.midGreen },
                }}
              >
                Upload Image 2
                <input type="file" accept="image/*" hidden onChange={handleImg2Change} />
              </Button>
            </>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Prompt Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.promptDescription || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, promptDescription: e.target.value })
                }
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
                margin="dense"
                label="Prompt Lesson Plan"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={currentEditItem?.promptLessonPlan || ""}
                onChange={(e) =>
                  setCurrentEditItem({ ...currentEditItem, promptLessonPlan: e.target.value })
                }
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
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.paleGreen }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ color: colors.darkGray }}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
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

export default ContentPageManagement;
