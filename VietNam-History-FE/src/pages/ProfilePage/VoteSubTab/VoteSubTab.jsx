import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import QuesVoteSubTab from "./QuesVoteSubTab";
import AnsVoteSubTab from "./AnsVoteSubTab";

const VoteSubTab = () => {
    const [activeTab, setActiveTab] = useState("question");

  return (
    <div>
        {/* Tabs */}
      <div className="row mt-4">
        <div className="col-12 d-flex justify-content-end">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "question" ? "active" : ""}`}
                onClick={() => setActiveTab("question")}
              >
                Question
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "answer" ? "active" : ""}`}
                onClick={() => setActiveTab("answer")}
              >
                Answer
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Nội dung Tab */}
      <div className="row mt-4">
        <div className="col-12">
          {activeTab === "question" && <QuesVoteSubTab />}
          {activeTab === "answer" && <AnsVoteSubTab />}
        </div>
      </div> 
    </div>
  );
};

export default VoteSubTab;
