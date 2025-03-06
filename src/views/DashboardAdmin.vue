<template>
  <a-layout class="dashboard-container">
    <!-- Sidebar -->
    <a-layout-sider v-model:collapsed="collapsed" collapsible class="sidebar">
      <div class="logo">Admin Panel</div>
      <a-menu theme="dark" mode="inline" v-model:selectedKeys="selectedKeys">
        <a-menu-item key="1">
          <template #icon><DashboardOutlined /></template>
          Dashboard
        </a-menu-item>
        <a-menu-item key="2">
          <template #icon><UserOutlined /></template>
          Người dùng
        </a-menu-item>
        <a-menu-item key="3">
          <template #icon><SettingOutlined /></template>
          Cài đặt
        </a-menu-item>
        <a-menu-item key="4" @click="handleLogout">
          <template #icon><LogoutOutlined /></template>
          Đăng xuất
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- Nội dung chính -->
    <a-layout>
      <a-layout-header class="header">
        <div class="header-title">Dashboard</div>
        <div class="header-right">
          <a-avatar src="https://i.pravatar.cc/40" />
          <span class="username">Admin</span>
        </div>
      </a-layout-header>

      <a-layout-content class="content">
        <!-- Các thẻ thống kê -->
        <a-row :gutter="[16, 16]">
          <a-col :xs="24" :sm="12" :md="8">
            <a-card class="stat-card">
              <template #title>Số người dùng</template>
              <p class="stat-value">1,245</p>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8">
            <a-card class="stat-card">
              <template #title>Doanh thu</template>
              <p class="stat-value">$12,340</p>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8">
            <a-card class="stat-card">
              <template #title>Đơn hàng</template>
              <p class="stat-value">320</p>
            </a-card>
          </a-col>
        </a-row>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref } from "vue";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";
import { useRouter } from "vue-router";

const collapsed = ref(false);
const selectedKeys = ref(["1"]);
const router = useRouter();

const handleLogout = () => {
  router.push("/loginAdmin");
};
</script>

<style scoped>
/* Tổng thể */
.dashboard-container {
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  height: 100vh;
}

.logo {
  color: white;
  text-align: center;
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
}

/* Header */
.header {
  background: white;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
}

.username {
  margin-left: 10px;
  font-size: 16px;
}

/* Nội dung */
.content {
  padding: 20px;
  background: #f0f2f5;
}

/* Thẻ thống kê */
.stat-card {
  text-align: center;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
}
</style>
