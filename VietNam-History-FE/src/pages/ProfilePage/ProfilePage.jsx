import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ActivityTab from "./ActivityTab";
import ProfileTab from "./ProfileTab";
import { useSelector } from "react-redux";

function ProfilePage() {
  const user = useSelector((state) => state.user);
  console.log("userpage", user);
  const [activeTab, setActiveTab] = useState("profile");
  const memberAt = new Date(user.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const recentAccess = new Date().toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  console.log('vjvj', user)

  return (
    <div className="container mt-4">
      {/* Avatar và Tên */}
      <div className="row ">
        <div className="col-3">
          <img
            src={user.img}
            alt="Avatar"
            className="rounded-circle"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
            }}
          />
        </div>
        <div className="col-9">
          <div className="col-9">
            <div className="row">
              <h2 className="mt-3">{user.name}</h2>
            </div>
            <div className="row">
              <div className="col">
                <i class="bi bi-calendar"></i>
                <p>Member since: {memberAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mt-4">
        <div className="col-12">
          <ul className="nav nav-tabs custom-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "profile" ? "active" : ""
                  }`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "activity" ? "active" : ""
                  }`}
                onClick={() => setActiveTab("activity")}
              >
                Activity
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Nội dung Tab */}
      <div className="row mt-4">
        <div className="col-12">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "activity" && <ActivityTab />}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
