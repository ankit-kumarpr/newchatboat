import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import PageTitle from "../../components/PageTitle";
import axios from "axios";
import {
  Person,
  Block,
  CheckCircle,
  Search,
  Circle,
  AdminPanelSettings,
  ExpandMore,
  History,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [openBanModal, setOpenBanModal] = useState(false);
  const [openAdminBanModal, setOpenAdminBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [adminBanReason, setAdminBanReason] = useState("");
  const [banType, setBanType] = useState("temporary");
  const [adminBanType, setAdminBanType] = useState("temporary");
  const [bannedUntil, setBannedUntil] = useState("");
  const [adminBannedUntil, setAdminBannedUntil] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [adminFilterStatus, setAdminFilterStatus] = useState("all");
  const [banHistory, setBanHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedForHistory, setSelectedForHistory] = useState(null);
  const [selectedType, setSelectedType] = useState(""); // 'user' or 'admin'
  const accessToken = sessionStorage.getItem("accessToken");

  useEffect(() => {
    fetchUserData();
    fetchAdminData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://chatboat-kpvg.onrender.com/api/user/alluserlist",
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const transformedData = response.data.data.map((user, index) => ({
        ...user,
        srNo: index + 1,
        banStatus: user.isBanned?.status || false,
      }));

      setUsers(transformedData || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      setAdminLoading(true);
      const response = await axios.get(
        "https://chatboat-kpvg.onrender.com/api/user/getalladmin",
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const transformedData = response.data.data.map((admin, index) => ({
        ...admin,
        srNo: index + 1,
        banStatus: admin.isBanned?.status || false,
      }));

      setAdmins(transformedData || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setAdminLoading(false);
    }
  };

  const getBanHistory = async (userId, type) => {
    try {
      setHistoryLoading(true);
      setSelectedForHistory(userId);
      setSelectedType(type);

      const url = `https://chatboat-kpvg.onrender.com/api/user/adminbanhistory/${userId}`;
      console.log("user Id in history api", userId);
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Ban history response:", response.data);
      setBanHistory(response.data.history || []);
    } catch (error) {
      console.error("Error fetching ban history:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to fetch ban history",
        icon: "error",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenBanModal = (user) => {
    setSelectedUser(user);
    setOpenBanModal(true);
  };

  const handleOpenAdminBanModal = (admin) => {
    setSelectedAdmin(admin);
    setOpenAdminBanModal(true);
  };

  const handleCloseBanModal = () => {
    setOpenBanModal(false);
    setBanReason("");
    setBanType("temporary");
    setBannedUntil("");
    setSelectedUser(null);
  };

  const handleCloseAdminBanModal = () => {
    setOpenAdminBanModal(false);
    setAdminBanReason("");
    setAdminBanType("temporary");
    setAdminBannedUntil("");
    setSelectedAdmin(null);
  };

  const handleBanUser = async () => {
    try {
      const requestBody = {
        reason: banReason,
        banType: banType,
        bannedUntil: banType === "temporary" ? bannedUntil : null,
      };

      const response = await axios.put(
        `https://chatboat-kpvg.onrender.com/api/user/userban/${selectedUser._id}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.error === false) {
        Swal.fire({
          title: "Success!",
          text: "User has been banned successfully",
          icon: "success",
        });
      }

      setUsers(
        users.map((user) =>
          user._id === selectedUser._id ? { ...user, banStatus: true } : user
        )
      );

      handleCloseBanModal();
    } catch (error) {
      console.error("Error banning user:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to ban user",
        icon: "error",
      });
    }
  };

  const handleBanAdmin = async () => {
    try {
      const requestBody = {
        reason: adminBanReason,
        banType: adminBanType,
        bannedUntil: adminBanType === "temporary" ? adminBannedUntil : null,
      };

      const response = await axios.put(
        `https://chatboat-kpvg.onrender.com/api/user/banadmin/${selectedAdmin._id}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.error === false) {
        Swal.fire({
          title: "Success!",
          text: "Admin has been banned successfully",
          icon: "success",
        });
      }

      setAdmins(
        admins.map((admin) =>
          admin._id === selectedAdmin._id
            ? { ...admin, banStatus: true }
            : admin
        )
      );

      handleCloseAdminBanModal();
    } catch (error) {
      console.error("Error banning admin:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to ban admin",
        icon: "error",
      });
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const response = await axios.put(
        `https://chatboat-kpvg.onrender.com/api/user/unbanuser/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.error === false) {
        Swal.fire({
          title: "Success!",
          text: "User has been unbanned successfully",
          icon: "success",
        });
      }

      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, banStatus: false } : user
        )
      );
    } catch (error) {
      console.error("Error unbanning user:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to unban user",
        icon: "error",
      });
    }
  };

  const handleUnbanAdmin = async (adminId) => {
    try {
      const response = await axios.put(
        `https://chatboat-kpvg.onrender.com/api/user/unbanadmin/${adminId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.error === false) {
        Swal.fire({
          title: "Success!",
          text: "Admin has been unbanned successfully",
          icon: "success",
        });
      }

      setAdmins(
        admins.map((admin) =>
          admin._id === adminId ? { ...admin, banStatus: false } : admin
        )
      );
    } catch (error) {
      console.error("Error unbanning admin:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to unban admin",
        icon: "error",
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.customerRef_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "banned" ? user.banStatus : !user.banStatus);

    return matchesSearch && matchesStatus;
  });

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name?.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(adminSearchTerm.toLowerCase());

    const matchesStatus =
      adminFilterStatus === "all" ||
      (adminFilterStatus === "banned" ? admin.banStatus : !admin.banStatus);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <>
      <PageTitle page={"Super Admin Dashboard"} />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Admin Ban Control - Left Half */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box
                sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}
              >
                <TextField
                  variant="outlined"
                  placeholder="Search admins..."
                  size="small"
                  value={adminSearchTerm}
                  onChange={(e) => setAdminSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300 }}
                />

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 150 }}
                >
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={adminFilterStatus}
                    onChange={(e) => setAdminFilterStatus(e.target.value)}
                    label="Filter by Status"
                  >
                    <MenuItem value="all">All Admins</MenuItem>
                    <MenuItem value="banned">Banned</MenuItem>
                    <MenuItem value="unbanned">Active</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {adminLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight="200px"
                >
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <h4>Admin Ban Control</h4>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          {/* <TableCell>Status</TableCell> */}
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAdmins.map((admin) => (
                          <TableRow
                            key={admin._id}
                            sx={{
                              "&:hover": {
                                backgroundColor: "action.hover",
                                cursor: "pointer",
                              },
                              backgroundColor:
                                selectedForHistory === admin._id &&
                                selectedType === "admin"
                                  ? "action.selected"
                                  : "inherit",
                            }}
                            onClick={() => getBanHistory(admin._id, "admin")}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <AdminPanelSettings
                                  sx={{ mr: 1, color: "action.active" }}
                                />
                                {admin.name}
                              </Box>
                            </TableCell>
                            <TableCell>{admin.email}</TableCell>
                            {/* <TableCell>
                              {admin.banStatus ? (
                                <Box display="flex" alignItems="center">
                                  <Circle color="error" fontSize="small" />
                                  <Typography variant="body2" ml={1}>
                                    Banned
                                  </Typography>
                                </Box>
                              ) : (
                                <Box display="flex" alignItems="center">
                                  <CheckCircle
                                    color="success"
                                    fontSize="small"
                                  />
                                  <Typography variant="body2" ml={1}>
                                    Active
                                  </Typography>
                                </Box>
                              )}
                            </TableCell> */}
                            <TableCell align="center">
                              {admin.banStatus ? (
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnbanAdmin(admin._id);
                                  }}
                                  sx={{ mr: 1 }}
                                >
                                  Unban
                                </Button>
                              ) : (
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAdminBanModal(admin);
                                  }}
                                  startIcon={<Block />}
                                >
                                  Ban
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Paper>
          </Grid>

          {/* User Ban Control - Right Half */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box
                sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}
              >
                <TextField
                  variant="outlined"
                  placeholder="Search users..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300 }}
                />

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 150 }}
                >
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Filter by Status"
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="banned">Banned</MenuItem>
                    <MenuItem value="unbanned">Active</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {loading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight="200px"
                >
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <h4>User Ban Control</h4>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>User ID</TableCell>
                          {/* <TableCell>Status</TableCell> */}
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow
                            key={user._id}
                            sx={{
                              "&:hover": {
                                backgroundColor: "action.hover",
                                cursor: "pointer",
                              },
                              backgroundColor:
                                selectedForHistory === user._id &&
                                selectedType === "user"
                                  ? "action.selected"
                                  : "inherit",
                            }}
                            onClick={() => getBanHistory(user._id, "user")}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Person
                                  sx={{ mr: 1, color: "action.active" }}
                                />
                                {user.name}
                              </Box>
                            </TableCell>
                            <TableCell>{user.customerRef_no}</TableCell>
                            {/* <TableCell>
                              {user.banStatus ? (
                                <Box display="flex" alignItems="center">
                                  <Circle color="error" fontSize="small" />
                                  <Typography variant="body2" ml={1}>
                                    Banned
                                  </Typography>
                                </Box>
                              ) : (
                                <Box display="flex" alignItems="center">
                                  <CheckCircle
                                    color="success"
                                    fontSize="small"
                                  />
                                  <Typography variant="body2" ml={1}>
                                    Active
                                  </Typography>
                                </Box>
                              )}
                            </TableCell> */}
                            <TableCell align="center">
                              {user.banStatus ? (
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnbanUser(user._id);
                                  }}
                                  sx={{ mr: 1 }}
                                >
                                  Unban
                                </Button>
                              ) : (
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenBanModal(user);
                                  }}
                                  startIcon={<Block />}
                                >
                                  Ban
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Paper>
          </Grid>

          {/* Ban History Section */}
          {selectedForHistory &&
            (selectedType === "user" || selectedType === "admin") && (
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center">
                        <History sx={{ mr: 1 }} />
                        <Typography variant="h6">
                          Ban History for{" "}
                          {selectedType === "user"
                            ? users.find((u) => u._id === selectedForHistory)
                                ?.name
                            : admins.find((a) => a._id === selectedForHistory)
                                ?.name}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {historyLoading ? (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          minHeight="100px"
                        >
                          <CircularProgress />
                        </Box>
                      ) : banHistory.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Ban Type</TableCell>
                                <TableCell>Reason</TableCell>
                                {/* <TableCell>Banned At</TableCell> */}
                                <TableCell>Banned Until</TableCell>
                                <TableCell>Banned By</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {banHistory.map((history, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Chip
                                      label={
                                        history.banType === "permanent"
                                          ? "Permanent"
                                          : "Temporary"
                                      }
                                      color={
                                        history.banType === "permanent"
                                          ? "error"
                                          : "warning"
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {history.reason || "N/A"}
                                  </TableCell>
                                  {/* <TableCell>{formatDate(history.createdAt)}</TableCell> */}
                                  <TableCell>
                                    {history.banType === "permanent"
                                      ? "Permanent"
                                      : formatDate(history.bannedUntil)}
                                  </TableCell>
                                  <TableCell>
                                    {history.performedBy?.name || "System"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          minHeight="100px"
                        >
                          <Typography variant="body1" color="text.secondary">
                            No ban history found for this {selectedType}.
                          </Typography>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              </Grid>
            )}
        </Grid>

        {/* Ban User Modal */}
        <Modal
          open={openBanModal}
          onClose={handleCloseBanModal}
          aria-labelledby="ban-user-modal"
          aria-describedby="ban-user-modal-description"
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
              id="ban-user-modal"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Ban User: {selectedUser?.name}
            </Typography>

            <TextField
              fullWidth
              label="Ban Reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Ban Type</InputLabel>
              <Select
                value={banType}
                onChange={(e) => setBanType(e.target.value)}
                label="Ban Type"
              >
                <MenuItem value="temporary">Temporary</MenuItem>
                <MenuItem value="permanent">Permanent</MenuItem>
              </Select>
            </FormControl>

            {banType === "temporary" && (
              <TextField
                fullWidth
                label="Banned Until"
                type="date"
                value={bannedUntil}
                onChange={(e) => setBannedUntil(e.target.value)}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            )}

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleCloseBanModal} sx={{ mr: 2 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleBanUser}
                disabled={
                  !banReason || (banType === "temporary" && !bannedUntil)
                }
              >
                Confirm Ban
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Ban Admin Modal */}
        <Modal
          open={openAdminBanModal}
          onClose={handleCloseAdminBanModal}
          aria-labelledby="ban-admin-modal"
          aria-describedby="ban-admin-modal-description"
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
              id="ban-admin-modal"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Ban Admin: {selectedAdmin?.name}
            </Typography>

            <TextField
              fullWidth
              label="Ban Reason"
              value={adminBanReason}
              onChange={(e) => setAdminBanReason(e.target.value)}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Ban Type</InputLabel>
              <Select
                value={adminBanType}
                onChange={(e) => setAdminBanType(e.target.value)}
                label="Ban Type"
              >
                <MenuItem value="temporary">Temporary</MenuItem>
                <MenuItem value="permanent">Permanent</MenuItem>
              </Select>
            </FormControl>

            {adminBanType === "temporary" && (
              <TextField
                fullWidth
                label="Banned Until"
                type="date"
                value={adminBannedUntil}
                onChange={(e) => setAdminBannedUntil(e.target.value)}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            )}

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleCloseAdminBanModal} sx={{ mr: 2 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleBanAdmin}
                disabled={
                  !adminBanReason ||
                  (adminBanType === "temporary" && !adminBannedUntil)
                }
              >
                Confirm Ban
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </>
  );
};

export default SuperAdminDashboard;
