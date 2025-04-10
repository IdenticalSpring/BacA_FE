/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React examples
import DataTable from "examples/Tables/DataTable";
import teacherFeedbackService from "services/teacherFeedbackService"; // Import service

function OrdersOverview() {
  const [menu, setMenu] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const feedbacksPerPage = 5;

  // Fetch teacher feedback data when component mounts
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbackData = await teacherFeedbackService.getAllteacherFeedbackk();
        setFeedbacks(feedbackData);
      } catch (error) {
        console.error("Error fetching teacher feedbacks:", error);
      }
    };

    fetchFeedbacks();
  }, []);

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem onClick={closeMenu}>Action</MenuItem>
      <MenuItem onClick={closeMenu}>Another action</MenuItem>
      <MenuItem onClick={closeMenu}>Something else</MenuItem>
    </Menu>
  );

  // Define columns for DataTable
  const columns = [
    {
      Header: "Teacher Name",
      accessor: "name",
      width: "15%",
      align: "center",
    },
    {
      Header: "Feedback Title",
      accessor: "title",
      width: "60%",
      align: "left",
    },
  ];

  // Calculate pagination data
  const indexOfLastFeedback = currentPage * feedbacksPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
  const currentFeedbacks = feedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);

  // Prepare data for rows
  const rows = currentFeedbacks.map((feedback) => ({
    name: (
      <MDTypography variant="button" fontWeight="regular" color="text">
        {feedback.teacher?.name}
      </MDTypography>
    ),
    title: (
      <MDTypography variant="button" fontWeight="regular" color="text">
        {feedback.title}
      </MDTypography>
    ),
  }));

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Teacher Feedback
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;<strong>{feedbacks.length} feedbacks</strong> received
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox color="text" px={2}>
          <Icon sx={{ cursor: "pointer", fontWeight: "bold" }} fontSize="small" onClick={openMenu}>
            more_vert
          </Icon>
        </MDBox>
        {renderMenu}
      </MDBox>
      <MDBox>
        <DataTable
          table={{ columns, rows }}
          isSorted={false}
          entriesPerPage={false}
          showTotalEntries={false}
          noEndBorder
        />
      </MDBox>
    </Card>
  );
}

export default OrdersOverview;
