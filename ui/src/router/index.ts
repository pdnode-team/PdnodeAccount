import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import TerraView from "@/views/TerraView.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/terra", name: "terra", component: TerraView },
    { path: "/register", name: "register", component: RegisterView },
    { path: "/login", name: "login", component: LoginView },
    {
      path: "/settings",
      name: "settings",
      component: () => import("@/views/HomeView.vue"),
    },
    {
      path: "/delete-account",
      name: "delete-account",
      component: () => import("@/views/DeleteAccount.vue"),
    },
    {
      path: "/confirm-delete",
      name: "confirm-delete",
      component: () => import("@/views/ConfirmDelete.vue"),
    },
    {
      path: "/help",
      name: "help",
      component: () => import("@/views/Help.vue"),
    },
    {
      path: "/forget-password",
      name: "forget-password",
      component: () => import("@/views/ForgetPassword.vue"),
    },
    {
      path: "/@:userid",
      name: "profile",
      component: () => import("@/views/ProfileView.vue"),
    },
    {
      path: "/otp",
      name: "profile",
      component: () => import("@/views/OTPView.vue"),
    },
  ],
});

export default router;
