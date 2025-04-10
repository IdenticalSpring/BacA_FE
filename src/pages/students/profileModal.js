import React, { useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { colors } from "assets/theme/color";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import studentService from "services/studentService"; // Import studentService
import { message } from "antd"; // Để hiển thị thông báo (nếu bạn dùng antd)

const StudentProfileModal = ({ open, onClose, student, onStudentUpdated }) => {
  // Nếu không có student, trả về null
  if (!student) return null;

  const [editMode, setEditMode] = useState(false); // Trạng thái chỉnh sửa
  const [showPassword, setShowPassword] = useState(false); // Toggle hiển thị mật khẩu
  const [formData, setFormData] = useState({
    name: student.name || "",
    username: student.username || "",
    password: student.password || "",
    imgUrl: student.imgUrl || "",
    file: null, // Để lưu file upload mới
  });
  const [previewImage, setPreviewImage] = useState(student.imgUrl || ""); // Hiển thị ảnh preview
  const fileInputRef = React.useRef(null);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý upload file ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // Cập nhật ảnh preview
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý lưu thay đổi
  const handleSave = async () => {
    try {
      const updatedData = {
        name: formData.name,
        username: formData.username,
        password: formData.password,
      };

      const updatedStudent = await studentService.editStudent(
        student.id,
        updatedData,
        formData.file
      );
      setFormData({
        name: updatedStudent.name || "",
        username: updatedStudent.username || "",
        password: updatedStudent.password || "",
        imgUrl: updatedStudent.imgUrl || "",
        file: null,
      });
      setPreviewImage(updatedStudent.imgUrl || "");
      setEditMode(false);
      message.success("Profile updated successfully!");

      // Gọi callback để cập nhật dữ liệu ở parent component (nếu có)
      if (onStudentUpdated) {
        onStudentUpdated(updatedStudent);
      }
    } catch (error) {
      message.error("Error updating profile: " + (error.message || "Unknown error"));
    }
  };

  // Chuyển sang chế độ chỉnh sửa
  const handleEdit = () => {
    setEditMode(true);
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      name: student.name || "",
      username: student.username || "",
      password: student.password || "",
      imgUrl: student.imgUrl || "",
      file: null,
    });
    setPreviewImage(student.imgUrl || "");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ backgroundColor: colors.deepGreen, color: colors.white }}>
        Student Profile
      </DialogTitle>
      <DialogContent>
        {/* Avatar */}
        <Box sx={{ mt: 3, mb: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Student Avatar
          </Typography>
          <Box display="flex" justifyContent="center" mb={2}>
            <Avatar
              src={previewImage}
              alt={formData.name}
              sx={{
                width: 100,
                height: 100,
                border: `1px solid ${colors.lightGrey}`,
              }}
            >
              {formData.name ? formData.name.charAt(0) : ""}
            </Avatar>
          </Box>
          {editMode && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current.click()}
                sx={{
                  borderColor: colors.midGreen,
                  color: colors.darkGreen,
                  "&:hover": {
                    borderColor: colors.highlightGreen,
                    backgroundColor: "rgba(0, 128, 0, 0.04)",
                  },
                }}
              >
                Upload New Avatar
              </Button>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </Box>
          )}
        </Box>

        {/* Name */}
        <TextField
          label="Name"
          name="name"
          fullWidth
          margin="normal"
          value={formData.name}
          onChange={handleInputChange}
          InputProps={{
            readOnly: !editMode,
          }}
          sx={{
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "black",
            },
          }}
        />

        {/* Username */}
        <TextField
          label="User name"
          name="username"
          fullWidth
          margin="normal"
          value={formData.username}
          onChange={handleInputChange}
          InputProps={{
            readOnly: !editMode,
          }}
          sx={{
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "black",
            },
          }}
        />

        {/* Password */}
        <TextField
          label="Password"
          name="password"
          fullWidth
          margin="normal"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleInputChange}
          InputProps={{
            readOnly: !editMode,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: "black",
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        {editMode ? (
          <>
            <Button
              onClick={handleCancel}
              sx={{ color: colors.midGreen, "&:hover": { color: colors.darkGreen } }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              sx={{
                backgroundColor: colors.midGreen,
                color: colors.white,
                "&:hover": { backgroundColor: colors.highlightGreen },
              }}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleEdit}
              sx={{ color: colors.midGreen, "&:hover": { color: colors.darkGreen } }}
            >
              Edit
            </Button>
            <Button
              onClick={onClose}
              sx={{ color: colors.midGreen, "&:hover": { color: colors.darkGreen } }}
            >
              Close
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Khai báo PropTypes
StudentProfileModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Thêm id
    imgUrl: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
    password: PropTypes.string,
  }).isRequired, // student giờ là bắt buộc vì cần id để edit
  onStudentUpdated: PropTypes.func, // Callback để cập nhật dữ liệu ở parent
};

export default StudentProfileModal;
