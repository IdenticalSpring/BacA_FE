import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Tag,
  Table,
  Typography,
} from "antd";
import {
  SaveOutlined,
  RobotOutlined,
  SendOutlined,
  UploadOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import { colors } from "assets/theme/color";
import axios from "axios";
import lessonService from "services/lessonService";
import LessonBySchedule from "./LessonBySchedule";
import lessonByScheduleService from "services/lessonByScheduleService";
import TextArea from "antd/es/input/TextArea";
import homeWorkService from "services/homeWorkService";
import notificationService from "services/notificationService";
import user_notificationService from "services/user_notificationService";
import Compressor from "compressorjs";
import SpeechToTextComponent from "./SpeechToTextComponent";

const { Title } = Typography;
const { Option } = Select;
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
export default function CreateLesson({
  toolbar,
  quillFormats,
  levels,
  isMobile,
  loadingCreateLesson,
  setLoadingCreateLesson,
  teacherId,
  lessonByScheduleData,
  daysOfWeek,
  lessonsData,
  setLessonByScheduleData,
  loadingTTSLesson,
  setLoadingTTSLesson,
  level,
  classID,
  students,
  lessons,
  setLessons,
  quillRefDescription,
  quillRefLessonPlan,
  placeholderLessonPlan,
}) {
  const [form] = Form.useForm();
  // const quillRefDescription = useRef(null); // Ref cho description
  // const quillRefLessonPlan = useRef(null); // Ref cho lessonPlan
  const [quillDescription, setQuillDescription] = useState(null); // Quill instance cho description
  const [quillLessonPlan, setQuillLessonPlan] = useState(null); // Quill instance cho lessonPlan
  const [selected, setSelected] = useState(new Set());
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingEnhanceDescription, setLoadingEnhanceDescription] = useState(false); // Loading cho description
  const [loadingEnhanceLessonPlan, setLoadingEnhanceLessonPlan] = useState(false); // Loading cho lessonPlan
  const [gender, setGender] = useState(1);
  const [openSend, setOpenSend] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingCreateAndSend, setLoadingCreateAndSend] = useState(false);

  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [currentYoutubeLink, setCurrentYoutubeLink] = useState("");
  const [editYoutubeIndex, setEditYoutubeIndex] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [swapHtmlMode, setSwapHtmlMode] = useState(false);
  const [htmlLessonPlanContent, setHtmlLessonPlanContent] = useState("");
  const [swapHtmlLessonPlanMode, setSwapHtmlLessonPlanMode] = useState(false);
  const [voices, setVoices] = useState(null);
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const resData = await homeWorkService.voices();
        setVoices(resData);
        setGender(resData ? resData[0] : null);
      } catch (error) {
        message.error("voices fetch failed");
      }
    };
    fetchVoices();
  }, []);
  const onChangeGender = (value) => {
    setGender(value);
  };

  useEffect(() => {
    if (quillRefDescription.current) {
      const editor = quillRefDescription.current.getEditor();
      setQuillDescription(editor);
    }
    if (quillRefLessonPlan.current) {
      const editor = quillRefLessonPlan.current.getEditor();
      setQuillLessonPlan(editor);
    }
  }, [quillRefDescription, quillRefLessonPlan]);

  // useEffect(() => {
  //   const quill = quillRefDescription.current?.getEditor();
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
  // }, [quillRefDescription]);
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

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );
        if (response.status === 201 && quillRefDescription.current) {
          const editor = quillRefDescription.current.getEditor();
          if (!editor) return;
          const range = editor.getSelection(true);
          editor.insertEmbed(range?.index ?? editor.getLength(), "image", response.data.url);
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
      //           if (response.status === 201 && quillRefDescription.current) {
      //             const editor = quillRefDescription.current?.getEditor();
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
            if (!editor) return;
            const range = editor.getSelection(true);
            editor.insertEmbed(range?.index ?? editor.getLength(), "image", response.data.url);
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

        if (response.status === 201 && quillRefDescription.current) {
          const editor = quillRefDescription.current.getEditor();
          if (!editor) return;
          const range = editor.getSelection(true);
          const audioUrl = response?.data?.url;

          // 👇 Đây là điểm quan trọng: insertEmbed với blot 'audio'
          editor.insertEmbed(range?.index ?? editor.getLength(), "audio", audioUrl, "user");
          editor.setSelection(range?.index ?? editor.getLength() + 1); // move cursor
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

  const handleSubmit = async (values, status) => {
    try {
      if (selected.size === 0) {
        message.warning("Vui lòng chọn ít nhất 1 ngày");
        return;
      }
      if (!status) {
        setLoadingCreateLesson(true);
      }
      if (status) {
        setLoadingCreateAndSend(true);
      }
      let linkYoutube = "";
      if (youtubeLinks?.length > 0) {
        linkYoutube = youtubeLinks.join(", ");
      }
      // if(status ===1){
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("level", level);
      formData.append("linkYoutube", linkYoutube);
      // formData.append("linkGame", values.linkGame);
      formData.append("linkGame", "meomeo");
      formData.append("textToSpeech", textToSpeech);
      formData.append(
        "description",
        quillRefDescription.current?.getEditor()?.root.innerHTML || ""
      ); // Lấy nội dung từ description
      formData.append("lessonPlan", quillRefLessonPlan.current?.getEditor()?.root.innerHTML || ""); // Lấy nội dung từ lessonPlan
      formData.append("teacherId", teacherId);

      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }

      const lessonData = await lessonService.createLesson(formData);
      // console.log(lessons, lessonData);

      setLessons((lesson) => [...lesson, lessonData]);
      let selectedSchedule = null;
      for (const item of selected) {
        const data = await lessonByScheduleService.updateLessonOfLessonBySchedule(
          item,
          lessonData.id
        );
        selectedSchedule = data;
      }
      if (status !== true) {
        message.success("Lesson created successfully!");
      }
      // }
      if (status === true) {
        const data = await lessonByScheduleService.updateSendingLessonStatus(
          selectedSchedule?.id,
          true
        );
        const lessonByScheduleDataUpdated = lessonByScheduleData?.map((item) => {
          if (item.id === selectedSchedule?.id) {
            return { ...item, lessonID: lessonData.id, isLessonSent: true };
          }
          return item;
        });
        setLessonByScheduleData(lessonByScheduleDataUpdated);
        let detailStr = "Bạn mới có bài học mới vào ngày:";
        // console.log(data);
        const date =
          lessonByScheduleDataUpdated.find((item) => item?.id === selectedSchedule?.id)?.date ||
          null;
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
            notificationID: notificationRes?.id,
            studentID: element?.id,
          };
          const userNotificationRes = await user_notificationService.createUserNotification(
            userNotificationData
          );
        });
        message.success("Đã gửi bài học thành công!");
      }
      // setSelected(new Set());
      // form.resetFields();
      // setTextToSpeech("");
      // setMp3file(null);
      // setMp3Url("");
      // // quillDescription.setText(""); // Reset description
      // if (quillRefDescription.current) {
      //   const editor = quillRefDescription.current.getEditor();
      //   editor.setContents([]);
      // }
      setSelected(new Set());
      form.resetFields();
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
      setYoutubeLinks([]);
      setCurrentYoutubeLink("");
      setEditYoutubeIndex(null);
      setHtmlContent("");
      setHtmlLessonPlanContent("");
      setSwapHtmlLessonPlanMode(false);
      setSwapHtmlMode(false);
      if (quillRefDescription.current) {
        const editor = quillRefDescription.current.getEditor();
        editor.setContents([]);
      }
      if (quillRefLessonPlan.current) {
        const editor = quillRefLessonPlan.current.getEditor();
        editor.setContents([]);
      }
      // quillLessonPlan.setText("");
    } catch (err) {
      message.error("Failed to create lesson. Please try again." + err);
    } finally {
      setLoadingCreateLesson(false);
      setLoadingCreateAndSend(false);
    }
  };
  const onSubmitWithStatus = (status) => {
    form
      .validateFields()
      .then((values) => {
        handleSubmit(values, status);
      })
      .catch((err) => {
        console.error("Validation failed:", err);
      });
  };
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTSLesson(true);

    try {
      const response = await homeWorkService.textToSpeech({ textToSpeech, voice: gender });
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
  // console.log(placeholderLessonPlan);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "10px",
        maxHeight: "70vh",
        overflow: "auto",
        height: "70vh",
      }}
    >
      <div
        style={{
          height: "60vh",
          maxHeight: "60vh",
          overflow: "auto",
          width: isMobile ? "100%" : "70%",
        }}
      >
        <Card
          style={{
            borderRadius: "12px",
            // boxShadow: "0 4px 12px " + colors.softShadow,
            background: colors.white,
            maxWidth: "100%",
            margin: "0 10px",
          }}
        >
          <div style={{ marginBottom: isMobile ? "" : "14px" }}>
            <Title level={5} style={{ margin: "5px 0", color: colors.darkGreen }}>
              Tạo bài học mới
            </Title>
            <Divider style={{ borderColor: colors.paleGreen }} />
          </div>
          <Form
            form={form}
            layout="vertical"
            // onFinish={(values) => handleSubmit(values, false)}
            initialValues={{
              name: "",
              level: "",
              // linkYoutube: "",
              linkGame: "",
              textToSpeech: "",
              description: "",
              lessonPlan: "",
            }}
          >
            <Form.Item
              name="name"
              label="Tên bài học"
              rules={[
                { required: true, message: "Please enter the lesson name" },
                { max: 100, message: "Name cannot be longer than 100 characters" },
              ]}
            >
              <Input
                placeholder="Nhập tên bài học"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item>
            <Button
              style={{
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                color: colors.white,
                margin: "10px 0",
                marginRight: " 10px",
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
                margin: "10px 0",
              }}
              icon={<SwapOutlined />}
              onClick={() => {
                if (!swapHtmlMode) {
                  const html = quillRefDescription.current?.getEditor()?.root?.innerHTML || "";
                  setHtmlContent(html);
                  setSwapHtmlMode(true);
                } else {
                  quillRefDescription.current
                    ?.getEditor()
                    .clipboard.dangerouslyPasteHTML(htmlContent);
                  setSwapHtmlMode(false);
                }
              }}
            >
              Swap to {swapHtmlMode ? "Quill" : "HTML"}
            </Button>
            <Form.Item
              // name="description"
              label="Mô tả"
            >
              {
                <ReactQuill
                  id="lessonDescriptionCreate"
                  theme="snow"
                  modules={modules}
                  formats={quillFormats}
                  ref={quillRefDescription}
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
                  id="lessonPlanCreate"
                  theme="snow"
                  modules={modulesLessonPlan}
                  formats={quillFormats}
                  ref={quillRefLessonPlan}
                  placeholder={placeholderLessonPlan}
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
            <style>{`
            .ant-select-dropdown{
            z-index: 10000000000 !important;
            }
          `}</style>
            <Form.Item>
              <Select
                style={{ width: "50%" }}
                value={gender}
                onChange={onChangeGender}
                placeholder="Chọn giọng"
                options={voices?.map((item) => {
                  return { label: item?.split("_")[1], value: item };
                })}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                onClick={handleConvertToSpeech}
                loading={loadingTTSLesson}
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
            {/* <Form.Item name="linkYoutube" label="Link Youtube bài học">
              <Input
                placeholder="Nhập link youtube bài học"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item> */}
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
            {/* <Form.Item name="Speech to text" label="Chuyển giọng nói thành văn bản">
              <SpeechToTextComponent />
            </Form.Item> */}
          </Form>
        </Card>
      </div>

      {isMobile && (
        <>
          <Button
            type="primary"
            htmlType="submit"
            loading={loadingCreateLesson}
            icon={<SaveOutlined />}
            style={{
              borderRadius: "6px",
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              boxShadow: "0 2px 0 " + colors.softShadow,
            }}
            onClick={() => onSubmitWithStatus(false)}
          >
            Lưu
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loadingCreateAndSend}
            icon={<SendOutlined />}
            style={{
              borderRadius: "6px",
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              boxShadow: "0 2px 0 " + colors.softShadow,
            }}
            onClick={() => onSubmitWithStatus(true)}
          >
            Gửi link
          </Button>
        </>
      )}
      <div
        style={{
          maxHeight: "60vh",
          overflow: "auto",
          width: isMobile ? "100%" : "29%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <LessonBySchedule
          lessonByScheduleData={lessonByScheduleData}
          daysOfWeek={daysOfWeek}
          lessonsData={lessonsData}
          setLessonByScheduleData={setLessonByScheduleData}
          isMobile={isMobile}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "right", width: "100%", gap: "10px" }}>
        {!isMobile && (
          <>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingCreateLesson}
              icon={<SaveOutlined />}
              style={{
                borderRadius: "6px",
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                boxShadow: "0 2px 0 " + colors.softShadow,
              }}
              onClick={() => onSubmitWithStatus(false)}
            >
              Lưu
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loadingCreateAndSend}
              icon={<SendOutlined />}
              style={{
                borderRadius: "6px",
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                boxShadow: "0 2px 0 " + colors.softShadow,
              }}
              onClick={() => onSubmitWithStatus(true)}
            >
              Gửi link
            </Button>
          </>
        )}
      </div>
      <Modal
        title="Danh sách các lịch học đã có bài học"
        open={openSend}
        onCancel={() => setOpenSend(false)}
        footer={<></>}
        centered
        width={isMobile ? "90%" : "60%"}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {lessonByScheduleData?.length > 0 ? (
            lessonByScheduleData?.map((item, index) => {
              return item.lessonID ? (
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
                    {lessonsData.find((ls) => ls.id === item.lessonID)?.title}
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

CreateLesson.propTypes = {
  toolbar: PropTypes.array.isRequired,
  quillFormats: PropTypes.array.isRequired,
  levels: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  loadingCreateLesson: PropTypes.bool.isRequired,
  setLoadingCreateLesson: PropTypes.func.isRequired,
  teacherId: PropTypes.string.isRequired,
  lessonByScheduleData: PropTypes.array.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  lessonsData: PropTypes.array.isRequired,
  setLessonByScheduleData: PropTypes.func.isRequired,
  loadingTTSLesson: PropTypes.bool.isRequired,
  setLoadingTTSLesson: PropTypes.func.isRequired,
  level: PropTypes.number.isRequired,
  classID: PropTypes.number.isRequired,
  students: PropTypes.array.isRequired,
  lessons: PropTypes.array.isRequired,
  setLessons: PropTypes.func.isRequired,
  quillRefDescription: PropTypes.object.isRequired,
  quillRefLessonPlan: PropTypes.object.isRequired,
  placeholderLessonPlan: PropTypes.string.isRequired,
};
