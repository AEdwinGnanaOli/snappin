import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Chip,
  Avatar,
  Typography,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from "@mui/material";
import { Close as CloseIcon, Check as CheckIcon } from "@mui/icons-material";
import { dummyContacts } from "../../utils/data";

const CreateGroupDialog = ({ open, onClose, onGroupCreate }) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleMemberToggle = (contact) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.find((m) => m.id === contact.id);
      if (isSelected) {
        return prev.filter((m) => m.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleCreate = () => {
    if (groupName.trim()) {
      onGroupCreate({
        name: `#${groupName}`,
        initial: groupName.charAt(0).toUpperCase(),
        members: selectedMembers,
        description: description,
        type: "group",
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setGroupName("");
    setDescription("");
    setSelectedMembers([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: "400px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight="600">
          Create New Group
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Group Name */}
          <TextField
            fullWidth
            label="Group Name"
            placeholder="Enter Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />

          {/* Group Members Selection */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight="600"
              sx={{ mb: 1.5, color: "text.primary" }}
            >
              Group Members
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                p: 2,
                bgcolor: "#F5F7FB",
                borderRadius: 2,
                minHeight: 100,
              }}
            >
              {dummyContacts.map((contact) => {
                const isSelected = selectedMembers.find(
                  (m) => m.id === contact.id
                );
                return (
                  <Chip
                    key={contact.id}
                    avatar={<Avatar src={contact.avatar} />}
                    label={contact.name}
                    onClick={() => handleMemberToggle(contact)}
                    onDelete={
                      isSelected ? () => handleMemberToggle(contact) : null
                    }
                    deleteIcon={isSelected ? <CheckIcon /> : null}
                    sx={{
                      bgcolor: isSelected ? "primary.main" : "white",
                      color: isSelected ? "white" : "text.primary",
                      "& .MuiChip-deleteIcon": {
                        color: isSelected ? "white" : "text.secondary",
                      },
                      "&:hover": {
                        bgcolor: isSelected ? "primary.dark" : "grey.100",
                      },
                      transition: "all 0.2s",
                    }}
                  />
                );
              })}
            </Box>
            {selectedMembers.length > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {selectedMembers.length} member
                {selectedMembers.length !== 1 ? "s" : ""} selected
              </Typography>
            )}
          </Box>

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            placeholder="Enter Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            px: 3,
            borderRadius: 2,
          }}
        >
          Close
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!groupName.trim()}
          sx={{
            bgcolor: "primary.main",
            textTransform: "none",
            px: 3,
            borderRadius: 2,
            "&:hover": {
              bgcolor: "primary.dark",
            },
          }}
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupDialog;
