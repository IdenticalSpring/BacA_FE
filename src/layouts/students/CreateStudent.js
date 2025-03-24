import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  TextField,
  Button,
  Grid,
  MenuItem,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import studentService from "services/studentService";
import { colors } from "assets/theme/color";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

// Thêm id vào mỗi level
const levels = [
  { id: 1, name: "Level Pre-1" },
  { id: 2, name: "Level 1" },
  { id: 3, name: "Level Starters" },
  { id: 4, name: "Level Movers" },
  { id: 5, name: "Level Flyers" },
  { id: 6, name: "Level Pre-KET" },
  { id: 7, name: "Level-KET" },
  { id: 8, name: "Level-PET" },
];

function CreateStudent() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [studentData, setStudentData] = useState({
    name: "",
    level: "",
    age: "",
    phone: "",
    imgUrl: "",
    username: "",
    password: "",
    startDate: "",
    endDate: "",
    note: "",
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Tạo URL preview cho hình ảnh
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Tạo đối tượng FormData để gửi cả dữ liệu và file
      const formData = new FormData();

      // Thêm tất cả dữ liệu sinh viên vào formData
      Object.keys(studentData).forEach((key) => {
        if (key !== "imgUrl") {
          formData.append(key, studentData[key]);
        }
      });

      // Thêm file hình ảnh vào formData nếu có
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      // Gọi service để tạo sinh viên với FormData
      await studentService.createStudentWithFile(formData);
      navigate("/students");
    } catch (err) {
      alert("Create student failed");
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
                value={studentData.name}
                onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
              />
              <TextField
                select
                label="level"
                fullWidth
                sx={{
                  "& .css-1cohrqd-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select":
                    {
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                    },
                }}
                margin="normal"
                value={studentData.level}
                onChange={(e) => {
                  setStudentData({ ...studentData, level: e.target.value });
                }}
              >
                {levels.map((level) => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Age"
                fullWidth
                margin="normal"
                value={studentData.age}
                onChange={(e) => setStudentData({ ...studentData, age: e.target.value })}
              />
              <TextField
                label="Phone"
                fullWidth
                margin="normal"
                value={studentData.phone}
                onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })}
              />

              {/* Phần tải file Avatar */}
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
                  {selectedFile ? selectedFile.name : "Click to upload avatar"}
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
                  Upload Photo
                </Button>
              </Box>

              <TextField
                label="User name"
                fullWidth
                margin="normal"
                value={studentData.username}
                onChange={(e) => setStudentData({ ...studentData, username: e.target.value })}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={studentData.password}
                onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={studentData.startDate}
                onChange={(e) => setStudentData({ ...studentData, startDate: e.target.value })}
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={studentData.endDate}
                onChange={(e) => setStudentData({ ...studentData, endDate: e.target.value })}
              />
              <TextField
                label="Note"
                fullWidth
                margin="normal"
                value={studentData.note}
                onChange={(e) => setStudentData({ ...studentData, note: e.target.value })}
              />
              <MDBox display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="text"
                  sx={{ color: colors.midGreen, "&:hover": { color: colors.darkGreen } }}
                  onClick={() => navigate("/students")}
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

export default CreateStudent;
