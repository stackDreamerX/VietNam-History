import React, { useEffect, useState } from "react";
import "../../css/FollowingSubTab.css";
import FollowerComponent from "../../components/FollowerComponent/FollowerComponent";
import * as UserService from "../../services/UserService";

const FollowingSubTab = ({ following }) => {
  const [followingDetails, setFollowingDetails] = useState([]);

  useEffect(() => {
    const fetchFollowingDetails = async () => {
      try {
        const details = await Promise.all(
          following.map(async (followingId) => {
            const response = await UserService.getDetailsUser(followingId);
            return response.data; // Trả về thông tin chi tiết của user mà bạn đang theo dõi
          })
        );
        setFollowingDetails(details);
      } catch (error) {
        console.error("Error fetching following details:", error);
      }
    };

    if (following && following.length > 0) {
      fetchFollowingDetails();
    }
  }, [following]);
  return (
    <div>
      <div className="follower-title">
        <h3>Following {following?.length || 0} </h3>
      </div>
      {/* content */}
      <div className="follower-list">
        {followingDetails.length > 0 ? (
          followingDetails.map((user) => (
            <FollowerComponent
              key={user._id}
              name={user.name}
              img={user.img}
              followedTime={new Date(user.updatedAt).toLocaleString("vi-VN")}
            />
          ))
        ) : (
          <p>No following users available.</p>
        )}
      </div>
    </div>
  );
};

export default FollowingSubTab;
