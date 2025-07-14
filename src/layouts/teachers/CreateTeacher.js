import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, TextField, Button, Grid, Box, Typography } from "@mui/material";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import teacherService from "services/teacherService";
import { colors } from "assets/theme/color";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import axios from "axios";
import { message } from "antd";

function CreateTeacher() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [teacherData, setTeacherData] = useState({
    name: "",
    username: "",
    password: "",
    startDate: "",
    linkDrive: "",
    fileUrl: "",
    imageUrl: "",
    isDelete: false,
  });

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) {
      message.error("Vui lòng chọn ít nhất một file");
      return;
    }

    setSelectedFiles(files);
    setImageLoading(true);

    // Tạo URL preview cho các file ảnh
    const urls = files.map((file) => {
      if (file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setPreviewUrls(urls);

    // Upload các file lên server
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      console.log(
        "Uploading files:",
        files.map((f) => f.name)
      );
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/files/upload-multiple`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      console.log("Files upload response:", response.data);

      if (response.status === 201 && Array.isArray(response.data)) {
        // Lấy các URL từ mảng các file object
        const fileUrls = response.data.map((file) => file.url).join(",");
        setTeacherData((prevData) => ({
          ...prevData,
          fileUrl: fileUrls,
        }));
        setImageLoading(false);
        message.success(`Đã upload ${files.length} file thành công`);
      } else {
        setImageLoading(false);
        message.error("Upload file thất bại: Không nhận được danh sách URL từ server");
      }
    } catch (error) {
      console.error("Lỗi khi upload file:", error);
      setImageLoading(false);
      message.error(`Lỗi upload file: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      message.error("Vui lòng chọn một file ảnh");
      return;
    }

    if (!file.type.startsWith("image/")) {
      message.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    setAvatarLoading(true);
    setAvatarPreview(URL.createObjectURL(file));

    // Upload file ảnh avatar
    const formData = new FormData();
    formData.append("file", file);

    try {
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
      console.log("Avatar upload response:", response.data);

      if (response.status === 201 && response.data.url) {
        setTeacherData((prevData) => ({
          ...prevData,
          imageUrl: response.data.url,
        }));
        setAvatarLoading(false);
        message.success("Upload avatar thành công");
      } else {
        setAvatarLoading(false);
        message.error("Upload avatar thất bại: Không nhận được URL từ server");
      }
    } catch (error) {
      console.error("Lỗi khi upload avatar:", error);
      setAvatarLoading(false);
      message.error(`Lỗi upload avatar: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSave = async () => {
    try {
      // Gọi service để tạo giáo viên với teacherData
      await teacherService.createTeacher(teacherData);
      message.success("Tạo giáo viên thành công");
      navigate("/teachers");
    } catch (err) {
      message.error("Tạo giáo viên thất bại: " + err.message);
      console.error(err);
    }
  };

  // Cleanup preview URLs để tránh memory leak
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [previewUrls, avatarPreview]);

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
                value={teacherData.name}
                onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
              />
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={teacherData.username}
                onChange={(e) => setTeacherData({ ...teacherData, username: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={teacherData.password}
                onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={teacherData.startDate}
                onChange={(e) => setTeacherData({ ...teacherData, startDate: e.target.value })}
              />
              <TextField
                label="Link Drive"
                fullWidth
                margin="normal"
                value={teacherData.linkDrive}
                onChange={(e) => setTeacherData({ ...teacherData, linkDrive: e.target.value })}
              />
              {/* Phần tải avatar */}
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
                onClick={() => avatarInputRef.current.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef}
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                {avatarPreview ? (
                  <Box sx={{ mb: 2, textAlign: "center" }}>
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "50%" }}
                    />
                  </Box>
                ) : (
                  <AddPhotoAlternateIcon sx={{ fontSize: 60, color: colors.midGreen, mb: 1 }} />
                )}
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {avatarLoading ? "Đang tải avatar..." : "Click để upload avatar"}
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
                  Upload Avatar
                </Button>
              </Box>
              {/* Phần tải file khác */}
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
                  accept="image/*,.pdf"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  multiple
                />
                {previewUrls.length > 0 ? (
                  <Box
                    sx={{ mb: 2, textAlign: "center", display: "flex", flexWrap: "wrap", gap: 1 }}
                  >
                    {previewUrls.map(
                      (url, index) =>
                        url && (
                          <img
                            key={index}
                            src={url}
                            alt={`Preview ${index}`}
                            style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "8px" }}
                          />
                        )
                    )}
                  </Box>
                ) : (
                  <AddPhotoAlternateIcon sx={{ fontSize: 60, color: colors.midGreen, mb: 1 }} />
                )}
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Legacy 303
                  {imageLoading
                    ? "Đang tải file..."
                    : selectedFiles.length > 0
                    ? `${selectedFiles.length} file đã chọn`
                    : "Click để upload file"}
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
                  Upload Files
                </Button>
              </Box>
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="text"
                  sx={{ color: colors.midGreen, "&:hover": { color: colors.darkGreen } }}
                  onClick={() => navigate("/teachers")}
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

export default CreateTeacher;
