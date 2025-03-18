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
} from "@ant-design/icons";
import StatCard from "components/LandingPageComponent/StatCard";
import FeatureCard from "components/LandingPageComponent/FeatureCard";
import StepCard from "components/LandingPageComponent/StepCard";
import TestimonialCard from "components/LandingPageComponent/TestimonialCard";
import PricingCard from "components/LandingPageComponent/PricingCard";
import FaqItem from "components/LandingPageComponent/FaqItem";
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
        if (scrollPosition > 2350) setVisible((prev) => ({ ...prev, features: true }));
        if (scrollPosition > 1600) setVisible((prev) => ({ ...prev, statistics: true }));
        if (scrollPosition > 4500) setVisible((prev) => ({ ...prev, howItWorks: true }));
        if (scrollPosition > 6000) setVisible((prev) => ({ ...prev, testimonials: true }));
        if (scrollPosition > 7200) setVisible((prev) => ({ ...prev, pricing: true }));
        if (scrollPosition > 9200) setVisible((prev) => ({ ...prev, faq: true }));
        if (scrollPosition > 10100) setVisible((prev) => ({ ...prev, cta: true }));
      } else {
        if (scrollPosition > 1100) setVisible((prev) => ({ ...prev, features: true }));
        if (scrollPosition > 890) setVisible((prev) => ({ ...prev, statistics: true }));
        if (scrollPosition > 2100) setVisible((prev) => ({ ...prev, howItWorks: true }));
        if (scrollPosition > 3300) setVisible((prev) => ({ ...prev, testimonials: true }));
        if (scrollPosition > 4000) setVisible((prev) => ({ ...prev, pricing: true }));
        if (scrollPosition > 4700) setVisible((prev) => ({ ...prev, faq: true }));
        if (scrollPosition > 5500) setVisible((prev) => ({ ...prev, cta: true }));
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
  };
  // console.log(visible);

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
                    Home
                  </a>
                </li>
                <li>
                  <a href="#features" style={{ color: colors.darkGray, textDecoration: "none" }}>
                    Features
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
                  <a href="#pricing" style={{ color: colors.darkGray, textDecoration: "none" }}>
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#faq" style={{ color: colors.darkGray, textDecoration: "none" }}>
                    FAQ
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
              Login
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
                        Home
                      </a>
                    </li>
                    <li style={{ marginBottom: "1rem" }}>
                      <a
                        href="#features"
                        style={{ color: colors.darkGray, textDecoration: "none" }}
                      >
                        Features
                      </a>
                    </li>
                    <li style={{ marginBottom: "1rem" }}>
                      <a
                        href="#testimonials"
                        style={{ color: colors.darkGray, textDecoration: "none" }}
                      >
                        Testimonials
                      </a>
                    </li>
                    <li style={{ marginBottom: "1rem" }}>
                      <a href="#pricing" style={{ color: colors.darkGray, textDecoration: "none" }}>
                        Pricing
                      </a>
                    </li>
                    <li style={{ marginBottom: "1rem" }}>
                      <a href="#faq" style={{ color: colors.darkGray, textDecoration: "none" }}>
                        FAQ
                      </a>
                    </li>
                    <li style={{ marginBottom: "1rem" }}>
                      <a href="#contact" style={{ color: colors.darkGray, textDecoration: "none" }}>
                        Contact
                      </a>
                    </li>
                  </ul>
                </nav>
                <button
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
                  Login
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
              Transform your learning experience with our all-in-one study platform designed to make
              education enjoyable, effective, and personalized to your unique learning style.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
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
            </div>
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
          <StatCard number="25,000+" label="Happy Students" />
          <StatCard number="100+" label="Expert Courses" />
          <StatCard number="94%" label="Success Rate" />
          <StatCard number="4.9" label="App Rating" />
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
              WHAT WE OFFER
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
              Our platform offers everything you need to excel in your studies while maintaining a
              healthy work-life balance.
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
              title="Smart Scheduling"
              description="AI-powered study planning that adapts to your learning pace and schedule, optimizing your productivity."
              color={colors.lightGreen}
              delay={0.1}
            />
            <FeatureCard
              icon={<FileTextOutlined style={{ fontSize: "28px" }} />}
              title="Interactive Notes"
              description="Create dynamic study materials with multimedia integration, mind maps, and collaboration features."
              color={colors.lightGreen}
              delay={0.2}
            />
            <FeatureCard
              icon={<TeamOutlined style={{ fontSize: "28px" }} />}
              title="Collaborative Learning"
              description="Connect with classmates, form study groups, and share resources to enhance understanding."
              color={colors.lightGreen}
              delay={0.3}
            />
            <FeatureCard
              icon={<BellOutlined style={{ fontSize: "28px" }} />}
              title="Smart Reminders"
              description="Personalized notification system that helps you stay on track with your study goals and deadlines."
              color={colors.lightGreen}
              delay={0.4}
            />
            <FeatureCard
              icon={<TrophyOutlined style={{ fontSize: "28px" }} />}
              title="Achievement System"
              description="Gamified learning experience with badges, points, and rewards to keep you motivated."
              color={colors.lightGreen}
              delay={0.5}
            />
            <FeatureCard
              icon={<RocketOutlined style={{ fontSize: "28px" }} />}
              title="Progress Analytics"
              description="Detailed insights into your learning patterns, strengths, and areas for improvement."
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
              HOW IT WORKS
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
          background: colors.darkGray,
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
    </div>
  );
}
