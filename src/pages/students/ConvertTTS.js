import { Button, Form, Radio } from "antd";
import TextArea from "antd/es/input/TextArea";
import { colors } from "assets/theme/color";
import React, { useEffect, useState } from "react";
import homeWorkService from "services/homeWorkService";
import PropTypes from "prop-types";
const genderOptions = [
  { label: "Giọng nam", value: 1 },
  { label: "Giọng nữ", value: 0 },
];
export default function ConvertTTS({ audioTag }) {
  const [gender, setGender] = useState(1);
  const [mp3Url, setMp3Url] = useState("");
  const [mp3file, setMp3file] = useState(null);
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loadingTTS, setLoadingTTS] = useState(false);
  const onChangeGender = ({ target: { value } }) => {
    console.log("radio3 checked", value);
    setGender(value);
  };
  const handleConvertToSpeech = async () => {
    if (!textToSpeech) return;
    setLoadingTTS(true);

    try {
      const response = await homeWorkService.textToSpeech({ textToSpeech, gender });
      let base64String = response;

      function base64ToBlob(base64, mimeType) {
        let byteCharacters = atob(base64);
        let byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
      }

      let audioBlob = base64ToBlob(base64String, "audio/mp3");
      setMp3file(audioBlob);

      let audioUrl = URL.createObjectURL(audioBlob);
      setMp3Url(audioUrl);
    } catch (error) {
      console.error("Lỗi chuyển văn bản thành giọng nói:", error);
    }
    setLoadingTTS(false);
  };

  useEffect(() => {
    if (mp3Url) {
      const audioElement = document.getElementById(audioTag);
      if (audioElement) {
        audioElement.src = "";
        audioElement.load();
        audioElement.src = mp3Url;
      }
    }
  }, [mp3Url]);
  return (
    <div>
      <Form.Item>
        <p>Nhập từ vựng muốn nghe để luyện tập:</p>
        <br />
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
          loading={loadingTTS}
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
            <audio id={audioTag} controls style={{ width: "100%" }}>
              <source src={mp3Url} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </Form.Item>
      )}
    </div>
  );
}
ConvertTTS.propTypes = {
  audioTag: PropTypes.string.isRequired,
};
