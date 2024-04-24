import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppButton from "../components/AppButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import Swal from "sweetalert2";
import logo from "../assets/images/koiLogo.png";
import History from "../utils/History";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // Use navigate for redirection

  const axiosInstance = axios.create({
    baseURL:
      process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api/v1",
  });

  const handleLogin = async () => {
    if (!username || password === "") {
      Swal.fire({
        title: "Error!",
        text: "Username or password is missing",
        icon: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/users/login", {
        username,
        password,
      });

      const { accessToken } = response.data.message;

      localStorage.setItem("authToken", accessToken);

      Swal.fire({
        title: "Success!",
        text: "Login successful",
        icon: "success",
      });
    } catch (error) {
      const errorMessage =
        error.response && error.response.status === 401
          ? "Invalid username or password"
          : "An unexpected error occurred";

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
    window.location.reload();
  };

  const handleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleRegister = () => {
    History.push(`${process.env.PUBLIC_URL}/register`);
    console.log("redirecting");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh", flexDirection: "column" }}
    >
      <div className="loginDiv">
        <img src={logo} alt="Logo" className="img-fluid" />
        <div className="mt-4">
          <div className="position-relative">
            <FontAwesomeIcon icon={faUserAlt} className="loginIcon" />
            <input
              type="text"
              className="form-input"
              name="username"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="position-relative">
            <FontAwesomeIcon icon={faKey} className="loginIcon" />
            <input
              type={showPassword ? "text" : "password"}
              className="form-input"
              name="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="pswIcon"
              onClick={handleShowPassword}
            />
          </div>
        </div>

        <div className="m-3 d-flex justify-content-center gap-3">
          <AppButton name="Login" onClick={handleLogin} disabled={isLoading} />
          <AppButton
            name="Register"
            onClick={handleRegister}
            disabled={isLoading}
          />
        </div>

        {isLoading && <div>Loading...</div>}
      </div>
    </div>
  );
};

export default LoginPage;
