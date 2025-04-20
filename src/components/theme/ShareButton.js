import React from "react";
import { Tooltip } from "antd";
import {
  FacebookFilled,
  YoutubeFilled,
  TwitterOutlined,
  LinkedinFilled,
  InstagramFilled,
  XOutlined,
} from "@ant-design/icons";

const ShareButtons = () => {
  const urlToShare = encodeURIComponent("https://happyclass.com.vn");

  const socialPlatforms = [
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${urlToShare}`,
      icon: <FacebookFilled style={{ fontSize: "18px", color: "#1877F2" }} />,
    },
    {
      name: "X (Twitter)",
      url: `https://twitter.com/intent/tweet?url=${urlToShare}`,
      icon: <XOutlined style={{ fontSize: "18px", color: "#000" }} />,
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${urlToShare}`,
      icon: <LinkedinFilled style={{ fontSize: "18px", color: "#0A66C2" }} />,
    },
    // {
    //   name: "YouTube",
    //   url: "https://www.youtube.com/c/YourChannel",
    //   icon: <YoutubeFilled style={{ fontSize: "18px", color: "#FF0000" }} />,
    // },
    // {
    //   name: "Instagram",
    //   url: "https://instagram.com/?url=${urlToShare}",
    //   icon: <InstagramFilled style={{ fontSize: "18px", color: "#E1306C" }} />,
    // },
  ];

  return (
    <div className="footer-share-section">
      <h3 className="footer-section-title">Share with friends</h3>
      <div className="footer-social-icons">
        {socialPlatforms.map((platform) => (
          <Tooltip key={platform.name} title={platform.name}>
            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-button"
            >
              {platform.icon}
            </a>
          </Tooltip>
        ))}
      </div>

      <style>{`
        .footer-share-section {
          margin-bottom: 20px;
        }

        .footer-section-title {
          color: #ffffff;
          font-size: 18px;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .footer-social-icons {
          display: flex;
          gap: 12px;
        }

        .social-icon-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .social-icon-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ShareButtons;
