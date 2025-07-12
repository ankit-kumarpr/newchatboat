import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import "./login.css";
import Swal from "sweetalert2";
import axios from "axios";
import Slider1 from "../images/slider-1.jpg";
import Slider2 from "../images/slider-2.jpg";
import Slider3 from "../images/slider-3.jpg";
import infunLogo from "../images/gnet-logo.webp";
import loginvideo from "../images/login-vedio.mp4";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Send OTP API
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      Swal.fire("Error", "Please enter your email address", "error");
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://chatboat-kpvg.onrender.com/api/auth/send-otp`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      const requestBody = { email };

      const response = await axios.post(url, requestBody, { headers });
      console.log("Response of send otp api", response.data);

      if (response.data.error === false) {
        Swal.fire("Success", "OTP sent to your email!", "success");
        setShowOtpInput(true);
      } else {
        Swal.fire(
          "Error",
          response.data.message || "Failed to send OTP",
          "error"
        );
      }
    } catch (error) {
      console.log(error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP API
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      Swal.fire("Error", "Please enter the OTP", "error");
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://chatboat-kpvg.onrender.com/api/auth/verify-otp`;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      const requestBody = { email, otp };

      const response = await axios.post(url, requestBody, { headers });
      console.log("Response of Verify OTP", response.data);

      if (response.data.error == false) {
        const { accessToken, user } = response.data.data;
        console.log("user", user.role);
        // Store token and role in session storage
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("userRole", user.role);

        Swal.fire("Success", "Logged in successfully!", "success");

        // Redirect based on role
        switch (user.role) {
          case "SuperAdmin":
            navigate("/super-admin-dashboard");
            break;
          case "Admin":
            navigate("/admin-dashboard");
            break;
          case "User":
            navigate("/user-dashboard");
            break;
          default:
            navigate("/dashboard");
        }
      } else {
        Swal.fire("Error", response.data.message || "Invalid OTP", "error");
      }
    } catch (error) {
      console.log(error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid p-0">
        <div className="row g-0 main-wrapper">
          <div className="col-lg-6 right-section d-flex flex-column align-items-center justify-content-center">
            <div className="form-container text-center">
              <img
                src={infunLogo}
                alt="Infun Logo"
                style={{ height: "60px", width: "auto", marginBottom: "20px" }}
                className="img-fluid"
              />

              <h1 className="get-started-title">Get Started</h1>
              <p className="subtitle">
                {showOtpInput
                  ? "Enter the OTP sent to your email"
                  : "Enter your email address to receive an OTP and login"}
              </p>

              <form onSubmit={showOtpInput ? handleVerifyOTP : handleSendOTP}>
                {!showOtpInput ? (
                                 <div className="input-group d-flex align-items-center" style={{ flexWrap: 'nowrap', width: '100%' }}>
  <div
    className="country-code d-flex align-items-center justify-content-center"
    style={{
      backgroundColor: '#f1f1f1',
      // padding: '0.5rem',
      border: '1px solid #ccc',
      borderRight: 'none',
      height: '100%',
      minWidth: '40px'
    }}
  >
    <i className="fas fa-envelope" style={{ color: "#367e40" }}></i>
  </div>
  <input
    type="email"
    className="email-input"
    placeholder="Enter email address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    style={{
      flex: 1,
      minWidth: 0,
      border: '1px solid #ccc',
      padding: '0.5rem'
    }}
  />
</div>
                ) : (
                  <div className="input-group d-flex">
                    <div className="country-code">
                      <i className="fas fa-key"></i>
                    </div>
                    <input
                      type="text"
                      className="email-input"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="terms-container">
                  <div className="terms-checkbox">
                    <i
                      className="fas fa-check"
                      style={{
                        color: "white",
                        fontSize: "12px",
                        marginLeft: "3px",
                      }}
                    ></i>
                  </div>
                  <div className="terms-text">
                    Please accept our{" "}
                    <a href="#" className="terms-link">
                      Terms & Conditions
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  className="send-otp-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  ) : showOtpInput ? (
                    "Login"
                  ) : (
                    "Send OTP"
                  )}
                </button>

                {showOtpInput && (
                  <button
                    type="button"
                    className="btn btn-link mt-2"
                    onClick={() => {
                      setShowOtpInput(false);
                      setOtp("");
                    }}
                  >
                    Back to email
                  </button>
                )}
              </form>
            </div>
          </div>

          <div className="col-lg-6 left-section">
            <div className="video-container position-relative h-100">
              <video
                className=""
                autoPlay
                muted
                loop
                playsInline
                style={{ objectFit: "contain", height: "100vh" }}
              >
                <source src={loginvideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="carousel-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
