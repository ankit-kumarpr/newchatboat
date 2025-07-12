import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  CircularProgress,
  Badge,
  Chip,
  Stack,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Send,
  ArrowBack,
  Person,
  MoreVert,
  EmojiEmotions,
  AttachFile,
  Videocam,
  Mic,
  Call,
  CallEnd,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const GradientAppBar = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.common.white,
}));

const MessageBubble = styled(Box)(({ theme, own }) => ({
  maxWidth: "auto",
  padding: theme.spacing(1.5, 2),
  borderRadius: own ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
  backgroundColor: own ? theme.palette.primary.main : theme.palette.grey[100],
  color: own ? theme.palette.common.white : theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  wordBreak: "break-word",
  position: "relative",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    [own ? "right" : "left"]: -8,
    width: 0,
    height: 0,
    border: "8px solid transparent",
    borderTopColor: own ? theme.palette.primary.main : theme.palette.grey[100],
    borderRight: own ? "none" : undefined,
    borderLeft: own ? undefined : "none",
  },
}));

const LiveSession = () => {
  const { roomId } = useParams();
  const accessToken = sessionStorage.getItem("accessToken");
  const navigate = useNavigate();
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const messagesEndRef = useRef(null);

  // Audio call states
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const decodedToken = jwtDecode(accessToken);
  const userId = decodedToken.id;
  const userName = sessionStorage.getItem("userName");
  const userEmail = sessionStorage.getItem("userEmail");

  // Initialize WebRTC
  const setupWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      };
      const pc = new RTCPeerConnection(configuration);
      setPeerConnection(pc);

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        const remoteStream = new MediaStream();
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        setRemoteStream(remoteStream);
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      };

      // ICE Candidate handler
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("audio-ice-candidate", {
            roomId,
            candidate: event.candidate,
            senderId: userId,
          });
        }
      };

      return pc;
    } catch (error) {
      console.error("Error setting up WebRTC:", error);
      return null;
    }
  };

  useEffect(() => {
    const newSocket = io("https://chatboat-kpvg.onrender.com", {
      auth: {
        token: accessToken,
      },
    });

    setSocket(newSocket);

    const fetchInitialData = async () => {
      try {
        // Fetch group info
        const groupRes = await axios.get(
          `https://chatboat-kpvg.onrender.com/api/user/room/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log("group api response", groupRes);
        setGroupInfo(groupRes.data.room);

        // Fetch chat history
        const chatRes = await axios.get(
          `https://chatboat-kpvg.onrender.com/api/user/chat-history/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (chatRes.data.success) {
          const formattedMessages = chatRes.data.messages.map((msg) => ({
            ...msg,
            sender: {
              _id: msg.sender._id,
              name: msg.sender.name,
              email: msg.sender.email,
            },
          }));
          setMessages(formattedMessages);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setLoading(false);
      }
    };

    fetchInitialData();

    newSocket.emit("joinSession", {
      roomId: roomId,
      userId,
    });

    newSocket.on("receiveMessage", (message) => {
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          sender: {
            _id: message.sender._id,
            name: message.sender.name,
            email: message.sender.email,
          },
        },
      ]);
    });

    newSocket.on("onlineUsers", (users) => {
      console.log("Online user list", users);
      setOnlineUsers(users);
    });

    // Audio call handlers
    newSocket.on("audio-offer", async ({ offer, senderId }) => {
      if (isCallActive) return; // Already in a call

      setIncomingCall({ offer, senderId });
    });

    newSocket.on("audio-answer", async ({ answer, senderId }) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    newSocket.on("audio-ice-candidate", ({ candidate, senderId }) => {
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      newSocket.disconnect();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId, userId, accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle call initiation
  const startCall = async () => {
    const pc = await setupWebRTC();
    if (!pc || !socket) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("audio-offer", {
        roomId,
        offer,
        senderId: userId,
      });

      setIsCallActive(true);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  // Handle accepting incoming call
  const acceptCall = async () => {
    if (!incomingCall) return;

    const pc = await setupWebRTC();
    if (!pc || !socket) return;

    try {
      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("audio-answer", {
        roomId,
        answer,
        senderId: userId,
      });

      setIsCallActive(true);
      setIncomingCall(null);
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  // Handle rejecting incoming call
  const rejectCall = () => {
    setIncomingCall(null);
  };

  // Handle ending call
  const endCall = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }
    setIsCallActive(false);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    if (socket) {
      socket.emit("sendMessage", {
        sessionId: roomId,
        userId,
        message: newMessage,
      });
    }

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 0,
        background: "red !important",
        // bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <GradientAppBar
          sx={{
            p: 2,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
          // style={{background:"none"}}
          className="bg-danger"
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {groupInfo?.roomName || "Room Chat"}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              {!isCallActive && (
                <Tooltip title="Start Audio Call">
                  <IconButton
                    onClick={startCall}
                    sx={{ color: "common.white" }}
                    disabled={onlineUsers.length < 2}
                  >
                    <Call />
                  </IconButton>
                </Tooltip>
              )}
              {isCallActive && (
                <Tooltip title="End Call">
                  <IconButton
                    onClick={endCall}
                    sx={{ color: "error.main", bgcolor: "common.white" }}
                  >
                    <CallEnd />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Box>

          {/* Online users section */}
          <Box sx={{ width: "100%", mt: 4 }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                {onlineUsers.slice(0, 3).map((user) => (
                  <Box
                    key={user._id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: 60,
                    }}
                  >
                    <Tooltip title={user.name}>
                      <Avatar
                        alt={user.name}
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name
                        )}&background=random`}
                        sx={{
                          width: 50,
                          height: 50,
                          mb: 0.5,
                        }}
                      />
                    </Tooltip>
                    <Typography
                      variant="caption"
                      sx={{
                        textAlign: "center",
                        display: "block",
                        width: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 60,
                        color: "common.white",
                      }}
                    >
                      {user.name.split(" ")[0]}
                    </Typography>
                  </Box>
                ))}
                {onlineUsers.length > 3 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      label={`+${onlineUsers.length - 3}`}
                      size="small"
                      sx={{
                        height: 32,
                        width: 32,
                        borderRadius: "50%",
                        mb: 0.5,
                        color: "common.white",
                        bgcolor: "rgba(255,255,255,0.2)",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "common.white" }}
                    >
                      More
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Typography>
          </Box>
        </GradientAppBar>

        {/* Audio elements (hidden) */}
        <audio ref={localAudioRef} autoPlay muted />
        <audio ref={remoteAudioRef} autoPlay />

        {/* Messages area */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(https://www.transparenttextures.com/patterns/cubes.png)",
            backgroundAttachment: "fixed",
          }}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <img
                src="https://cdn3.iconfinder.com/data/icons/chat-bot-emoji/512/Open_Book-512.png"
                alt="No messages"
                width="120"
                style={{ opacity: 0.5, marginBottom: 16 }}
              />
              <Typography variant="h6">No messages yet</Typography>
              <Typography variant="body2">
                Start the conversation with your group
              </Typography>
            </Box>
          ) : (
            <List sx={{ pb: 0 }}>
              {messages.map((msg, index) => (
                <React.Fragment key={msg._id || index}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      justifyContent:
                        msg.sender._id === userId ? "flex-end" : "flex-start",
                      px: 1,
                      py: 0.5,
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        msg.sender._id === userId ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        maxWidth: "80%",
                        flexDirection:
                          msg.sender._id === userId ? "row-reverse" : "row",
                      }}
                    >
                      {msg.sender._id !== userId && (
                        <Tooltip
                          title={`${msg.sender.name} (${
                            onlineUsers.includes(msg.sender._id)
                              ? "Online"
                              : "Offline"
                          })`}
                          placement="left"
                        >
                          <Avatar
                            alt={msg.sender.name}
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              msg.sender.name
                            )}&background=random`}
                            sx={{ width: 32, height: 32, mr: 1 }}
                          />
                        </Tooltip>
                      )}

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems:
                            msg.sender._id === userId
                              ? "flex-end"
                              : "flex-start",
                        }}
                      >
                        {msg.sender._id !== userId && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: "bold",
                              color: "text.secondary",
                              mb: 0.5,
                              ml: 1,
                            }}
                          >
                            {msg.sender.name}
                          </Typography>
                        )}
                        <MessageBubble own={msg.sender._id === userId}>
                          <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                            {msg.message}
                          </Typography>
                        </MessageBubble>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            color: "text.disabled",
                            alignSelf:
                              msg.sender._id === userId
                                ? "flex-end"
                                : "flex-start",
                          }}
                        >
                          {formatTime(msg.sentAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Box>

        {/* Input area */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box display="flex" alignItems="center">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={4}
              sx={{
                mr: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "24px",
                  backgroundColor: "background.default",
                },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              sx={{
                minWidth: 48,
                height: 48,
                borderRadius: "50%",
                boxShadow: 2,
              }}
            >
              <Send />
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Incoming Call Dialog */}
      <Dialog open={!!incomingCall} onClose={rejectCall}>
        <DialogTitle>Incoming Audio Call</DialogTitle>
        <DialogContent>
          <Typography>
            {onlineUsers.find((u) => u._id === incomingCall?.senderId)?.name ||
              "Someone"}{" "}
            is calling...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={rejectCall} color="error" startIcon={<CallEnd />}>
            Reject
          </Button>
          <Button onClick={acceptCall} color="primary" startIcon={<Call />}>
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LiveSession;
