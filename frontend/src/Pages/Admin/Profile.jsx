import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const accessToken = sessionStorage.getItem("accessToken");
  const decodedToken = jwtDecode(accessToken);
  const userId = decodedToken.id;
  const navigate = useNavigate();

  useEffect(() => {
    getYourProfile();
  }, []);

  const getYourProfile = async () => {
    try {
      const url = `https://chatboat-kpvg.onrender.com/api/user/profile/${userId}`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await axios.get(url, { headers });
      console.log("Response of profile", response.data);
      setProfile(response.data.profile);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return <div className="error-message">Failed to load profile</div>;
  }

  return (
    <div className="gamer-profile">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-container">
            <div className="avatar-circle">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            {profile.role === "Admin" && (
              <span className="admin-badge">ADMIN</span>
            )}
          </div>

          <div className="profile-info">
            <h1 className="username">{profile.name}</h1>
            <p className="email">{profile.email}</p>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"
              />
              <path
                fillRule="evenodd"
                d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
              />
            </svg>
            Logout
          </button>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-value">{profile.groups?.length || 0}</span>
            <span className="stat-label">Groups</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {profile.banHistory?.length || 0}
            </span>
            <span className="stat-label">Bans</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {new Date(profile.createdAt).toLocaleDateString()}
            </span>
            <span className="stat-label">Joined</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
