import React, { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import useSpeechToText from "react-hook-speech-to-text";
import PropTypes from "prop-types";
import { colors } from "assets/theme/color";
import vocabularyService from "services/vocabularyService";
const { Text, Title } = Typography;
const { TextArea } = Input;

// Color palette

// Mock data based on your second image
const mockVocabularyData = [
  { id: 16, imageUrl: null, audioUrl: null, textToSpeech: "apple", isDelete: 0, homeworkId: 47 },
  { id: 17, imageUrl: null, audioUrl: null, textToSpeech: "banana", isDelete: 0, homeworkId: 47 },
  {
    id: 21,
    imageUrl:
      "https://res.cloudinary.com/ddd1hxsx0/image/upload/v1745250790/zxiljmwyn1klo5bqjyrl.jpg",
    audioUrl: null,
    textToSpeech: "12",
    isDelete: 0,
    homeworkId: 47,
  },
  {
    id: 22,
    imageUrl: null,
    audioUrl:
      "https://res.cloudinary.com/ddd1hxsx0/video/upload/v1745250797/i7xipjj6yg54ulbowel3.mp3",
    textToSpeech: "dog",
    isDelete: 0,
    homeworkId: 47,
  },
  {
    id: 24,
    imageUrl:
      "https://res.cloudinary.com/ddd1hxsx0/image/upload/v1745250790/zxiljmwyn1klo5bqjyrl.jpg",
    audioUrl:
      "https://res.cloudinary.com/ddd1hxsx0/video/upload/v1745250797/i7xipjj6yg54ulbowel3.mp3",
    textToSpeech: "elephant",
    isDelete: 0,
    homeworkId: 47,
  },
];

const VocabularyStudyComponent = ({ selectedHomeWorkId }) => {
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

  // Fetch data (simulated)
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const response = await vocabularyService.getVocabularyByHomworkId(selectedHomeWorkId);
        setVocabularyItems(response);
      } catch (error) {
        console.error("Error fetching vocabulary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVocabulary();
    // // Simulate API call
    // setTimeout(() => {
    //   setVocabularyItems(mockVocabularyData);
    //   setLoading(false);
    // }, 1000);
  }, []);

  // Handle speech to text
  useEffect(() => {
    if (speechResults.length > 0) {
      const lastResult = speechResults[speechResults.length - 1].transcript;
      setCurrentText(lastResult);
    }
  }, [speechResults]);

  // Toggle speech recognition
  const toggleSpeechToText = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };
  const handleSpeechForMeaning = (itemId) => {
    if (speechError) {
      message.error(
        "Web Speech API không được hỗ trợ cho trình duyệt này vui lòng tải google chrome để sử dụng 🤷"
      );
      return;
    }
    if (isRecording && activeRecordingId === itemId) {
      stopSpeechToText();
      setActiveRecordingId(null);

      //   const lastResult = speechResults[speechResults.length - 1]?.transcript || "";

      //   // ✅ Gán kết quả vào đúng item
      //   setVocabularyItems((prev) =>
      //     prev.map((item) => (item.id === itemId ? { ...item, speechToText: lastResult } : item))
      //   );
    } else {
      setActiveRecordingId(itemId);
      startSpeechToText();
    }
  };
  // Handle text to speech conversion
  const handleTextToSpeech = (text) => {
    if (!text) return;

    setAudioLoading(true);

    // Simulate API call
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      setAudioLoading(false);
    }, 500);
  };

  // Handle image upload (simulated)
  const handleImageUpload = (info) => {
    if (info.file.status === "uploading") {
      setImageLoading(true);
      return;
    }

    if (info.file.status === "done") {
      // In a real app, you'd use the response URL
      setImageLoading(false);
      message.success(`${info.file.name} uploaded successfully`);
    } else if (info.file.status === "error") {
      setImageLoading(false);
      message.error(`${info.file.name} upload failed`);
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

  // Calculate current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = vocabularyItems.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Add item card
  //   const AddItemCard = () => (
  //     <Card
  //       style={{
  //         borderRadius: "12px",
  //         marginBottom: "16px",
  //         boxShadow: `0 4px 12px ${colors.softShadow}`,
  //         borderColor: colors.borderGreen,
  //         backgroundColor: colors.white,
  //       }}
  //     >
  //       <Space direction="vertical" size="middle" style={{ width: "100%" }}>
  //         <div style={{ textAlign: "center" }}>
  //           <Title level={4} style={{ color: colors.deepGreen, margin: 0 }}>
  //             Add New Vocabulary
  //           </Title>
  //         </div>

  //         {/* Image upload area */}
  //         <div style={{ textAlign: "center" }}>
  //           <Upload
  //             name="avatar"
  //             listType="picture-card"
  //             className="avatar-uploader"
  //             showUploadList={false}
  //             action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
  //             onChange={handleImageUpload}
  //           >
  //             {imageLoading ? (
  //               <LoadingOutlined style={{ fontSize: 24, color: colors.deepGreen }} />
  //             ) : (
  //               <div
  //                 style={{
  //                   padding: "24px",
  //                   border: `1px dashed ${colors.midGreen}`,
  //                   borderRadius: "8px",
  //                   color: colors.midGreen,
  //                 }}
  //               >
  //                 <PictureOutlined style={{ fontSize: 24 }} />
  //                 <div style={{ marginTop: 8 }}>Hình</div>
  //               </div>
  //             )}
  //           </Upload>
  //         </div>

  //         {/* Text and audio controls */}
  //         <div style={{ display: "flex", alignItems: "center" }}>
  //           <Text style={{ width: "30px", color: colors.deepGreen }}>Từ:</Text>
  //           <Input
  //             placeholder="Enter vocabulary word"
  //             value={currentText}
  //             onChange={(e) => setCurrentText(e.target.value)}
  //             style={{
  //               flex: 1,
  //               borderRadius: "6px",
  //               borderColor: colors.inputBorder,
  //             }}
  //           />
  //           <Button
  //             type="text"
  //             icon={audioLoading ? <LoadingOutlined /> : <SoundOutlined />}
  //             onClick={() => handleTextToSpeech(currentText)}
  //             disabled={!currentText.trim()}
  //             loading={audioLoading}
  //             style={{ color: colors.deepGreen }}
  //           >
  //             Audio
  //           </Button>
  //         </div>

  //         {/* Speech to text */}
  //         <div style={{ display: "flex", alignItems: "center" }}>
  //           <Input
  //             placeholder="Audio to text"
  //             value={interimResult || ""}
  //             readOnly
  //             style={{
  //               flex: 1,
  //               borderRadius: "6px",
  //               borderColor: colors.inputBorder,
  //             }}
  //           />
  //           <Button
  //             type={isRecording ? "primary" : "default"}
  //             danger={isRecording}
  //             icon={
  //               isRecording ? <AudioOutlined style={{ color: colors.white }} /> : <AudioOutlined />
  //             }
  //             onClick={toggleSpeechToText}
  //             style={isRecording ? { backgroundColor: colors.errorRed } : { color: colors.deepGreen }}
  //           />
  //         </div>

  //         {/* Add button */}
  //         <Button
  //           type="primary"
  //           block
  //           onClick={addVocabularyItem}
  //           loading={addingItem}
  //           style={{
  //             backgroundColor: colors.deepGreen,
  //             borderColor: colors.deepGreen,
  //             borderRadius: "6px",
  //             height: "40px",
  //           }}
  //         >
  //           <PlusOutlined /> Add Vocabulary
  //         </Button>
  //       </Space>
  //     </Card>
  //   );

  // Vocabulary item cards
  const VocabularyItemCard = ({ item, index }) => (
    <Card
      key={item.id}
      style={{
        borderRadius: "12px",
        marginBottom: "16px",
        boxShadow: `0 4px 12px ${colors.softShadow}`,
        borderColor: colors.borderGreen,
        backgroundColor: colors.white,
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
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
            {/* {item.imageUrl ? ( */}
            <img
              src={item.imageUrl}
              alt={item.textToSpeech}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
            {/* ) : (
            <Text style={{ color: colors.midGreen }}>Hình</Text>
           )} */}
          </div>
        )}

        {/* Text and audio controls */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Text style={{ width: "30px", color: colors.deepGreen }}>Từ:</Text>
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
          {/* <Button
            type="text"
            icon={<SoundOutlined />}
            onClick={() => handleTextToSpeech(item.textToSpeech)}
            style={{ color: colors.deepGreen }}
          >
            Phát âm
          </Button> */}
        </div>
        {item.audioUrl && (
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* <Text style={{ color: colors.deepGreen }}>Âm thanh:</Text> */}
            <audio controls style={{ flex: 1 }}>
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
            value={
              (isRecording && activeRecordingId === item.id && interimResult) ||
              // //   item.speechToText ||
              // ""
              item.id
            }
            autoSize={{ minRows: 1, maxRows: 6 }}
            style={{
              flex: 1,
              borderRadius: "6px",
              borderColor: colors.inputBorder,
            }}
          />
          <Button
            type={isRecording && activeRecordingId === item.id ? "primary" : "default"}
            danger={isRecording && activeRecordingId === item.id}
            icon={
              isRecording && activeRecordingId === item.id ? (
                <AudioMutedOutlined />
              ) : (
                <AudioOutlined />
              )
            }
            onClick={() => handleSpeechForMeaning(item.id)}
          ></Button>
        </div>
      </Space>
    </Card>
  );

  return (
    <>
      {vocabularyItems.length > 0 && (
        <div style={{ maxWidth: "100%", margin: "10px auto", padding: "0px" }}>
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: `0 8px 24px ${colors.softShadow}`,
              borderColor: colors.borderGreen,
              backgroundColor: colors.white,
            }}
          >
            <Title
              level={2}
              style={{
                color: colors.deepGreen,
                textAlign: "center",
                marginBottom: "24px",
              }}
            >
              Học từ vựng
            </Title>

            {/* Add new vocabulary card */}
            {/* <AddItemCard /> */}

            <Divider style={{ borderColor: colors.lightGreen }} />

            {/* Vocabulary list */}
            <div>
              <Title level={4} style={{ color: colors.deepGreen, marginBottom: "16px" }}>
                Danh sách từ vựng cho bài tập hôm nay
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
              ) : vocabularyItems.length === 0 ? (
                <Empty description="No vocabulary items yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <>
                  <Row gutter={[24, 16]}>
                    {currentItems.map((item, index) => (
                      <Col xs={24} sm={12} md={12} lg={6} key={item.id}>
                        <VocabularyItemCard item={item} index={indexOfFirstItem + index} />
                      </Col>
                    ))}
                  </Row>

                  {vocabularyItems.length > itemsPerPage && (
                    <div style={{ textAlign: "center", marginTop: "24px" }}>
                      <Pagination
                        current={currentPage}
                        total={vocabularyItems.length}
                        pageSize={itemsPerPage}
                        onChange={handlePageChange}
                        style={{ color: colors.deepGreen }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      )}
      <div>
        {isRecording}
        {activeRecordingId}
        {interimResult}
      </div>
    </>
  );
};

export default VocabularyStudyComponent;
VocabularyStudyComponent.propTypes = {
  selectedHomeWorkId: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};
