import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import type { GroupItem } from "../../types/chat";
import { getColorFromInitial } from "../../utils/colorUtils";

interface GroupListProps {
  groups: GroupItem[];
  selectedChat?: GroupItem | null;
  onChatSelect: (group: GroupItem) => void;
}

const GroupList: React.FC<GroupListProps> = ({
  groups,
  selectedChat,
  onChatSelect,
}) => {
  return (
    <List sx={{ p: 0 }}>
      {groups.map((group) => (
        <ListItem key={group.id} disablePadding>
          <ListItemButton
            selected={selectedChat?.id === group.id}
            onClick={() => onChatSelect(group)}
            sx={{
              px: 2,
              py: 1.5,
              "&.Mui-selected": {
                bgcolor: "rgba(108, 92, 231, 0.08)",
                borderLeft: "3px solid",
                borderColor: "primary.main",
              },
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: getColorFromInitial(group.initial) }}>
                {group.initial}
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {group.name}
                  </Typography>

                  {group.badge && (
                    <Chip
                      label={group.badge}
                      size="small"
                      sx={{
                        height: 20,
                        bgcolor: "#FFE5E5",
                        color: "#FF6B9D",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  )}

                  {group.unreadCount && group.unreadCount > 0 && (
                    <Chip
                      label={`${group.unreadCount}+`}
                      size="small"
                      sx={{
                        height: 20,
                        bgcolor: "#FFE5E5",
                        color: "#FF6B9D",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  )}
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default GroupList;
