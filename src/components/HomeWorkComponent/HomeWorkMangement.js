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
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { colors } from "assets/theme/color";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import PropTypes from "prop-types";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ReadOutlined,
  SearchOutlined,
  SwapOutlined,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import homeWorkService from "services/homeWorkService";
import TextArea from "antd/es/input/TextArea";
import axios from "axios";
import lessonByScheduleService from "services/lessonByScheduleService";
import notificationService from "services/notificationService";
import user_notificationService from "services/user_notificationService";
import classService from "services/classService";
import Compressor from "compressorjs";
import SpeechToTextComponent from "components/TeacherPageComponent/SpeechToTextComponent";
import VocabularyCreateComponent from "./VocabularyCreateComponent";
import QuestionCreateComponent from "./QuestionCreateComponent";
import vocabularyService from "services/vocabularyService";
import questionService from "services/questionService";

const { Title, Text } = Typography;
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
    node.style.width = "100%";
    node.style.margin = "10px 0";
    node.onerror = () => {
      console.error("Audio failed to load:", url);
      message.error(`Không thể tải audio: ${url}`);
    };
    return node;
  }
  static value(node) {
    return node.getAttribute("src");
  }
}
AudioBlot.blotName = "audio";
AudioBlot.tagName = "audio";

class CustomVideo extends BlockEmbed {
  static blotName = "video";
  static tagName = "iframe";
  static create(value) {
    const node = super.create();
    const src = typeof value === "string" ? value : value.src;
    node.setAttribute("src", src);
    node.setAttribute("frameborder", "0");
    node.setAttribute("allowfullscreen", "true");
    node.classList.add("responsive-iframe");
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
    node.style.maxWidth = "100%";
    node.style.margin = "10px 0";
    node.style.cursor = "zoom-in";
    node.onerror = () => {
      console.error("Image failed to load:", value);
      message.error(`Không thể tải ảnh: ${value}`);
    };
    node.addEventListener("click", () => {
      window.open(value, "_blank");
    });
    return node;
  }
  static value(node) {
    return node.getAttribute("src");
  }
}
Quill.register(AudioBlot);
Quill.register(CustomImageBlot);
Quill.register(CustomVideo);

export default function HomeWorkManagement({
  toolbar,
  quillFormats,
  levels,
  isMobile,
  setModalUpdateHomeWorkVisible,
  setEditingHomeWork,
  modalUpdateHomeWorkVisible,
  editingHomeWork,
  loading,
  homeWorks,
  setHomeWorks,
  setLoadingTTSForUpdateHomeWork,
  loadingTTSForUpdateHomeWork,
  teacherId,
  level,
  lessonByScheduleData,
  daysOfWeek,
  setLessonByScheduleData,
  classID,
  students,
  quillRef,
  selectedClass,
  teachers,
  classes,
}) {
  const [form] = Form.useForm();
  const [quill, setQuill] = useState(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [gender, setGender] = useState(1);
  const [openSend, setOpenSend] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedHomeWorkId, setSelectedHomeWorkId] = useState(null);
  const [showAccessId, setShowAccessId] = useState(false);
  const [accessId, setAccessId] = useState("");
  const [loadingClass, setLoadingClass] = useState(false);
  const [questionList, setQuestionList] = useState([]);
  const homeworkLink = "https://happyclass.com.vn/do-homework";
  const [copySuccess, setCopySuccess] = useState(false);
  const [gameLinks, setGameLinks] = useState([]);
  const [currentLink, setCurrentLink] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [currentYoutubeLink, setCurrentYoutubeLink] = useState("");
  const [editYoutubeIndex, setEditYoutubeIndex] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [swapHtmlMode, setSwapHtmlMode] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dataSearch, setDataSearch] = useState([]);
  const [vocabularyList, setVocabularyList] = useState([]);

  useEffect(() => {
    if (searchText === "") {
      setDataSearch(homeWorks);
    } else {
      const filteredData = homeWorks?.filter((homework) =>
        homework.title.toLowerCase().includes(searchText.toLowerCase())
      );
      setDataSearch(filteredData);
    }
  }, [searchText, homeWorks]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (selectedHomeWorkId) {
        try {
          const questions = await questionService.getQuestionsByHomeworkId(selectedHomeWorkId);
          setQuestionList(questions);
        } catch (error) {
          console.error("Error fetching questions:", error);
          message.error("Không thể tải danh sách câu hỏi");
        }
      } else {
        setQuestionList([]);
      }
    };
    fetchQuestions();
  }, [selectedHomeWorkId, editingHomeWork]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(homeworkLink).then(() => {
      setCopySuccess(true);
      message.success("Copied to clipboard!");
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const onChangeGender = ({ target: { value } }) => {
    setGender(value);
  };

  const handleDelete = async (id) => {
    try {
      await homeWorkService.deleteHomeWork(id);
      setHomeWorks(homeWorks.filter((homeWork) => homeWork.id !== id));
      message.success("Homework deleted successfully");
    } catch (err) {
      message.error("Error deleting homework!");
    }
  };

  const handleEdit = (homeWork) => {
    setEditingHomeWork(homeWork);
    setSelectedHomeWorkId(homeWork?.id);
    const links = homeWork?.linkGame.split(", ").filter((link) => link !== "");
    setGameLinks(links);
    const youtubeLinks = homeWork?.linkYoutube
      ? homeWork.linkYoutube.split(", ").filter((link) => link !== "")
      : [];
    setYoutubeLinks(youtubeLinks);
    form.setFieldsValue({
      title: homeWork.title,
      linkSpeech: homeWork.linkSpeech,
    });
    setMp3Url(homeWork.linkSpeech);
    setModalUpdateHomeWorkVisible(true);
    setTextToSpeech(homeWork.textToSpeech || "");
  };

  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const response = await vocabularyService.getVocabularyByHomworkId(selectedHomeWorkId);
        setVocabularyList(response);
      } catch (error) {
        console.error("Error fetching vocabulary:", error);
      }
    };
    fetchVocabulary();
  }, [selectedHomeWorkId, editingHomeWork]);

  useEffect(() => {
    if (
      modalUpdateHomeWorkVisible &&
      quillRef.current?.getEditor() &&
      editingHomeWork?.description
    ) {
      setTimeout(() => {
        quillRef.current?.getEditor().setContents([]);
        quillRef.current
          ?.getEditor()
          .clipboard.dangerouslyPasteHTML(0, editingHomeWork.description);
      }, 100);
    }
  }, [modalUpdateHomeWorkVisible, editingHomeWork, quillRef]);

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const handlePaste = async (e) => {
      const clipboardData = e.clipboardData || window.clipboardData;
      const items = clipboardData?.items;

      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault(); // Ngăn Quill xử lý mặc định

          const file = item.getAsFile();
          if (!file) return;

          const formData = new FormData();
          formData.append("file", file);

          try {
            console.log("Uploading pasted image:", file.name);
            const response = await axios.post(
              process.env.REACT_APP_API_BASE_URL + "/files/upload",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );

            if (response.status === 201 && response.data.url) {
              const imageUrl = response.data.url;
              const editor = quillRef.current?.getEditor();
              if (!editor) return;

              const range = editor.getSelection(true) || { index: editor.getLength() };
              editor.insertEmbed(range.index, "image", imageUrl, "user");

              setTimeout(() => {
                const imgs = editor.root.querySelectorAll(`img[src="${imageUrl}"]`);
                if (imgs.length === 0) {
                  console.error("Image not inserted into editor:", imageUrl);
                  message.error(`Không thể chèn ảnh vào editor`);
                } else {
                  imgs.forEach((img) => {
                    img.classList.add("ql-image");
                    img.style.maxWidth = "100%";
                    img.onerror = () => {
                      console.error("Image failed to load:", imageUrl);
                      message.error(`Không thể tải ảnh: ${imageUrl}`);
                    };
                  });
                  message.success(`Đã chèn ảnh từ clipboard thành công`);
                }
              }, 0);
            } else {
              message.error(`Upload ảnh thất bại: Không nhận được URL từ server`);
            }
          } catch (error) {
            console.error(`Lỗi khi upload ảnh từ clipboard:`, error);
            message.error(`Lỗi upload ảnh: ${error.response?.data?.message || error.message}`);
          }
          break; // Chỉ xử lý ảnh đầu tiên
        }
      }
    };

    const editor = quill?.root;
    editor?.addEventListener("paste", handlePaste);

    return () => {
      editor?.removeEventListener("paste", handlePaste);
    };
  }, [quillRef, editingHomeWork]);

  const handleConvertToSpeech = async () => {
    if (!textToSpeech) {
      return;
    }
    setLoadingTTSForUpdateHomeWork(true);
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
    setLoadingTTSForUpdateHomeWork(false);
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

  const handleSave = async () => {
    try {
      setLoadingUpdate(true);
      const values = await form.validateFields();
      const formData = new FormData();
      let linkGame = gameLinks?.length > 0 ? gameLinks.join(", ") : "";
      let linkYoutube = youtubeLinks?.length > 0 ? youtubeLinks.join(", ") : "";
      formData.append("title", values.title);
      formData.append("level", level);
      formData.append("linkYoutube", linkYoutube);
      formData.append("linkGame", linkGame);
      formData.append("description", quillRef.current?.getEditor()?.root?.innerHTML || "");
      formData.append("teacherId", teacherId);

      let homeWorkId;
      if (editingHomeWork) {
        const homeWorkData = await homeWorkService.editHomeWork(editingHomeWork.id, formData);
        homeWorkId = homeWorkData.id;
        setHomeWorks(
          homeWorks?.map((homeWork) =>
            homeWork.id === editingHomeWork.id ? { ...homeWork, ...homeWorkData } : homeWork
          )
        );
        message.success("HomeWork updated successfully");
      } else {
        const homeWorkData = await homeWorkService.createHomeWork(formData);
        homeWorkId = homeWorkData.id;
        setHomeWorks([...homeWorks, homeWorkData]);
        message.success("HomeWork created successfully");
      }

      // if (vocabularyList.length > 0) {
      //   const formDataForVocabulary = new FormData();
      //   const vocabularies = vocabularyList
      //     .filter((item) => item?.isNew)
      //     .map((item) => ({
      //       textToSpeech: item.word,
      //       imageUrl: item.imageUrl,
      //       homeworkId: homeWorkId,
      //     }));
      //   formDataForVocabulary.append("vocabularies", JSON.stringify(vocabularies));
      //   vocabularyList
      //     .filter((item) => item?.isNew)
      //     .forEach((item) => {
      //       const fileToAppend = item?.audioFile
      //         ? new File([item.audioFile], "audio.mp3", { type: "audio/mp3" })
      //         : new File([new Blob([], { type: "audio/mp3" })], "audio.mp3", { type: "audio/mp3" });
      //       formDataForVocabulary.append("mp3Files", fileToAppend);
      //     });
      //   await vocabularyService.bulkCreateVocabulary(formDataForVocabulary);
      // }
      // =================== PHẦN THAY ĐỔI LỚN ===================
      if (vocabularyList.length > 0) {
        // Lọc ra các từ vựng MỚI cần TẠO
        const newVocabularies = vocabularyList
          .filter((item) => item.isNew) // Chỉ lấy những item được thêm mới
          .map((item) => ({
            textToSpeech: item.word,
            imageUrl: item.imageUrl || null,
            audioUrl: item.audioUrl || null, // URL đã có sẵn từ VocabularyCreateComponent
            homeworkId: homeWorkId,
          }));

        if (newVocabularies.length > 0) {
          // Gửi mảng JSON đến backend
          await vocabularyService.bulkCreateVocabulary(newVocabularies);
          // Notify other components that vocabularies have changed
          try { window.dispatchEvent(new CustomEvent('vocabulary:changed', { detail: { homeworkId: homeWorkId } })); } catch (e) { console.warn('Failed to dispatch vocabulary:changed', e); }
        }

        // XỬ LÝ CẬP NHẬT TỪ VỰNG CŨ (Nếu bạn cho phép sửa)
        // Hiện tại component VocabularyCreateComponent chỉ cho phép thêm/xóa.
        // Nếu bạn muốn sửa từ vựng cũ, bạn sẽ cần thêm logic ở đây để gọi service `editvocabulary`.
      }
      // =========================================================

      if (questionList.length > 0) {
        const questionPromises = questionList
          .filter((item) => item?.isNew)
          .map((item) =>
            questionService.createQuestion({
              text: item.text,
              teacherId: item.teacher.id,
              classId: item.class.id,
              homeWorkId: homeWorkId,
              imageUrl: item.imageUrl || "",
            })
          );
        await Promise.all(questionPromises);
      }

      setModalUpdateHomeWorkVisible(false);
      form.resetFields();
      setEditingHomeWork(null);
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
      setCurrentLink("");
      setHtmlContent("");
      setSwapHtmlMode(false);
      setVocabularyList([]);
      setQuestionList([]);
    } catch (err) {
      message.error("Please check your input and try again: " + err);
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleUpdateSendingHomeworkStatus = async (id) => {
    setLoadingSchedule(true);
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      let linkGame = gameLinks?.length > 0 ? gameLinks.join(", ") : "";
      let linkYoutube = youtubeLinks?.length > 0 ? youtubeLinks.join(", ") : "";
      formData.append("title", values.title);
      formData.append("level", level);
      formData.append("linkYoutube", linkYoutube);
      formData.append("linkGame", linkGame);
      formData.append("description", quillRef.current?.getEditor()?.root?.innerHTML || "");
      formData.append("teacherId", teacherId);

      let homeWorkId;
      if (editingHomeWork) {
        const homeWorkData = await homeWorkService.editHomeWork(editingHomeWork.id, formData);
        homeWorkId = homeWorkData.id;
        setHomeWorks(
          homeWorks?.map((homeWork) =>
            homeWork.id === editingHomeWork.id ? { ...homeWork, ...homeWorkData } : homeWork
          )
        );
      } else {
        const homeWorkData = await homeWorkService.createHomeWork(formData);
        homeWorkId = homeWorkData.id;
        setHomeWorks([...homeWorks, homeWorkData]);
      }

      // if (vocabularyList.length > 0) {
      //   const formDataForVocabulary = new FormData();
      //   const vocabularies = vocabularyList
      //     .filter((item) => item?.isNew)
      //     .map((item) => ({
      //       textToSpeech: item.word,
      //       imageUrl: item.imageUrl,
      //       homeworkId: homeWorkId,
      //     }));
      //   formDataForVocabulary.append("vocabularies", JSON.stringify(vocabularies));
      //   vocabularyList
      //     .filter((item) => item?.isNew)
      //     .forEach((item) => {
      //       const fileToAppend = item?.audioFile
      //         ? new File([item.audioFile], "audio.mp3", { type: "audio/mp3" })
      //         : new File([new Blob([], { type: "audio/mp3" })], "audio.mp3", { type: "audio/mp3" });
      //       formDataForVocabulary.append("mp3Files", fileToAppend);
      //     });
      //   await vocabularyService.bulkCreateVocabulary(formDataForVocabulary);
      // }

      // =================== PHẦN THAY ĐỔI LỚN (Copy từ handleSave) ===================
      if (vocabularyList.length > 0) {
        const newVocabularies = vocabularyList
          .filter((item) => item.isNew)
          .map((item) => ({
            textToSpeech: item.word,
            imageUrl: item.imageUrl || null,
            audioUrl: item.audioUrl || null,
            homeworkId: homeWorkId, // homeWorkId đã được lấy từ bước cập nhật homework ở trên
          }));

        if (newVocabularies.length > 0) {
          await vocabularyService.bulkCreateVocabulary(newVocabularies);
        }
      }
      // =========================================================

      if (questionList.length > 0) {
        const questionPromises = questionList
          .filter((item) => item?.isNew)
          .map((item) =>
            questionService.createQuestion({
              text: item.text,
              teacherId: item.teacher.id,
              classId: item.class.id,
              homeWorkId: homeWorkId,
              imageUrl: item.imageUrl || "",
            })
          );
        await Promise.all(questionPromises);
      }

      const response = await lessonByScheduleService.updateSendingHomeworkStatus(id, true);
      const lessonByScheduleDataUpdated = lessonByScheduleData?.map((item) =>
        item?.id === id ? { ...item, isHomeWorkSent: true } : item
      );
      setLessonByScheduleData(lessonByScheduleDataUpdated);
      let detailStr = "Bạn mới có bài tập mới vào ngày:";
      const date = lessonByScheduleDataUpdated.find((item) => item?.id === id)?.date || null;
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
      students.forEach(async (element) => {
        const userNotificationData = {
          status: false,
          notificationID: notificationRes?.id,
          studentID: element?.id,
        };
        await user_notificationService.createUserNotification(userNotificationData);
      });

      message.success("Gửi bài tập thành công!");
      setShowAccessId(true);
      setModalUpdateHomeWorkVisible(false);
      form.resetFields();
      setEditingHomeWork(null);
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
      setCurrentLink("");
      setHtmlContent("");
      setSwapHtmlMode(false);
      setVocabularyList([]);
      setQuestionList([]);
    } catch (error) {
      console.error("Error updating sending homework status:", error);
      message.error("Có lỗi xảy ra trong quá trình gửi bài tập: " + error);
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

  const undoHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (quill && quill.history.stack.undo.length > 0) {
      quill.history.undo();
    } else {
      message.warning("No more undo available.");
    }
  }, []);

  const redoHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (quill && quill.history.stack.redo.length > 0) {
      quill.history.redo();
    } else {
      message.warning("No more redo available.");
    }
  }, []);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("multiple", "true");
    input.click();

    input.onchange = async () => {
      const files = Array.from(input.files);
      if (!files.length) {
        message.error("Vui lòng chọn ít nhất một file ảnh");
        return;
      }

      const editor = quillRef.current?.getEditor();
      if (!editor) {
        console.error("Editor not found");
        message.error("Không tìm thấy editor ReactQuill");
        return;
      }
      let currentIndex = editor.getSelection(true)?.index ?? editor.getLength();

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          console.log("Uploading image:", file.name);
          const response = await axios.post(
            process.env.REACT_APP_API_BASE_URL + "/files/upload",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          console.log("Image upload response:", response.data);

          if (response.status === 201 && response.data.url) {
            const imageUrl = response.data.url;
            editor.insertEmbed(currentIndex, "image", imageUrl, "user");
            setTimeout(() => {
              const imgs = editor.root.querySelectorAll(`img[src="${imageUrl}"]`);
              if (imgs.length === 0) {
                console.error("Image not inserted into editor:", imageUrl);
                message.error(`Không thể chèn ảnh ${file.name} vào editor`);
              } else {
                imgs.forEach((img) => {
                  img.classList.add("ql-image");
                  img.style.maxWidth = "100%";
                  img.onerror = () => {
                    console.error("Image failed to load:", imageUrl);
                    message.error(`Không thể tải ảnh: ${imageUrl}`);
                  };
                });
                message.success(`Đã chèn ảnh ${file.name} thành công`);
              }
            }, 0);
            currentIndex++;
            editor.setSelection(currentIndex);
          } else {
            message.error(`Upload ảnh ${file.name} thất bại: Không nhận được URL từ server`);
          }
        } catch (error) {
          console.error(`Lỗi khi upload ảnh ${file.name}:`, error);
          message.error(
            `Lỗi upload ảnh ${file.name}: ${error.response?.data?.message || error.message}`
          );
        }
      }
    };
  }, [quillRef]);

  const audioHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "audio/*");
    input.setAttribute("multiple", "true");
    input.click();

    input.onchange = async () => {
      const files = Array.from(input.files);
      if (!files.length) {
        message.error("Vui lòng chọn ít nhất một file audio");
        return;
      }

      const editor = quillRef.current?.getEditor();
      if (!editor) {
        console.error("Editor not found");
        message.error("Không tìm thấy editor ReactQuill");
        return;
      }
      let currentIndex = editor.getSelection(true)?.index ?? editor.getLength();

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          console.log("Uploading audio:", file.name);
          const response = await axios.post(
            process.env.REACT_APP_API_BASE_URL + "/files/upload",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          console.log("Audio upload response:", response.data);

          if (response.status === 201 && response.data.url) {
            const audioUrl = response.data.url;
            editor.insertEmbed(currentIndex, "audio", audioUrl, "user");
            setTimeout(() => {
              const audios = editor.root.querySelectorAll(`audio[src="${audioUrl}"]`);
              if (audios.length === 0) {
                console.error("Audio not inserted into editor:", audioUrl);
                message.error(`Không thể chèn audio ${file.name} vào editor`);
              } else {
                audios.forEach((audio) => {
                  audio.setAttribute("controls", true);
                  audio.style.width = "100%";
                  audio.onerror = () => {
                    console.error("Audio failed to load:", audioUrl);
                    message.error(`Không thể tải audio: ${audioUrl}`);
                  };
                });
                message.success(`Đã chèn audio ${file.name} thành công`);
              }
            }, 0);
            currentIndex++;
            editor.setSelection(currentIndex);
          } else {
            message.error(`Upload audio ${file.name} thất bại: Không nhận được URL từ server`);
          }
        } catch (error) {
          console.error(`Lỗi khi upload audio ${file.name}:`, error);
          message.error(
            `Lỗi upload audio ${file.name}: ${error.response?.data?.message || error.message}`
          );
        }
      }
    };
  }, [quillRef]);

  const modules = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandler,
        audio: audioHandler,
        undo: undoHandler,
        redo: redoHandler,
      },
    },
  };

  const columns = [
    {
      title: "Tiêu đề bài tập",
      dataIndex: "title",
      key: "title",
      width: "20%",
    },
    {
      title: "Link Game bài tập",
      dataIndex: "linkGame",
      key: "linkGame",
      width: "20%",
      render: (text) => (
        <Typography.Text
          ellipsis={{ tooltip: text }}
          style={{ textOverflow: "ellipsis", maxWidth: "100px" }}
        >
          {text}
        </Typography.Text>
      ),
    },
    {
      title: "Link Speech bài tập",
      dataIndex: "linkSpeech",
      key: "linkSpeech",
      width: "20%",
      render: (text) => (
        <Typography.Text
          ellipsis={{ tooltip: text }}
          style={{ textOverflow: "ellipsis", maxWidth: "100px" }}
        >
          {text}
        </Typography.Text>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "30%",
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
        const date = lessonByScheduleData?.filter((item) => item.homeWorkId === text)[0]?.date;
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
        const length = lessonByScheduleData.filter((item) => item.homeWorkId === text).length;
        const isSentLength = lessonByScheduleData.filter(
          (item) => item.homeWorkId === text && item.isHomeWorkSent === true
        ).length;
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
        </Space>
      ),
    },
  ];

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
            Quản lý bài tập
          </Title>
        </div>
        <Input
          placeholder="Nhập tiêu đề bài tập muốn tìm kiếm"
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
        title={editingHomeWork ? "Điều chỉnh bài tập" : "Tạo bài tập mới"}
        open={modalUpdateHomeWorkVisible}
        onCancel={() => {
          setModalUpdateHomeWorkVisible(false);
          form.resetFields();
          setEditingHomeWork(null);
          setVocabularyList([]);
          setQuestionList([]);
        }}
        footer={[
          <Button
            style={{ marginTop: isMobile ? "20px" : "" }}
            key="cancel"
            onClick={() => {
              setModalUpdateHomeWorkVisible(false);
              form.resetFields();
              setEditingHomeWork(null);
              setCurrentLink("");
              setVocabularyList([]);
              setQuestionList([]);
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
            {editingHomeWork ? "Lưu" : "Tạo"}
          </Button>,
          <Button
            loading={loadingSchedule}
            key="send"
            type="primary"
            onClick={() => {
              const entity = lessonByScheduleData?.find(
                (item) => item.homeWorkId === selectedHomeWorkId
              );
              handleUpdateSendingHomeworkStatus(entity?.id);
            }}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            Gửi bài tập
          </Button>,
        ]}
        width={"90%"}
      >
        <style>{`
          .ql-container {
            min-height: 250px;
          }
          .ql-editor img.ql-image {
            max-width: 100%;
            margin: 10px 0;
            display: block;
          }
          .ql-editor audio {
            width: 100%;
            margin: 10px 0;
            display: block;
          }
        `}</style>
        <Form
          form={form}
          layout="vertical"
          name="HomeWorkForm"
          initialValues={{
            title: "",
            linkGame: "",
            textToSpeech: "",
            description: "",
          }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề bài tập"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề bài tập" },
              { max: 100, message: "Tiêu đề không được dài quá 100 ký tự" },
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
          <Form.Item label="Mô tả">
            <ReactQuill
              id="HomeworkDescriptionUpdate"
              theme="snow"
              modules={modules}
              formats={quillFormats}
              ref={quillRef}
              style={{
                height: "250px",
                marginBottom: "60px",
                borderRadius: "6px",
                display: swapHtmlMode ? "none" : "block",
              }}
            />
            {swapHtmlMode && (
              <TextArea
                value={htmlContent}
                onChange={(e) => {
                  setHtmlContent(e.target.value);
                }}
                style={{
                  height: "250px",
                  marginBottom: "60px",
                  borderRadius: "6px",
                  border: `1px solid ${colors.inputBorder}`,
                }}
              />
            )}
          </Form.Item>
          <Form.Item label="Từ vựng">
            <VocabularyCreateComponent
              isMobile={isMobile}
              setVocabularyList={setVocabularyList}
              vocabularyList={vocabularyList}
              selectedHomeWorkId={selectedHomeWorkId}
              audioId={"audio-player-update"}
              selectedClass={selectedClass}
            />
          </Form.Item>
          {/* <Form.Item label="Câu hỏi">
            <QuestionCreateComponent
              teacherId={teacherId}
              classID={classID}
              teachers={teachers}
              classes={classes}
              questionList={questionList}
              setQuestionList={setQuestionList}
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
              dataSource={gameLinks.map((link, index) => ({
                key: `${link}-${index}`,
                link,
              }))}
              pagination={false}
            />
          )}
        </Form>
      </Modal>
      <Modal
        title="Danh sách các lịch học đang sử dụng bài tập này"
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
            lessonByScheduleData?.map((item, index) =>
              item.homeWorkId === selectedHomeWorkId ? (
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
                    {item.schedule.startTime} - {item.schedule.endTime}
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
              ) : null
            )
          ) : (
            <Text>Không có bài học nào</Text>
          )}
        </div>
      </Modal>
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
    </div>
  );
}

HomeWorkManagement.propTypes = {
  toolbar: PropTypes.array.isRequired,
  quillFormats: PropTypes.array.isRequired,
  levels: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  setModalUpdateHomeWorkVisible: PropTypes.func.isRequired,
  setEditingHomeWork: PropTypes.func.isRequired,
  modalUpdateHomeWorkVisible: PropTypes.bool.isRequired,
  editingHomeWork: PropTypes.object,
  homeWorks: PropTypes.array.isRequired,
  setHomeWorks: PropTypes.func.isRequired,
  loadingTTSForUpdateHomeWork: PropTypes.bool.isRequired,
  setLoadingTTSForUpdateHomeWork: PropTypes.func.isRequired,
  teacherId: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  lessonByScheduleData: PropTypes.array.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  setLessonByScheduleData: PropTypes.func.isRequired,
  classID: PropTypes.number.isRequired,
  students: PropTypes.array.isRequired,
  quillRef: PropTypes.object.isRequired,
  selectedClass: PropTypes.object.isRequired,
  teachers: PropTypes.array.isRequired,
  classes: PropTypes.array.isRequired,
};
