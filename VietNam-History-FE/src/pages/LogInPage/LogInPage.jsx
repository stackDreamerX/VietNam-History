import React, { useState, useEffect } from "react";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import FormComponent from "../../components/FormComponent/FormComponent";
import { Styles } from "../../style";
import { useMutation } from "@tanstack/react-query";
import * as AdminService from "../../services/AdminService";
import * as UserService from "../../services/UserService";
import { useMutationHook } from "../../hooks/useMutationHook";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slides/userSlide";
import { updateAdmin } from "../../redux/slides/adminSlide";

const LogInPage = () => {
  ////////////---------xét login----------////////////
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showLoading, setShowLoading] = useState(false); // Thêm trạng thái riêng
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const mutation = useMutationHook((data) => {
    // Check if the email contains "admin"
    if (data.email.includes("admin")) {
      // console.log(
      //   "AdminService.loginAdmin(data): ",
      //   AdminService.loginAdmin(data)
      // );
      // Use AdminService for admin login
      // console.log("data.email.includes admins", data.email.includes("admin"));
      return AdminService.loginAdmin(data);
    } else {
      // Use UserService for user login
      return UserService.loginUser(data);
    }
  });
  const { data, isLoading, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      const token = data?.access_token;
      localStorage.setItem("access_token", JSON.stringify(token));

      if (token) {
        const decoded = jwtDecode(token); // Giải mã token để kiểm tra vai trò
        console.log("decoded", decoded);

        if (decoded?.isAdmin) {
          console.log("Admin login detected.");
          handleGetDetailsAdmin(decoded?.id, token);
        } else {
          console.log("User login detected.");
          handleGetDetailsUser(decoded?.id, token);
        }
      } else {
        console.error("Token not available.");
      }
    }
  }, [isSuccess]);

  const handleGetDetailsUser = async (id, token) => {
    try {
      const res = await UserService.getDetailsUser(id, token);
      const followingUsers = res?.data?.following || [];
      localStorage.setItem("followingUsers", JSON.stringify(followingUsers)); // Lưu danh sách vào localStorage

      dispatch(
        updateUser({
          ...res?.data,
          access_token: token,
        })
      );
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleGetDetailsAdmin = async (id, token) => {
    const res = await AdminService.getDetailsAdmin(id, token);
    dispatch(updateAdmin({ ...res?.data, access_token: token }));
  };

  // Check if all fields are filled to enable the button
  const isFormValid =
    formData.email.trim() !== "" && formData.password.trim() !== "";

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted, showing loading...");
    setShowLoading(true); // Hiện loading
    setErrorMessage("");
    mutation.mutate(
      {
        email: formData.email,
        password: formData.password,
      },
      {
        onSuccess: (data) => {
          setErrorMessage("");
          setTimeout(() => {
            setShowLoading(false);

            if (location?.state) {
              navigate(location?.state)
            }
            else {
              navigate('/')
            }
          }, 500);
        },
        onError: (error) => {
          // Trích xuất thông báo lỗi chi tiết
          const errorMessage =
            error.message?.message || error.message || "Đăng nhập thất bại.";
          setErrorMessage(errorMessage); // Lưu thông báo lỗi vào trạng thái
          setTimeout(() => setShowLoading(false), 500); // Ẩn loading nếu lỗi
        },
      }
    );
    // console.log("userEmail: ", formData.userEmail, " ", "userPassword: ", formData.userPassword);
  };

  return (
    <div
      className="login-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
      }}
    >
      <div
        style={{
          width: "auto",
          padding: "20px",
          border: "1px solid #EDBE00",
          borderRadius: "8px",
        }}
      >
        <h1
          className="title title_login"
          style={{
            marginBottom: "20px",
            fontWeight: "bold",
            textAlign: "center",
            color: "#000000",
            fontSize: "25px",
          }}
        >
          LOG IN
        </h1>
        <LoadingComponent isLoading={showLoading}>
          {!showLoading && (
            <form
              onSubmit={handleSubmit}
              className="login__form"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                width: "600px",
                height: "auto",
              }}
            >
              <FormComponent
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              ></FormComponent>

              <FormComponent
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              ></FormComponent>
              {data?.status === "ERR" && (
                <span style={{ color: "red" }}>{data?.message}</span>
              )}

              {/* hiện thông báo lỗi */}
              {errorMessage && (
                <span
                  style={{
                    color: "red",
                    display: "block",
                    fontSize: "16px",
                    marginTop: "10px",
                  }}
                >
                  {errorMessage}
                </span>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                }}
              >
                <ButtonComponent textButton="Log In" type="submit" />
              </div>
            </form>
          )}
        </LoadingComponent>
        <div
          style={{
            textAlign: "center",
            marginTop: "15px",
            fontSize: "14px",
            color: "#333",
          }}
        >
          You don't have an account?{" "}
          <a
            className="text-decoration-underline"
            href="./signup"
            style={{
              color: "#003366",
              textDecoration: "none",
              fontStyle: "italic",
            }}
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default LogInPage;
