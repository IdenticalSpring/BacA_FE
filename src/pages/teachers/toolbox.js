import React from "react";
import { Box, Button } from "@mui/material";

const colors = {
  primary: "#FFC107",
  secondary: "#121212",
};

// eslint-disable-next-line react/prop-types
const Toolbox = ({ onManageLessons, onEditClass, onDeleteClass, onViewReport }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 2,
        p: 2,
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #ddd",
      }}
    >
      <Button
        variant="contained"
        sx={{
          backgroundColor: colors.primary,
          color: colors.secondary,
          "&:hover": { backgroundColor: colors.hover },
        }}
        onClick={onManageLessons}
      >
        Lesson
      </Button>
      <Button
        variant="contained"
        sx={{
          backgroundColor: colors.primary,
          color: colors.secondary,
          "&:hover": { backgroundColor: colors.hover },
        }}
        onClick={onEditClass}
      >
        Homework
      </Button>
      <Button
        variant="contained"
        sx={{
          backgroundColor: colors.primary,
          color: colors.secondary,
          "&:hover": { backgroundColor: colors.hover },
        }}
        onClick={onDeleteClass}
      >
        Lesson review
      </Button>
      <Button
        variant="contained"
        sx={{
          backgroundColor: colors.primary,
          color: colors.secondary,
          "&:hover": { backgroundColor: colors.hover },
        }}
        onClick={onViewReport}
      >
        Enter test scores
      </Button>
    </Box>
  );
};

export default Toolbox;
