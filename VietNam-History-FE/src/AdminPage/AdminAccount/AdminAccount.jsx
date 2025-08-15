import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import SearchBtn from '../../components/SearchBtn/SearchBtn'
import NewUserBtn from '../../components/NewUserBtn/NewUserBtn'
import '../../css/UsersAdmin.css'
import { setAllAdmin } from "../../redux/slides/adminSlide";
import { useNavigate } from 'react-router-dom'
import { getAllAdmin, deleteAdmin, filterAdmin } from '../../services/AdminService'
import { Button, Popover } from 'antd'

const AdminAccount = () => {
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const dispatch = useDispatch();
  // const admin = useSelector((state) => state.admin);
  // console.log("user", user);
  const user = useSelector((state) => state.admin);
  const { allAdmin } = useSelector((state) => state.admin);
  console.log("allUser", allAdmin);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllAdmin();
        dispatch(setAllAdmin(response.data));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [dispatch]);

  // Lọc bỏ người dùng hiện tại ra khỏi danh sách
  const filteredUsers = allAdmin.filter((u) => u._id !== user.id);
  allAdmin.forEach(admin => {
    console.log("ADMIN", admin);
  });

  const hadleNewAdmin = () => {
    navigate(`/admin/add-admin`)
  }

  const handleOnDelete = async (id) => {
    // event.stopPropagation(); // Ngừng sự kiện lan truyền

    const isConfirmed = window.confirm("Are you sure you want to delete this admin account?");
    if (isConfirmed) {
      try {
        await deleteAdmin(id);
        const response = await getAllAdmin();
        dispatch(setAllAdmin(response.data));
        alert("Admin account deleted successfully!");
        //  navigate(-1);

      } catch (error) {
        console.error("Error deleting admin account: ", error);
        alert("Error deleting admin account.");
      }
    }

  };

  //////////---------filter-------------/////////
  const [searchType, setSearchType] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');

  // Xử lý tìm kiếm
  const handleSearch = async () => {
    try {
      const searchParams = { [searchType]: searchTerm };
      const response = await filterAdmin(searchParams);

      if (response && response.data) {
        dispatch(setAllAdmin(response.data));
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


  return (
    <div className='container mt-4'>
      <h1 className='title'>ADMIN</h1>
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
            <i style={{ fontSize: '20px' }} className="bi bi-filter"></i>
          </Button>
        </Popover>
        {/* Search button */}
        <SearchBtn onClick={handleSearch} />
        <div>
          <NewUserBtn onClick={hadleNewAdmin} />
        </div>
      </div>



      <div className="dashboard" style={{ marginTop: '32px' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th >No</th>
                <th >Username</th>
                <th className='email'>Email</th>
                <th>Phone number</th>
                <th></th>
              </tr>
            </thead>
          </table>
          <div className="table-body-scroll">
            <table className="data-table">
              <tbody>
                {filteredUsers.map((row, index) => (
                  <tr key={index}>
                    <td >{index + 1}</td>
                    <td >{row.name}</td>
                    <td className='email'>{row.email}</td>
                    <td>{row.phone}</td>
                    <button
                      className="ban-profile" onClick={() => handleOnDelete(row._id)}>Delete</button>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAccount