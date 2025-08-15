import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { followUser } from "../../services/UserService"; // API để xử lý Follow
import "./UserCardFollowComponent.css";
import { useDispatch, useSelector } from "react-redux";
import { addFollow } from "../../redux/slides/userSlide";
import * as UserService from "../../services/UserService";
const UserCardFollowComponent = ({
  id,
  name,
  img,
  address,
  followerCount,
  isFollowed,
  onFollow,
}) => {
  const navigate = useNavigate();
  // const [userState, setUserState] = useState({ isFollowed });

  // const access_token = useSelector((state) => state.user.access_token);
  // const [isFollowed, setIsFollowed] = useState(isInitiallyFollowed);
  // const [follower, setFollower] = useState(followerCount);
  // console.log("access_token", access_token);
  // console.log("followerCount", followerCount);

  // Xử lý khi người dùng click vào card
  const handleCardClick = () => {
    navigate(`/otheruserprofile/${id}`);
  };

  const handleFollowClick = (e) => {
    e.stopPropagation(); // Ngăn chặn click vào card
    onFollow(id, isFollowed, followerCount); // Gọi hàm xử lý follow từ parent
  };

  return (
    <div className="col-12 col-md-6 mb-4">
      {/* Card container */}
      <div
        className="card h-100"
        style={{
          cursor: "pointer",
          maxWidth: "600px",
          margin: "0 auto",
        }}
        onClick={handleCardClick}
      >
        <div
          className="row g-0 align-items-center"
          style={{
            border: "solid 2px #EDBE00",
            borderRadius: "5px",
          }}
        >
          <div className="col-md-4">
            <img
              src={img || "https://via.placeholder.com/150"} // Ảnh mặc định nếu không có img
              alt={`${name}'s avatar`}
              className="img-fluid rounded-circle p-2"
              style={{
                height: "100px",
                width: "100px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <h5 className="card-title">{name || "Anonymous User"}</h5>
              <p className="card-text text-muted">
                {address || "Address not available"}
              </p>
              <p className="card-text">
                <small className="text-muted">{followerCount} Followers</small>
              </p>
              <button
                onClick={handleFollowClick}
                className={`btn btn-sm ${
                  isFollowed ? "btn-secondary" : "btn-primary"
                }`}
                style={{
                  color: "black",
                  border: "none",
                  backgroundColor: "#EDBE00",
                }}
              >
                {isFollowed ? "Followed" : "Follow"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCardFollowComponent;
