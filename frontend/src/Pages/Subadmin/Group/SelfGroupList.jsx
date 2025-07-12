import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../../components/PageTitle";
import axios from "axios";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  Box,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Button,
  Modal,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Group,
  Lock,
  LockOpen,
  Chat,
  DoNotDisturbOn,
  Person,
  MeetingRoom,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Visibility,
  Login,
} from "@mui/icons-material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const SelfGroupList = () => {
  const accessToken = sessionStorage.getItem("accessToken");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [roomData, setRoomData] = useState({
    roomId: "",
    roomName: "",
  });
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [groupRooms, setGroupRooms] = useState({});
  const [roomsLoading, setRoomsLoading] = useState({});
  const [creatingRoom, setCreatingRoom] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    GetYourgroupsList();
  }, []);

  const GetYourgroupsList = async () => {
    try {
      setLoading(true);
      const url = `https://chatboat-kpvg.onrender.com/api/user/admingroups`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.get(url, { headers });
      setGroups(response.data.groups || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleOpen = (group) => {
    setSelectedGroup(group);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedGroup(null);
    setRoomData({
      roomId: "",
      roomName: "",
    });
    setCreatingRoom(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoomData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const CreateRoomForGroup = async () => {
    try {
      if (!selectedGroup || !roomData.roomId || !roomData.roomName) return;

      setCreatingRoom(true);
      const url = `https://chatboat-kpvg.onrender.com/api/user/createroom`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const userIds = selectedGroup.users.map((user) => user._id);

      const payload = {
        roomId: roomData.roomId,
        roomName: roomData.roomName,
        groupId: selectedGroup._id,
        userId: userIds,
      };

      console.log("Creating room with payload:", payload);
      const response = await axios.post(url, payload, { headers });
      console.log("Room creation response:", response.data);

      // Force refresh the rooms list and keep group expanded
      await getRoomList(selectedGroup._id);
      setExpandedGroup(selectedGroup._id);

      handleClose();
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Please try again.");
    } finally {
      setCreatingRoom(false);
    }
  };

  const getRoomList = async (groupId) => {
    try {
      setRoomsLoading((prev) => ({ ...prev, [groupId]: true }));
      const url = `https://chatboat-kpvg.onrender.com/api/user/room-group/${groupId}`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      console.log("Fetching rooms for group:", groupId);
      const response = await axios.get(url, { headers });
      console.log("Rooms received:", response.data);

      setGroupRooms((prev) => ({
        ...prev,
        [groupId]: response.data.data || [],
      }));
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setGroupRooms((prev) => ({
        ...prev,
        [groupId]: [],
      }));
    } finally {
      setRoomsLoading((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  const toggleExpandGroup = (groupId) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(groupId);
      if (!groupRooms[groupId]) {
        getRoomList(groupId);
      }
    }
  };

  const handleJoinRoom = (roomId) => {
    console.log("Joining room with ID:", roomId);
    navigate(`/join-session/${roomId}`);
  };

  return (
    <>
      <PageTitle page={"My Groups"} />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={40} />
                    <Skeleton variant="text" width="40%" height={30} />
                    <Skeleton
                      variant="rectangular"
                      height={100}
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : groups.length > 0 ? (
          <Grid container spacing={3}>
            {groups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
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
                        variant="h5"
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
                            group.grouptype === "public" ? "Public" : "Private"
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
                          color={group.chat === "enabled" ? "success" : "error"}
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

                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 1, fontWeight: 500 }}
                    >
                      Members ({group.users?.length || 0})
                    </Typography>

                    <Paper
                      elevation={0}
                      sx={{
                        maxHeight: 150,
                        overflow: "auto",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <List dense>
                        {group.users?.map((user) => (
                          <ListItem key={user._id}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: "primary.main" }}>
                                <Person />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={user.name}
                              secondary={user.email}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </CardContent>

                  <Box sx={{ p: 2, display: "flex", gap: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<MeetingRoom />}
                      onClick={() => handleOpen(group)}
                    >
                      Create Room
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => toggleExpandGroup(group._id)}
                      endIcon={
                        expandedGroup === group._id ? (
                          <KeyboardArrowUp />
                        ) : (
                          <KeyboardArrowDown />
                        )
                      }
                    >
                      View Rooms
                    </Button>
                  </Box>

                  <Collapse
                    in={expandedGroup === group._id}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Box sx={{ p: 2, pt: 0 }}>
                      {roomsLoading[group._id] ? (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 2,
                          }}
                        >
                          <Skeleton variant="circular" width={40} height={40} />
                        </Box>
                      ) : groupRooms[group._id]?.length > 0 ? (
                        <TableContainer component={Paper}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Room Name</TableCell>
                                <TableCell>Room ID</TableCell>
                                <TableCell align="right">Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {groupRooms[group._id].map((room) => (
                                <TableRow key={room._id}>
                                  <TableCell>{room.roomName}</TableCell>
                                  <TableCell>{room.roomId}</TableCell>
                                  <TableCell align="right">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      startIcon={<Login />}
                                      onClick={() => handleJoinRoom(room._id)}
                                    >
                                      Join Now
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            py: 3,
                            textAlign: "center",
                          }}
                        >
                          <MeetingRoom
                            sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
                          />
                          <Typography variant="body1" color="text.secondary">
                            No rooms created yet
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50vh",
              textAlign: "center",
            }}
          >
            <Group sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Admin Groups Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You don't have any admin groups yet. Create one to get started!
            </Typography>
          </Box>
        )}
      </Container>

      {/* Create Room Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Room</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Room ID"
              name="roomId"
              value={roomData.roomId}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Room Name"
              name="roomName"
              value={roomData.roomName}
              onChange={handleInputChange}
              required
            />
            {selectedGroup && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                This room will be created for group: {selectedGroup.groupname}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={creatingRoom}>
            Cancel
          </Button>
          <Button
            onClick={CreateRoomForGroup}
            variant="contained"
            disabled={!roomData.roomId || !roomData.roomName || creatingRoom}
          >
            {creatingRoom ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SelfGroupList;
