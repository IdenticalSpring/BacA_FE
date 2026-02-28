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
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import studentService from "services/studentService";
import { message } from "antd";

const StudentProfileModal = ({ open, onClose, student, onStudentUpdated }) => {
  if (!student) return null;

  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: student.name || "",
    username: student.username || "",
    imgUrl: student.imgUrl || "",
    file: null,
  });
  const [previewImage, setPreviewImage] = useState(student.imgUrl || "");
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

  // Xử lý lưu thay đổi profile (không bao gồm password)
  const handleSave = async () => {
    try {
      const updatedData = {
        name: formData.name,
        username: formData.username,
      };

      const updatedStudent = await studentService.editStudent(
        student.id,
        updatedData,
        formData.file
      );
      setFormData({
        name: updatedStudent.name || "",
        username: updatedStudent.username || "",
        imgUrl: updatedStudent.imgUrl || "",
        file: null,
      });
      setPreviewImage(updatedStudent.imgUrl || "");
      setEditMode(false);
      message.success("Cập nhật thông tin thành công!");

      if (onStudentUpdated) {
        onStudentUpdated(updatedStudent);
      }
    } catch (error) {
      message.error("Lỗi cập nhật: " + (error.message || "Lỗi không xác định"));
    }
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.trim() === "") {
      message.error("Mật khẩu mới không được để trống!");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (newPassword.length < 4) {
      message.error("Mật khẩu phải có ít nhất 4 ký tự!");
      return;
    }

    setChangingPassword(true);
    try {
      await studentService.changePassword(student.id, newPassword);
      message.success("Đổi mật khẩu thành công! Lần đăng nhập sau bạn sẽ cần nhập mật khẩu.");
      setShowChangePassword(false);
      setNewPassword("");
      setConfirmPassword("");

      // Cập nhật lại student data
      if (onStudentUpdated) {
        onStudentUpdated({ ...student, hasCustomPassword: true });
      }
    } catch (error) {
      message.error("Lỗi đổi mật khẩu: " + (error || "Lỗi không xác định"));
    } finally {
      setChangingPassword(false);
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

        {/* Mật khẩu - Section đổi mật khẩu */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {student.hasCustomPassword ? (
                <LockIcon sx={{ color: colors.deepGreen, fontSize: 20 }} />
              ) : (
                <LockOpenIcon sx={{ color: colors.midGreen, fontSize: 20 }} />
              )}
              <Typography variant="body2" color="textSecondary">
                {student.hasCustomPassword
                  ? "Tài khoản đã đặt mật khẩu"
                  : "Tài khoản chưa đặt mật khẩu (đăng nhập không cần mật khẩu)"}
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => setShowChangePassword(!showChangePassword)}
              sx={{
                color: colors.deepGreen,
                textTransform: "none",
                fontSize: "13px",
                "&:hover": { color: colors.darkGreen },
              }}
            >
              {showChangePassword
                ? "Hủy"
                : student.hasCustomPassword
                ? "Đổi mật khẩu"
                : "Đặt mật khẩu"}
            </Button>
          </Box>

          {showChangePassword && (
            <Box
              sx={{
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                padding: "16px",
                border: `1px solid ${colors.lightGreen || "#e0e0e0"}`,
              }}
            >
              <TextField
                label="Mật khẩu mới"
                fullWidth
                margin="dense"
                size="small"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Xác nhận mật khẩu"
                fullWidth
                margin="dense"
                size="small"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleChangePassword}
                disabled={changingPassword}
                sx={{
                  mt: 1,
                  backgroundColor: colors.deepGreen,
                  "&:hover": { backgroundColor: colors.darkGreen },
                  textTransform: "none",
                }}
              >
                {changingPassword
                  ? "Đang xử lý..."
                  : student.hasCustomPassword
                  ? "Cập nhật mật khẩu"
                  : "Đặt mật khẩu"}
              </Button>
            </Box>
          )}
        </Box>
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
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    imgUrl: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
    password: PropTypes.string,
    hasCustomPassword: PropTypes.bool,
  }).isRequired,
  onStudentUpdated: PropTypes.func,
};

export default StudentProfileModal;
