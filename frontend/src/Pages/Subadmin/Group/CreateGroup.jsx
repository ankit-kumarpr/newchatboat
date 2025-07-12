import React, { useEffect, useState } from "react";
import PageTitle from "../../../components/PageTitle";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Checkbox,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";
import {
  Add,
  Group,
  Lock,
  LockOpen,
  Chat,
  DoNotDisturbOn,
  Close,
  FilterAlt,
  ClearAll,
  PersonAdd,
  PersonRemove,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const CreateGroup = () => {
  const accessToken = sessionStorage.getItem("accessToken");
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [openRemoveUserModal, setOpenRemoveUserModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [usersToRemove, setUsersToRemove] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("public");
  const [chatStatus, setChatStatus] = useState("enabled");
  const [filters, setFilters] = useState({
    groupType: "all",
    chatStatus: "all",
  });
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    GroupListAPI();
    UserListAPI();
  }, []);

  // Modal handlers
  const handleOpenCreateModal = () => setOpenCreateModal(true);
  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setGroupName("");
    setGroupType("public");
    setChatStatus("enabled");
    setSelectedUsers([]);
  };

  const handleOpenAddUserModal = (group) => {
    setSelectedGroup(group);
    const existingUserIds =
      group.users?.map((user) =>
        typeof user === "string" ? user : user._id
      ) || [];
    setSelectedUsers(existingUserIds);
    setOpenAddUserModal(true);
  };

  const handleCloseAddUserModal = () => {
    setOpenAddUserModal(false);
    setSelectedUsers([]);
    setSelectedGroup(null);
  };

  const handleOpenRemoveUserModal = (group) => {
    setSelectedGroup(group);
    setUsersToRemove([]); // Start with empty selection
    setOpenRemoveUserModal(true);
  };

  const handleCloseRemoveUserModal = () => {
    setOpenRemoveUserModal(false);
    setUsersToRemove([]);
    setSelectedGroup(null);
  };

  // API Calls
  const CreateGroupAPI = async () => {
    try {
      const url = `https://chatboat-kpvg.onrender.com/api/user/create-group`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      const requestBody = {
        groupname: groupName,
        grouptype: groupType,
        chat: chatStatus,
        users: selectedUsers,
      };

      const response = await axios.post(url, requestBody, { headers });
      if (response.data.error == false) {
        Swal.fire({
          title: "Success!",
          text: "Group Created Successfully",
          icon: "success",
        });
        GroupListAPI();
        handleCloseCreateModal();
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to create group",
        icon: "error",
      });
    }
  };

  const AddUserToGroupAPI = async () => {
    try {
      if (!selectedGroup) return;

      const url = `https://chatboat-kpvg.onrender.com/api/user/add-users/${selectedGroup._id}`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      const requestBody = {
        users: selectedUsers,
      };

      const response = await axios.put(url, requestBody, { headers });

      if (response.data.error === false) {
        Swal.fire({
          title: "Success!",
          text: "Users updated in group successfully",
          icon: "success",
        });
        GroupListAPI();
        handleCloseAddUserModal();
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message || "Failed to update users in group",
        icon: "error",
      });
    }
  };

  const RemoveUserFromGroupAPI = async () => {
    try {
      if (!selectedGroup || usersToRemove.length === 0) return;

      const url = `https://chatboat-kpvg.onrender.com/api/user/remove-user/${selectedGroup._id}`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      const requestBody = {
        users: usersToRemove,
      };

      const response = await axios.put(url, requestBody, { headers });

      if (response.data.error === false) {
        Swal.fire({
          title: "Success!",
          text: "Users removed from group successfully",
          icon: "success",
        });
        GroupListAPI();
        handleCloseRemoveUserModal();
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message || "Failed to remove users from group",
        icon: "error",
      });
    }
  };

  const GroupListAPI = async () => {
    try {
      const url = `https://chatboat-kpvg.onrender.com/api/user/grouplist`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.get(url, { headers });
      setGroups(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const UserListAPI = async () => {
    try {
      const url = `https://chatboat-kpvg.onrender.com/api/user/alluserlist`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.get(url, { headers });
      setUsers(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  // Helper functions
  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleUserToRemoveSelect = (userId) => {
    setUsersToRemove((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      groupType: "all",
      chatStatus: "all",
    });
  };

  const filteredGroups = groups.filter((group) => {
    const typeMatch =
      filters.groupType === "all" || group.grouptype === filters.groupType;
    const chatMatch =
      filters.chatStatus === "all" || group.chat === filters.chatStatus;
    return typeMatch && chatMatch;
  });

  const isUserInGroup = (userId) => {
    if (!selectedGroup) return false;
    return selectedGroup.users?.some(
      (groupUser) =>
        (typeof groupUser === "string" ? groupUser : groupUser._id) === userId
    );
  };

  const getGroupMemberIds = () => {
    if (!selectedGroup) return [];
    return (
      selectedGroup.users?.map((user) =>
        typeof user === "string" ? user : user._id
      ) || []
    );
  };

  return (
    <>
      <PageTitle page={"Group Management"} />

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <FilterAlt color="primary" />
              <Typography variant="subtitle1">Filters:</Typography>
            </Box>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Group Type</InputLabel>
              <Select
                value={filters.groupType}
                onChange={(e) =>
                  handleFilterChange("groupType", e.target.value)
                }
                label="Group Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Chat Status</InputLabel>
              <Select
                value={filters.chatStatus}
                onChange={(e) =>
                  handleFilterChange("chatStatus", e.target.value)
                }
                label="Chat Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="enabled">Enabled</MenuItem>
                <MenuItem value="disable">Disabled</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<ClearAll />}
              onClick={resetFilters}
              size="small"
            >
              Reset
            </Button>
          </Paper>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateModal}
            sx={{
              minWidth: 150,
              alignSelf: { xs: "flex-end", sm: "center" },
            }}
          >
            Create Group
          </Button>
        </Box>

        <Grid container spacing={3}>
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography variant="h6" component="div">
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

                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Created: {new Date(group.createdAt).toLocaleDateString()}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" gutterBottom>
                      Members: {group.users?.length || 0}
                    </Typography>
                  </CardContent>

                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<PersonAdd />}
                      onClick={() => handleOpenAddUserModal(group)}
                      size="small"
                    >
                      Add Users
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PersonRemove />}
                      onClick={() => handleOpenRemoveUserModal(group)}
                      size="small"
                      color="error"
                      disabled={!group.users?.length}
                    >
                      Remove Users
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Group sx={{ fontSize: 60, color: "text.disabled" }} />
                <Typography variant="h6" color="text.secondary">
                  No groups found
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Create Group Modal */}
      <Modal
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        aria-labelledby="create-group-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "80%", md: "60%" },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography id="create-group-modal" variant="h5" component="h2">
              Create New Group
            </Typography>
            <IconButton onClick={handleCloseCreateModal}>
              <Close />
            </IconButton>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                margin="normal"
                required
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Group Type</InputLabel>
                <Select
                  value={groupType}
                  onChange={(e) => setGroupType(e.target.value)}
                  label="Group Type"
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Chat Status</InputLabel>
                <Select
                  value={chatStatus}
                  onChange={(e) => setChatStatus(e.target.value)}
                  label="Chat Status"
                >
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disable">Disabled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Select Members ({selectedUsers.length} selected)
              </Typography>

              <Paper sx={{ maxHeight: 300, overflow: "auto" }}>
                <List dense>
                  {users.map((user) => (
                    <ListItem
                      key={user._id}
                      secondaryAction={
                        <Checkbox
                          edge="end"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleUserSelect(user._id)}
                        />
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          alt={user.name}
                          src="/static/images/avatar/1.jpg"
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={user.email}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>

          <Box
            sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            <Button onClick={handleCloseCreateModal} variant="outlined">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={CreateGroupAPI}
              disabled={!groupName || !groupType || !chatStatus}
              startIcon={<Add />}
            >
              Create Group
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Add User to Group Modal */}
      <Modal
        open={openAddUserModal}
        onClose={handleCloseAddUserModal}
        aria-labelledby="add-user-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "80%", md: "60%" },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography id="add-user-modal" variant="h5" component="h2">
              Manage Users in {selectedGroup?.groupname}
            </Typography>
            <IconButton onClick={handleCloseAddUserModal}>
              <Close />
            </IconButton>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Select Members ({selectedUsers.length} selected)
          </Typography>

          <Paper sx={{ maxHeight: 400, overflow: "auto", mb: 3 }}>
            <List dense>
              {users.map((user) => {
                const isExisting = isUserInGroup(user._id);
                return (
                  <ListItem
                    key={user._id}
                    sx={{
                      backgroundColor: isExisting ? "#f5f5f5" : "inherit",
                    }}
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserSelect(user._id)}
                      />
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt={user.name}
                        src="/static/images/avatar/1.jpg"
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <>
                          {user.name}
                          {isExisting && (
                            <Chip
                              label="Member"
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </>
                      }
                      secondary={user.email}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={handleCloseAddUserModal} variant="outlined">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={AddUserToGroupAPI}
              disabled={selectedUsers.length === 0}
              startIcon={<PersonAdd />}
            >
              Update Users
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Remove User from Group Modal */}
      <Modal
        open={openRemoveUserModal}
        onClose={handleCloseRemoveUserModal}
        aria-labelledby="remove-user-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "80%", md: "60%" },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography id="remove-user-modal" variant="h5" component="h2">
              Remove Users from {selectedGroup?.groupname}
            </Typography>
            <IconButton onClick={handleCloseRemoveUserModal}>
              <Close />
            </IconButton>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Select Users to Remove ({usersToRemove.length} selected)
          </Typography>

          <Paper sx={{ maxHeight: 400, overflow: "auto", mb: 3 }}>
            <List dense>
              {users
                .filter((user) => isUserInGroup(user._id))
                .map((user) => (
                  <ListItem
                    key={user._id}
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        checked={usersToRemove.includes(user._id)}
                        onChange={() => handleUserToRemoveSelect(user._id)}
                      />
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt={user.name}
                        src="/static/images/avatar/1.jpg"
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <>
                          {user.name}
                          <Chip
                            label="Current Member"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        </>
                      }
                      secondary={user.email}
                    />
                  </ListItem>
                ))}
            </List>
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={handleCloseRemoveUserModal} variant="outlined">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={RemoveUserFromGroupAPI}
              disabled={usersToRemove.length === 0}
              startIcon={<PersonRemove />}
              color="error"
            >
              Remove Selected
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default CreateGroup;
