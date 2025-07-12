import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Box,
  Stack,
  Button,
  Skeleton,
  Avatar,
  Paper,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
} from "@mui/material";
import {
  Group,
  Lock,
  LockOpen,
  Chat,
  DoNotDisturbOn,
  Message,
  MeetingRoom,
  ExpandMore,
  ExpandLess,
  VideoCall,
} from "@mui/icons-material";
import PageTitle from "../../../components/PageTitle";

const AllgroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [rooms, setRooms] = useState({});
  const [roomsLoading, setRoomsLoading] = useState({});
  const accessToken = sessionStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    GroupListAPI();
  }, []);

  const GroupListAPI = async () => {
    try {
      setLoading(true);
      const url = `https://chatboat-kpvg.onrender.com/api/user/grouplist`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get(url, { headers });

      if (response.data.error) {
        setGroups(response.data.data || []);
      } else {
        setGroups(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Failed to load groups. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleToggleRooms = async (groupId) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(groupId);
      if (!rooms[groupId]) {
        await fetchRooms(groupId);
      }
    }
  };

  const fetchRooms = async (groupId) => {
    try {
      setRoomsLoading((prev) => ({ ...prev, [groupId]: true }));
      const url = `https://chatboat-kpvg.onrender.com/api/user/room-group/${groupId}`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get(url, { headers });
      console.log("Response fo fetch rooms", response.data);
      setRooms((prev) => ({
        ...prev,
        [groupId]: response.data.data || [],
      }));
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms((prev) => ({
        ...prev,
        [groupId]: [],
      }));
    } finally {
      setRoomsLoading((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  const handleJoinRoom = (roomId) => {
    navigate(`/join-session/${roomId}`);
  };

  return (
    <>
      <PageTitle page={"All Groups"} />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={40} />
                    <Skeleton variant="text" width="40%" height={30} />
                    <Skeleton
                      variant="rectangular"
                      height={100}
                      sx={{ mt: 2 }}
                    />
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={30}
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : groups.length > 0 ? (
          <Grid container spacing={3}>
            {groups.map((group) => (
              <React.Fragment key={group._id}>
                <Grid item xs={12} sm={6} md={4} lg={4}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="div"
                          sx={{ fontWeight: 600 }}
                        >
                          {group.groupname}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            icon={
                              group.grouptype === "public" ? (
                                <LockOpen fontSize="small" />
                              ) : (
                                <Lock fontSize="small" />
                              )
                            }
                            label={
                              group.grouptype === "public"
                                ? "Public"
                                : "Private"
                            }
                            size="small"
                            color={
                              group.grouptype === "public"
                                ? "primary"
                                : "secondary"
                            }
                          />
                          <Chip
                            icon={
                              group.chat === "enabled" ? (
                                <Chat fontSize="small" />
                              ) : (
                                <DoNotDisturbOn fontSize="small" />
                              )
                            }
                            label={
                              group.chat === "enabled" ? "Chat On" : "Chat Off"
                            }
                            size="small"
                            color={
                              group.chat === "enabled" ? "success" : "error"
                            }
                          />
                        </Stack>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Created: {formatDate(group.createdAt)}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Members: {group.users?.length || 0}
                      </Typography>
                    </CardContent>

                    <Box sx={{ p: 2, display: "flex", gap: 1 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<MeetingRoom />}
                        onClick={() => handleToggleRooms(group._id)}
                        sx={{
                          backgroundColor: "secondary.main",
                          "&:hover": {
                            backgroundColor: "secondary.dark",
                          },
                        }}
                      >
                        {expandedGroup === group._id
                          ? "Hide Rooms"
                          : "View Rooms"}
                        {expandedGroup === group._id ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </Button>
                    </Box>
                  </Card>
                </Grid>

                {/* Rooms List */}
                {expandedGroup === group._id && (
                  <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2, mt: -2, mb: 2 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <MeetingRoom sx={{ mr: 1 }} /> Rooms in{" "}
                        {group.groupname}
                      </Typography>

                      {roomsLoading[group._id] ? (
                        <Box sx={{ p: 2 }}>
                          <Skeleton variant="rectangular" height={100} />
                          <Skeleton variant="text" sx={{ mt: 2 }} />
                          <Skeleton variant="text" width="60%" />
                        </Box>
                      ) : rooms[group._id]?.length > 0 ? (
                        <List>
                          {rooms[group._id].map((room) => (
                            <ListItem
                              key={room._id}
                              secondaryAction={
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<VideoCall />}
                                  onClick={() => handleJoinRoom(room._id)}
                                >
                                  Join Now
                                </Button>
                              }
                            >
                              <ListItemAvatar>
                                <Avatar>
                                  <MeetingRoom />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={room.roomName || `Room ${room._id}`}
                                secondary={`Room ID: ${room.roomId}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ p: 2, textAlign: "center" }}>
                          <Typography variant="body1" color="text.secondary">
                            No rooms available in this group
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              textAlign: "center",
            }}
          >
            <Group sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Groups Available
            </Typography>
            <Typography variant="body1" color="text.secondary">
              There are currently no groups to display.
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default AllgroupList;
