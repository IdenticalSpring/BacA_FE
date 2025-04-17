import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { colors } from "assets/theme/color";
import React, { use, useCallback, useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
const { Title } = Typography;
const { Option } = Select;
import PropTypes from "prop-types";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  RobotOutlined,
  SearchOutlined,
  SwapOutlined,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import lessonService from "services/lessonService";
import { jwtDecode } from "jwt-decode";
import TextArea from "antd/es/input/TextArea";
import homeWorkService from "services/homeWorkService";
import notificationService from "services/notificationService";
import user_notificationService from "services/user_notificationService";
import lessonByScheduleService from "services/lessonByScheduleService";
import axios from "axios";
import Compressor from "compressorjs";
const { Text } = Typography;
const genderOptions = [
  { label: "Giọng nam", value: 1 },
  { label: "Giọng nữ", value: 0 },
];
const BlockEmbed = Quill.import("blots/block/embed");
const icons = Quill.import("ui/icons");
icons["undo"] = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 14H4V9"/>
    <path d="M20 20a9 9 0 0 0-15.5-6.36L4 14"/>
  </svg>
`;
icons["redo"] = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 14h5v-5"/>
    <path d="M4 20a9 9 0 0 1 15.5-6.36L20 14"/>
  </svg>
`;
icons["video"] = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.8 8.001c-.2-1.5-.9-2.2-2.3-2.4C17.1 5.2 12 5.2 12 5.2s-5.1 0-7.5.4c-1.4.2-2.1.9-2.3 2.4C2 9.5 2 12 2 12s0 2.5.2 4c.2 1.5.9 2.2 2.3 2.4 2.4.4 7.5.4 7.5.4s5.1 0 7.5-.4c1.4-.2 2.1-.9 2.3-2.4.2-1.5.2-4 .2-4s0-2.5-.2-4zM10 15V9l5 3-5 3z"/>
  </svg>
`;
class AudioBlot extends BlockEmbed {
  static create(url) {
    const node = super.create();
    node.setAttribute("src", url);
    node.setAttribute("controls", true);
    return node;
  }

  static value(node) {
    return node.getAttribute("src");
  }
}

AudioBlot.blotName = "audio";
AudioBlot.tagName = "audio";
Quill.register(AudioBlot);
class CustomVideo extends BlockEmbed {
  static blotName = "video"; // override mặc định
  static tagName = "iframe";

  static create(value) {
    const node = super.create();

    const src = typeof value === "string" ? value : value.src;
    node.setAttribute("src", src);
    node.setAttribute("frameborder", "0");
    node.setAttribute("allowfullscreen", "true");
    node.classList.add("responsive-iframe");
    // Thêm width/height mặc định hoặc theo người dùng truyền vào
    node.setAttribute("width", "100%");
    node.setAttribute("height", "315");

    if (typeof value !== "string") {
      if (value.width) node.setAttribute("width", value.width);
      if (value.height) node.setAttribute("height", value.height);
    }

    return node;
  }

  static value(node) {
    return {
      src: node.getAttribute("src"),
      width: node.getAttribute("width"),
      height: node.getAttribute("height"),
    };
  }
}
class CustomImageBlot extends BlockEmbed {
  static blotName = "image";
  static tagName = "img";

  static create(value) {
    const node = super.create();

    node.setAttribute("src", value);
    node.setAttribute("class", "ql-image");
    node.style.cursor = "zoom-in";
    // node.setAttribute("onclick", "handleClickQLImage");
    // node.onclick = () => {
    //   console.log("clicked image"); // thay thế bằng hàm của bạn // gọi hàm toàn cục
    // };
    return node;
  }

  static value(node) {
    return node.getAttribute("src");
  }
}
Quill.register(CustomImageBlot);
Quill.register(CustomVideo);
export default function LessonMangement({
  toolbar,
  quillFormats,
  levels,
  isMobile,
  setModalUpdateLessonVisible,
  setEditingLesson,
  modalUpdateLessonVisible,
  editingLesson,
  loading,
  lessons,
  setLessons,
  teacherId,
  level,
  loadingTTSForUpdateLesson,
  setLoadingTTSForUpdateLesson,
  lessonByScheduleData,
  daysOfWeek,
  setLessonByScheduleData,
  classID,
  students,
  quillRef,
  quillRefLessonPlan,
}) {
  const [form] = Form.useForm();
  // const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [gender, setGender] = useState(1);
  const [openSend, setOpenSend] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [currentYoutubeLink, setCurrentYoutubeLink] = useState("");
  const [editYoutubeIndex, setEditYoutubeIndex] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [swapHtmlMode, setSwapHtmlMode] = useState(false);
  const [htmlLessonPlanContent, setHtmlLessonPlanContent] = useState("");
  const [swapHtmlLessonPlanMode, setSwapHtmlLessonPlanMode] = useState(false);
  const [loadingEnhanceLessonPlan, setLoadingEnhanceLessonPlan] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dataSearch, setDataSearch] = useState([]);
  useEffect(() => {
    if (searchText === "") {
      setDataSearch(lessons);
    } else {
      const filteredData = lessons?.filter((lesson) => {
        return lesson.name.toLowerCase().includes(searchText.toLowerCase());
      });
      setDataSearch(filteredData);
    }
  }, [searchText]);
  // const quillRefLessonPlan = useRef(null);
  const onChangeGender = ({ target: { value } }) => {
    console.log("radio3 checked", value);
    setGender(value);
  };
  const handleDelete = async (id) => {
    try {
      await lessonService.deleteLesson(id);
      setLessons(lessons.filter((lesson) => lesson.id !== id));
      message.success("Lesson deleted successfully");
    } catch (err) {
      message.error("Error deleting lesson!");
    }
  };
  const handleEdit = (lesson) => {
    setSelectedLessonId(lesson.id);
    setEditingLesson(lesson);
    form.setFieldsValue({
      name: lesson.name,
      linkGame: lesson.linkGame,
      linkSpeech: lesson.linkSpeech,
    });
    // Khởi tạo youtubeLinks từ linkYoutube
    const links = lesson.linkYoutube ? lesson.linkYoutube.split(", ").filter(Boolean) : [];
    setYoutubeLinks(links);
    setMp3Url(lesson.linkSpeech);
    setModalUpdateLessonVisible(true);
  };
  useEffect(() => {
    if (modalUpdateLessonVisible && quillRef.current?.getEditor() && editingLesson?.description) {
      // Thêm delay nhẹ để chắc chắn editor đã render xong
      console.log(editingLesson.description);

      setTimeout(() => {
        quillRef.current?.getEditor().setContents([]); // reset
        quillRef.current?.getEditor().clipboard.dangerouslyPasteHTML(0, editingLesson.description);
      }, 100); // thử 100ms nếu 0ms chưa đủ
    }
  }, [modalUpdateLessonVisible, editingLesson, quillRef.current?.getEditor()]);
  useEffect(() => {
    if (
      modalUpdateLessonVisible &&
      quillRefLessonPlan.current?.getEditor() &&
      editingLesson?.lessonPlan
    ) {
      // Thêm delay nhẹ để chắc chắn editor đã render xong
      console.log(editingLesson.lessonPlan);

      setTimeout(() => {
        quillRefLessonPlan.current?.getEditor().setContents([]); // reset
        quillRefLessonPlan.current
          ?.getEditor()
          .clipboard.dangerouslyPasteHTML(0, editingLesson.lessonPlan);
      }, 100); // thử 100ms nếu 0ms chưa đủ
    }
  }, [modalUpdateLessonVisible, editingLesson, quillRefLessonPlan.current?.getEditor()]);
  const enhanceLessonPlan = async () => {
    if (!quillRefLessonPlan.current?.getEditor()) return;

    const currentContent = quillRefLessonPlan.current?.getEditor().getText();
    if (!currentContent.trim()) {
      message.warning("Please enter a lesson plan first!");
      return;
    }

    // Lấy danh sách URL ảnh từ nội dung Quill
    const quillEditor = quillRefLessonPlan.current?.getEditor().getContents();
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
      quillRefLessonPlan.current?.getEditor().setText(enhancedText);
      message.success("Lesson plan enhanced successfully!");
    } catch (error) {
      console.error("Error enhancing lesson plan:", error);
      message.error("Failed to enhance lesson plan. Please try again!");
    } finally {
      setLoadingEnhanceLessonPlan(false);
    }
  };
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) {
      return;
    }
    setLoadingTTSForUpdateLesson(true);

    try {
      const response = await homeWorkService.textToSpeech({ textToSpeech, gender });

      let base64String = response;

      // Bước 2: Chuyển Base64 về mảng nhị phân (binary)
      function base64ToBlob(base64, mimeType) {
        let byteCharacters = atob(base64); // Giải mã base64
        let byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
      }

      // Bước 3: Tạo URL từ Blob và truyền vào thẻ <audio>
      let audioBlob = base64ToBlob(base64String, "audio/mp3"); // Hoặc "audio/wav"
      setMp3file(audioBlob);
      let audioUrl = URL.createObjectURL(audioBlob);
      setMp3Url(audioUrl);
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTSForUpdateLesson(false);
  };
  useEffect(() => {
    if (mp3Url) {
      // console.log("🔄 Cập nhật audio URL:", mp3Url);
      const audioElement = document.getElementById("audio-player");
      if (audioElement) {
        audioElement.src = ""; // Xóa src để tránh giữ URL cũ
        audioElement.load(); // Tải lại audio
        audioElement.src = mp3Url;
      }
    }
  }, [mp3Url]);
  const handleSave = async () => {
    try {
      setLoadingUpdate(true);
      const values = await form.validateFields();
      const formData = new FormData();
      let linkYoutube = "";
      if (youtubeLinks?.length > 0) {
        linkYoutube = youtubeLinks.join(", ");
      }
      formData.append("name", values.name);
      formData.append("level", level);
      formData.append("linkYoutube", linkYoutube);
      // formData.append("linkGame", values.linkGame);
      formData.append("linkGame", "meomeo");
      formData.append("description", quillRef.current?.getEditor()?.root?.innerHTML || "");
      formData.append("lessonPlan", quillRefLessonPlan.current?.getEditor()?.root.innerHTML || "");
      formData.append("teacherId", teacherId);
      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }
      if (editingLesson) {
        const lessonEntity = await lessonService.editLesson(editingLesson.id, formData);
        setLessons(
          lessons?.map((lesson) =>
            lesson.id === editingLesson.id ? { ...lesson, ...lessonEntity } : lesson
          )
        );
        message.success("Lesson updated successfully");
      }
      // setModalUpdateLessonVisible(false);
      // form.resetFields();
      // setEditingLesson(null);
      // setTextToSpeech("");
      // setMp3file(null);
      // setMp3Url("");
      setModalUpdateLessonVisible(false);
      form.resetFields();
      setEditingLesson(null);
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
      setYoutubeLinks([]);
      setCurrentYoutubeLink("");
      setEditYoutubeIndex(null);
      setHtmlContent("");
      setSwapHtmlMode(false);
    } catch (err) {
      message.error("Please check your input and try again");
    } finally {
      setLoadingUpdate(false);
    }
  };
  const handleUpdateSendingLessonStatus = async (id) => {
    try {
      setLoadingSchedule(true);
      const data = await lessonByScheduleService.updateSendingLessonStatus(id, true);
      const lessonByScheduleDataUpdated = lessonByScheduleData.map((item) => {
        if (item.id === id) {
          return { ...item, isLessonSent: true };
        }
        return item;
      });
      setLessonByScheduleData(lessonByScheduleDataUpdated);
      let detailStr = "Bạn mới có bài học mới vào ngày:";
      // console.log(data);
      const date = lessonByScheduleDataUpdated.find((item) => item.id === id)?.date || null;
      // console.log(lessonByScheduleDataUpdated.find((item) => item.id === id));

      detailStr +=
        " " +
          (date &&
            new Date(date).toLocaleDateString("vi-VN", {
              timeZone: "UTC",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })) || "Không có ngày";
      const notificationData = {
        title: "Bài học mới",
        general: false,
        classID: classID,
        detail: detailStr,
        createdAt: new Date(),
      };
      const notificationRes = await notificationService.createNotification(notificationData);
      const userNotificationCreate = students.forEach(async (element) => {
        const userNotificationData = {
          status: false,
          notificationID: notificationRes.id,
          studentID: element.id,
        };
        const userNotificationRes = await user_notificationService.createUserNotification(
          userNotificationData
        );
      });
      message.success("Đã gửi bài học thành công!");
    } catch (err) {
      message.error("Lỗi khi gửi bài học! " + err);
    } finally {
      setLoadingSchedule(false);
    }
  };
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      setQuill(editor);
    }
  }, [quillRef]);
  // useEffect(() => {
  //   const quill = quillRef.current?.getEditor();
  //   if (!quill) return;

  //   const handlePaste = (e) => {
  //     // console.log("handlePaste called");
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
  const undoHandlerLessonDescription = useCallback(() => {
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
  const redoHandlerLessonDescription = useCallback(() => {
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
  const undoHandlerLessonPlan = useCallback(() => {
    const quill = quillRefLessonPlan.current?.getEditor();
    if (quill) {
      const history = quill.history;
      if (history.stack.undo.length > 0) {
        history.undo();
      } else {
        message.warning("No more undo available.");
      }
    }
  }, []);
  const redoHandlerLessonPlan = useCallback(() => {
    const quill = quillRefLessonPlan.current?.getEditor();
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
      // console.log([...formData]);

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );
        console.log(response.data.url);

        // const result = await response.json();

        if (response.status === 201 && quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range?.index, "image", response.data.url);
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
      // new Compressor(file, {
      //   quality: 1, // Giảm dung lượng, 1 là giữ nguyên
      //   maxWidth: 800, // Resize ảnh về max chiều ngang là 800px
      //   maxHeight: 800, // Optional, resize chiều cao nếu cần
      //   success(compressedFile) {
      //     const formData = new FormData();
      //     formData.append("file", compressedFile);

      //     axios
      //       .post(process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary", formData)
      //       .then((response) => {
      //         if (response.status === 201 && quillRef.current) {
      //           const editor = quillRef.current?.getEditor();
      //           const range = editor.getSelection(true);
      //           editor.insertEmbed(range.index, "image", response.data.url);
      //         } else {
      //           message.error("Upload failed. Try again!");
      //         }
      //       })
      //       .catch((err) => {
      //         console.error("Upload error:", err);
      //         message.error("Upload error. Please try again!");
      //       });
      //   },
      //   error(err) {
      //     console.error("Compression error:", err);
      //     message.error("Image compression failed!");
      //   },
      // });
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
      //   if (response.status === 201 && quillRefDescription.current) {
      //     const editor = quillRefDescription.current.getEditor();
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
            editor.insertEmbed(range?.index, "image", response.data.url);
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
          editor.insertEmbed(range?.index, "audio", audioUrl, "user");
          editor.setSelection(range?.index + 1); // move cursor
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
        undo: undoHandlerLessonDescription,
        redo: redoHandlerLessonDescription,
      },
    },
  };
  const modulesLessonPlan = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandlerLessonPlan,
        undo: undoHandlerLessonPlan,
        redo: redoHandlerLessonPlan,
      },
    },
  };
  const columns = [
    {
      title: "Tên bài học",
      dataIndex: "name",
      key: "name",
      width: "20%",
    },
    // {
    //   title: "Cấp độ",
    //   dataIndex: "level",
    //   key: "level",
    //   width: "15%",
    //   render: (text) => levels?.find((level) => level.id === text)?.name,
    // },
    // {
    //   title: "Link Youtube",
    //   dataIndex: "linkYoutube",
    //   key: "linkYoutube",
    //   width: "20%",
    //   render: (text) => (
    //     <Typography.Text
    //       ellipsis={{ tooltip: text }}
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //     >
    //       {text}
    //     </Typography.Text>
    //   ),
    // },
    // {
    //   title: "Link Game",
    //   dataIndex: "linkGame",
    //   key: "linkGame",
    //   width: "20%",
    //   render: (text) => (
    //     <Typography.Text
    //       ellipsis={{ tooltip: text }}
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //     >
    //       {text}
    //     </Typography.Text>
    //   ),
    // },
    // {
    //   title: "Link Speech",
    //   dataIndex: "linkSpeech",
    //   key: "linkSpeech",
    //   width: "20%",
    //   render: (text) => (
    //     <Typography.Text
    //       ellipsis={{ tooltip: text }}
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
    //     >
    //       {text}
    //     </Typography.Text>
    //   ),
    // },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "25%",
      render: (text) => (
        <Typography.Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
        >
          {text?.replace(/<[^>]*>?/gm, "") || ""}
        </Typography.Paragraph>
      ),
    },
    {
      title: "Ngày học",
      dataIndex: "id",
      key: "id",
      width: "25%",
      render: (text) => {
        const date = lessonByScheduleData?.filter((item) => item.lessonID === text)[0]?.date;
        // console.log(lessonByScheduleData.filter((item) => item.lessonID === text));

        return (
          <p>
            {(date &&
              new Date(date).toLocaleDateString("vi-VN", {
                timeZone: "UTC",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })) ||
              "Không có ngày"}
          </p>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "id",
      key: "id",
      width: "10%",
      render: (text) => {
        // console.log(text);

        const length = lessonByScheduleData?.filter((item) => item.lessonID === text).length;
        const isSentLength = lessonByScheduleData.filter(
          (item) => item.lessonID === text && item.isLessonSent === true
        ).length;
        // console.log(length, isSentLength);

        return (
          <Tag
            color={isSentLength === 0 ? "red" : isSentLength === length ? "green" : "yellow"}
            style={{ fontSize: 14, fontWeight: 600, padding: "5px 10px" }}
          >
            {isSentLength === 0 ? (
              <>
                <CloseCircleOutlined style={{ marginRight: 5 }} />
                Chưa giao
              </>
            ) : isSentLength === length ? (
              <>
                <CheckCircleOutlined style={{ marginRight: 5 }} />
                Đã giao
              </>
            ) : (
              <>
                <SyncOutlined style={{ marginRight: 5 }} />
                Đang giao
              </>
            )}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: "20%",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{
              backgroundColor: colors.deepGreen,
              borderColor: colors.deepGreen,
            }}
          />
          {/* <Popconfirm
            title="Bạn có chắc muốn xóa bài học này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{
              style: { backgroundColor: colors.errorRed, borderColor: colors.errorRed },
            }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm> */}
        </Space>
      ),
    },
  ];
  // console.log(selectedLessonId);

  return (
    <div style={{ padding: "14px" }}>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px " + colors.softShadow,
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <Title level={4} style={{ margin: 0, color: colors.darkGreen }}>
            Quản lý bài học
          </Title>
        </div>
        <Input
          placeholder="Nhập tên bài học muốn tìm kiếm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ marginBottom: "20px", width: isMobile ? "100%" : "40%" }}
        />
        <Table
          dataSource={dataSearch}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 4 }}
          style={{ borderRadius: "8px", overflow: "hidden" }}
          onRow={(record) => ({
            style: { cursor: "pointer" },
          })}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        centered
        title={editingLesson ? "Điều chỉnh bài học" : "Create New Lesson"}
        open={modalUpdateLessonVisible}
        onCancel={() => {
          setModalUpdateLessonVisible(false);
          form.resetFields();
          setEditingLesson(null);
        }}
        footer={[
          <Button
            style={{ marginTop: isMobile ? "20px" : "" }}
            key="cancel"
            onClick={() => {
              setModalUpdateLessonVisible(false);
              form.resetFields();
              setEditingLesson(null);
              setYoutubeLinks([]);
              setCurrentYoutubeLink("");
              setEditYoutubeIndex(null);
            }}
          >
            Hủy
          </Button>,
          <Button
            loading={loadingUpdate}
            key="submit"
            type="primary"
            onClick={handleSave}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            {editingLesson ? "Lưu" : "Create"}
          </Button>,
          <Button
            loading={loadingSchedule}
            key="send"
            type="primary"
            onClick={() => {
              // setOpenSend(true);
              const entity = lessonByScheduleData?.find(
                (item) => item.lessonID === selectedLessonId
              );
              handleUpdateSendingLessonStatus(entity?.id);
            }}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            {"Gửi bài học"}
          </Button>,
        ]}
        width={720}
      >
        <Form
          form={form}
          layout="vertical"
          name="lessonForm"
          initialValues={{
            name: "",
            level: "",
            // linkYoutube: "",
            linkGame: "",
            description: "",
          }}
        >
          <Form.Item
            name="name"
            label="Tên bài học"
            rules={[{ required: true, message: "Please enter the lesson name" }]}
          >
            <Input placeholder="Nhập tên bài học" />
          </Form.Item>
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
          <Form.Item
            // name="description"
            label="Mô tả"
            // rules={[{ required: true, message: "Please enter a description" }]}
          >
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
          </Form.Item>
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
          <Form.Item name="lessonPlan" label="Kế hoạch bài học">
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
          </Form.Item>
          <Form.Item>
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
          </Form.Item>
          <Form.Item>
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
          </Form.Item>
          {/* <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: "Please select a level" }]}
          >
            <Select placeholder="Select level">
              {levels?.map((level, index) => (
                <Option key={index} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </Form.Item> */}

          <Form.Item label="Văn bản thành giọng nói">
            <TextArea
              value={textToSpeech}
              onChange={(e) => setTextToSpeech(e.target.value)}
              rows={3}
              placeholder="Nhập văn bản để chuyển thành giọng nói"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item>
          <Form.Item>
            <Radio.Group
              options={genderOptions}
              onChange={onChangeGender}
              value={gender}
              optionType="button"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={handleConvertToSpeech}
              loading={loadingTTSForUpdateLesson}
              style={{
                backgroundColor: colors.deepGreen,
                borderColor: colors.deepGreen,
              }}
            >
              Chuyển thành giọng nói
            </Button>
          </Form.Item>
          {mp3Url && (
            <Form.Item>
              <div style={{ marginBottom: "16px" }}>
                <audio id="audio-player" controls style={{ width: "100%" }}>
                  <source src={mp3Url} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </Form.Item>
          )}
          {/* <Form.Item label="Link Youtube bài học">
            <Input.Group compact>
              <Input
                value={currentYoutubeLink}
                placeholder="Nhập link youtube bài học"
                style={{
                  width: "calc(100% - 120px)",
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
                onChange={(e) => setCurrentYoutubeLink(e.target.value)}
              />
              <Button
                type="primary"
                onClick={() => {
                  if (!currentYoutubeLink) return;
                  if (editYoutubeIndex !== null) {
                    const updated = [...youtubeLinks];
                    updated[editYoutubeIndex] = currentYoutubeLink;
                    setYoutubeLinks(updated);
                    setEditYoutubeIndex(null);
                  } else {
                    setYoutubeLinks([...youtubeLinks, currentYoutubeLink]);
                  }
                  setCurrentYoutubeLink("");
                }}
                style={{
                  backgroundColor: colors.emerald,
                  borderColor: colors.emerald,
                }}
              >
                {editYoutubeIndex !== null ? "Cập nhật" : "Thêm"}
              </Button>
            </Input.Group>
          </Form.Item>
          {youtubeLinks?.length > 0 && (
            <Table
              columns={[
                {
                  title: "STT",
                  dataIndex: "index",
                  render: (_, __, i) => i + 1,
                },
                {
                  title: "Link YouTube",
                  dataIndex: "link",
                },
                {
                  title: "Hành động",
                  render: (_, record, index) => (
                    <>
                      <Button
                        type="link"
                        onClick={() => {
                          setCurrentYoutubeLink(record.link);
                          setEditYoutubeIndex(index);
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="link"
                        danger
                        onClick={() => {
                          const updated = youtubeLinks.filter((_, i) => i !== index);
                          setYoutubeLinks(updated);
                          if (editYoutubeIndex === index) {
                            setCurrentYoutubeLink("");
                            setEditYoutubeIndex(null);
                          }
                        }}
                      >
                        Xoá
                      </Button>
                    </>
                  ),
                },
              ]}
              dataSource={youtubeLinks.map((link, index) => ({ key: `${link}-${index}`, link }))}
              pagination={false}
            />
          )} */}
          {/* <Form.Item name="linkGame" label="Link game bài học">
            <Input
              placeholder="Nhập link game bài học"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item> */}
        </Form>
      </Modal>
      <Modal
        title="Danh sách các lịch học đang sử dụng bài học này"
        open={openSend}
        onCancel={() => setOpenSend(false)}
        footer={<></>}
        centered
        width={isMobile ? "90%" : "60%"}
        // style={{ display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            width: "100%",
            // margin: "15px 0",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {lessonByScheduleData?.length > 0 ? (
            lessonByScheduleData?.map((item, index) => {
              return item.lessonID === selectedLessonId ? (
                <div
                  key={index}
                  style={{
                    padding: "16px",
                    marginBottom: "12px",
                    border: `1px solid ${colors.lightGreen}`,
                    borderRadius: "8px",
                    backgroundColor: colors.paleGreen,
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    gap: "10px",
                    height: isMobile ? "15%" : "15%",
                    width: "100%",
                    transition: "all 0.3s ease-in-out",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: colors.darkGreen,
                      flex: 1,
                      marginBottom: isMobile ? "10px" : 0,
                    }}
                  >
                    📅 {daysOfWeek[item.schedule.dayOfWeek]} | {item.date} | 🕒{" "}
                    {item.schedule.startTime} - {item.schedule.endTime} |{" "}
                    {/* {homeWorksData.find((hw) => hw.id === item.homeWorkId)?.title} */}
                  </div>
                  <Button
                    disabled={item.isLessonSent}
                    loading={loadingSchedule}
                    onClick={() => {
                      handleUpdateSendingLessonStatus(item.id);
                    }}
                  >
                    {item.isLessonSent ? <Text>Đã gửi bài học</Text> : <Text>Gửi bài học</Text>}
                  </Button>
                </div>
              ) : null;
            })
          ) : (
            <Text>Không có bài học nào</Text>
          )}
        </div>
      </Modal>
    </div>
  );
}
LessonMangement.propTypes = {
  toolbar: PropTypes.array.isRequired,
  quillFormats: PropTypes.array.isRequired,
  levels: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  setModalUpdateLessonVisible: PropTypes.func.isRequired,
  setEditingLesson: PropTypes.func.isRequired,
  modalUpdateLessonVisible: PropTypes.bool.isRequired,
  editingLesson: PropTypes.array.isRequired,
  lessons: PropTypes.array.isRequired,
  setLessons: PropTypes.func.isRequired,
  teacherId: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  loadingTTSForUpdateLesson: PropTypes.bool.isRequired,
  setLoadingTTSForUpdateLesson: PropTypes.func.isRequired,
  lessonByScheduleData: PropTypes.array.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  setLessonByScheduleData: PropTypes.func.isRequired,
  classID: PropTypes.number.isRequired,
  students: PropTypes.array.isRequired,
  quillRef: PropTypes.object.isRequired,
  quillRefLessonPlan: PropTypes.object.isRequired,
};
