import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, Input, Button, Space, message, Empty, Spin } from "antd";
import {
  AudioOutlined,
  SoundOutlined,
  LoadingOutlined,
  AudioMutedOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import useSpeechToText from "react-hook-speech-to-text";
import PropTypes from "prop-types";
import { colors } from "assets/theme/color";
const { Text, Title } = Typography;
const { TextArea } = Input;

export default function VocabularyItemCard({
  currentItems,
  vocabularyItems,
  loading,
  audioLoading,
}) {
  const [currentText, setCurrentText] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [activeRecordingId, setActiveRecordingId] = useState(null);
  const [resultSTT, setResultSTT] = useState("");
  const [isManualRecording, setIsManualRecording] = useState(false);
  const [isManualRecordingCreate, setIsManualRecordingCreate] = useState(false);
  const [cardHeight, setCardHeight] = useState(null);
  // Swipe animation states
  const [cardIndex, setCardIndex] = useState(0);
  const [animation, setAnimation] = useState("");
  const audioRefs = useRef([]);
  const cardRefs = useRef([]);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  // Add inside component (outside useEffect)
  const mouseStartX = useRef(null);
  const isMouseDown = useRef(false);

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

  const handleMouseUp = (e) => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    const diff = mouseStartX.current - e.clientX;
    const currentCard = cardRefs.current[cardIndex];

    if (diff > 100 && cardIndex < currentItems.length - 1) {
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
  // Handle speech to text
  useEffect(() => {
    if (speechResults.length > 0) {
      const lastResult = speechResults[speechResults.length - 1].transcript;
      setCurrentText(lastResult);
    }
  }, [speechResults]);

  useEffect(() => {
    let timeout;

    timeout = setTimeout(() => {
      if (!isRecording && isManualRecording) {
        startSpeechToText();
        setResultSTT(resultSTT + " ");
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [isRecording, isManualRecording]);
  useEffect(() => {
    if (speechResults.length > 0 && !isRecordingForCreate) {
      const lastResult = speechResults[speechResults.length - 1]?.transcript || "";
      setResultSTT(resultSTT + lastResult);
    }
  }, [speechResults]);
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
      setIsManualRecording(false);
      setResultSTT("");
      // speechResults = [];
    } else {
      setActiveRecordingId(itemId);
      startSpeechToText();
      setIsManualRecording(true);
    }
  };
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

    if (diff > swipeThreshold && cardIndex < currentItems.length - 1) {
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

  const goToPrevCard = () => {
    if (cardIndex > 0) {
      setAnimation("slide-from-left");
      setTimeout(() => {
        setCardIndex(cardIndex - 1);
        setAnimation("");
      }, 300);
    }
  };

  const goToNextCard = () => {
    if (cardIndex < currentItems.length - 1) {
      setAnimation("slide-from-right");
      setTimeout(() => {
        setCardIndex(cardIndex + 1);
        setAnimation("");
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
            <Text style={{ color: colors.midGreen, fontWeight: "500" }}>
              {index + 1} / {currentItems.length}
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
                }}
              />
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
            <Button
              type="text"
              icon={audioLoading ? <LoadingOutlined /> : <SoundOutlined />}
              onClick={() => handleTextToSpeech(item.textToSpeech)}
              style={{ color: colors.deepGreen }}
            />
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
  return (
    <div style={{ maxWidth: "100%", margin: "10px auto", padding: "0px" }}>
      <Card
        style={{
          borderRadius: "16px",
          boxShadow: `0 8px 24px ${colors.softShadow}`,
          borderColor: colors.borderGreen,
          backgroundColor: colors.white,
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
                indicator={<LoadingOutlined style={{ fontSize: 36, color: colors.deepGreen }} />}
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
                {currentItems.map((item, index) => (
                  <VocabularyItemCard key={item.id} item={item} index={index} />
                ))}
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
                    cursor: cardIndex === currentItems.length - 1 ? "not-allowed" : "pointer",
                    opacity: cardIndex === currentItems.length - 1 ? 0.5 : 1,
                    marginRight: "-16px", // Half outside
                    border: "1px solid #f0f0f0",
                    transition: "transform 0.2s, background-color 0.2s",
                  }}
                  onClick={goToNextCard}
                  onMouseOver={(e) => {
                    if (cardIndex !== currentItems.length - 1) {
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
                      color: cardIndex === currentItems.length - 1 ? "#d9d9d9" : colors.deepGreen,
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
                {currentItems.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: index === cardIndex ? colors.deepGreen : colors.lightGreen,
                      transition: "background-color 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => setCardIndex(index)}
                  />
                ))}
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
  );
}
VocabularyItemCard.propTypes = {
  currentItems: PropTypes.array.isRequired,
  vocabularyItems: PropTypes.array.isRequired,
  item: PropTypes.object,
  index: PropTypes.number,
  loading: PropTypes.bool,
  audioLoading: PropTypes.bool,
};
