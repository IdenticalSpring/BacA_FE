import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Upload,
  message,
  List,
  Tag,
  Radio,
  Modal,
  Avatar,
  Select,
  Empty,
  Row,
  Col,
} from "antd";
import {
  AudioOutlined,
  AudioMutedOutlined,
  PictureOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  LoadingOutlined,
  SoundOutlined,
  UserOutlined,
  EyeFilled,
  EyeOutlined,
} from "@ant-design/icons";
import useSpeechToText from "react-hook-speech-to-text";
import homeWorkService from "services/homeWorkService";
import PropTypes from "prop-types";
import vocabularyService from "services/vocabularyService";
import { ImageOutlined } from "@mui/icons-material";
import { useSpeechRecognition } from "react-speech-kit";
import studentService from "services/studentService";
import student_vocabularyService from "services/student_vocabulary";
import fileService from "services/fileService";
const { Title, Text } = Typography;
const { TextArea } = Input;

const VocabularyCreateComponent = ({
  isMobile,
  vocabularyList,
  setVocabularyList,
  selectedHomeWorkId,
  audioId,
  selectedClass,
}) => {
  // States
  const [form] = Form.useForm();
  const [textToSpeech, setTextToSpeech] = useState("");
  const [gender, setGender] = useState(1);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [isManualRecording, setIsManualRecording] = useState(false);
  const [groupedByStudent, setGroupedByStudent] = useState([]);
  const [openDetailVocabularies, setOpenDetailVocabularies] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedStudentVocabularies, setSelectedStudentVocabularies] = useState([]);
  const [deleteForStudentFlag, setDeleteForStudentFlag] = useState(false);
  const [isLoadingStudentVocabularies, setIsLoadingStudentVocabularies] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentVocabularies, setStudentVocabularies] = useState([]);
  const [voices, setVoices] = useState(null);
  const [audioUrlUploaded, setAudioUrlUploaded] = useState("");
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

  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        try {
          const data = await studentService.getAllStudentsbyClass(selectedClass);
          setStudents(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách học sinh:", error);
          setStudents([]);
        }
      };
      fetchStudents();
    }
  }, [selectedClass]);

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
      lang: "en-US", // 👈 chỉ nhận tiếng Anh (Mỹ)
      interimResults: true,
    },
  });
  const onError = (event) => {
    if (event.error === "not-allowed") {
      // setBlocked(true);
      message.error(" Oh no, it looks like your browser doesn&#39;t support Speech Recognition.");
    }
  };
  const onResult = (result) => {
    // console.log(result);
    setTextToSpeech((prev) => prev + " " + result);
  };
  useEffect(() => {
    form.setFieldsValue({ word: textToSpeech });
  }, [textToSpeech]);
  const { listen, listening, stop, supported } = useSpeechRecognition({
    // onResult: (result) => {
    //   // console.log(result);
    //   setResultSTT((prev) => prev + " " + result);
    // },
    onResult,
    onError,
  });
  // console.log(textToSpeech);

  // Gender options for text-to-speech
  const genderOptions = [
    { label: "Nam", value: 1 },
    { label: "Nữ", value: 0 },
  ];
  // console.log(vocabularyList);
  useEffect(() => {
    const groupedByStudent = vocabularyList.reduce((acc, vocab) => {
      const studentId = vocab.student?.id;
      if (!studentId) return acc; // nếu không có student id thì bỏ qua

      if (!acc[studentId]) {
        acc[studentId] = [];
      }
      acc[studentId].push(vocab);

      return acc;
    }, []);
    // groupedByStudent[1]?.map((item) => console.log(item.student.imgUrl));
    // console.log(groupedByStudent);

    setGroupedByStudent(groupedByStudent);
  }, [vocabularyList, deleteForStudentFlag]);
  // console.log(groupedByStudent);

  // Handle gender change
  const onChangeGender = (value) => {
    setGender(value);
  };

  // Handle text-to-speech conversion
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTS(true);

    try {
      const modifiedText = textToSpeech.replace(/\n/g, "..");
      const response = await homeWorkService.textToSpeech({
        textToSpeech: modifiedText,
        voice: gender,
      });

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
      //   const audioElement = document.getElementById(audioId);
      //   if (audioElement) {
      //     audioElement.src = ""; // Xóa src trước khi revoke
      //     audioElement.load(); // Yêu cầu cập nhật
      //   }
      //   URL.revokeObjectURL(mp3Url);
      // }
      // console.log("mémaeseaseas");

      let audioUrl = URL.createObjectURL(audioBlob);
      setMp3Url(audioUrl);

      // =================== PHẦN THÊM MỚI ===================
      const fileName = `vocab_tts_${Date.now()}.mp3`;
      const audioFile = new File([audioBlob], fileName, { type: "audio/mp3" });

      // Gọi fileService để upload
      const uploadedUrl = await fileService.upload(audioFile, fileName);

      if (uploadedUrl) {
        setAudioUrlUploaded(uploadedUrl); // <-- LƯU URL ĐÃ UPLOAD
        message.success("Âm thanh đã được tạo và tải lên!");
      } else {
        throw new Error("Không nhận được URL sau khi tải lên.");
      }
      // ======================================================
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTS(false);
  };
  // console.log(mp3Url);
  useEffect(() => {
    if (mp3Url) {
      // console.log("🔄 Cập nhật audio URL:", mp3Url);
      const audioElement = document.getElementById(audioId);
      if (audioElement) {
        audioElement.src = ""; // Xóa src để tránh giữ URL cũ
        audioElement.load(); // Tải lại audio
        audioElement.src = mp3Url;
      }
    }
  }, [mp3Url]);

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
  const handleFetchVocabulariesForStudent = (id) => {
    const fetchVocabulary = async () => {
      try {
        setIsLoadingStudentVocabularies(true);
        const data = { studentId: id, homeworkId: selectedHomeWorkId };
        const vocaData = await vocabularyService.getVocabularyByHomworkIdAndStudentIdForStudent(
          data
        );
        const vocaDataFilter = vocaData.map((item) => {
          if (item.imageUrl === "") item.imageUrl = null;
          return item;
        });
        // console.log(vocaDataFilter);
        const studentVocabularies =
          await student_vocabularyService.getStudent_vocabularyByHomeworkIdAndStudentId(data);
        setStudentVocabularies(studentVocabularies);
        setSelectedStudentVocabularies(vocaDataFilter);
      } catch (err) {
        message.error(err);
      } finally {
        setIsLoadingStudentVocabularies(false);
      }
    };
    fetchVocabulary();
  };
  // Add vocabulary to list
  const handleAddVocabulary = () => {
    form
      .validateFields()
      .then((values) => {
        const newVocab = {
          id: Date.now(),
          word: values.word,
          // meaning: values.meaning,
          imageUrl: imageUrl || undefined,
          audioUrl: audioUrlUploaded,
          audioFile: mp3file || null,
          isNew: true,
        };

        setVocabularyList([...vocabularyList, newVocab]);
        message.success(`Từ "${values.word}" đã được thêm vào danh sách`);

        // Reset form and states
        form.resetFields();
        setTextToSpeech("");
        setMp3Url("");
        setImageUrl("");
        setMp3file(null);
      })
      .catch((errorInfo) => {
        console.log("Validation Failed:", errorInfo);
        errorInfo.errorFields.forEach((field) => {
          message.error(`${field.errors[0]}`);
        });
      });
  };

  // Delete vocabulary item
  const handleDeleteVocabulary = (id) => {
    const item = vocabularyList.find((item) => item.id === id);

    if (!item) {
      return;
    }

    Modal.confirm({
      title: "Xác nhận xóa từ vựng?",
      content: "Bạn có chắc chắn muốn xóa từ vựng này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        if (item.isNew) {
          setVocabularyList(vocabularyList.filter((item) => item.id !== id));
          message.success("Xóa từ vựng thành công");
          return;
        }
        return vocabularyService
          .deletevocabulary(id)
          .then(() => {
            setVocabularyList(vocabularyList.filter((item) => item.id !== id));
            if (deleteForStudentFlag) {
              setSelectedStudentVocabularies(
                selectedStudentVocabularies.filter((item) => item.id !== id)
              );
            }
            message.success("Xóa từ vựng thành công");
          })
          .catch((error) => {
            message.error("Xóa từ vựng thất bại: " + error);
          });
      },
    });
  };

  // Update textToSpeech when the word field changes
  const handleWordChange = (e) => {
    setTextToSpeech(e.target.value);
    form.setFieldsValue({ word: e.target.value });
  };

  const colors = {
    deepGreen: "#389e0d",
    inputBorder: "#d9d9d9",
  };

  // Handle speech to text specific for meaning field
  const handleSpeechForMeaning = () => {
    if (!supported) {
      message.error(
        "Web Speech API không được hỗ trợ cho trình duyệt này vui lòng tải google chrome để sử dụng 🤷"
      );
      return;
    }
    if (listening) {
      stop();
      setIsManualRecording(false);
    } else {
      listen({ lang: "en-AU", interimResults: false });
      setIsManualRecording(true);
      setTextToSpeech("");
      form.setFieldsValue({ word: "" });
    }
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <Card
        title={<Title level={3}>Tạo từ vựng và luyện nghe nói</Title>}
        style={{ width: "100%", marginBottom: "20px" }}
      >
        <Form form={form} layout="vertical">
          <Form.Item>
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
                    <Text strong>Nói để nhập văn bản</Text>
                    <Tag color={isManualRecording ? "error" : "default"}>
                      {isManualRecording ? "Đang ghi âm" : "Chờ"}
                    </Tag>
                  </Space>

                  <Button
                    type={isManualRecording ? "primary" : "default"}
                    danger={isManualRecording}
                    icon={isManualRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
                    onClick={handleSpeechForMeaning}
                  >
                    {isManualRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
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
          </Form.Item>
          <Form.Item name="word" label="Từ/Câu hỏi">
            <Input
              placeholder="Nhập từ/câu hỏi"
              value={textToSpeech}
              onChange={handleWordChange}
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
              className="avatar-uploader"
              showUploadList={false}
              action={process.env.REACT_APP_API_BASE_URL + "/files/upload"}
              onChange={handleImageUpload}
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
                <audio id={audioId} controls style={{ width: "100%" }}>
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
              block
            >
              Thêm từ vựng
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {vocabularyList?.length > 0 && (
        <Card title={<Title level={3}>Danh sách từ vựng</Title>}>
          {/* Layout ngang cho danh sách từ vựng */}
          <div style={{ maxHeight: "40vh", overflowY: "auto", padding: "10px 0" }}>
            <Row gutter={[16, 16]}>
              {vocabularyList
                ?.filter((item) => !item?.student)
                .map((item) => (
                  <Col key={item?.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      bodyStyle={{
                        padding: "12px",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                      cover={
                        item?.imageUrl ? (
                          <div style={{ height: "120px", overflow: "hidden" }}>
                            <img
                              src={item?.imageUrl}
                              alt={item?.word}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              height: "120px",
                              backgroundColor: "#f5f5f5",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ImageOutlined style={{ fontSize: "40px", color: "#bfbfbf" }} />
                          </div>
                        )
                      }
                      actions={[
                        <Button
                          key="delete"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            setDeleteForStudentFlag(false);
                            handleDeleteVocabulary(item?.id);
                          }}
                          size="small"
                        >
                          Xóa
                        </Button>,
                      ]}
                    >
                      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <Text
                          strong
                          style={{
                            fontSize: "14px",
                            marginBottom: "8px",
                            textAlign: "center",
                            wordBreak: "break-word",
                          }}
                        >
                          {item?.word || item?.textToSpeech}
                        </Text>

                        {item?.audioUrl && (
                          <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                            <audio
                              controls
                              style={{
                                width: "100%",
                                height: "32px",
                              }}
                            >
                              <source src={item?.audioUrl} type="audio/mp3" />
                            </audio>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
            </Row>
          </div>

          <Divider />
          <Title level={3}>Danh sách các bạn học sinh đã tạo từ vựng và trả lời câu hỏi</Title>
          <div
            style={{
              width: "100%",
              maxHeight: "40vh",
              overflowY: "auto",
            }}
          >
            {students?.map((item, index) => {
              return (
                <div
                  key={index}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Divider />
                  <Avatar
                    src={item && item?.imgUrl}
                    icon={<UserOutlined />}
                    shape="square"
                    style={{ width: "50px", height: "50px" }}
                  />
                  <div style={{ width: "60%" }}>{item && item?.name}</div>
                  <Button
                    onClick={() => {
                      setOpenDetailVocabularies(true);
                      setDeleteForStudentFlag(true);
                      if (item) {
                        handleFetchVocabulariesForStudent(item?.id || 0);
                      }
                      setSelectedStudentName(item && item?.name);
                    }}
                    icon={<EyeOutlined style={{ fontSize: "20px" }} />}
                    style={{ width: "40px", height: "40px" }}
                    color="green"
                    variant="filled"
                  ></Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <style>
        {`
        .ant-modal-wrap{
          z-index: 1000000 !important;
        }
        `}
      </style>
      <Modal
        centered
        title={"Danh sách từ vựng và câu trả lời của bạn " + selectedStudentName}
        open={openDetailVocabularies}
        onCancel={() => {
          setSelectedStudentVocabularies([]);
          setSelectedStudentName("");
          setOpenDetailVocabularies(false);
        }}
        footer={[
          <Button
            style={{ marginTop: isMobile ? "20px" : "" }}
            key="cancel"
            onClick={() => {
              setSelectedStudentVocabularies([]);
              setSelectedStudentName("");
              setOpenDetailVocabularies(false);
            }}
          >
            Hủy
          </Button>,
        ]}
        width={"85%"}
        style={{ zIndex: "10000000000" }}
      >
        {isLoadingStudentVocabularies ? (
          <div
            style={{
              width: "100%",
              height: "70vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LoadingOutlined style={{ fontSize: "100px" }} />
          </div>
        ) : (
          <>
            {selectedStudentVocabularies?.length > 0 && (
              <>
                <h3>{"Danh sách từ vựng của bạn " + selectedStudentName}</h3>
                {/* Layout ngang cho từ vựng học sinh trong modal */}
                <div style={{ maxHeight: "35vh", overflowY: "auto", padding: "10px 0" }}>
                  <Row gutter={[16, 16]}>
                    {selectedStudentVocabularies.map((item) => (
                      <Col key={item?.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                        <Card
                          hoverable
                          style={{
                            borderRadius: "12px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                          bodyStyle={{
                            padding: "12px",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                          }}
                          cover={
                            item?.imageUrl ? (
                              <div style={{ height: "120px", overflow: "hidden" }}>
                                <img
                                  src={item?.imageUrl}
                                  alt={item?.word}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            ) : (
                              <div
                                style={{
                                  height: "120px",
                                  backgroundColor: "#f5f5f5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <ImageOutlined style={{ fontSize: "40px", color: "#bfbfbf" }} />
                              </div>
                            )
                          }
                          actions={[
                            <Button
                              key="delete"
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteVocabulary(item?.id)}
                              size="small"
                            >
                              Xóa
                            </Button>,
                          ]}
                        >
                          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                            <Text
                              strong
                              style={{
                                fontSize: "14px",
                                marginBottom: "8px",
                                textAlign: "center",
                                wordBreak: "break-word",
                              }}
                            >
                              {item?.word || item?.textToSpeech}
                            </Text>

                            {item?.audioUrl && (
                              <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                                <audio
                                  controls
                                  style={{
                                    width: "100%",
                                    height: "32px",
                                  }}
                                >
                                  <source src={item?.audioUrl} type="audio/mp3" />
                                </audio>
                              </div>
                            )}
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </>
            )}
          </>
        )}
        {studentVocabularies?.length > 0 && (
          <>
            <h3>{"Danh sách câu trả lời của bạn " + selectedStudentName}</h3>
            <List
              style={{ maxHeight: "35vh", overflowY: "auto", padding: "10px" }}
              itemLayout="horizontal"
              dataSource={studentVocabularies || []}
              renderItem={(item) => (
                <List.Item key={item?.id} style={{ padding: "10px 0" }}>
                  <Card
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                    bodyStyle={{ display: "flex", alignItems: "center" }}
                  >
                    <Avatar
                      shape="square"
                      style={{
                        width: isMobile ? 50 : 70,
                        height: isMobile ? 50 : 70,
                        marginRight: "15px",
                        backgroundColor: "#f0f0f0",
                      }}
                      icon={
                        <ImageOutlined
                          style={{
                            width: isMobile ? "50px" : "5vw",
                            height: isMobile ? "50px" : "5vw",
                          }}
                        />
                      }
                      src={item?.vocabulary?.imageUrl}
                    />
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: isMobile ? 16 : 20 }}>
                        Từ: {item?.vocabulary?.textToSpeech}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: isMobile ? 14 : 18 }}>
                        Câu trả lời: {item?.text}
                      </Text>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </>
        )}
        {studentVocabularies?.length === 0 && selectedStudentVocabularies?.length === 0 && (
          <div
            style={{
              width: "100%",
              height: "30vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Empty style={{ width: "100%" }}></Empty>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VocabularyCreateComponent;
VocabularyCreateComponent.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  vocabularyList: PropTypes.array.isRequired,
  setVocabularyList: PropTypes.func.isRequired,
  selectedHomeWorkId: PropTypes.number.isRequired,
  audioId: PropTypes.string.isRequired,
  selectedClass: PropTypes.number.isRequired,
};
