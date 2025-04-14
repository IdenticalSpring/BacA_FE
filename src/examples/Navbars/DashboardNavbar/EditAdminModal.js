// src/components/EditAdminModal.js
import { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes for validation
import Modal from "@mui/material/Modal";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import adminService from "services/adminService";

const EditAdminModal = ({ open, handleClose, adminId }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch admin data when modal opens
  useEffect(() => {
    if (open && adminId) {
      const fetchAdminData = async () => {
        setLoading(true);
        try {
          const adminData = await adminService.getAdminById(adminId);
          setUsername(adminData.username || "");
          // Password is usually not returned by API for security; leave it empty or handle as needed
          setPassword(adminData.password || ""); // Adjust if your API returns a placeholder or hashed password
        } catch (err) {
          setError(err.message || "Error fetching admin data");
        } finally {
          setLoading(false);
        }
      };
      fetchAdminData();
    }
  }, [open, adminId]);

  const handleSubmit = async () => {
    try {
      // Only send updated fields
      const updatedData = {};
      if (username) updatedData.username = username;
      if (password) updatedData.password = password;

      await adminService.editAdmin(adminId, updatedData);
      handleClose();
      alert("Admin updated successfully!");
    } catch (err) {
      setError(err.message || "Error updating admin");
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <MDBox
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <h2>Edit Admin</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading ? (
          <p>Loading admin data...</p>
        ) : (
          <>
            <MDInput
              label="Username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
            <MDInput
              label="Password"
              //   type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Enter new password (optional)"
            />
            <MDBox display="flex" justifyContent="space-between">
              <MDButton variant="gradient" color="info" onClick={handleSubmit} disabled={loading}>
                Save
              </MDButton>
              <MDButton
                variant="outlined"
                color="secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </MDButton>
            </MDBox>
          </>
        )}
      </MDBox>
    </Modal>
  );
};

// PropTypes validation to fix ESLint errors
EditAdminModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  adminId: PropTypes.string.isRequired, // Assuming adminId is a string; adjust if it's a number
};

export default EditAdminModal;
