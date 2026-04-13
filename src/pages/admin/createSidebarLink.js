import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import sidebarLinkService from "services/sidebarLinkService";
import { colors } from "assets/theme/color";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import axios from "axios";
import { message } from "antd";

function CreateSidebarLink() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [sidebarData, setSidebarData] = useState({
    name: "",
    type: "",
    link: "",
    imgUrl: "",
  });

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
      // Gửi sidebarData lên server
      await sidebarLinkService.createSidebar(sidebarData);
      message.success("Tạo sidebar link thành công");
      navigate("/linkManagement");
    } catch (err) {
      message.error("Tạo sidebar link thất bại: " + err.message);
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container justifyContent="flex-start">
          <Grid
            item
            xs={12}
            md={6}
            sx={{ marginLeft: "20px", borderRadius: "20px", backgroundColor: colors.white }}
          >
            <Card
              sx={{
                padding: 3,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
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
                  onChange={(e) => setSidebarData({ ...sidebarData, type: e.target.value })}
                  sx={{
                    height: "40px",
                  }}
                >
                  <MenuItem value={0}>Công cụ giảng dạy</MenuItem>
                  <MenuItem value={1}>Công cụ giao bài</MenuItem>
                  <MenuItem value={2}>Link bong bóng</MenuItem>
                  <MenuItem value={3}>Mục trang chủ</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Link"
                fullWidth
                margin="normal"
                value={sidebarData.link}
                onChange={(e) => setSidebarData({ ...sidebarData, link: e.target.value })}
              />
              {sidebarData.type !== 3 && (
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
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="text"
                  sx={{ color: colors.midGreen, "&:hover": { color: colors.darkGreen } }}
                  onClick={() => navigate("/linkManagement")}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    "&:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={handleSave}
                >
                  Create
                </Button>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CreateSidebarLink;
