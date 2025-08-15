import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ActivityTab from "../../pages/ProfilePage/ActivityTab";
import ProfileTabAdmin from "./ProfileTabAdmin";
import QuestionAdmin from "../PostAdmin/PostAdmin";
import { useSelector } from "react-redux";
import SignUpAdminPage from "./SignUpAdminPage";

function ProfileAdmin() {
  const admin = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="container mt-4">
      {/* Avatar và Tên */}
      <div className="row">
        <div className="col-md-3 col-sm-4 text-center">
          <img
            src={admin.img}
            alt="Admin Avatar"
            className="img-fluid rounded-circle"
            style={{ maxWidth: "150px", maxHeight: "150px", objectFit: "cover" }}
          />
        </div>
        <div className="col-md-9 col-sm-8">
          <div className="row">
            <h2 className="mt-3">{admin.name}</h2>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <i className="bi bi-calendar me-2"></i>
                <p className="mb-1">Member for 10 days</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <i className="bi bi-clock-history me-2"></i>
                <p className="mb-1">Recent access history: 01/01/2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mt-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Nội dung Tab */}
      <div className="row mt-4">
        <div className="col-12">
          <ProfileTabAdmin></ProfileTabAdmin>
          {/* <SignUpAdminPage></SignUpAdminPage> */}
        </div>
      </div>
    </div>
  );
}

export default ProfileAdmin;
