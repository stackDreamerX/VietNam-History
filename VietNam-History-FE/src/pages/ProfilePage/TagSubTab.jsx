import React, { useEffect, useState } from "react";
import "../../css/TagSubTab.css";
import * as TagService from '../../services/TagService';
import * as QuestionService from "../../services/QuestionService";  // Import service getAllQuesByTag
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as message from "../../components/MessageComponent/MessageComponent";
import { useNavigate } from "react-router-dom";
import { Popover } from "antd";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import FormComponent from "../../components/FormComponent/FormComponent";

const TagSubTab = () => {
  const user = useSelector((state) => state.user);
  const userId = user?.id;

  // Lấy danh sách tag từ API
  const getAllTagByUser = async (userId) => {
    try {
      const res = await TagService.getAllTagByUser(userId);
      if (res?.data && Array.isArray(res.data)) {
        return res.data;
      } else {
        throw new Error("API response data is not valid.");
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      return [];
    }
  };

  const { isLoading: isLoadingTag, data: tags, refetch } = useQuery(
    ["tags", userId],
    () => getAllTagByUser(userId),
    { enabled: !!userId }
  );

  // Hàm đếm số lượng câu hỏi cho mỗi tag
  const getUsedCountForTags = async (tags) => {
    return await Promise.all(
      tags.map(async (tag) => {
        const res = await QuestionService.getAllQuesByTag(tag._id); // Gọi service để lấy câu hỏi
        console.log('Questions for tag', tag.name, res); // Log kết quả trả về
        const questions = res.data || []; // Truy cập vào data nếu có
        return {
          ...tag,
          usedCount: Array.isArray(questions) ? questions.length : 0, // Đảm bảo questions là mảng hợp lệ
        };
      })
    );
  };
  

  // Sử dụng useEffect để cập nhật số lượng câu hỏi sau khi tags được load
  const [tagsWithCount, setTagsWithCount] = useState([]);

  useEffect(() => {
    const fetchTagsWithCount = async () => {
      if (tags && tags.length > 0) {
        const tagsWithQuestionsCount = await getUsedCountForTags(tags);
        setTagsWithCount(tagsWithQuestionsCount);
      }
    };

    fetchTagsWithCount();
  }, [tags]);

  const tagQuantity = tagsWithCount.length;
  console.log('gvhv',tagsWithCount)

  const navigate = useNavigate();

  // State cho modal cập nhật tag
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    userTag: "",
  });
  const [showModal, setShowModal] = useState(false);

  // Mở modal cập nhật tag
  const handleUpdateTag = (tag) => {
    setFormData(tag);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Cập nhật tag
  const handleSaveTag = async () => {
    try {
      const res = await TagService.updateTag(formData._id, formData); // Gọi API updateTag
      if (res.status === "OK") {
        alert("Tag updated successfully!"); // Hiển thị thông báo thành công
        setShowModal(false); // Đóng modal
        refetch(); // Lấy lại danh sách tag
      } else {
        message.error("Failed to update the tag."); // Thông báo lỗi nếu không thành công
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      message.error("An error occurred while updating the tag."); // Hiển thị lỗi nếu có
    }
  };

  // Xóa tag
  const onDelete = async (tagId) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      try {
        const res = await TagService.deleteTag(tagId);
        if (res.status === "OK") {
          message.success("Tag deleted successfully!");
          refetch();
        } else {
          message.error("Failed to delete the tag.");
        }
      } catch (error) {
        console.error("Error deleting tag:", error);
        message.error("An error occurred while deleting the tag.");
      }
    }
  };

  // Nội dung Popover
  const content = (tag) => (
    <div>
      <p
        onClick={(e) => {
          e.stopPropagation();
          handleUpdateTag(tag);
        }}
        style={{
          padding: "10px",
          margin: 0,
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#C5E3FC")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
      >
        Update
      </p>
      <p
        onClick={(e) => {
          e.stopPropagation();
          onDelete(tag._id);
        }}
        style={{
          padding: "10px",
          margin: 0,
          cursor: "pointer",
          color: "red",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#F8D7DA")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
      >
        Delete
      </p>
    </div>
  );

  return (
    <div className="container">
      <div className="title">
        <h3>Tags {tagQuantity}</h3>
      </div>
      <div className="container">
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-5">
          {isLoadingTag ? (
            <LoadingComponent />
          ) : tagsWithCount && tagsWithCount.length > 0 ? (
            tagsWithCount.map((tag) => (
              <div
                className="col-6 col-md-5 col-lg-3 mb-3"
                key={tag._id}
                onClick={() => navigate(`/tagsdetail/${tag._id}`)}
              >
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="btn" onClick={(e) => e.stopPropagation()}>
                      <Popover content={content(tag)} trigger="click">
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <i className="bi bi-three-dots-vertical" style={{ color: "#777" }}></i>
                        </div>
                      </Popover>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title text-primary mb-0">{tag.name}</h5>
                    </div>
                    <p className="card-text text-muted" style={{ fontSize: "14px" }}>
                      {tag.description}
                    </p>
                    <span className="text-secondary" style={{ fontSize: "13px" }}>
                      {tag.usedCount} questions
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Không có dữ liệu để hiển thị.</p>
          )}
        </div>
      </div>
      <ModalComponent
        isOpen={showModal}
        title="UPDATE NEW TAG"
        body={
          <>
            <FormComponent
              id="nameTagInput"
              label="Name"
              type="text"
              placeholder="Enter tag's name"
              value={formData.name}
              onChange={(e) =>
                handleChange({
                  target: { name: "name", value: e.target.value },
                })
              }
            />
            <FormComponent
              id="descTagInput"
              label="Description"
              type="text"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) =>
                handleChange({
                  target: { name: "description", value: e.target.value },
                })
              }
            />
          </>
        }
        textButton1="Update"
        onClick1={handleSaveTag} // Gọi hàm handleSaveTag khi bấm nút "Update"
        onClick2={() => setShowModal(false)} // Đóng modal khi bấm "Cancel"
      />
    </div>
  );
};

export default TagSubTab;
