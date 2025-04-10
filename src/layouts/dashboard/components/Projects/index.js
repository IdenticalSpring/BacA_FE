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
import feedbackService from "services/feedbackService";

// Service

function Projects() {
  const [menu, setMenu] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const feedbacksPerPage = 5; // Số feedback mỗi trang

  // Lấy dữ liệu feedback khi component mount
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbackData = await feedbackService.getAllFeedback();
        setFeedbacks(feedbackData);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
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

  // Định nghĩa cột cho DataTable
  const columns = [
    {
      Header: "Student",
      accessor: "avatar",
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

  // Tính toán dữ liệu phân trang
  const indexOfLastFeedback = currentPage * feedbacksPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
  const currentFeedbacks = feedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);

  // Chuẩn bị dữ liệu cho rows
  const rows = currentFeedbacks.map((feedback) => ({
    avatar: <MDAvatar src={feedback.student.imgUrl} alt={feedback.student.name} size="sm" />,
    title: (
      <MDTypography variant="button" fontWeight="regular" color="text">
        {feedback.title}
      </MDTypography>
    ),
  }));

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Student Feedbacks
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <MDTypography variant="button" fontWeight="regular" color="text">
               <strong>{feedbacks.length} feedbacks</strong> received
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
          // table={{ columns, rows }}
          // showTotalEntries={true} // Hiển thị tổng số entries
          // isSorted={false}
          // noEndBorder
          // entriesPerPage={false} // Cấu hình phân trang
          // canSearch={false} // Không cần tìm kiếm
          // pagination={{ variant: "gradient", color: "info" }} // Kiểu phân trang
          // onPageChange={handlePageChange} // Xử lý khi đổi trang
          // totalEntries={feedbacks.length} // Tổng số feedback
          table={{ columns: columns, rows: rows }}
          isSorted={false}
          entriesPerPage={false}
          showTotalEntries={false}
          noEndBorder
        />
      </MDBox>
    </Card>
  );
}

export default Projects;
