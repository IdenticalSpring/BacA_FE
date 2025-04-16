import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
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
import { colors } from "assets/theme/color";
import levelService from "services/levelService";
import PropTypes from "prop-types";
import TextArea from "antd/es/input/TextArea";
import { Button, message, Radio } from "antd";
import ReactQuill from "react-quill";
import axios from "axios";
import homeWorkService from "services/homeWorkService";
import LessonDetailModal from "./LessonDetailModal";
import { RobotOutlined, SwapOutlined, UploadOutlined } from "@ant-design/icons";
const genderOptions = [
  { label: "Giọng nam", value: 1 },
  { label: "Giọng nữ", value: 0 },
];
function Lessons() {
  const navigate = useNavigate();
  const [columns] = useState([
    {
      Header: "Lesson Name",
      accessor: "name",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.name}
        </span>
      ),
    },
    {
      Header: "Level",
      accessor: "level",
      width: "10%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.level}
        </span>
      ),
    },
    {
      Header: "Link Youtube",
      accessor: "linkYoutube",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.linkYoutube}
        </span>
      ),
    },
    {
      Header: "Link Game",
      accessor: "linkGame",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.linkGame}
        </span>
      ),
    },
    {
      Header: "Link Speech",
      accessor: "linkSpeech",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.linkSpeech}
        </span>
      ),
    },
    {
      Header: "Teacher",
      accessor: "TeacherId",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.TeacherId}
        </span>
      ),
    },
    {
      Header: "Description",
      accessor: "description",
      width: "30%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {row.values.description}
        </span>
      ),
    },
    {
      Header: "Date",
      accessor: "date",
      width: "20%",
      Cell: ({ row }) => (
        <span
          style={{ cursor: "pointer", textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
          className="truncate-text"
          onClick={() => {
            setSelectedLessonDetail(row.original);
            setDetailModalOpen(true);
          }}
        >
          {new Date(row.values.date).toLocaleDateString()}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const quillRef = useRef(null);
  const quillRefLessonPlan = useRef(null);
  const [quill, setQuill] = useState(null);
  const [quillLessonPlan, setQuillLessonPlan] = useState(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingTTSLesson, setLoadingTTSLesson] = useState(false);
  const [loadingUpdateLesson, setLoadingUpdateLesson] = useState(false);
  const [lessonData, setLessonData] = useState({
    name: "",
    level: "",
    linkYoutube: "",
    linkGame: "",
    linkSpeech: "",
    TeacherId: "",
    description: "",
    date: "", // Dùng chuỗi định dạng YYYY-MM-DD
  });
  const [levels, setLevels] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLessonDetail, setSelectedLessonDetail] = useState(null);
  const [searchTeacher, setSearchTeacher] = useState("");
  const [searchDate, setSearchDate] = useState(""); // State để lưu ngày tìm kiếm
  const [gender, setGender] = useState(1);
  const [htmlContent, setHtmlContent] = useState("");
  const [swapHtmlMode, setSwapHtmlMode] = useState(false);
  const [htmlLessonPlanContent, setHtmlLessonPlanContent] = useState("");
  const [swapHtmlLessonPlanMode, setSwapHtmlLessonPlanMode] = useState(false);
  const [loadingEnhanceLessonPlan, setLoadingEnhanceLessonPlan] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 768;
  const toolbar = [
    [{ font: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    ["link", "image", "video"],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["clean"],
    ["undo", "redo"],
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
    "audio",
    "size",
    // "code-block",
    "font",
    // "code",
    "script",
    "direction",
    "video",
  ];
  const onChangeGender = ({ target: { value } }) => {
    console.log("radio3 checked", value);
    setGender(value);
  };

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      setQuillDescription(editor);
    }
    if (quillRefLessonPlan.current) {
      const editor = quillRefLessonPlan.current.getEditor();
      setQuillLessonPlan(editor);
    }
  }, [quillRef, quillRefLessonPlan]);
  // useEffect(() => {
  //   const quill = quillRef.current?.getEditor();
  //   if (!quill) return;

  //   const handlePaste = (e) => {
  //     const clipboardData = e.clipboardData;
  //     const items = clipboardData?.items;

  //     if (!items) return;

  //     for (const item of items) {
  //       if (item.type.indexOf("image") !== -1) {
  //         e.preventDefault(); // chặn mặc định Quill xử lý

  //         const file = item.getAsFile();

  //         if (!file) return;

  //         // 👇 Resize trước khi upload như trong imageHandler
  //         new Compressor(file, {
  //           quality: 1, // Giảm dung lượng, 1 là giữ nguyên
  //           maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
  //           maxHeight: 800,
  //           success(compressedFile) {
  //             const formData = new FormData();
  //             formData.append("file", compressedFile);

  //             axios
  //               .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
  //               .then((response) => {
  //                 if (response.status === 201) {
  //                   const range = quill.getSelection(true);
  //                   quill.insertEmbed(range.index, "image", response.data.url);
  //                 } else {
  //                   message.error("Upload failed. Try again!");
  //                 }
  //               })
  //               .catch((err) => {
  //                 console.error("Upload error:", err);
  //                 message.error("Upload error. Please try again!");
  //               });
  //           },
  //           error(err) {
  //             console.error("Compression error:", err);
  //             message.error("Image compression failed!");
  //           },
  //         });

  //         break; // chỉ xử lý ảnh đầu tiên
  //       }
  //     }
  //   };

  //   const editor = quill?.root;
  //   editor?.addEventListener("paste", handlePaste);

  //   return () => {
  //     editor?.removeEventListener("paste", handlePaste);
  //   };
  // }, [quillRef]);
  const undoHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const history = quill.history;
      if (history.stack.undo.length > 0) {
        history.undo();
      } else {
        message.warning("No more undo available.");
      }
    }
  }, []);
  const redoHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const history = quill.history;

      if (history.stack.redo.length > 0) {
        history.redo();
      } else {
        message.warning("No more redo available.");
      }
    }
  }, []);
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );
        if (response.status === 201 && quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, "image", response.data.url);
          setTimeout(() => {
            const imgs = editor.root.querySelectorAll(`img[src="${response.data.url}"]`);
            imgs.forEach((img) => {
              img.classList.add("ql-image"); // ví dụ: "rounded-lg", "centered-img"
            });
          }, 0);
        } else {
          message.error("Upload failed. Try again!");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error("Upload error. Please try again!");
      }
      //   new Compressor(file, {
      //     quality: 1, // Giảm dung lượng, 1 là giữ nguyên
      //     maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
      //     maxHeight: 800, // Optional, resize chiều cao nếu cần
      //     success(compressedFile) {
      //       const formData = new FormData();
      //       formData.append("file", compressedFile);

      //       axios
      //         .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
      //         .then((response) => {
      //           if (response.status === 201 && quillRef.current) {
      //             const editor = quillRef.current?.getEditor();
      //             const range = editor.getSelection(true);
      //             editor.insertEmbed(range.index, "image", response.data.url);
      //           } else {
      //             message.error("Upload failed. Try again!");
      //           }
      //         })
      //         .catch((err) => {
      //           console.error("Upload error:", err);
      //           message.error("Upload error. Please try again!");
      //         });
      //     },
      //     error(err) {
      //       console.error("Compression error:", err);
      //       message.error("Image compression failed!");
      //     },
      //   });
    };
  }, []);
  const imageHandlerLessonPlan = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // const formData = new FormData();
      // formData.append("file", file);

      // try {
      //   const response = await axios.post(
      //     process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
      //     formData
      //   );
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
      // new Compressor(file, {
      //   quality: 1, // Giảm dung lượng, 1 là giữ nguyên
      //   maxWidth: 350, // Resize ảnh về max chiều ngang là 800px
      //   maxHeight: 350, // Optional, resize chiều cao nếu cần
      //   success(compressedFile) {
      const formData = new FormData();
      formData.append("file", file);

      axios
        .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
        .then((response) => {
          if (response.status === 201 && quillRefLessonPlan.current) {
            const editor = quillRefLessonPlan.current?.getEditor();
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, "image", response.data.url);
            setTimeout(() => {
              const imgs = editor.root.querySelectorAll(`img[src="${response.data.url}"]`);
              imgs.forEach((img) => {
                img.classList.add("ql-image"); // ví dụ: "rounded-lg", "centered-img"
              });
            }, 0);
          } else {
            message.error("Upload failed. Try again!");
          }
        })
        .catch((err) => {
          console.error("Upload error:", err);
          message.error("Upload error. Please try again!");
        });
      // },
      //   error(err) {
      //     console.error("Compression error:", err);
      //     message.error("Image compression failed!");
      //   },
      // });
    };
  }, []);
  const audioHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "audio/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );

        if (response.status === 201 && quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          const audioUrl = response?.data?.url;

          // 👇 Đây là điểm quan trọng: insertEmbed với blot 'audio'
          editor.insertEmbed(range.index, "audio", audioUrl, "user");
          editor.setSelection(range.index + 1); // move cursor
        } else {
          message.error("Upload failed. Try again!");
        }
      } catch (error) {
        console.error("Error uploading audio:", error);
        message.error("Upload error. Please try again!");
      }
    };
  }, []);

  const modules = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandler,
        undo: undoHandler,
        redo: redoHandler,
      },
    },
  };
  const modulesLessonPlan = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandlerLessonPlan,
        undo: undoHandler,
        redo: redoHandler,
      },
    },
  };

  const enhanceDescription = async () => {
    if (!quillDescription) return;

    const currentContent = quillDescription.getText();
    if (!currentContent.trim()) {
      message.warning("Please enter a description first!");
      return;
    }

    setLoadingEnhanceDescription(true);
    try {
      const enhancedText = await lessonService.enhanceDescription(currentContent);
      quillDescription.setText(enhancedText);
      message.success("Description enhanced successfully!");
    } catch (error) {
      console.error("Error enhancing description:", error);
      message.error("Failed to enhance description. Please try again!");
    } finally {
      setLoadingEnhanceDescription(false);
    }
  };

  // CreateLesson.js
  const enhanceLessonPlan = async () => {
    if (!quillLessonPlan) return;

    const currentContent = quillLessonPlan.getText();
    if (!currentContent.trim()) {
      message.warning("Please enter a lesson plan first!");
      return;
    }

    // Lấy danh sách URL ảnh từ nội dung Quill
    const quillEditor = quillLessonPlan.getContents();
    const imageUrls = [];
    quillEditor.ops.forEach((op) => {
      if (op.insert && op.insert.image) {
        imageUrls.push(op.insert.image); // Thu thập URL ảnh
      }
    });

    setLoadingEnhanceLessonPlan(true);
    try {
      // Gọi lessonService.enhanceLessonPlan với lessonPlan và imageUrls
      const enhancedText = await lessonService.enhanceLessonPlan(currentContent, imageUrls);
      quillLessonPlan.setText(enhancedText);
      message.success("Lesson plan enhanced successfully!");
    } catch (error) {
      console.error("Error enhancing lesson plan:", error);
      message.error("Failed to enhance lesson plan. Please try again!");
    } finally {
      setLoadingEnhanceLessonPlan(false);
    }
  };
  useEffect(() => {
    fetchLessons();
  }, [levels]);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const data = await levelService.getAllLevels();
      setLevels(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách level:", error);
    }
  };

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      setQuill(editor);
    }
  }, [quillRef]);

  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTSLesson(true);

    try {
      const response = await homeWorkService.textToSpeech({ textToSpeech, gender });
      let base64String = response;

      function base64ToBlob(base64, mimeType) {
        let byteCharacters = atob(base64);
        let byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
      }

      let audioBlob = base64ToBlob(base64String, "audio/mp3");
      setMp3file(audioBlob);
      let audioUrl = URL.createObjectURL(audioBlob);
      setMp3Url(audioUrl);
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTSLesson(false);
  };

  useEffect(() => {
    if (mp3Url) {
      const audioElement = document.getElementById("audio-player");
      if (audioElement) {
        audioElement.src = "";
        audioElement.load();
        audioElement.src = mp3Url;
      }
    }
  }, [mp3Url]);

  const fetchLessons = async () => {
    try {
      const data = await lessonService.getAllLessons();
      const formattedRows = data.map((lesson) => ({
        id: lesson.id,
        name: lesson.name,
        level: levels?.find((lv) => lv.id === lesson.level)?.name,
        linkYoutube: lesson.linkYoutube,
        linkGame: lesson.linkGame,
        linkSpeech: lesson.linkSpeech,
        TeacherId: lesson?.teacher?.username,
        description: lesson.description,
        date: lesson.date, // Giả sử API trả về trường date
        actions: (
          <>
            <IconButton
              sx={{
                color: colors.midGreen,
                " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
              }}
              onClick={() => handleEdit(lesson)}
            >
              <EditIcon />
            </IconButton>
          </>
        ),
      }));
      setRows(formattedRows);
    } catch (err) {
      setError("Lỗi khi tải dữ liệu bài học!" + err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditMode(true);
    setSelectedLesson(lesson);
    setLessonData({
      // name: lesson.name,
      // level: lesson.level,
      // linkYoutube: lesson.linkYoutube,
      // linkGame: lesson.linkGame,
      // description: lesson.description,
      // TeacherId: lesson?.teacher?.id || "",
      // date: lesson.date ? new Date(lesson.date).toISOString().split("T")[0] : "", // Chuyển thành YYYY-MM-DD
      name: lesson.name,
      linkGame: lesson.linkGame,
      linkSpeech: lesson.linkSpeech,
    });
    setMp3Url(lesson.linkSpeech);
    setOpen(true);
  };
  console.log(selectedLesson);

  useEffect(() => {
    if (open && quillRef.current?.getEditor() && selectedLesson?.description) {
      // Thêm delay nhẹ để chắc chắn editor đã render xong
      console.log(selectedLesson.description);

      setTimeout(() => {
        quillRef.current?.getEditor().setContents([]); // reset
        quillRef.current?.getEditor().clipboard.dangerouslyPasteHTML(0, selectedLesson.description);
      }, 100); // thử 100ms nếu 0ms chưa đủ
    }
  }, [open, selectedLesson, quillRef.current?.getEditor()]);
  useEffect(() => {
    if (open && quillRefLessonPlan.current?.getEditor() && selectedLesson?.lessonPlan) {
      // Thêm delay nhẹ để chắc chắn editor đã render xong
      console.log(selectedLesson.lessonPlan);

      setTimeout(() => {
        quillRefLessonPlan.current?.getEditor().setContents([]); // reset
        quillRefLessonPlan.current
          ?.getEditor()
          .clipboard.dangerouslyPasteHTML(0, selectedLesson.lessonPlan);
      }, 100); // thử 100ms nếu 0ms chưa đủ
    }
  }, [open, selectedLesson, quillRefLessonPlan.current?.getEditor()]);
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
      setLoadingUpdateLesson(true);
      const formData = new FormData();
      formData.append("name", lessonData.name);
      formData.append("level", lessonData.level);
      formData.append("linkYoutube", lessonData.linkYoutube);
      formData.append("linkGame", lessonData.linkGame);
      formData.append("description", lessonData.description);
      formData.append("teacherId", lessonData.TeacherId);
      formData.append("date", lessonData.date); // Gửi chuỗi ngày YYYY-MM-DD
      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }
      const lessonEntity = await lessonService.editLesson(selectedLesson.id, formData);
      setRows(
        rows.map((row) =>
          row.id === selectedLesson.id
            ? {
                ...row,
                ...lessonData,
                linkSpeech: lessonEntity.linkSpeech,
                actions: (
                  <>
                    <IconButton
                      sx={{
                        color: colors.midGreen,
                        " &:hover": { backgroundColor: colors.highlightGreen, color: colors.white },
                      }}
                      onClick={() => handleEdit(lessonEntity)}
                    >
                      <EditIcon />
                    </IconButton>
                  </>
                ),
              }
            : row
        )
      );
      message.success("Lesson updated successfully");
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
      setOpen(false);
      setLessonData({
        name: "",
        level: "",
        linkYoutube: "",
        linkGame: "",
        linkSpeech: "",
        TeacherId: "",
        description: "",
        date: "",
      });
      setEditMode(false);
    } catch (err) {
      alert(editMode ? "Lỗi khi chỉnh sửa bài học!" + err : "Lỗi khi tạo bài học!");
    } finally {
      setLoadingUpdateLesson(false);
    }
  };

  const filteredRows = useMemo(() => {
    let filtered = rows;

    // Lọc theo tên giáo viên
    if (searchTeacher) {
      filtered = filtered.filter((row) => {
        const teacherName = row.TeacherId || "";
        return teacherName.toLowerCase().includes(searchTeacher.toLowerCase());
      });
    }

    // Lọc theo ngày
    if (searchDate) {
      filtered = filtered.filter((row) => {
        const lessonDate = new Date(row.date).toISOString().split("T")[0]; // Chuẩn hóa thành YYYY-MM-DD
        return lessonDate === searchDate;
      });
    }

    return filtered;
  }, [rows, searchTeacher, searchDate]);

  return (
    <DashboardLayout>
      <style>
        {`
        .truncate-text {
          display: inline-block;
          max-width: 100px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        `}
      </style>
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
                borderRadius="lg"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ backgroundColor: colors.deepGreen, color: colors.white }}
              >
                <MDTypography variant="h6" color="white">
                  Lesson Tables
                </MDTypography>
              </MDBox>
              <MDBox
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                gap={2}
                px={2}
                py={1}
              >
                <TextField
                  label="Search by teacher"
                  variant="outlined"
                  size="small"
                  value={searchTeacher}
                  onChange={(e) => setSearchTeacher(e.target.value)}
                  sx={{ backgroundColor: "white", borderRadius: "4px" }}
                />
                <TextField
                  label="Search by date"
                  type="date"
                  variant="outlined"
                  size="small"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ backgroundColor: "white", borderRadius: "4px" }}
                />
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
                    table={{ columns, rows: filteredRows }}
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
      <Dialog
        open={open}
        onClose={() => {
          setTextToSpeech("");
          setOpen(false);
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
        <DialogTitle>{editMode ? "Edit Lesson" : "Create"}</DialogTitle>
        <DialogContent sx={{ height: "100%", overflowY: "auto" }}>
          <TextField
            label="Lesson Name"
            fullWidth
            margin="normal"
            value={lessonData.name}
            onChange={(e) => setLessonData({ ...lessonData, name: e.target.value })}
          />
          <TextField
            disabled
            label="level"
            fullWidth
            sx={{
              "& .css-1cohrqd-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select":
                {
                  minHeight: "48px",
                  display: "flex",
                  alignItems: "center",
                },
            }}
            margin="normal"
            value={lessonData.level}
            onChange={(e) => {
              setLessonData({ ...lessonData, level: e.target.value });
            }}
          />
          <TextField
            label="Lesson Youtube Link"
            fullWidth
            margin="normal"
            value={lessonData.linkYoutube}
            onChange={(e) => setLessonData({ ...lessonData, linkYoutube: e.target.value })}
          />
          <TextField
            label="Lesson Game Link"
            fullWidth
            margin="normal"
            value={lessonData.linkGame}
            onChange={(e) => setLessonData({ ...lessonData, linkGame: e.target.value })}
          />
          <TextField
            label="Lesson Date"
            type="date"
            fullWidth
            margin="normal"
            value={lessonData.date}
            onChange={(e) => setLessonData({ ...lessonData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextArea
            value={textToSpeech}
            onChange={(e) => setTextToSpeech(e.target.value)}
            rows={3}
            placeholder="Enter text to convert to speech"
            style={{
              borderRadius: "6px",
              borderColor: colors.inputBorder,
            }}
          />
          <Radio.Group
            options={genderOptions}
            onChange={onChangeGender}
            value={gender}
            optionType="button"
          />
          <Button
            type="primary"
            onClick={handleConvertToSpeech}
            loading={loadingTTSLesson}
            style={{
              backgroundColor: colors.deepGreen,
              borderColor: colors.deepGreen,
            }}
          >
            Convert to Speech
          </Button>
          {mp3Url && (
            <div style={{ marginBottom: "16px" }}>
              <audio id="audio-player" controls style={{ width: "100%" }}>
                <source src={mp3Url} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          <Button
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              color: colors.white,
              margin: "10px 0",
            }}
            icon={<UploadOutlined />}
            onClick={audioHandler}
          >
            Tải audio lên
          </Button>
          <Button
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              color: colors.white,
              margin: "10px",
            }}
            icon={<SwapOutlined />}
            onClick={() => {
              if (!swapHtmlMode) {
                const html = quillRef.current?.getEditor()?.root?.innerHTML || "";
                setHtmlContent(html);
                setSwapHtmlMode(true);
              } else {
                quillRef.current?.getEditor().clipboard.dangerouslyPasteHTML(htmlContent);
                setSwapHtmlMode(false);
              }
            }}
          >
            Swap to {swapHtmlMode ? "Quill" : "HTML"}
          </Button>
          <MDTypography variant="h6" sx={{ color: "#7b809a", margin: "10px" }}>
            Description
          </MDTypography>
          {
            <ReactQuill
              theme="snow"
              modules={modules}
              formats={quillFormats}
              ref={quillRef}
              style={{
                height: "250px",
                marginBottom: "60px", // Consider reducing this
                borderRadius: "6px",
                // border: `1px solid ${colors.inputBorder}`,
                display: swapHtmlMode ? "none" : "block",
              }}
            />
          }
          {swapHtmlMode && (
            <TextArea
              value={htmlContent}
              onChange={(e) => {
                setHtmlContent(e.target.value);
              }}
              style={{
                height: "250px",
                marginBottom: "60px", // Consider reducing this
                borderRadius: "6px",
                border: `1px solid ${colors.inputBorder}`,
              }}
            />
          )}
          <Button
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              color: colors.white,
              margin: "10px 0",
              marginTop: isMobile ? "100px" : "40px",
            }}
            icon={<SwapOutlined />}
            onClick={() => {
              // console.log(
              //   "swapHtmlLessonPlanMode",
              //   swapHtmlLessonPlanMode,
              //   htmlLessonPlanContent,
              //   quillRefLessonPlan.current?.getEditor()?.root?.innerHTML
              // );

              if (!swapHtmlLessonPlanMode) {
                const html = quillRefLessonPlan.current?.getEditor()?.root?.innerHTML || "";
                setHtmlLessonPlanContent(html);
                setSwapHtmlLessonPlanMode(true);
              } else {
                // console.log("htmlLessonPlanContent", htmlLessonPlanContent);
                quillRefLessonPlan.current
                  ?.getEditor()
                  .clipboard.dangerouslyPasteHTML(htmlLessonPlanContent);
                setSwapHtmlLessonPlanMode(false);
              }
            }}
          >
            Swap to {swapHtmlLessonPlanMode ? "Quill" : "HTML"}
          </Button>
          <MDTypography variant="h6" sx={{ color: "#7b809a", margin: "10px" }}>
            LessonPlan
          </MDTypography>
          {
            <ReactQuill
              id="lessonPlanUpdate"
              theme="snow"
              modules={modulesLessonPlan}
              formats={quillFormats}
              ref={quillRefLessonPlan}
              placeholder={`📎 Nhập chủ đề hoặc mục tiêu cụ thể bạn muốn dạy.\n\nVí dụ:\n• "Lớp 7 – Kỹ năng nghe: Luyện nghe chủ đề thời tiết và trả lời câu hỏi."\n• "Lớp 9 – Ngữ pháp: Sử dụng thì hiện tại hoàn thành để mô tả trải nghiệm cá nhân."\n\nMẹo: Nên ghi rõ kỹ năng chính, lớp, nội dung muốn học sinh đạt được.`}
              style={{
                height: "250px",
                marginBottom: "60px", // Consider reducing this
                borderRadius: "6px",
                // border: `1px solid ${colors.inputBorder}`,
                display: swapHtmlLessonPlanMode ? "none" : "block",
              }}
            />
          }
          {/* {swapHtmlLessonPlanMode && ( */}
          <TextArea
            value={htmlLessonPlanContent}
            onChange={(e) => {
              setHtmlLessonPlanContent(e.target.value);
            }}
            style={{
              height: "250px",
              marginBottom: "60px", // Consider reducing this
              borderRadius: "6px",
              border: `1px solid ${colors.inputBorder}`,
              display: !swapHtmlLessonPlanMode ? "none" : "block",
            }}
          />
          <Button
            icon={<RobotOutlined />}
            onClick={enhanceLessonPlan}
            loading={loadingEnhanceLessonPlan}
            style={{
              alignSelf: "flex-start",
              marginTop: isMobile ? "100px" : "40px",
              // marginBottom: "20px",
              borderRadius: "6px",
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              color: colors.white,
            }}
          >
            Cải thiện mô tả
          </Button>
          <Button
            icon={<RobotOutlined />}
            // onClick={enhanceLessonPlan}
            onClick={() => window.open("https://gemini.google.com/app?hl=vi")}
            // loading={loadingEnhanceLessonPlan}
            style={{
              alignSelf: "flex-start",
              // marginTop: isMobile ? "100px" : "40px",
              marginTop: "5px",
              marginBottom: "20px",
              borderRadius: "6px",
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              color: colors.white,
            }}
          >
            Cải thiện kế hoạch bài học
          </Button>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            sx={{ color: colors.midGreen, " &:hover": { color: colors.darkGreen } }}
          >
            Cancel
          </Button>
          <Button
            loading={loadingUpdateLesson}
            key="submit"
            type="primary"
            onClick={handleSave}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            {"Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <LessonDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedLessonDetail(null);
        }}
        lesson={selectedLessonDetail}
      />
    </DashboardLayout>
  );
}

export default Lessons;
Lessons.propTypes = {
  row: PropTypes.object.isRequired,
};
