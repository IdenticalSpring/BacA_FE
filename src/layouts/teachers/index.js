import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import axios from "axios";

function Teachers() {
  const [columns, setColumns] = useState([
    { Header: "ID", accessor: "id", width: "10%" },
    { Header: "Name", accessor: "name", width: "30%" },
    { Header: "Level", accessor: "level", width: "30%" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/teachers");
        const data = response.data;

        // Chuyển dữ liệu thành format của DataTable
        const formattedRows = data.map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
          level: teacher.level,
        }));

        setRows(formattedRows);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu giáo viên!");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

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
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Teachers Table
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDTypography variant="h6" color="info" align="center">
                    Đang tải dữ liệu...
                  </MDTypography>
                ) : error ? (
                  <MDTypography variant="h6" color="error" align="center">
                    {error}
                  </MDTypography>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
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
    </DashboardLayout>
  );
}

export default Teachers;
