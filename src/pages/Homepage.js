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
  // Animate on scroll
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
      console.log(scrollPosition);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Color palette
  const colors = {
    lightGreen: "#8ED1B0",
    deepGreen: "#368A68",
    white: "#FFFFFF",
    gray: "#F5F5F5",
    darkGray: "#333333",
    accent: "#FFD166",
    lightAccent: "#FFEDC2",
    darkGreen: "#224922",
  };
  // console.log(visible);
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
          <BookOutlined
            style={{ color: colors.deepGreen, fontSize: "28px", marginRight: "10px" }}
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
                  <a
                    href="#home"
                    style={{ color: colors.deepGreen, textDecoration: "none", fontWeight: "bold" }}
                  >
                    Trang chủ
                  </a>
                </li>
                <li>
                  <a href="#features" style={{ color: colors.darkGray, textDecoration: "none" }}>
                    Tính năng
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    style={{ color: colors.darkGray, textDecoration: "none" }}
                  >
                    Đánh giá
                  </a>
                </li>
                <li>
                  <a href="#pricing" style={{ color: colors.darkGray, textDecoration: "none" }}>
                    Giá cả
                  </a>
                </li>
                <li>
                  <a href="#faq" style={{ color: colors.darkGray, textDecoration: "none" }}>
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#contact" style={{ color: colors.darkGray, textDecoration: "none" }}>
                    Liên hệ
                  </a>
                </li>
              </ul>
            </nav>
            <button
              onClick={() => {
                window.location.href = "/login";
              }}
              style={{
                background: colors.deepGreen,
                color: colors.white,
                border: "none",
                padding: "0.5rem 1.5rem",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              Đăng nhập
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
                      <a href="#pricing" style={{ color: colors.darkGray, textDecoration: "none" }}>
                        Giá cả
                      </a>
                    </li>
                    <li style={{ marginBottom: "1rem" }}>
                      <a href="#faq" style={{ color: colors.darkGray, textDecoration: "none" }}>
                        FAQ
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
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                  style={{
                    background: colors.deepGreen,
                    color: colors.white,
                    border: "none",
                    padding: "0.5rem 1.5rem",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    width: "100%",
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
        {/* Animated background shapes */}
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
              Learn Happy, <br />
              Study <span style={{ color: colors.accent }}>Smarter</span>
            </h1>
            <p
              style={{
                fontSize: "1.25rem",
                marginBottom: "2.5rem",
                maxWidth: "600px",
              }}
            >
              Nâng cao trải nghiệm học tập của bạn với nền tảng học tập tất cả trong một, được thiết
              kế để làm cho việc giáo dục trở nên thú vị, hiệu quả và phù hợp với phong cách học tập
              độc đáo của bạn.
            </p>
            {/* <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                style={{
                  background: colors.white,
                  color: colors.deepGreen,
                  border: "none",
                  padding: "0.75rem 2rem",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                Start Free Trial
              </button>
              <button
                style={{
                  background: "transparent",
                  color: colors.white,
                  border: `2px solid ${colors.white}`,
                  padding: "0.75rem 2rem",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
              >
                Watch Demo
              </button>
            </div> */}
          </div>
          <div
            style={{
              flex: "1",
              minWidth: "300px",
              position: "relative",
              height: "400px",
            }}
          >
            {/* Stylized image placeholder */}
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
              <BookOutlined style={{ fontSize: "100px", opacity: "0.7" }} />
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
              Study Smart, <span style={{ color: colors.deepGreen }}>Not Hard</span>
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                maxWidth: "700px",
                margin: "1rem auto 0",
                color: "#666",
              }}
            >
              Nền tảng của chúng tôi cung cấp mọi thứ bạn cần để đạt thành tích xuất sắc trong học
              tập mà vẫn duy trì được sự cân bằng giữa công việc và cuộc sống.
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
              title="Lịch Học Thông Minh"
              description="Tạo lịch học cá nhân hóa dựa trên mục tiêu, thời hạn và thời gian học tập tối ưu của bạn."
              color={colors.lightGreen}
              delay={0.1}
            />
            <FeatureCard
              icon={<FileTextOutlined style={{ fontSize: "28px" }} />}
              title="Tài Liệu Học Tập Đa Phương Tiện"
              description="Tạo tài liệu học tập linh hoạt với tích hợp đa phương tiện, sơ đồ tư duy và các tính năng cộng tác."
              color={colors.lightGreen}
              delay={0.2}
            />
            <FeatureCard
              icon={<TeamOutlined style={{ fontSize: "28px" }} />}
              title="Cộng Đồng Học Tập"
              description="Kết nối với bạn cùng lớp, tạo nhóm học tập và chia sẻ tài nguyên để nâng cao hiểu biết."
              color={colors.lightGreen}
              delay={0.3}
            />
            <FeatureCard
              icon={<BellOutlined style={{ fontSize: "28px" }} />}
              title="Thông báo thông minh"
              description="Hệ thống thông báo cá nhân hóa giúp bạn duy trì lộ trình học tập và hoàn thành đúng hạn."
              color={colors.lightGreen}
              delay={0.4}
            />
            <FeatureCard
              icon={<TrophyOutlined style={{ fontSize: "28px" }} />}
              title="Hệ Thống Thưởng"
              description="Trải nghiệm học tập gamified với huy hiệu, điểm và phần thưởng để giữ bạn luôn được động viên."
              color={colors.lightGreen}
              delay={0.5}
            />
            <FeatureCard
              icon={<RocketOutlined style={{ fontSize: "28px" }} />}
              title="Phân Tích Học Tập"
              description="Cung cấp cái nhìn chi tiết về mẫu học tập, điểm mạnh và điểm yếu của bạn."
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
              Your Journey to <span style={{ color: colors.deepGreen }}>Learning Success</span>
            </h2>
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
              title="Sign Up & Set Goals"
              description="Create your profile and set your academic goals. Tell us about your learning style and preferences."
              color={colors.deepGreen}
            />
            <StepCard
              number="02"
              title="Build Your Study Plan"
              description="Our AI creates a personalized study schedule based on your goals, deadlines, and optimal learning times."
              color={colors.deepGreen}
              reverse={true}
            />
            <StepCard
              number="03"
              title="Learn & Track Progress"
              description="Follow your plan, use our tools, and watch your progress. Adjust as needed with real-time feedback."
              color={colors.deepGreen}
            />
            <StepCard
              number="04"
              title="Celebrate Achievements"
              description="Reach milestones, earn rewards, and celebrate your academic success along the way."
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
              What Our <span style={{ color: colors.deepGreen }}>Students Say</span>
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            <TestimonialCard
              quote="HAPPY CLASS completely transformed my study habits. I'm more productive and actually enjoy learning now!"
              author="Sarah Johnson"
              role="Biology Student"
              image="/api/placeholder/80/80"
              color={colors.lightGreen}
              delay={0.1}
            />
            <TestimonialCard
              quote="The scheduling feature helped me balance my coursework and finally maintain a healthy study routine."
              author="Michael Torres"
              role="Computer Science Major"
              image="/api/placeholder/80/80"
              color={colors.lightGreen}
              delay={0.2}
            />
            <TestimonialCard
              quote="I've improved my grades significantly since using HAPPY CLASS. The collaborative features are game-changing!"
              author="Priya Kaur"
              role="Business Student"
              image="/api/placeholder/80/80"
              color={colors.lightGreen}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        style={{
          padding: "6rem 2rem",
          background: colors.gray,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            opacity: visible.pricing ? 1 : 0,
            transform: `translateY(${visible.pricing ? "0" : "30px"})`,
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
              PRICING
            </span>
            <h2
              style={{
                fontSize: "2.5rem",
                marginTop: "1rem",
                color: colors.darkGray,
                fontWeight: "bold",
              }}
            >
              Simple, <span style={{ color: colors.deepGreen }}>Transparent Pricing</span>
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                maxWidth: "700px",
                margin: "1rem auto 0",
                color: "#666",
              }}
            >
              Choose the plan that works best for your learning journey
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            <PricingCard
              title="Basic"
              price="Free"
              description="Perfect for casual learners"
              features={[
                "Smart scheduler (basic)",
                "Note-taking tools",
                "Limited progress tracking",
                "Community access",
              ]}
              buttonText="Get Started"
              color={colors.lightGreen}
              recommended={false}
            />
            <PricingCard
              title="Premium"
              price="$9.99"
              period="per month"
              description="Great for dedicated students"
              features={[
                "Advanced AI scheduling",
                "Interactive note tools",
                "Full progress analytics",
                "Unlimited study groups",
                "Priority support",
              ]}
              buttonText="Start Free Trial"
              color={colors.deepGreen}
              recommended={true}
            />
            <PricingCard
              title="Campus"
              price="Contact Us"
              description="For schools and institutions"
              features={[
                "Everything in Premium",
                "Admin dashboard",
                "Bulk user management",
                "Custom branding",
                "API access",
              ]}
              buttonText="Schedule Demo"
              color={colors.lightGreen}
              recommended={false}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        style={{
          padding: "6rem 2rem",
          background: colors.white,
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            opacity: visible.faq ? 1 : 0,
            transform: `translateY(${visible.faq ? "0" : "30px"})`,
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
              FAQ
            </span>
            <h2
              style={{
                fontSize: "2.5rem",
                marginTop: "1rem",
                color: colors.darkGray,
                fontWeight: "bold",
              }}
            >
              Frequently Asked <span style={{ color: colors.deepGreen }}>Questions</span>
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <FaqItem
              question="How does the AI scheduling work?"
              answer="Our AI analyzes your learning patterns, course load, and available time to create an optimized study schedule. It adapts as you progress, learning what works best for your unique needs."
            />
            <FaqItem
              question="Can I use HAPPY CLASS offline?"
              answer="Yes! Our mobile app allows you to download your study materials and schedules for offline use. Your progress will sync once you're back online."
            />
            <FaqItem
              question="Is there a limit to how many courses I can track?"
              answer="Basic users can track up to 3 courses, while Premium users have unlimited course tracking capabilities."
            />
            <FaqItem
              question="How does the group study feature work?"
              answer="You can create or join study groups, schedule virtual sessions, share notes, and collaborate on projects—all within the platform."
            />
            <FaqItem
              question="Do you offer refunds if I'm not satisfied?"
              answer="Yes, we offer a 30-day money-back guarantee for all Premium subscriptions. If you're not happy with the service, you can request a full refund."
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
        {/* Animated background circles */}
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
              <BookOutlined
                style={{ color: colors.lightGreen, fontSize: "24px", marginRight: "10px" }}
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
              Making learning enjoyable and effective for everyone. Our mission is to transform
              education through technology and personalization.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <a href="#" style={{ color: colors.white, fontSize: "1.5rem" }}>
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
              <li style={{ marginBottom: "0.75rem" }}>
                <a href="#pricing" style={{ color: colors.white, textDecoration: "none" }}>
                  Pricing
                </a>
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <a href="#faq" style={{ color: colors.white, textDecoration: "none" }}>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
              Resources
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "0.75rem" }}>
                <a href="#" style={{ color: colors.white, textDecoration: "none" }}>
                  Help Center
                </a>
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <a href="#" style={{ color: colors.white, textDecoration: "none" }}>
                  Study Guides
                </a>
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <a href="#" style={{ color: colors.white, textDecoration: "none" }}>
                  Blog
                </a>
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <a href="#" style={{ color: colors.white, textDecoration: "none" }}>
                  Tutorials
                </a>
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <a href="#" style={{ color: colors.white, textDecoration: "none" }}>
                  Community Forum
                </a>
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <a href="#" style={{ color: colors.white, textDecoration: "none" }}>
                  Contact Support
                </a>
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
            transition: " all 0.3s ease",
            animation: window.scrollY + window.innerHeight > 1000 ? "bounce 1s infinite" : "none",
          }}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<FacebookFilled style={{ fontSize: "24px" }} />}
          onClick={scrollToTop}
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: "#1877F2",
            borderColor: "#52c41a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            opacity: window.scrollY + window.innerHeight > 1000 ? 1 : 0,
            visibility: window.scrollY + window.innerHeight > 1000 ? "visible" : "hidden",
            transition: " all 0.3s ease",
            animation: window.scrollY + window.innerHeight > 1000 ? "bounce 1s infinite" : "none",
          }}
        />
        <Button
          type="primary"
          shape="circle"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="30"
              height="30"
              viewBox="0 0 50 50"
            >
              <path d="M 9 4 C 6.2504839 4 4 6.2504839 4 9 L 4 41 C 4 43.749516 6.2504839 46 9 46 L 41 46 C 43.749516 46 46 43.749516 46 41 L 46 9 C 46 6.2504839 43.749516 4 41 4 L 9 4 z M 9 6 L 15.580078 6 C 12.00899 9.7156859 10 14.518083 10 19.5 C 10 24.66 12.110156 29.599844 15.910156 33.339844 C 16.030156 33.549844 16.129922 34.579531 15.669922 35.769531 C 15.379922 36.519531 14.799687 37.499141 13.679688 37.869141 C 13.249688 38.009141 12.97 38.430859 13 38.880859 C 13.03 39.330859 13.360781 39.710781 13.800781 39.800781 C 16.670781 40.370781 18.529297 39.510078 20.029297 38.830078 C 21.379297 38.210078 22.270625 37.789609 23.640625 38.349609 C 26.440625 39.439609 29.42 40 32.5 40 C 36.593685 40 40.531459 39.000731 44 37.113281 L 44 41 C 44 42.668484 42.668484 44 41 44 L 9 44 C 7.3315161 44 6 42.668484 6 41 L 6 9 C 6 7.3315161 7.3315161 6 9 6 z M 33 15 C 33.55 15 34 15.45 34 16 L 34 25 C 34 25.55 33.55 26 33 26 C 32.45 26 32 25.55 32 25 L 32 16 C 32 15.45 32.45 15 33 15 z M 18 16 L 23 16 C 23.36 16 23.700859 16.199531 23.880859 16.519531 C 24.050859 16.829531 24.039609 17.219297 23.849609 17.529297 L 19.800781 24 L 23 24 C 23.55 24 24 24.45 24 25 C 24 25.55 23.55 26 23 26 L 18 26 C 17.64 26 17.299141 25.800469 17.119141 25.480469 C 16.949141 25.170469 16.960391 24.780703 17.150391 24.470703 L 21.199219 18 L 18 18 C 17.45 18 17 17.55 17 17 C 17 16.45 17.45 16 18 16 z M 27.5 19 C 28.11 19 28.679453 19.169219 29.189453 19.449219 C 29.369453 19.189219 29.65 19 30 19 C 30.55 19 31 19.45 31 20 L 31 25 C 31 25.55 30.55 26 30 26 C 29.65 26 29.369453 25.810781 29.189453 25.550781 C 28.679453 25.830781 28.11 26 27.5 26 C 25.57 26 24 24.43 24 22.5 C 24 20.57 25.57 19 27.5 19 z M 38.5 19 C 40.43 19 42 20.57 42 22.5 C 42 24.43 40.43 26 38.5 26 C 36.57 26 35 24.43 35 22.5 C 35 20.57 36.57 19 38.5 19 z M 27.5 21 C 27.39625 21 27.29502 21.011309 27.197266 21.03125 C 27.001758 21.071133 26.819727 21.148164 26.660156 21.255859 C 26.500586 21.363555 26.363555 21.500586 26.255859 21.660156 C 26.148164 21.819727 26.071133 22.001758 26.03125 22.197266 C 26.011309 22.29502 26 22.39625 26 22.5 C 26 22.60375 26.011309 22.70498 26.03125 22.802734 C 26.051191 22.900488 26.079297 22.994219 26.117188 23.083984 C 26.155078 23.17375 26.202012 23.260059 26.255859 23.339844 C 26.309707 23.419629 26.371641 23.492734 26.439453 23.560547 C 26.507266 23.628359 26.580371 23.690293 26.660156 23.744141 C 26.819727 23.851836 27.001758 23.928867 27.197266 23.96875 C 27.29502 23.988691 27.39625 24 27.5 24 C 27.60375 24 27.70498 23.988691 27.802734 23.96875 C 28.487012 23.82916 29 23.22625 29 22.5 C 29 21.67 28.33 21 27.5 21 z M 38.5 21 C 38.39625 21 38.29502 21.011309 38.197266 21.03125 C 38.099512 21.051191 38.005781 21.079297 37.916016 21.117188 C 37.82625 21.155078 37.739941 21.202012 37.660156 21.255859 C 37.580371 21.309707 37.507266 21.371641 37.439453 21.439453 C 37.303828 21.575078 37.192969 21.736484 37.117188 21.916016 C 37.079297 22.005781 37.051191 22.099512 37.03125 22.197266 C 37.011309 22.29502 37 22.39625 37 22.5 C 37 22.60375 37.011309 22.70498 37.03125 22.802734 C 37.051191 22.900488 37.079297 22.994219 37.117188 23.083984 C 37.155078 23.17375 37.202012 23.260059 37.255859 23.339844 C 37.309707 23.419629 37.371641 23.492734 37.439453 23.560547 C 37.507266 23.628359 37.580371 23.690293 37.660156 23.744141 C 37.739941 23.797988 37.82625 23.844922 37.916016 23.882812 C 38.005781 23.920703 38.099512 23.948809 38.197266 23.96875 C 38.29502 23.988691 38.39625 24 38.5 24 C 38.60375 24 38.70498 23.988691 38.802734 23.96875 C 39.487012 23.82916 40 23.22625 40 22.5 C 40 21.67 39.33 21 38.5 21 z"></path>
            </svg>
          }
          onClick={scrollToTop}
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: "#ffffff",
            borderColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            opacity: window.scrollY + window.innerHeight > 1000 ? 1 : 0,
            visibility: window.scrollY + window.innerHeight > 1000 ? "visible" : "hidden",
            transition: " all 0.3s ease",
            animation: window.scrollY + window.innerHeight > 1000 ? "bounce 1s infinite" : "none",
          }}
        />
        <style>
          {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
        </style>
      </div>
    </div>
  );
}
