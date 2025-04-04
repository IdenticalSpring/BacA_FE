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
  const navigate = useNavigate();

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
      if (width < 768) {
        if (scrollPosition > 2250) setVisible((prev) => ({ ...prev, features: true }));
        if (scrollPosition > 1500) setVisible((prev) => ({ ...prev, statistics: true }));
        if (scrollPosition > 4400) setVisible((prev) => ({ ...prev, howItWorks: true }));
        if (scrollPosition > 5900) setVisible((prev) => ({ ...prev, testimonials: true }));
        if (scrollPosition > 7100) setVisible((prev) => ({ ...prev, pricing: true }));
        if (scrollPosition > 9100) setVisible((prev) => ({ ...prev, faq: true }));
        if (scrollPosition > 10000) setVisible((prev) => ({ ...prev, cta: true }));
      } else {
        if (scrollPosition > 1000) setVisible((prev) => ({ ...prev, features: true }));
        if (scrollPosition > 790) setVisible((prev) => ({ ...prev, statistics: true }));
        if (scrollPosition > 2000) setVisible((prev) => ({ ...prev, howItWorks: true }));
        if (scrollPosition > 3200) setVisible((prev) => ({ ...prev, testimonials: true }));
        if (scrollPosition > 3900) setVisible((prev) => ({ ...prev, pricing: true }));
        if (scrollPosition > 4600) setVisible((prev) => ({ ...prev, faq: true }));
        if (scrollPosition > 5400) setVisible((prev) => ({ ...prev, cta: true }));
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
            HAPPY CLASS
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
                <li>
                  <a href="#home" style={{ color: colors.deepGreen, textDecoration: "none" }}>
                    Home page
                  </a>
                </li>
                <li>
                  <a href="#features" style={{ color: colors.darkGray, textDecoration: "none" }}>
                    Our Features
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    style={{ color: colors.darkGray, textDecoration: "none" }}
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="#contact" style={{ color: colors.darkGray, textDecoration: "none" }}>
                    Contact
                  </a>
                </li>
              </ul>
            </nav>
            <button
              onClick={() => navigate("/login")}
              style={{
                background: colors.deepGreen,
                color: colors.white,
                border: "none",
                padding: "0.5rem 1.5rem",
                borderRadius: "4px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Sign In
            </button>
          </>
        ) : (
          <>
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
                    <li style={{ marginBottom: "1rem" }}>
                      <a
                        href="#home"
                        style={{
                          color: colors.deepGreen,
                          textDecoration: "none",
                          fontWeight: "bold",
                        }}
                      >
                        Trang chủ
                      </a>
                    </li>
                    <li style={{ marginBottom: "1rem" }}>
                      <a
                        href="#features"
                        style={{ color: colors.darkGray, textDecoration: "none" }}
                      >
                        Tính năng
                      </a>
                    </li>
                    <li style={{ marginBottom: "1rem" }}>
                      <a
                        href="#testimonials"
                        style={{ color: colors.darkGray, textDecoration: "none" }}
                      >
                        Đánh giá
                      </a>
                    </li>
                    <li style={{ marginBottom: "1rem" }}>
                      <a href="#contact" style={{ color: colors.darkGray, textDecoration: "none" }}>
                        Liên hệ
                      </a>
                    </li>
                  </ul>
                </nav>
                <button
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
                </button>
              </div>
            )}
          </>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="home"
        style={{
          background: `linear-gradient(135deg, ${colors.lightGreen} 0%, ${colors.deepGreen} 100%)`,
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
          <div style={{ flex: "1", minWidth: "300px" }}>
            <h1
              style={{
                fontSize: "3.5rem",
                marginBottom: "1.5rem",
                fontWeight: "bold",
                lineHeight: "1.2",
              }}
            >
              {contentData?.homepageMainTitle || "Learn Happy, Study Smarter"}
            </h1>
            <p
              style={{
                fontSize: "1.25rem",
                marginBottom: "2.5rem",
                maxWidth: "600px",
              }}
            >
              {contentData?.homepageDescription ||
                "Nâng cao trải nghiệm học tập của bạn với nền tảng học tập tất cả trong một."}
            </p>
          </div>
          <div
            style={{
              flex: "1",
              minWidth: "300px",
              position: "relative",
              height: "400px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                height: "80%",
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
              <img src={Logo} alt="Happy Class Logo" style={{ width: "80%", height: "100%" }} />
            </div>
          </div>
        </div>
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
          {contentData?.linkYoutube && (
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
          )}
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
              TESTIMONIALS
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
              image="/api/placeholder/80/80"
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
              image="/api/placeholder/80/80"
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
              image="/api/placeholder/80/80"
              color={colors.lightGreen}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
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
      </section>

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
                HAPPY CLASS
              </h3>
            </div>
            <p style={{ marginBottom: "1.5rem" }}>
              {contentData?.footerDescription || "Happy Class - Empowering education for all."}
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
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
            </div>
          </div>

          <div className="footer-links">
            <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "0.75rem" }}>
                <a href="#home" style={{ color: colors.white, textDecoration: "none" }}>
                  Home
                </a>
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <a href="#features" style={{ color: colors.white, textDecoration: "none" }}>
                  Features
                </a>
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <a href="#testimonials" style={{ color: colors.white, textDecoration: "none" }}>
                  Testimonials
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
              Contact Us
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

      {/* Social Buttons */}
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
            opacity: window.scrollY + window.innerHeight > 1000 ? 1 : 0,
            visibility: window.scrollY + window.innerHeight > 1000 ? "visible" : "hidden",
            transition: "all 0.3s ease",
            animation: window.scrollY + window.innerHeight > 1000 ? "bounce 1s infinite" : "none",
          }}
        />
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
          onClick={() => window.open(contentData?.linkFacebook)}
        >
          <FacebookFilled style={{ fontSize: "24px" }} />
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
            transform: socialHover.zalo ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0deg)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={() => setSocialHover({ ...socialHover, zalo: true })}
          onMouseLeave={() => setSocialHover({ ...socialHover, zalo: false })}
          onClick={() => window.open(contentData?.linkZalo || "https://zalo.me/happyclass")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="30"
            height="30"
            viewBox="0,0,256,256"
          >
            <g fill="#ffffff" style={{ mixBlendMode: "normal" }}>
              <g transform="scale(5.12,5.12)">
                <path d="M9,4c-2.74952,0 -5,2.25048 -5,5v32c0,2.74952 2.25048,5 5,5h32c2.74952,0 5,-2.25048 5,-5v-32c0,-2.74952 -2.25048,-5 -5,-5zM9,6h6.58008c-3.57109,3.71569 -5.58008,8.51808 -5.58008,13.5c0,5.16 2.11016,10.09984 5.91016,13.83984c0.12,0.21 0.21977,1.23969 -0.24023,2.42969c-0.29,0.75 -0.87023,1.72961 -1.99023,2.09961c-0.43,0.14 -0.70969,0.56172 -0.67969,1.01172c0.03,0.45 0.36078,0.82992 0.80078,0.91992c2.87,0.57 4.72852,-0.2907 6.22852,-0.9707c1.35,-0.62 2.24133,-1.04047 3.61133,-0.48047c2.8,1.09 5.77938,1.65039 8.85938,1.65039c4.09369,0 8.03146,-0.99927 11.5,-2.88672v3.88672c0,1.66848 -1.33152,3 -3,3h-32c-1.66848,0 -3,-1.33152 -3,-3v-32c0,-1.66848 1.33152,-3 3,-3zM33,15c0.55,0 1,0.45 1,1v9c0,0.55 -0.45,1 -1,1c-0.55,0 -1,-0.45 -1,-1v-9c0,-0.55 0.45,-1 1,-1zM18,16h5c0.36,0 0.70086,0.19953 0.88086,0.51953c0.17,0.31 0.15875,0.69977 -0.03125,1.00977l-4.04883,6.4707h3.19922c0.55,0 1,0.45 1,1c0,0.55 -0.45,1 -1,1h-5c-0.36,0 -0.70086,-0.19953 -0.88086,-0.51953c-0.17,-0.31 -0.15875,-0.69977 0.03125,-1.00977l4.04883,-6.4707h-3.19922c-0.55,0 -1,-0.45 -1,-1c0,-0.55 0.45,-1 1,-1zM27.5,19c0.61,0 1.17945,0.16922 1.68945,0.44922c0.18,-0.26 0.46055,-0.44922 0.81055,-0.44922c0.55,0 1,0.45 1,1v5c0,0.55 -0.45,1 -1,1c-0.35,0 -0.63055,-0.18922 -0.81055,-0.44922c-0.51,0.28 -1.07945,0.44922 -1.68945,0.44922c-1.93,0 -3.5,-1.57 -3.5,-3.5c0,-1.93 1.57,-3.5 3.5,-3.5zM38.5,19c1.93,0 3.5,1.57 3.5,3.5c0,1.93 -1.57,3.5 -3.5,3.5c-1.93,0 -3.5,-1.57 -3.5,-3.5c0,-1.93 1.57,-3.5 3.5,-3.5zM27.5,21c-0.10375,0 -0.20498,0.01131 -0.30273,0.03125c-0.19551,0.03988 -0.37754,0.11691 -0.53711,0.22461c-0.15957,0.1077 -0.2966,0.24473 -0.4043,0.4043c-0.10769,0.15957 -0.18473,0.3416 -0.22461,0.53711c-0.01994,0.09775 -0.03125,0.19898 -0.03125,0.30273c0,0.10375 0.01131,0.20498 0.03125,0.30273c0.01994,0.09775 0.04805,0.19149 0.08594,0.28125c0.03789,0.08977 0.08482,0.17607 0.13867,0.25586c0.05385,0.07979 0.11578,0.15289 0.18359,0.2207c0.06781,0.06781 0.14092,0.12975 0.2207,0.18359c0.15957,0.10769 0.3416,0.18473 0.53711,0.22461c0.09775,0.01994 0.19898,0.03125 0.30273,0.03125c0.10375,0 0.20498,-0.01131 0.30273,-0.03125c0.68428,-0.13959 1.19727,-0.7425 1.19727,-1.46875c0,-0.83 -0.67,-1.5 -1.5,-1.5zM38.5,21c-0.10375,0 -0.20498,0.01131 -0.30273,0.03125c-0.09775,0.01994 -0.19149,0.04805 -0.28125,0.08594c-0.08977,0.03789 -0.17607,0.08482 -0.25586,0.13867c-0.07979,0.05385 -0.15289,0.11578 -0.2207,0.18359c-0.13562,0.13563 -0.24648,0.29703 -0.32227,0.47656c-0.03789,0.08976 -0.066,0.1835 -0.08594,0.28125c-0.01994,0.09775 -0.03125,0.19898 -0.03125,0.30273c0,0.10375 0.01131,0.20498 0.03125,0.30273c0.01994,0.09775 0.04805,0.19149 0.08594,0.28125c0.03789,0.08977 0.08482,0.17607 0.13867,0.25586c0.05385,0.07979 0.11578,0.15289 0.18359,0.2207c0.06781,0.06781 0.14092,0.12975 0.2207,0.18359c0.07979,0.05385 0.16609,0.10078 0.25586,0.13867c0.08976,0.03789 0.1835,0.066 0.28125,0.08594c0.09775,0.01994 0.19898,0.03125 0.30273,0.03125c0.10375,0 0.20498,-0.01131 0.30273,-0.03125c0.68428,-0.13959 1.19727,-0.7425 1.19727,-1.46875c0,-0.83 -0.67,-1.5 -1.5,-1.5z"></path>
              </g>
            </g>
          </svg>
        </div>
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
