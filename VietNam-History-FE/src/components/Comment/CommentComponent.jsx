import React from "react";
import { useDispatch, useSelector } from "react-redux";
import * as UserService from "../../services/UserService";

//const commentDetail = useSelector((state) => state.question.detailComment);
//console.log("Question Detail:", questionDetail);
const Comment = ({ id, name, img, text, date, isReported, onReport, isDelete, onclick1 }) => {
  // const user = useSelector((state) => state.user);
  // console.log("usercmt", user);
  return (
    <div
      className="pb-2 mb-3"
      style={{
        backgroundColor: "#fffde7",  // Light yellow background
        border: "1px solid #e0e0e0",  // Visible gray border
        borderRadius: "8px",          // Rounded corners
        padding: "15px",              // Padding inside the comment
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)" // Subtle shadow for depth
      }}
    >
      <div
        className="d-flex align-items-center mb-2"
        style={{ justifyContent: "space-between" }}
      >
        <div>
          <img
            src={img || "https://via.placeholder.com/40"}
            alt="Commenter Avatar"
            className="rounded-circle me-2"
            width="40"
            height="40"
            style={{ border: "2px solid #f0f0f0" }} // Border around avatar
          />
          <strong>{name}</strong>
        </div>
        <div>
          {isDelete === "True" ? (
            <button
              style={{
                marginLeft: 10,
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}
              className={"btn-danger"}
              disabled={isDelete}
              onClick={onclick1}
            >
              {isDelete ? "Delete" : ""}
            </button>
          ) : null}
        </div>
        <button
          className={`report-button ${isReported ? "reported" : ""}`}
          type="text"
          danger
          disabled={isReported}
          onClick={(e) => {
            e.stopPropagation();
            onReport();
          }}
          style={{
            padding: "4px 10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            backgroundColor: isReported ? "#f8d7da" : "#f8f9fa"
          }}
        >
          {isReported ? "Reported" : "Report"}
        </button>
      </div>

      <p className="mb-1" style={{ fontSize: "15px" }}>{text}</p>

      <p className="text-muted" style={{ fontSize: "0.9em", marginTop: "8px" }}>
        {date}
      </p>
    </div>
  );
};

export default Comment;
