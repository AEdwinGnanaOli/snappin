import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Palette as PaletteIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useThemeContext } from "../context/ThemeContext";
import { themePresets } from "../utils/themePresets";
interface ThemeSettingsProps {
  open: boolean;
  onClose: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ open, onClose }) => {
  const { currentTheme, themeColors, setTheme, setCustomColors } =
    useThemeContext();

  const [customPrimary, setCustomPrimary] = useState<string>(
    themeColors.primary
  );
  const [customSecondary, setCustomSecondary] = useState<string>(
    themeColors.secondary
  );
  const [customBackground, setCustomBackground] = useState<string>(
    themeColors.background
  );
  const [customPaper, setCustomPaper] = useState<string>(themeColors.paper);

  const handlePresetSelect = (presetKey: keyof typeof themePresets) => {
    setTheme(presetKey);
  };

  const handleApplyCustom = () => {
    setCustomColors({
      name: "Custom",
      primary: customPrimary,
      secondary: customSecondary,
      background: customBackground,
      paper: customPaper,
      border: "rgba(0, 0, 0, 0.12)",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: "500px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PaletteIcon color="primary" />
          <Typography variant="h6" fontWeight="600">
            Theme Settings
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Theme Presets */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            Theme Presets
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {Object.entries(themePresets).map(([key, preset]) => (
              <Grid item size={{ xs: 6, sm: 4, md: 2 }} key={key}>
                <Paper
                  elevation={currentTheme === key ? 4 : 1}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    border:
                      currentTheme === key
                        ? "2px solid"
                        : "2px solid transparent",
                    borderColor:
                      currentTheme === key ? "primary.main" : "transparent",
                    transition: "all 0.3s",
                    position: "relative",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                  onClick={() =>
                    handlePresetSelect(key as keyof typeof themePresets)
                  }
                >
                  {currentTheme === key && (
                    <Chip
                      icon={<CheckIcon />}
                      label="Active"
                      size="small"
                      color="primary"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        height: 24,
                      }}
                    />
                  )}
                  <Box
                    sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: preset.primary,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: preset.secondary,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  </Box>
                  <Typography variant="caption" fontWeight="600">
                    {preset.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Custom Colors */}
        <Box>
          <Typography variant="subtitle1" fontWeight="600" gutterBottom>
            Custom Colors
          </Typography>
          <Grid container spacing={2}>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Primary Color"
                type="color"
                value={customPrimary}
                onChange={(e) => setCustomPrimary(e.target.value)}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Secondary Color"
                type="color"
                value={customSecondary}
                onChange={(e) => setCustomSecondary(e.target.value)}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Background Color"
                type="color"
                value={customBackground}
                onChange={(e) => setCustomBackground(e.target.value)}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Paper Color"
                type="color"
                value={customPaper}
                onChange={(e) => setCustomPaper(e.target.value)}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleApplyCustom}
              sx={{ textTransform: "none", flex: 1 }}
            >
              Apply Custom Theme
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSettings;
