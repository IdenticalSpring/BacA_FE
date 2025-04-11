import { useState, useEffect, useCallback, useRef } from "react";
import { Card, TextField, Grid, Button } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import { colors } from "assets/theme/color";
import MDTypography from "components/MDTypography";
import { message, Spin } from "antd";
import ReactQuill from "react-quill";
import axios from "axios";
import notificationService from "services/notificationService";
import Compressor from "compressorjs";
export default function CreateNotificationByAdmin() {
  const [notificationData, setNotificationData] = useState({
    title: "",
    general: true,
    detail: "",
  });
  const [loadingCreateNotification, setLoadingCreateNotification] = useState(false);
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);

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
          e.preventDefault(); // chặn mặc định Quill xử lý

          const file = item.getAsFile();

          if (!file) return;

          // 👇 Resize trước khi upload như trong imageHandler
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

          break; // chỉ xử lý ảnh đầu tiên
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

      // const formData = new FormData();
      // formData.append("file", file);
      // // console.log([...formData]);

      // try {
      //   const response = await axios.post(
      //     process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
      //     formData
      //   );
      //   // console.log(response.data.url);

      //   // const result = await response.json();

      //   if (response.status === 201 && quillRef.current) {
      //     const editor = quillRef.current.getEditor();
      //     const range = editor.getSelection(true);
      //     editor.insertEmbed(range.index, "image", response.data.url);
      //   } else {
      //     message.error("Upload failed. Try again!");
      //   }
      // } catch (error) {
      //   console.error("Error uploading image:", error);
      //   message.error("Upload error. Please try again!");
      // }
      new Compressor(file, {
        quality: 0.8, // Giảm dung lượng, 1 là giữ nguyên
        maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
        maxHeight: 800, // Optional, resize chiều cao nếu cần
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
  const handleSaveNotification = async () => {
    try {
      setLoadingCreateNotification(true);
      const res = await notificationService.createNotification(notificationData);
      message.success("Create notification succsess!");
    } catch (err) {
      message.error("Create notification failed!");
    } finally {
      setLoadingCreateNotification(false);
    }
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid
          container
          sx={{
            display: "flex",
            gap: "30px",
            justifyContent: "center", // Custom gap size
          }}
        >
          <Grid
            item
            xs={10}
            // md={5.5}
            sx={{
              borderRadius: "20px",
              backgroundColor: colors.white,
              padding: "20px", // Add padding instead of margin
            }}
          >
            <Card
              sx={{
                padding: 3,
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Màu nền trong suốt nhẹ
                backdropFilter: "blur(10px)", // Hiệu ứng kính mờ
                boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)", // Đổ bóng nhẹ
                borderRadius: "12px", // Bo góc
                border: "1px solid rgba(255, 255, 255, 0.3)", // Viền nhẹ
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
                  value={notificationData.title}
                  onChange={(e) =>
                    setNotificationData({ ...notificationData, title: e.target.value })
                  }
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
                    marginBottom: "60px", // Consider reducing this
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
    </DashboardLayout>
  );
}
