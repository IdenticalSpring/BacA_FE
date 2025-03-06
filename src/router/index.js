import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/LoginAdmin.vue";
import DashboardAdmin from "../views/DashboardAdmin.vue";
import LoginTeacher from "../views/LoginTeacher.vue";
import LoginStudent from "@/views/LoginStudent.vue";
import LandingPage from "@/views/LandingPage.vue";

const routes = [
  { path: "/", redirect: "/landingPage" },
  { path: "/landingPage", component: LandingPage },
  { path: "/loginAdmin", component: Login },
  { path: "/loginTeacher", component: LoginTeacher },
  { path: "/loginStudent", component: LoginStudent },
  { path: "/dashboard", component: DashboardAdmin },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
