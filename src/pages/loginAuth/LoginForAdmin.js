import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import authService from "services/authService";
import { ShieldOutlined } from "@mui/icons-material";
import { colors } from "assets/theme/color";
const { Title, Text } = Typography;

// Enhanced color palette
// export const colors = {
//   lightGreen: "#8ED1B0",
//   deepGreen: "#368A68",
//   white: "#FFFFFF",
//   gray: "#F5F5F5",
//   darkGray: "#333333",
//   accent: "#FFD166",
//   lightAccent: "#FFEDC2",
//   darkGreen: "#224922",
//   paleGreen: "#E8F5EE",
//   midGreen: "#5FAE8C",
//   errorRed: "#FF6B6B",
//   // Additional modern colors
//   mintGreen: "#C2F0D7",
//   paleBlue: "#E6F7FF",
//   softShadow: "rgba(0, 128, 96, 0.1)",
//   emerald: "#2ECC71",
//   highlightGreen: "#43D183",
//   safeGreen: "#27AE60",
//   borderGreen: "#A8E6C3",
// };

const LoginForAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    setError("");

    try {
      let data;
      // Login cho admin
      data = await authService.loginAdmin(values.username, values.password);
      navigate("/dashboard");
      message.success("Login successful");
    } catch (err) {
      console.log(err);
      message.error(err || "Login failed");
      setError(err || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/login");
  };

  const isMobile = windowWidth < 768;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: `linear-gradient(140deg, ${colors.paleGreen} 0%, ${colors.mintGreen} 50%, ${colors.paleBlue} 100%)`,
        padding: "20px",
      }}
    >
      <div
        className="login-card"
        style={{
          backgroundColor: colors.white,
          borderRadius: "16px",
          boxShadow: `0 8px 32px ${colors.softShadow}`,
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          overflow: "hidden",
          animation: "fadeInUp 0.6s ease-out forwards",
          border: `1px solid ${colors.borderGreen}`,
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            width: "250px",
            height: "250px",
            background: `linear-gradient(135deg, ${colors.lightGreen} 0%, ${colors.mintGreen} 100%)`,
            borderRadius: "50%",
            top: "-125px",
            right: "-125px",
            opacity: 0.5,
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "150px",
            height: "150px",
            background: `linear-gradient(135deg, ${colors.midGreen} 0%, ${colors.deepGreen} 100%)`,
            borderRadius: "50%",
            bottom: "-75px",
            left: "-75px",
            opacity: 0.3,
            zIndex: 0,
          }}
        />

        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={handleBack}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            color: colors.deepGreen,
            fontSize: "16px",
            padding: "4px 8px",
            borderRadius: "8px",
            transition: "all 0.25s ease",
            animation: "scaleIn 0.5s ease-out forwards",
            zIndex: 2,
          }}
          className="back-button hover-effect"
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            className="welcome-text"
            style={{
              animation: "scaleIn 0.5s ease-out forwards",
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: `linear-gradient(135deg, ${colors.safeGreen} 0%, ${colors.deepGreen} 100%)`,
                marginBottom: "16px",
                boxShadow: `0 4px 12px rgba(46, 204, 113, 0.3)`,
              }}
            >
              <ShieldOutlined style={{ fontSize: "28px", color: colors.white }} />
            </div>

            <Title
              level={2}
              style={{
                color: colors.deepGreen,
                marginBottom: "8px",
                fontWeight: 600,
                width: "100%",
                textAlign: "center",
              }}
            >
              Admin Portal
            </Title>
            <Text
              style={{
                color: colors.darkGray,
                opacity: 0.7,
                display: "block",
                marginBottom: "30px",
                textAlign: "center",
              }}
            >
              Sắp xếp, kiểm soát, phát triển – Tất cả trong tay bạn!
            </Text>
          </div>

          <Form
            name="login_form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên đăng nhập để tiếp tục!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: colors.deepGreen }} />}
                placeholder="Tên đăng nhập"
                style={{
                  borderRadius: "12px",
                  borderColor: colors.borderGreen,
                  padding: "12px 16px",
                  height: "auto",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  transition: "all 0.3s ease",
                }}
                className="input-hover-effect"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: colors.deepGreen }} />}
                placeholder="***************"
                style={{
                  borderRadius: "12px",
                  borderColor: colors.borderGreen,
                  padding: "12px 16px",
                  height: "auto",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  transition: "all 0.3s ease",
                }}
                className="input-hover-effect"
              />
            </Form.Item>

            <Form.Item>
              <div className="signin-button">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    background: `linear-gradient(90deg, ${colors.deepGreen} 0%, ${colors.emerald} 100%)`,
                    borderColor: colors.safeGreen,
                    borderRadius: "12px",
                    height: "50px",
                    fontWeight: 600,
                    fontSize: "16px",
                    boxShadow: "0 6px 16px rgba(46, 204, 113, 0.25)",
                    transition: "all 0.3s ease",
                    marginTop: "16px",
                  }}
                  className="hover-scale pulse-on-hover"
                >
                  Đăng nhập
                </Button>
              </div>
            </Form.Item>
          </Form>

          {/* <div style={{ textAlign: "center", marginTop: "16px" }}>
            <div
              className="security-badge"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: colors.mintGreen,
                borderRadius: "8px",
                padding: "8px 12px",
                margin: "0 auto",
                width: "fit-content",
                opacity: 0.85,
              }}
            >
              <ShieldOutlined style={{ color: colors.safeGreen, marginRight: "6px" }} />
              <Text style={{ color: colors.darkGreen, fontSize: "13px" }}>Bảo mật đa lớp</Text>
            </div>
          </div> */}
        </div>
      </div>

      {!isMobile && (
        <>
          <div
            className="floating-emoji"
            style={{
              position: "absolute",
              left: "5%",
              bottom: "10%",
              fontSize: "70px",
              opacity: "0.5",
              zIndex: 0,
              animation: "floating 5s ease-in-out infinite",
              transition: "all 0.3s ease",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
            }}
          >
            🔐
          </div>

          <div
            className="floating-emoji"
            style={{
              position: "absolute",
              right: "8%",
              top: "25%",
              fontSize: "70px",
              opacity: "0.5",
              zIndex: 0,
              animation: "floating 4s ease-in-out infinite 1s",
              transition: "all 0.3s ease",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
            }}
          >
            🛡️
          </div>

          <div
            className="floating-emoji"
            style={{
              position: "absolute",
              left: "15%",
              top: "20%",
              fontSize: "70px",
              opacity: "0.5",
              zIndex: 0,
              animation: "floating 6s ease-in-out infinite 0.5s",
              transition: "all 0.3s ease",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
            }}
          >
            📊
          </div>
        </>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
          }
          to {
            transform: scale(1);
          }
        }

        .hover-scale:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 20px rgba(46, 204, 113, 0.3);
        }

        .hover-scale:active {
          transform: scale(0.98);
        }
        
        .pulse-on-hover:hover {
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(46, 204, 113, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
          }
        }

        .hover-effect:hover {
          background: ${colors.paleGreen};
          color: ${colors.deepGreen};
        }
        
        .input-hover-effect:hover, .input-hover-effect:focus {
          border-color: ${colors.midGreen};
          box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.1);
        }

        .floating-emoji {
          transition: transform 0.3s ease;
        }
        
        .floating-emoji:hover {
          transform: scale(1.1) rotate(5deg);
          opacity: 0.7;
        }
        
        @keyframes floating {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        .security-badge {
          transition: all 0.3s ease;
        }
        
        .security-badge:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 128, 96, 0.15);
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default LoginForAdmin;
