import React, { useEffect, useState } from "react";
import FollowerComponent from "../../components/FollowerComponent/FollowerComponent";
import "../../css/FollowerSubTab.css";
import * as UserService from "../../services/UserService";

const FollowerSubTab = ({ followers }) => {
  const [followerDetails, setFollowerDetails] = useState([]);

  useEffect(() => {
    const fetchFollowerDetails = async () => {
      try {
        const details = await Promise.all(
          followers.map(async (followerId) => {
            const response = await UserService.getDetailsUser(followerId);
            return response.data; // Trả về thông tin chi tiết của follower
          })
        );
        setFollowerDetails(details);
      } catch (error) {
        console.error("Error fetching follower details:", error);
      }
    };

    if (followers && followers.length > 0) {
      fetchFollowerDetails();
    }
  }, [followers]);
  return (
    <div>
      <div className="follower-title">
        <h3>Follower {followers?.length || 0} </h3>
      </div>
      {/* content */}
      <div className="follower-list">
        {followerDetails.length > 0 ? (
          followerDetails.map((follower) => (
            <FollowerComponent
              key={follower._id}
              name={follower.name}
              img={follower.img}
              followedTime={new Date(follower.updatedAt).toLocaleString(
                "vi-VN"
              )}
            />
          ))
        ) : (
          <p>No followers available.</p>
        )}
      </div>
    </div>
  );
};

export default FollowerSubTab;
