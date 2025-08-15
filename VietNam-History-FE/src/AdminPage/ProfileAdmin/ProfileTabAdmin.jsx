import React, { useEffect, useState } from "react";
import "../../css/ProfilePage.css";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import FormComponent from "../../components/FormComponent/FormComponent";
import { useDispatch, useSelector } from "react-redux";
import { updateAdmin } from "../../redux/slides/adminSlide";
import { getBase64 } from "../../utils";
import { useMutationHook } from "../../hooks/useMutationHook";
import * as AdminService from "../../services/AdminService";
import { Upload } from "antd";
import { useNavigate } from "react-router-dom";

const ProfileTab = () => {
  const admin = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lấy adminId từ localStorage
  const [statusMessage, setStatusMessage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  //   const [name, setName] = useState(admin?.name);
  //   const [email, setEmail] = useState(admin?.email);
  //   const [phone, setPhone] = useState(admin?.phone);
  //   const [birthday, setBirthday] = useState(admin?.birthday);
  //   const [img, setImg] = useState(admin?.img);
  //   const [note, setNote] = useState(admin?.note);
  //   const [facebookLink, setFacebookLink] = useState(admin?.facebookLink);
  //   const [githubLink, setGithubLink] = useState(admin?.githubLink);
  //   const [address, setAddress] = useState(admin?.address);
  //   const [gender, setGender] = useState(admin?.gender);
  //   const [password, setPassword] = useState(admin?.password);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    img: "",
    note: "",
    address: "",
    gender: "",
    password: "",
  });

  const mutation = useMutationHook((data) => {
    const { id, access_token, ...rests } = data;
    AdminService.updateAdminInfo(id, rests, access_token);
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin?.name || "",
        email: admin?.email || "",
        phone: admin?.phone || "",
        birthday: admin?.birthday || "",
        img: admin?.img || "",
        note: admin?.note || "",
        address: admin?.address || "",
        gender: admin?.gender || "",
        password: admin?.password || "", // Không lưu lại mật khẩu trong form
      });
    }
  }, [admin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //   const handleUpdate = () => {
  //     const adminData = {
  //       id: admin?.id,
  //       name,
  //       email,
  //       phone,
  //       birthday,
  //       img,
  //       note,
  //       facebookLink,
  //       githubLink,
  //       address,
  //       gender,
  //       password,
  //       access_token: admin?.access_token,
  //     };
  //     mutation.mutate(adminData);
  //     console.log("adminData", adminData);
  //   };

  const handleUpdate = () => {
    const adminData = {
      ...formData,
      id: admin?.id,
      access_token: admin?.access_token,
    };
    mutation.mutate(adminData);
  };

  const handleGetDetailsAdmin = async (id, token) => {
    const res = await AdminService.getDetailsAdmin(id, token);
    // console.log("res", res);
    dispatch(updateAdmin({ ...res?.data, access_token: token }));
  };

  useEffect(() => {
    if (mutation.isSuccess) {
      handleGetDetailsAdmin(admin?.id, admin?.access_token);
      setStatusMessage({
        type: "Success",
        message: "Cập nhật thông tin thành công",
      });
    } else if (mutation.isError) {
      setStatusMessage({
        type: "Error",
        message: mutation.error?.message || "Cập nhật thông tin thất bại",
      });
    }
  }, [mutation.isSuccess, mutation.isError, mutation.error]);

  useEffect(() => {
    if (statusMessage) {
      alert(statusMessage.message);
    }
  }, [statusMessage]);

  const handleImgChange = async ({ fileList }) => {
    const file = fileList[0];
    if (file) {
      const preview = await getBase64(file.originFileObj);
      setFormData((prevData) => ({
        ...prevData,
        img: preview,
      }));
    }
  };

  const handleAddAdmin = () => {
    navigate("/admin/add-admin");
  };
  return (
    <div className="row">
      <div
        className="d-flex justify-content-between "
        style={{ marginBottom: "20px" }}
      >
        <h3
          className="title-profile"
          style={{
            marginLeft: "20px",
          }}
        >
          PROFILE
        </h3>
        <ButtonComponent
          textButton="Add Admin"
          type="button"
          onClick={handleAddAdmin}
        />
      </div>
      <div
        className="col-9"
        style={{
          marginLeft: "198px",
        }}
      >
        <div>
          <div className="card-profile " style={{ padding: "0 20px" }}>
            <div className="avatar-container">
              {formData.img && (
                <img
                  src={formData.img}
                  alt="Avatar"
                  className="avatar-img"
                  name="img"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    boxShadow: "0px 0px 5px rgba(0,0,0,0.2)",
                  }}
                />
              )}

              <Upload
                onChange={handleImgChange}
                maxCount={1}
                beforeUpload={() => false}
                showUploadList={false}
              >
                <ButtonComponent textButton="Change photo" />
              </Upload>
            </div>

            <div style={{ marginTop: "30px" }}>
              <FormComponent
                name="name"
                label="Display name"
                type="text"
                placeholder="Enter your display name"
                value={formData.name}
                onChange={handleChange}
              />
              <FormComponent
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              <FormComponent
                name="phone"
                label="Phone number"
                type="text"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
              <FormComponent
                name="address"
                label="Address"
                type="text"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
              />
              <FormComponent
                name="birthday"
                label="Birthday"
                type="date"
                placeholder="Enter your birthday"
                value={formData.birthday}
                onChange={handleChange}
              />
              <FormComponent
                name="note"
                label="About me"
                type="text"
                placeholder="Introduce yourself"
                value={formData.note}
                onChange={handleChange}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "30px",
                marginBottom: "10px",
              }}
            >
              <ButtonComponent
                textButton="Update"
                type="submit"
                onClick={handleUpdate}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="title-profile" style={{ marginTop: "30px" }}>
            Update password
          </h3>
          <div className="card-profile " style={{ padding: "0 20px" }}>
            <FormComponent
              id="emailInput"
              label="Old password"
              type="password"
              placeholder="Enter your old password"
            />
            <FormComponent
              id="emailInput"
              label="New password"
              type="password"
              placeholder="Enter your new password"
            />
            <FormComponent
              id="emailInput"
              label="Confirm password"
              type="password"
              placeholder="Confirm your password"
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "30px",
                marginBottom: "10px",
              }}
            >
              <ButtonComponent
                textButton="Update"
                type="submit"
                onClick={handleUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
