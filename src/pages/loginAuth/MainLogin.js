import React, { useState, useEffect } from "react";
import { Button, Layout, Typography, Space, Spin } from "antd";
import {
  UserOutlined,
  BookOutlined,
  PlayCircleOutlined,
  WhatsAppOutlined,
  MessageOutlined,
  GlobalOutlined,
  HomeOutlined,
  FacebookFilled,
} from "@ant-design/icons";
import { colors } from "assets/theme/color";
import { useNavigate } from "react-router-dom";
import Logo from "assets/images/logos/logo.png";
import contentPageService from "services/contentpageService";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function MainLogin() {
  // State for animations
  const [fadeIn, setFadeIn] = useState(false);
  const [buttonHover, setButtonHover] = useState({ student: false, teacher: false });
  const [linkHover, setLinkHover] = useState(false);
  const [videoHover, setVideoHover] = useState(false);
  const [socialHover, setSocialHover] = useState({
    facebook: false,
    zalo: false,
    global: false,
  });
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [contentData, setContentData] = useState(null);

  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const data = await contentPageService.getAllContentPages();
        setContentData(data[0]); // Lấy phần tử đầu tiên từ danh sách
      } catch (error) {
        console.error("Error fetching content page data:", error);
      }
    };
    fetchContentData();
  }, []);

  // Fade-in effect on page load
  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Navigation handlers
  const navigateToStudentLogin = () => {
    navigate("/login/student");
  };

  const navigateToTeacherLogin = () => {
    navigate("/login/teacher");
  };
  const navigateToAdminLogin = () => {
    navigate("/login/admin");
  };

  // Animations keyframes CSS
  const gradientKeyframes = `
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;
  const floatingKeyframes = `
    @keyframes floating {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
  `;

  const shimmerKeyframes = `
    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
  `;

  const rotateKeyframes = `
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  const pulseKeyframes = `
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;

  // Check if mobile view
  const isMobile = windowWidth < 768;

  return (
    <>
      <style>
        {gradientKeyframes}
        {floatingKeyframes}
        {shimmerKeyframes}
        {rotateKeyframes}
        {pulseKeyframes}
      </style>
      <Layout
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #c5e8d5, #e0f2e9, #d0eee0)",
          backgroundSize: "400% 400%",
          animation: "gradient 10s ease infinite",
          transition: "all 1.5s ease",
          opacity: fadeIn ? 1 : 0,
        }}
      >
        <Header
          style={{
            background: "linear-gradient(90deg, #68c183, #79c796, #68c183)",
            backgroundSize: "200% 200%",
            animation: "gradient 8s ease infinite",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            boxShadow: "0 2px 15px rgba(0, 0, 0, 0.1)",
            height: "50px",
            lineHeight: "50px",
            transition: "all 0.3s ease",
          }}
        >
          <div />
          <div style={{ color: "white" }}>
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
              style={{
                backgroundColor: "#368A68",
                borderColor: "#368A68",
                color: "white",
                fontWeight: "bold",
                height: "80%",
              }}
            >
              Home Page
            </Button>
          </div>
        </Header>

        <Content
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.8s ease",
            transform: fadeIn ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {/* Two-column layout container */}
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {/* Left column - Login Section */}
            <div
              style={{
                flex: "1",
                width: isMobile ? "100%" : "45%",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                order: isMobile ? 1 : 0,
              }}
            >
              {/* Logo */}
              <div
                style={{
                  marginTop: "20px",
                  marginBottom: "20px",
                  animation: "floating 3s ease-in-out infinite",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    background: "linear-gradient(145deg, #4CAF50, #66BB6A)",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    fontSize: "40px",
                    boxShadow: "0 10px 20px rgba(76, 175, 80, 0.3)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={Logo}
                    alt="Happy Class Logo"
                    style={{ width: "100%", height: "100%" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "-50%",
                      left: "-50%",
                      right: "-50%",
                      bottom: "-50%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                      animation: "shimmer 4s infinite",
                      transform: "rotate(30deg)",
                    }}
                  />
                </div>
              </div>

              {/* Title */}
              <Title
                style={{
                  color: "#2e7d32",
                  textAlign: "center",
                  marginBottom: "30px",
                  textShadow: "1px 2px 4px rgba(0, 0, 0, 0.1)",
                  animation: "fadeIn 1.5s ease-out",
                  background: `linear-gradient(135deg, ${colors.deepGreen} 0%, ${colors.lightGreen} 100%)`,
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmer 8s linear infinite",
                }}
              >
                {contentData?.homepageMainTitle}
              </Title>

              {/* Login Buttons */}
              <Space
                direction="vertical"
                size="large"
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  transition: "all 0.3s ease",
                  transform: fadeIn ? "scale(1)" : "scale(0.95)",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<UserOutlined />}
                  onClick={navigateToStudentLogin}
                  onMouseEnter={() => setButtonHover({ ...buttonHover, student: true })}
                  onMouseLeave={() => setButtonHover({ ...buttonHover, student: false })}
                  style={{
                    height: "54px",
                    borderRadius: "30px",
                    background: buttonHover.student
                      ? "linear-gradient(90deg, #66BB6A, #81C784)"
                      : "linear-gradient(90deg, #81C784, #66BB6A)",
                    borderColor: "#66BB6A",
                    fontSize: "16px",
                    boxShadow: buttonHover.student
                      ? "0 6px 15px rgba(102, 187, 106, 0.4)"
                      : "0 4px 10px rgba(102, 187, 106, 0.3)",
                    width: "100%",
                    transition: "all 0.3s ease",
                    transform: buttonHover.student ? "translateY(-3px)" : "translateY(0)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ position: "relative", zIndex: 2 }}>Login for Students</span>
                  <div
                    style={{
                      position: "absolute",
                      top: "-50%",
                      left: "-50%",
                      right: "-50%",
                      bottom: "-50%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                      animation: buttonHover.student ? "shimmer 1.5s infinite" : "none",
                      transform: "rotate(30deg)",
                      zIndex: 1,
                    }}
                  />
                </Button>

                <Button
                  type="primary"
                  size="large"
                  icon={<BookOutlined />}
                  onClick={navigateToTeacherLogin}
                  onMouseEnter={() => setButtonHover({ ...buttonHover, teacher: true })}
                  onMouseLeave={() => setButtonHover({ ...buttonHover, teacher: false })}
                  style={{
                    height: "54px",
                    borderRadius: "30px",
                    background: buttonHover.teacher
                      ? "linear-gradient(90deg, #43A047, #4CAF50)"
                      : "linear-gradient(90deg, #4CAF50, #43A047)",
                    borderColor: "#43A047",
                    fontSize: "16px",
                    boxShadow: buttonHover.teacher
                      ? "0 6px 15px rgba(67, 160, 71, 0.4)"
                      : "0 4px 10px rgba(67, 160, 71, 0.3)",
                    width: "100%",
                    transition: "all 0.3s ease",
                    transform: buttonHover.teacher ? "translateY(-3px)" : "translateY(0)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ position: "relative", zIndex: 2 }}>Login for Teachers</span>
                  <div
                    style={{
                      position: "absolute",
                      top: "-50%",
                      left: "-50%",
                      right: "-50%",
                      bottom: "-50%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                      animation: buttonHover.teacher ? "shimmer 1.5s infinite" : "none",
                      transform: "rotate(30deg)",
                      zIndex: 1,
                    }}
                  />
                </Button>
              </Space>

              {/* Already have account text */}
            </div>

            {/* Right column - Video Section */}
            <div
              style={{
                flex: "1",
                width: isMobile ? "100%" : "45%",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                order: isMobile ? 2 : 1,
              }}
            >
              {/* Video Container */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  background: "linear-gradient(145deg, #5c9f6d, #4c8d5d)",
                  borderRadius: "15px",
                  padding: "15px",
                  boxShadow: "0 10px 25px rgba(76, 141, 93, 0.25)",
                  transition: "all 0.3s ease",
                  transform: fadeIn ? "translateY(0)" : "translateY(20px)",
                  opacity: fadeIn ? 1 : 0,
                }}
              >
                <div
                  style={{
                    color: "white",
                    textAlign: "center",
                    padding: "10px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                  }}
                >
                  Learn Happy, Study Smarter,{" "}
                  <span style={{ color: colors.accent }}>Not Harder</span>
                </div>

                <div
                  style={{
                    width: "100%",
                    position: "relative",
                    cursor: "pointer",
                    background: "#f5f5f5",
                    aspectRatio: "16/9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: "8px",
                    boxShadow: videoHover
                      ? "0 6px 20px rgba(0, 0, 0, 0.15)"
                      : "0 4px 10px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    transform: videoHover ? "scale(1.02)" : "scale(1)",
                  }}
                  onMouseEnter={() => setVideoHover(true)}
                  onMouseLeave={() => setVideoHover(false)}
                >
                  {/* <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(45deg, #e6e6e6, #f5f5f5)",
                      position: "absolute",
                    }}
                  />
                  <PlayCircleOutlined
                    style={{
                      position: "absolute",
                      fontSize: "70px",
                      color: "#4CAF50",
                      opacity: videoHover ? "0.9" : "0.7",
                      transition: "all 0.3s ease",
                      transform: videoHover ? "scale(1.1)" : "scale(1)",
                      filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))",
                      animation: videoHover ? "pulse 1.5s infinite" : "none",
                    }}
                  /> */}
                  <iframe
                    width="560"
                    height="315"
                    src="https://www.youtube.com/embed/wLuZ0WMyr9U?si=BfWoYYpHY5vPUUUl"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                  ></iframe>
                </div>

                <div
                  style={{
                    width: "100%",
                    color: "white",
                    textAlign: "center",
                    padding: "10px",
                    fontSize: "14px",
                    opacity: "0.9",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform: linkHover ? "translateY(-3px)" : "translateY(0)",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                    textDecoration: linkHover ? "underline" : "none",
                  }}
                  onMouseEnter={() => setLinkHover(true)}
                  onMouseLeave={() => setLinkHover(false)}
                  onClick={() => window.open("https://www.youtube.com/watch?v=4CCGI83vOVo")}
                >
                  Click to see details video!
                </div>
              </div>
            </div>
          </div>
        </Content>

        {/* Social Media Icons */}
        <div
          style={{
            position: "fixed",
            right: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              background: socialHover.facebook
                ? "linear-gradient(145deg, #166FE5, #1877F2)"
                : "linear-gradient(145deg, #1877F2, #166FE5)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              boxShadow: socialHover.facebook
                ? "0 6px 15px rgba(24, 119, 242, 0.4)"
                : "0 4px 10px rgba(24, 119, 242, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: socialHover.facebook ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0deg)",
            }}
            onMouseEnter={() => setSocialHover({ ...socialHover, facebook: true })}
            onMouseLeave={() => setSocialHover({ ...socialHover, facebook: false })}
          >
            {<FacebookFilled style={{ fontSize: "24px" }} />}
          </div>

          <div
            style={{
              width: "50px",
              height: "50px",
              background: socialHover.zalo
                ? "linear-gradient(145deg, #0077EE, #0088FF)"
                : "linear-gradient(145deg, #0088FF, #0077EE)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              boxShadow: socialHover.zalo
                ? "0 6px 15px rgba(0, 136, 255, 0.4)"
                : "0 4px 10px rgba(0, 136, 255, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: socialHover.zalo ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0deg)",
            }}
            onMouseEnter={() => setSocialHover({ ...socialHover, zalo: true })}
            onMouseLeave={() => setSocialHover({ ...socialHover, zalo: false })}
          >
            {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="30"
                height="30"
                viewBox="0,0,256,256"
              >
                <g
                  fill="#ffffff"
                  //   fill-rule="nonzero"
                  //   stroke="none"
                  //   stroke-width="1"
                  //   stroke-linecap="butt"
                  //   stroke-linejoin="miter"
                  //   stroke-miterlimit="10"
                  //   stroke-dasharray=""
                  //   stroke-dashoffset="0"
                  //   font-family="none"
                  //   font-weight="none"
                  //   font-size="none"
                  //   text-anchor="none"
                  style={{ mixBlendMode: "normal" }}
                >
                  <g transform="scale(5.12,5.12)">
                    <path d="M9,4c-2.74952,0 -5,2.25048 -5,5v32c0,2.74952 2.25048,5 5,5h32c2.74952,0 5,-2.25048 5,-5v-32c0,-2.74952 -2.25048,-5 -5,-5zM9,6h6.58008c-3.57109,3.71569 -5.58008,8.51808 -5.58008,13.5c0,5.16 2.11016,10.09984 5.91016,13.83984c0.12,0.21 0.21977,1.23969 -0.24023,2.42969c-0.29,0.75 -0.87023,1.72961 -1.99023,2.09961c-0.43,0.14 -0.70969,0.56172 -0.67969,1.01172c0.03,0.45 0.36078,0.82992 0.80078,0.91992c2.87,0.57 4.72852,-0.2907 6.22852,-0.9707c1.35,-0.62 2.24133,-1.04047 3.61133,-0.48047c2.8,1.09 5.77938,1.65039 8.85938,1.65039c4.09369,0 8.03146,-0.99927 11.5,-2.88672v3.88672c0,1.66848 -1.33152,3 -3,3h-32c-1.66848,0 -3,-1.33152 -3,-3v-32c0,-1.66848 1.33152,-3 3,-3zM33,15c0.55,0 1,0.45 1,1v9c0,0.55 -0.45,1 -1,1c-0.55,0 -1,-0.45 -1,-1v-9c0,-0.55 0.45,-1 1,-1zM18,16h5c0.36,0 0.70086,0.19953 0.88086,0.51953c0.17,0.31 0.15875,0.69977 -0.03125,1.00977l-4.04883,6.4707h3.19922c0.55,0 1,0.45 1,1c0,0.55 -0.45,1 -1,1h-5c-0.36,0 -0.70086,-0.19953 -0.88086,-0.51953c-0.17,-0.31 -0.15875,-0.69977 0.03125,-1.00977l4.04883,-6.4707h-3.19922c-0.55,0 -1,-0.45 -1,-1c0,-0.55 0.45,-1 1,-1zM27.5,19c0.61,0 1.17945,0.16922 1.68945,0.44922c0.18,-0.26 0.46055,-0.44922 0.81055,-0.44922c0.55,0 1,0.45 1,1v5c0,0.55 -0.45,1 -1,1c-0.35,0 -0.63055,-0.18922 -0.81055,-0.44922c-0.51,0.28 -1.07945,0.44922 -1.68945,0.44922c-1.93,0 -3.5,-1.57 -3.5,-3.5c0,-1.93 1.57,-3.5 3.5,-3.5zM38.5,19c1.93,0 3.5,1.57 3.5,3.5c0,1.93 -1.57,3.5 -3.5,3.5c-1.93,0 -3.5,-1.57 -3.5,-3.5c0,-1.93 1.57,-3.5 3.5,-3.5zM27.5,21c-0.10375,0 -0.20498,0.01131 -0.30273,0.03125c-0.19551,0.03988 -0.37754,0.11691 -0.53711,0.22461c-0.15957,0.1077 -0.2966,0.24473 -0.4043,0.4043c-0.10769,0.15957 -0.18473,0.3416 -0.22461,0.53711c-0.01994,0.09775 -0.03125,0.19898 -0.03125,0.30273c0,0.10375 0.01131,0.20498 0.03125,0.30273c0.01994,0.09775 0.04805,0.19149 0.08594,0.28125c0.03789,0.08977 0.08482,0.17607 0.13867,0.25586c0.05385,0.07979 0.11578,0.15289 0.18359,0.2207c0.06781,0.06781 0.14092,0.12975 0.2207,0.18359c0.15957,0.10769 0.3416,0.18473 0.53711,0.22461c0.09775,0.01994 0.19898,0.03125 0.30273,0.03125c0.10375,0 0.20498,-0.01131 0.30273,-0.03125c0.68428,-0.13959 1.19727,-0.7425 1.19727,-1.46875c0,-0.83 -0.67,-1.5 -1.5,-1.5zM38.5,21c-0.10375,0 -0.20498,0.01131 -0.30273,0.03125c-0.09775,0.01994 -0.19149,0.04805 -0.28125,0.08594c-0.08977,0.03789 -0.17607,0.08482 -0.25586,0.13867c-0.07979,0.05385 -0.15289,0.11578 -0.2207,0.18359c-0.13562,0.13563 -0.24648,0.29703 -0.32227,0.47656c-0.03789,0.08976 -0.066,0.1835 -0.08594,0.28125c-0.01994,0.09775 -0.03125,0.19898 -0.03125,0.30273c0,0.10375 0.01131,0.20498 0.03125,0.30273c0.01994,0.09775 0.04805,0.19149 0.08594,0.28125c0.03789,0.08977 0.08482,0.17607 0.13867,0.25586c0.05385,0.07979 0.11578,0.15289 0.18359,0.2207c0.06781,0.06781 0.14092,0.12975 0.2207,0.18359c0.07979,0.05385 0.16609,0.10078 0.25586,0.13867c0.08976,0.03789 0.1835,0.066 0.28125,0.08594c0.09775,0.01994 0.19898,0.03125 0.30273,0.03125c0.10375,0 0.20498,-0.01131 0.30273,-0.03125c0.68428,-0.13959 1.19727,-0.7425 1.19727,-1.46875c0,-0.83 -0.67,-1.5 -1.5,-1.5z"></path>
                  </g>
                </g>
              </svg>
            }
          </div>

          {/* <div
            style={{
              width: "50px",
              height: "50px",
              background: socialHover.global
                ? "linear-gradient(145deg, #4CAF50, #66BB6A)"
                : "linear-gradient(145deg, #66BB6A, #4CAF50)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "24px",
              boxShadow: socialHover.global
                ? "0 6px 15px rgba(76, 175, 80, 0.4)"
                : "0 4px 10px rgba(76, 175, 80, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              transform: socialHover.global ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0deg)",
            }}
            onMouseEnter={() => setSocialHover({ ...socialHover, global: true })}
            onMouseLeave={() => setSocialHover({ ...socialHover, global: false })}
          >
            <GlobalOutlined />
          </div> */}
        </div>

        {/* Decorative Elements with Animation */}
        {!isMobile && (
          <>
            <div
              style={{
                position: "absolute",
                left: "5%",
                bottom: "10%",
                fontSize: "80px",
                opacity: "0.4",
                zIndex: 0,
                animation: "floating 5s ease-in-out infinite",
                transition: "all 0.3s ease",
              }}
            >
              🚀
            </div>

            <div
              style={{
                position: "absolute",
                right: "5%",
                top: "30%",
                fontSize: "80px",
                opacity: "0.4",
                zIndex: 0,
                animation: "floating 4s ease-in-out infinite 1s",
                transition: "all 0.3s ease",
              }}
            >
              📚
            </div>

            <div
              style={{
                position: "absolute",
                left: "15%",
                top: "20%",
                fontSize: "80px",
                opacity: "0.4",
                zIndex: 0,
                animation: "floating 6s ease-in-out infinite 0.5s",
                transition: "all 0.3s ease",
              }}
            >
              🎓
            </div>
          </>
        )}
      </Layout>
    </>
  );
}
