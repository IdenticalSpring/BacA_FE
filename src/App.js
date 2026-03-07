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

import { useState, useEffect, useMemo } from "react";
// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 React routes
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import PrivateRoute from "privateRoute";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ─── In-app browser → redirect to system browser ────────────────────────────
// Runs synchronously at module evaluation time (after all imports are
// resolved, but before the App component renders anything) so there is no
// flash of content inside the in-app browser.
;(function redirectIfInAppBrowser() {
  const ua = navigator.userAgent || "";

  // 1. Known in-app browser signatures (covers the most common apps).
  const knownInApp = [
    /FBAN|FBAV/,          // Facebook
    /Instagram/,          // Instagram
    /Twitter/,            // Twitter / X
    /ZaloApp|zalo\/[0-9]/,// Zalo (careful: "zalo" alone can appear in some hostnames)
    /MicroMessenger/,     // WeChat
    /Line\/[0-9]/,        // Line
    /BytedanceWebview|TikTok|musical_ly/, // TikTok / ByteDance
    /Snapchat/,           // Snapchat
    /LinkedInApp/,        // LinkedIn
    /GSA\//,              // Google Search App (iOS)
    /Pinterest\//,        // Pinterest
    /Viber/,              // Viber
    /Telegram/,           // Telegram in-app
  ];

  const isKnownInApp = knownInApp.some((re) => re.test(ua));

  // 2. Generic Android WebView: UA contains the "wv)" flag that the OS
  //    injects for embedded WebViews.
  const isAndroidWebView = /android/i.test(ua) && /wv\)/i.test(ua);

  if (!isKnownInApp && !isAndroidWebView) return;

  const url = window.location.href;

  if (/android/i.test(ua)) {
    // Android: intent:// scheme tells the OS to open the URL in Chrome.
    // S.browser_fallback_url falls back to the system default browser
    // when Chrome is not installed.
    const encodedFallback = encodeURIComponent(url);
    window.location.replace(
      `intent:${url}#Intent;scheme=https;` +
      `action=android.intent.action.VIEW;` +
      `package=com.android.chrome;` +
      `S.browser_fallback_url=${encodedFallback};end`
    );
  } else {
    // iOS: programmatic Safari opens require a user gesture.
    // Redirect to a lightweight interstitial with a single tap button.
    const interstitial =
      `${window.location.origin}/open-in-browser.html` +
      `?url=${encodeURIComponent(url)}`;
    window.location.replace(interstitial);
  }
})();
// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const location = useLocation();
  const hideSidenavPaths = [
    "/studentportal",
    "/teacherportal",
    "/",
    "/login",
    "/login/teacher",
    "/login/student",
    "/login/admin",
    "/studentpage",
    "/teacherdashboard",
    "/teacherpage",
    "/teacherpage/manageLessons",
    "/teacherpage/attendanceCheck",
    "/teacherpage/entertestscore",
    "/do-homework",
  ];

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);
  // useEffect(() => {
  //   fetch(`${API_BASE_URL}/contentpage/adsenseId`)
  //     // fetch("http://localhost:8000/contentpage/adsenseId")
  //     .then((res) => res.text()) // 👈 Dùng .text() vì response là string
  //     .then((data) => {
  //       const pubId = data || "ca-pub-XXXXXXX";
  //       const script = document.createElement("script");
  //       // console.log(data);
  //       script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`;
  //       script.async = true;
  //       script.crossOrigin = "anonymous";

  //       document.head.appendChild(script);
  //     });
  // }, []);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return (
          <Route
            exact
            path={route.route}
            element={
              route.private ? <PrivateRoute>{route.component}</PrivateRoute> : route.component
            }
            key={route.key}
          />
        );
      }

      return null;
    });

  // const configsButton = (
  //   <MDBox
  //     display="flex"
  //     justifyContent="center"
  //     alignItems="center"
  //     width="3.25rem"
  //     height="3.25rem"
  //     bgColor="white"
  //     shadow="sm"
  //     borderRadius="50%"
  //     position="fixed"
  //     right="2rem"
  //     bottom="2rem"
  //     zIndex={99}
  //     color="dark"
  //     sx={{ cursor: "pointer" }}
  //     onClick={handleConfiguratorOpen}
  //   >
  //     <Icon fontSize="small" color="inherit">
  //       settings
  //     </Icon>
  //   </MDBox>
  // );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {layout === "dashboard" && !hideSidenavPaths.includes(location.pathname) && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="Material Dashboard 2"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            {/* <Configurator />
            {configsButton} */}
          </>
        )}
        {layout === "vr" && !hideSidenavPaths.includes(location.pathname) && <Configurator />}
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && !hideSidenavPaths.includes(location.pathname) && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName="Material Dashboard 2"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          {/* <Configurator />
          {configsButton} */}
        </>
      )}
      {layout === "vr" && !hideSidenavPaths.includes(location.pathname) && <Configurator />}
      <Routes>
        {getRoutes(routes)}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}
