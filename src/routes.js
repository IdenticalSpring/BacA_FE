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
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import CreateClass from "layouts/classes/CreateClass";

// @mui icons
import Icon from "@mui/material/Icon";
import CreateSchedule from "layouts/schedules/CreateSchedule";
import CreateStudent from "layouts/students/CreateStudent";
import CreateTeacher from "layouts/teachers/CreateTeacher";
import StudentPortal from "pages/students/portalStudent";
import StudentPage from "pages/students/studentPage";
import TeacherPage from "pages/teachers/teacherPage";
import PrivateRoute from "privateRoute";
import TeacherPortal from "pages/teachers/portalTeacher";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: (
      <PrivateRoute>
        <Dashboard />
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
      <PrivateRoute>
        <Classes />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Schedules",
    key: "schedules",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/schedules",
    component: (
      <PrivateRoute>
        <Schedules />
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
      <PrivateRoute>
        <Teachers />
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
      <PrivateRoute>
        <Students />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Users",
    key: "users",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/users",
    component: (
      <PrivateRoute>
        <Users />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    ),
  },
  {
    // type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/sign-in",
    component: <SignIn />,
  },
  {
    name: "Student Portal",
    key: "studentportal",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/studentportal",
    component: <StudentPortal />,
  },
  {
    name: "Student Page",
    key: "studentPage",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/studentpage",
    component: <StudentPage />,
  },
  {
    name: "Teacher Portal",
    key: "teacherPortal",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/teacherportal",
    component: <TeacherPortal />,
  },
  {
    name: "Teacher Page",
    key: "teacherPage",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/teacherpage",
    component: <TeacherPage />,
  },
  {
    name: "Create Class",
    route: "/classes/create-class",
    key: "create-class",
    component: (
      <PrivateRoute>
        <CreateClass />
      </PrivateRoute>
    ),
  },
  {
    name: "Create Schedule",
    route: "/schedules/create-schedule",
    key: "create-schedule",
    component: (
      <PrivateRoute>
        <CreateSchedule />
      </PrivateRoute>
    ),
  },
  {
    name: "Create Student",
    route: "/students/create-student",
    key: "create-student",
    component: (
      <PrivateRoute>
        <CreateStudent />
      </PrivateRoute>
    ),
  },
  {
    name: "Create Teacher",
    route: "/teachers/create-teacher",
    key: "create-teacher",
    component: (
      <PrivateRoute>
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
