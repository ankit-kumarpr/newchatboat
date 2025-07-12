import axios from "axios";
import React, { useEffect, useState } from "react";
import PageTitle from "../../../components/PageTitle";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Modal,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import Swal from "sweetalert2";
import { Block, Circle, CheckCircle, PersonAdd } from "@mui/icons-material";

const UserList = () => {
  const [adminData, setAdminData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openBanModal, setOpenBanModal] = useState(false);
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [banType, setBanType] = useState("temporary");
  const [bannedUntil, setBannedUntil] = useState("");
  const [filterStatus, setFilterStatus] = useState("unbanned");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const accesstoken = sessionStorage.getItem("accessToken");

  // Add User Form State
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    GetuserData();
  }, []);

  const GetuserData = async () => {
    try {
      setLoading(true);
      const url = `https://chatboat-kpvg.onrender.com/api/user/alluserlist`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accesstoken}`,
      };

      const response = await axios.get(url, { headers });
      console.log("Response of user list", response.data);

      const transformedData = response.data.data.map((admin, index) => ({
        ...admin,
        srNo: index + 1,
        formattedAddress: admin.Address
          ? `${admin.Address.addressline1 || ""}, ${
              admin.Address.addressline2 || ""
            }, ${admin.Address.city || ""}, ${admin.Address.state || ""} - ${
              admin.Address.zip || ""
            }`
          : "N/A",
        formattedDate: admin.createdAt
          ? new Date(admin.createdAt).toLocaleString()
          : "N/A",
        banStatus: admin.isBanned?.status || false,
      }));

      setAdminData(transformedData);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleOpenBanModal = (admin) => {
    setSelectedAdmin(admin);
    setOpenBanModal(true);
  };

  const handleCloseBanModal = () => {
    setOpenBanModal(false);
    setBanReason("");
    setBanType("temporary");
    setBannedUntil("");
    setSelectedAdmin(null);
  };

  const handleOpenAddUserModal = () => {
    setOpenAddUserModal(true);
  };

  const handleCloseAddUserModal = () => {
    setOpenAddUserModal(false);
    setUserForm({
      name: "",
      email: "",
      phone: "",
      gender: "",
    });
    setFormErrors({});
  };

  const BanAdminAPI = async () => {
    try {
      const url = `https://chatboat-kpvg.onrender.com/api/user/userban/${selectedAdmin._id}`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accesstoken}`,
      };

      const requestBody = {
        reason: banReason,
        banType: banType,
        bannedUntil: banType === "temporary" ? bannedUntil : null,
      };

      const response = await axios.put(url, requestBody, { headers });
      console.log("Response of Ban api", response.data);
      if (response.data.error == false) {
        Swal.fire({
          title: "Good job!",
          text: "You User Ban SuccessFully",
          icon: "success",
        });
      }
      setAdminData(
        adminData.map((admin) =>
          admin._id === selectedAdmin._id
            ? { ...admin, banStatus: true }
            : admin
        )
      );
      handleCloseBanModal();
    } catch (error) {
      console.log(error);
    }
  };

  const UnbanAdminAPI = async (adminId) => {
    try {
      const url = `https://chatboat-kpvg.onrender.com/api/user/unbanuser/${adminId}`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accesstoken}`,
      };

      const response = await axios.put(url, {}, { headers });
      console.log("Response of Unban api", response.data);
      if (response.data.error == false) {
        Swal.fire({
          title: "Good job!",
          text: "You User Unban SuccessFully",
          icon: "success",
        });
      }
      setAdminData(
        adminData.map((admin) =>
          admin._id === adminId ? { ...admin, banStatus: false } : admin
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!userForm.name.trim()) errors.name = "Name is required";

    if (!userForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
      errors.email = "Invalid email format";
    }

    if (!userForm.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (!/^[0-9]{10}$/.test(userForm.phone)) {
      errors.phone = "Phone must be 10 digits";
    }

    if (!userForm.gender) errors.gender = "Gender is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneInput = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === "" || re.test(e.target.value)) {
      if (e.target.value.length <= 10) {
        handleInputChange({ target: { name: "phone", value: e.target.value } });
      }
    }
  };

  const RegisterUserAPI = async () => {
    if (!validateForm()) return;

    try {
      const url = `https://chatboat-kpvg.onrender.com/api/user/userresgister`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accesstoken}`,
      };

      const response = await axios.post(url, userForm, { headers });
      console.log("Response of register user", response.data);

      if (response.data.error === false) {
        setSnackbar({
          open: true,
          message: "User registered successfully!",
          severity: "success",
        });
        handleCloseAddUserModal();
        GetuserData(); // Refresh the user list
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || "Registration failed",
          severity: "error",
        });
      }
    } catch (error) {
      console.log(error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Registration failed",
        severity: "error",
      });
    }
  };

  const filteredAdmins = adminData.filter((admin) => {
    if (filterStatus === "all") return true;
    return filterStatus === "banned" ? admin.banStatus : !admin.banStatus;
  });

  const columns = [
    {
      field: "srNo",
      headerName: "Sr. No.",
      width: 80,
      sortable: false,
    },
    { field: "customerRef_no", headerName: "UserId", width: 150 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "formattedDate", headerName: "Created At", width: 180 },
    {
      field: "banStatus",
      headerName: "Status",
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <Box display="flex" alignItems="center" className="mt-3">
            <Circle color="error" fontSize="small" />
            <Typography variant="body2" ml={1}>
              Banned
            </Typography>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" className="mt-3">
            <CheckCircle color="success" fontSize="small" />
            <Typography variant="body2" ml={1}>
              Active
            </Typography>
          </Box>
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) =>
        params.row.banStatus ? (
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => UnbanAdminAPI(params.row._id)}
          >
            Unban
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<Block />}
            onClick={() => handleOpenBanModal(params.row)}
          >
            Ban
          </Button>
        ),
    },
  ];

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <PageTitle page={"User List"} />

      {/* Filter Section */}
      <Box
        sx={{ mb: 2, display: "flex", justifyContent: "space-around", mt: 5 }}
      >
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          color="success"
          onClick={handleOpenAddUserModal}
        >
          Add User
        </Button>

        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Filter by Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="banned">Banned</MenuItem>
            <MenuItem value="unbanned">Unbanned</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 400, width: "100%", mt: 3 }}>
        <DataGrid
          rows={filteredAdmins}
          columns={columns}
          checkboxSelection
          getRowId={(row) => row._id}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Ban Modal */}
      <Modal
        open={openBanModal}
        onClose={handleCloseBanModal}
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
            Ban User: {selectedAdmin?.name}
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
              onClick={BanAdminAPI}
              disabled={!banReason || (banType === "temporary" && !bannedUntil)}
            >
              Confirm Ban
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Add User Modal */}
      <Modal
        open={openAddUserModal}
        onClose={handleCloseAddUserModal}
        aria-labelledby="add-user-modal"
        aria-describedby="add-user-modal-description"
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
            id="add-user-modal"
            variant="h6"
            component="h2"
            gutterBottom
          >
            Add New User
          </Typography>

          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={userForm.name}
            onChange={handleInputChange}
            error={!!formErrors.name}
            helperText={formErrors.name}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={userForm.email}
            onChange={handleInputChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={userForm.phone}
            onChange={handlePhoneInput}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
            margin="normal"
            inputProps={{ maxLength: 10 }}
            required
          />

          <FormControl fullWidth margin="normal" error={!!formErrors.gender}>
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={userForm.gender}
              label="Gender"
              onChange={handleInputChange}
              required
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
            {formErrors.gender && (
              <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                {formErrors.gender}
              </Typography>
            )}
          </FormControl>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseAddUserModal} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={RegisterUserAPI}
            >
              Register User
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserList;
