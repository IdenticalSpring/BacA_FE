<template>
  <a-layout class="landing-page">
    <!-- Header -->
    <a-layout-header class="header">
      <div class="logo">MyBrand</div>
      <a-menu mode="horizontal" theme="dark" class="menu">
        <a-menu-item key="1">Trang chủ</a-menu-item>
        <a-menu-item key="2">Giới thiệu</a-menu-item>
        <a-menu-item key="3">Tính năng</a-menu-item>
        <a-menu-item key="4">Liên hệ</a-menu-item>
      </a-menu>
      <a-dropdown>
        <template #overlay>
          <a-menu @click="handleMenuClick">
            <a-menu-item key="admin">
              <UserOutlined />
              Quản lý
            </a-menu-item>
            <a-menu-item key="teacher">
              <UserOutlined />
              Giáo viên
            </a-menu-item>
            <a-menu-item key="student">
              <UserOutlined />
              Học sinh
            </a-menu-item>
          </a-menu>
        </template>
        <a-button>
          Đăng nhập
          <DownOutlined />
        </a-button>
      </a-dropdown>
    </a-layout-header>

    <!-- Banner -->
    <div class="banner">
      <h1>Chào mừng đến với MyBrand</h1>
      <p>Giải pháp tối ưu cho doanh nghiệp của bạn</p>
      <a-button type="primary" size="large">Bắt đầu ngay</a-button>
    </div>

    <!-- Phần giới thiệu -->
    <div class="section about">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :md="12">
          <img
            src="https://source.unsplash.com/500x300/?business,technology"
            alt="About Us"
            class="about-image"
          />
        </a-col>
        <a-col :xs="24" :md="12">
          <h2>Về chúng tôi</h2>
          <p>
            Chúng tôi cung cấp các giải pháp công nghệ giúp doanh nghiệp phát triển mạnh mẽ trong
            thời đại số.
          </p>
        </a-col>
      </a-row>
    </div>

    <!-- Tính năng -->
    <div class="section features">
      <h2>Tính năng nổi bật</h2>
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="8">
          <a-card hoverable class="feature-card">
            <template #title> Hiệu suất cao </template>
            <p>Hệ thống của chúng tôi hoạt động nhanh chóng, ổn định.</p>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8">
          <a-card hoverable class="feature-card">
            <template #title> Dễ sử dụng </template>
            <p>Giao diện thân thiện, ai cũng có thể sử dụng dễ dàng.</p>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8">
          <a-card hoverable class="feature-card">
            <template #title> Bảo mật cao </template>
            <p>Chúng tôi áp dụng các tiêu chuẩn bảo mật hàng đầu.</p>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- Phần liên hệ -->
    <div class="section contact">
      <h2>Liên hệ ngay</h2>
      <p>Để biết thêm thông tin, hãy liên hệ với chúng tôi.</p>
      <a-button type="primary" size="large">Liên hệ ngay</a-button>
    </div>

    <!-- Footer -->
    <a-layout-footer class="footer">
      <p>© 2025 MyBrand. All rights reserved.</p>
    </a-layout-footer>
  </a-layout>
</template>

<script lang="ts" setup>
import { UserOutlined, DownOutlined } from "@ant-design/icons-vue";
import type { MenuProps } from "ant-design-vue";
import { useRouter } from "vue-router";

const router = useRouter();

const handleMenuClick: MenuProps["onClick"] = (e) => {
  console.log("click", e);
  if (e.key === "admin") {
    router.push("/loginAdmin");
  } else if (e.key === "teacher") {
    router.push("/loginTeacher");
  } else if (e.key === "student") {
    router.push("/loginStudent");
  }
};
</script>

<style>
/* Tổng thể */
.landing-page {
  font-family: "Arial", sans-serif;
  text-align: center;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #001529;
  padding: 0 20px;
}

.logo {
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.menu {
  flex: 1;
  justify-content: center;
}

/* Banner */
.banner {
  background: url("https://source.unsplash.com/1600x700/?technology") center/cover no-repeat;
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
}

.banner h1 {
  font-size: 36px;
  margin-bottom: 10px;
}

.banner p {
  font-size: 18px;
  margin-bottom: 20px;
}

/* Các section */
.section {
  padding: 60px 20px;
}

.about {
  background: #f0f2f5;
}

.about-image {
  width: 100%;
  border-radius: 8px;
}

.features {
  background: white;
}

.feature-card {
  text-align: center;
}

.contact {
  background: #001529;
  color: white;
}

.contact p {
  margin-bottom: 20px;
}

/* Footer */
.footer {
  padding: 20px;
  background: #111;
  color: white;
  text-align: center;
}
</style>
