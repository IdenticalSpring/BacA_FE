import React, { useState, useRef, useEffect } from "react";
import { Button, Tooltip } from "antd";
import { PlayCircleOutlined, PauseCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const PlayAudioButton = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio(audioUrl));

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlay = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (isPlaying) audio.pause();
    else audio.play().catch((err) => console.error("Audio play error:", err));
    setIsPlaying(!isPlaying);
  };

  return (
    <Tooltip title="Nghe lại ghi âm">
      <Button
        type="text"
        shape="circle"
        icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        onClick={togglePlay}
        style={{ marginLeft: 8, color: "inherit", opacity: 0.8 }}
      />
    </Tooltip>
  );
};

PlayAudioButton.propTypes = { audioUrl: PropTypes.string.isRequired };
export default React.memo(PlayAudioButton);
