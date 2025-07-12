import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Chip,
  CircularProgress,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import PageTitle from "../../components/PageTitle";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const accessToken = sessionStorage.getItem("accessToken");

  useEffect(() => {
    FeedBackListAPI();
  }, []);

  const FeedBackListAPI = async () => {
    try {
      setLoading(true);
      const url = `https://chatboat-kpvg.onrender.com/api/user/feedbacks`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get(url, { headers });

      // Transform the data before setting state
      const transformedData = response.data.data.map((item) => ({
        id: item._id, // DataGrid requires an 'id' field
        type: item.type,
        message: item.message,
        group: item.group?.groupname || "N/A",
        user: item.user?.name || "Anonymous",
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : "N/A",
      }));

      setFeedbacks(transformedData);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: "type",
      headerName: "Type",
      width: 150,
      renderCell: (params) => {
        let color;
        switch (params.value) {
          case "Bug":
            color = "error";
            break;
          case "Feature":
            color = "success";
            break;
          case "UI/UX":
            color = "info";
            break;
          case "Live Session":
            color = "warning";
            break;
          default:
            color = "default";
        }
        return <Chip label={params.value} color={color} />;
      },
    },
    {
      field: "message",
      headerName: "Message",
      width: 300,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "group",
      headerName: "Group",
      width: 200,
    },
    {
      field: "user",
      headerName: "Submitted By",
      width: 200,
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 180,
    },
  ];

  return (
    <>
      <PageTitle page={"Feedbacks"} />
      <Container maxWidth="xl">
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
          <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
            <Box sx={{ height: 600, width: "100%" }}>
              <DataGrid
                rows={feedbacks}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                sx={{
                  "& .MuiDataGrid-cell": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              />
            </Box>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default FeedbackList;
