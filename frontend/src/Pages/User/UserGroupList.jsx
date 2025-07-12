import axios from "axios";
import React, { useEffect, useState } from "react";
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
  IconButton,
  Alert,
  CircularProgress,
  Modal,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Group,
  Lock,
  LockOpen,
  Chat,
  DoNotDisturbOn,
  Person,
  ArrowForward,
  VideoCall,
  Schedule,
  Feedback,
  MeetingRoom,
} from "@mui/icons-material";
import PageTitle from "../../components/PageTitle";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const UserGroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [roomsModalOpen, setRoomsModalOpen] = useState(false);
  const [groupRooms, setGroupRooms] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const accessToken = sessionStorage.getItem("accessToken");
  const decodedToken = jwtDecode(accessToken);
  const userId = decodedToken.id;
  const navigate = useNavigate();

  useEffect(() => {
    GetGroupsapi();
  }, []);

  const GetGroupsapi = async () => {
    try {
      setLoading(true);
      const url = `https://chatboat-kpvg.onrender.com/api/user/getusergroup`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get(url, { headers });
      console.log("Response of group list api", response.data);
      setGroups(response.data.groups || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRoom = async (groupId, groupName) => {
    try {
      const url = `https://chatboat-kpvg.onrender.com/api/user/room-group/${groupId}`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.get(url, { headers });
      console.log("rooms api response", response.data);

      if (response.data.error === false && response.data.data?.length > 0) {
        setGroupRooms(response.data.data);
        setSelectedGroupName(groupName);
        setRoomsModalOpen(true);
      } else {
        Swal.fire({
          title: "No Rooms",
          text: "No rooms found for this group",
          icon: "info",
        });
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Something went wrong",
        icon: "error",
      });
    }
  };

  const handleJoinRoom = (roomId) => {
    navigate(`/join-session/${roomId}`);
  };

  const handleCloseRoomsModal = () => {
    setRoomsModalOpen(false);
    setGroupRooms([]);
    setSelectedGroupName("");
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleOpenFeedback = () => {
    setFeedbackOpen(true);
  };

  const handleCloseFeedback = () => {
    setFeedbackOpen(false);
    setFeedbackType("");
    setFeedbackMessage("");
    setSelectedGroup("");
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackType || !feedbackMessage || !selectedGroup) {
      alert("Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      const url = `https://chatboat-kpvg.onrender.com/api/user/submitfeedback`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const requestBody = {
        type: feedbackType,
        message: feedbackMessage,
        group: selectedGroup,
        customerRef_no: userId,
      };

      const response = await axios.post(url, requestBody, { headers });

      if (response.data.error === false) {
        Swal.fire({
          title: "Good job!",
          text: "Thank you for your feedback",
          icon: "success",
        });
        handleCloseFeedback();
      } else {
        alert(response.data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageTitle page={"User Groups"} />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Feedback />}
            onClick={handleOpenFeedback}
          >
            Submit Feedback
          </Button>
        </Box>

        {/* Rooms Modal */}
        <Modal
          open={roomsModalOpen}
          onClose={handleCloseRoomsModal}
          aria-labelledby="rooms-modal-title"
          aria-describedby="rooms-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 1,
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <Typography
              id="rooms-modal-title"
              variant="h5"
              component="h2"
              gutterBottom
            >
              Rooms for {selectedGroupName}
            </Typography>

            {groupRooms.length > 0 ? (
              <List sx={{ width: "100%" }}>
                {groupRooms.map((room) => (
                  <ListItem
                    key={room._id}
                    secondaryAction={
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleJoinRoom(room._id)}
                        startIcon={<MeetingRoom />}
                      >
                        Join Now
                      </Button>
                    }
                    sx={{
                      mb: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <MeetingRoom />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={room.roomName}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            Room ID: {room.roomId}
                          </Typography>
                          <br />
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            Created: {formatDate(room.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 100,
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No rooms available for this group
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button onClick={handleCloseRoomsModal}>Close</Button>
            </Box>
          </Box>
        </Modal>

        {/* Feedback Modal */}
        <Modal
          open={feedbackOpen}
          onClose={handleCloseFeedback}
          aria-labelledby="feedback-modal-title"
          aria-describedby="feedback-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 1,
            }}
          >
            <Typography
              id="feedback-modal-title"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Submit Feedback
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="feedback-type-label">Feedback Type</InputLabel>
              <Select
                labelId="feedback-type-label"
                value={feedbackType}
                label="Feedback Type"
                onChange={(e) => setFeedbackType(e.target.value)}
              >
                <MenuItem value="Live Session">Live Session</MenuItem>
                <MenuItem value="Bug">Bug</MenuItem>
                <MenuItem value="Feature">Feature</MenuItem>
                <MenuItem value="UI/UX">UI/UX</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="group-label">Group</InputLabel>
              <Select
                labelId="group-label"
                value={selectedGroup}
                label="Group"
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                {groups.map((group) => (
                  <MenuItem key={group._id} value={group._id}>
                    {group.groupname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button onClick={handleCloseFeedback}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleSubmitFeedback}
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : "Submit"}
              </Button>
            </Box>
          </Box>
        </Modal>

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
                        {group.users?.slice(0, 3).map((user) => (
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
                        {group.users?.length > 3 && (
                          <ListItem>
                            <Typography variant="body2" color="text.secondary">
                              +{group.users.length - 3} more members
                            </Typography>
                          </ListItem>
                        )}
                      </List>
                    </Paper>
                  </CardContent>

                  <Box sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<MeetingRoom />}
                      onClick={() => handleViewRoom(group._id, group.groupname)}
                    >
                      View Rooms
                    </Button>
                  </Box>
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
              No Groups Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You haven't joined any groups yet. Join one to get started!
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default UserGroupList;
