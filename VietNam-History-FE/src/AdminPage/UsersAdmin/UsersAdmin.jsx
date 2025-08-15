import React, { useState, useEffect } from 'react';
import { filterUsersByActive, filterUsers, updateUserStatus } from "../../services/UserService"; // API
import { setAllUser } from "../../redux/slides/userSlide";
import { useNavigate } from 'react-router-dom';
import * as message from "../../components/MessageComponent/MessageComponent";
import "../../css/UsersAdmin.css";
import { useDispatch, useSelector } from 'react-redux';
import { Popover, Button } from 'antd'; // Import Popover và Button từ antd
import SearchBtn from '../../components/SearchBtn/SearchBtn';

const UsersAdmin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const { allUser } = useSelector((state) => state.user);

  const [searchType, setSearchType] = useState('name'); // Loại tìm kiếm
  const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm
  const [activeTab, setActiveTab] = useState("Allowed"); // Trạng thái tab hiện tại

  // Fetch danh sách người dùng ban đầu
  const fetchUsers = async () => {
    try {
      const response = await filterUsersByActive(true); // Gọi API lấy danh sách người dùng
      dispatch(setAllUser(response.data)); // Lưu vào Redux
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch]);

  // Lọc bỏ người dùng hiện tại
  const filteredUsers = allUser.filter((u) => u._id !== user.id);

  // Lọc người dùng theo trạng thái (Active / Banned)
  const activeUsers = filteredUsers.filter((u) => u.active === true); // Người dùng đang hoạt động
  const bannedUsers = filteredUsers.filter((u) => u.active === false); // Người dùng bị cấm

  // Xem hồ sơ người dùng
  const handleViewProfile = (userId) => {
    navigate(`/otheruserprofile/${userId}`);
  };

  // Đổi trạng thái người dùng (Ban/Allow)
  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      const updatedUser = await updateUserStatus(userId, !isActive);
      if (updatedUser?.status !== 'ERR') {
        message.success(`User has been ${isActive ? 'banned' : 'allowed'} successfully!`);
        fetchUsers(); // Cập nhật danh sách sau khi thay đổi trạng thái
      } else {
        throw new Error(updatedUser?.message || "Failed to update user status.");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      message.error("An error occurred. Please try again.");
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = async () => {
    try {
      const searchParams = { [searchType]: searchTerm };
      const response = await filterUsers(searchParams);

      if (response && response.data) {
        console.log('Filtered users:', response.data);
        dispatch(setAllUser(response.data));
      } else {
        console.error('No data in response:', response);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // Cập nhật loại tìm kiếm khi người dùng chọn trong popover
  const handleSearchTypeChange = (type) => {
    setSearchType(type);
  };

  // Tạo nội dung cho Popover
  const popoverContent = (
    <div>
      <Button type="text" onClick={() => handleSearchTypeChange('name')}>Search by Name</Button>
      <Button type="text" onClick={() => handleSearchTypeChange('email')}>Search by Email</Button>
      <Button type="text" onClick={() => handleSearchTypeChange('phone')}>Search by Phone</Button>
    </div>
  );

  // Cấu trúc phần tử Allowed (Active Users)
  const allowed = (
    <div className='container mt-4'>
      <h1 className='title'>MANAGEMENT USER</h1>
      <div className='search-holder' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Input for search */}
        <input
          className="form-control"
          type="text"
          placeholder={`Enter ${searchType}...`}
          style={{ width: '300px', height: '40px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Popover filter */}
        <Popover
          content={popoverContent}
          title="Select Search Type"
          trigger="click"
          placement="bottomLeft"
        >
          <Button className="btn btn-first">
            <i style={{fontSize:'20px'}} className="bi bi-filter"></i>
          </Button>
        </Popover>
        {/* Search button */}
        <SearchBtn onClick={handleSearch} />
      </div>

      {/* Table of users */}
      <div className="dashboard" style={{ marginTop: '32px' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className='No'>No</th>
                <th className='userName'>Username</th>
                <th className='email'>Email</th>
                <th>Phone number</th>
                <th>Questions</th>
                <th>Answers</th>
                <th>Report</th>
                <th></th>
              </tr>
            </thead>
          </table>
          <div className="table-body-scroll">
            <table className="data-table">
              <tbody>
                {activeUsers.map((row, index) => (
                  <tr key={index}>
                    <td className='No'>{index + 1}</td>
                    <td className='userName'>{row.name}</td>
                    <td className='email'>{row.email}</td>
                    <td>{row.phone}</td>
                    <td>{row.quesCount}</td>
                    <td>{row.answerCount}</td>
                    <td>{row.reportCount}</td>
                    <td>
                      <button className='view-profile' onClick={() => handleViewProfile(row._id)}>View</button>
                      <button
                      style={{marginLeft:25, marginTop:5}}
                        className={`btn btn-sm ${row.active ? "btn-danger" : "btn-success"}`}
                        onClick={() => handleToggleUserStatus(row._id, row.active)}
                      >
                        {row.active ? "Ban" : "Allow"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Cấu trúc phần tử Banned (Inactive Users)
  const banned = (
    <div className='container mt-4'>
      <h1 className='title'>MANAGEMENT USER</h1>
      <div className='search-holder' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Input for search */}
        <input
          className="form-control"
          type="text"
          placeholder={`Enter ${searchType}...`}
          style={{ width: '300px', height: '40px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Popover filter */}
        <Popover
          content={popoverContent}
          title="Select Search Type"
          trigger="click"
          placement="bottomLeft"
        >
          <Button className="btn btn-first">
            <i style={{fontSize:'20px'}} className="bi bi-filter"></i>
          </Button>
        </Popover>
        {/* Search button */}
        <SearchBtn onClick={handleSearch} />
      </div>

      {/* Table of banned users */}
      <div className="dashboard" style={{ marginTop: '32px' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className='No'>No</th>
                <th className='userName'>Username</th>
                <th className='email'>Email</th>
                <th>Phone number</th>
                <th>Questions</th>
                <th>Answers</th>
                <th>Report</th>
                <th></th>
              </tr>
            </thead>
          </table>
          <div className="table-body-scroll">
            <table className="data-table">
              <tbody>
                {bannedUsers.map((row, index) => (
                  <tr key={index}>
                    <td className='No'>{index + 1}</td>
                    <td className='userName'>{row.name}</td>
                    <td className='email'>{row.email}</td>
                    <td>{row.phone}</td>
                    <td>{row.quesCount}</td>
                    <td>{row.answerCount}</td>
                    <td>{row.reportCount}</td>
                    <td>
                      <button className='view-profile' onClick={() => handleViewProfile(row._id)}>View</button>
                      <button
                        className={`btn btn-sm ${row.active ? "btn-danger" : "btn-success"}`}
                        onClick={() => handleToggleUserStatus(row._id, row.active)}
                      >
                        {row.active ? "Ban" : "Allow"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="d-flex">
      {/* Tabs dọc */}
      <div
        className="nav flex-column nav-pills me-3"
        style={{ width: "200px" }}
      >
        <button
          className={`nav-link ${activeTab === "Allowed" ? "active" : ""}`}
          onClick={() => setActiveTab("Allowed")}
        >
          Allowed
        </button>
        <button
          className={`nav-link ${activeTab === "Banned" ? "active" : ""}`}
          onClick={() => setActiveTab("Banned")}
        >
          Banned
        </button>
      </div>

      {/* Nội dung Tab */}
      <div className="tab-content" style={{ flexGrow: 1 }}>
        <div className="tab-pane fade show active">
          {activeTab === "Allowed" && <div>{allowed}</div>}
          {activeTab === "Banned" && <div>{banned}</div>}
        </div>
      </div>
    </div>
  );
};

export default UsersAdmin;
