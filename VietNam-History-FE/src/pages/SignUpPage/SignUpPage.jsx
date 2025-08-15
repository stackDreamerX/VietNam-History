import React, { useState, useEffect } from "react";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import FormComponent from "../../components/FormComponent/FormComponent";
import * as UserService from "../../services/UserService";
import { useMutationHook } from "../../hooks/useMutationHook";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthday: '',
  });

  const [showLoading, setShowLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const mutation = useMutationHook(
      data => UserService.signupUser(data)
  );


  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form
    setShowLoading(true); // Hiển thị loading
    setErrorMessage(""); // Xóa lỗi trước đó
  
    mutation.mutate(
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
        birthday: formData.birthday,
      },
      {
        onSuccess: (data) => {
          if (data.status === "OK") {
            setShowLoading(false);
            setSuccessMessage("Sign up successful! Redirecting to login page...");
            setTimeout(() => {
              navigate("/login");
            }, 500); 
          } else {
            setShowLoading(false);
            setErrorMessage(data.message || "An error occurred. Please try again."); 
          }
        },
        onError: (error) => {
          setShowLoading(false); 
          const errorMessage =
            error?.response?.data?.message || "Sign up failed. Please try again.";
          setErrorMessage(errorMessage);
        },
      }
    );
  };
  

  return (
    <div
      className="signup-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "120vh",
      }}
    >
      <div
        style={{
          width: "auto",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h1
          className="title title_signup"
          style={{
            fontSize: "25px",
            fontWeight: "bold",
            marginBottom: "20px",
            textAlign: "center",
            color: "#003366",
          }}
        >
          SIGN UP
        </h1>
        <LoadingComponent isLoading={showLoading}>
          {!showLoading && (
        <form
          onSubmit={handleSubmit}
          className="signup__form"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "600px",
            height: "auto",
          }}
        >
          <FormComponent
            id="nameInput"
            label="Display Name"
            type="text"
            name="name"
            value={formData.name}
            placeholder="Enter your display name"
            onChange={handleChange}
          />
          <FormComponent
            id="emailInput"
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            placeholder="Enter your email"
            onChange={handleChange}
          />
          <FormComponent
            id="passwordInput"
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter your password"
            onChange={handleChange}
          />
          <FormComponent
            id="confirmPasswordInput"
            label="Confirm password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Confirm your password"
            onChange={handleChange}
          />
          <FormComponent
            id="phoneInput"
            label="Phone number"
            type="tel"
            name="phone"
            value={formData.phone}
            placeholder="Enter your phone number"
            onChange={handleChange}
          />
          <FormComponent
            id="birthInput"
            label="Birthday"
            type="date"
            name="birthday"
            value={formData.birthday}
            placeholder="Pick your birthday"
            onChange={handleChange}
          />

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
            <ButtonComponent
            textButton="Sign Up" type="submit" />
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
          You already have an account?{" "}
          <a
            className="text-decoration-underline"
            href="./login"
            style={{
              color: "#003366",
              textDecoration: "none",
              fontStyle: "italic",
            }}
          >
            Log in
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
