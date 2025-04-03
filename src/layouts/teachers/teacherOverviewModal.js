import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import DownloadIcon from "@mui/icons-material/Download"; // Thêm icon tải xuống
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import classService from "services/classService";
import lessonService from "services/lessonService";
import homeWorkService from "services/homeWorkService";
import { colors } from "assets/theme/color";

function TeacherOverViewModal({ open, onClose, teacher }) {
  const [classes, setClasses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      fetchTeacherData();
    }
  }, [teacher]);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const classData = await classService.getAllClassesByTeacher(teacher.id);
      setClasses(classData);

      const lessonData = await lessonService.getLessonByTeacherId(teacher.id);
      setLessons(lessonData);

      const homeworkData = await homeWorkService.getHomeWorkByTeacherId(teacher.id);
      setHomeworks(homeworkData);
    } catch (err) {
      console.error("Error fetching teacher data:", err);
    } finally {
      setLoading(false);
    }
  };

  const classColumns = [
    { Header: "Class Name", accessor: "name", width: "50%" },
    { Header: "AccessID", accessor: "accessId", width: "50%" },
  ];

  const lessonColumns = [
    { Header: "Lesson Name", accessor: "name", width: "50%" },
    { Header: "Youtube", accessor: "linkYoutube", width: "50%" },
  ];

  const homeworkColumns = [
    { Header: "Homework Title", accessor: "title", width: "50%" },
    { Header: "Youtube", accessor: "linkYoutube", width: "50%" },
  ];

  const classRows = classes.map((cls) => ({
    name: cls.name,
    accessId: cls.accessId,
  }));

  const lessonRows = lessons.map((ls) => ({
    name: ls.name,
    linkYoutube: ls.linkYoutube,
  }));

  const homeworkRows = homeworks.map((hw) => ({
    title: hw.title,
    linkYoutube: hw.linkYoutube,
  }));

  // Chuyển đổi fileUrl từ chuỗi thành mảng
  const fileUrls = teacher?.fileUrl ? teacher.fileUrl.split(",") : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ backgroundColor: colors.deepGreen, color: colors.white, py: 2 }}>
        <MDTypography variant="h5" color="inherit">
          Teacher Overview: {teacher?.name}
        </MDTypography>
      </DialogTitle>
      <DialogContent sx={{ padding: 3 }}>
        <Grid container spacing={3} direction="column">
          {/* Card Teacher Information */}
          <Grid item xs={12}>
            <Card
              sx={{
                padding: 3,
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                backgroundColor: colors.white,
              }}
            >
              <MDTypography
                variant="h6"
                sx={{ color: colors.deepGreen, fontWeight: "bold", mb: 2 }}
              >
                Teacher Information
              </MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <MDBox display="flex" alignItems="center">
                    <MDTypography
                      variant="body2"
                      sx={{ fontWeight: "medium", minWidth: "120px", color: colors.darkGreen }}
                    >
                      Name:
                    </MDTypography>
                    <MDTypography variant="body2">{teacher?.name || "N/A"}</MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MDBox display="flex" alignItems="center">
                    <MDTypography
                      variant="body2"
                      sx={{ fontWeight: "medium", minWidth: "120px", color: colors.darkGreen }}
                    >
                      Username:
                    </MDTypography>
                    <MDTypography variant="body2">{teacher?.username || "N/A"}</MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MDBox display="flex" alignItems="center">
                    <MDTypography
                      variant="body2"
                      sx={{ fontWeight: "medium", minWidth: "120px", color: colors.darkGreen }}
                    >
                      Start Date:
                    </MDTypography>
                    <MDTypography variant="body2">{teacher?.startDate || "N/A"}</MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <MDBox display="flex" alignItems="center">
                    <MDTypography
                      variant="body2"
                      sx={{ fontWeight: "medium", minWidth: "120px", color: colors.darkGreen }}
                    >
                      End Date:
                    </MDTypography>
                    <MDTypography variant="body2">{teacher?.endDate || "N/A"}</MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12}>
                  <MDBox display="flex" alignItems="center" flexWrap="wrap">
                    <MDTypography
                      variant="body2"
                      sx={{ fontWeight: "medium", minWidth: "120px", color: colors.darkGreen }}
                    >
                      Files:
                    </MDTypography>
                    {fileUrls.length > 0 ? (
                      fileUrls.map((url, index) => (
                        <MDBox key={index} display="flex" alignItems="center" mr={2} mt={1}>
                          <IconButton
                            href={url}
                            download={`teacher_file_${index + 1}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: colors.midGreen,
                              "&:hover": { color: colors.highlightGreen },
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                          <MDTypography variant="body2">
                            <a
                              href={url}
                              download={`teacher_file_${index + 1}`}
                              style={{ textDecoration: "none", color: colors.midGreen }}
                            >
                              File {index + 1}
                            </a>
                          </MDTypography>
                        </MDBox>
                      ))
                    ) : (
                      <MDTypography variant="body2">No file</MDTypography>
                    )}
                  </MDBox>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Card Classes */}
          <Grid item xs={12}>
            <Card
              sx={{
                padding: 3,
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                backgroundColor: colors.white,
              }}
            >
              <MDTypography
                variant="h6"
                sx={{ color: colors.deepGreen, fontWeight: "bold", mb: 2 }}
              >
                Classes
              </MDTypography>
              {loading ? (
                <MDTypography>Loading...</MDTypography>
              ) : (
                <DataTable
                  table={{ columns: classColumns, rows: classRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              )}
            </Card>
          </Grid>

          {/* Card Lessons */}
          <Grid item xs={12}>
            <Card
              sx={{
                padding: 3,
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                backgroundColor: colors.white,
              }}
            >
              <MDTypography
                variant="h6"
                sx={{ color: colors.deepGreen, fontWeight: "bold", mb: 2 }}
              >
                Lessons
              </MDTypography>
              {loading ? (
                <MDTypography>Loading...</MDTypography>
              ) : (
                <DataTable
                  table={{ columns: lessonColumns, rows: lessonRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              )}
            </Card>
          </Grid>

          {/* Card Homeworks */}
          <Grid item xs={12}>
            <Card
              sx={{
                padding: 3,
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                backgroundColor: colors.white,
              }}
            >
              <MDTypography
                variant="h6"
                sx={{ color: colors.deepGreen, fontWeight: "bold", mb: 2 }}
              >
                Homeworks
              </MDTypography>
              {loading ? (
                <MDTypography>Loading...</MDTypography>
              ) : (
                <DataTable
                  table={{ columns: homeworkColumns, rows: homeworkRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              )}
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: colors.midGreen,
            "&:hover": { color: colors.darkGreen, backgroundColor: "rgba(0, 0, 0, 0.04)" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Khai báo PropTypes
TeacherOverViewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  teacher: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    username: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    fileUrl: PropTypes.string,
  }),
};

export default TeacherOverViewModal;
