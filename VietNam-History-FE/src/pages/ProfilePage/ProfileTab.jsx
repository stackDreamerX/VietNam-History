import React, { useEffect, useState } from "react";
import "../../css/ProfilePage.css";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import FormComponent from "../../components/FormComponent/FormComponent";
import { useMutationHook } from "../../hooks/useMutationHook";
import { useDispatch, useSelector } from "react-redux";
import * as UserService from "../../services/UserService";
import * as QuestionService from "../../services/QuestionService";
import { updateUser } from "../../redux/slides/userSlide";
import { Upload } from "antd";
import { getBase64 } from "../../utils";
import * as CommentService from "../../services/CommentService";
import { useQuery } from "@tanstack/react-query";

const ProfileTab = () => {
  const user = useSelector((state) => state.user);
  //   console.log("User state:", user);
  const dispatch = useDispatch();

  // Lấy userId từ localStorage
  const [questionCount, setQuestionCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [commentList, setCommentList] = useState([]);
  const [userID, setUserID] = useState("null");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  //   const [name, setName] = useState(user?.name);
  //   const [email, setEmail] = useState(user?.email);
  //   const [phone, setPhone] = useState(user?.phone);
  //   const [birthday, setBirthday] = useState(user?.birthday);
  //   const [img, setImg] = useState(user?.img);
  //   const [note, setNote] = useState(user?.note);
  //   const [facebookLink, setFacebookLink] = useState(user?.facebookLink);
  //   const [githubLink, setGithubLink] = useState(user?.githubLink);
  //   const [address, setAddress] = useState(user?.address);
  //   const [gender, setGender] = useState(user?.gender);
  //   const [password, setPassword] = useState(user?.password);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    birthday: "",
    img: "",
    note: "",
    facebookLink: "",
    githubLink: "",
    address: "",
    gender: "",
    password: "",
    reportCount: 0,
    followerCount: 0,
    followingCount: 0,
    savedCount: 0,
    reputation: 0,
  });

  const mutation = useMutationHook((data) => {
    const { id, access_token, ...rests } = data;
    UserService.updateUserInfo(id, rests, access_token);
  });

  //   const handleNameChange = (value) => {
  //     setName(value);
  //   };
  //   const handleEmailChange = (value) => {
  //     setEmail(value);
  //   };
  //   const handlePhoneChange = (value) => {
  //     setPhone(value);
  //   };
  //   const handleBirthdayChange = (value) => {
  //     setBirthday(value);
  //   };
  //   const handleNoteChange = (value) => {
  //     setNote(value);
  //   };
  //   const handleFacebookLinkChange = (value) => {
  //     setFacebookLink(value);
  //   };
  //   const handleGithubLinkChange = (value) => {
  //     setGithubLink(value);
  //   };
  //   const handleAddressChange = (value) => {
  //     setAddress(value);
  //   };
  //   const handleGenderChange = (value) => {
  //     setGender(value);
  //   };
  //   const handlePasswordChange = (value) => {
  //     setPassword(value);
  //   };

  //   useEffect(() => {
  //     if (user) {
  //       setName(user?.name || "");
  //       setEmail(user?.email || "");
  //       setPhone(user?.phone || "");
  //       setBirthday(user?.birthday || "");
  //       setImg(user?.img || "");
  //       setNote(user?.note || "");
  //       setFacebookLink(user?.facebookLink || "");
  //       setGithubLink(user?.githubLink || "");
  //       setAddress(user?.address || "");
  //       setGender(user?.gender || "");
  //       setPassword(""); // Không lưu lại mật khẩu trong form
  //     }
  //   }, [user]);

  useEffect(() => {
    if (user) {
      setFormData({
        id: user?.id || "",
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        birthday: user?.birthday || "",
        img: user?.img || "",
        note: user?.note || "",
        facebookLink: user?.facebookLink || "",
        githubLink: user?.githubLink || "",
        address: user?.address || "",
        gender: user?.gender || "",
        password: user?.password || "", // Không lưu lại mật khẩu trong form
        reportCount: user?.reportCount || 0,
        followerCount: user?.followerCount || 0,
        followingCount: user?.followingCount || 0,
        savedCount: user?.savedCount || 0,
        answerCount: user?.answerCount || 0,
        quesCount: user?.quesCount || 0,
      });
    }
  }, [user]);

  console.log("userupdate", user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //   const handleUpdate = () => {
  //     const userData = {
  //       id: user?.id,
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
  //       access_token: user?.access_token,
  //     };
  //     mutation.mutate(userData);
  //     console.log("userData", userData);
  //   };

  const handleUpdate = () => {
    const userData = {
      ...formData,
      id: user?.id,
      access_token: user?.access_token,
    };
    mutation.mutate(userData);
  };

  const handleGetDetailsUser = async (id, token) => {
    const res = await UserService.getDetailsUser(id, token);
    // console.log("res", res);
    dispatch(updateUser({ ...res?.data, access_token: token }));
  };

  // useEffect(() => {
  //   if (mutation.isSuccess) {
  //     handleGetDetailsUser(user?.id, user?.access_token);
  //     setStatusMessage({
  //       type: "Success",
  //       message: "Cập nhật thông tin thành công",
  //     });
  //     alert(statusMessage?.message);
  //   } else if (mutation.isError) {
  //     setStatusMessage({
  //       type: "Error",
  //       message: mutation.error?.message || "Cập nhật thông tin thất bại",
  //     });
  //     alert(statusMessage?.message);
  //   }
  // }, [mutation.isSuccess, mutation.isError, mutation.error]);

  //   const handleImgChange = async ({ fileList }) => {
  //     const file = fileList[0];
  //     if (!file.url && !file.preview) {
  //       file.preview = await getBase64(file.originFileObj);
  //     }
  //     setImg(file.preview);
  //   };

  useEffect(() => {
    if (mutation.isSuccess) {
      handleGetDetailsUser(user?.id, user?.access_token);
      setStatusMessage({
        type: "Success",
        message: "Cập nhật thông tin thành công",
      });

      // Thêm đoạn code reload trang sau khi cập nhật thành công
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Đợi 1.5 giây để người dùng thấy thông báo thành công
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

  useEffect(() => {
    // Hàm lấy số lượng câu hỏi
    const fetchQuestionCount = async () => {
      try {
        // Gọi API để lấy câu hỏi theo userId
        const response = await QuestionService.getQuestionsByUserId(user.id);
        const response2 = await CommentService.getCommentByUserId(user.id);

        // Nếu có dữ liệu, cập nhật số lượng câu hỏi
        setQuestionCount(response?.total || 0);
        setCommentCount(response2.length);
      } catch (error) {
        // Nếu có lỗi, cập nhật thông báo lỗi
        setStatusMessage({
          type: "Error",
          message: error.message || "Đã xảy ra lỗi khi tải dữ liệu.",
        });
      }
    };

    // Gọi hàm fetch khi userId thay đổi
    if (user.id) {
      fetchQuestionCount();
    }
  }, [user.id]); // Chạy lại khi userId thay đổi
  //Lấy tất cả comment

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdatePassword = async () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (newPassword !== confirmNewPassword) {
      alert("Mật khẩu mới và xác nhận không khớp!");
      return;
    }

    try {
      const res = await UserService.updatePassword(
        {
          userId: user?.id,
          currentPassword,
          newPassword,
        },
        user?.access_token // truyền token riêng ra ngoài
      );

      if (res?.success) {
        alert("Đổi mật khẩu thành công!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });

        // Thêm đoạn code reload trang sau khi cập nhật mật khẩu thành công
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Đợi 1.5 giây để người dùng thấy thông báo thành công
      } else {
        alert(res?.message || "Đổi mật khẩu thất bại!");
      }
    } catch (err) {
      alert("Lỗi khi đổi mật khẩu: " + err.message);
    }
  };

  return (
    <div className="row">
      <div className="col-3">
        <h3 className="title-profile">Summary</h3>

        <div className="card-profile" style={{ padding: "0 10px" }}>
          <table className="table table-borderless">
            <tbody style={{ verticalAlign: "middle" }}>
              <tr>
                <td className="fw-bold fs-5">{formData.savedCount}</td>
                <td className="fw-bold fs-5">{formData.followerCount}</td>
              </tr>
              <tr className="row-2">
                <td className="text-muted">saved</td>
                <td className="text-muted">followers</td>
              </tr>
              <tr>
                <td className="fw-bold fs-5">{formData.followingCount}</td>
              </tr>
              <tr className="row-2">
                <td className="text-muted">comments</td>
                <td className="text-muted">following</td>
              </tr>
              <tr>
                <td className="fw-bold fs-5">{formData.quesCount}</td>
                <td className="fw-bold fs-5">{formData.answerCount}</td>
              </tr>
              <tr className="row-2">
                <td className="text-muted">questions</td>
                <td className="text-muted">answers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="col-9">
        <div>
          <h3 className="title-profile">Profile</h3>
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
                value={
                  formData.birthday
                    ? new Date(formData.birthday).toISOString().split("T")[0]
                    : ""
                }
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
            <div>
              <h3 className="title-profile" style={{ marginTop: "30px" }}>
                Links
              </h3>
              <div className="card-profile " style={{ padding: "0 20px" }}>
                <div className="row">
                  <div className="col-6">
                    <FormComponent
                      name="facebookLink"
                      label="Facebook"
                      type="link"
                      placeholder="Enter your Facebook link"
                      value={formData.facebookLink}
                      onChange={handleChange}
                      icon={<i class="bi bi-facebook"></i>}
                    />
                  </div>
                  <div className="col-6">
                    <FormComponent
                      name="githubLink"
                      label="Github"
                      type="link"
                      placeholder="Enter your Github link"
                      value={formData.githubLink}
                      onChange={handleChange}
                      icon={<i class="bi bi-github"></i>}
                    />
                  </div>
                </div>
              </div>
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
              name="currentPassword"
              label="Current password"
              type="password"
              placeholder="Enter your old password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
            />
            <FormComponent
              name="newPassword"
              label="New password"
              type="password"
              placeholder="Enter your new password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
            />
            <FormComponent
              name="confirmNewPassword"
              label="Confirm password"
              type="password"
              placeholder="Confirm your password"
              value={passwordForm.confirmNewPassword}
              onChange={handlePasswordChange}
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
                onClick={handleUpdatePassword}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
