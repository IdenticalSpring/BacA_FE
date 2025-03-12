import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

const StudentPage = () => {
  return (
    <>
      {/* Navbar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Landing Page STUDENT
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h2" gutterBottom>
          Welcome to Our Platform
        </Typography>
        <Typography variant="h5" paragraph>
          Discover amazing features and start your journey with us today!
        </Typography>
        <Button variant="contained" color="primary" size="large">
          Get Started
        </Button>
      </Container>

      {/* Features Section */}
      <Container sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {["Fast", "Secure", "Reliable"].map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {feature}
                  </Typography>
                  <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Container sx={{ textAlign: "center", py: 6, backgroundColor: "#f5f5f5" }}>
        <Typography variant="h4" gutterBottom>
          Ready to get started?
        </Typography>
        <Button variant="contained" color="secondary" size="large">
          Sign Up Now
        </Button>
      </Container>
    </>
  );
};

export default StudentPage;
