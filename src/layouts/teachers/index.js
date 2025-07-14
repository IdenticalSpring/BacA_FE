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
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import teacherService from "services/teacherService";
import { useNavigate } from "react-router-dom";
import { colors } from "assets/theme/color";
import TeacherOverViewModal from "./teacherOverviewModal";
import axios from "axios";
import { message } from "antd";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Teachers() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [columns, setColumns] = useState([
    { Header: "Name", accessor: "name", width: "20%" },
    { Header: "Start Date", accessor: "startDate", width: "20%" },
    { Header: "Avatar", accessor: "imageUrl", width: "20%" },
    { Header: "Actions", accessor: "actions", width: "10%" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openOverview, setOpenOverview] = useState(false);
  const [placeholderLessonPlan, setPlaceholderLessonPlan] = useState("");

  useEffect(() => {
    const fetchPlaceholder = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/contentpage/lessonPlanPlaceholder`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        setPlaceholderLessonPlan(response.data);
      } catch (error) {
        console.error("Error fetching placeholder:", error);
      }
    };
    fetchPlaceholder();
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [previewUrls, avatarPreview]);

  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      const formattedRows = data.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        startDate: teacher.startDate,
        linkDrive: teacher.linkDrive,
        imageUrl: teacher.imageUrl ? (
          <img
            src={teacher.imageUrl}
            alt={`${teacher.name}'s avatar`}
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
          />
        ) : (
          "No avatar"
        ),
        fileUrl: teacher.fileUrl
          ? teacher.fileUrl.split(",").map((url, index) => (
              <div key={index}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  File {index + 1}
                </a>
              </div>
            ))
          : "No file",
        actions: (
          <>
            <IconButton
              sx={{
                color: colors.midGreen,
              }}
              onClick={() => handleView(teacher)}
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton
              sx={{
                color: colors.deepGray,
              }}
              onClick={() => handleEdit(teacher)}
            >
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleDelete(teacher.id)}>
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

  const handleEdit = (teacher) => {
    setEditMode(true);
    setSelectedTeacher(teacher);
    setTeacherData({
      name: teacher.name,
      username: teacher.username,
      password: teacher.password || "",
      startDate: teacher.startDate,
      linkDrive: teacher.linkDrive || "",
      fileUrl: teacher.fileUrl || "",
      imageUrl: teacher.imageUrl || "",
      isDelete: teacher.isDelete || false,
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    setAvatarPreview(teacher.imageUrl || null);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await teacherService.deleteTeacher(id);
        setRows(rows.filter((row) => row.id !== id));
        message.success("Xóa giáo viên thành công");
      } catch (err) {
        message.error("Xóa giáo viên thất bại: " + err.message);
      }
    }
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setOpenOverview(true);
  };

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
      const response = await axios.post(`${API_BASE_URL}/files/upload-multiple`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "ngrok-skip-browser-warning": "true",
        },
      });
      console.log("Files upload response:", response.data);

      if (response.status === 201 && Array.isArray(response.data)) {
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
      const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "ngrok-skip-browser-warning": "true",
        },
      });
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
      if (editMode) {
        const updatedTeacher = await teacherService.editTeacher(selectedTeacher.id, teacherData);
        setRows(
          rows.map((row) =>
            row.id === selectedTeacher.id
              ? {
                  ...row,
                  ...teacherData,
                  imageUrl: teacherData.imageUrl ? (
                    <img
                      src={teacherData.imageUrl}
                      alt={`${teacherData.name}'s avatar`}
                      style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                    />
                  ) : (
                    "No avatar"
                  ),
                  fileUrl: teacherData.fileUrl
                    ? teacherData.fileUrl.split(",").map((url, index) => (
                        <div key={index}>
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            File {index + 1}
                          </a>
                        </div>
                      ))
                    : "No file",
                }
              : row
          )
        );
        message.success("Chỉnh sửa giáo viên thành công");
      } else {
        const createdTeacher = await teacherService.createTeacher(teacherData);
        setRows([
          ...rows,
          {
            id: createdTeacher.id,
            name: createdTeacher.name,
            startDate: createdTeacher.startDate,
            linkDrive: createdTeacher.linkDrive,
            imageUrl: createdTeacher.imageUrl ? (
              <img
                src={createdTeacher.imageUrl}
                alt={`${createdTeacher.name}'s avatar`}
                style={{ width: "50px", height: "50px", borderRadius: "50%" }}
              />
            ) : (
              "No avatar"
            ),
            fileUrl: createdTeacher.fileUrl
              ? createdTeacher.fileUrl.split(",").map((url, index) => (
                  <div key={index}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      File {index + 1}
                    </a>
                  </div>
                ))
              : "No file",
            actions: (
              <>
                <IconButton
                  sx={{
                    color: colors.midGreen,
                  }}
                  onClick={() => handleView(createdTeacher)}
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color: colors.deepGray,
                  }}
                  onClick={() => handleEdit(createdTeacher)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(createdTeacher.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            ),
          },
        ]);
        message.success("Tạo giáo viên thành công");
      }
      setOpen(false);
      setTeacherData({
        name: "",
        username: "",
        password: "",
        startDate: "",
        linkDrive: "",
        fileUrl: "",
        imageUrl: "",
        isDelete: false,
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      setAvatarPreview(null);
      setEditMode(false);
    } catch (err) {
      message.error(
        editMode
          ? "Lỗi khi chỉnh sửa giáo viên: " + err.message
          : "Lỗi khi tạo giáo viên: " + err.message
      );
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
                  Teachers Table
                </MDTypography>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    "&:hover": { backgroundColor: colors.highlightGreen },
                  }}
                  onClick={() => navigate("/teachers/create-teacher")}
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
                  label="Search by teacher"
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
          {editMode ? "Chỉnh sửa Giáo Viên" : "Thêm Giáo Viên"}
        </DialogTitle>
        <DialogContent>
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
            fullWidth
            margin="normal"
            type="password"
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
              {avatarLoading
                ? "Đang tải avatar..."
                : teacherData.imageUrl && editMode
                ? "Click để thay đổi avatar"
                : "Click để upload avatar"}
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
          {editMode && teacherData.imageUrl && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: colors.midGreen }}>
                Avatar hiện tại:
              </Typography>
              <img
                src={teacherData.imageUrl}
                alt="Current Avatar"
                style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "50%" }}
              />
            </Box>
          )}
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
              <Box sx={{ mb: 2, textAlign: "center", display: "flex", flexWrap: "wrap", gap: 1 }}>
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
              {imageLoading
                ? "Đang tải file..."
                : selectedFiles.length > 0
                ? `${selectedFiles.length} file đã chọn`
                : editMode && teacherData.fileUrl
                ? "Click để thay đổi file"
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
          {editMode && teacherData.fileUrl && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: colors.midGreen }}>
                File hiện tại:
              </Typography>
              {teacherData.fileUrl.split(",").map((url, index) => (
                <div key={index}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    File {index + 1}
                  </a>
                </div>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
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
            {editMode ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
      <TeacherOverViewModal
        open={openOverview}
        onClose={() => setOpenOverview(false)}
        teacher={selectedTeacher}
        placeholderLessonPlan={placeholderLessonPlan}
      />
    </DashboardLayout>
  );
}

export default Teachers;
