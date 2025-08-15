import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import UserCardFollowComponent from "../../components/UserCardFollowComponent/UserCardFollowComponent";
import * as NotificationService from "../../services/NotificationService";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import {
  addFollower,
  getAllUser,
  removeFollower,
} from "../../services/UserService"; // API để lấy allUser
import {
  setAllUser,
  setFollowing,
  setFollowStatus,
} from "../../redux/slides/userSlide";
import "./OtherListUserPage.css";

const OtherListUserPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const currentUser = useSelector((state) => state.user);
  // const [userState, setUserState] = useState();
  // console.log("user", user);

  const { allUser } = useSelector((state) => state.user);
  console.log("allUser", allUser);

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await getAllUser(); // Gọi API lấy toàn bộ người dùng
  //       dispatch(setAllUser(response.data)); // Lưu vào Redux
  //     } catch (error) {
  //       console.error("Error fetching users:", error);
  //     }
  //   };

  //   fetchUsers();
  // }, [dispatch]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUser();
        const followingUsers =
          JSON.parse(localStorage.getItem("followingUsers")) || [];

        const updatedUsers = response.data.map((user) => ({
          ...user,
          isFollowed: followingUsers.includes(user._id), // Gán trạng thái follow
        }));

        dispatch(setAllUser(updatedUsers)); // Lưu vào Redux
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [dispatch]);

  // useEffect(() => {
  //   const storedFollowing =
  //     JSON.parse(localStorage.getItem("followingUsers")) || [];
  //   dispatch(setFollowing(storedFollowing)); // Cập nhật Redux
  // }, [dispatch]);

  // Lọc bỏ người dùng hiện tại ra khỏi danh sách
  const filteredUsers = allUser.filter((u) => u._id !== user.id);

  // Hàm xử lý follow
  const handleFollow = async (userId, isFollowed, followerCount) => {
    try {
      const access_token = localStorage
        .getItem("access_token")
        ?.replace(/"/g, "");

      let result;

      if (isFollowed) {
        result = await removeFollower(userId, access_token); // API unfollow
      } else {
        result = await addFollower(userId, access_token); // API follow
        // Gửi thông báo
        const notificationData = {
          user_id: userId,
          message: "A person followed you",
          type: "follow",
          metadata: {
            follow_id: user?.id,
          },
        };

        await NotificationService.createNotification(notificationData);
      }

      const currentFollowing =
        JSON.parse(localStorage.getItem("followingUsers")) || [];

      const updatedFollowing = isFollowed
        ? currentFollowing.filter((id) => id !== userId) // Bỏ user khỏi danh sách nếu unfollow
        : [...currentFollowing, userId]; // Thêm user vào danh sách nếu follow

      localStorage.setItem("followingUsers", JSON.stringify(updatedFollowing)); // Lưu vào localStorage

      // Update local follow status in UserCardFollowComponent
      // const updateUserFollowStatus = (updatedIsFollowed) => {
      //   setUserState((prevUserState) => ({
      //     ...prevUserState,
      //     isFollowed: updatedIsFollowed,
      //   }));
      // };

      dispatch(
        setAllUser(
          allUser.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  isFollowed: !isFollowed,
                  followerCount: isFollowed
                    ? followerCount - 1
                    : followerCount + 1,
                }
              : user
          )
        )
      );

      alert(isFollowed ? "Unfollowed successfully!" : "Followed successfully!");
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <div className="container text-left">
        <h1 className="my-4" style={{ color: "#000000" }}>
          User List
        </h1>
        <div className="row">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div className="col-md-6 mb-4" key={user._id}>
                {/* Mỗi card sẽ nằm trong 1 cột */}
                <UserCardFollowComponent
                  id={user._id}
                  name={user.name}
                  img={user.img}
                  address={user.address}
                  followerCount={user.followerCount}
                  // isFollowed={currentUser.following?.includes(user._id)} // Truyền trạng thái follow
                  isFollowed={user.isFollowed}
                  // isFollowed={currentUser.following?.includes(user._id)}
                  onFollow={handleFollow} // Truyền hàm xử lý follow xuống
                />
              </div>
            ))
          ) : (
            <p>Không có dữ liệu để hiển thị.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default OtherListUserPage;
