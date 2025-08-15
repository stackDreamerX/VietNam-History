import React, { useEffect, useState, useRef } from "react";
import { Styles } from "../../style";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Popover } from "antd";
import * as UserService from "../../services/UserService";
import * as AdminService from "../../services/AdminService";
import * as NotificationService from "../../services/NotificationService";
import { resetUser } from "../../redux/slides/userSlide";
import { resetAdmin } from "../../redux/slides/adminSlide";
import * as QuestionService from "../../services/QuestionService";
import * as TagService from "../../services/TagService";
import Modal from "react-modal";
import "./SearchButton.css";
import "./HeaderComponent.css";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { message } from "antd";

const HeaderComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const admin = useSelector((state) => state.admin);
  const [notifications, setNotifications] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const dispatch = useDispatch();

  const [img, setImg] = useState("");
  const [name, setName] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizMenuOpen, setQuizMenuOpen] = useState(false);
  const quizDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        quizDropdownRef.current &&
        !quizDropdownRef.current.contains(event.target)
      ) {
        setQuizMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const dropdownElementList = document.querySelectorAll(".dropdown-toggle");
      if (window.bootstrap && window.bootstrap.Dropdown) {
        const dropdowns = [...dropdownElementList].map((dropdownToggleEl) => {
          return new window.bootstrap.Dropdown(dropdownToggleEl);
        });
      } else {
        if (window.jQuery) {
          window.jQuery(".dropdown-toggle").dropdown();
        }
      }
    }
  }, []);

  const checkIfTagExists = async (tag) => {
    try {
      const tags = await TagService.getAllTag();
      return tags.some((t) => t.name.toLowerCase() === tag.toLowerCase());
    } catch (error) {
      console.error("Error checking if tag exists:", error);
      return false;
    }
  };

  const handleNavigateLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      // First clear local storage to prevent any automatic re-login attempts
      localStorage.removeItem("access_token");

      // Then try to call the logout endpoints
      try {
        if (user?.id || user?.access_token) {
          await UserService.logoutUser();
        } else if (admin?.id || admin?.access_token) {
          await AdminService.logoutAdmin();
        }
      } catch (apiError) {
        // If the API call fails, that's ok, we'll continue with local logout
        console.warn(
          "API logout failed but continuing with local logout",
          apiError
        );
      }

      // Reset Redux state
      if (user?.id || user?.access_token) {
        dispatch(resetUser());
      }
      if (admin?.id || admin?.access_token) {
        dispatch(resetAdmin());
      }

      // Redirect to home page
      message.success("Logout successful");
      navigate("/");

      // Refresh the page to ensure all components reload with the updated auth state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Logout failed", error);
      message.error("Logout failed");
    }
  };

  const handleNavigateUserProfile = () => {
    if (admin?.isAdmin) {
      window.location.assign("/admin/profile");
    } else {
      window.location.assign("/profile");
    }
  };

  const handleSearch = async () => {
    try {
      let tagList = [];
      let keyword = "";

      if (searchKeyword.includes(",")) {
        tagList = searchKeyword
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "");
      } else {
        const isTagSearch = await checkIfTagExists(searchKeyword);
        if (isTagSearch) {
          tagList = [searchKeyword];
        } else {
          keyword = searchKeyword;
        }
      }

      const results = await QuestionService.searchQuestion(
        tagList,
        keyword,
        1,
        10,
        {}
      );

      setSearchResults(results);
      navigate("/search-results", {
        state: { searchKeyword, searchResults: results },
      });
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const content = (
    <div>
      {["Logout", "Profile"].map((item, index) => (
        <p
          key={index}
          onClick={
            item === "Logout"
              ? handleLogout
              : item === "Profile"
              ? handleNavigateUserProfile
              : null
          }
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#C5E3FC")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
          style={{
            padding: "10px",
            margin: 0,
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
        >
          {item}
        </p>
      ))}
    </div>
  );

  useEffect(() => {
    setName(user?.name || admin?.name);
    setImg(user?.img || admin?.img);
  }, [user, admin]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await NotificationService.getNotificationsByUserId(user?.id); // Gọi API để lấy thông báo

      for (const notification of data.notifications) {
        if (
          !notification.metadata?.answer_id &&
          !notification.metadata?.quesVote_id &&
          !notification.metadata?.follow_id
        ) {
          await NotificationService.deleteNotification(notification._id);
        }
      }

      const filteredNotifications = data.notifications.filter(
        (notification) =>
          notification.metadata?.answer_id ||
          notification.metadata?.quesVote_id ||
          notification.metadata?.follow_id
      );
      setNotifications(filteredNotifications);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error fetching or deleting notifications:", err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const handleMarkAsRead = async (notificationId, questionId, followId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      fetchNotifications();

      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      if (questionId) {
        navigate(`/question-detail/${questionId}`);
        closeModal();
      } else {
        navigate(`/otheruserprofile/${followId}`);
        closeModal();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error.message);
    }
  };
  // Mở modal
  const openModal = () => {
    setModalIsOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setModalIsOpen(false);
  };

  // Function to check if a route is active
  const isRouteActive = (path) => {
    // Special case for home page
    if (path === '/' && location.pathname === '/') {
      return true;
    }

    // Special case for question and related pages
    if (path === '/question' && (
      location.pathname.startsWith('/question') ||
      location.pathname.startsWith('/question-detail')
    )) {
      return true;
    }

    // Special case for tag and related pages
    if (path === '/tag' && (
      location.pathname.startsWith('/tag') ||
      location.pathname.startsWith('/tagsdetail')
    )) {
      return true;
    }

    // Special case for quiz and related pages
    if ((path === '/quiz' || path === '/quizzes' || path === '/my-quizzes' || path === '/create-quiz') && (
      location.pathname.startsWith('/quiz') ||
      location.pathname.startsWith('/quizzes') ||
      location.pathname.startsWith('/my-quizzes') ||
      location.pathname.startsWith('/create-quiz')
    )) {
      return true;
    }

    // Special case for admin pages
    if (path === '/admin' && location.pathname.startsWith('/admin')) {
      return true;
    }

    // General case
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }

    return false;
  };

  return (
    <>
      <nav className="navbar" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="container">
          <a
            className="navbar-brand"
            href="/"
            style={{ color: "#000000", fontSize: "2rem", fontWeight: "bold" }}
          >
            VIETNAM HISTORY
          </a>

          <div className="search-container">
            <input
              className="form-control search-input"
              type="text"
              placeholder="Search Post"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSearch} className="search-button">
              Search
            </button>
          </div>

          {/* Display search results */}
          {searchResults.length > 0 && (
            <div>
              {searchResults.map((result, index) => (
                <div key={index}>
                  <a href={`/question/${result.id}`}>{result.title}</a>
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="btn">
              {user?.name || admin?.name ? (
                <Popover content={content} trigger="click">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginTop: "20px",
                    }}
                  >
                    <img
                      src={
                        img ||
                        "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                      } // Ảnh mặc định nếu không có img
                      alt={`${name}'s avatar`}
                      className="img-fluid rounded-circle p-2"
                      style={{
                        height: "50px",
                        width: "50px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <span
                      style={{
                        marginTop: "0px",
                        fontSize: "15px",
                        fontWeight: "500",
                        color: "#000000",
                      }}
                    >
                      {user.name || admin.name}
                    </span>
                  </div>
                </Popover>
              ) : (
                <div
                  onClick={handleNavigateLogin}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: "20px",
                  }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt="avatar"
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <i
                      className="bi bi-person-circle"
                      style={Styles.iconHeader}
                    ></i>
                  )}
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "100px",
                      color: "#000000",
                    }}
                  >
                    Login
                  </span>
                </div>
              )}

              {/* Icon thông báo */}
              <div
                className="btn"
                onClick={openModal}
                ref={buttonRef}
                style={{ position: "relative", marginTop: "15px" }}
              >
                <i
                  className="bi bi-bell-fill"
                  style={{
                    fontSize: "30px",
                    cursor: "pointer",
                    color: "black",
                  }}
                >
                  {notifications.some(
                    (notification) => !notification.is_read
                  ) && (
                    <span
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "11px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "red",
                        display: "inline-block",
                      }}
                    />
                  )}
                </i>
              </div>
            </div>

            {/* Modal hiển thị thông báo */}
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              contentLabel="Thông báo"
              ariaHideApp={false}
              className="notification-modal"
              overlayClassName="notification-overlay"
              style={{
                content: {
                  position: "absolute",
                  top: buttonRef.current
                    ? buttonRef.current.getBoundingClientRect().bottom + 10
                    : 0, // Đặt vị trí modal dưới button
                  left: buttonRef.current
                    ? Math.min(
                        buttonRef.current.getBoundingClientRect().left,
                        window.innerWidth - 310
                      )
                    : 0, // Đặt cùng vị trí ngang với button
                  width: "280px",
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                },
                overlay: {
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                },
              }}
            >
              <h2 style={{ fontSize: "18px" }}>Notifications</h2>
              {loading && <p>Loading notifications....</p>}
              {!loading && notifications.length === 0 && (
                <p>No notifications.</p>
              )}

              <div className="notification-list">
                {notifications.map((notification) => {
                  let message = "";

                  if (
                    notification.type === "answer" &&
                    notification.metadata.answer_id
                  ) {
                    // Trường hợp trả lời câu hỏi
                    const userName =
                      notification.metadata.answer_id.userAns?.name; // Lấy tên người trả lời
                    const questionTitle =
                      notification.metadata.question_id?.title;
                    message = `${userName} answered your question: "${questionTitle}"`;
                  } else if (
                    notification.type === "vote" &&
                    notification.metadata.quesVote_id
                  ) {
                    // Trường hợp vote câu hỏi
                    const userName =
                      notification.metadata.quesVote_id.user?.name; // Lấy tên người đã vote
                    const questionTitle =
                      notification.metadata.question_id?.title;
                    message = `${userName} voted your question: "${questionTitle}" `;
                  } else if (
                    notification.type === "follow" &&
                    notification.metadata.follow_id
                  ) {
                    // Trường hợp follow
                    const userName = notification.metadata.follow_id?.name;
                    message = `${userName} followed you`;
                  } else {
                    // Trường hợp khác, sử dụng message gốc
                    message = notification.message;
                  }

                  return (
                    <div
                      key={notification._id}
                      className={`notification-item ${
                        notification.is_read ? "read" : "unread"
                      }`}
                      onClick={() =>
                        handleMarkAsRead(
                          notification._id,
                          notification.metadata.question_id?._id,
                          notification.metadata.follow_id?._id
                        )
                      }
                    >
                      <p>{message}</p>
                      {!notification.is_read && <span>(Unread)</span>}
                    </div>
                  );
                })}
              </div>

              <ButtonComponent textButton="Close" onClick={closeModal} />
            </Modal>
          </div>
        </div>
      </nav>
      <div
        style={{
          width: "85%",
          margin: "0 auto",
          borderBottom: "1px solid #ccc",
        }}
      />

      <nav
        className="navbar"
        style={{ backgroundColor: "#FFFFFF", height: "65px" }}
      >
        <div className="container">
          <ul className="nav nav-underline">
            <li className="nav-item">
              <a
                className={`nav-link ${isRouteActive('/') && location.pathname === '/' ? 'active' : ''}`}
                href="/"
                style={{
                  ...Styles.textHeader,
                  ...(isRouteActive('/') && location.pathname === '/' ? { fontWeight: '500' } : {})
                }}
              >
                <i
                  className="bi bi-house-door-fill"
                  style={Styles.iconHeader}
                ></i>
                Home
              </a>
            </li>
          </ul>
          <ul className="nav nav-underline">
            <li className="nav-item">
              <a
                className={`nav-link ${isRouteActive('/question') ? 'active' : ''}`}
                href="/question"
                style={{
                  ...Styles.textHeader,
                  ...(isRouteActive('/question') ? { fontWeight: '500' } : {})
                }}
              >
                <i
                  className="bi bi-chat-left-fill"
                  style={Styles.iconHeader}
                ></i>
                Post
              </a>
            </li>
          </ul>
          <ul className="nav nav-underline">
            <li className="nav-item">
              <a
                className={`nav-link ${isRouteActive('/tag') ? 'active' : ''}`}
                href="/tag"
                style={{
                  ...Styles.textHeader,
                  ...(isRouteActive('/tag') ? { fontWeight: '500' } : {})
                }}
              >
                <i className="bi bi-tags-fill" style={Styles.iconHeader}></i>
                Tags
              </a>
            </li>
          </ul>
          <ul className="nav nav-underline">
            <li className="nav-item">
              <a
                className={`nav-link ${isRouteActive('/other-list-user') ? 'active' : ''}`}
                href="/other-list-user"
                style={{
                  ...Styles.textHeader,
                  ...(isRouteActive('/other-list-user') ? { fontWeight: '500' } : {})
                }}
              >
                <i className="bi bi-people-fill" style={Styles.iconHeader}></i>
                Users
              </a>
            </li>
          </ul>

          {/* New Quiz Tab with dropdown */}
          <ul className="nav nav-underline">
            <li
              className="nav-item dropdown"
              style={{ position: "relative" }}
              ref={quizDropdownRef}
            >
              <div
                className={`nav-link ${isRouteActive('/quiz') || isRouteActive('/quizzes') || isRouteActive('/my-quizzes') || isRouteActive('/create-quiz') ? 'active' : ''} ${quizMenuOpen ? "dropdown-open" : ""}`}
                onClick={() => setQuizMenuOpen(!quizMenuOpen)}
                style={{
                  ...Styles.textHeader,
                  cursor: "pointer",
                  ...(isRouteActive('/quiz') || isRouteActive('/quizzes') || isRouteActive('/my-quizzes') || isRouteActive('/create-quiz') ? { fontWeight: '500' } : {})
                }}
              >
                <i
                  className="bi bi-question-circle-fill"
                  style={Styles.iconHeader}
                ></i>
                Quizzes{" "}
                <i className="bi bi-caret-down-fill dropdown-toggle-icon"></i>
              </div>
              {quizMenuOpen && (
                <div className="quiz-dropdown">
                  <div
                    onClick={() => {
                      navigate("/quizzes");
                      setQuizMenuOpen(false);
                    }}
                    className={`dropdown-item ${isRouteActive('/quizzes') ? 'active' : ''}`}
                    style={{
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontSize: "14px",
                      borderRadius: "4px",
                      margin: "2px 4px",
                      transition: "all 0.2s ease"
                    }}
                  >
                    All Quizzes
                  </div>
                  {(user?.id || admin?.id) && (
                    <div
                      onClick={() => {
                        navigate("/my-quizzes");
                        setQuizMenuOpen(false);
                      }}
                      className={`dropdown-item ${isRouteActive('/my-quizzes') ? 'active' : ''}`}
                      style={{
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontSize: "14px",
                        borderRadius: "4px",
                        margin: "2px 4px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      My Quizzes
                    </div>
                  )}
                  {(user?.id || admin?.id) && (
                    <div
                      onClick={() => {
                        navigate("/create-quiz");
                        setQuizMenuOpen(false);
                      }}
                      className={`dropdown-item ${isRouteActive('/create-quiz') ? 'active' : ''}`}
                      style={{
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontSize: "14px",
                        borderRadius: "4px",
                        margin: "2px 4px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      Create Quiz
                    </div>
                  )}
                </div>
              )}
            </li>
          </ul>

          {admin?.isAdmin && (
            <ul className="nav nav-underline">
              <li className="nav-item">
                <a
                  className={`nav-link ${isRouteActive('/admin') ? 'active' : ''}`}
                  href="/admin/manage"
                  style={{
                    ...Styles.textHeader,
                    ...(isRouteActive('/admin') ? { fontWeight: '500' } : {})
                  }}
                >
                  <i className="bi bi-gear" style={Styles.iconHeader}></i>
                  Manage System
                </a>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </>
  );
};

export default HeaderComponent;
