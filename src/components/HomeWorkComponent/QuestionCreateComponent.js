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
} from "antd";
import {
  DeleteOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
  SwapOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";
import { colors } from "assets/theme/color";
import ReactQuill, { Quill } from "react-quill";
import axios from "axios";

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

  useEffect(() => {
    if (teacherId && classID) {
      form.setFieldsValue({
        teacherID: teacherId.toString(),
        classID: classID.toString(),
        isDelete: false,
      });
    }
  }, [teacherId, classID, form]);

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
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );

        if (response.status === 201 && quillRef.current) {
          const editor = quillRef.current.getEditor();
          if (!editor) return;
          const range = editor.getSelection(true);
          editor.insertEmbed(range?.index ?? editor.getLength(), "image", response.data.url);
          setTimeout(() => {
            const imgs = editor.root.querySelectorAll(`img[src="${response.data.url}"]`);
            imgs.forEach((img) => {
              img.classList.add("ql-image");
            });
          }, 0);
        } else {
          message.error("Upload failed. Try again!");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error("Upload error. Please try again!");
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
            process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
            formData
          );

          if (response.status === 201) {
            const audioUrl = response?.data?.url;
            editor.insertEmbed(currentIndex, "audio", audioUrl, "user");
            currentIndex++;
            editor.setSelection(currentIndex);
          } else {
            message.error(`Upload failed for ${file.name}. Try again!`);
          }
        } catch (error) {
          console.error(`Error uploading audio ${file.name}:`, error);
          message.error(`Upload error for ${file.name}. Please try again!`);
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
      setImageUrl(info.file.response.url);
      setImageLoading(false);
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
          imageUrl: imageUrl || undefined,
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
        setImageUrl("");
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
        setQuestionList(questionList.filter((item) => item.id !== id));
        message.success("Xóa câu hỏi thành công");
      },
    });
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
          <Form.Item name="teacherID" label="Giáo viên" hidden>
            <Input hidden />
          </Form.Item>
          <Form.Item label="Giáo viên">
            <Text strong>{teacherName}</Text>
          </Form.Item>
          <Form.Item
            name="classID"
            label="Lớp học"
            rules={[{ required: true, message: "Vui lòng chọn lớp học" }]}
          >
            <Select
              placeholder="Chọn lớp học"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
              disabled={!!classID}
            >
              <Option value="">Chọn lớp học</Option>
              {classes.map((cls) => (
                <Option key={cls.id} value={cls.id.toString()}>
                  {cls.name || `Class ${cls.id}`}
                </Option>
              ))}
            </Select>
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
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action={process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary"}
              onChange={handleImageUpload}
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
                  {item.class && (
                    <Text type="secondary" style={{ width: "100%", marginLeft: "60px" }}>
                      Lớp: {item.class.name || `Class ${item.class.id}`}
                    </Text>
                  )}
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}
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
