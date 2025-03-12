import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { useNavigate } from "react-router-dom";
import lessonService from "services/lessonService";
import { MenuItem } from "@mui/material";
const levels = [
  "Level Pre-1",
  "Level 1",
  "Starters",
  "Level-KET",
  "Movers",
  "Flyers",
  "Pre-KET",
  "level-PET",
];
function Lessons() {
  const navigate = useNavigate();
  const [columns] = useState([
    { Header: "Lesson Name", accessor: "name", width: "30%" },
    { Header: "Level", accessor: "level", width: "10%" },
    { Header: "Link", accessor: "link", width: "30%" },
    { Header: "Description", accessor: "description", width: "30%" },
    { Header: "Actions", accessor: "actions", width: "20%" },
  ]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonData, setLessonData] = useState({ name: "", level: "", link: "", description: "" });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const data = await lessonService.getAllLessons();
      const formattedRows = data.map((lesson) => ({
        id: lesson.id,
        name: lesson.name,
        level: lesson.level,
        link: lesson.link,
        description: lesson.description,
        actions: (
          <>
            <IconButton color="primary" onClick={() => handleEdit(lesson)}>
              <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => handleDelete(lesson.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
      }));
      setRows(formattedRows);
    } catch (err) {
      setError("Lỗi khi tải dữ liệu bài học!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditMode(true);
    setSelectedLesson(lesson);
    setLessonData({
      name: lesson.name,
      level: lesson.level,
      link: lesson.link,
      description: lesson.description,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài học này?")) {
      try {
        await lessonService.deleteLesson(id);
        setRows(rows.filter((row) => row.id !== id));
      } catch (err) {
        alert("Lỗi khi xóa bài học!");
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await lessonService.editLesson(selectedLesson.id, lessonData);

        setRows(
          rows.map((row) =>
            row.id === selectedLesson.id
              ? {
                  ...row,
                  ...lessonData,
                  actions: (
                    <>
                      <IconButton color="primary" onClick={() => handleEdit(selectedLesson)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDelete(selectedLesson.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  ),
                }
              : row
          )
        );
      } else {
        const createdLesson = await lessonService.createLesson(lessonData);
        setRows([
          ...rows,
          {
            id: createdLesson.id,
            name: createdLesson.name,
            level: createdLesson.level,
            link: createdLesson.link,
            description: createdLesson.description,
            actions: (
              <>
                <IconButton color="primary" onClick={() => handleEdit(createdLesson)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleDelete(createdLesson.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            ),
          },
        ]);
      }

      setOpen(false);
      setLessonData({ name: "", level: "", link: "", description: "" });
      setEditMode(false);
    } catch (err) {
      alert(editMode ? "Lỗi khi chỉnh sửa bài học!" : "Lỗi khi tạo bài học!");
    }
  };
  //   console.log("Lesson -> rows", rows);
  //   console.log(selectedLesson, lessonData);
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
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Lesson Tables
                </MDTypography>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => navigate("/lessons/create-lesson")}
                >
                  Create
                </Button>
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
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editMode ? "Edit Lesson" : "Create"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Lesson Name"
            fullWidth
            margin="normal"
            value={lessonData.name}
            onChange={(e) => setLessonData({ ...lessonData, name: e.target.value })}
          />
          <TextField
            select
            label="level"
            fullWidth
            sx={{
              "& .css-1cohrqd-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select":
                {
                  minHeight: "48px", // Đặt lại chiều cao tối thiểu
                  display: "flex",
                  alignItems: "center",
                },
            }}
            margin="normal"
            value={lessonData.level}
            onChange={(e) => {
              setLessonData({ ...lessonData, level: e.target.value });
              // console.log(e.target.value, +e.target.value);
            }}
          >
            {levels.map((d, index) => (
              <MenuItem key={index} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Lesson Link"
            fullWidth
            margin="normal"
            value={lessonData.link}
            onChange={(e) => setLessonData({ ...lessonData, link: e.target.value })}
          />
          <TextField
            label="Lesson Description"
            fullWidth
            margin="normal"
            value={lessonData.description}
            onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} color="primary">
            {editMode ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Lessons;
