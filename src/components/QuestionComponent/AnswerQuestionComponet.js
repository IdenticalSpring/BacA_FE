import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import questionService from "services/questionService";
import answerQuestionService from "services/answerQuestionService";

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

  // Kiểm tra nếu là mobile (màn hình < 768px)
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const questionsData = await questionService.getQuestionsByHomeworkId(homeworkId);
        console.log("Dữ liệu questions:", questionsData);
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

  const handleAnswerChange = (questionId, value) => {
    console.log("Cập nhật newAnswers cho questionId:", questionId, "giá trị:", value);
    setNewAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAnswerSubmit = async (questionId) => {
    console.log("Gửi câu trả lời cho questionId:", questionId, "activeTab:", activeTab);
    if (questionId !== activeTab) {
      console.error("QuestionId không khớp với activeTab!");
      return;
    }

    const answerText = newAnswers[questionId]?.trim();
    if (!answerText) return;

    try {
      setSubmitting((prev) => ({ ...prev, [questionId]: true }));
      const answerData = {
        questionID: questionId, // Lưu ý: API sử dụng questionID, cần kiểm tra backend
        studentId,
        answer: answerText,
        text: answerText,
        homeWorkId: homeworkId,
      };
      console.log("Dữ liệu gửi API:", answerData);
      const createdAnswer = await answerQuestionService.createStudentQuestionAnswer(answerData);
      console.log("Câu trả lời từ API:", createdAnswer);

      const newAnswer = {
        id: createdAnswer.id || Date.now(),
        text: createdAnswer.answer || createdAnswer.text || answerText,
        timestamp: createdAnswer.createdAt || new Date().toISOString(),
      };

      setAnswers((prev) => {
        console.log("Cập nhật answers cho questionId:", questionId, "newAnswer:", newAnswer);
        return {
          ...prev,
          [questionId]: [...(prev[questionId] || []), newAnswer],
        };
      });

      setNewAnswers((prev) => ({ ...prev, [questionId]: "" }));
    } catch (err) {
      setError(err.message);
      console.error("Lỗi gửi câu trả lời:", err);
    } finally {
      setSubmitting((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "16px" }}>Đang tải...</div>;
  if (error) return <div style={{ color: "red", padding: "16px" }}>Lỗi: {error}</div>;
  if (questions.length === 0)
    return <div style={{ textAlign: "center", padding: "16px" }}>Không có câu hỏi nào</div>;

  return (
    <div
      style={{
        maxWidth: isMobile ? "100%" : "800px", // Giảm maxWidth trên mobile
        margin: "0 auto",
        padding: isMobile ? "8px" : "16px", // Giảm padding trên mobile
      }}
    >
      <h2
        style={{
          fontSize: isMobile ? "18px" : "24px", // Giảm fontSize trên mobile
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
          scrollbarWidth: isMobile ? "thin" : "auto", // Thanh cuộn mỏng hơn trên mobile
        }}
      >
        {questions.map((question, index) => (
          <button
            key={question.id}
            onClick={() => {
              console.log("Đặt activeTab thành:", question.id);
              setActiveTab(question.id);
            }}
            style={{
              padding: isMobile ? "8px 12px" : "12px 20px", // Giảm padding trên mobile
              fontSize: isMobile ? "12px" : "14px", // Giảm fontSize trên mobile
              fontWeight: activeTab === question.id ? "600" : "400",
              color: activeTab === question.id ? "#007bff" : "#555",
              backgroundColor: activeTab === question.id ? "#f0f8ff" : "transparent",
              border: "none",
              borderBottom: activeTab === question.id ? "3px solid #007bff" : "none",
              cursor: "pointer",
              transition: "all 0.2s",
              flexShrink: 0,
              marginRight: isMobile ? "4px" : "0", // Thêm khoảng cách giữa các tab trên mobile
            }}
            // Loại bỏ hover trên mobile vì không cần thiết
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
        if (!currentQuestion) return <div>Không tìm thấy câu hỏi</div>;

        return (
          <div
            key={currentQuestion.id}
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              padding: isMobile ? "12px" : "24px", // Giảm padding trên mobile
            }}
          >
            <div
              style={{
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                padding: isMobile ? "8px" : "16px", // Giảm padding trên mobile
                marginBottom: isMobile ? "12px" : "16px",
                maxHeight: isMobile ? "500px" : "384px", // Tăng maxHeight trên mobile
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? "8px" : "12px", // Giảm gap trên mobile
              }}
            >
              {/* Bong bóng câu hỏi */}
              <div
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  borderRadius: "12px",
                  padding: isMobile ? "8px" : "12px", // Giảm padding trên mobile
                  maxWidth: isMobile ? "90%" : "70%", // Tăng maxWidth trên mobile
                  alignSelf: "flex-start",
                }}
              >
                <p style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: "600" }}>
                  {htmlToText(currentQuestion.text)}
                </p>
                <p
                  style={{
                    fontSize: isMobile ? "10px" : "12px",
                    marginTop: "4px",
                    opacity: "0.8",
                  }}
                >
                  Từ giáo viên: {currentQuestion.teacher?.name || "Không rõ"}
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
                      padding: isMobile ? "8px" : "12px", // Giảm padding trên mobile
                      maxWidth: isMobile ? "90%" : "70%", // Tăng maxWidth trên mobile
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
                      {new Date(answer.timestamp).toLocaleString("vi-VN")}
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
                  Chưa có câu trả lời
                </p>
              )}
            </div>

            {/* Trường nhập câu trả lời */}
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row", // Xếp dọc trên mobile
                gap: isMobile ? "8px" : "12px",
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
                  padding: isMobile ? "8px" : "12px", // Giảm padding trên mobile
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: isMobile ? "12px" : "14px", // Giảm fontSize trên mobile
                  outline: "none",
                  boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
                  width: isMobile ? "100%" : "auto", // Chiếm toàn bộ chiều rộng trên mobile
                }}
              />
              <button
                onClick={() => handleAnswerSubmit(currentQuestion.id)}
                disabled={submitting[currentQuestion.id]}
                style={{
                  backgroundColor: submitting[currentQuestion.id] ? "#6c757d" : "#007bff",
                  color: "white",
                  padding: isMobile ? "8px 16px" : "12px 20px", // Giảm padding trên mobile
                  borderRadius: "8px",
                  border: "none",
                  cursor: submitting[currentQuestion.id] ? "not-allowed" : "pointer",
                  fontSize: isMobile ? "12px" : "14px", // Giảm fontSize trên mobile
                  width: isMobile ? "100%" : "auto", // Chiếm toàn bộ chiều rộng trên mobile
                  transition: !isMobile ? "background-color 0.2s" : "none", // Tắt transition trên mobile
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
                {submitting[currentQuestion.id] ? "Đang gửi..." : "Gửi"}
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
