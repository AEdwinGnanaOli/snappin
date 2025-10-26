import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  InputAdornment,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { getColorFromInitial } from "../../utils/colorUtils";
import type { UserData } from "../../services/firestoreService";

interface SearchUsersDialogProps {
  open: boolean;
  onClose: () => void;
  allUsers: UserData[];
  currentUserId: string;
  onUserSelect: (user: UserData) => void;
}

const SearchUsersDialog: React.FC<SearchUsersDialogProps> = ({
  open,
  onClose,
  allUsers,
  currentUserId,
  onUserSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allUsers.filter(
      (user) =>
        user.uid !== currentUserId &&
        (user.name.toLowerCase().includes(query) ||
          (user.email && user.email.toLowerCase().includes(query)))
    );

    setFilteredUsers(filtered);
  }, [searchQuery, allUsers, currentUserId]);

  const handleUserClick = (user: UserData) => {
    onUserSelect(user);
    onClose();
    setSearchQuery("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, height: "70vh", maxHeight: 600 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
            Search Users
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Search Input */}
        <TextField
          autoFocus
          fullWidth
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />

        {/* Results */}
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            maxHeight: 400,
            overflow: "auto",
          }}
        >
          {!searchQuery.trim() ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <SearchIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Start typing to search for users
              </Typography>
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No users found matching "{searchQuery}"
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredUsers.map((user) => (
                <ListItem key={user.uid} disablePadding divider>
                  <ListItemButton onClick={() => handleUserClick(user)}>
                    <ListItemAvatar>
                      <Avatar
                        src={user.photoURL || undefined}
                        sx={{
                          bgcolor: !user.photoURL
                            ? getColorFromInitial(
                                user.name[0]?.toUpperCase() || "?"
                              )
                            : undefined,
                        }}
                      >
                        {!user.photoURL && user.name[0]?.toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor:
                                user.status === "online"
                                  ? "#44b700"
                                  : "text.disabled",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {user.status === "online" ? "Online" : "Offline"}
                          </Typography>
                          {user.email && (
                            <>
                              <Typography variant="caption" color="text.disabled">
                                •
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {user.email}
                              </Typography>
                            </>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2, textAlign: "center" }}
        >
          Click on a user to start chatting
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default SearchUsersDialog;
