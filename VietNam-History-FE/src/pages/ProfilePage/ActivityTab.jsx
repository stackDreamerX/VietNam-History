import React, { useState } from "react";
import "../../css/ProfilePage.css";
import ReputationSubTab from "./ReputationSubTab";
import FollowerSubTab from "./FollowerSubTab";
import FollowingSubTab from "./FollowingSubTab";
import ResponsesSubTab from "./ResponsesSubTab";
import QuestionSubTab from "./PostSubTab";
import AnswerSubTab from "./AnswerSubTab";
import TagSubTab from "./TagSubTab";
import SaveSubTab from "./SaveSubTab";
import VoteSubTab from "./VoteSubTab/VoteSubTab";
import CommentSubTab from "./CommentSubTab";
import { useSelector } from "react-redux";

const ActivityTab = () => {
  const [activeTab, setActiveTab] = useState("questions");
  const user = useSelector((state) => state.user);
  console.log("usertab", user);

  return (
    <div className="d-flex">
      {/* Tabs dọc */}
      <div
        className="nav flex-column nav-pills me-3"
        style={{ width: "200px" }}
      >
        <button
          className={`nav-link ${activeTab === "questions" ? "active" : ""}`}
          onClick={() => setActiveTab("questions")}
        >
          Questions
        </button>
        <button
          className={`nav-link ${activeTab === "answers" ? "active" : ""}`}
          onClick={() => setActiveTab("answers")}
        >
          Answers
        </button>
        <button
          className={`nav-link ${activeTab === "comments" ? "active" : ""}`}
          onClick={() => setActiveTab("comments")}
        >
          Comments
        </button>
        <button
          className={`nav-link ${activeTab === "tags" ? "active" : ""}`}
          onClick={() => setActiveTab("tags")}
        >
          Tags
        </button>
        <button
          className={`nav-link ${activeTab === "saved" ? "active" : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          Saved
        </button>
        <button
          className={`nav-link ${activeTab === "followers" ? "active" : ""}`}
          onClick={() => setActiveTab("followers")}
        >
          Followers
        </button>
        <button
          className={`nav-link ${activeTab === "following" ? "active" : ""}`}
          onClick={() => setActiveTab("following")}
        >
          Following
        </button>
        <button
          className={`nav-link ${activeTab === "voted" ? "active" : ""}`}
          onClick={() => setActiveTab("voted")}
        >
          Voted
        </button>
      </div>

      {/* Nội dung Tab */}
      <div className="tab-content" style={{ flexGrow: 1 }}>
        <div className="tab-pane fade show active">
          {activeTab === "questions" && <QuestionSubTab />}
          {activeTab === "answers" && <AnswerSubTab />}
          {activeTab === "comments" && <CommentSubTab />}
          {activeTab === "tags" && <TagSubTab />}
          {activeTab === "saved" && <SaveSubTab />}
          {activeTab === "followers" && (
            <FollowerSubTab followers={user.followers} />
          )}
          {activeTab === "following" && (
            <FollowingSubTab following={user.following} />
          )}
  
          {activeTab === "voted" && <VoteSubTab />}
        </div>
      </div>
    </div>
  );
};

export default ActivityTab;
