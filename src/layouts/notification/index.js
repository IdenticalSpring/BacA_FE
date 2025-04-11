import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  TextField,
  Grid,
  Button,
  IconButton,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import { colors } from "assets/theme/color";
import MDTypography from "components/MDTypography";
import { Form, Input, message, Modal, notification, Radio, Spin, Select } from "antd";
import ReactQuill from "react-quill";
import axios from "axios";
import notificationService from "services/notificationService";
import PropTypes from "prop-types";
import Compressor from "compressorjs";
import DataTable from "examples/Tables/DataTable";
import { EditIcon } from "lucide-react";
import { DeleteFilled } from "@ant-design/icons";

const typeOptions = [
  { label: "Teacher", value: true },
  { label: "Student", value: false },
];

// Thêm tùy chọn cho bộ lọc
const filterOptions = [
  { label: "All", value: "all" },
  { label: "Teacher", value: true },
  { label: "Student", value: false },
];

export default function CreateNotificationByAdmin() {
  const [notificationData, setNotificationData] = useState({
    title: "",
    type: true,
    general: true,
    detail: "",
  });
  const [loadingCreateNotification, setLoadingCreateNotification] = useState(false);
  const quillRef = useRef(null);
  const quillUpdateRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [type, setType] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editNotification, setEditNotification] = useState(null);
  const [form] = Form.useForm();
  const [loadingUpdateNotification, setLoadingUpdateNotification] = useState(false);
  const [title, setTitle] = useState("");
  const [onSaveUpdate, setOnSaveUpdate] = useState(false);
  const [filterType, setFilterType] = useState("all"); // Thêm state cho bộ lọc
  const [columns] = useState([
    {
      Header: "Notification Title",
      accessor: "title",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.title}
        </span>
      ),
    },
    {
      Header: "Create Date",
      accessor: "createdAt",
      width: "10%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {(row.values.createdAt &&
            new Date(row.values.createdAt).toLocaleDateString("vi-VN", {
              timeZone: "UTC",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })) ||
            "Không có ngày"}
        </span>
      ),
    },
    {
      Header: "Detail",
      accessor: "detail",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          <div
            style={{ maxWidth: "100%", overflow: "auto", margin: "10px 0" }}
            dangerouslySetInnerHTML={{
              __html: row.values.detail?.replace(/<[^>]*>?/gm, "") || " ",
            }}
          />
        </span>
      ),
    },
    {
      Header: "Send For",
      accessor: "type",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
        >
          {row.values.type ? "Teacher" : "Student"}
        </span>
      ),
    },
    {
      Header: "Actions",
      accessor: "actions",
      width: "20%",
    },
  ]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      setQuill(editor);
    }
  }, [quillRef]);

  const toolbar = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "code-block"],
    ["link", "image"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
  ];

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "align",
  ];

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const handlePaste = (e) => {
      const clipboardData = e.clipboardData;
      const items = clipboardData?.items;

      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = item.getAsFile();

          if (!file) return;

          new Compressor(file, {
            quality: 0.8,
            maxWidth: 800,
            success(compressedFile) {
              const formData = new FormData();
              formData.append("file", compressedFile);

              axios
                .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
                .then((response) => {
                  if (response.status === 201) {
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, "image", response.data.url);
                  } else {
                    message.error("Upload failed. Try again!");
                  }
                })
                .catch((err) => {
                  console.error("Upload error:", err);
                  message.error("Upload error. Please try again!");
                });
            },
            error(err) {
              console.error("Compression error:", err);
              message.error("Image compression failed!");
            },
          });

          break;
        }
      }
    };

    const editor = quill?.root;
    editor?.addEventListener("paste", handlePaste);

    return () => {
      editor?.removeEventListener("paste", handlePaste);
    };
  }, [quillRef]);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      new Compressor(file, {
        quality: 0.8,
        maxWidth: 800,
        success(compressedFile) {
          const formData = new FormData();
          formData.append("file", compressedFile);

          axios
            .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
            .then((response) => {
              if (response.status === 201 && quillRef.current) {
                const editor = quillRef.current?.getEditor();
                const range = editor.getSelection(true);
                editor.insertEmbed(range.index, "image", response.data.url);
              } else {
                message.error("Upload failed. Try again!");
              }
            })
            .catch((err) => {
              console.error("Upload error:", err);
              message.error("Upload error. Please try again!");
            });
        },
        error(err) {
          console.error("Compression error:", err);
          message.error("Image compression failed!");
        },
      });
    };
  }, []);

  const modules = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandler,
      },
    },
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await notificationService.deleteNotification(id);
        setOnSaveUpdate(!onSaveUpdate);
        message.success("Notification deleted successfully");
      } catch (err) {
        message.error("Error deleting notification!");
      }
    }
  };

  const handleSaveNotification = async () => {
    try {
      setLoadingCreateNotification(true);
      const dataNoti = {
        ...notificationData,
        type,
        title: title,
        detail: quillRef.current?.getEditor()?.root?.innerHTML || "",
      };
      const res = await notificationService.createNotification(dataNoti);
      const rowRes = {
        ...res,
        actions: (
          <>
            <IconButton
              sx={{
                color: colors.midGreen,
                " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
              }}
              onClick={() => handleEdit(res)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              sx={{
                color: colors.errorRed,
                " &:hover": { backgroundColor: colors.errorRed, color: colors.white },
              }}
              onClick={() => handleDelete(res.id)}
            >
              <DeleteFilled />
            </IconButton>
          </>
        ),
      };
      message.success("Create notification succsess!");
      setRows([...rows, rowRes]);
    } catch (err) {
      message.error("Create notification failed!");
    } finally {
      setLoadingCreateNotification(false);

      setTitle("");
      setType(true);

      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        editor.setContents([]);
      }
    }
  };

  const onChangeType = ({ target: { value } }) => {
    setType(value);
  };

  const handleEdit = (notification) => {
    setEditMode(true);
    setSelectedNotification(notification);
    form.setFieldsValue({
      title: notification.title,
      type: notification.type,
    });
  };

  useEffect(() => {
    setTimeout(() => {
      if (editMode && quillUpdateRef.current?.getEditor() && selectedNotification?.detail) {
        setTimeout(() => {
          quillUpdateRef.current?.getEditor().setContents([]);
          quillUpdateRef.current
            ?.getEditor()
            .clipboard.dangerouslyPasteHTML(0, selectedNotification.detail);
        }, 100);
      }
    }, 500);
  }, [editMode, selectedNotification]);

  useEffect(() => {
    fetchNotifications();
  }, [onSaveUpdate]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAllGeneralNotifications();
      const formattedRows = data.map((notification) => ({
        id: notification.id,
        title: notification.title,
        createdAt: notification.createdAt,
        detail: notification.detail,
        type: notification.type,
        actions: (
          <>
            <IconButton
              sx={{
                color: colors.midGreen,
                " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
              }}
              onClick={() => handleEdit(notification)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              sx={{
                color: colors.errorRed,
                " &:hover": { backgroundColor: colors.errorRed, color: colors.white },
              }}
              onClick={() => handleDelete(notification.id)}
            >
              <DeleteFilled />
            </IconButton>
          </>
        ),
      }));
      setRows(formattedRows);
    } catch (err) {
      setError("error fetching notification!" + err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUpdateNotification = async () => {
    try {
      setLoadingUpdateNotification(true);
      const values = await form.validateFields();
      const dataNoti = {
        title: values.title,
        type: values.type,
        detail: quillUpdateRef.current?.getEditor()?.root?.innerHTML || "",
      };
      if (selectedNotification) {
        await notificationService.editNotification(selectedNotification?.id, dataNoti);
        message.success("Notification updated successfully");
      }
      setEditMode(false);
      form.resetFields();
      setOnSaveUpdate(!onSaveUpdate);
    } catch (err) {
      message.error("Please check your input and try again " + err);
    } finally {
      setLoadingUpdateNotification(false);
    }
  };

  // Hàm lọc dữ liệu dựa trên filterType
  const filteredRows = rows.filter((row) => {
    if (filterType === "all") return true;
    return row.type === filterType;
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid
          container
          sx={{
            display: "flex",
            gap: "30px",
            justifyContent: "center",
          }}
        >
          <Grid
            item
            xs={10}
            sx={{
              borderRadius: "20px",
              backgroundColor: colors.white,
              padding: "20px",
            }}
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
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                borderRadius="lg"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ backgroundColor: colors.deepGreen, color: colors.white }}
              >
                <MDTypography variant="h6" color="white">
                  Create Notification
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <TextField
                  label="Notification Title"
                  fullWidth
                  margin="normal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <MDTypography variant="h6" sx={{ color: "#7b809a", margin: "10px" }}>
                  Send Notification For
                </MDTypography>
                <Radio.Group
                  options={typeOptions}
                  onChange={onChangeType}
                  value={type}
                  optionType="button"
                />
                <MDTypography variant="h6" sx={{ color: "#7b809a", margin: "10px" }}>
                  Notification Detail
                </MDTypography>
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={quillFormats}
                  ref={quillRef}
                  style={{
                    height: "250px",
                    marginBottom: "60px",
                    borderRadius: "6px",
                    border: `1px solid ${colors.inputBorder}`,
                  }}
                  value={notificationData.detail}
                  onChange={(e) => setNotificationData({ ...notificationData, detail: e })}
                />
              </MDBox>
              <MDBox display="flex" justifyContent="end" mt={3}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: colors.midGreen,
                    color: colors.white,
                    " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                  }}
                  onClick={handleSaveNotification}
                >
                  {loadingCreateNotification && (
                    <Spin size="small" style={{ marginRight: "10px" }} />
                  )}
                  Create
                </Button>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <MDBox pt={6} pb={3}>
        <Grid
          container
          sx={{
            display: "flex",
            gap: "30px",
            justifyContent: "center",
          }}
        >
          <Grid
            item
            xs={10}
            sx={{
              borderRadius: "20px",
              backgroundColor: colors.white,
              padding: "20px",
            }}
          >
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <MDTypography variant="h6" sx={{ color: "#7b809a" }}>
                Filter Notifications
              </MDTypography>
              <Select
                value={filterType}
                onChange={(value) => setFilterType(value)}
                style={{ width: 200 }}
                options={filterOptions}
              />
            </MDBox>
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
                table={{ columns, rows: filteredRows }} // Sử dụng filteredRows thay vì rows
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            )}
          </Grid>
        </Grid>
      </MDBox>
      <Dialog
        open={editMode}
        onClose={() => {
          setEditMode(false);
          form.resetFields();
          setEditNotification(null);
        }}
        fullWidth
        maxWidth="xl"
        PaperProps={{
          sx: {
            width: "90vw",
            height: "90vh",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>{"Edit Notification"}</DialogTitle>
        <DialogContent sx={{ height: "100%", overflowY: "auto" }}>
          <Card
            sx={{
              padding: 3,
              backgroundColor: colors.white,
              backdropFilter: "blur(10px)",
              boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              height: "90%",
            }}
          >
            <Form
              form={form}
              layout="vertical"
              name="notificationForm"
              initialValues={{
                title: "",
                detail: "",
                type: "",
              }}
            >
              <Form.Item name="title" label="Notification Title">
                <Input placeholder="Input title" />
              </Form.Item>
              <Form.Item name="type" label="Notification For">
                <Radio.Group options={typeOptions} optionType="button" />
              </Form.Item>
              <Form.Item label="Description">
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={quillFormats}
                  ref={quillUpdateRef}
                  style={{
                    height: "250px",
                    marginBottom: "60px",
                    borderRadius: "6px",
                    border: `1px solid ${colors.inputBorder}`,
                  }}
                />
              </Form.Item>
            </Form>
          </Card>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.paleGreen }}>
          <Button onClick={() => setEditMode(false)} sx={{ color: colors.darkGray }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUpdateNotification}
            sx={{
              color: colors.white,
              backgroundColor: colors.safeGreen,
              "&:hover": { backgroundColor: colors.highlightGreen },
            }}
            disabled={loadingUpdateNotification}
          >
            {loadingUpdateNotification ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

CreateNotificationByAdmin.propTypes = {
  row: PropTypes.object,
};
