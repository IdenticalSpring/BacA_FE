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
const { Title, Text } = Typography;
const { TextArea } = Input;

const VocabularyCreateComponent = ({
  isMobile,
  vocabularyList,
  setVocabularyList,
  selectedHomeWorkId,
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
      const response = await homeWorkService.textToSpeech({ textToSpeech, voice: gender });

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
    setLoadingTTS(false);
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

  // Handle image upload
  const handleImageUpload = (info) => {
    if (info.file.status === "uploading") {
      setImageLoading(true);
      return;
    }
    console.log(info);
    if (info.file.status === "done") {
      // In a real app, you would use the response from your server
      setImageUrl(info.file.response.url);
      setImageLoading(false);
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
          audioUrl: mp3Url || null,
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
    // if (
    //   vocabularyList.find((item) => item.id === id) &&
    //   !vocabularyList.find((item) => item.id === id).isNew
    // ) {
    //   vocabularyService
    //     .deletevocabulary(id)
    //     .then(() => {})
    //     .catch((error) => {
    //       message.error("Xóa từ vựng thất bại " + error);
    //     });
    // }
    // setVocabularyList(vocabularyList.filter((item) => item.id !== id));
    // message.success("Xóa từ vựng thành công");
  };

  // Update textToSpeech when the word field changes
  const handleWordChange = (e) => {
    setTextToSpeech(e.target.value);
    form.setFieldsValue({ word: e.target.value });
  };

  // Update form when speech is recognized
  // useEffect(() => {
  //   if (speechResults.length > 0) {
  //     const lastResult = speechResults[speechResults.length - 1].transcript;
  //     setTextToSpeech(textToSpeech + lastResult);
  //     form.setFieldsValue({ word: textToSpeech + lastResult });
  //   }
  // }, [speechResults, form]);
  // useEffect(() => {
  //   let timeout;

  //   timeout = setTimeout(() => {
  //     if (!isRecording && isManualRecording) {
  //       console.log("⏳ Mic tắt do hệ thống → khởi động lại", isRecording, isManualRecording);
  //       startSpeechToText();
  //       setTextToSpeech(textToSpeech + " ");
  //       form.setFieldsValue({ word: textToSpeech + " " });
  //     }
  //   }, 500); // Delay nhẹ để tránh race condition
  //   return () => clearTimeout(timeout);
  // }, [isRecording, isManualRecording]);
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
      // const lastResult = speechResults[speechResults.length - 1]?.transcript || "";
      // form.setFieldsValue({ meaning: lastResult });
    } else {
      listen({ lang: "en-AU", interimResults: false });
      setIsManualRecording(true);
      setTextToSpeech("");
      form.setFieldsValue({ word: "" });
    }
  };
  // console.log(groupedByStudent[1][0].student);

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <Card
        title={<Title level={3}>Tạo từ vựng và luyện nghe nói</Title>}
        style={{ width: "100%", marginBottom: "20px" }}
      >
        <Form form={form} layout="vertical">
          {/* <Divider orientation="left">Giọng nói thành văn bản</Divider> */}

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
          <Form.Item
            name="word"
            label="Từ mới"
            // rules={[{ required: true, message: "Vui lòng nhập từ mới" }]}
          >
            <Input
              placeholder="Nhập từ vựng"
              value={textToSpeech}
              onChange={handleWordChange}
              style={{ borderRadius: "6px" }}
            />
          </Form.Item>

          {/* <Form.Item
            name="meaning"
            label="Ý nghĩa"
            rules={[{ required: true, message: "Vui lòng nhập ý nghĩa" }]}
          >
            <TextArea rows={3} placeholder="Nhập ý nghĩa của từ" style={{ borderRadius: "6px" }} />
          </Form.Item> */}

          <Divider orientation="left">Hình ảnh</Divider>
          <style>{`
                .ant-upload-select {
                  width: 90px !important;
                  height: 90px !important;
                }
              `}</style>
          <Form.Item>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action={process.env.REACT_APP_API_BASE_URL + "/upload/avatar"}
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
              block
            >
              Thêm từ vựng
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {vocabularyList?.length > 0 && (
        <Card title={<Title level={3}>Danh sách từ vựng</Title>}>
          <List
            style={{ maxHeight: "40vh", overflowY: "auto" }}
            itemLayout="horizontal"
            dataSource={vocabularyList?.filter((item) => !item?.student)}
            renderItem={(item) => (
              <List.Item
                key={item?.id}
                actions={[
                  <Button
                    key={item?.id}
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => {
                      setDeleteForStudentFlag(false);
                      handleDeleteVocabulary(item?.id);
                    }}
                  >
                    Xóa
                  </Button>,
                ]}
              >
                {/* <List.Item.Meta
                  key={item.id}
                  avatar={
                    item.imageUrl && (
                      <img src={item.imageUrl} alt={item.word} width={48} height={48} />
                    )
                  }
                  title={
                    <Text key={item.id} strong>
                      {item.word || item.textToSpeech}
                    </Text>
                  }
                  // description={item.meaning}
                />
                {item.audioUrl && (
                  <audio controls style={{ height: "30px" }}>
                    <source src={item.audioUrl} type="audio/mp3" />
                  </audio>
                )} */}
                <div style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                  <Avatar
                    shape="square"
                    style={{
                      width: isMobile ? "50px" : "5vw",
                      height: isMobile ? "50px" : "5vw",
                      margin: "10px",
                    }}
                    icon={
                      <ImageOutlined
                        style={{
                          width: isMobile ? "50px" : "5vw",
                          height: isMobile ? "50px" : "5vw",
                        }}
                      />
                    }
                    src={item && item?.imageUrl}
                  />
                  <Text
                    key={item?.id}
                    style={{ width: "70%", fontSize: isMobile ? "16px" : "24px" }}
                    strong
                  >
                    {item?.word || item?.textToSpeech}
                  </Text>
                  {item?.audioUrl && (
                    <audio
                      controls
                      style={{
                        height: "50px",
                        margin: "10px 0",
                        marginRight: "10px",
                        width: "100%",
                      }}
                    >
                      <source src={item?.audioUrl} type="audio/mp3" />
                    </audio>
                  )}
                </div>
              </List.Item>
            )}
          />
          {/* <List
            style={{ maxHeight: "40vh", overflowY: "auto" }}
            itemLayout="horizontal"
            dataSource={Object.entries(groupedByStudent)}
            renderItem={(item, index) => {
              // console.log(item[1][0]);
              return (
                <List.Item
                  key={index}
                  actions={[
                    <Button
                      key={index}
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => handleDeleteVocabulary(item.id)}
                    >
                      Xóa
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    key={index}
                    avatar={
                      item[1] &&
                      item[1][0]?.student?.imgUrl && (
                        <img
                          src={item[1] && item[1][0]?.student?.imgUrl}
                          alt={item[1] && item[1][0]?.student?.name}
                          width={48}
                          height={48}
                        />
                      )
                    }
                    title={
                      <Text key={index} strong>
                        {item[1] && item[1][0]?.student?.name}
                      </Text>
                    }
                    // description={item.meaning}
                  />
                </List.Item>
              );
            }}
          /> */}
          <Divider />
          <Title level={3}>Danh sách các bạn học sinh đã tạo từ vựng</Title>
          {/* <Divider /> */}
          <div
            style={{
              width: "100%",
              maxHeight: "40vh",
              overflowY: "auto",
            }}
          >
            {groupedByStudent?.map((item, index) => {
              // console.log(item[0]?.student?.id);
              return (
                <div
                  key={index}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    // padding: "10px",
                    // border: "1px solid gray",
                    flexWrap: "wrap",
                  }}
                >
                  <Divider />
                  <Avatar
                    src={item && item[0]?.student?.imgUrl}
                    icon={<UserOutlined />}
                    shape="square"
                    style={{ width: "50px", height: "50px" }}
                  />
                  <div style={{ width: "60%" }}>{item && item[0]?.student?.name}</div>
                  <Button
                    onClick={() => {
                      // setSelectedStudentId(item[0]?.student?.id || 0);
                      setOpenDetailVocabularies(true);
                      setDeleteForStudentFlag(true);
                      if (item) {
                        handleFetchVocabulariesForStudent(item[0]?.student?.id || 0);
                      }
                      setSelectedStudentName(item && item[0]?.student?.name);
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

      <Modal
        centered
        title={"Danh sách từ vựng của bạn " + selectedStudentName}
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
      >
        {/* <Card title={<Title level={3}>Danh sách từ vựng</Title>}> */}
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
          selectedStudentVocabularies?.length > 0 && (
            <List
              style={{ maxHeight: "70vh", overflowY: "auto" }}
              itemLayout="horizontal"
              dataSource={selectedStudentVocabularies || []}
              renderItem={(item) => (
                <List.Item
                  key={item?.id}
                  actions={[
                    <Button
                      key={item?.id}
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => handleDeleteVocabulary(item?.id)}
                    >
                      Xóa
                    </Button>,
                  ]}
                >
                  <div style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
                    <Avatar
                      shape="square"
                      style={{
                        width: isMobile ? "50px" : "5vw",
                        height: isMobile ? "50px" : "5vw",
                        margin: "10px",
                      }}
                      icon={
                        <ImageOutlined
                          style={{
                            width: isMobile ? "50px" : "5vw",
                            height: isMobile ? "50px" : "5vw",
                          }}
                        />
                      }
                      src={item && item?.imageUrl}
                    />
                    <Text
                      key={item?.id}
                      style={{ width: "70%", fontSize: isMobile ? "16px" : "24px" }}
                      strong
                    >
                      {item?.word || item?.textToSpeech}
                    </Text>
                    {item?.audioUrl && (
                      <audio
                        controls
                        style={{
                          height: "50px",
                          margin: "10px 0",
                          marginRight: "10px",
                          width: "100%",
                        }}
                      >
                        <source src={item?.audioUrl} type="audio/mp3" />
                      </audio>
                    )}
                  </div>
                </List.Item>
              )}
            />
          )
        )}
        {/* </Card> */}
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
};
