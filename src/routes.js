/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Users from "layouts/users";
import Classes from "layouts/classes";
import Schedules from "layouts/schedules";
import Teachers from "layouts/teachers";
import Students from "layouts/students";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/admin-sign-in";
import SignUp from "layouts/authentication/sign-up";
import CreateClass from "layouts/classes/CreateClass";

// @mui icons
import Icon from "@mui/material/Icon";
import CreateSchedule from "layouts/schedules/CreateSchedule";
import CreateStudent from "layouts/students/CreateStudent";
import CreateTeacher from "layouts/teachers/CreateTeacher";
import StudentPage from "pages/students/studentPage";
import TeacherDashboard from "pages/teachers/teacherDashboard";
import PrivateRoute from "privateRoute";
import AuthPortal from "pages/loginAuth/loginAuth";
// import CreateLesson from "layouts/lessons/CreateLesson";
import Lessons from "layouts/lessons";
import LessonBySchedules from "layouts/lesson_by_schedules";
import TeacherPage from "pages/teachers/teacherPage";
import Homepage from "pages/Homepage";
import MainLogin from "pages/loginAuth/MainLogin";
import LoginForStudent from "pages/loginAuth/LoginForStudent";
import LoginForTeacher from "pages/loginAuth/LoginForTeacher";
import LoginForAdmin from "pages/loginAuth/LoginForAdmin";
import ManageLessons from "pages/teachers/ManageLessons";
import CreateLesson from "pages/teachers/CreateLesson";
import AttendancePage from "pages/teachers/attendanceCheck";
import TestManagement from "pages/admin/testManagement";
import EnterTestScore from "pages/teachers/enterTestScore";
import SkillManagement from "pages/admin/skillManagement";
import HomeWorks from "layouts/homeWorks";

import StudentCheckinStatistics from "layouts/Studentcheckinstatistics";

const routes = [
  {
    // type: "collapse",
    name: "Homepage",
    key: "homepage",
    icon: <Icon fontSize="small">homepage</Icon>,
    route: "/",
    component: <Homepage />,
  },
  {
    // type: "collapse",
    name: "MainLogin",
    key: "mainLogin",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/login",
    component: <MainLogin />,
  },
  {
    // type: "collapse",
    name: "LoginForStudent",
    key: "loginForStudent",
    icon: <Icon fontSize="small">login for student</Icon>,
    route: "/login/student",
    component: <LoginForStudent />,
  },
  {
    // type: "collapse",
    name: "LoginForTeacher",
    key: "loginForTeacher",
    icon: <Icon fontSize="small">login for teacher</Icon>,
    route: "/login/teacher",
    component: <LoginForTeacher />,
  },
  {
    // type: "collapse",
    name: "LoginForAdmin",
    key: "loginForAdmin",
    icon: <Icon fontSize="small">login for admin</Icon>,
    route: "/login/admin",
    component: <LoginForAdmin />,
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "StudentCheckIn",
    key: "studentCheckIn",
    icon: <Icon fontSize="small">Student CheckIn</Icon>,
    route: "/StudentCheckIn",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <StudentCheckinStatistics />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Classes",
    key: "classes",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/classes",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <CreateClass />
      </PrivateRoute>
    ),
  },
  // {
  //   type: "collapse",
  //   name: "Schedules",
  //   key: "schedules",
  //   icon: <Icon fontSize="small">table_view</Icon>,
  //   route: "/schedules",
  //   component: (
  //     <PrivateRoute allowedRoles={["admin"]}>
  //       <Schedules />
  //     </PrivateRoute>
  //   ),
  // },
  {
    type: "collapse",
    name: "Lessons",
    key: "lessons",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/lessons",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <Lessons />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Homeworks",
    key: "homeworks",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/homeworks",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <HomeWorks />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Lesson by schedule",
    key: "lesson_by_schedules",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/lesson_by_schedules",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <LessonBySchedules />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Teachers",
    key: "teachers",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/teachers",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <Teachers />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Test Management",
    key: "testManagement",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/testManagement",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <TestManagement />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Students",
    key: "students",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/students",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <Students />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Skill Management",
    key: "skillManagement",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/skillsManagement",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <SkillManagement />
      </PrivateRoute>
    ),
  },
  // {
  //   type: "collapse",
  //   name: "Users",
  //   key: "users",
  //   icon: <Icon fontSize="small">table_view</Icon>,
  //   route: "/users",
  //   component: (
  //     <PrivateRoute allowedRoles={["admin"]}>
  //       <Users />
  //     </PrivateRoute>
  //   ),
  // },
  // {
  //   type: "collapse",
  //   name: "Profile",
  //   key: "profile",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/profile",
  //   component: (
  //     <PrivateRoute allowedRoles={["admin"]}>
  //       <Profile />
  //     </PrivateRoute>
  //   ),
  // },
  // {
  //   // type: "collapse",
  //   name: "Sign In",
  //   key: "sign-in",
  //   icon: <Icon fontSize="small">login</Icon>,
  //   route: "/sign-in",
  //   component: <SignIn />,
  // },
  {
    name: "Student Page",
    key: "studentPage",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/studentpage",
    component: (
      <PrivateRoute allowedRoles={["admin", "student"]}>
        <StudentPage />
      </PrivateRoute>
    ),
  },
  // {
  //   name: "Auth Portal",
  //   key: "authPortal",
  //   icon: <Icon fontSize="small">login</Icon>,
  //   route: "/auth/sign-in",
  //   component: <AuthPortal />,
  // },
  {
    name: "Teacher Dashboard",
    key: "teacherDashboard",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/teacherdashboard",
    component: (
      <PrivateRoute allowedRoles={["admin", "teacher"]}>
        <TeacherDashboard />
      </PrivateRoute>
    ),
  },
  {
    name: "Teacher Page",
    key: "teacherPage",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/teacherpage",
    component: (
      <PrivateRoute allowedRoles={["admin", "teacher"]}>
        <TeacherPage />
      </PrivateRoute>
    ),
  },
  {
    name: "Enter Test Score",
    key: "enterTestScore",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/teacherpage/entertestscore",
    component: (
      <PrivateRoute allowedRoles={["admin", "teacher"]}>
        <EnterTestScore />
      </PrivateRoute>
    ),
  },
  {
    name: "Manage Lessons Page",
    key: "ManageLessons",
    icon: <Icon fontSize="small">Manage Lessons</Icon>,
    route: "/teacherpage/manageLessons",
    component: (
      <PrivateRoute allowedRoles={["admin", "teacher"]}>
        <ManageLessons />
      </PrivateRoute>
    ),
  },
  {
    name: "Create Lesson Page",
    key: "CreateLesson",
    icon: <Icon fontSize="small">Create Lesson</Icon>,
    route: "/teacherpage/createLesson",
    component: (
      <PrivateRoute allowedRoles={["admin", "teacher"]}>
        <CreateLesson />
      </PrivateRoute>
    ),
  },
  {
    name: "Attendance Check",
    key: "attendanceCheck",
    icon: <Icon fontSize="small">Create Lesson</Icon>,
    route: "/teacherpage/attendanceCheck",
    component: (
      <PrivateRoute allowedRoles={["admin", "teacher"]}>
        <AttendancePage />
      </PrivateRoute>
    ),
  },
  {
    name: "Create Class",
    route: "/classes/create-class",
    key: "create-class",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <CreateClass />
      </PrivateRoute>
    ),
  },
  {
    name: "Create Schedule",
    route: "/schedules/create-schedule",
    key: "create-schedule",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <CreateSchedule />
      </PrivateRoute>
    ),
  },
  {
    name: "Create Lesson",
    route: "/lessons/create-lesson",
    key: "create-lesson",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <CreateLesson />
      </PrivateRoute>
    ),
  },
  {
    name: "Create Student",
    route: "/students/create-student",
    key: "create-student",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <CreateStudent />
      </PrivateRoute>
    ),
  },
  {
    name: "Create Teacher",
    route: "/teachers/create-teacher",
    key: "create-teacher",
    component: (
      <PrivateRoute allowedRoles={["admin"]}>
        <CreateTeacher />
      </PrivateRoute>
    ),
  },
  // {
  //   type: "collapse",
  //   name: "Billing",
  //   key: "billing",
  //   icon: <Icon fontSize="small">receipt_long</Icon>,
  //   route: "/billing",
  //   component: <Billing />,
  // },
  // {
  //   type: "collapse",
  //   name: "RTL",
  //   key: "rtl",
  //   icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
  //   route: "/rtl",
  //   component: <RTL />,
  // },
  // {
  //   type: "collapse",
  //   name: "Notifications",
  //   key: "notifications",
  //   icon: <Icon fontSize="small">notifications</Icon>,
  //   route: "/notifications",
  //   component: <Notifications />,
  // },

  // {
  //   type: "collapse",
  //   name: "Sign Up",
  //   key: "sign-up",
  //   icon: <Icon fontSize="small">assignment</Icon>,
  //   route: "/authentication/sign-up",
  //   component: <SignUp />,
  // },
];

export default routes;
