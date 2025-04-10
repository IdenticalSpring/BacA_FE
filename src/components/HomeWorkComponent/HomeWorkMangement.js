import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { colors } from "assets/theme/color";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
const { Title } = Typography;
const { Option } = Select;
import PropTypes from "prop-types";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ReadOutlined,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import homeWorkService from "services/homeWorkService";
import TextArea from "antd/es/input/TextArea";
import axios from "axios";
import lessonByScheduleService from "services/lessonByScheduleService";
import notificationService from "services/notificationService";
import user_notificationService from "services/user_notificationService";
import classService from "services/classService";
const { Text } = Typography;
const genderOptions = [
  { label: "Giọng nam", value: 1 },
  { label: "Giọng nữ", value: 0 },
];
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
Quill.register(AudioBlot);
export default function HomeWorkMangement({
  toolbar,
  quillFormats,
  levels,
  isMobile,
  setModalUpdateHomeWorkVisible,
  setEditingHomeWork,
  modalUpdateHomeWorkVisible,
  editingHomeWork,
  loading,
  homeWorks,
  setHomeWorks,
  setLoadingTTSForUpdateHomeWork,
  loadingTTSForUpdateHomeWork,
  teacherId,
  level,
  lessonByScheduleData,
  daysOfWeek,
  setLessonByScheduleData,
  classID,
  students,
}) {
  const [form] = Form.useForm();
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [gender, setGender] = useState(1);
  const [openSend, setOpenSend] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedHomeWorkId, setSelectedHomeWorkId] = useState(null);
  const [showAccessId, setShowAccessId] = useState(false);
  const [accessId, setAccessId] = useState("");
  const [loadingClass, setLoadingClass] = useState(false);
  const homeworkLink = "https://happyclass.com.vn/do-homework";
  const [copySuccess, setCopySuccess] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(homeworkLink).then(() => {
      setCopySuccess(true);
      message.success("Copied to clipboard!"); // Hiển thị thông báo

      // Reset hiệu ứng sau 2 giây
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };
  const onChangeGender = ({ target: { value } }) => {
    console.log("radio3 checked", value);
    setGender(value);
  };
  const handleDelete = async (id) => {
    try {
      await homeWorkService.deleteHomeWork(id);
      setHomeWorks(homeWorks.filter((homeWork) => homeWork.id !== id));
      message.success("Homework deleted successfully");
    } catch (err) {
      message.error("Error deleting homework!");
    }
  };
  const handleEdit = (homeWork) => {
    setEditingHomeWork(homeWork);
    setSelectedHomeWorkId(homeWork?.id);
    form.setFieldsValue({
      title: homeWork.title,
      linkYoutube: homeWork.linkYoutube,
      linkGame: homeWork.linkGame,
      linkZalo: homeWork.linkZalo,
      linkSpeech: homeWork.linkSpeech,
      // description: homeWork.description,
    });
    // if (quill && homeWork?.description) {
    //   setTimeout(() => {
    //     quill.clipboard.dangerouslyPasteHTML(0, homeWork.description);
    //   }, 1000);
    // }
    setMp3Url(homeWork.linkSpeech);
    setModalUpdateHomeWorkVisible(true);
  };
  // console.log(textToSpeech);
  useEffect(() => {
    if (
      modalUpdateHomeWorkVisible &&
      quillRef.current?.getEditor() &&
      editingHomeWork?.description
    ) {
      // Thêm delay nhẹ để chắc chắn editor đã render xong
      setTimeout(() => {
        quillRef.current?.getEditor().setContents([]); // reset
        quillRef.current
          ?.getEditor()
          .clipboard.dangerouslyPasteHTML(0, editingHomeWork.description);
      }, 100); // thử 100ms nếu 0ms chưa đủ
    }
  }, [modalUpdateHomeWorkVisible, editingHomeWork, quillRef.current?.getEditor()]);
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) {
      return;
    }
    setLoadingTTSForUpdateHomeWork(true);

    try {
      const response = await homeWorkService.textToSpeech({ textToSpeech, gender });

      let base64String = response;

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
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTSForUpdateHomeWork(false);
  };
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
  useEffect(() => {
    const fetchClass = async () => {
      try {
        setLoadingClass(true);
        const data = await classService.getClassById(classID);
        setAccessId(data?.accessId);
      } catch (err) {
        setAccessId(err);
      } finally {
        setLoadingClass(false);
      }
    };
    fetchClass();
  }, [classID]);
  const handleSave = async () => {
    try {
      setLoadingUpdate(true);
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("level", level);
      formData.append("linkYoutube", values.linkYoutube);
      formData.append("linkGame", values.linkGame);
      formData.append("linkZalo", values.linkZalo);
      formData.append("description", quillRef.current?.getEditor()?.root?.innerHTML || "");
      formData.append("teacherId", teacherId);

      // Nếu có mp3Url thì fetch dữ liệu và append vào formData
      if (mp3file) {
        formData.append("mp3File", new File([mp3file], "audio.mp3", { type: "audio/mp3" }));
      }
      if (editingHomeWork) {
        const HomeWorkdata = await homeWorkService.editHomeWork(editingHomeWork.id, formData);
        setHomeWorks(
          homeWorks?.map((homeWork) =>
            homeWork.id === editingHomeWork.id ? { ...homeWork, ...HomeWorkdata } : homeWork
          )
        );
        message.success("HomeWork updated successfully");
      }
      setModalUpdateHomeWorkVisible(false);
      form.resetFields();
      setEditingHomeWork(null);
      setTextToSpeech("");
      setMp3file(null);
      setMp3Url("");
    } catch (err) {
      message.error("Please check your input and try again" + err);
    } finally {
      setLoadingUpdate(false);
    }
  };
  const handleUpdateSendingHomeworkStatus = async (id) => {
    setLoadingSchedule(true);
    try {
      const response = await lessonByScheduleService.updateSendingHomeworkStatus(id, true);
      console.log("Update response:", response);
      const lessonByScheduleDataUpdated = lessonByScheduleData?.map((item) => {
        if (item?.id === id) {
          return { ...item, isHomeWorkSent: true };
        }
        return item;
      });
      setLessonByScheduleData(lessonByScheduleDataUpdated);
      let detailStr = "Bạn mới có bài tập mới vào ngày:";
      // console.log(data);
      const date = lessonByScheduleDataUpdated.find((item) => item?.id === id)?.date || null;
      // console.log(lessonByScheduleDataUpdated.find((item) => item.id === id));

      detailStr +=
        " " +
          (date &&
            new Date(date).toLocaleDateString("vi-VN", {
              timeZone: "UTC",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })) || "Không có ngày";
      const notificationData = {
        title: "Bài tập mới",
        general: false,
        classID: classID,
        detail: detailStr,
        createdAt: new Date(),
      };
      const notificationRes = await notificationService.createNotification(notificationData);
      const userNotificationCreate = students.forEach(async (element) => {
        const userNotificationData = {
          status: false,
          notificationID: notificationRes?.id,
          studentID: element?.id,
        };
        const userNotificationRes = await user_notificationService.createUserNotification(
          userNotificationData
        );
      });

      message.success("Gửi bài tập thành công!");
      setShowAccessId(true);
      // setOpenSend(false);
    } catch (error) {
      console.error("Error updating sending homework status:", error);
      message.error("Có lỗi xảy ra trong quá trình gửi bài tập" + error);
    } finally {
      setLoadingSchedule(false);
    }
  };
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      setQuill(editor);
    }
  }, [quillRef]);
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      // console.log([...formData]);

      try {
        const response = await axios.post(
          process.env.REACT_APP_API_BASE_URL + "/upload/cloudinary",
          formData
        );
        console.log(response.data.url);

        // const result = await response.json();

        if (response.status === 201 && quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, "image", response.data.url);
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
          const range = editor.getSelection(true);
          const audioUrl = response?.data?.url;

          // 👇 Đây là điểm quan trọng: insertEmbed với blot 'audio'
          editor.insertEmbed(range.index, "audio", audioUrl, "user");
          editor.setSelection(range.index + 1); // move cursor
        } else {
          message.error("Upload failed. Try again!");
        }
      } catch (error) {
        console.error("Error uploading audio:", error);
        message.error("Upload error. Please try again!");
      }
    };
  }, []);
  const modules = {
    toolbar: {
      container: toolbar,
      handlers: {
        image: imageHandler,
      },
    },
  };

  const columns = [
    {
      title: "Tiêu đề bài tập",
      dataIndex: "title",
      key: "title",
      width: "20%",
    },
    // {
    //   title: "Cấp độ",
    //   dataIndex: "level",
    //   key: "level",
    //   width: "15%",
    //   render: (text) => levels?.find((level) => level.id === text)?.name,
    // },
    {
      title: "Link Youtube bài tập",
      dataIndex: "linkYoutube",
      key: "linkYoutube",
      width: "20%",
      render: (text) => (
        <Typography.Text
          ellipsis={{ tooltip: text }}
          style={{ textOverflow: "ellipsis", maxWidth: "100px" }}
        >
          {text}
        </Typography.Text>
      ),
    },
    {
      title: "Link Game bài tập",
      dataIndex: "linkGame",
      key: "linkGame",
      width: "20%",
      render: (text) => (
        <Typography.Text
          ellipsis={{ tooltip: text }}
          style={{ textOverflow: "ellipsis", maxWidth: "100px" }}
        >
          {text}
        </Typography.Text>
      ),
    },
    {
      title: "Link Zalo bài tập",
      dataIndex: "linkZalo",
      key: "linkZalo",
      width: "20%",
      render: (text) => (
        <Typography.Text
          ellipsis={{ tooltip: text }}
          style={{ textOverflow: "ellipsis", maxWidth: "100px" }}
        >
          {text}
        </Typography.Text>
      ),
    },
    // {
    //   title: "Link Speech bài tập",
    //   dataIndex: "linkSpeech",
    //   key: "linkSpeech",
    //   width: "20%",
    //   render: (text) => (
    //     <Typography.Text
    //       ellipsis={{ tooltip: text }}
    //       style={{ textOverflow: "ellipsis", maxWidth: "100px" }}
    //     >
    //       {text}
    //     </Typography.Text>
    //   ),
    // },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (text) => (
        <Typography.Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
          style={{ textOverflow: "ellipsis", maxWidth: "100px", width: "100px" }}
        >
          {text?.replace(/<[^>]*>?/gm, "") || ""}
        </Typography.Paragraph>
      ),
    },
    {
      title: "Ngày học",
      dataIndex: "id",
      key: "id",
      width: "25%",
      render: (text) => {
        const date = lessonByScheduleData?.filter((item) => item.homeWorkId === text)[0]?.date;
        // console.log(lessonByScheduleData.filter((item) => item.lessonID === text));

        return (
          <p>
            {(date &&
              new Date(date).toLocaleDateString("vi-VN", {
                timeZone: "UTC",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })) ||
              "Không có ngày"}
          </p>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "id",
      key: "id",
      width: "10%",
      render: (text) => {
        // console.log(text);

        const length = lessonByScheduleData.filter((item) => item.homeWorkId === text).length;
        const isSentLength = lessonByScheduleData.filter(
          (item) => item.homeWorkId === text && item.isHomeWorkSent === true
        ).length;
        // console.log(length, isSentLength);

        return (
          <Tag
            color={isSentLength === 0 ? "red" : isSentLength === length ? "green" : "yellow"}
            style={{ fontSize: 14, fontWeight: 600, padding: "5px 10px" }}
          >
            {isSentLength === 0 ? (
              <>
                <CloseCircleOutlined style={{ marginRight: 5 }} />
                Chưa giao
              </>
            ) : isSentLength === length ? (
              <>
                <CheckCircleOutlined style={{ marginRight: 5 }} />
                Đã giao
              </>
            ) : (
              <>
                <SyncOutlined style={{ marginRight: 5 }} />
                Đang giao
              </>
            )}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: "20%",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{
              backgroundColor: colors.deepGreen,
              borderColor: colors.deepGreen,
            }}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa bài tập này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{
              style: { backgroundColor: colors.errorRed, borderColor: colors.errorRed },
            }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  // console.log(mp3Url == true);

  return (
    <div style={{ padding: "14px" }}>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px " + colors.softShadow,
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <Title level={4} style={{ margin: 0, color: colors.darkGreen }}>
            Quản lý bài tập
          </Title>
        </div>

        <Table
          dataSource={homeWorks}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 4 }}
          style={{ borderRadius: "8px", overflow: "hidden" }}
          onRow={(record) => ({
            style: { cursor: "pointer" },
          })}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        centered
        title={editingHomeWork ? "Điều chỉnh bài tập" : "Create New HomeWork"}
        open={modalUpdateHomeWorkVisible}
        onCancel={() => {
          setModalUpdateHomeWorkVisible(false);
          form.resetFields();
          setEditingHomeWork(null);
        }}
        footer={[
          <Button
            style={{ marginTop: isMobile ? "20px" : "" }}
            key="cancel"
            onClick={() => {
              setModalUpdateHomeWorkVisible(false);
              form.resetFields();
              setEditingHomeWork(null);
            }}
          >
            Hủy
          </Button>,
          <Button
            loading={loadingUpdate}
            key="submit"
            type="primary"
            onClick={handleSave}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            {editingHomeWork ? "Lưu" : "Create"}
          </Button>,
          <Button
            loading={loadingSchedule}
            key="submit"
            type="primary"
            onClick={() => {
              // setOpenSend(true);
              const entity = lessonByScheduleData?.find(
                (item) => item.homeWorkId === selectedHomeWorkId
              );
              handleUpdateSendingHomeworkStatus(entity?.id);
            }}
            style={{
              backgroundColor: colors.emerald,
              borderColor: colors.emerald,
            }}
          >
            {"Gửi bài tập"}
          </Button>,
        ]}
        width={720}
      >
        <Form
          form={form}
          layout="vertical"
          name="HomeWorkForm"
          initialValues={{
            title: "",
            level: "",
            linkYoutube: "",
            linkGame: "",
            linkZalo: "",
            description: "",
          }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề bài tập"
            rules={[
              { required: true, message: "Please enter the homework name" },
              { max: 100, message: "Title cannot be longer than 100 characters" },
            ]}
          >
            <Input
              placeholder="Nhập tiêu đề bài tập"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item>
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
          <Form.Item
            // name="description"
            label="Mô tả"
            // rules={[{ required: true, message: "Please enter a description" }]}
          >
            <ReactQuill
              theme="snow"
              modules={modules}
              formats={quillFormats}
              ref={quillRef}
              style={{
                height: "250px",
                marginBottom: "60px", // Consider reducing this
                borderRadius: "6px",
                border: `1px solid ${colors.inputBorder}`,
              }}
            />
          </Form.Item>
          {/* <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: "Please select a level" }]}
          >
            <Select
              placeholder="Select level"
              style={{
                borderRadius: "6px",
              }}
            >
              {levels?.map((level, index) => (
                <Option key={index} value={level.id}>
                  {level.name}
                </Option>
              ))}
            </Select>
          </Form.Item> */}

          <Form.Item label="Văn bản thành giọng nói">
            <TextArea
              value={textToSpeech}
              onChange={(e) => setTextToSpeech(e.target.value)}
              rows={3}
              placeholder="Nhập văn bản để chuyển thành giọng nói"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item>
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
              loading={loadingTTSForUpdateHomeWork}
              style={{
                backgroundColor: colors.deepGreen,
                borderColor: colors.deepGreen,
              }}
            >
              Chuyển thành giọng nói
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
          {/* {
          ||
            (form.getFieldValue("linkSpeech") && (
              <Form.Item>
                <div style={{ marginBottom: "16px" }}>
                  <audio id="audio-player" controls style={{ width: "100%" }}>
                    <source src={form.getFieldValue("linkSpeech")} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </Form.Item>
            ))} */}
          {/* <div style={{ marginBottom: "16px" }}>
            <audio controls style={{ width: "100%" }}>
              <source
                src={
                  "https://res.cloudinary.com/ddd1hxsx0/video/upload/v1742718873/o7o1ouv3el4w72s4rxnc.mp3"
                }
                type="audio/mp3"
              />
              Your browser does not support the audio element.
            </audio>
          </div> */}
          <Form.Item
            name="linkYoutube"
            label="Link Youtube Bài tập"
            // rules={[{ required: true, message: "Please enter the homework link" }]}
          >
            <Input
              placeholder="Nhập link youtube bài tập"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item>
          <Form.Item name="linkGame" label="Link Game bài tập">
            <Input
              placeholder="Nhập link game bài tập"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item>
          <Form.Item name="linkZalo" label="Link Zalo bài tập">
            <Input
              placeholder="Nhập link zalo bài tập"
              style={{
                borderRadius: "6px",
                borderColor: colors.inputBorder,
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Danh sách các lịch học đang sử dụng bài tập này"
        open={openSend}
        onCancel={() => setOpenSend(false)}
        footer={<></>}
        centered
        width={isMobile ? "90%" : "60%"}
        // style={{ display: "flex", justifyContent: "center" }}
      >
        <div
          style={{
            width: "100%",
            // margin: "15px 0",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {lessonByScheduleData?.length > 0 ? (
            lessonByScheduleData?.map((item, index) => {
              return item.homeWorkId === selectedHomeWorkId ? (
                <div
                  key={index}
                  style={{
                    padding: "16px",
                    marginBottom: "12px",
                    border: `1px solid ${colors.lightGreen}`,
                    borderRadius: "8px",
                    backgroundColor: colors.paleGreen,
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isMobile ? "flex-start" : "center",
                    gap: "10px",
                    height: isMobile ? "15%" : "15%",
                    width: "100%",
                    transition: "all 0.3s ease-in-out",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: colors.darkGreen,
                      flex: 1,
                      marginBottom: isMobile ? "10px" : 0,
                    }}
                  >
                    📅 {daysOfWeek[item.schedule.dayOfWeek]} | {item.date} | 🕒{" "}
                    {item.schedule.startTime} - {item.schedule.endTime} |{" "}
                    {/* {homeWorksData.find((hw) => hw.id === item.homeWorkId)?.title} */}
                  </div>
                  <Button
                    disabled={item.isHomeWorkSent}
                    loading={loadingSchedule}
                    onClick={() => {
                      handleUpdateSendingHomeworkStatus(item.id);
                    }}
                  >
                    {item.isHomeWorkSent ? <Text>Đã gửi bài tập</Text> : <Text>Gửi bài tập</Text>}
                  </Button>
                </div>
              ) : null;
            })
          ) : (
            <Text>Không có bài học nào</Text>
          )}
        </div>
      </Modal>
      <Modal
        open={showAccessId}
        onCancel={() => setShowAccessId(false)}
        onClose={() => setShowAccessId(false)}
        footer={<></>}
      >
        {loadingClass ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin />
          </div>
        ) : (
          <Card style={{ maxWidth: "90%", margin: "auto", textAlign: "center" }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <ReadOutlined style={{ fontSize: 32, color: "#1890ff" }} />
              <Text strong style={{ fontSize: 16 }}>
                Mã lớp của bạn là: <Text type="danger">{accessId}</Text>
              </Text>
              <Input value={homeworkLink} readOnly style={{ textAlign: "center", width: "100%" }} />

              {/* Nút Copy với hiệu ứng */}
              <Button
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
                type={copySuccess ? "default" : "primary"}
              >
                {copySuccess ? "Copied!" : "Copy Link bài tập"}
              </Button>
            </Space>
          </Card>
        )}
      </Modal>
    </div>
  );
}
HomeWorkMangement.propTypes = {
  toolbar: PropTypes.array.isRequired,
  quillFormats: PropTypes.array.isRequired,
  levels: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  setModalUpdateHomeWorkVisible: PropTypes.func.isRequired,
  setEditingHomeWork: PropTypes.array.isRequired,
  modalUpdateHomeWorkVisible: PropTypes.bool.isRequired,
  editingHomeWork: PropTypes.array.isRequired,
  homeWorks: PropTypes.array.isRequired,
  setHomeWorks: PropTypes.func.isRequired,
  loadingTTSForUpdateHomeWork: PropTypes.bool.isRequired,
  setLoadingTTSForUpdateHomeWork: PropTypes.func.isRequired,
  teacherId: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  lessonByScheduleData: PropTypes.array.isRequired,
  daysOfWeek: PropTypes.array.isRequired,
  setLessonByScheduleData: PropTypes.func.isRequired,
  classID: PropTypes.number.isRequired,
  students: PropTypes.array.isRequired,
};
