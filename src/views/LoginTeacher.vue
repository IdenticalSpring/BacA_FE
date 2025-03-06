<template>
  <div class="login-container">
    <a-card class="login-card">
      <div class="login-header">
        <img src="@/assets/logo.jpg" alt="Logo" class="logo" />
        <h2>Giáo Viên</h2>
      </div>

      <a-form layout="vertical" :model="formState" @finish="handleLogin">
        <a-form-item
          label="Email"
          name="email"
          :rules="[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]"
        >
          <a-input v-model:value="formState.email" placeholder="Nhập email" />
        </a-form-item>

        <a-form-item
          label="Mật khẩu"
          name="password"
          :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]"
        >
          <a-input-password v-model:value="formState.password" placeholder="Nhập mật khẩu" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" block class="login-btn">Đăng nhập</a-button>
        </a-form-item>
      </a-form>

      <div class="login-footer">
        <p>Bạn là quản lý? <a href="/loginAdmin">Đăng nhập tại đây </a></p>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";

const router = useRouter();
const formState = reactive({
  email: "",
  password: "",
});

const handleLogin = () => {
  if (formState.email === "admin@gmail.com" && formState.password === "123456") {
    message.success("Đăng nhập thành công!");
    router.push("/dashboard");
  } else {
    message.error("Email hoặc mật khẩu không đúng!");
  }
};
</script>

<style scoped>
/* Nền gradient */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url("@/assets/backgroundLogin.jpg") no-repeat center center;
  background-size: cover;
}

/* Card đăng nhập */
.login-card {
  width: 380px;
  padding: 30px;
  text-align: center;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

/* Header (Logo + Tiêu đề) */
.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.logo {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
}

/* Input */
.a-input,
.a-input-password {
  border-radius: 6px;
}

/* Hiệu ứng hover khi nhập */
.a-input:hover,
.a-input-password:hover {
  border-color: #1890ff;
}

/* Nút đăng nhập */
.login-btn {
  height: 40px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 6px;
  background-color: #1890ff;
  transition: background 0.3s;
}

.login-btn:hover {
  background-color: #40a9ff;
}

/* Footer (Quên mật khẩu & Đăng ký) */
.login-footer {
  margin-top: 15px;
  font-size: 14px;
  color: #555;
}

.forgot-password {
  color: #1890ff;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}
</style>
