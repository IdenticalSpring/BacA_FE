import { useEffect, useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import sidebarLinkService from "services/sidebarLinkService";
import { colors } from "assets/theme/color";
import { useNavigate } from "react-router-dom";

function SidebarLinkManagement() {
  const navigate = useNavigate();
  const [columns, setColumns] = useState([
    { Header: "Name", accessor: "name", width: "20%" },
    { Header: "Type", accessor: "type", width: "20%" },
    { Header: "Link", accessor: "link", width: "30%" },
    { Header: "Image", accessor: "image", width: "20%" },
    { Header: "Actions", accessor: "actions", width: "10%" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSidebar, setSelectedSidebar] = useState(null);
  const [sidebarData, setSidebarData] = useState({
    name: "",
    type: "",
    link: "",
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSidebarLinks();
  }, []);

  const fetchSidebarLinks = async () => {
    try {
      setLoading(true);
      const data = await sidebarLinkService.getAllSidebars();
      const formattedRows = data.map((sidebar) => ({
        id: sidebar.id,
        name: sidebar.name,
        type: sidebar.type === 0 ? "Công cụ giảng dạy" : "Công cụ giao bài",
        link: (
          <a href={sidebar.link} target="_blank" rel="noopener noreferrer">
            {sidebar.link}
          </a>
        ),
        image: sidebar.imgUrl ? (
          <img src={sidebar.imgUrl} alt={sidebar.name} style={{ width: "50px", height: "50px" }} />
        ) : (
          "No image"
        ),
        actions: (
          <>
            <IconButton
              sx={{
                color: colors.midGreen,
                " &:hover": { backgroundColor: colors.highlightGreen },
              }}
              onClick={() => handleEdit(sidebar)}
            >
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleDelete(sidebar.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
      }));
      setRows(formattedRows);
    } catch (err) {
      setError("Load data failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sidebar) => {
    setEditMode(true);
    setSelectedSidebar(sidebar);
    setSidebarData({
      name: sidebar.name,
      type: sidebar.type,
      link: sidebar.link,
    });
    setFile(null);
    setImagePreview(sidebar.imgUrl || null); // Đồng bộ với imgUrl
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sidebar link?")) {
      try {
        await sidebarLinkService.deleteSidebar(id);
        await fetchSidebarLinks();
      } catch (err) {
        alert("Delete failed");
        console.error(err);
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        const updatedSidebar = await sidebarLinkService.updateSidebar(
          selectedSidebar.id,
          sidebarData,
          file
        );
        setRows(
          rows.map((row) =>
            row.id === selectedSidebar.id
              ? {
                  ...row,
                  name: updatedSidebar.name,
                  type: updatedSidebar.type === 0 ? "Công cụ giảng dạy" : "Công cụ giao bài",
                  link: (
                    <a href={updatedSidebar.link} target="_blank" rel="noopener noreferrer">
                      {updatedSidebar.link}
                    </a>
                  ),
                  image: updatedSidebar.imgUrl ? ( // Sử dụng imgUrl thay vì img
                    <img
                      src={updatedSidebar.imgUrl}
                      alt={updatedSidebar.name}
                      style={{ width: "50px", height: "50px" }}
                    />
                  ) : (
                    "No image"
                  ),
                }
              : row
          )
        );
      }
      setOpen(false);
      setSidebarData({ name: "", type: "", link: "" });
      setFile(null);
      setImagePreview(null);
      setEditMode(false);
    } catch (err) {
      alert("Lỗi khi chỉnh sửa sidebar link!");
      console.error(err);
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    return rows.filter((row) => row.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rows, searchTerm]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                borderRadius="lg"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ backgroundColor: colors.deepGreen }}
              >
                <MDTypography variant="h6" color="white">
                  Sidebar Links Table
                </MDTypography>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen },
                  }}
                  onClick={() => navigate("/linkManagement/create")}
                >
                  Create
                </Button>
              </MDBox>
              <MDBox
                mx={2}
                mt={0}
                py={3}
                px={2}
                variant="gradient"
                borderRadius="lg"
                display="flex"
                justifyContent="right"
                alignItems="center"
              >
                <TextField
                  label="Search by name"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ backgroundColor: "white", borderRadius: "4px" }}
                />
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDTypography variant="h6" color="info" align="center">
                    Loading...
                  </MDTypography>
                ) : error ? (
                  <MDTypography variant="h6" color="error" align="center">
                    {error}
                  </MDTypography>
                ) : (
                  <DataTable
                    table={{ columns, rows: filteredRows }}
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
      <Footer />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ backgroundColor: colors.deepGreen, color: colors.white }}>
          Chỉnh sửa Sidebar Link
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={sidebarData.name}
            onChange={(e) => setSidebarData({ ...sidebarData, name: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="type-select-label">Type</InputLabel>
            <Select
              labelId="type-select-label"
              id="type-select"
              value={sidebarData.type}
              label="Type"
              sx={{ height: "40px" }}
              onChange={(e) => setSidebarData({ ...sidebarData, type: e.target.value })}
            >
              <MenuItem value={0}>Công cụ giảng dạy</MenuItem>
              <MenuItem value={1}>Công cụ giao bài</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Link"
            fullWidth
            margin="normal"
            value={sidebarData.link}
            onChange={(e) => setSidebarData({ ...sidebarData, link: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            type="file"
            label="Upload Image"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={handleFileChange}
          />
          {imagePreview && (
            <MDBox mt={2} display="flex" justifyContent="center">
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "200px" }}
              />
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setImagePreview(null);
            }}
            sx={{ color: colors.midGreen, " &:hover": { color: colors.darkGreen } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            sx={{
              backgroundColor: colors.midGreen,
              color: colors.white,
              " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default SidebarLinkManagement;
