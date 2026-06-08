import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  Typography,
  Input,
  Button,
  Row,
  Col,
  Space,
  message,
  Divider,
  Upload,
  Empty,
  Pagination,
  Tooltip,
  Spin,
  Tag,
  Radio,
  List,
  Form,
  Modal,
  Avatar,
  Select,
  InputNumber,
} from "antd";
import {
  AudioOutlined,
  PictureOutlined,
  PlusOutlined,
  SoundOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  LoadingOutlined,
  AudioMutedOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
} from "@ant-design/icons";
import useSpeechToText from "react-hook-speech-to-text";
import PropTypes from "prop-types";
import { colors } from "assets/theme/color";
import vocabularyService from "services/vocabularyService";
import homeWorkService from "services/homeWorkService";
import { ImageOutlined } from "@mui/icons-material";
import { useSpeechRecognition } from "react-speech-kit";
import student_vocabularyService from "services/student_vocabulary";
import fileService from "services/fileService";
const { Text, Title } = Typography;
const { TextArea } = Input;
const genderOptions = [
  { label: "Nam", value: 1 },
  { label: "Nữ", value: 0 },
];
const VocabularyStudyComponent = ({ selectedHomeWorkId, isMobile, studentId }) => {
  // States
  const [vocabularyItems, setVocabularyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [currentText, setCurrentText] = useState("");
  const [audioLoading, setAudioLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [activeRecordingId, setActiveRecordingId] = useState(null);
  const [resultSTT, setResultSTT] = useState("");
  const [isManualRecording, setIsManualRecording] = useState(false);
  const [isManualRecordingCreate, setIsManualRecordingCreate] = useState(false);

  // Track per-vocabulary student definition input
  const [studentDefinitions, setStudentDefinitions] = useState({});
  const [form] = Form.useForm();
  const [textToSpeech, setTextToSpeech] = useState("");
  const [gender, setGender] = useState(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [loadingAddVocabulary, setLoadingAddVocabulary] = useState(false);
  const [isRecordingForCreate, setIsRecordingForCreate] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [onOpenManageVocabulary, setOnOpenManageVocabulary] = useState(false);
  const [cardHeight, setCardHeight] = useState(null);
  const [studentCardHeight, setStudentCardHeight] = useState(null);
  const [voices, setVoices] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const resData = await homeWorkService.voices();
        const safeVoices = Array.isArray(resData) ? resData : [];
        setVoices(safeVoices);
        setGender(safeVoices.length ? safeVoices[0] : null);
      } catch (error) {
        setVoices([]);
        setGender(null);
        message.error("voices fetch failed");
      }
    };
    fetchVoices();
  }, []);
  // Swipe animation states
  const [cardIndex, setCardIndex] = useState(0);
  const [cardIndexForStudent, setCardIndexForStudent] = useState(0);
  const [dailyJumpValue, setDailyJumpValue] = useState(1);
  const [animation, setAnimation] = useState("");
  const [animationForStudent, setAnimationForStudent] = useState("");
  const audioRefs = useRef([]);
  const cardRefs = useRef([]);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  // Add inside component (outside useEffect)
  const mouseStartX = useRef(null);
  const isMouseDown = useRef(false);
  // Calculate current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = vocabularyItems.slice(indexOfFirstItem, indexOfLastItem);
  // 1. Gắn index ban đầu
  const withIndex = vocabularyItems?.map((item, index) => ({ ...item, originalIndex: index }));

  // 2. Lọc như bạn làm
  const filterArray = withIndex?.filter(
    (item) => !item.student || (item.student && item.student.id === studentId)
  );

  // 3. Sort: ưu tiên student === null lên trước, giữ nguyên thứ tự ban đầu nếu bằng
  const sortedArray = filterArray?.sort((a, b) => {
    const aPriority = a.student === null ? 0 : 1;
    const bPriority = b.student === null ? 0 : 1;

    if (aPriority !== bPriority) {
      return aPriority - bPriority; // null lên trước
    }
    return a.originalIndex - b.originalIndex; // giữ thứ tự gốc
  });

  const currentItems = sortedArray;
  const dailyVocabularyMax = currentItems.filter((item) => !item.student).length;
  const countStudentNull = vocabularyItems?.filter((item) => !item.student).length;
  const firstStudent = sortedArray?.findIndex((item) => item.student !== null);

  useEffect(() => {
    if (dailyVocabularyMax === 0) {
      setDailyJumpValue(null);
      return;
    }

    if (cardIndex > dailyVocabularyMax - 1) {
      setCardIndex(dailyVocabularyMax - 1);
      return;
    }

    setDailyJumpValue(cardIndex + 1);
  }, [cardIndex, dailyVocabularyMax]);

  const commitDailyJump = useCallback(
    (rawValue = dailyJumpValue) => {
      if (dailyVocabularyMax === 0) {
        setDailyJumpValue(null);
        return;
      }

      const parsedValue = Number(rawValue);
      if (!Number.isFinite(parsedValue)) {
        setDailyJumpValue(cardIndex + 1);
        return;
      }

      const targetNumber = Math.min(
        Math.max(Math.round(parsedValue), 1),
        dailyVocabularyMax
      );
      const targetIndex = targetNumber - 1;

      setDailyJumpValue(targetNumber);
      if (targetIndex === cardIndex) return;

      setAnimation(targetIndex > cardIndex ? "slide-from-right" : "slide-from-left");
      setTimeout(() => {
        setCardIndex(targetIndex);
        setAnimation("");
      }, 300);
    },
    [cardIndex, dailyJumpValue, dailyVocabularyMax]
  );

  const handleMouseDown = (e) => {
    mouseStartX.current = e.clientX;
    isMouseDown.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown.current) return;
    const diff = mouseStartX.current - e.clientX;
    const currentCard = cardRefs.current[cardIndex];
    if (currentCard) {
      const maxDrag = 150;
      const dragX = Math.max(-maxDrag, Math.min(maxDrag, -diff));
      currentCard.style.transform = `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`;
      currentCard.style.transition = "none";
    }
  };
  const handleMouseMoveForStudent = (e) => {
    if (!isMouseDown.current) return;
    const diff = mouseStartX.current - e.clientX;
    const currentCard = cardRefs.current[cardIndexForStudent];
    if (currentCard) {
      const maxDrag = 150;
      const dragX = Math.max(-maxDrag, Math.min(maxDrag, -diff));
      currentCard.style.transform = `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`;
      currentCard.style.transition = "none";
    }
  };

  const handleMouseUp = (e) => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    const diff = mouseStartX.current - e.clientX;
    const currentCard = cardRefs.current[cardIndex];

    if (diff > 100 && cardIndex < currentItems.filter((item) => !item.student).length - 1) {
      setAnimation("swipe-left");
      setTimeout(() => {
        setCardIndex(cardIndex + 1);
        setAnimation("");
        if (currentCard) currentCard.style.transform = "";
      }, 300);
    } else if (diff < -100 && cardIndex > 0) {
      setAnimation("swipe-right");
      setTimeout(() => {
        setCardIndex(cardIndex - 1);
        setAnimation("");
        if (currentCard) currentCard.style.transform = "";
      }, 300);
    } else {
      if (currentCard) {
        currentCard.style.transform = "";
        currentCard.style.transition = "transform 0.3s ease";
      }
    }
  };
  const handleMouseUpForStudent = (e) => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    const diff = mouseStartX.current - e.clientX;
    const currentCard = cardRefs.current[cardIndexForStudent];

    if (diff > 100 && cardIndexForStudent < currentItems.length - 1) {
      setAnimationForStudent("swipe-left");
      setTimeout(() => {
        setCardIndexForStudent(cardIndexForStudent + 1);
        setAnimationForStudent("");
        if (currentCard) currentCard.style.transform = "";
      }, 300);
    } else if (diff < -100 && cardIndexForStudent > firstStudent) {
      setAnimationForStudent("swipe-right");
      setTimeout(() => {
        setCardIndexForStudent(cardIndexForStudent - 1);
        setAnimationForStudent("");
        if (currentCard) currentCard.style.transform = "";
      }, 300);
    } else {
      if (currentCard) {
        currentCard.style.transform = "";
        currentCard.style.transition = "transform 0.3s ease";
      }
    }
  };

  // Speech to text hook
  const {
    error: speechError,
    interimResult,
    isRecording,
    results: speechResults,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    speechRecognitionProperties: {
      lang: "en-US",
      interimResults: true,
    },
  });
  // console.log(speechResults);
  const onError = (event) => {
    if (event.error === "not-allowed") {
      // setBlocked(true);
      message.error(" Oh no, it looks like your browser doesn&#39;t support Speech Recognition.");
    }
  };
  const onResult = (result) => {
    // console.log(result);
    setResultSTT((prev) => prev + " " + result);
  };
  const { listen, listening, stop, supported } = useSpeechRecognition({
    // onResult: (result) => {
    //   // console.log(result);
    //   setResultSTT((prev) => prev + " " + result);
    // },
    onResult,
    onError,
  });
  const handleClickImage = useCallback((imageUrl) => {
    setPreviewSrc(imageUrl);
    setPreviewVisible(true);
    // console.log(imageUrl);
  }, []);
  const onChangeGender = (value) => {
    setGender(value);
  };
  const handleWordChange = (e) => {
    setTextToSpeech(e.target.value);
    form.setFieldsValue({ word: e.target.value });
  };
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTS(true);

    try {
      const modifiedText = textToSpeech.replace(/\n/g, "..");

      const response = await homeWorkService.textToSpeech({
        textToSpeech: modifiedText,
        voice: typeof gender === "string" ? gender : undefined,
      });

      const responseValue =
        typeof response === "object" && response !== null
          ? response.audioData || response.url || response.audio_url || response.audioUrl
          : response;

      if (typeof responseValue !== "string" || !responseValue.trim()) {
        throw new Error("TTS response is empty");
      }

      if (/^https?:\/\//i.test(responseValue)) {
        setMp3file(null);
        setMp3Url(responseValue);
      } else {
        let base64String = responseValue;

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
      }
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
      message.error("Không thể tạo audio. Vui lòng thử lại.");
    } finally {
      setLoadingTTS(false);
    }
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
  const addVocabulary = async (values) => {
    try {
      setLoadingAddVocabulary(true);

      // Build JSON payload (backend expects JSON body for create)
      const payload = {
        textToSpeech: values.word,
        definition: values.definition,
        imageUrl: imageUrl || null,
        audioUrl: null,
        homeworkId: selectedHomeWorkId,
        studentId: studentId,
      };

      // If there's an mp3 blob, upload it first and set audioUrl
      if (mp3file) {
        try {
          const fileName = `vocab_audio_${Date.now()}.mp3`;
          const audioFile = new File([mp3file], fileName, { type: "audio/mp3" });
          const uploadedAudioUrl = await fileService.upload(audioFile, fileName);
          if (uploadedAudioUrl) {
            payload.audioUrl = uploadedAudioUrl;
          }
        } catch (uploadErr) {
          console.error("Audio upload failed:", uploadErr);
          // continue without audioUrl
        }
      }

      const vocabularyResponse = await vocabularyService.createVocabulary(payload);
      setVocabularyItems([...vocabularyItems, vocabularyResponse]);
      message.success(`Từ "${values.word}" đã được thêm vào danh sách`);
      form.resetFields();
      setTextToSpeech("");
      setMp3Url("");
      setImageUrl("");
      setMp3file(null);
    } catch (error) {
      console.log("Error adding vocabulary:", error);
      const errMsg = error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi thêm từ vựng. Vui lòng thử lại.";
      message.error(errMsg);
    } finally {
      setLoadingAddVocabulary(false);
    }
  };
  const handleDeleteVocabulary = (id) => {
    const item = vocabularyItems.find((item) => item.id === id);
    console.log(item);

    if (!item || !item.student) {
      return;
    }

    Modal.confirm({
      title: "Xác nhận xóa từ vựng?",
      content: "Bạn có chắc chắn muốn xóa từ vựng này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        return vocabularyService
          .deletevocabulary(id)
          .then(() => {
            setVocabularyItems(vocabularyItems.filter((item) => item.id !== id));
            message.success("Xóa từ vựng thành công");
          })
          .catch((error) => {
            message.error("Xóa từ vựng thất bại: " + error);
          });
      },
    });
  };
  const handleAddVocabulary = () => {
    form
      .validateFields()
      .then((values) => {
        addVocabulary(values);

        // Reset form and states
      })
      .catch((errorInfo) => {
        console.log("Validation Failed:", errorInfo);
        errorInfo?.errorFields?.forEach((field) => {
          message.error(`${field.errors[0]}`);
        });
      });
  };
  // Fetch data
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const data = { homeworkId: selectedHomeWorkId, studentId };
        const response = await vocabularyService.getVocabularyByHomworkIdForStudent(
          selectedHomeWorkId
        );
        setVocabularyItems(response);
      } catch (error) {
        console.error("Error fetching vocabulary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVocabulary();
  }, [selectedHomeWorkId]);

  // Handle speech to text
  // useEffect(() => {
  //   if (speechResults.length > 0) {
  //     const lastResult = speechResults[speechResults.length - 1].transcript;
  //     setCurrentText(lastResult);
  //   }
  // }, [speechResults]);

  // useEffect(() => {
  //   let timeout;

  //   timeout = setTimeout(() => {
  //     if (!isRecording && isManualRecording) {
  //       startSpeechToText();
  //       setResultSTT(resultSTT + " ");
  //     }
  //   }, 500);
  //   return () => clearTimeout(timeout);
  // }, [isRecording, isManualRecording]);

  // // Toggle speech recognition
  // const toggleSpeechToText = () => {
  //   if (isRecording) {
  //     stopSpeechToText();
  //   } else {
  //     startSpeechToText();
  //   }
  // };

  // useEffect(() => {
  //   if (speechResults.length > 0 && !isRecordingForCreate) {
  //     const lastResult = speechResults[speechResults.length - 1]?.transcript || "";
  //     setResultSTT(resultSTT + lastResult);
  //   }
  // }, [speechResults]);

  const handleSpeechForMeaning = (itemId) => {
    if (!supported) {
      message.error(
        "Web Speech API không được hỗ trợ cho trình duyệt này vui lòng tải google chrome để sử dụng 🤷"
      );
      return;
    }
    if (listening) {
      stop();
      setActiveRecordingId(null);
      setIsManualRecording(false);
      // Use speech result as student's answer text; include any typed definition
      const def = studentDefinitions[itemId] || undefined;
      handleAddOrUpdateStudentVocabulary(itemId, selectedHomeWorkId, studentId, resultSTT, def);
      setResultSTT("");
      // speechResults = [];
    } else {
      setActiveRecordingId(itemId);
      listen({ lang: "en-AU", interimResults: false });
      setIsManualRecording(true);
    }
  };
  const handleAddOrUpdateStudentVocabulary = async (
    vocabularyId,
    homeworkId,
    studentId,
    text,
    definition,
  ) => {
    try {
      const data = {
        vocabularyId,
        homeworkId,
        studentId,
        text,
      };
      if (definition !== undefined) data.definition = definition;
      const res = await student_vocabularyService.createStudent_vocabulary(data);

      // If saved successfully, give feedback
      message.success("Câu trả lời đã được lưu");

      // Optionally clear the typed definition for this vocab
      setStudentDefinitions((prev) => ({ ...prev, [vocabularyId]: definition || "" }));
    } catch (err) {
      message.error("failed to add or update student vocabulary " + err);
    }
  };
  // useEffect(() => {
  //   if (speechResults.length > 0 && isRecordingForCreate) {
  //     const lastResult = speechResults[speechResults.length - 1].transcript;
  //     setTextToSpeech(lastResult);
  //     form.setFieldsValue({ word: lastResult });
  //   }
  // }, [speechResults, form]);
  // useEffect(() => {
  //   let timeout;

  //   timeout = setTimeout(() => {
  //     if (!isRecording && isManualRecordingCreate) {
  //       console.log("⏳ Mic tắt do hệ thống → khởi động lại", isRecording, isManualRecordingCreate);
  //       startSpeechToText();
  //     }
  //   }, 500); // Delay nhẹ để tránh race condition
  //   return () => clearTimeout(timeout);
  // }, [isRecording, isManualRecordingCreate]);
  const handleSpeechForMeaningCreate = () => {
    if (speechError) {
      message.error(
        "Web Speech API không được hỗ trợ cho trình duyệt này vui lòng tải google chrome để sử dụng 🤷"
      );
    }
    if (isRecording) {
      stopSpeechToText();
      setIsManualRecordingCreate(false);
      setIsRecordingForCreate(false);
      // const lastResult = speechResults[speechResults.length - 1]?.transcript || "";
      // form.setFieldsValue({ meaning: lastResult });
      setResultSTT("");
    } else {
      startSpeechToText();
      setIsRecordingForCreate(true);
      setIsManualRecordingCreate(true);
    }
  };
  // Handle text to speech conversion
  const handleTextToSpeech = (text) => {
    if (!text) return;

    setAudioLoading(true);

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      setAudioLoading(false);
    }, 100);
  };

  // Handle image upload
  const handleImageUpload = (info) => {
    if (info.file.status === "uploading") {
      setImageLoading(true);
      return;
    }
    if (info.file.status === "done") {
      if (info.file.response?.url) {
        setImageUrl(info.file.response.url);
        setImageLoading(false);
        message.success("Đã upload ảnh thành công");
      } else {
        setImageLoading(false);
        message.error("Upload ảnh thất bại: Không nhận được URL từ server");
      }
    } else if (info.file.status === "error") {
      setImageLoading(false);
      message.error("Lỗi upload ảnh: " + (info.file.error?.message || "Không xác định"));
    }
  };

  // Add new vocabulary item
  const addVocabularyItem = () => {
    if (!currentText.trim()) {
      message.warning("Please enter text for the vocabulary item");
      return;
    }

    setAddingItem(true);

    // Simulate API call
    setTimeout(() => {
      const newItem = {
        id: Date.now(),
        imageUrl: null,
        audioUrl: null,
        textToSpeech: currentText,
        isDelete: 0,
        homeworkId: 47,
      };

      setVocabularyItems([...vocabularyItems, newItem]);
      setCurrentText("");
      setAddingItem(false);
      message.success("Vocabulary item added successfully");
    }, 800);
  };

  useEffect(() => {
    const firstStudentIndex = sortedArray?.findIndex((item) => item.student !== null);
    setCardIndexForStudent(firstStudentIndex);
  }, [vocabularyItems]);
  // console.log(currentItems);

  // Change page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Swipe functionality
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;
    const currentCard = cardRefs.current[cardIndex];

    if (currentCard) {
      // Limit the dragging to reasonable bounds
      const maxDrag = 150;
      const dragX = Math.max(-maxDrag, Math.min(maxDrag, -diff));
      currentCard.style.transform = `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`;
      currentCard.style.transition = "none";
    }
  };
  const handleTouchMoveForStudent = (e) => {
    if (!touchStartX.current) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;
    const currentCard = cardRefs.current[cardIndexForStudent];

    if (currentCard) {
      // Limit the dragging to reasonable bounds
      const maxDrag = 150;
      const dragX = Math.max(-maxDrag, Math.min(maxDrag, -diff));
      currentCard.style.transform = `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`;
      currentCard.style.transition = "none";
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    touchEndX.current = e.changedTouches[0].clientX;

    const diff = touchStartX.current - touchEndX.current;
    const currentCard = cardRefs.current[cardIndex];

    // Reset for next touch
    touchStartX.current = null;
    touchEndX.current = null;

    // Threshold to determine if swipe was intentional
    const swipeThreshold = 100;

    if (
      diff > swipeThreshold &&
      cardIndex < currentItems.filter((item) => !item.student).length - 1
    ) {
      // Swipe left - next card
      setAnimation("swipe-left");
      setTimeout(() => {
        setCardIndex(cardIndex + 1);
        setAnimation("");
        if (currentCard) {
          currentCard.style.transform = "";
          currentCard.style.transition = "";
        }
      }, 300);
    } else if (diff < -swipeThreshold && cardIndex > 0) {
      // Swipe right - previous card
      setAnimation("swipe-right");
      setTimeout(() => {
        setCardIndex(cardIndex - 1);
        setAnimation("");
        if (currentCard) {
          currentCard.style.transform = "";
          currentCard.style.transition = "";
        }
      }, 300);
    } else {
      // Return to center
      if (currentCard) {
        currentCard.style.transform = "";
        currentCard.style.transition = "transform 0.3s ease";
      }
    }
  };
  const handleTouchEndForStudent = (e) => {
    if (!touchStartX.current) return;
    touchEndX.current = e.changedTouches[0].clientX;

    const diff = touchStartX.current - touchEndX.current;
    const currentCard = cardRefs.current[cardIndexForStudent];

    // Reset for next touch
    touchStartX.current = null;
    touchEndX.current = null;

    // Threshold to determine if swipe was intentional
    const swipeThreshold = 100;

    if (diff > swipeThreshold && cardIndexForStudent < currentItems.length - 1) {
      // Swipe left - next card
      setAnimationForStudent("swipe-left");
      setTimeout(() => {
        setCardIndexForStudent(cardIndexForStudent + 1);
        setAnimationForStudent("");
        if (currentCard) {
          currentCard.style.transform = "";
          currentCard.style.transition = "";
        }
      }, 300);
    } else if (diff < -swipeThreshold && cardIndexForStudent > firstStudent) {
      // Swipe right - previous card
      setAnimationForStudent("swipe-right");
      setTimeout(() => {
        setCardIndexForStudent(cardIndexForStudent - 1);
        setAnimationForStudent("");
        if (currentCard) {
          currentCard.style.transform = "";
          currentCard.style.transition = "";
        }
      }, 300);
    } else {
      // Return to center
      if (currentCard) {
        currentCard.style.transform = "";
        currentCard.style.transition = "transform 0.3s ease";
      }
    }
  };

  const goToPrevCard = () => {
    if (cardIndex > 0) {
      setAnimation("slide-from-left");
      setTimeout(() => {
        setCardIndex(cardIndex - 1);
        setAnimation("");
      }, 300);
    }
  };
  const goToPrevCardForStudent = () => {
    if (cardIndexForStudent - countStudentNull > 0) {
      setAnimationForStudent("slide-from-left");
      setTimeout(() => {
        setCardIndexForStudent(cardIndexForStudent - 1);
        setAnimationForStudent("");
      }, 300);
    }
  };

  const goToNextCard = () => {
    if (cardIndex < currentItems.filter((item) => !item.student).length - 1) {
      setAnimation("slide-from-right");
      setTimeout(() => {
        setCardIndex(cardIndex + 1);
        setAnimation("");
      }, 300);
    }
  };
  const goToNextCardForStudent = () => {
    console.log(cardIndexForStudent - 1 - countStudentNull);

    if (
      cardIndexForStudent - countStudentNull <
      currentItems.filter((item) => item.student).length - 1
    ) {
      setAnimationForStudent("slide-from-right");
      setTimeout(() => {
        setCardIndexForStudent(cardIndexForStudent + 1);
        setAnimationForStudent("");
      }, 300);
    }
  };

  // Set up card refs
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, currentItems.length);
  }, [currentItems]);
  useEffect(() => {
    setTimeout(() => {
      const element = cardRefs.current[cardIndex];
      if (element) {
        const height = element.offsetHeight;
        // console.log(height);
        setCardHeight(height + 10);
      }
    }, 800);
  }, []);
  useEffect(() => {
    setTimeout(() => {
      const element = cardRefs.current[cardIndexForStudent];
      if (element) {
        const height = element.offsetHeight;
        // console.log(height);
        setStudentCardHeight(height + 10);
      }
    }, 800);
  }, []);
  useEffect(() => {
    // console.log(cardIndex, audioRefs);

    const currentAudio = audioRefs.current[cardIndex];
    setTimeout(() => {
      if (currentAudio) {
        // Chỉ tự động phát nếu đã đủ tải
        const playPromise = currentAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Không thể tự phát audio: ", error);
          });
        }
      }
    }, 800);
    const element = cardRefs.current[cardIndex];
    if (element) {
      const height = element.offsetHeight;
      // console.log(height);
      setCardHeight(height + 10);
    }
  }, [cardIndex, vocabularyItems]);
  useEffect(() => {
    // console.log(cardIndex, audioRefs);

    const currentAudio = audioRefs.current[cardIndexForStudent];
    setTimeout(() => {
      if (currentAudio) {
        // Chỉ tự động phát nếu đã đủ tải
        const playPromise = currentAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Không thể tự phát audio: ", error);
          });
        }
      }
    }, 800);
    setTimeout(() => {
      const element = cardRefs.current[cardIndexForStudent];
      if (element) {
        const height = element.offsetHeight;
        // console.log(height);
        setStudentCardHeight(height + 10);
      }
    }, 700);
  }, [cardIndexForStudent, vocabularyItems]);
  // Vocabulary item card with swipe functionality
  const VocabularyItemCard = ({ item, index }) => {
    const isActive = index === cardIndex;

    const cardStyles = {
      borderRadius: "16px",
      marginBottom: "16px",
      boxShadow: `0 8px 24px ${colors.softShadow}`,
      borderColor: colors.borderGreen,
      backgroundColor: colors.white,
      transition: "all 0.3s ease",
      position: "absolute",
      width: "100%",
      height: "auto",
      opacity: isActive ? 1 : 0,
      zIndex: isActive ? 2 : 1,
      pointerEvents: isActive ? "auto" : "none",
    };

    if (animation === "swipe-left" && isActive) {
      cardStyles.transform = "translateX(-120%) rotate(-5deg)";
    } else if (animation === "swipe-right" && isActive) {
      cardStyles.transform = "translateX(120%) rotate(5deg)";
    } else if (animation === "slide-from-left" && isActive) {
      cardStyles.transform = "translateX(-120%)";
      cardStyles.animation = "0.3s slideInFromLeft forwards";
    } else if (animation === "slide-from-right" && isActive) {
      cardStyles.transform = "translateX(120%)";
      cardStyles.animation = "0.3s slideInFromRight forwards";
    }

    return (
      <Card
        key={item.id}
        style={cardStyles}
        bodyStyle={{
          padding: "10px",
        }}
        ref={(el) => (cardRefs.current[index] = el)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        // onTouchStart={handleTouchStart}
        // onTouchMove={handleTouchMove}
        // onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {/* Card counter indicator */}
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <Space
              size={6}
              align="center"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <InputNumber
                min={1}
                max={dailyVocabularyMax}
                value={dailyJumpValue}
                controls={false}
                size="small"
                style={{ width: 54, textAlign: "center" }}
                onChange={(value) => setDailyJumpValue(value)}
                onBlur={() => commitDailyJump()}
                onPressEnter={(e) => {
                  e.preventDefault();
                  commitDailyJump();
                  e.currentTarget.blur();
                }}
              />
              <Text style={{ color: colors.midGreen, fontWeight: "500" }}>
                / {dailyVocabularyMax}
              </Text>
            </Space>
          </div>

          {/* Image area */}
          {item.imageUrl && (
            <div
              style={{
                height: "160px",
                border: `1px solid ${colors.lightGreen}`,
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                backgroundColor: colors.paleGreen,
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.textToSpeech}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  cursor: "pointer",
                }}
                // onClick={handleClickImage(item.imageUrl)}
                onClick={() => handleClickImage(item.imageUrl)}
              />
            </div>
          )}

          {/* Text and audio controls */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <Text style={{ width: "50px", color: colors.deepGreen }}>Từ/câu hỏi</Text>
            <TextArea
              autoSize={{ minRows: 1, maxRows: 6 }}
              value={item.textToSpeech}
              readOnly
              style={{
                flex: 1,
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
            <Button
              type="text"
              icon={audioLoading ? <LoadingOutlined /> : <SoundOutlined />}
              onClick={() => handleTextToSpeech(item.textToSpeech)}
              style={{ color: colors.deepGreen }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <Text style={{ width: "50px", color: colors.deepGreen }}>Định nghĩa</Text>
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <TextArea
                rows={2}
                value={item.definition || ""}
                readOnly
                placeholder="Không có định nghĩa"
                style={{ flex: 1, borderRadius: "6px"}}
              />
              {/* spacer to align with play button width */}
              <div style={{ width: 32, height: 32 }} />
            </div>
          </div>

          {item.audioUrl && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <audio ref={(el) => (audioRefs.current[index] = el)} controls style={{ flex: 1 }}>
                <source src={item.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Speech to text */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <TextArea
                placeholder="Luyện nói"
                readOnly
                value={(isManualRecording && activeRecordingId === item.id && resultSTT) || ""}
                autoSize={{ minRows: 1, maxRows: 2 }}
                style={{
                  flex: 1,
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
              <Button
                type={isManualRecording && activeRecordingId === item.id ? "primary" : "default"}
                danger={isManualRecording && activeRecordingId === item.id}
                icon={
                  isManualRecording && activeRecordingId === item.id ? (
                    <AudioMutedOutlined />
                  ) : (
                    <AudioOutlined />
                  )
                }
                disabled={!supported}
                onClick={() => handleSpeechForMeaning(item.id)}
              />
            </div>
          </div>

          {/* Swipe instruction hint */}
          <div style={{ textAlign: "center", marginTop: "10px", color: colors.midGreen }}>
            <Text style={{ fontSize: "13px" }}>Lướt qua để xem thêm</Text>
          </div>
        </Space>
      </Card>
    );
  };
  const VocabularyItemCardForStudent = ({ item, index }) => {
    const isActive = index === cardIndexForStudent;

    const cardStyles = {
      borderRadius: "16px",
      marginBottom: "16px",
      boxShadow: `0 8px 24px ${colors.softShadow}`,
      borderColor: colors.borderGreen,
      backgroundColor: colors.white,
      transition: "all 0.3s ease",
      position: "absolute",
      width: "100%",
      height: "auto",
      opacity: isActive ? 1 : 0,
      zIndex: isActive ? 2 : 1,
      pointerEvents: isActive ? "auto" : "none",
    };

    if (animationForStudent === "swipe-left" && isActive) {
      cardStyles.transform = "translateX(-120%) rotate(-5deg)";
    } else if (animationForStudent === "swipe-right" && isActive) {
      cardStyles.transform = "translateX(120%) rotate(5deg)";
    } else if (animationForStudent === "slide-from-left" && isActive) {
      cardStyles.transform = "translateX(-120%)";
      cardStyles.animation = "0.3s slideInFromLeft forwards";
    } else if (animationForStudent === "slide-from-right" && isActive) {
      cardStyles.transform = "translateX(120%)";
      cardStyles.animation = "0.3s slideInFromRight forwards";
    }

    return (
      <Card
        key={item.id}
        style={cardStyles}
        bodyStyle={{
          padding: "10px",
        }}
        ref={(el) => (cardRefs.current[index] = el)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMoveForStudent}
        onTouchEnd={handleTouchEndForStudent}
        // onTouchStart={handleTouchStart}
        // onTouchMove={handleTouchMove}
        // onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveForStudent}
        onMouseUp={handleMouseUpForStudent}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {/* Card counter indicator */}
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <Text style={{ color: colors.midGreen, fontWeight: "500" }}>
              {index + 1 - countStudentNull} / {currentItems.filter((item) => item.student).length}
            </Text>
          </div>

          {/* Image area */}
          {item.imageUrl && (
            <div
              style={{
                height: "160px",
                border: `1px solid ${colors.lightGreen}`,
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                backgroundColor: colors.paleGreen,
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.textToSpeech}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  cursor: "pointer",
                }}
                onClick={() => handleClickImage(item.imageUrl)}
              />
            </div>
          )}

          {/* Text and audio controls */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <Text style={{ width: "50px", color: colors.deepGreen }}>Từ/câu hỏi</Text>
            <TextArea
              autoSize={{ minRows: 1, maxRows: 6 }}
              value={item.textToSpeech}
              readOnly
              style={{
                flex: 1,
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
            <Button
              type="text"
              icon={audioLoading ? <LoadingOutlined /> : <SoundOutlined />}
              onClick={() => handleTextToSpeech(item.textToSpeech)}
              style={{ color: colors.deepGreen }}
            />
          </div>

          {/* Definition (student-created or saved) */}
          <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
            <Text style={{ width: "50px", color: colors.deepGreen }}>Định nghĩa</Text>
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <TextArea
                rows={2}
                value={item.definition || ""}
                readOnly
                placeholder="Không có định nghĩa"
                style={{ flex: 1, borderRadius: "6px"}}
              />
              {/* spacer to align with play button width */}
              <div style={{ width: 32, height: 32 }} />
            </div>
          </div>

          {item.audioUrl && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <audio ref={(el) => (audioRefs.current[index] = el)} controls style={{ flex: 1 }}>
                <source src={item.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Speech to text */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <TextArea
              placeholder="Luyện nói"
              readOnly
              value={(isManualRecording && activeRecordingId === item.id && resultSTT) || ""}
              autoSize={{ minRows: 1, maxRows: 2 }}
              style={{
                flex: 1,
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
            <Button
              type={isManualRecording && activeRecordingId === item.id ? "primary" : "default"}
              danger={isManualRecording && activeRecordingId === item.id}
              icon={
                isManualRecording && activeRecordingId === item.id ? (
                  <AudioMutedOutlined />
                ) : (
                  <AudioOutlined />
                )
              }
              disabled={!supported}
              onClick={() => handleSpeechForMeaning(item.id)}
            />
          </div>

          {/* Swipe instruction hint */}
          <div style={{ textAlign: "center", marginTop: "10px", color: colors.midGreen }}>
            <Text style={{ fontSize: "13px" }}>Lướt qua để xem thêm</Text>
          </div>
        </Space>
      </Card>
    );
  };
  // console.log(
  //   "vocabularyItems",
  //   vocabularyItems.filter((item) => item?.student?.id === studentId)
  // );

  return (
    <>
      {/* <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "right",
          alignItems: "right",
        }}
      >
        <Button
          color="green"
          variant="solid"
          style={{ width: "200px", height: "70px" }}
          onClick={() => {
            setOnOpenManageVocabulary(true);
          }}
        >
          Thêm từ vựng
        </Button>
      </div> */}
      <Title
        level={2}
        style={{
          color: colors.deepGreen,
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        Luyện đọc và nói
      </Title>
      {/* <Divider style={{ borderColor: colors.lightGreen }} /> */}

      <Divider style={{ borderColor: colors.lightGreen }} />
      {vocabularyItems.filter((item, index) => {
        // console.log(index, item.student);
        return !item?.student;
      }).length > 0 && (
        <div style={{ maxWidth: "100%", margin: "10px auto", padding: "0px" }}>
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: `0 8px 24px ${colors.softShadow}`,
              borderColor: colors.borderGreen,
              backgroundColor: colors.white,
            }}
            bodyStyle={{
              padding: "10px",
            }}
          >
            {/* Vocabulary list */}
            <div>
              <Title level={4} style={{ color: colors.deepGreen, marginBottom: "16px" }}>
                Bộ từ vựng hôm nay
              </Title>

              {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 36, color: colors.deepGreen }} />
                    }
                    tip="Loading vocabulary items..."
                  />
                </div>
              ) : vocabularyItems.filter((item, index) => {
                  // console.log(index, item.student);
                  return !item?.student;
                }).length === 0 ? (
                <Empty description="No vocabulary items yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <div style={{ position: "relative", width: "100%" }}>
                  {/* Swipe Card View with Navigation */}
                  <div
                    style={{
                      position: "relative",
                      height: cardHeight,
                      // maxHeight: "80vh",
                      margin: "0 auto",
                      maxWidth: "600px",
                      // overflow: "auto",
                    }}
                  >
                    {/* Cards */}
                    {currentItems.map(
                      (item, index) =>
                        !item.student && (
                          <VocabularyItemCard key={item.id} item={item} index={index} />
                        )
                    )}
                  </div>
                  {/* Navigation buttons - redesigned to match the image */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      position: "absolute",
                      width: "100%",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 3,
                      pointerEvents: "none", // Make container transparent to clicks
                    }}
                  >
                    {/* Left button */}
                    <div
                      style={{
                        pointerEvents: "auto", // Make button clickable
                        width: "32px",
                        height: "32px",
                        backgroundColor: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "50%",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        cursor: cardIndex === 0 ? "not-allowed" : "pointer",
                        opacity: cardIndex === 0 ? 0.5 : 1,
                        marginLeft: "-16px", // Half outside
                        border: "1px solid #f0f0f0",
                        transition: "transform 0.2s, background-color 0.2s",
                      }}
                      onClick={goToPrevCard}
                      onMouseOver={(e) => {
                        if (cardIndex !== 0) {
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.backgroundColor = "#f8f8f8";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      <LeftOutlined
                        style={{
                          fontSize: "12px",
                          color: cardIndex === 0 ? "#d9d9d9" : colors.deepGreen,
                        }}
                      />
                    </div>

                    {/* Right button */}
                    <div
                      style={{
                        pointerEvents: "auto", // Make button clickable
                        width: "32px",
                        height: "32px",
                        backgroundColor: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "50%",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        cursor:
                          cardIndex === currentItems.filter((item) => !item.student).length - 1
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          cardIndex === currentItems.filter((item) => !item.student).length - 1
                            ? 0.5
                            : 1,
                        marginRight: "-16px", // Half outside
                        border: "1px solid #f0f0f0",
                        transition: "transform 0.2s, background-color 0.2s",
                      }}
                      onClick={goToNextCard}
                      onMouseOver={(e) => {
                        if (cardIndex !== currentItems.filter((item) => !item.student).length - 1) {
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.backgroundColor = "#f8f8f8";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      <RightOutlined
                        style={{
                          fontSize: "12px",
                          color:
                            cardIndex === currentItems.filter((item) => !item.student).length - 1
                              ? "#d9d9d9"
                              : colors.deepGreen,
                        }}
                      />
                    </div>
                  </div>

                  {/* Card indicator dots */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "20px",
                      gap: "8px",
                    }}
                  >
                    {currentItems.map(
                      (_, index) =>
                        !_.student && (
                          <div
                            key={index}
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor:
                                index === cardIndex ? colors.deepGreen : colors.lightGreen,
                              transition: "background-color 0.3s ease",
                              cursor: "pointer",
                            }}
                            onClick={() => setCardIndex(index)}
                          />
                        )
                    )}
                  </div>

                  {/* {vocabularyItems.length > itemsPerPage && (
                    <div style={{ textAlign: "center", marginTop: "24px" }}>
                      <Pagination
                        current={currentPage}
                        total={vocabularyItems.length}
                        pageSize={itemsPerPage}
                        onChange={handlePageChange}
                        style={{ color: colors.deepGreen }}
                      />
                    </div>
                  )} */}
                </div>
              )}
            </div>
          </Card>

          {/* CSS for animations */}
          <style>{`
            @keyframes slideInFromLeft {
              from { transform: translateX(-120%); }
              to { transform: translateX(0); }
            }
            
            @keyframes slideInFromRight {
              from { transform: translateX(120%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}
      {vocabularyItems.filter((item, index) => {
        // console.log(index, item.student);
        return item?.student;
      }).length > 0 && (
        <div style={{ maxWidth: "100%", margin: "10px auto", padding: "0px" }}>
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: `0 8px 24px ${colors.softShadow}`,
              borderColor: colors.borderGreen,
              backgroundColor: colors.white,
            }}
            bodyStyle={{
              padding: "10px",
            }}
          >
            {/* Vocabulary list */}
            <div>
              <Title level={4} style={{ color: colors.deepGreen, marginBottom: "16px" }}>
                Bộ từ vựng của bạn
              </Title>

              {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 36, color: colors.deepGreen }} />
                    }
                    tip="Loading vocabulary items..."
                  />
                </div>
              ) : vocabularyItems.filter((item, index) => {
                  // console.log(index, item.student);
                  return item?.student;
                }).length === 0 ? (
                <Empty description="No vocabulary items yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <div style={{ position: "relative", width: "100%" }}>
                  {/* Swipe Card View with Navigation */}
                  <div
                    style={{
                      position: "relative",
                      height: studentCardHeight,
                      // maxHeight: "80vh",
                      margin: "0 auto",
                      maxWidth: "600px",
                      // overflow: "auto",
                    }}
                  >
                    {/* Cards */}
                    {currentItems.map(
                      (item, index) =>
                        item.student && (
                          <VocabularyItemCardForStudent key={item.id} item={item} index={index} />
                        )
                    )}
                  </div>
                  {/* Navigation buttons - redesigned to match the image */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      position: "absolute",
                      width: "100%",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 3,
                      pointerEvents: "none", // Make container transparent to clicks
                    }}
                  >
                    {/* Left button */}
                    <div
                      style={{
                        pointerEvents: "auto", // Make button clickable
                        width: "32px",
                        height: "32px",
                        backgroundColor: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "50%",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        cursor:
                          cardIndexForStudent - firstStudent === 0 ? "not-allowed" : "pointer",
                        opacity: cardIndexForStudent - firstStudent === 0 ? 0.5 : 1,
                        marginLeft: "-16px", // Half outside
                        border: "1px solid #f0f0f0",
                        transition: "transform 0.2s, background-color 0.2s",
                      }}
                      onClick={goToPrevCardForStudent}
                      onMouseOver={(e) => {
                        if (cardIndexForStudent - firstStudent !== 0) {
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.backgroundColor = "#f8f8f8";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      <LeftOutlined
                        style={{
                          fontSize: "12px",
                          color:
                            cardIndexForStudent - firstStudent === 0 ? "#d9d9d9" : colors.deepGreen,
                        }}
                      />
                    </div>

                    {/* Right button */}
                    <div
                      style={{
                        pointerEvents: "auto", // Make button clickable
                        width: "32px",
                        height: "32px",
                        backgroundColor: "white",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "50%",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        cursor:
                          cardIndexForStudent === currentItems.length - 1
                            ? "not-allowed"
                            : "pointer",
                        opacity: cardIndexForStudent === currentItems.length - 1 ? 0.5 : 1,
                        marginRight: "-16px", // Half outside
                        border: "1px solid #f0f0f0",
                        transition: "transform 0.2s, background-color 0.2s",
                      }}
                      onClick={goToNextCardForStudent}
                      onMouseOver={(e) => {
                        if (cardIndexForStudent !== currentItems.length - 1) {
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.backgroundColor = "#f8f8f8";
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      <RightOutlined
                        style={{
                          fontSize: "12px",
                          color:
                            cardIndexForStudent === currentItems.length - 1
                              ? "#d9d9d9"
                              : colors.deepGreen,
                        }}
                      />
                    </div>
                  </div>

                  {/* Card indicator dots */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "20px",
                      gap: "8px",
                    }}
                  >
                    {currentItems.map(
                      (_, index) =>
                        _.student && (
                          <div
                            key={index}
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor:
                                index === cardIndexForStudent
                                  ? colors.deepGreen
                                  : colors.lightGreen,
                              transition: "background-color 0.3s ease",
                              cursor: "pointer",
                            }}
                            onClick={() => setCardIndexForStudent(index)}
                          />
                        )
                    )}
                  </div>

                  {/* {vocabularyItems.length > itemsPerPage && (
                    <div style={{ textAlign: "center", marginTop: "24px" }}>
                      <Pagination
                        current={currentPage}
                        total={vocabularyItems.length}
                        pageSize={itemsPerPage}
                        onChange={handlePageChange}
                        style={{ color: colors.deepGreen }}
                      />
                    </div>
                  )} */}
                </div>
              )}
            </div>
          </Card>

          {/* CSS for animations */}
          <style>{`
            @keyframes slideInFromLeft {
              from { transform: translateX(-120%); }
              to { transform: translateX(0); }
            }
            
            @keyframes slideInFromRight {
              from { transform: translateX(120%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}
      <Divider style={{ borderColor: colors.lightGreen }} />
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          color="green"
          variant="solid"
          style={{ width: "200px", height: "70px" }}
          onClick={() => {
            setOnOpenManageVocabulary(true);
          }}
        >
          Thêm từ vựng
        </Button>
      </div>
      <Modal
        centered
        title={"Quản lý từ vựng"}
        open={onOpenManageVocabulary}
        onCancel={() => {
          setOnOpenManageVocabulary(false);
          form.resetFields();
          setTextToSpeech("");
          setMp3Url("");
          setImageUrl("");
          setMp3file(null);
        }}
        footer={[
          <Button
            style={{ marginTop: isMobile ? "20px" : "" }}
            key="cancel"
            onClick={() => {
              setOnOpenManageVocabulary(false);
              form.resetFields();
              setTextToSpeech("");
              setMp3Url("");
              setImageUrl("");
              setMp3file(null);
            }}
          >
            Hủy
          </Button>,
          // <Button
          //   loading={loadingUpdate}
          //   key="submit"
          //   type="primary"
          //   onClick={handleSave}
          //   style={{
          //     backgroundColor: colors.emerald,
          //     borderColor: colors.emerald,
          //   }}
          // >
          //   {editingLesson ? "Lưu" : "Create"}
          // </Button>,
          // <Button
          //   loading={loadingSchedule}
          //   key="send"
          //   type="primary"
          //   onClick={() => {
          //     // setOpenSend(true);
          //     const entity = lessonByScheduleData?.find(
          //       (item) => item.lessonID === selectedLessonId
          //     );
          //     handleUpdateSendingLessonStatus(entity?.id);
          //   }}
          //   style={{
          //     backgroundColor: colors.emerald,
          //     borderColor: colors.emerald,
          //   }}
          // >
          //   {"Gửi bài học"}
          // </Button>,
        ]}
        width={"95%"}
      >
        <div style={{ maxWidth: "100%", margin: "0 auto" }}>
          <Card
            title={<Title level={3}>Tạo bộ từ vựng</Title>}
            style={{ width: "100%", marginBottom: "20px" }}
          >
            <Form form={form} layout="vertical">
              {/* <Divider orientation="left">Giọng nói thành văn bản</Divider> */}

              {/* <Form.Item>
              <Card
                style={{
                  width: "100%",
                  boxShadow: "none",
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: isMobile ? "wrap" : "nowrap",
                    }}
                  >
                    <Space>
                      <Text strong>Rèn luyện nói</Text>
                      <Tag color={isManualRecordingCreate ? "error" : "default"}>
                        {isManualRecordingCreate ? "Đang ghi âm" : "Chờ"}
                      </Tag>
                    </Space>

                    <Button
                      type={isManualRecordingCreate ? "primary" : "default"}
                      danger={isManualRecordingCreate}
                      icon={isManualRecordingCreate ? <AudioMutedOutlined /> : <AudioOutlined />}
                      onClick={handleSpeechForMeaningCreate}
                    >
                      {isManualRecordingCreate ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
                    </Button>
                  </div>

                  {interimResult && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary" italic>
                        {interimResult}
                      </Text>
                    </div>
                  )}
                </Space>
              </Card>
            </Form.Item> */}
              <Form.Item
                name="word"
                label="Từ/Câu hỏi"
                rules={[{ required: true, message: "Vui lòng nhập từ mới" }]}
              >
                <Input
                  placeholder="Nhập từ/câu hỏi"
                  value={textToSpeech}
                  onChange={handleWordChange}
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Form.Item name="definition" label="Định nghĩa">
                <TextArea
                  rows={2}
                  placeholder="Nhập định nghĩa hoặc ý nghĩa của từ (tùy chọn)"
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Divider orientation="left">Hình ảnh</Divider>
              <style>{`
                .ant-upload-select {
                  width: 90px !important;
                  height: 90px !important;
                }
              `}</style>
              <Form.Item>
                <Upload
                  name="file"
                  listType="picture-card"
                  // className="avatar-uploader"
                  showUploadList={false}
                  action={process.env.REACT_APP_API_BASE_URL + "/files/upload"}
                  onChange={handleImageUpload}
                  // style={{ width: 10, height: 10 }}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="vocabulary" style={{ width: "100%" }} />
                  ) : (
                    <div>
                      {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <Divider orientation="left">Âm thanh</Divider>

              {/* <Form.Item label="Văn bản thành giọng nói">
              <TextArea
                value={textToSpeech}
                onChange={(e) => setTextToSpeech(e.target.value)}
                rows={2}
                placeholder="Nhập văn bản để chuyển thành giọng nói"
                style={{
                  borderRadius: "6px",
                  borderColor: colors.inputBorder,
                }}
              />
            </Form.Item> */}

              {/* <Form.Item>
                <Radio.Group
                  options={voices?.map((item) => {
                    return { label: item?.split("_")[1], value: item };
                  })}
                  onChange={onChangeGender}
                  value={gender}
                  // optionType="button"
                />
              </Form.Item> */}
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
                  loading={loadingTTS}
                  icon={<SoundOutlined />}
                  style={{
                    backgroundColor: colors.deepGreen,
                    borderColor: colors.deepGreen,
                  }}
                >
                  Play Audio
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

              <Divider />

              <Form.Item>
                <Button
                  type="primary"
                  onClick={handleAddVocabulary}
                  size="large"
                  icon={<PlusOutlined />}
                  loading={loadingAddVocabulary}
                  block
                >
                  Thêm từ vựng
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {vocabularyItems.filter((item) => item?.student?.id === studentId).length > 0 && (
            <Card title={<Title level={3}>Danh sách từ vựng</Title>}>
              <List
                style={{ maxHeight: "40vh", overflowY: "auto" }}
                itemLayout="horizontal"
                dataSource={vocabularyItems.filter((item) => item?.student?.id === studentId)}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    actions={[
                      item.student && (
                        <Button
                          key={item.id}
                          icon={<DeleteOutlined />}
                          danger
                          onClick={() => handleDeleteVocabulary(item.id)}
                        >
                          Xóa
                        </Button>
                      ),
                    ]}
                  >
                    {/* <List.Item.Meta
                      key={item.id}
                      avatar={
                        item.imageUrl && (
                          <img src={item.imageUrl} alt={item.word} width={48} height={48} />
                        )
                      }
                      // title={

                      // }
                      // description={item.meaning}
                    /> */}
                    <div style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                      <Avatar
                        shape="square"
                        style={{
                          width: "15vw",
                          height: "15vw",
                          margin: "10px",
                        }}
                        icon={<ImageOutlined style={{ width: "10vw", height: "10vw" }} />}
                        src={item && item.imageUrl}
                      />
                      <Text
                        key={item.id}
                        style={{ width: "70%", fontSize: isMobile ? "16px" : "32px" }}
                        strong
                      >
                        {item.word || item.textToSpeech}
                      </Text>
                      {item.audioUrl && (
                        <audio
                          controls
                          style={{
                            height: "50px",
                            margin: "10px 0",
                            marginRight: "10px",
                            width: "100%",
                          }}
                        >
                          <source src={item.audioUrl} type="audio/mp3" />
                        </audio>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </div>
      </Modal>
      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        style={{ zIndex: 100000000 }}
        centered
        width="90%"
      >
        <img
          src={previewSrc}
          style={{
            // position: "absolute",
            // top: "50%",
            // left: "50%",
            // transform: "translate(-50%, -50%)",
            transform: "translateX(-1%)",
            width: "102%",
            // height: isMobile ? "auto" : "102%",
            // height: "100%",
            borderRadius: "12px",
            maxWidth: "102%",
            // maxHeight: "102%",
            objectFit: "contain",
            borderRadius: "12px",
            margin: "0 auto",
          }}
        ></img>
      </Modal>
    </>
  );
};

export default VocabularyStudyComponent;

VocabularyStudyComponent.propTypes = {
  selectedHomeWorkId: PropTypes.number.isRequired,
  item: PropTypes.object,
  index: PropTypes.number,
  isMobile: PropTypes.bool,
  studentId: PropTypes.number,
};
