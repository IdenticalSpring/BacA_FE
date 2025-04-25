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
} from "@ant-design/icons";
import useSpeechToText from "react-hook-speech-to-text";
import homeWorkService from "services/homeWorkService";
import PropTypes from "prop-types";
import vocabularyService from "services/vocabularyService";
const { Title, Text } = Typography;
const { TextArea } = Input;

const VocabularyCreateComponent = ({ isMobile, vocabularyList, setVocabularyList }) => {
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

  // Gender options for text-to-speech
  const genderOptions = [
    { label: "Nam", value: 1 },
    { label: "Nữ", value: 0 },
  ];

  // Handle gender change
  const onChangeGender = (e) => {
    setGender(e.target.value);
  };

  // Handle text-to-speech conversion
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTS(true);

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

  // Add vocabulary to list
  const handleAddVocabulary = () => {
    form
      .validateFields()
      .then((values) => {
        const newVocab = {
          id: Date.now(),
          word: values.word,
          // meaning: values.meaning,
          imageUrl: imageUrl || null,
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
  useEffect(() => {
    if (speechResults.length > 0) {
      const lastResult = speechResults[speechResults.length - 1].transcript;
      setTextToSpeech(textToSpeech + lastResult);
      form.setFieldsValue({ word: textToSpeech + lastResult });
    }
  }, [speechResults, form]);
  useEffect(() => {
    let timeout;

    timeout = setTimeout(() => {
      if (!isRecording && isManualRecording) {
        console.log("⏳ Mic tắt do hệ thống → khởi động lại", isRecording, isManualRecording);
        startSpeechToText();
        setTextToSpeech(textToSpeech + " ");
        form.setFieldsValue({ word: textToSpeech + " " });
      }
    }, 500); // Delay nhẹ để tránh race condition
    return () => clearTimeout(timeout);
  }, [isRecording, isManualRecording]);
  const colors = {
    deepGreen: "#389e0d",
    inputBorder: "#d9d9d9",
  };

  // Handle speech to text specific for meaning field
  const handleSpeechForMeaning = () => {
    if (speechError) {
      message.error(
        "Web Speech API không được hỗ trợ cho trình duyệt này vui lòng tải google chrome để sử dụng 🤷"
      );
    }
    if (isRecording) {
      stopSpeechToText();
      setIsManualRecording(false);
      const lastResult = speechResults[speechResults.length - 1]?.transcript || "";
      form.setFieldsValue({ meaning: lastResult });
    } else {
      startSpeechToText();
      setIsManualRecording(true);
      setTextToSpeech("");
      form.setFieldsValue({ word: "" });
    }
  };
  // console.log(vocabularyList);

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

      {vocabularyList.length > 0 && (
        <Card title={<Title level={3}>Danh sách từ vựng</Title>}>
          <List
            style={{ maxHeight: "40vh", overflowY: "auto" }}
            itemLayout="horizontal"
            dataSource={vocabularyList}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Button
                    key={item.id}
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDeleteVocabulary(item.id)}
                  >
                    Xóa
                  </Button>,
                ]}
              >
                <List.Item.Meta
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
                )}
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default VocabularyCreateComponent;
VocabularyCreateComponent.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  vocabularyList: PropTypes.array.isRequired,
  setVocabularyList: PropTypes.func.isRequired,
};
