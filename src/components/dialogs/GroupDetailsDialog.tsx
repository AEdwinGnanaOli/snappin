import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { getColorFromInitial } from "../../utils/colorUtils";
import type { UserData, Chat } from "../../services/firestoreService";
import {
  getUsersByIds,
  updateGroupInfo,
  addGroupMember,
  removeGroupMember,
} from "../../services/firestoreService";

interface GroupDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  chatData: Chat | null;
  currentUserId: string;
  allUsers: UserData[];
  onRefresh?: () => void;
}

const GroupDetailsDialog: React.FC<GroupDetailsDialogProps> = ({
  open,
  onClose,
  chatData,
  currentUserId,
  allUsers,
  onRefresh,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [members, setMembers] = useState<UserData[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = chatData?.admins?.includes(currentUserId) || chatData?.createdBy === currentUserId;

  useEffect(() => {
    if (chatData && open) {
      setGroupName(chatData.groupName || "");
      setGroupDescription(chatData.groupDescription || "");
      loadMembers();
    }
  }, [chatData, open]);

  const loadMembers = async () => {
    if (!chatData) return;

    try {
      const memberData = await getUsersByIds(chatData.participants);
      setMembers(memberData);
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  const handleSaveName = async () => {
    if (!chatData || !groupName.trim()) return;

    setLoading(true);
    try {
      await updateGroupInfo(chatData.id!, { name: groupName.trim() });
      setIsEditingName(false);
      onRefresh?.();
    } catch (error) {
      console.error("Error updating group name:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!chatData) return;

    setLoading(true);
    try {
      await updateGroupInfo(chatData.id!, { description: groupDescription.trim() });
      setIsEditingDescription(false);
      onRefresh?.();
    } catch (error) {
      console.error("Error updating group description:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!chatData) return;

    setLoading(true);
    try {
      await addGroupMember(chatData.id!, userId);
      await loadMembers();
      onRefresh?.();
    } catch (error) {
      console.error("Error adding member:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!chatData || userId === chatData.createdBy) return;

    if (window.confirm("Are you sure you want to remove this member?")) {
      setLoading(true);
      try {
        await removeGroupMember(chatData.id!, userId);
        await loadMembers();
        onRefresh?.();
      } catch (error) {
        console.error("Error removing member:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const availableUsers = allUsers.filter(
    (user) => !chatData?.participants.includes(user.uid!)
  );

  if (!chatData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: "90vh" },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={600}>
            Group Details
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Group Avatar */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Avatar
            src={chatData.groupPhoto}
            sx={{
              width: 100,
              height: 100,
              bgcolor: "primary.main",
              fontSize: "3rem",
            }}
          >
            {!chatData.groupPhoto && chatData.groupName?.[0]?.toUpperCase()}
          </Avatar>
        </Box>

        {/* Group Name */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Group Name
            </Typography>
            {isAdmin && !isEditingName && (
              <IconButton
                size="small"
                onClick={() => setIsEditingName(true)}
                sx={{ color: "primary.main" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          {isEditingName ? (
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
              />
              <IconButton
                size="small"
                onClick={handleSaveName}
                disabled={loading || !groupName.trim()}
                sx={{ color: "success.main" }}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  setIsEditingName(false);
                  setGroupName(chatData.groupName || "");
                }}
                sx={{ color: "error.main" }}
              >
                <CancelIcon />
              </IconButton>
            </Box>
          ) : (
            <Typography variant="body1">{chatData.groupName}</Typography>
          )}
        </Box>

        {/* Group Description */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Description
            </Typography>
            {isAdmin && !isEditingDescription && (
              <IconButton
                size="small"
                onClick={() => setIsEditingDescription(true)}
                sx={{ color: "primary.main" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          {isEditingDescription ? (
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                autoFocus
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={handleSaveDescription}
                  disabled={loading}
                  sx={{ color: "success.main" }}
                >
                  <CheckIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setIsEditingDescription(false);
                    setGroupDescription(chatData.groupDescription || "");
                  }}
                  sx={{ color: "error.main" }}
                >
                  <CancelIcon />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {chatData.groupDescription || "No description"}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Members Section */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Members ({members.length})
            </Typography>
            {isAdmin && (
              <Button
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => setShowAddMember(!showAddMember)}
                variant={showAddMember ? "contained" : "outlined"}
              >
                {showAddMember ? "Cancel" : "Add Member"}
              </Button>
            )}
          </Box>

          {/* Add Member Section */}
          {showAddMember && availableUsers.length > 0 && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                bgcolor: "background.default",
                borderRadius: 2,
                maxHeight: 200,
                overflow: "auto",
              }}
            >
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Select a user to add:
              </Typography>
              <List sx={{ p: 0 }}>
                {availableUsers.map((user) => (
                  <ListItem
                    key={user.uid}
                    dense
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleAddMember(user.uid!)}
                        disabled={loading}
                      >
                        <PersonAddIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.photoURL || undefined}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: !user.photoURL
                            ? getColorFromInitial(user.name[0]?.toUpperCase())
                            : undefined,
                        }}
                      >
                        {!user.photoURL && user.name[0]?.toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: user.status === "online" ? "#44b700" : "text.disabled",
                            }}
                          />
                          <Typography variant="caption">
                            {user.status === "online" ? "Online" : "Offline"}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Members List */}
          <List sx={{ p: 0 }}>
            {members.map((member) => {
              const isMemberAdmin = chatData.admins?.includes(member.uid!);
              const isCreator = chatData.createdBy === member.uid;

              return (
                <ListItem
                  key={member.uid}
                  secondaryAction={
                    isAdmin && !isCreator && member.uid !== currentUserId ? (
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveMember(member.uid!)}
                        disabled={loading}
                        sx={{ color: "error.main" }}
                      >
                        <PersonRemoveIcon />
                      </IconButton>
                    ) : null
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      src={member.photoURL || undefined}
                      sx={{
                        bgcolor: !member.photoURL
                          ? getColorFromInitial(member.name[0]?.toUpperCase())
                          : undefined,
                      }}
                    >
                      {!member.photoURL && member.name[0]?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography>{member.name}</Typography>
                        {isCreator && (
                          <Chip label="Creator" size="small" color="primary" />
                        )}
                        {isMemberAdmin && !isCreator && (
                          <Chip label="Admin" size="small" color="secondary" />
                        )}
                        {member.uid === currentUserId && (
                          <Chip label="You" size="small" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: member.status === "online" ? "#44b700" : "text.disabled",
                          }}
                        />
                        <Typography variant="caption">
                          {member.status === "online" ? "Online" : "Offline"}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupDetailsDialog;
