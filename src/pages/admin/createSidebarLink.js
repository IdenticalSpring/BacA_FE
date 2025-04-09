import { useState } from "react";
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
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import sidebarLinkService from "services/sidebarLinkService";
import { colors } from "assets/theme/color";

function CreateSidebarLink() {
  const navigate = useNavigate();
  const [sidebarData, setSidebarData] = useState({
    name: "",
    type: "", // Để trống ban đầu, sẽ được chọn từ dropdown
    link: "",
  });
  const [file, setFile] = useState(null); // Chỉ hỗ trợ 1 file ảnh
  const [imagePreview, setImagePreview] = useState(null); // State để hiển thị ảnh xem trước

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Hiển thị ảnh xem trước từ file
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  };

  const handleSave = async () => {
    try {
      // Gửi sidebarData và file ảnh lên server
      await sidebarLinkService.createSidebar(sidebarData, file);
      navigate("/linkManagement"); // Quay lại danh sách sidebar links
    } catch (err) {
      alert("Create sidebar link failed");
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
                    height: "40px", // Tăng padding để Select cao hơn
                  }}
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
                inputProps={{ accept: "image/*" }} // Chỉ hỗ trợ 1 file ảnh
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
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="text"
                  sx={{ color: colors.midGreen, " &:hover": { color: colors.darkGreen } }}
                  onClick={() => navigate("/linkManagement")}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen },
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
