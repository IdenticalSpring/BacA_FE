import React, { useState, useEffect } from "react";
import {
  BookOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
  FileTextOutlined,
  BellOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  MailOutlined,
  PhoneOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  CloseOutlined,
  MenuOutlined,
  UserOutlined,
  ProfileOutlined,
  StarOutlined,
  LikeOutlined,
  UpOutlined,
  DownOutlined,
  LinkOutlined,
  FacebookFilled,
} from "@ant-design/icons";
import StatCard from "components/LandingPageComponent/StatCard";
import FeatureCard from "components/LandingPageComponent/FeatureCard";
import StepCard from "components/LandingPageComponent/StepCard";
import TestimonialCard from "components/LandingPageComponent/TestimonialCard";
import PricingCard from "components/LandingPageComponent/PricingCard";
import FaqItem from "components/LandingPageComponent/FaqItem";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import Logo from "assets/images/logos/logo.png";
import contentPageService from "services/contentpageService";

// Thêm import CSS nếu cần
import "./Homepage.css"; // Tạo file này nếu chưa có
import pagevisitService from "services/pagevisitService";
import ShareButtons from "components/theme/ShareButton";
import sidebarLinkService from "services/sidebarLinkService";
let count = 0;
const ADSENSE_SCRIPT_ID = "happyclass-adsense-homepage";
const ADSENSE_SCRIPT_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1467907056644443";
export default function Homepage() {
  const [visible, setVisible] = useState({
    hero: false,
    features: false,
    statistics: false,
    testimonials: false,
    pricing: false,
    faq: false,
    cta: false,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [socialHover, setSocialHover] = useState({
    facebook: false,
    zalo: false,
    global: false,
  });
  const [contentData, setContentData] = useState(null);
  const [homepageLinks, setHomepageLinks] = useState([]);
  const [floatingLinks, setFloatingLinks] = useState([]);
  const [showFloatingLinks, setShowFloatingLinks] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const navigate = useNavigate();
  const [buttonHover, setButtonHover] = useState({
    student: false,
    teacher: false,
    teacherSignUp: false,
  });
  const [selectLanguageClick, setSelectLanguageClick] = useState(false);
  const containerStyle = {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const cardStyle = {
    border: "1px solid #e8e8e8",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    overflow: "hidden",
  };

  const sloganBoxStyle = {
    border: "1px solid #e8e8e8",
    borderRadius: "8px",
    padding: "12px 20px",
    textAlign: "center",
    margin: "15px 0",
  };

  const textBoxStyle = {
    position: "relative",
    border: "1px solid #e8e8e8",
    borderRadius: "8px",
    padding: "6px 12px",
    background: "white",
    fontSize: "14px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    display: "inline-block",
  };

  const videoContainerStyle = {
    border: "1px solid #e8e8e8",
    borderRadius: "8px",
    padding: "15px",
    height: "250px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "20px",
  };

  const characterContainerStyle = {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    margin: "20px 0",
  };

  const iframeStyle = {
    width: "100%",
    height: "100%",
    border: "none",
  };
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
  const navigateToStudentLogin = () => {
    navigate("/do-homework");
  };

  const navigateToTeacherLogin = () => {
    navigate("/login/teacher");
  };
  // Determine if we should show mobile or desktop layout
  const isMobile = window.innerWidth < 1150;
  useEffect(() => {
    if (document.getElementById(ADSENSE_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.src = ADSENSE_SCRIPT_SRC;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

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

  // Fetch homepage links (type 3) and floating links (type 2)
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const data = await sidebarLinkService.getAllSidebars();
        setHomepageLinks(data.filter((link) => link.type === 3));
        setFloatingLinks(data.filter((link) => link.type === 2));
      } catch (error) {
        console.error("Error fetching links:", error);
      }
    };
    fetchLinks();
  }, []);

  // Increment visit count when Homepage is loaded
  useEffect(() => {
    const incrementPageVisit = async () => {
      try {
        await pagevisitService.incrementVisit();
        console.log("Visit incremented successfully");
      } catch (error) {
        console.error("Error incrementing visit:", error);
      }
    };
    incrementPageVisit();
  }, []); // Mảng rỗng để chỉ chạy một lần khi component mount

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY + 100; // Offset for header height
      let currentSection = "#home";

      for (const link of homepageLinks) {
        if (link.link && link.link.startsWith("#")) {
          const sectionId = link.link.replace("#", "");
          const element = document.getElementById(sectionId);
          if (element && element.offsetTop <= currentScrollPos) {
            currentSection = link.link;
          }
        }
      }

      // If reached the bottom of the page, activate the last internal link
      if (window.innerHeight + Math.round(window.scrollY) >= document.body.offsetHeight - 50) {
        const internalLinks = homepageLinks.filter(l => l.link && l.link.startsWith("#"));
        if (internalLinks.length > 0) {
          currentSection = internalLinks[internalLinks.length - 1].link;
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [homepageLinks]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  useEffect(() => {
    const menu = document.getElementById(":0.container");
    const menu2 = document.getElementById(":2.container");
    console.log("Menu:", menu);

    if (menu) {
      menu.style.display = "none";
    } else {
      console.warn("Không tìm thấy phần tử với id ':0.container'");
    }
    if (menu2) {
      menu2.style.display = "none";
    } else {
      console.warn("Không tìm thấy phần tử với id ':2.container'");
    }
    //   const node = document.querySelector(".skiptranslate")?.childNodes.item(0);

    //   if (node?.nodeName === "IFRAME") {
    //     console.log("Node con là iframe");
    //   } else {
    //     console.log("Không phải iframe");
    //   }
  });
  useEffect(() => {
    setVisible({
      hero: true,
      features: false,
      howItWorks: false,
      statistics: false,
      testimonials: false,
      pricing: false,
      faq: false,
      cta: false,
    });

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const width = window.innerWidth;
      // console.log(scrollPosition);

      if (width < 768) {
        if (scrollPosition > 2350) setVisible((prev) => ({ ...prev, features: true }));
        if (scrollPosition > 1500) setVisible((prev) => ({ ...prev, statistics: true }));
        if (scrollPosition > 4400) setVisible((prev) => ({ ...prev, howItWorks: true }));
        if (scrollPosition > 5850) setVisible((prev) => ({ ...prev, testimonials: true }));
        // if (scrollPosition > 7100) setVisible((prev) => ({ ...prev, pricing: true }));
        // if (scrollPosition > 9100) setVisible((prev) => ({ ...prev, faq: true }));
        if (scrollPosition > 7000) setVisible((prev) => ({ ...prev, cta: true }));
      } else {
        if (scrollPosition > 1800) setVisible((prev) => ({ ...prev, features: true }));
        if (scrollPosition > 1500) setVisible((prev) => ({ ...prev, statistics: true }));
        if (scrollPosition > 2750) setVisible((prev) => ({ ...prev, howItWorks: true }));
        if (scrollPosition > 4000) setVisible((prev) => ({ ...prev, testimonials: true }));
        // if (scrollPosition > 4850) setVisible((prev) => ({ ...prev, pricing: true }));
        // if (scrollPosition > 4600) setVisible((prev) => ({ ...prev, faq: true }));
        if (scrollPosition > 4600) setVisible((prev) => ({ ...prev, cta: true }));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const colors = {
    lightGreen: "#8ED1B0",
    deepGreen: "#368A68",
    white: "#FFFFFF",
    gray: "#F5F5F5",
    darkGray: "#333333",
    accent: "#FFD166",
    lightAccent: "#FFEDC2",
    darkGreen: "#224922",
    mediumGray: "#666", // Thêm màu mediumGray đã sử dụng trong footer
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        color: colors.darkGray,
        lineHeight: "1.6",
        overflow: "hidden",
      }}
    >
      <style>
        {gradientKeyframes}
        {floatingKeyframes}
        {shimmerKeyframes}
        {rotateKeyframes}
        {pulseKeyframes}
      </style>
      {/* Header */}
      <header
        style={{
          background: colors.white,
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "fixed",
          width: "100%",
          top: 0,
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={Logo}
            alt="Happy Class Logo"
            style={{ width: "50px", height: "50px", marginRight: "10px" }}
          />
          <h1
            style={{
              color: colors.deepGreen,
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: "bold",
              background: `linear-gradient(135deg, ${colors.deepGreen} 0%, ${colors.lightGreen} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {contentData?.homepageMainTitle}
          </h1>
        </div>

        {windowWidth > 768 ? (
          <>
            <nav>
              <ul
                style={{
                  display: "flex",
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  gap: "2rem",
                }}
              >
                {homepageLinks.map((link) => {
                  const isExternal = link.link && !link.link.startsWith("#");
                  const isActive = activeSection === link.link;
                  return (
                    <li key={link.id}>
                      <a
                        href={link.link}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        style={{
                          color: isActive ? colors.deepGreen : colors.darkGray,
                          textDecoration: "none",
                          fontWeight: isActive ? "bold" : "normal",
                        }}
                      >
                        {link.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Button
                type="primary"
                size="large"
                icon={<BookOutlined />}
                onClick={() => window.open(contentData?.linkTeacherSignUp)}
                onMouseEnter={() => setButtonHover({ ...buttonHover, teacherSignUp: true })}
                onMouseLeave={() => setButtonHover({ ...buttonHover, teacherSignUp: false })}
                style={{
                  height: "54px",
                  borderRadius: "30px",
                  background: buttonHover.teacherSignUp
                    ? "linear-gradient(90deg, #43A047, #4CAF50)"
                    : "linear-gradient(90deg, #4CAF50, #43A047)",
                  borderColor: "#43A047",
                  fontSize: "16px",
                  boxShadow: buttonHover.teacherSignUp
                    ? "0 6px 15px rgba(67, 160, 71, 0.4)"
                    : "0 4px 10px rgba(67, 160, 71, 0.3)",
                  transition: "all 0.3s ease",
                  transform: buttonHover.teacherSignUp ? "translateY(-3px)" : "translateY(0)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span style={{ position: "relative", zIndex: 2 }}>Teacher SignUp</span>
                <div
                  style={{
                    position: "absolute",
                    top: "-50%",
                    left: "-50%",
                    right: "-50%",
                    bottom: "-50%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                    animation: buttonHover.teacherSignUp ? "shimmer 1.5s infinite" : "none",
                    transform: "rotate(30deg)",
                    zIndex: 1,
                  }}
                />
              </Button>
              <div
                id="google_translate_element"
                style={{ marginRight: "5px" }}
                onClick={() => setSelectLanguageClick(!selectLanguageClick)}
              ></div>
            </div>
            {/* <button
              onClick={() => {
                count++;
                if (count >= 5) {
                  window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
                }
              }}
              style={{
                // background: colors.deepGreen,
                background: colors.white,
                // color: colors.white,
                border: "none",
                padding: "0.5rem 1.5rem",
                borderRadius: "4px",
                fontWeight: 500,
                // cursor: "pointer",
                transition: "all 0.3s ease",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            > */}
            {/* Sign In */}
            {/* </button> */}

            {/* <button onClick={resetGoogleTranslate}>quay lại ngôn ngữ gốc</button> */}
          </>
        ) : (
          <>
            <div
              id="google_translate_element"
              style={{ marginRight: "5px" }}
              onClick={() => setSelectLanguageClick(!selectLanguageClick)}
            ></div>
            <button
              onClick={toggleMenu}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: colors.deepGreen,
                padding: 0,
              }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>

            {isMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: colors.white,
                  padding: "1rem",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  zIndex: 1000,
                }}
              >
                <nav>
                  <ul
                    style={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {homepageLinks.map((link) => {
                      const isExternal = link.link && !link.link.startsWith("#");
                      const isActive = activeSection === link.link;
                      return (
                        <li key={link.id} style={{ marginBottom: "1rem" }}>
                          <a
                            href={link.link}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            style={{
                              color: isActive ? colors.deepGreen : colors.darkGray,
                              textDecoration: "none",
                              fontWeight: isActive ? "bold" : "normal",
                            }}
                          >
                            {link.name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                {/* <button
                  onClick={() => navigate("/login")}
                  style={{
                    background: colors.deepGreen,
                    color: colors.white,
                    border: "none",
                    padding: "0.5rem 1.5rem",
                    borderRadius: "4px",
                    fontWeight: "500",
                    cursor: "pointer",
                    width: "100%",
                    fontSize: "16px",
                    marginTop: "1rem",
                  }}
                >
                  Đăng nhập
                </button> */}
              </div>
            )}
          </>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="home"
        style={{
          // background: `linear-gradient(135deg, ${colors.lightGreen} 0%, ${colors.deepGreen} 100%)`,
          background: "linear-gradient(135deg,rgb(206, 248, 218),rgb(224, 255, 233))",
          padding: "8rem 2rem",
          color: colors.white,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            animation: "float 20s infinite ease-in-out",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-5%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            animation: "float 15s infinite ease-in-out reverse",
          }}
        />

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "2rem",
            opacity: visible.hero ? 1 : 0,
            transform: `translateY(${visible.hero ? "0" : "50px"})`,
            transition: "all 1s ease-out",
          }}
        >
          <div
            style={{
              minWidth: "300px",
              width: "100%",
              justifyContent: "center",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              color: colors.deepGreen,
            }}
          >
            {/* <h1
              style={{
                fontSize: "3.5rem",
                marginBottom: "1.5rem",
                fontWeight: "bold",
                lineHeight: "1.2",
              }}
            >
              {contentData?.name || "Learn Happy, Study Smarter"}
            </h1> */}
            <p
              style={{
                fontSize: isMobile ? "calc( 2.5vw + 2.5vw)" : "calc( 1vw + 1vw)",
                marginBottom: "2.5rem",
                maxWidth: isMobile ? "600px" : "60vw",
                alignContent: "center",
                textAlign: "center",
              }}
            >
              {contentData?.homepageDescription ||
                "Nâng cao trải nghiệm học tập của bạn với nền tảng học tập tất cả trong một."}
            </p>
          </div>
          <div
            style={{
              minWidth: "300px",
              width: "100%",
              justifyContent: "center",
              display: "flex",
              flexWrap: isMobile ? "nowrap" : "wrap",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {!isMobile && (
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
                  width: "20%",
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
            )}
            {isMobile && (
              <div style={{ width: "49%", display: "flex", flexWrap: "wrap", gap: "10px" }}>
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
                  <span style={{ position: "relative", zIndex: 2 }}>Student Login</span>
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
                  <span style={{ position: "relative", zIndex: 2 }}>Teacher Login</span>
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
                <Button
                  type="primary"
                  size="large"
                  icon={<BookOutlined />}
                  onClick={() => window.open(contentData?.linkTeacherSignUp)}
                  onMouseEnter={() => setButtonHover({ ...buttonHover, teacherSignUp: true })}
                  onMouseLeave={() => setButtonHover({ ...buttonHover, teacherSignUp: false })}
                  style={{
                    height: "54px",
                    borderRadius: "30px",
                    background: buttonHover.teacherSignUp
                      ? "linear-gradient(90deg, #43A047, #4CAF50)"
                      : "linear-gradient(90deg, #4CAF50, #43A047)",
                    borderColor: "#43A047",
                    fontSize: "16px",
                    boxShadow: buttonHover.teacherSignUp
                      ? "0 6px 15px rgba(67, 160, 71, 0.4)"
                      : "0 4px 10px rgba(67, 160, 71, 0.3)",
                    width: "100%",
                    transition: "all 0.3s ease",
                    transform: buttonHover.teacherSignUp ? "translateY(-3px)" : "translateY(0)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ position: "relative", zIndex: 2 }}>Teacher SignUp</span>
                  <div
                    style={{
                      position: "absolute",
                      top: "-50%",
                      left: "-50%",
                      right: "-50%",
                      bottom: "-50%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
                      animation: buttonHover.teacherSignUp ? "shimmer 1.5s infinite" : "none",
                      transform: "rotate(30deg)",
                      zIndex: 1,
                    }}
                  />
                </Button>
              </div>
            )}
            {!isMobile && <img src="giaovien.png" style={{ width: "300px" }}></img>}
            <img src="hocsinh.png" style={{ width: isMobile ? "49%" : "300px" }}></img>
            {!isMobile && (
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
                  width: "20%",
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
            )}
          </div>
          <div
            style={{
              flex: "1",
              minWidth: "300px",
              position: "relative",
              height: isMobile ? "400px" : "550px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: isMobile ? "90%" : "80%",
                height: isMobile ? "40vh" : "80vh",
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "16px",
                backdropFilter: "blur(5px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {/* <img src={Logo} alt="Happy Class Logo" style={{ width: "80%", height: "100%" }} /> */}
              {contentData?.linkYoutube && (
                // <div
                //   style={{
                //     marginTop: "2rem",
                //     textAlign: "center",
                //     opacity: visible.hero ? 1 : 0,
                //     transform: `translateY(${visible.hero ? "0" : "30px"})`,
                //     transition: "all 0.8s ease-out",
                //   }}
                // >
                //   <h3
                //     style={{
                //       fontSize: "1.5rem",
                //       color: colors.darkGray,
                //       marginBottom: "1rem",
                //     }}
                //   >
                //     Watch Our Introduction Video
                //   </h3>
                //   <div
                //     style={{
                //       position: "relative",
                //       paddingBottom: "56.25%", // Tỷ lệ 16:9
                //       height: 0,
                //       overflow: "hidden",
                //       maxWidth: "800px",
                //       margin: "0 auto",
                //       borderRadius: "8px",
                //       boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                //     }}
                //   >
                <div style={{ width: "90%", height: "90%" }}>
                  <iframe
                    style={{
                      // position: "absolute",
                      // top: 0,
                      // left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: "10px",
                    }}
                    src={contentData.linkYoutube.replace("watch?v=", "embed/")}
                    title="Happy Class Intro Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                // </div>
              )}
            </div>
          </div>
        </div>
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
      </section>

      {/* Stats Section */}
      <section
        style={{
          background: colors.white,
          padding: "2rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: "1rem",
              opacity: visible.statistics ? 1 : 0,
              transform: `translateY(${visible.statistics ? "0" : "30px"})`,
              transition: "all 0.8s ease-out",
            }}
          >
            <StatCard
              number="2,000+"
              label="Happy Students"
              icon={<UserOutlined style={{ fontSize: "24px" }} />}
            />
            <StatCard
              number="100+"
              label="Expert Courses"
              icon={<ProfileOutlined style={{ fontSize: "24px" }} />}
            />
            <StatCard
              number="94%"
              label="Success Rate"
              icon={<LikeOutlined style={{ fontSize: "24px" }} />}
            />
            <StatCard
              number="4.9"
              label="App Rating"
              icon={<StarOutlined style={{ fontSize: "24px" }} />}
            />
          </div>

          {/* YouTube Video */}
          {/* {contentData?.linkYoutube && (
            <div
              style={{
                marginTop: "2rem",
                textAlign: "center",
                opacity: visible.statistics ? 1 : 0,
                transform: `translateY(${visible.statistics ? "0" : "30px"})`,
                transition: "all 0.8s ease-out",
              }}
            >
              <h3
                style={{
                  fontSize: "1.5rem",
                  color: colors.darkGray,
                  marginBottom: "1rem",
                }}
              >
                Watch Our Introduction Video
              </h3>
              <div
                style={{
                  position: "relative",
                  paddingBottom: "56.25%", // Tỷ lệ 16:9
                  height: 0,
                  overflow: "hidden",
                  maxWidth: "800px",
                  margin: "0 auto",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <iframe
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  src={contentData.linkYoutube.replace("watch?v=", "embed/")}
                  title="Happy Class Intro Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )} */}
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{
          padding: "6rem 2rem",
          background: colors.white,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            opacity: visible.features ? 1 : 0,
            transform: `translateY(${visible.features ? "0" : "30px"})`,
            transition: "all 0.8s ease-out",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span
              style={{
                background: colors.lightGreen,
                color: colors.deepGreen,
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "bold",
              }}
            >
              NHỮNG GÌ CHÚNG TÔI CUNG CẤP
            </span>
            <h2
              style={{
                fontSize: "2.5rem",
                marginTop: "1rem",
                color: colors.darkGray,
                fontWeight: "bold",
              }}
            >
              {contentData?.featureMainTitle || "Study Smart, Not Hard"}
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                maxWidth: "700px",
                margin: "1rem auto 0",
                color: "#666",
              }}
            >
              {contentData?.featureMainDescription ||
                "Nền tảng của chúng tôi cung cấp mọi thứ bạn cần để đạt thành tích xuất sắc."}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            <FeatureCard
              icon={<CalendarOutlined style={{ fontSize: "28px" }} />}
              title={contentData?.featureFirstTitle || "Lịch Học Thông Minh"}
              description={
                contentData?.featureFristDescription ||
                "Tạo lịch học cá nhân hóa dựa trên mục tiêu và thời gian học tập tối ưu."
              }
              color={colors.lightGreen}
              delay={0.1}
            />
            <FeatureCard
              icon={<FileTextOutlined style={{ fontSize: "28px" }} />}
              title={contentData?.featureSecondTitle || "Tài Liệu Học Tập Đa Phương Tiện"}
              description={
                contentData?.featureSecondDescription ||
                "Tạo tài liệu học tập linh hoạt với tích hợp đa phương tiện."
              }
              color={colors.lightGreen}
              delay={0.2}
            />
            <FeatureCard
              icon={<TeamOutlined style={{ fontSize: "28px" }} />}
              title={contentData?.featureThirdTitle || "Cộng Đồng Học Tập"}
              description={
                contentData?.featureThirdDescription ||
                "Kết nối với bạn cùng lớp và chia sẻ tài nguyên."
              }
              color={colors.lightGreen}
              delay={0.3}
            />
            <FeatureCard
              icon={<BellOutlined style={{ fontSize: "28px" }} />}
              title={contentData?.featureFourthTitle || "Thông báo thông minh"}
              description={
                contentData?.featureFourthDescription ||
                "Hệ thống thông báo cá nhân hóa giúp bạn duy trì lộ trình học tập."
              }
              color={colors.lightGreen}
              delay={0.4}
            />
            <FeatureCard
              icon={<TrophyOutlined style={{ fontSize: "28px" }} />}
              title={contentData?.featureFivethTitle || "Hệ Thống Thưởng"}
              description={
                contentData?.featureFivethDescription ||
                "Trải nghiệm học tập gamified với huy hiệu và phần thưởng."
              }
              color={colors.lightGreen}
              delay={0.5}
            />
            <FeatureCard
              icon={<RocketOutlined style={{ fontSize: "28px" }} />}
              title={contentData?.featureSixthTitle || "Phân Tích Học Tập"}
              description={
                contentData?.featureSixthDescription ||
                "Cung cấp cái nhìn chi tiết về mẫu học tập của bạn."
              }
              color={colors.lightGreen}
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        style={{
          padding: "6rem 2rem",
          background: colors.gray,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            opacity: visible.howItWorks ? 1 : 0,
            transform: `translateY(${visible.howItWorks ? "0" : "30px"})`,
            transition: "all 0.8s ease-out",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span
              style={{
                background: colors.lightAccent,
                color: colors.deepGreen,
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "bold",
              }}
            >
              CÁCH HOẠT ĐỘNG
            </span>
            <h2
              style={{
                fontSize: "2.5rem",
                marginTop: "1rem",
                color: colors.darkGray,
                fontWeight: "bold",
              }}
            >
              {contentData?.worksMainTitle || "Your Journey to Learning Success"}
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                maxWidth: "700px",
                margin: "1rem auto 0",
                color: "#666",
              }}
            >
              {contentData?.worksMainDescription || "A simple process to get you started."}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "3rem",
            }}
          >
            <StepCard
              number="01"
              title={contentData?.worksFirstTitle || "Sign Up & Set Goals"}
              description={
                contentData?.worksFristDescription ||
                "Create your profile and set your academic goals."
              }
              color={colors.deepGreen}
            />
            <StepCard
              number="02"
              title={contentData?.worksSecondTitle || "Build Your Study Plan"}
              description={
                contentData?.worksSecondDescription ||
                "Our AI creates a personalized study schedule."
              }
              color={colors.deepGreen}
              reverse={true}
            />
            <StepCard
              number="03"
              title={contentData?.worksThirdTitle || "Learn & Track Progress"}
              description={
                contentData?.worksThirdDescription || "Follow your plan and watch your progress."
              }
              color={colors.deepGreen}
            />
            <StepCard
              number="04"
              title={contentData?.worksFourthTitle || "Celebrate Achievements"}
              description={
                contentData?.worksFourthDescription || "Reach milestones and earn rewards."
              }
              color={colors.deepGreen}
              reverse={true}
            />
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section
        id="testimonials"
        style={{
          padding: "6rem 2rem",
          background: colors.white,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            opacity: visible.testimonials ? 1 : 0,
            transform: `translateY(${visible.testimonials ? "0" : "30px"})`,
            transition: "all 0.8s ease-out",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span
              style={{
                background: colors.lightGreen,
                color: colors.deepGreen,
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "bold",
              }}
            >
              Đánh giá
            </span>
            <h2
              style={{
                fontSize: "2.5rem",
                marginTop: "1rem",
                color: colors.darkGray,
                fontWeight: "bold",
              }}
            >
              {contentData?.testimonialsMainTitle || "What Our Students Say"}
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                maxWidth: "700px",
                margin: "1rem auto 0",
                color: "#666",
              }}
            >
              {contentData?.testimonialsMainDescription || "Hear from our happy learners."}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            <TestimonialCard
              quote={
                contentData?.testimonialsFristDescription ||
                "HAPPY CLASS completely transformed my study habits."
              }
              author={contentData?.testimonialsFirstTitle || "Sarah Johnson"}
              role="Biology Student"
              image={contentData?.testimonialsFirstImgUrl || "/api/placeholder/80/80"}
              color={colors.lightGreen}
              delay={0.1}
            />
            <TestimonialCard
              quote={
                contentData?.testimonialsSecondDescription ||
                "The scheduling feature helped me balance my coursework."
              }
              author={contentData?.testimonialsSecondTitle || "Michael Torres"}
              role="Computer Science Major"
              image={contentData?.testimonialsSecondImgUrl || "/api/placeholder/80/80"}
              color={colors.lightGreen}
              delay={0.2}
            />
            <TestimonialCard
              quote={
                contentData?.testimonialsThirdDescription ||
                "I've improved my grades significantly since using HAPPY CLASS."
              }
              author={contentData?.testimonialsThirdTitle || "Priya Kaur"}
              role="Business Student"
              image={contentData?.testimonialsThirdImgUrl || "/api/placeholder/80/80"}
              color={colors.lightGreen}
              delay={0.3}
            />
          </div>
        </div>
      </section>
      {/* CTA Section */}
      {/* <section
        style={{
          background: `linear-gradient(135deg, ${colors.lightGreen} 0%, ${colors.deepGreen} 100%)`,
          padding: "6rem 2rem",
          color: colors.white,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "5%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            animation: "float 15s infinite ease-in-out",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            animation: "float 20s infinite ease-in-out reverse",
          }}
        />

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            opacity: visible.cta ? 1 : 0,
            transform: `translateY(${visible.cta ? "0" : "30px"})`,
            transition: "all 0.8s ease-out",
          }}
        >
          <h2
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
            }}
          >
            Ready to Transform Your Learning Experience?
          </h2>
          <p
            style={{
              fontSize: "1.25rem",
              marginBottom: "3rem",
              maxWidth: "700px",
              margin: "0 auto 3rem",
            }}
          >
            Join thousands of students who have already discovered the joy of learning with HAPPY
            CLASS.
          </p>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}
          >
            <button
              style={{
                background: colors.white,
                color: colors.deepGreen,
                border: "none",
                padding: "1rem 2.5rem",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "1.1rem",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              Get Started Today
            </button>
            <button
              style={{
                background: "transparent",
                color: colors.white,
                border: `2px solid ${colors.white}`,
                padding: "1rem 2.5rem",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "1.1rem",
                transition: "all 0.3s ease",
              }}
            >
              Schedule a Demo
            </button>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer
        id="contact"
        style={{
          background: colors.darkGreen,
          color: colors.white,
          padding: "4rem 2rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "3rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
              <img
                src={Logo}
                alt="Happy Class Logo"
                style={{ width: "50px", height: "50px", marginRight: "10px" }}
              />
              <h3
                style={{
                  color: colors.white,
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                {contentData?.homepageMainTitle}
              </h3>
            </div>
            <p style={{ marginBottom: "1.5rem" }}>
              {contentData?.footerDescription || "Happy Class - Empowering education for all."}
            </p>
            {/* <div style={{ display: "flex", gap: "1rem" }}>
              <a
                href={contentData?.linkFacebook || "https://facebook.com/happyclass"}
                style={{ color: colors.white, fontSize: "1.5rem" }}
              >
                <FacebookOutlined />
              </a>
              <a href="#" style={{ color: colors.white, fontSize: "1.5rem" }}>
                <TwitterOutlined />
              </a>
              <a href="#" style={{ color: colors.white, fontSize: "1.5rem" }}>
                <InstagramOutlined />
              </a>
              <a href="#" style={{ color: colors.white, fontSize: "1.5rem" }}>
                <LinkedinOutlined />
              </a>
            </div> */}
          </div>

          <div className="footer-links">
            <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
              Về chúng tôi
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {homepageLinks && homepageLinks.map(link => {
                const isExternal = link.link && !link.link.startsWith("#");
                return (
                  <li key={link.id} style={{ marginBottom: "0.75rem" }}>
                    <a
                      href={link.link}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      style={{ color: colors.white, textDecoration: "none" }}
                    >
                      {link.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
              Liên hệ
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center" }}>
                <MailOutlined style={{ marginRight: "0.5rem" }} />
                <span>{contentData?.footerEmail || "support@happyclass.com"}</span>
              </li>
              <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center" }}>
                <PhoneOutlined style={{ marginRight: "0.5rem" }} />
                <span>{contentData?.footerContact || "+84 123 456 789"}</span>
              </li>
              <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center" }}>
                <GlobalOutlined style={{ marginRight: "0.5rem" }} />
                <span>{contentData?.footerAddress || "123 Education St, Learning City"}</span>
              </li>
            </ul>
          </div>
        </div>
        <ShareButtons />
        <div
          style={{
            textAlign: "center",
            marginTop: "3rem",
            paddingTop: "1.5rem",
            borderTop: `1px solid ${colors.mediumGray}`,
          }}
        >
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Happy Class. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Links & Scroll to Top */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          position: "fixed",
          bottom: "20px",
          right: "20px",
          flexDirection: "column",
          zIndex: 1000,
        }}
      >
        <Button
          type="primary"
          shape="circle"
          icon={<UpOutlined />}
          onClick={scrollToTop}
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: "#52c41a",
            borderColor: "#52c41a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            opacity: (
              isMobile
                ? window.scrollY + window.innerHeight > 1700
                : window.scrollY + window.innerHeight > 1600
            )
              ? 1
              : 0,
            visibility: (
              isMobile
                ? window.scrollY + window.innerHeight > 1700
                : window.scrollY + window.innerHeight > 1600
            )
              ? "visible"
              : "hidden",
            transition: "all 0.3s ease",
            animation: (
              isMobile
                ? window.scrollY + window.innerHeight > 1700
                : window.scrollY + window.innerHeight > 1600
            )
              ? "bounce 1s infinite"
              : "none",
          }}
        />
        {!showFloatingLinks ? (
          <div
            style={{
              width: "50px",
              height: "50px",
              background: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              border: `1px solid ${colors.deepGreen}`,
            }}
            onClick={() => setShowFloatingLinks(true)}
            title="Hiện các link tham khảo"
          >
            <UpOutlined style={{ fontSize: "20px", color: colors.deepGreen }} />
          </div>
        ) : (
          <>
            {(() => {
              const linksArray = [
                ...floatingLinks.map(l => ({ type: 'custom', data: l }))
              ];
              const cols = [];
              for (let i = 0; i < linksArray.length; i += 3) {
                cols.push(linksArray.slice(i, i + 3));
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '10px', alignItems: 'flex-end' }}>
                  {cols.map((col, colIndex) => (
                    <div key={colIndex} style={{ display: 'flex', flexDirection: 'column-reverse', gap: '10px' }}>
                      {col.map((item) => {
                        const link = item.data;
                        return (
                          <div
                            key={link.id}
                            style={{
                              width: "50px", height: "50px", background: "transparent", cursor: "pointer",
                              overflow: "hidden", borderRadius: "8px"
                            }}
                            onClick={() => window.open(link.link)}
                            title={link.name}
                          >
                            {link.imgUrl ? (
                              <img src={link.imgUrl} alt={link.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#115E40", color: "white", borderRadius: "8px" }}>
                                <LinkOutlined style={{ fontSize: "24px" }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}
            {/* Nút Thu gọn */}
            <div
              style={{
                width: "50px",
                height: "50px",
                background: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                border: `1px solid ${colors.deepGreen}`,
              }}
              onClick={() => setShowFloatingLinks(false)}
              title="Thu gọn"
            >
              <DownOutlined style={{ fontSize: "20px", color: colors.deepGreen }} />
            </div>
          </>
        )}
        <style>
          {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0); }
          }
        `}
        </style>
      </div>
    </div>
  );
}
