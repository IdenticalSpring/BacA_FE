import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { colors } from "assets/theme/color";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import { Button, Grid, Box } from "@mui/material";
import { PlayCircle, Youtube, Music, GamepadIcon } from "lucide-react";

function extractYouTubeId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

function HomeworkDetailModal({ open, onClose, homework }) {
  const youtubeVideoId = homework?.linkYoutube ? extractYouTubeId(homework.linkYoutube) : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: colors.deepGreen,
          color: colors.white,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 2,
        }}
      >
        <MDTypography variant="h5" color="white">
          Homework Details
        </MDTypography>
        <Button
          onClick={onClose}
          variant="contained"
          color="error"
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Close
        </Button>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: 3,
          backgroundColor: "#f5f5f5",
        }}
      >
        {homework && (
          <Grid container spacing={3}>
            {/* Left Column - Video and Audio */}
            <Grid item xs={12} md={5}>
              {/* YouTube Embed */}
              {youtubeVideoId && (
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "16/9",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: 2,
                    marginBottom: 2,
                  }}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>
              )}

              {/* Audio Player */}
              {homework.linkSpeech && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "white",
                    borderRadius: 3,
                    padding: 2,
                    boxShadow: 1,
                  }}
                >
                  <Music size={24} color={colors.deepGreen} style={{ marginRight: 10 }} />
                  <audio
                    controls
                    src={homework.linkSpeech}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                    }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </Box>
              )}
            </Grid>

            {/* Right Column - homework Details */}
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: 3,
                  padding: 3,
                  boxShadow: 1,
                }}
              >
                <MDTypography variant="h4" gutterBottom sx={{ color: colors.deepGreen }}>
                  {homework.title}
                </MDTypography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    marginTop: 2,
                  }}
                >
                  <MDTypography variant="body1" color="text">
                    <strong>Level:</strong> {homework.level}
                  </MDTypography>
                  <MDTypography variant="body1" color="text">
                    <strong>Teacher:</strong> {homework.TeacherId}
                  </MDTypography>

                  {homework.linkYoutube && (
                    <MDTypography variant="body1" color="text">
                      <strong>YouTube Link:</strong>
                      <a
                        href={homework.linkYoutube}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: colors.deepGreen,
                          marginLeft: "8px",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <Youtube size={20} style={{ marginRight: 5 }} />
                        Open in YouTube
                      </a>
                    </MDTypography>
                  )}
                  {homework.linkGame && (
                    <MDTypography variant="body1" color="text">
                      <strong>Game Link:</strong>
                      <a
                        href={homework.linkGame}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: colors.deepGreen,
                          marginLeft: "8px",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <GamepadIcon size={20} style={{ marginRight: 5 }} />
                        Open in Game
                      </a>
                    </MDTypography>
                  )}
                </Box>

                <Box
                  sx={{
                    marginTop: 3,
                    backgroundColor: "#f9f9f9",
                    borderRadius: 2,
                    padding: 2,
                  }}
                >
                  <MDTypography variant="h6" gutterBottom>
                    Description
                  </MDTypography>
                  <div
                    dangerouslySetInnerHTML={{ __html: homework.description }}
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      paddingRight: 10,
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default HomeworkDetailModal;

HomeworkDetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  homework: PropTypes.shape({
    title: PropTypes.string,
    level: PropTypes.string,
    TeacherId: PropTypes.string,
    linkYoutube: PropTypes.string,
    linkGame: PropTypes.string,
    linkSpeech: PropTypes.string,
    description: PropTypes.string,
  }),
};
