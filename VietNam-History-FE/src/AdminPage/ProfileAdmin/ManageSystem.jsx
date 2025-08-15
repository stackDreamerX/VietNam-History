import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import TagAdmin from "../TagAdmin/TagAdmin";
import UsersAdmin from "../UsersAdmin/UsersAdmin";
import QuestionAdmin from "../PostAdmin/PostAdmin";
import AdminAccount from "../AdminAccount/AdminAccount";
import QuizAdmin from "../QuizAdmin/QuizAdmin";
import { useSelector } from "react-redux";
import StatisticPage from "../../pages/StatisticPage/StatisticPage";

function ManageSystem() {
  const admin = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState("question");
  const location = useLocation();

  // Set active tab based on URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get("tab");

    if (tabParam && ["question", "tag", "user", "admin", "quiz", "statistic"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  return (
    <div className="container mt-4">
      {/* Tabs */}
      <div className="row mt-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "question" ? "active" : ""}`}
                onClick={() => setActiveTab("question")}
              >
                Posts
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "tag" ? "active" : ""}`}
                onClick={() => setActiveTab("tag")}
              >
                Tags
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "user" ? "active" : ""}`}
                onClick={() => setActiveTab("user")}
              >
                Users
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "admin" ? "active" : ""}`}
                onClick={() => setActiveTab("admin")}
              >
                Admins
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "quiz" ? "active" : ""}`}
                onClick={() => setActiveTab("quiz")}
              >
                Quizzes
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "statistic" ? "active" : ""}`}
                onClick={() => setActiveTab("statistic")}
              >
                Statistic
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Nội dung Tab */}
      <div className="row mt-4">
        <div className="col-12">
          {activeTab === "question" && <QuestionAdmin />}
          {activeTab === "tag" && <TagAdmin />}
          {activeTab === "user" && <UsersAdmin />}
          {activeTab === "admin" && <AdminAccount />}
          {activeTab === "quiz" && <QuizAdmin />}
          {activeTab === "statistic" && <StatisticPage />}
        </div>
      </div>
    </div>
  );
}

export default ManageSystem;
