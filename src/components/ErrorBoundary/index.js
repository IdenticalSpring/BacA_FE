import React from "react";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Card from "@mui/material/Card";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console
    console.error("❌ [ErrorBoundary] Component crashed:", error);
    console.error("📍 [ErrorBoundary] Error stack:", errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={3}>
          <Card sx={{ maxWidth: 800, p: 4 }}>
            <MDTypography variant="h3" color="error" mb={2}>
              ⚠️ Something went wrong
            </MDTypography>

            <MDTypography variant="body1" color="text" mb={3}>
              The page encountered an error and couldn&apos;t render properly. Please check the
              browser console for details or try reloading.
            </MDTypography>

            <MDBox
              sx={{
                backgroundColor: "#f5f5f5",
                p: 2,
                borderRadius: 1,
                mb: 3,
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              <MDTypography variant="caption" component="pre" color="error">
                <strong>Error:</strong> {this.state.error && this.state.error.toString()}
              </MDTypography>

              {this.state.errorInfo && (
                <MDTypography
                  variant="caption"
                  component="pre"
                  color="text"
                  sx={{ mt: 2, fontSize: "0.7rem" }}
                >
                  <strong>Component Stack:</strong>
                  {this.state.errorInfo.componentStack}
                </MDTypography>
              )}
            </MDBox>

            <MDBox display="flex" gap={2}>
              <MDButton variant="gradient" color="info" onClick={this.handleReload}>
                🔄 Reload Page
              </MDButton>

              <MDButton variant="outlined" color="secondary" onClick={() => window.history.back()}>
                ← Go Back
              </MDButton>
            </MDBox>
          </Card>
        </MDBox>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
