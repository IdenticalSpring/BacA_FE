// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
// import Card from "@mui/material/Card";
// import Switch from "@mui/material/Switch";
// import Grid from "@mui/material/Grid";
// import MuiLink from "@mui/material/Link";
// import FacebookIcon from "@mui/icons-material/Facebook";
// import GitHubIcon from "@mui/icons-material/GitHub";
// import GoogleIcon from "@mui/icons-material/Google";
// import MDBox from "components/MDBox";
// import MDTypography from "components/MDTypography";
// import MDInput from "components/MDInput";
// import MDButton from "components/MDButton";
// import BasicLayout from "layouts/authentication/components/BasicLayout";
// import bgImage from "assets/images/bg-sign-in-basic.jpeg";
// import authService from "services/authService";
// import { Alert } from "@mui/material";

// function TeacherPortal() {
//   const [rememberMe, setRememberMe] = useState(false);
//   const [formData, setFormData] = useState({ username: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSetRememberMe = () => setRememberMe(!rememberMe);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const data = await authService.loginTeacher(formData.username, formData.password);
//       console.log("Login successful:", data);
//       navigate("/teacherpage");
//     } catch (err) {
//       setError(err); // Gán lỗi để hiển thị
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <BasicLayout image={bgImage}>
//       <Card>
//         <MDBox
//           variant="gradient"
//           bgColor="info"
//           borderRadius="lg"
//           coloredShadow="info"
//           mx={2}
//           mt={-3}
//           p={2}
//           mb={1}
//           textAlign="center"
//         >
//           <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
//             Teacher Portal
//           </MDTypography>
//           <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
//             <Grid item xs={2}>
//               <MDTypography component={MuiLink} href="#" variant="body1" color="white">
//                 <FacebookIcon color="inherit" />
//               </MDTypography>
//             </Grid>
//             <Grid item xs={2}>
//               <MDTypography component={MuiLink} href="#" variant="body1" color="white">
//                 <GitHubIcon color="inherit" />
//               </MDTypography>
//             </Grid>
//             <Grid item xs={2}>
//               <MDTypography component={MuiLink} href="#" variant="body1" color="white">
//                 <GoogleIcon color="inherit" />
//               </MDTypography>
//             </Grid>
//           </Grid>
//         </MDBox>
//         <MDBox pt={4} pb={3} px={3}>
//           <MDBox component="form" role="form" onSubmit={handleSubmit}>
//             {/* Hiển thị thông báo lỗi nếu có */}
//             {error && (
//               <MDBox mb={2}>
//                 <Alert severity="error">{error}</Alert>
//               </MDBox>
//             )}
//             <MDBox mb={2}>
//               <MDInput
//                 type="text"
//                 label="Username"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//               />
//             </MDBox>
//             <MDBox mb={2}>
//               <MDInput
//                 type="password"
//                 label="Password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 fullWidth
//                 required
//               />
//             </MDBox>
//             <MDBox display="flex" alignItems="center" ml={-1}>
//               <Switch checked={rememberMe} onChange={handleSetRememberMe} />
//               <MDTypography
//                 variant="button"
//                 fontWeight="regular"
//                 color="text"
//                 onClick={handleSetRememberMe}
//                 sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
//               >
//                 &nbsp;&nbsp;Remember me
//               </MDTypography>
//             </MDBox>
//             <MDBox mt={4} mb={1}>
//               <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
//                 {loading ? "Signing in..." : "Sign In"}
//               </MDButton>
//             </MDBox>
//             <MDBox mt={3} mb={1} textAlign="center">
//               <MDTypography variant="button" color="text">
//                 Don&apos;t have an account?{" "}
//                 <MDTypography
//                   component={Link}
//                   to="/sign-up"
//                   variant="button"
//                   color="info"
//                   fontWeight="medium"
//                   textGradient
//                 >
//                   Sign Up
//                 </MDTypography>
//               </MDTypography>
//             </MDBox>
//           </MDBox>
//         </MDBox>
//       </Card>
//     </BasicLayout>
//   );
// }

// export default TeacherPortal;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import authService from "services/authService";
import { Alert } from "@mui/material";

function AuthPortal() {
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tabIndex, setTabIndex] = useState(0); // 0: Teacher, 1: Student
  const navigate = useNavigate();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);
  const handleTabChange = (_, newValue) => setTabIndex(newValue);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let data;
      if (tabIndex === 0) {
        // Login cho giáo viên
        data = await authService.loginTeacher(formData.username, formData.password);
        navigate("/teacherdashboard");
      } else {
        // Login cho học sinh
        data = await authService.loginStudent(formData.username, formData.password);
        navigate("/studentpage");
      }
      console.log("Login successful:", data);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            {tabIndex === 0 ? "Teacher Portal" : "Student Portal"}
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GitHubIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GoogleIcon color="inherit" />
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>

        {/* Tabs Chuyển Đổi Giữa Teacher & Student */}
        <MDBox px={3} pt={2}>
          <Tabs value={tabIndex} onChange={handleTabChange} centered>
            <Tab label="Teacher" />
            <Tab label="Student" />
          </Tabs>
        </MDBox>

        <MDBox pt={2} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            {error && (
              <MDBox mb={2}>
                <Alert severity="error">{error}</Alert>
              </MDBox>
            )}
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Are you administrator?{" "}
                <MDTypography
                  component={Link}
                  to="/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Here
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default AuthPortal;
