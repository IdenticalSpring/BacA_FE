import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import questionService from "services/questionService";
import answerQuestionService from "services/answerQuestionService";
import { useSpeechRecognition } from "react-speech-kit";
import { Button, message } from "antd";
import { AudioOutlined, AudioMutedOutlined } from "@ant-design/icons";

const htmlToText = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

// Hook để kiểm tra màn hình mobile
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [query]);

  return matches;
};

const AnswerQuestionComponent = ({ homeworkId, studentId }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [newAnswers, setNewAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // State cho Speech-to-Text
  const [isRecording, setIsRecording] = useState(false);
  const { listen, listening, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      setNewAnswers((prev) => ({
        ...prev,
        [activeTab]: (prev[activeTab] || "") + " " + result,
      }));
    },
    onError: (event) => {
      if (event.error === "not-allowed") {
        message.error("Browser does not support Speech Recognition. Please use Google Chrome.");
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const questionsData = await questionService.getQuestionsByHomeworkId(homeworkId);
        console.log("Questions data:", questionsData);
        setQuestions(questionsData);

        const initialNewAnswers = {};
        questionsData.forEach((question) => {
          initialNewAnswers[question.id] = "";
        });
        setNewAnswers(initialNewAnswers);
        if (questionsData.length > 0) {
          setActiveTab(questionsData[0].id);
        }

        const answersData = await answerQuestionService.getStudentQuestionAnswersByHomeworkId(
          homeworkId
        );
        const answersByQuestion = {};
        questionsData.forEach((question) => {
          const questionAnswers = answersData
            .filter(
              (answer) =>
                answer.student.id === studentId &&
                answer.question.id === question.id &&
                !answer.isDelete
            )
            .map((answer) => ({
              id: answer.id || Date.now(),
              text: answer.answer || answer.text || "",
              timestamp: answer.createdAt || new Date().toISOString(),
            }));
          answersByQuestion[question.id] = questionAnswers;
        });
        setAnswers(answersByQuestion);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [homeworkId, studentId]);

  // Dừng ghi âm khi chuyển tab
  useEffect(() => {
    if (isRecording) {
      stop();
      setIsRecording(false);
    }
  }, [activeTab]);

  const handleAnswerChange = (questionId, value) => {
    console.log("Updating newAnswers for questionId:", questionId, "value:", value);
    setNewAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAnswerSubmit = async (questionId) => {
    console.log("Submitting answer for questionId:", questionId, "activeTab:", activeTab);
    if (questionId !== activeTab) {
      console.error("QuestionId does not match activeTab!");
      return;
    }

    const answerText = newAnswers[questionId]?.trim();
    if (!answerText) return;

    // Dừng ghi âm trước khi gửi
    if (isRecording) {
      stop();
      setIsRecording(false);
    }

    try {
      setSubmitting((prev) => ({ ...prev, [questionId]: true }));
      const answerData = {
        questionID: questionId,
        studentId,
        answer: answerText,
        text: answerText,
        homeWorkId: homeworkId,
      };
      console.log("API payload:", answerData);
      const createdAnswer = await answerQuestionService.createStudentQuestionAnswer(answerData);
      console.log("Answer from API:", createdAnswer);

      const newAnswer = {
        id: createdAnswer.id || Date.now(),
        text: createdAnswer.answer || createdAnswer.text || answerText,
        timestamp: createdAnswer.createdAt || new Date().toISOString(),
      };

      setAnswers((prev) => {
        console.log("Updating answers for questionId:", questionId, "newAnswer:", newAnswer);
        return {
          ...prev,
          [questionId]: [...(prev[questionId] || []), newAnswer],
        };
      });

      setNewAnswers((prev) => ({ ...prev, [questionId]: "" }));
    } catch (err) {
      setError(err.message);
      console.error("Error submitting answer:", err);
    } finally {
      setSubmitting((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // Hàm xử lý gợi ý câu trả lời
  const handleSuggestAnswer = async (questionId) => {
    const currentQuestion = questions.find((q) => q.id === questionId);
    if (!currentQuestion) {
      message.error("Question not found!");
      return;
    }

    try {
      setSubmitting((prev) => ({ ...prev, [questionId]: true }));
      const questionText = htmlToText(currentQuestion.text);
      const imageUrl = currentQuestion.imageUrl || null;

      const suggestedAnswer = await answerQuestionService.suggestAnswerQuestion(
        questionText,
        imageUrl
      );

      // Tạo câu trả lời mới với gợi ý
      const answerData = {
        questionID: questionId,
        studentId,
        answer: suggestedAnswer,
        text: suggestedAnswer,
        homeWorkId: homeworkId,
      };

      console.log("Sending answerData to API:", answerData);
      const createdAnswer = await answerQuestionService.createStudentQuestionAnswer(answerData);
      console.log("Created answer from suggestion:", createdAnswer);

      const newAnswer = {
        id: createdAnswer.id || Date.now(),
        text: createdAnswer.answer || createdAnswer.text || suggestedAnswer,
        timestamp: createdAnswer.createdAt || new Date().toISOString(),
      };

      setAnswers((prev) => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), newAnswer],
      }));
      message.success("Suggested answer submitted successfully!");
    } catch (err) {
      setError(err.message);
      message.error("Failed to generate or submit suggested answer!");
      console.error("Error suggesting answer:", err);
    } finally {
      setSubmitting((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // Hàm xử lý bật/tắt ghi âm
  const toggleSpeechToText = (questionId) => {
    if (!supported) {
      message.error("Browser does not support Speech Recognition. Please use Google Chrome.");
      return;
    }

    if (isRecording) {
      stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      listen({ lang: "en-US" });
    }
  };

  // Hàm xử lý Speech-to-Text
  const handleSpeechForMeaning = (questionId) => {
    if (!supported) {
      message.error("Browser does not support Speech Recognition. Please use Google Chrome.");
      return;
    }

    if (listening) {
      stop();
      setIsRecording(false);
      console.log("Stopped recording for questionId:", questionId);
    } else {
      setIsRecording(true);
      listen({ lang: "en-US" });
      console.log("Started recording for questionId:", questionId);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "16px" }}>Loading...</div>;
  if (error) return <div style={{ color: "red", padding: "16px" }}>Error: {error}</div>;
  if (questions.length === 0)
    return <div style={{ textAlign: "center", padding: "16px" }}>No questions available</div>;

  return (
    <div
      style={{
        maxWidth: isMobile ? "100%" : "800px",
        margin: "0 auto",
        padding: isMobile ? "8px" : "16px",
      }}
    >
      <h2
        style={{
          fontSize: isMobile ? "18px" : "24px",
          fontWeight: "bold",
          marginBottom: isMobile ? "16px" : "24px",
          textAlign: "center",
        }}
      >
        Câu hỏi bài tập
      </h2>

      {/* Thanh tab */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #e0e0e0",
          marginBottom: isMobile ? "16px" : "24px",
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollbarWidth: isMobile ? "thin" : "auto",
        }}
      >
        {questions.map((question, index) => (
          <button
            key={question.id}
            onClick={() => {
              console.log("Setting activeTab to:", question.id);
              setActiveTab(question.id);
            }}
            style={{
              padding: isMobile ? "8px 12px" : "12px 20px",
              fontSize: isMobile ? "12px" : "14px",
              fontWeight: activeTab === question.id ? "600" : "400",
              color: activeTab === question.id ? "#007bff" : "#555",
              backgroundColor: activeTab === question.id ? "#f0f8ff" : "transparent",
              border: "none",
              borderBottom: activeTab === question.id ? "3px solid #007bff" : "none",
              cursor: "pointer",
              transition: "all 0.2s",
              flexShrink: 0,
              marginRight: isMobile ? "4px" : "0",
            }}
            onMouseOver={
              !isMobile
                ? (e) =>
                    (e.target.style.backgroundColor =
                      activeTab === question.id ? "#f0f8ff" : "#f5f5f5")
                : undefined
            }
            onMouseOut={
              !isMobile
                ? (e) =>
                    (e.target.style.backgroundColor =
                      activeTab === question.id ? "#f0f8ff" : "transparent")
                : undefined
            }
          >
            Câu hỏi {index + 1}
          </button>
        ))}
      </div>

      {/* Nội dung tab */}
      {(() => {
        const currentQuestion = questions.find((q) => q.id === activeTab);
        if (!currentQuestion) return <div>Question not found</div>;

        return (
          <div
            key={currentQuestion.id}
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              padding: isMobile ? "12px" : "24px",
            }}
          >
            <div
              style={{
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                padding: isMobile ? "8px" : "16px",
                marginBottom: isMobile ? "12px" : "16px",
                maxHeight: isMobile ? "500px" : "384px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? "8px" : "12px",
              }}
            >
              {/* Bong bóng câu hỏi */}
              <div
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  borderRadius: "12px",
                  padding: isMobile ? "8px" : "12px",
                  maxWidth: isMobile ? "90%" : "70%",
                  alignSelf: "flex-start",
                }}
              >
                <p style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: "600" }}>
                  {htmlToText(currentQuestion.text)}
                </p>
                {currentQuestion.imageUrl && (
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question image"
                    style={{
                      maxWidth: "100%",
                      maxHeight: isMobile ? "150px" : "200px",
                      height: "auto",
                      borderRadius: "8px",
                      marginTop: "8px",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150?text=Image+Not+Found";
                      e.target.alt = "Image not found";
                    }}
                  />
                )}
                <p
                  style={{
                    fontSize: isMobile ? "10px" : "12px",
                    marginTop: "4px",
                    opacity: "0.8",
                  }}
                >
                  Giáo viên: {currentQuestion.teacher?.name || "Unknown"}
                </p>
              </div>

              {/* Bong bóng câu trả lời */}
              {(answers[currentQuestion.id] || []).length > 0 ? (
                answers[currentQuestion.id].map((answer) => (
                  <div
                    key={answer.id}
                    style={{
                      backgroundColor: "#d4edda",
                      borderRadius: "12px",
                      padding: isMobile ? "8px" : "12px",
                      maxWidth: isMobile ? "90%" : "70%",
                      alignSelf: "flex-end",
                      marginBottom: isMobile ? "8px" : "12px",
                    }}
                  >
                    <p style={{ fontSize: isMobile ? "12px" : "14px" }}>{answer.text}</p>
                    <p
                      style={{
                        fontSize: isMobile ? "10px" : "12px",
                        color: "#555",
                        marginTop: "4px",
                        textAlign: "right",
                      }}
                    >
                      {new Date(answer.timestamp).toLocaleString("en-US")}
                    </p>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: "#777",
                    fontSize: isMobile ? "12px" : "14px",
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  No answers yet
                </p>
              )}
            </div>

            {/* Trường nhập câu trả lời với các nút */}
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "8px" : "12px",
                alignItems: isMobile ? "stretch" : "center",
              }}
            >
              <input
                type="text"
                value={newAnswers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                disabled={submitting[currentQuestion.id]}
                style={{
                  flex: 1,
                  padding: isMobile ? "8px" : "12px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: isMobile ? "12px" : "14px",
                  outline: "none",
                  boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
                  width: isMobile ? "100%" : "auto",
                }}
              />
              <Button
                type={isRecording ? "primary" : "default"}
                danger={isRecording}
                icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
                onClick={() => handleSpeechForMeaning(currentQuestion.id)}
                disabled={submitting[currentQuestion.id] || !supported}
                style={{
                  padding: isMobile ? "8px" : "12px",
                  borderRadius: "8px",
                  fontSize: isMobile ? "12px" : "14px",
                  width: isMobile ? "100%" : "auto",
                  transition: !isMobile ? "background-color 0.2s" : "none",
                }}
              >
                {isRecording ? "Dừng" : "Ghi âm"}
              </Button>
              <button
                onClick={() => handleSuggestAnswer(currentQuestion.id)}
                disabled={submitting[currentQuestion.id]}
                style={{
                  backgroundColor: submitting[currentQuestion.id] ? "#6c757d" : "#28a745",
                  color: "white",
                  padding: isMobile ? "8px 16px" : "12px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: submitting[currentQuestion.id] ? "not-allowed" : "pointer",
                  fontSize: isMobile ? "12px" : "14px",
                  width: isMobile ? "100%" : "auto",
                  transition: !isMobile ? "background-color 0.2s" : "none",
                }}
                onMouseOver={
                  !isMobile
                    ? (e) =>
                        !submitting[currentQuestion.id] &&
                        (e.target.style.backgroundColor = "#218838")
                    : undefined
                }
                onMouseOut={
                  !isMobile
                    ? (e) =>
                        !submitting[currentQuestion.id] &&
                        (e.target.style.backgroundColor = "#28a745")
                    : undefined
                }
              >
                {submitting[currentQuestion.id] ? "Đang gợi ý" : "Gợi ý câu trả lời"}
              </button>
              <button
                onClick={() => handleAnswerSubmit(currentQuestion.id)}
                disabled={submitting[currentQuestion.id]}
                style={{
                  backgroundColor: submitting[currentQuestion.id] ? "#6c757d" : "#007bff",
                  color: "white",
                  padding: isMobile ? "8px 16px" : "12px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: submitting[currentQuestion.id] ? "not-allowed" : "pointer",
                  fontSize: isMobile ? "12px" : "14px",
                  width: isMobile ? "100%" : "auto",
                  transition: !isMobile ? "background-color 0.2s" : "none",
                }}
                onMouseOver={
                  !isMobile
                    ? (e) =>
                        !submitting[currentQuestion.id] &&
                        (e.target.style.backgroundColor = "#0056b3")
                    : undefined
                }
                onMouseOut={
                  !isMobile
                    ? (e) =>
                        !submitting[currentQuestion.id] &&
                        (e.target.style.backgroundColor = "#007bff")
                    : undefined
                }
              >
                {submitting[currentQuestion.id] ? "Đang gửi" : "Gửi"}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

AnswerQuestionComponent.propTypes = {
  homeworkId: PropTypes.string.isRequired,
  studentId: PropTypes.string.isRequired,
};

export default AnswerQuestionComponent;
