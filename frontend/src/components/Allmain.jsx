import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { FaComments, FaDoorOpen, FaUser } from 'react-icons/fa';

import Header from "./Header.jsx";
import SideBar from "./SideBar.jsx";
import UserIcon from '../images/user.png';
import messageIcon from '../images/message.png';
import RoomIcon from '../images/room.png'; 
import adminIcon from '../images/admin.png'; 

 import "./main.css";

import PageTitle from "./PageTitle.jsx";

import Protected from "../Pages/Protected.jsx";
import SuperAdminDashboard from "../Pages/Admin/SuperAdminDashboard.jsx";
import AdminDashboard from "../Pages/Subadmin/AdminDashboard.jsx";
import AdminRegister from "../Pages/Admin/SubAdmin/AdminRegister.jsx";
import SubAdminList from "../Pages/Admin/SubAdmin/SubAdminList.jsx";
import RegisterUser from "../Pages/Admin/User/RegisterUser.jsx";
import UserList from "../Pages/Admin/User/UserList.jsx";
import CreateGroup from "../Pages/Subadmin/Group/CreateGroup.jsx";
import AsssignGroupToAdmin from "../Pages/Admin/Groups/AsssignGroupToAdmin.jsx";
import SelfGroupList from "../Pages/Subadmin/Group/SelfGroupList.jsx";
import LiveSession from "../Pages/Subadmin/Group/LiveSession.jsx";
import UserGroupList from "../Pages/User/UserGroupList.jsx";
import AllgroupList from "../Pages/Admin/Groups/AllgroupList.jsx";
import FeedbackList from "../Pages/Admin/FeedbackList.jsx";
import UserDashboard from "../Pages/User/UserDashboard.jsx";
import Profile from "../Pages/Admin/Profile.jsx";



const Allmain = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("");
const [loginuserRole, setUserRole] = useState("User");
  








     useEffect(() => {
 const role = sessionStorage.getItem("userRole") || 'User'; 
    setUserRole(role);
   
      // Map routes to page titles
        const routeToTitle = {
          
          "/Super Admin Dashboard": "Dashboard",
          "/Admin Dashboard": "Franchise dashboard",
          "/Register Admin":"Register Admin",
          "/Admin List":"Admin List",
          "/User Register":"Register User",
          "/User List":"User List",
          "/Create Group":"Create Group",
          "/Assign-group":"Assing Group",
          "/Your Groups":"Your Groups",
          "/User Group":"User Group",
          "/All Group":"All Group",
          "/FeedBack List":"Feedbacks",
          "/User Dashboard":"User Dashboard"
          
         
        };

        const title = routeToTitle[location.pathname];
        if (title) {
          setPageTitle(title);
        } else {
          setPageTitle("");
        }
     }, [location.pathname]);



// profile api




     //  footer render

    const renderFooter = () => {
    switch(loginuserRole) {
      case 'SuperAdmin':
        return (
          <footer className="fixed-bottom bg-light border-top mb-4" style={{ position: 'fixed', bottom: '-32px', width: '100%', zIndex: 1000 }}>
            <div className="container">
              <div className="row text-center">
                <div className="col">
                  <Link to="/all-group" className="btn text-dark">
                    <img src={RoomIcon} alt="Room" style={{ width: '24px', height: '24px' }} />
                    <div style={{ fontSize: '12px' }}>Room</div>
                  </Link>
                </div>
               <div className="col">
                  <Link to="/admins" className="btn text-dark">
                    <img src={adminIcon} alt="Room" style={{ width: '24px', height: '24px' }} />
                    <div style={{ fontSize: '12px' }}>Admin</div>
                  </Link>
                </div>
                <div className="col">
                  <Link to="/users" className="btn text-dark">
                    <img src={UserIcon} alt="Room" style={{ width: '24px', height: '24px' }} />
                    <div style={{ fontSize: '12px' }}>User</div>
                  </Link>
                </div>
               
              </div>
            </div>
          </footer>
        );
      
      case 'Admin':
        return (
          <footer className="fixed-bottom bg-light border-top mb-4" style={{ position: 'fixed', bottom: '-32px', width: '100%', zIndex: 1000 }}>
            <div className="container">
              <div className="row text-center">
                <div className="col">
                  <Link to="/my-groups" className="btn text-dark">
                    <img src={messageIcon} alt="Room" style={{ width: '24px', height: '24px' }} />
                    <div style={{ fontSize: '12px' }}>Message</div>
                  </Link>
                </div>
               <div className="col">
                  <Link to="/create-group" className="btn text-dark">
                    <img src={RoomIcon} alt="Room" style={{ width: '24px', height: '24px' }} />
                    <div style={{ fontSize: '12px' }}>Group</div>
                  </Link>
                </div>
                <div className="col">
                  <Link to="/profile" className="btn text-dark">
                    <img src={UserIcon} alt="Room" style={{ width: '24px', height: '24px' }} />
                    <div style={{ fontSize: '12px' }}>Me</div>
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        );
      
      case 'User':
      default:
        return (
          <footer className="fixed-bottom bg-light border-top mb-4" style={{ position: 'fixed', bottom: '-32px', width: '100%', zIndex: 1000 }}>
          {/* <footer className="fixed-bottom bg-light border-top py-2" style={{ position: 'fixed', bottom: '0', width: '100%', zIndex: 1000 }}> */}
            <div className="container">
              <div className="row text-center">
                {/* <div className="col">
                  <Link to="/user-group" className="btn text-dark">
                    <img src={RoomIcon} alt="Room" style={{ width: '24px', height: '24px' }} />
                    <div style={{ fontSize: '12px' }}>Groups</div>
                  </Link>
                </div> */}
                <div className="col">
                  <Link to="/user-group" className="btn text-dark">
                    <img src={messageIcon} alt="Message" style={{ width: '24px', height: '24px' }} />
                    <div style={{ fontSize: '12px' }}>Message</div>
                  </Link>
                </div>
                <div className="col">
                  <Link to="/profile" className="btn text-dark">
                    <img src={UserIcon} alt="Me" style={{ width: '24px', height: '24px' }} />
                    <div style={{ fontSize: '12px' }}>Me</div>
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        );
    }
  };


  return (
    <>
      <Header />
      <SideBar />
      <main
        // id="main"
        className="main"
        style={{ backgroundColor: "", height: "auto",marginBottom:"51px" }}
      >
        {/* <PageTitle page={pageTitle} /> */}
        <Routes>
          <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          {/* <Route path="/register-admin" element={<AdminRegister />} /> */}
          <Route path="/admins" element={<SubAdminList />} />
          {/* <Route path="/user-register" element={<RegisterUser />} /> */}
          <Route path="/users" element={<UserList />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/assign-group" element={<AsssignGroupToAdmin />} />
          <Route path="/my-groups" element={<SelfGroupList />} />
          <Route path="/join-session/:roomId" element={<LiveSession />} />
          <Route path="/user-group" element={<UserGroupList />} />
          <Route path="/all-group" element={<AllgroupList />} />
          <Route path="/feedbacks" element={<FeedbackList />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/profile" element={<Profile />} />
          
       

          
        </Routes>

      



      </main>
      {renderFooter()}
    </>
  );
};

export default Allmain;
