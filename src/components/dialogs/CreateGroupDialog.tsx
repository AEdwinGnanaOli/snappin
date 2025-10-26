import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Close as CloseIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { getColorFromInitial } from "../../utils/colorUtils";
import type { UserData } from "../../services/firestoreService";

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onGroupCreate: (groupData: {
    name: string;
    description?: string;
    memberIds: string[];
  }) => void;
  allUsers: UserData[];
  currentUserId: string;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  open,
  onClose,
  onGroupCreate,
  allUsers,
  currentUserId,
}) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<UserData[]>([]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setGroupName("");
      setGroupDescription("");
      setSelectedMembers([]);
    }
  }, [open]);

  const handleMemberToggle = (user: UserData) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some((m) => m.uid === user.uid);
      if (isSelected) {
        return prev.filter((m) => m.uid !== user.uid);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (selectedMembers.length === 0) {
      alert("Please select at least one member");
      return;
    }

    onGroupCreate({
      name: groupName.trim(),
      description: groupDescription.trim() || undefined,
      memberIds: selectedMembers.map((m) => m.uid!),
    });

    onClose();
  };

  const handleClose = () => {
    setGroupName("");
    setGroupDescription("");
    setSelectedMembers([]);
    onClose();
  };

  const availableUsers = allUsers.filter((user) => user.uid !== currentUserId);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            minHeight: "400px",
          },
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
            autoFocus
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
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              {availableUsers.map((user) => {
                const isSelected = selectedMembers.some((m) => m.uid === user.uid);
                return (
                  <Chip
                    key={user.uid}
                    avatar={
                      <Avatar
                        src={user.photoURL || undefined}
                        sx={{
                          bgcolor: !user.photoURL
                            ? getColorFromInitial(user.name[0]?.toUpperCase())
                            : undefined,
                        }}
                      >
                        {!user.photoURL && user.name[0]?.toUpperCase()}
                      </Avatar>
                    }
                    label={user.name}
                    onClick={() => handleMemberToggle(user)}
                    onDelete={isSelected ? () => handleMemberToggle(user) : undefined}
                    deleteIcon={isSelected ? <CheckIcon /> : undefined}
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
                sx={{ mt: 1, display: "block" }}
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
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
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
          disabled={!groupName.trim() || selectedMembers.length === 0}
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
