import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { colors } from "assets/theme/color";
import { useNavigate } from "react-router-dom";
import authService from "services/authService";
const { Title, Text } = Typography;

const LoginForStudent = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [passwordVisible, setPasswordVisible] = useState(false);
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
      // Login cho học sinh
      data = await authService.loginStudent(values.username, values.password);
      navigate("/studentpage");
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
    navigate("/");
  };
  const isMobile = windowWidth < 768;
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.paleGreen,
        padding: "20px",
      }}
    >
      <div
        className="login-card"
        style={{
          backgroundColor: colors.white,
          borderRadius: "12px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          overflow: "hidden",
          animation: "fadeInUp 0.6s ease-out forwards",
        }}
      >
        {/* Decorative circle in the background */}
        <div
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            backgroundColor: colors.lightGreen,
            borderRadius: "50%",
            top: "-100px",
            right: "-100px",
            opacity: 0.5,
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
            borderRadius: "6px",
            transition: "all 0.2s ease",
            animation: "scaleIn 0.5s ease-out forwards",
          }}
          className="back-button"
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
              Welcome Back Student
            </Title>
            <Text
              style={{
                color: colors.darkGray,
                opacity: 0.7,
                display: "block",
                marginBottom: "30px",
              }}
            >
              Thêm một ngày học, thêm một cơ hội thành công!
            </Text>
          </div>

          <Form
            form={form}
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
                {
                  whitespace: false,
                  message: "Tên đăng nhập không được chứa khoảng trắng!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: colors.deepGreen }} />}
                placeholder="Tên đăng nhập"
                style={{
                  borderRadius: "8px",
                  borderColor: colors.lightGreen,
                  padding: "12px 16px",
                  height: "auto",
                }}
                onChange={(e) => {
                  const cleanValue = e.target.value.replace(/\s/g, "");
                  form.setFieldsValue({ username: cleanValue });
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedText = e.clipboardData.getData("text");
                  const cleanText = pastedText.replace(/\s/g, "");
                  form.setFieldsValue({ username: cleanText });
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu!",
                },
                {
                  whitespace: false,
                  message: "Mật khẩu không được chứa khoảng trắng!",
                },
                {
                  pattern: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]*$/,
                  message:
                    "Mật khẩu chỉ được dùng ký tự tiếng Anh (chữ cái, số và ký tự đặc biệt cơ bản)!",
                },
              ]}
            >
              <div style={{ position: "relative" }}>
                <Input
                  prefix={<LockOutlined style={{ color: colors.deepGreen }} />}
                  type={passwordVisible ? "text" : "password"}
                  placeholder="***************"
                  style={{
                    borderRadius: "8px",
                    borderColor: colors.lightGreen,
                    padding: "12px 16px",
                    height: "auto",
                  }}
                  onChange={(e) => {
                    // Loại bỏ ký tự tiếng Việt và khoảng trắng
                    const cleanValue = e.target.value
                      .normalize("NFKD") // Phân tách ký tự có dấu
                      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
                      .replace(/đ/g, "d") // Thay đ thành d
                      .replace(/Đ/g, "D") // Thay Đ thành D
                      .replace(/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/g, ""); // Chỉ giữ ký tự tiếng Anh
                    form.setFieldsValue({ password: cleanValue });
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData("text");
                    // Loại bỏ ký tự tiếng Việt và khoảng trắng khi paste
                    const cleanText = pastedText
                      .normalize("NFKD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/đ/g, "d")
                      .replace(/Đ/g, "D")
                      .replace(/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/g, "");
                    form.setFieldsValue({ password: cleanText });
                  }}
                />
                <Button
                  type="text"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    color: passwordVisible ? colors.deepGreen : colors.darkGray,
                    padding: "0 8px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: passwordVisible ? "rgba(142, 209, 176, 0.15)" : "transparent",
                    border: "none",
                    height: "32px",
                    transition: "all 0.2s",
                  }}
                >
                  {passwordVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </Button>
              </div>
            </Form.Item>

            <Form.Item style={{ marginBottom: "12px" }}>
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                {/* <Checkbox
                  onChange={(e) => {
                    setRemember(e.target.checked);
                  }}
                  style={{ color: colors.darkGray }}
                  defaultChecked
                >
                  Ghi nhớ đăng nhập
                </Checkbox> */}
                {/* <a
                  href="#forgot"
                  style={{
                    color: colors.deepGreen,
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </a> */}
              </div>
            </Form.Item>

            <Form.Item>
              <div className="signin-button">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    backgroundColor: colors.deepGreen,
                    borderColor: colors.deepGreen,
                    borderRadius: "8px",
                    height: "48px",
                    fontWeight: 600,
                    fontSize: "16px",
                    boxShadow: "0 4px 12px rgba(54, 138, 104, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                  className="hover-scale"
                >
                  Đăng nhập
                </Button>
              </div>
            </Form.Item>

            {/* <div style={{ textAlign: "center", margin: "20px 0" }}>
              <Divider plain style={{ color: colors.darkGray, opacity: 0.5 }}>
                Or continue with
              </Divider>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "16px",
                  marginTop: "20px",
                }}
              >
                <div className="social-button">
                  <Button
                    icon={<GoogleOutlined />}
                    size="large"
                    style={{
                      borderRadius: "8px",
                      height: "48px",
                      width: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderColor: colors.gray,
                      color: colors.darkGray,
                      transition: "transform 0.2s ease",
                    }}
                    className="hover-lift"
                  />
                </div>
                <div className="social-button">
                  <Button
                    icon={<GithubOutlined />}
                    size="large"
                    style={{
                      borderRadius: "8px",
                      height: "48px",
                      width: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderColor: colors.gray,
                      color: colors.darkGray,
                      transition: "transform 0.2s ease",
                    }}
                    className="hover-lift"
                  />
                </div>
              </div>
            </div> */}

            {/* <div style={{ textAlign: "center", marginTop: "30px" }}>
              <Text style={{ color: colors.darkGray }}>
                Don&apos;t have an account?{" "}
                <a
                  href="#register"
                  style={{
                    color: colors.deepGreen,
                    fontWeight: 600,
                  }}
                >
                  Sign Up
                </a>
              </Text>
            </div> */}
          </Form>
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
          transform: scale(1.02);
        }

        .hover-scale:active {
          transform: scale(0.98);
        }

        .hover-lift:hover {
          transform: translateY(-3px);
        }

        .social-button .ant-btn:hover {
          transform: translateY(-3px);
        }
        @keyframes floating {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
      `}</style>
    </div>
  );
};

export default LoginForStudent;
