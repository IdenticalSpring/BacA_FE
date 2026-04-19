import { useEffect, useState, useMemo, useRef } from "react";
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
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import sidebarLinkService from "services/sidebarLinkService";
import { colors } from "assets/theme/color";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import axios from "axios";
import { message } from "antd";

function SidebarLinkManagement() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
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
    imgUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

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
        type: sidebar.type === 0 ? "Công cụ giảng dạy" : sidebar.type === 1 ? "Công cụ giao bài" : sidebar.type === 2 ? "Link bong bóng" : sidebar.type === 3 ? "Mục trang chủ" : sidebar.type === 4 ? "Link Hướng dẫn Gemini" : "Link Gemini mở rộng",
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
                "&:hover": { backgroundColor: colors.highlightGreen },
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
      imgUrl: sidebar.imgUrl || "",
    });
    setSelectedFile(null);
    setPreviewUrl(sidebar.imgUrl || "");
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sidebar link?")) {
      try {
        await sidebarLinkService.deleteSidebar(id);
        await fetchSidebarLinks();
        message.success("Xóa sidebar link thành công");
      } catch (err) {
        message.error("Xóa sidebar link thất bại: " + err.message);
        console.error(err);
      }
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      message.error("Vui lòng chọn một file ảnh");
      return;
    }

    setSelectedFile(file);
    setImageLoading(true);

    // Tạo URL preview cho hình ảnh
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);

    // Upload ảnh lên server
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading image:", file.name);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/files/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      console.log("Image upload response:", response.data);

      if (response.status === 201 && response.data.url) {
        setSidebarData((prevData) => ({
          ...prevData,
          imgUrl: response.data.url,
        }));
        setImageLoading(false);
        message.success(`Đã upload ảnh ${file.name} thành công`);
      } else {
        setImageLoading(false);
        message.error(`Upload ảnh ${file.name} thất bại: Không nhận được URL từ server`);
      }
    } catch (error) {
      console.error(`Lỗi khi upload ảnh ${file.name}:`, error);
      setImageLoading(false);
      message.error(
        `Lỗi upload ảnh ${file.name}: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        const updatedSidebar = await sidebarLinkService.updateSidebar(
          selectedSidebar.id,
          sidebarData
        );
        setRows(
          rows.map((row) =>
            row.id === selectedSidebar.id
              ? {
                  ...row,
                  name: updatedSidebar.name,
                  type: updatedSidebar.type === 0 ? "Công cụ giảng dạy" : updatedSidebar.type === 1 ? "Công cụ giao bài" : updatedSidebar.type === 2 ? "Link bong bóng" : updatedSidebar.type === 3 ? "Mục trang chủ" : updatedSidebar.type === 4 ? "Link Hướng dẫn Gemini" : "Link Gemini mở rộng",
                  link: (
                    <a href={updatedSidebar.link} target="_blank" rel="noopener noreferrer">
                      {updatedSidebar.link}
                    </a>
                  ),
                  image: updatedSidebar.imgUrl ? (
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
        message.success("Chỉnh sửa sidebar link thành công");
      }
      setOpen(false);
      setSidebarData({ name: "", type: "", link: "", imgUrl: "" });
      setSelectedFile(null);
      setPreviewUrl("");
      setEditMode(false);
    } catch (err) {
      message.error("Chỉnh sửa sidebar link thất bại: " + err.message);
      console.error(err);
    }
  };

  const typeLabels = {
    0: "Công cụ giảng dạy",
    1: "Công cụ giao bài",
    2: "Link bong bóng",
    3: "Mục trang chủ",
    4: "Link Hướng dẫn Gemini",
    5: "Link Gemini mở rộng",
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const nameMatch = !searchTerm || row.name.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = filterType === "" || row.type === typeLabels[filterType];
      return nameMatch && typeMatch;
    });
  }, [rows, searchTerm, filterType]);

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
                    "&:hover": { backgroundColor: colors.highlightGreen },
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
                gap={2}
              >
                <FormControl size="small" sx={{ minWidth: 180, backgroundColor: "white", borderRadius: "4px" }}>
                  <InputLabel id="filter-type-label">Filter by Type</InputLabel>
                  <Select
                    labelId="filter-type-label"
                    value={filterType}
                    label="Filter by Type"
                    onChange={(e) => setFilterType(e.target.value)}
                    sx={{ height: "40px" }}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value={0}>Công cụ giảng dạy</MenuItem>
                    <MenuItem value={1}>Công cụ giao bài</MenuItem>
                    <MenuItem value={2}>Link bong bóng</MenuItem>
                    <MenuItem value={3}>Mục trang chủ</MenuItem>
                    <MenuItem value={4}>Link Hướng dẫn Gemini</MenuItem>
                    <MenuItem value={5}>Link Gemini mở rộng</MenuItem>
                  </Select>
                </FormControl>
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
              <MenuItem value={2}>Link bong bóng</MenuItem>
              <MenuItem value={3}>Mục trang chủ</MenuItem>
              <MenuItem value={4}>Link Hướng dẫn Gemini</MenuItem>
              <MenuItem value={5}>Link Gemini mở rộng</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Link"
            fullWidth
            margin="normal"
            value={sidebarData.link}
            onChange={(e) => setSidebarData({ ...sidebarData, link: e.target.value })}
          />
          {sidebarData.type !== 3 && sidebarData.type !== 4 && sidebarData.type !== 5 && (
            <Box
              sx={{
                mt: 2,
                mb: 2,
                border: "1px dashed #ccc",
                borderRadius: "8px",
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {previewUrl ? (
                <Box sx={{ mb: 2, textAlign: "center" }}>
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px" }}
                  />
                </Box>
              ) : (
                <AddPhotoAlternateIcon sx={{ fontSize: 60, color: colors.midGreen, mb: 1 }} />
              )}
              <Typography variant="body1" sx={{ mb: 1 }}>
                {imageLoading
                  ? "Đang tải ảnh..."
                  : selectedFile
                  ? selectedFile.name
                  : editMode && sidebarData.imgUrl
                  ? "Click để thay đổi ảnh"
                  : "Click để upload ảnh"}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{
                  color: colors.midGreen,
                  borderColor: colors.midGreen,
                  "&:hover": {
                    borderColor: colors.darkGreen,
                    backgroundColor: "rgba(0, 128, 0, 0.04)",
                  },
                }}
              >
                Upload Image
              </Button>
            </Box>
          )}
          {/* {editMode && sidebarData.imgUrl && !selectedFile && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: colors.midGreen }}>
                Ảnh hiện tại:
              </Typography>
              <img
                src={sidebarData.imgUrl}
                alt="Current image"
                style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "8px" }}
              />
            </Box>
          )} */}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setSelectedFile(null);
              setPreviewUrl("");
            }}
            sx={{ color: colors.midGreen, "&:hover": { color: colors.darkGreen } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            sx={{
              backgroundColor: colors.midGreen,
              color: colors.white,
              "&:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
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
