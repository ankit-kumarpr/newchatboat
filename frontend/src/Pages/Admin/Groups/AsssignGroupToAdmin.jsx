import React, { useEffect, useState } from "react";
import PageTitle from "../../../components/PageTitle";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Modal,
  Box,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import { AssignmentInd, Group, CheckCircle } from "@mui/icons-material";

const AssignGroupToAdmin = () => {
  const accessToken = sessionStorage.getItem("accessToken");
  const [groups, setGroups] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await GroupListAPI();
        await AdminsListAPI();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group list
  const GroupListAPI = async () => {
    try {
      const url = `https://chatboat-kpvg.onrender.com/api/user/grouplist`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get(url, { headers });
      setGroups(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Admin list
  const AdminsListAPI = async () => {
    try {
      const url = `https://chatboat-kpvg.onrender.com/api/user/getalladmin`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get(url, { headers });
      console.log("admin list", response.data);
      setAdmins(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Assign group
  const GroupAssignAPI = async () => {
    setIsAssigning(true);
    try {
      const url = `https://chatboat-kpvg.onrender.com/api/user/assigngroup/${selectedAdmin._id}`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      const body = {
        groupIds: selectedGroups,
      };
      const response = await axios.post(url, body, { headers });
      console.log("Response of assing group api", response.data);
      // Refresh admin list to show updated groups
      await AdminsListAPI();
      handleCloseModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleOpenModal = (admin) => {
    setSelectedAdmin(admin);
    // Pre-select groups that the admin is already part of
    const adminGroups = admin.groups || [];
    setSelectedGroups(adminGroups);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAdmin(null);
    setSelectedGroups([]);
  };

  const handleGroupToggle = (groupId) => () => {
    const currentIndex = selectedGroups.indexOf(groupId);
    const newSelectedGroups = [...selectedGroups];

    if (currentIndex === -1) {
      newSelectedGroups.push(groupId);
    } else {
      newSelectedGroups.splice(currentIndex, 1);
    }

    setSelectedGroups(newSelectedGroups);
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: "80vh",
    overflowY: "auto",
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <PageTitle page={"Assign groups to admin"} />

      <Typography variant="h6" gutterBottom>
        Select an admin to manage their groups
      </Typography>

      <Grid container spacing={3}>
        {admins.map((admin) => (
          <Grid item xs={12} sm={6} md={4} key={admin._id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    {admin.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h6" component="div">
                    {admin.name}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Email:</strong> {admin.email}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Role:</strong> {admin.role}
                </Typography>

                <Box mt={2}>
                  <Chip
                    icon={<Group />}
                    label={`${admin.groups?.length || 0} Groups`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </CardContent>

              <Box p={2} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AssignmentInd />}
                  onClick={() => handleOpenModal(admin)}
                >
                  Manage Groups
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Group Assignment Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="assign-group-modal"
        aria-describedby="assign-groups-to-admin"
      >
        <Box sx={modalStyle}>
          {selectedAdmin && (
            <>
              <Typography
                id="assign-group-modal"
                variant="h6"
                component="h2"
                gutterBottom
              >
                Assign Groups to {selectedAdmin.name}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Available Groups
              </Typography>

              <List dense>
                {groups.map((group) => (
                  <ListItem
                    key={group._id}
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        onChange={handleGroupToggle(group._id)}
                        checked={selectedGroups.includes(group._id)}
                      />
                    }
                  >
                    <ListItemText
                      primary={group.groupname}
                      secondary={`Type: ${group.grouptype} • Members: ${
                        group.users?.length || 0
                      }`}
                    />
                  </ListItem>
                ))}
              </List>

              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button onClick={handleCloseModal} sx={{ mr: 2 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={GroupAssignAPI}
                  disabled={isAssigning}
                  startIcon={
                    isAssigning ? (
                      <CircularProgress size={20} />
                    ) : (
                      <CheckCircle />
                    )
                  }
                >
                  {isAssigning ? "Assigning..." : "Save Changes"}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default AssignGroupToAdmin;
