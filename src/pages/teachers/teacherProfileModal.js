import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { colors } from "assets/theme/color"; // Giả sử bạn có file màu này
import teacherService from "services/teacherService";

const TeacherProfileModal = ({ open, onClose, teacher }) => {
  const [editMode, setEditMode] = useState(false);
  const [teacherData, setTeacherData] = useState({
    name: "",
    username: "",
    password: "",
    startDate: "",
    endDate: "",
  });
  const [files, setFiles] = useState([]);

  // Khi teacher thay đổi, cập nhật teacherData
  useEffect(() => {
    if (teacher) {
      setTeacherData({
        name: teacher.name || "",
        username: teacher.username || "",
        password: teacher.password || "",
        startDate: teacher.startDate || "",
        endDate: teacher.endDate || "",
      });
    }
  }, [teacher]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSave = async () => {
    try {
      if (teacher && teacher.id) {
        const updatedTeacher = await teacherService.editTeacher(teacher.id, teacherData, files);
        setTeacherData({
          name: updatedTeacher.name,
          username: updatedTeacher.username,
          password: updatedTeacher.password,
          startDate: updatedTeacher.startDate,
          endDate: updatedTeacher.endDate,
        });
        setFiles([]); // Reset files sau khi lưu
        setEditMode(false); // Thoát chế độ chỉnh sửa
        alert("Teacher updated successfully!");
      }
    } catch (err) {
      alert("Error updating teacher: " + err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ backgroundColor: colors.deepGreen, color: colors.white }}>
        {editMode ? "Edit Teacher Profile" : "Teacher Profile"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={teacherData.name}
          onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
          disabled={!editMode} // Chỉ cho phép chỉnh sửa khi ở editMode
        />
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={teacherData.username}
          onChange={(e) => setTeacherData({ ...teacherData, username: e.target.value })}
          disabled={!editMode}
        />
        <TextField
          label="Password"
          fullWidth
          margin="normal"
          value={teacherData.password}
          onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })}
          disabled={!editMode}
        />
        <TextField
          fullWidth
          margin="normal"
          type="date"
          label="Start Date"
          InputLabelProps={{ shrink: true }}
          value={teacherData.startDate}
          onChange={(e) => setTeacherData({ ...teacherData, startDate: e.target.value })}
          disabled={!editMode}
        />
        <TextField
          fullWidth
          margin="normal"
          type="date"
          label="End Date"
          InputLabelProps={{ shrink: true }}
          value={teacherData.endDate}
          onChange={(e) => setTeacherData({ ...teacherData, endDate: e.target.value })}
          disabled={!editMode}
        />
        {editMode && (
          <TextField
            fullWidth
            margin="normal"
            type="file"
            label="Upload Files"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*, .pdf", multiple: true }}
            onChange={handleFileChange}
          />
        )}
        {!editMode && teacher && teacher.fileUrls && (
          <div style={{ marginTop: "16px" }}>
            <strong>Files:</strong>
            {teacher.fileUrls.length > 0 ? (
              teacher.fileUrls.map((url, index) => (
                <div key={index}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    File {index + 1}
                  </a>
                </div>
              ))
            ) : (
              <p>No file</p>
            )}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        {!editMode && (
          <Button
            onClick={() => setEditMode(true)}
            sx={{ color: colors.midGreen, "&:hover": { color: colors.darkGreen } }}
          >
            Edit
          </Button>
        )}
        {editMode && (
          <>
            <Button
              onClick={() => {
                setEditMode(false);
                setFiles([]);
                setTeacherData({
                  name: teacher?.name || "",
                  username: teacher?.username || "",
                  password: teacher?.password || "",
                  startDate: teacher?.startDate || "",
                  endDate: teacher?.endDate || "",
                });
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
          </>
        )}
        <Button
          onClick={onClose}
          sx={{ color: colors.midGreen, "&:hover": { color: colors.darkGreen } }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Thêm PropTypes để xác thực props
TeacherProfileModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  teacher: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Thêm id để edit
    name: PropTypes.string,
    username: PropTypes.string,
    password: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    fileUrls: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default TeacherProfileModal;
