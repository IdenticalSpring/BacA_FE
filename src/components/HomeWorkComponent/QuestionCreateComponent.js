import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  message,
  Card,
  Typography,
  List,
  Modal,
  Avatar,
  Divider,
  Upload,
  Empty,
} from "antd";
import {
  DeleteOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
  SwapOutlined,
  LoadingOutlined,
  PlusOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import { colors } from "assets/theme/color";
import ReactQuill, { Quill } from "react-quill";
import axios from "axios";
import studentService from "services/studentService";
import answerQuestionService from "services/answerQuestionService";
import questionService from "services/questionService";

const BlockEmbed = Quill.import("blots/block/embed");
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

class CustomImageBlot extends BlockEmbed {
  static blotName = "image";
  static tagName = "img";
  static create(value) {
    const node = super.create();
    node.setAttribute("src", value);
    node.setAttribute("class", "ql-image");
    node.style.cursor = "zoom-in";
    node.addEventListener("click", () => {
      window.open(value, "_blank"); // Mở ảnh trong tab mới
    });
    return node;
  }
  static value(node) {
    return node.getAttribute("src");
  }
}
Quill.register(AudioBlot);
Quill.register(CustomImageBlot);

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const QuestionCreateComponent = ({
  teacherId,
  classID,
  teachers = [],
  classes = [],
  questionList,
  setQuestionList,
}) => {
  const [form] = Form.useForm();
  const quillRef = useRef(null);
  const [swapHtmlMode, setSwapHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const teacherName =
    teachers.length > 0
      ? teachers.find((t) => t.id === Number(teacherId))?.name || `Teacher ${teacherId}`
      : `Teacher ${teacherId}`;
  const [students, setStudents] = useState([]);
  const [openDetailQuestions, setOpenDetailQuestions] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedStudentQuestions, setSelectedStudentQuestions] = useState([]);
  const [isLoadingStudentQuestions, setIsLoadingStudentQuestions] = useState(false);

  useEffect(() => {
    if (teacherId && classID) {
      form.setFieldsValue({
        teacherID: teacherId.toString(),
        classID: classID.toString(),
        isDelete: false,
      });
    }
    const fetchStudents = async () => {
      try {
        const data = await studentService.getAllStudentsbyClass(classID);
        setStudents(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách học sinh:", error);
        setStudents([]);
      }
    };
    fetchStudents();
  }, [teacherId, classID, form]);

  const toolbar = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link", "image", "audio"],
    ["clean"],
  ];
  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
    "list",
    "indent",
    "link",
    "image",
    "audio",
  ];

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("multiple", "true");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/files/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (response.status === 200 && response.data.url && quillRef.current) {
          const editor = quillRef.current.getEditor();
          if (!editor) return;
          const range = editor.getSelection(true) || { index: editor.getLength() };
          editor.insertEmbed(range.index, "image", response.data.url);
          setTimeout(() => {
            const imgs = editor.root.querySelectorAll(`img[src="${response.data.url}"]`);
            imgs.forEach((img) => {
              img.classList.add("ql-image");
            });
          }, 0);
          message.success("Đã upload ảnh thành công");
        } else {
          message.error("Upload ảnh thất bại. Vui lòng thử lại!");
        }
      } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
        message.error("Lỗi upload ảnh: " + (error.response?.data?.message || error.message));
      }
    };
  }, []);

  const audioHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "audio/*");
    input.setAttribute("multiple", "true");
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
            process.env.REACT_APP_API_BASE_URL + "/files/upload",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          if (response.status === 200 && response.data.url) {
            editor.insertEmbed(currentIndex, "audio", response.data.url, "user");
            currentIndex++;
            editor.setSelection(currentIndex);
            message.success(`Đã upload audio ${file.name} thành công`);
          } else {
            message.error(`Upload audio ${file.name} thất bại. Vui lòng thử lại!`);
          }
        } catch (error) {
          console.error(`Lỗi khi upload audio ${file.name}:`, error);
          message.error(
            `Lỗi upload audio ${file.name}: ` + (error.response?.data?.message || error.message)
          );
        }
      }
    };
  }, [quillRef]);

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

  const modules = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandler,
        audio: audioHandler,
      },
    },
  };

  const handleAddQuestion = () => {
    const editor = quillRef.current?.getEditor();
    const quillContent = editor?.root?.innerHTML || "";

    if (!quillContent || quillContent === "<p><br></p>") {
      message.error("Vui lòng nhập nội dung câu hỏi");
      return;
    }

    form
      .validateFields()
      .then((values) => {
        const newQuestion = {
          id: Date.now(),
          text: quillContent,
          imageUrl: imageUrl, // Đảm bảo imageUrl từ Upload component
          teacher:
            teachers.length > 0
              ? teachers.find((t) => t.id === Number(values.teacherID)) || {
                  id: teacherId,
                  name: `Teacher ${teacherId}`,
                }
              : { id: teacherId, name: `Teacher ${teacherId}` },
          class:
            classes.length > 0
              ? classes.find((c) => c.id === Number(values.classID)) || {
                  id: classID,
                  name: `Class ${classID}`,
                }
              : { id: classID, name: `Class ${classID}` },
          isNew: true,
          isDelete: values.isDelete,
        };
        setQuestionList([...questionList, newQuestion]);
        message.success(`Câu hỏi đã được thêm vào danh sách`);
        form.resetFields();
        form.setFieldsValue({
          teacherID: teacherId.toString(),
          classID: classID.toString(),
          isDelete: false,
        });
        if (editor) {
          editor.setContents([]);
        }
        setHtmlContent("");
        setSwapHtmlMode(false);
        setImageUrl(""); // Reset imageUrl
        setImageLoading(false);
      })
      .catch((errorInfo) => {
        errorInfo.errorFields.forEach((field) => {
          message.error(`${field.errors[0]}`);
        });
      });
  };

  const handleDeleteQuestion = (id) => {
    const item = questionList.find((item) => item.id === id);
    if (!item) return;

    Modal.confirm({
      title: "Xác nhận xóa câu hỏi?",
      content: "Bạn có chắc chắn muốn xóa câu hỏi này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        if (item.isNew) {
          setQuestionList(questionList.filter((item) => item.id !== id));
          message.success("Xóa câu hỏi thành công");
          return;
        }
        return questionService
          .deleteQuestion(id)
          .then(() => {
            setQuestionList(questionList.filter((item) => item.id !== id));
            message.success("Xóa câu hỏi thành công");
          })
          .catch((error) => {
            message.error("Xóa câu hỏi thất bại: " + error.message);
          });
      },
    });
  };

  const handleFetchQuestionsForStudent = async (studentId) => {
    try {
      setIsLoadingStudentQuestions(true);
      const answers = [];
      for (const question of questionList) {
        const studentAnswers = await answerQuestionService.getStudentQuestionAnswersByQuestionId(
          question.id,
          studentId
        );
        answers.push(
          ...studentAnswers.map((answer) => ({
            ...answer,
            question,
          }))
        );
      }
      setSelectedStudentQuestions(answers);
      const student = students.find((s) => s.id === studentId);
      setSelectedStudentName(student ? student.name : "");
      setOpenDetailQuestions(true);
    } catch (error) {
      message.error("Lỗi khi lấy câu trả lời của học sinh:", error);
    } finally {
      setIsLoadingStudentQuestions(false);
    }
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <Card
        title={<Title level={3}>Tạo câu hỏi mới</Title>}
        style={{ width: "100%", marginBottom: "20px" }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            teacherID: teacherId ? teacherId.toString() : "",
            classID: classID ? classID.toString() : "",
            isDelete: false,
          }}
        >
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
              showUploadList={true}
              action={process.env.REACT_APP_API_BASE_URL + "/files/upload"}
              onChange={handleImageUpload}
              multiple
            >
              {imageUrl ? (
                <img src={imageUrl} alt="question" style={{ width: "100%" }} />
              ) : (
                <div>
                  {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Divider orientation="left">Nội dung câu hỏi</Divider>
          <Form.Item name="text" label="Nội dung câu hỏi">
            <div>
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
              <ReactQuill
                id="QuestionDescriptionCreate"
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
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              onClick={handleAddQuestion}
              size="large"
              icon={<QuestionCircleOutlined />}
              block
              style={{
                borderRadius: "6px",
                backgroundColor: colors.emerald,
                borderColor: colors.emerald,
                color: colors.white,
              }}
            >
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {questionList?.length > 0 && (
        <Card title={<Title level={3}>Danh sách câu hỏi</Title>}>
          <List
            style={{ maxHeight: "40vh", overflowY: "auto" }}
            itemLayout="horizontal"
            dataSource={questionList}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Button
                    key={item.id}
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDeleteQuestion(item.id)}
                  >
                    Xóa
                  </Button>,
                ]}
              >
                <div
                  style={{ width: "100%", display: "flex", flexWrap: "wrap", alignItems: "center" }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt="question"
                      style={{
                        width: "50px",
                        height: "50px",
                        margin: "10px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  ) : (
                    <Avatar
                      shape="square"
                      style={{
                        width: "50px",
                        height: "50px",
                        margin: "10px",
                        backgroundColor: colors.paleGreen,
                      }}
                      icon={<QuestionCircleOutlined />}
                    />
                  )}
                  <div
                    style={{ width: "70%", fontSize: "16px" }}
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  />
                  {item.teacher && (
                    <Text type="secondary" style={{ width: "100%", marginLeft: "60px" }}>
                      Giáo viên: {item.teacher.name || `Teacher ${item.teacher.id}`}
                    </Text>
                  )}
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}

      <Card
        title={
          <Title level={3}>Danh sách các bạn học sinh đã tạo từ vựng và trả lời câu hỏi</Title>
        }
      >
        <div
          style={{
            width: "100%",
            maxHeight: "40vh",
            overflowY: "auto",
          }}
        >
          {students?.map((item, index) => (
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
                src={item?.imgUrl}
                icon={<UserOutlined />}
                shape="square"
                style={{ width: "50px", height: "50px" }}
              />
              <div style={{ width: "60%" }}>{item?.name}</div>
              <Button
                onClick={() => handleFetchQuestionsForStudent(item?.id || 0)}
                icon={<EyeOutlined style={{ fontSize: "20px" }} />}
                style={{ width: "40px", height: "40px" }}
                color="green"
                variant="filled"
              ></Button>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        centered
        title={"Danh sách câu trả lời của bạn " + selectedStudentName}
        open={openDetailQuestions}
        onCancel={() => {
          setSelectedStudentQuestions([]);
          setSelectedStudentName("");
          setOpenDetailQuestions(false);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setSelectedStudentQuestions([]);
              setSelectedStudentName("");
              setOpenDetailQuestions(false);
            }}
          >
            Hủy
          </Button>,
        ]}
        width={"85%"}
        style={{ zIndex: "10000000000" }}
      >
        {isLoadingStudentQuestions ? (
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
            {selectedStudentQuestions?.length > 0 && (
              <>
                <h3>{"Danh sách câu trả lời của bạn " + selectedStudentName}</h3>
                <List
                  style={{ maxHeight: "70vh", overflowY: "auto", padding: "10px" }}
                  itemLayout="horizontal"
                  dataSource={selectedStudentQuestions || []}
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
                            width: 50,
                            height: 50,
                            marginRight: "15px",
                            backgroundColor: "#f0f0f0",
                          }}
                          icon={<QuestionCircleOutlined />}
                        />
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ fontSize: 16 }}>
                            Câu hỏi:{" "}
                            <div
                              dangerouslySetInnerHTML={{
                                __html: item.question?.text || "Không tìm thấy câu hỏi",
                              }}
                            />
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 14 }}>
                            Câu trả lời: {item?.text}
                          </Text>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              </>
            )}
            {selectedStudentQuestions?.length === 0 && (
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
          </>
        )}
      </Modal>
    </div>
  );
};

QuestionCreateComponent.propTypes = {
  teacherId: PropTypes.number,
  classID: PropTypes.number,
  teachers: PropTypes.array,
  classes: PropTypes.array,
  questionList: PropTypes.array.isRequired,
  setQuestionList: PropTypes.func.isRequired,
};

export default QuestionCreateComponent;
