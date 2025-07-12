import React, { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  Groups,
  Lock,
  LockOpen,
  Chat,
  DoNotDisturbOn,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const accessToken = sessionStorage.getItem("accessToken");

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

  // Prepare data for charts
  const groupTypeData = groups.reduce((acc, group) => {
    const type = group.grouptype;
    const existingType = acc.find((item) => item.name === type);
    if (existingType) {
      existingType.value += 1;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const recentGroupsData = groups
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((group) => ({
      name: group.groupname,
      createdAt: new Date(group.createdAt).toLocaleDateString(),
      members: group.users?.length || 0,
    }));

  return (
    <>
      <PageTitle page={"Admin Dashboard"} />

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Total Groups Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                minHeight: 150,
                boxShadow: 3,
                background: "linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Groups sx={{ verticalAlign: "middle", mr: 1 }} />
                  Total Groups
                </Typography>
                <Typography variant="h3" component="div">
                  {groups.length}
                </Typography>
                <Typography variant="caption">All created groups</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Public Groups Card */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                minHeight: 150,
                boxShadow: 3,
                background: "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <LockOpen sx={{ verticalAlign: "middle", mr: 1 }} />
                  Public Groups
                </Typography>
                <Typography variant="h3" component="div">
                  {groups.filter((g) => g.grouptype === "public").length}
                </Typography>
                <Typography variant="caption">Open to everyone</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Chat Groups Card */}
          {/* <Grid item xs={12} md={4}>
            <Card sx={{ 
              minHeight: 150, 
              boxShadow: 3,
              background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Chat sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Active Chats
                </Typography>
                <Typography variant="h3" component="div">
                  {groups.filter(g => g.chat === 'enabled').length}
                </Typography>
                <Typography variant="caption">
                  With chat enabled
                </Typography>
              </CardContent>
            </Card>
          </Grid> */}
        </Grid>

        {/* Charts Section */}
        {/* <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, boxShadow: 3 }}>
              <Typography variant="h6" align="center" gutterBottom>
                Groups by Type
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={groupTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {groupTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, boxShadow: 3 }}>
              <Typography variant="h6" align="center" gutterBottom>
                Recent Groups Activity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={recentGroupsData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="createdAt" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="members" name="Members" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid> */}

        {/* Groups Table */}
        {/* <Card sx={{ mt: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Groups
            </Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Group Name</TableCell>
                    <TableCell align="center">Type</TableCell>
                    <TableCell align="center">Chat Status</TableCell>
                    <TableCell align="center">Created At</TableCell>
                    <TableCell align="center">Members</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : groups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No groups found
                      </TableCell>
                    </TableRow>
                  ) : (
                    groups.map((group) => (
                      <TableRow
                        key={group._id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {group.groupname}
                        </TableCell>
                        <TableCell align="center">
                          {group.grouptype === 'public' ? 
                            <LockOpen color="success" /> : 
                            <Lock color="secondary" />}
                        </TableCell>
                        <TableCell align="center">
                          {group.chat === 'enabled' ? 
                            <Chat color="primary" /> : 
                            <DoNotDisturbOn color="error" />}
                        </TableCell>
                        <TableCell align="center">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          {group.users?.length || 0}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card> */}
      </Box>
    </>
  );
};

export default AdminDashboard;
