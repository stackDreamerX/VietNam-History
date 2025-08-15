import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import * as QuestionService from "../../services/QuestionService";
import * as TagService from "../../services/TagService";
import Pagination from "../../components/Pagination/Pagination";

function TagAdmin() {
  const [tagsWithCount, setTagsWithCount] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const TAGS_PER_PAGE = 15;
  const navigate = useNavigate();

  // Lấy danh sách tag và số lượng câu hỏi liên quan
  useEffect(() => {
    const fetchTagsWithCount = async () => {
      setIsLoading(true);
      try {
        const res = await TagService.getAllTag();
        const tags = res;

        // Sau khi lấy danh sách tags, gọi API để lấy số lượng câu hỏi
        const updatedTags = await Promise.all(
          tags.map(async (tag) => {
            const questions = await getAllQues(tag._id);
            return { ...tag, usedCount: questions.length };
          })
        );

        setTagsWithCount(updatedTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTagsWithCount();
  }, []);

  // Hàm lấy danh sách câu hỏi theo tagId
  const getAllQues = async (tagId) => {
    const res = await QuestionService.getAllQuesByTag(tagId);
    return res.data;
  };

  // click chọn để hiện chi tiết tag
  const handleTagClick = (tagId) => {
    navigate(`/tagsdetail/${tagId}`);
  };

  // Hàm xóa tag
  const handleDeleteTag = async (tagId, event) => {
    event.stopPropagation(); // Ngăn sự kiện cha chạy

    const confirmDelete = window.confirm("Are you sure you want to delete this tag?");
    if (confirmDelete) {
      try {
        const res = await TagService.deleteTag(tagId);
        if (res?.status === "OK") {
          alert("Tag deleted successfully!");
          // Sau khi xóa, cập nhật lại danh sách tag
          setTagsWithCount((prevTags) => prevTags.filter((tag) => tag._id !== tagId));
        } else {
          alert(res?.message || "Failed to delete the tag.");
        }
      } catch (error) {
        console.error("Error deleting tag:", error);
        alert("An error occurred while deleting the tag.");
      }
    } else {
      alert("Tag deletion canceled.");
    }
  };

  // Xử lý tìm kiếm
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  // Lọc tag theo tìm kiếm
  const getFilteredTags = () => {
    if (!searchQuery) {
      return tagsWithCount;
    }
    return tagsWithCount.filter(tag =>
      tag.name.toLowerCase().includes(searchQuery)
    );
  };

  // Xử lý phân trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Lấy danh sách tags cho trang hiện tại
  const getCurrentPageTags = () => {
    const filteredTags = getFilteredTags();
    const startIndex = (currentPage - 1) * TAGS_PER_PAGE;
    const endIndex = startIndex + TAGS_PER_PAGE;
    return filteredTags.slice(startIndex, endIndex);
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(getFilteredTags().length / TAGS_PER_PAGE);

  return (
    <div className="container my-4">
      <h1 className='title' style={{ color: "#EDBE00" }}>MANAGEMENT TAGS</h1>
      <p
        style={{
          color: "#323538",
          marginTop: "10px",
          marginLeft: "20px",
          fontSize: "20px",
          fontWeight: "600",
        }}
      >
        {getFilteredTags().length} tags
      </p>
      <div style={{ position: "relative", width: "300px", marginBottom: '30px' }}>
        <input
          type="text"
          className="form-control d-inline-block"
          placeholder="Search by tag name..."
          style={{ width: "100%" }}
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <i className="bi bi-search" style={{
          position: "absolute",
          right: "15px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#666"
        }}></i>
      </div>

      {/* Tags Grid */}
      <div className="row">
        {isLoading ? (
          <LoadingComponent isLoading={isLoading} />
        ) : getCurrentPageTags().length > 0 ? (
          getCurrentPageTags().map((tag) => (
            <div
              className="col-md-4 mb-4"
              key={tag._id}
              onClick={() => handleTagClick(tag._id)}
            >
              <div className="card shadow-sm" style={{ backgroundColor: "#FFF9E6" }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title mb-0" style={{ color: "#EDBE00" }}>{tag.name}</h5>
                    <div>
                      <button
                        className="btn btn-sm btn-light"
                        onClick={(event) => handleDeleteTag(tag._id, event)} // Truyền event vào hàm
                      >
                        <i className="bi bi-trash text-danger"></i>
                      </button>
                    </div>
                  </div>
                  <p className="card-text" style={{ fontSize: "14px", color: "#000" }}>
                    {tag.description}
                  </p>
                  <span style={{ fontSize: "13px", color: "#000" }}>
                    {tag.usedCount} câu hỏi
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No tags match your search.</p>
        )}
      </div>

      {/* Pagination */}
      {getFilteredTags().length > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export default TagAdmin;
