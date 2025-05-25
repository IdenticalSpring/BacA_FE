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
  Spin,
  Table,
  Typography,
} from "antd";
import {
  CopyOutlined,
  IdcardOutlined,
  ReadOutlined,
  SaveOutlined,
  SendOutlined,
  SwapOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import { colors } from "assets/theme/color";
import axios from "axios";
import lessonService from "services/lessonService";
import TextArea from "antd/es/input/TextArea";
import homeWorkService from "services/homeWorkService";
import HomeWorkBySchedule from "./HomeWorkBySchedule";
import lessonByScheduleService from "services/lessonByScheduleService";
import notificationService from "services/notificationService";
import user_notificationService from "services/user_notificationService";
import classService from "services/classService";
import { BookOutlined } from "@ant-design/icons";
import Compressor from "compressorjs";
import SpeechToTextComponent from "components/TeacherPageComponent/SpeechToTextComponent";
import VocabularyCreateComponent from "./VocabularyCreateComponent";
import vocabularyService from "services/vocabularyService";

const { Title } = Typography;
const { Text } = Typography;
const { Option } = Select;
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
export default function CreateHomeWork({
  toolbar,
  quillFormats,
  levels,
  isMobile,
  loadingCreateHomeWork,
  setLoadingCreateHomeWork,
  teacherId,
  loadingTTSHomeWork,
  setLoadingTTSHomeWork,
  level,
  lessonByScheduleData,
  daysOfWeek,
  homeWorksData,
  setLessonByScheduleData,
  classID,
  students,
  homeworkZaloLink,
  homeWorks,
  setHomeWorks,
  quillRef,
}) {
  const [form] = Form.useForm();
  // const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [showAccessId, setShowAccessId] = useState(false);
  const [accessId, setAccessId] = useState("");
  const [loadingClass, setLoadingClass] = useState(false);
  const homeworkLink = "https://happyclass.com.vn/do-homework";
  const [copySuccess, setCopySuccess] = useState(false);
  const [gender, setGender] = useState(1);
  const [openSend, setOpenSend] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingCreateAndSend, setLoadingCreateAndSend] = useState(false);
  const [zaloLink, setZaloLink] = useState("");
  const onChangeGender = ({ target: { value } }) => {
    // console.log("radio3 checked", value);
    setGender(value);
  };
  const [gameLinks, setGameLinks] = useState([]);
  const [currentLink, setCurrentLink] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [currentYoutubeLink, setCurrentYoutubeLink] = useState("");
  const [editYoutubeIndex, setEditYoutubeIndex] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [swapHtmlMode, setSwapHtmlMode] = useState(false);
  const [vocabularyList, setVocabularyList] = useState([]);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(homeworkLink).then(() => {
      setCopySuccess(true);
      message.success("Copied to clipboard!"); // Hiển thị thông báo

      // Reset hiệu ứng sau 2 giây
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      setQuill(editor);
    }
  }, [quillRef]);
  useEffect(() => {
    setZaloLink(homeworkZaloLink);
  }, [homeworkZaloLink]);
  // console.log(zaloLink);
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
  //           maxHeight: 800, // Optional, resize chiều cao nếu cần
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
      // console.log([...formData]);

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );
        // console.log(response.data.url);

        // const result = await response.json();

        if (response.status === 201 && quillRef.current) {
          const editor = quillRef.current?.getEditor();
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
      // ✅ Resize ảnh trước khi upload
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
  const audioHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "audio/*");
    input.setAttribute("multiple", "true"); // Allow multiple audio selection
    input.click();

    input.onchange = async () => {
      const files = Array.from(input.files);
      if (!files.length) return;

      const editor = quillRef.current?.getEditor();
      if (!editor) return;

      let currentIndex = editor.getSelection(true)?.index ?? editor.getLength();

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await axios.post(
            process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
            formData
          );

          if (response.status === 201) {
            const audioUrl = response?.data?.url;
            editor.insertEmbed(currentIndex, "audio", audioUrl, "user");
            currentIndex++; // Increment index for the next audio
            editor.setSelection(currentIndex); // Move cursor
          } else {
            message.error(`Upload failed for ${file.name}. Try again!`);
          }
        } catch (error) {
          console.error(`Error uploading audio ${file.name}:`, error);
          message.error(`Upload error for ${file.name}. Please try again!`);
        }
      }
    };
  }, [quillRef]);
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
  // console.log(vocabularyList);

  const handleSubmit = async (values, status) => {
    try {
      if (selected.size === 0) {
        message.warning("Vui lòng chọn ít nhất 1 ngày");
        return;
      }
      if (!status) {
        setLoadingCreateHomeWork(true);
      }
      if (status) {
        setLoadingCreateAndSend(true);
      }
      let linkGame = "";
      if (gameLinks?.length > 0) {
        linkGame = gameLinks.join(", ");
        // gameLinks.map((link) => (linkGame += link + ", "));
      }
      let linkYoutube = "";
      if (youtubeLinks?.length > 0) {
        linkYoutube = youtubeLinks.join(", ");
      }
      // Tạo FormData
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("level", level);
      formData.append("linkYoutube", linkYoutube);
      formData.append("linkGame", linkGame);
      // formData.append("linkZalo", zaloLink);
      // formData.append("textToSpeech", textToSpeech);
      formData.append("description", quillRef.current?.getEditor()?.root?.innerHTML || "");
      formData.append("teacherId", teacherId);
      // if (selected.size > 0) {
      //   formData.append("status", 1);
      // }

      // Nếu có mp3Url thì fetch dữ liệu và append vào formData
      // if (mp3file) {
      //   formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      // }

      const homeworkData = await homeWorkService.createHomeWork(formData);
      if (vocabularyList.length > 0) {
        const formDataForVocabulary = new FormData();
        const vocabularies = [];
        const mp3Files = [];
        vocabularyList.forEach((item) => {
          if (item?.isNew) {
            const vocabulary = {
              textToSpeech: item.word,
              imageUrl: item.imageUrl,
              homeworkId: homeworkData.id,
            };
            vocabularies.push(vocabulary);
            // mp3Files.push(mp3File);
            // mp3Files.push(mp3File);
            let fileToAppend;
            if (item?.audioFile) {
              fileToAppend = new File([item.audioFile], "audio.mp3", { type: "audio/mp3" });
            } else {
              // 👇 Tạo file rỗng nếu không có audio
              const emptyBlob = new Blob([], { type: "audio/mp3" });
              fileToAppend = new File([emptyBlob], "audio.mp3", { type: "audio/mp3" });
            }
            formDataForVocabulary.append("mp3Files", fileToAppend);
          }
        });
        formDataForVocabulary.append("vocabularies", JSON.stringify(vocabularies));
        // formDataForVocabulary.append("mp3Files", mp3Files);
        const vocabularyResponse = await vocabularyService.bulkCreateVocabulary(
          formDataForVocabulary
        );
      }
      setHomeWorks((homework) => [...homework, homeworkData]);
      let selectedSchedule = null;
      for (const item of selected) {
        const data = await lessonByScheduleService.updateHomeWorkLessonBySchedule(
          item,
          homeworkData.id
        );
        selectedSchedule = data;
      }
      if (status !== true) {
        message.success("Homework created successfully!");
      }
      if (status === true) {
        const data = await lessonByScheduleService.updateSendingHomeworkStatus(
          selectedSchedule?.id,
          true
        );
        const lessonByScheduleDataUpdated = lessonByScheduleData?.map((item) => {
          if (item.id === selectedSchedule?.id) {
            return { ...item, homeWorkId: homeworkData?.id, isHomeWorkSent: true };
          }
          return item;
        });
        setLessonByScheduleData(lessonByScheduleDataUpdated);
        let detailStr = "Bạn mới có bài tập mới vào ngày:";
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
          title: "Bài tập mới",
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
        message.success("Đã gửi bài tập thành công!");
        setShowAccessId(true);
      }
      form.resetFields();
      setSelected(new Set());
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
      setCurrentLink("");
      setHtmlContent("");
      setSwapHtmlMode(false);
      setVocabularyList([]);
      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        editor.setContents([]);
      }
    } catch (err) {
      message.error("Failed to create lesson. Please try again.");
    } finally {
      setLoadingCreateHomeWork(false);
      setLoadingCreateAndSend(false);
    }
  };
  const handleUpdateSendingHomeworkStatus = async (id) => {
    try {
      setLoadingSchedule(true);
      const data = await lessonByScheduleService.updateSendingHomeworkStatus(id, true);
      const lessonByScheduleDataUpdated = lessonByScheduleData.map((item) => {
        if (item.id === id) {
          return { ...item, isHomeWorkSent: true };
        }
        return item;
      });
      setLessonByScheduleData(lessonByScheduleDataUpdated);
      let detailStr = "Bạn mới có bài tập mới vào ngày:";
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
        title: "Bài tập mới",
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
      message.success("Đã gửi bài tập thành công!");
    } catch (err) {
      message.error("Lỗi khi gửi bài tập! " + err);
    } finally {
      setLoadingSchedule(false);
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
  // console.log(
  //   new Date("2025-03-28").toLocaleDateString("vi-VN", {
  //     timeZone: "UTC",
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //   })
  // );

  const handleLoadLessonContent = async () => {
    const today = new Date(); // Lấy ngày hiện tại thực tế
    const todayString = today.toISOString().split("T")[0]; // Định dạng YYYY-MM-DD

    // Tìm bài học của ngày hôm nay từ lessonByScheduleData
    const todayLesson = lessonByScheduleData.find(
      (lesson) => lesson.date === todayString && lesson.lessonID
    );

    if (todayLesson && todayLesson.lessonID) {
      try {
        // Gọi API để lấy thông tin lesson từ lessonID
        const lessonData = await lessonService.getLessonById(todayLesson.lessonID);

        if (lessonData && lessonData.name) {
          // Cập nhật các field trong Form
          form.setFieldsValue({
            title: lessonData.name, // Điền name của lesson vào field title
            linkYoutube: lessonData.linkYoutube || "", // Điền linkYoutube (nếu có) vào field linkYoutube
            description: lessonData.description || "", // Điền description (nếu có) vào field description
          });

          // Cập nhật nội dung description vào ReactQuill
          if (lessonData.description && quill) {
            quill.setContents([]); // Xóa nội dung hiện tại
            quill.clipboard.dangerouslyPasteHTML(lessonData.description); // Chèn description vào ReactQuill
          } else if (lessonData.content && quill) {
            // Nếu không có description nhưng có content, dùng content làm fallback
            quill.setContents([]);
            quill.clipboard.dangerouslyPasteHTML(lessonData.content);
          }

          message.success("Đã tải nội dung bài học hôm nay!");
        } else {
          message.warning("Không tìm thấy thông tin bài học.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin lesson:", error);
        message.error("Không thể tải thông tin bài học. Vui lòng thử lại.");
      }
    } else {
      message.warning("Không tìm thấy bài học cho ngày hôm nay.");
    }
  };
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTSHomeWork(true);

    try {
      const response = await homeWorkService.textToSpeech({ textToSpeech, gender });

      let base64String = response;
      // console.log(response);

      // base64String = btoa(
      //   new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
      // );
      // console.log(base64String);

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
      // console.log(audioBlob);

      // if (mp3Url) {
      //   const audioElement = document.getElementById("audio-player");
      //   if (audioElement) {
      //     audioElement.src = ""; // Xóa src trước khi revoke
      //     audioElement.load(); // Yêu cầu cập nhật
      //   }
      //   URL.revokeObjectURL(mp3Url);
      // }
      // console.log("mémaeseaseas");

      let audioUrl = URL.createObjectURL(audioBlob);
      setMp3Url(audioUrl);
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTSHomeWork(false);
  };
  // console.log(mp3Url);
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
  useEffect(() => {
    const fetchClass = async () => {
      try {
        setLoadingClass(true);
        const data = await classService.getClassById(classID);
        setAccessId(data?.accessId);
      } catch (err) {
        setAccessId(err);
      } finally {
        setLoadingClass(false);
      }
    };
    fetchClass();
  }, [classID]);
  // console.log(homeworkZaloLink);

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
        // height: "70vh",
      }}
    >
      <div style={{ maxHeight: "60vh", overflow: "auto", width: isMobile ? "100%" : "70%" }}>
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
            {/* <Button
                          icon={<ArrowLeftOutlined />}
                          onClick={() => navigate("/teacherpage/manageLessons")}
                          style={{
                            border: "none",
                            boxShadow: "none",
                            paddingLeft: 0,
                            color: colors.deepGreen,
                          }}
                        >
                          Back to Lessons
                        </Button> */}
            <Title level={5} style={{ margin: "5px 0", color: colors.darkGreen }}>
              Tạo bài tập
            </Title>
            <Divider style={{ borderColor: colors.paleGreen }} />
          </div>

          <Form
            form={form}
            layout="vertical"
            // onFinish={handleSubmit}
            initialValues={{
              title: "",
              level: "",
              // linkYoutube: "",
              linkGame: "",
              // linkZalo: "",
              description: "",
              textToSpeech: "",
            }}
          >
            <Form.Item>
              <Button
                type="default"
                icon={<BookOutlined />}
                onClick={handleLoadLessonContent}
                style={{
                  backgroundColor: colors.deepGreen,
                  borderColor: colors.deepGreen,
                  color: colors.white,
                }}
              >
                Nội dung bài học
              </Button>
            </Form.Item>

            <Form.Item
              name="title"
              label="Tiêu đề bài tập"
              rules={[
                { required: true, message: "Please enter the homework name" },
                { max: 100, message: "Title cannot be longer than 100 characters" },
              ]}
            >
              <Input
                placeholder="Nhập tiêu đề bài tập"
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
                  id="HomeworkDescriptionCreate"
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

            {/* <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: "Please select a level" }]}
          >
            <Select
              placeholder="Select level"
              style={{
                borderRadius: "6px",
              }}
            >
              {levels?.map((level, index) => (
                <Option key={index} value={level.id}>
                  {level.name}
                </Option>
              ))}
            </Select>
          </Form.Item> */}

            {/* <Form.Item label="Văn bản thành giọng nói">
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
            </Form.Item> */}
            {/* <Form.Item>
              <Button
                type="primary"
                onClick={handleConvertToSpeech}
                loading={loadingTTSHomeWork}
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
            )} */}
            <Form.Item name="Speech to text">
              <VocabularyCreateComponent
                isMobile={isMobile}
                setVocabularyList={setVocabularyList}
                vocabularyList={vocabularyList}
                audioId={"audio-player-create"}
              />
            </Form.Item>
            {/* <div style={{ marginBottom: "16px" }}>
            <audio controls style={{ width: "100%" }}>
              <source
                src={
                  "https://res.cloudinary.com/ddd1hxsx0/video/upload/v1742718873/o7o1ouv3el4w72s4rxnc.mp3"
                }
                type="audio/mp3"
              />
              Your browser does not support the audio element.
            </audio>
          </div> */}
            {/* <Form.Item
              name="linkYoutube"
              label="Link Youtube bài tập"
              // rules={[{ required: true, message: "Please enter the homework link" }]}
            >
              <Input
                placeholder="Nhập link youtube bài tập"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item> */}

            {/* <Form.Item label="Link Youtube bài tập">
              <Input.Group compact>
                <Input
                  value={currentYoutubeLink}
                  placeholder="Nhập link youtube bài tập"
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
                dataSource={youtubeLinks.map((link, index) => ({ key: index, link }))}
                pagination={false}
              />
            )} */}
            {/* <Form.Item name="linkGame" label="Link game bài tập">
              <Input
                placeholder="Nhập link game bài tập"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item> */}
            <Form.Item label="Link game bài tập">
              <Input.Group compact>
                <Input
                  value={currentLink}
                  placeholder="Nhập link game bài tập"
                  style={{
                    width: "calc(100% - 120px)",
                    borderRadius: "6px",
                    borderColor: colors.inputBorder,
                  }}
                  onChange={(e) => setCurrentLink(e.target.value)}
                />
                <Button
                  type="primary"
                  onClick={() => {
                    if (!currentLink) return;
                    if (editIndex !== null) {
                      const updated = [...gameLinks];
                      updated[editIndex] = currentLink;
                      setGameLinks(updated);
                      setEditIndex(null);
                    } else {
                      setGameLinks([...gameLinks, currentLink]);
                    }
                    setCurrentLink("");
                  }}
                >
                  {editIndex !== null ? "Cập nhật" : "Thêm"}
                </Button>
              </Input.Group>
            </Form.Item>
            {gameLinks?.length > 0 && (
              <Table
                columns={[
                  {
                    title: "STT",
                    dataIndex: "index",
                    render: (_, __, i) => i + 1,
                  },
                  {
                    title: "Link Game",
                    dataIndex: "link",
                  },
                  {
                    title: "Hành động",
                    render: (_, record, index) => (
                      <>
                        <Button
                          type="link"
                          onClick={() => {
                            setCurrentLink(record.link);
                            setEditIndex(index);
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          type="link"
                          danger
                          onClick={() => {
                            const updated = gameLinks.filter((_, i) => i !== index);
                            setGameLinks(updated);
                            if (editIndex === index) {
                              setCurrentLink("");
                              setEditIndex(null);
                            }
                          }}
                        >
                          Xoá
                        </Button>
                      </>
                    ),
                  },
                ]}
                dataSource={gameLinks.map((link, index) => ({ key: index, link }))}
                pagination={false}
              />
            )}

            {/* <Form.Item label="Link Zalo bài tập">
              <Input
                placeholder="Nhập link zalo bài tập"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
                value={zaloLink}
                onChange={(e) => setZaloLink(e.target.value)}
              />
            </Form.Item> */}
          </Form>
        </Card>
      </div>
      {isMobile && (
        <>
          <Button
            type="primary"
            htmlType="submit"
            loading={loadingCreateHomeWork}
            icon={<SaveOutlined />}
            style={{
              borderRadius: "6px",
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
              boxShadow: "0 2px 0 " + colors.softShadow,
            }}
            onClick={() => {
              onSubmitWithStatus(false);
            }}
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
            onClick={() => {
              onSubmitWithStatus(true);
            }}
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
        <HomeWorkBySchedule
          lessonByScheduleData={lessonByScheduleData}
          daysOfWeek={daysOfWeek}
          homeWorksData={homeWorksData}
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
              loading={loadingCreateHomeWork}
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
              onClick={() => {
                onSubmitWithStatus(true);
              }}
            >
              Gửi link
            </Button>
          </>
        )}
      </div>
      <Modal
        open={showAccessId}
        onCancel={() => setShowAccessId(false)}
        onClose={() => setShowAccessId(false)}
        footer={<></>}
      >
        {loadingClass ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin />
          </div>
        ) : (
          <Card style={{ maxWidth: "90%", margin: "auto", textAlign: "center" }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <ReadOutlined style={{ fontSize: 32, color: "#1890ff" }} />
              <Text strong style={{ fontSize: 16 }}>
                Mã lớp của bạn là: <Text type="danger">{accessId}</Text>
              </Text>
              <Input value={homeworkLink} readOnly style={{ textAlign: "center", width: "100%" }} />

              {/* Nút Copy với hiệu ứng */}
              <Button
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
                type={copySuccess ? "default" : "primary"}
              >
                {copySuccess ? "Copied!" : "Copy Link bài tập"}
              </Button>
            </Space>
          </Card>
        )}
      </Modal>
      <Modal
        title="Danh sách các lịch học đã có bài tập"
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
              return item.homeWorkId ? (
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
                    {homeWorksData.find((hw) => hw.id === item.homeWorkId)?.title}
                  </div>
                  <Button
                    disabled={item.isHomeWorkSent}
                    loading={loadingSchedule}
                    onClick={() => {
                      handleUpdateSendingHomeworkStatus(item.id);
                    }}
                  >
                    {item.isHomeWorkSent ? <Text>Đã gửi bài tập</Text> : <Text>Gửi bài tập</Text>}
                  </Button>
                </div>
              ) : null;
            })
          ) : (
            <Text>Không có bài tập nào</Text>
          )}
        </div>
      </Modal>
    </div>
  );
}
CreateHomeWork.propTypes = {
  toolbar: PropTypes.array.isRequired,
  quillFormats: PropTypes.array.isRequired,
  levels: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  loadingCreateHomeWork: PropTypes.bool.isRequired,
  setLoadingCreateHomeWork: PropTypes.func.isRequired,
  teacherId: PropTypes.number.isRequired,
  loadingTTSHomeWork: PropTypes.bool.isRequired,
  setLoadingTTSHomeWork: PropTypes.func.isRequired,
  lessonByScheduleData: PropTypes.array.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  homeWorksData: PropTypes.array.isRequired,
  setLessonByScheduleData: PropTypes.func.isRequired,
  level: PropTypes.number.isRequired,
  classID: PropTypes.number.isRequired, // Giả sử level là string
  students: PropTypes.array.isRequired, // Giả sử level là string
  homeworkZaloLink: PropTypes.string.isRequired,
  homeWorks: PropTypes.array.isRequired,
  setHomeWorks: PropTypes.func.isRequired,
  quillRef: PropTypes.object.isRequired,
};
