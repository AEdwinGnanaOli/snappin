import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { getColorFromInitial } from "../../utils/colorUtils";
import type { UserData } from "../../services/firestoreService";

// Styled Badge for online status
const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": { transform: "scale(.8)", opacity: 1 },
    "100%": { transform: "scale(2.4)", opacity: 0 },
  },
}));

interface UserListProps {
  users: UserData[];
  onUserSelect: (user: UserData) => void;
  currentUserId?: string;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onUserSelect,
  currentUserId,
}) => {
  console.log(users);
  return (
    <List sx={{ p: 0 }}>
      {users.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No users found
          </Typography>
        </Box>
      ) : (
        users
          .filter((user) => user.uid !== currentUserId)
          .map((user) => (
            <ListItem key={user.uid} disablePadding>
              <ListItemButton
                onClick={() => onUserSelect(user)}
                sx={{
                  px: 2,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <ListItemAvatar>
                  {user.status === "online" ? (
                    <StyledBadge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      variant="dot"
                    >
                      {user.photoURL ? (
                        <Avatar src={user.photoURL} />
                      ) : (
                        <Avatar
                          sx={{
                            bgcolor: getColorFromInitial(
                              user.name[0]?.toUpperCase() || "?"
                            ),
                          }}
                        >
                          {user.name[0]?.toUpperCase() || "?"}
                        </Avatar>
                      )}
                    </StyledBadge>
                  ) : user.photoURL ? (
                    <Avatar src={user.photoURL} />
                  ) : (
                    <Avatar
                      sx={{
                        bgcolor: getColorFromInitial(
                          user.name[0]?.toUpperCase() || "?"
                        ),
                      }}
                    >
                      {user.name[0]?.toUpperCase() || "?"}
                    </Avatar>
                  )}
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight={600}>
                      {user.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {user.status === "online" ? "Online" : "Offline"}
                      </Typography>
                      {user.bio && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "150px",
                          }}
                        >
                          • {user.bio}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))
      )}
    </List>
  );
};

export default UserList;
