import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import FormComponent from "../../components/FormComponent/FormComponent";
import * as message from "../../components/MessageComponent/MessageComponent";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import SortBtn_Tags from "../../components/SortBtn/SortBtn_Tags";
import TagsBoxComponent from "../../components/TagsBoxComponent/TagsBoxComponent";
import { useMutationHook } from "../../hooks/useMutationHook";
import * as TagService from "../../services/TagService";
import * as QuestionService from "../../services/QuestionService";
import { useQuery } from "@tanstack/react-query";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import { useSelector } from "react-redux";
import Pagination from "../../components/Pagination/Pagination";

const TagsPage = () => {
  // Lấy thông tin user từ Redux
  const user = useSelector((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState(null); // "New" hoặc "Popular"
  const [currentPage, setCurrentPage] = useState(1);
  const TAGS_PER_PAGE = 15;

  // State cho form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    userTag: "",
  });
  const [showModal, setShowModal] = useState(false);

  // State lưu danh sách tags cùng số lượng câu hỏi
  const [tagsWithCount, setTagsWithCount] = useState([]);

  // Sử dụng useNavigate để chuyển trang
  const navigate = useNavigate();

  // Hàm cập nhật state từ input
  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({ ...prev, userTag: user.id }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Hàm reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      userTag: user?.id || "",
    });
  };

  // Mutation để thêm tag
  const mutation = useMutationHook((data) => TagService.addTag(data));
  const { data, isLoading, isSuccess, isError } = mutation;

  // Lấy danh sách tag từ API
  const getAllTag = async () => {
    const res = await TagService.getAllTag();
    // console.log("res.data", res);
    return res;
  };

  const getAllQuesByTag = async (tagId) => {
    const res = await QuestionService.getAllQuesByTag(tagId);
    // console.log("res.length", res.data.length);
    return res.data.length; // Trả về số lượng câu hỏi
  };

  const { isLoading: isLoadingTag, data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: getAllTag,
    onSuccess: async (tags) => {
      // Sau khi lấy danh sách tags, gọi API để lấy số lượng câu hỏi
      const updatedTags = await Promise.all(
        tags.map(async (tag) => {
          const usedCount = await getAllQuesByTag(tag._id);
          return { ...tag, usedCount };
        })
      );
      setTagsWithCount(updatedTags);
    },
  });

  // Xử lý kết quả sau khi thêm tag
  useEffect(() => {
    if (isSuccess && data?.status !== "ERR") {
      message.success();
      alert("Add new tag successfully!");
      resetForm();
      setShowModal(false);
    }
    if (isError) {
      message.error();
    }
  }, [isSuccess, isError, navigate]);

  // Mở modal thêm tag
  const handleAddTag = () => {
    setShowModal(true);
  };

  // Lưu tag mới
  const handleSaveTag = async () => {
    if (!formData.userTag) {
      alert("User ID is missing. Please log in again.");
      return;
    }
    await mutation.mutateAsync(formData);
  };

  // Đóng modal và reset form
  const onCancel = () => {
    alert("Cancel adding the tag!");
    resetForm();
    setShowModal(false);
  };

  // click chọn để hiện chi tiết tag
  const handleTagClick = (tagId) => {
    navigate(`/tagsdetail/${tagId}`);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  // Handle filter option change
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filter option changes
  }, [filterOption]);

  const getFilteredTags = () => {
    let filteredTags = tagsWithCount;

    // Tìm kiếm theo tên
    if (searchQuery) {
      filteredTags = filteredTags.filter((tag) =>
        tag.name.toLowerCase().includes(searchQuery)
      );
    }

    // Sắp xếp theo "New" hoặc "Popular"
    if (filterOption === "New") {
      filteredTags = filteredTags.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (filterOption === "Popular") {
      filteredTags = filteredTags.sort((a, b) => b.usedCount - a.usedCount);
    }

    return filteredTags;
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
    <>
      <div className="container text-left">
        <div className="row mb-3">
          <div className="col-6">
            <h1 className="my-4" style={{ color: "#033F74" }}>
              Tags
            </h1>
          </div>
          <div
            className="col-6 d-flex justify-content-end"
            style={{ marginTop: "30px" }}
          >
            <div style={{ marginLeft: "auto" }}>
              <ButtonComponent
                textButton="Add new tag"
                icon={<i className="bi bi-plus-circle"></i>}
                onClick={handleAddTag}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-xl text-left">
        <div className="row mb-3">
          <div className="col-6">
            <input
              className="form-control"
              type="search"
              placeholder="Search tag by name"
              style={{ width: "300px", height: "35px" }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div
            className="col d-flex justify-content-between"
            style={{ marginTop: "30px" }}
          >
            <SortBtn_Tags setFilterOption={setFilterOption} />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-5">
          {isLoadingTag ? (
            <LoadingComponent />
          ) : getCurrentPageTags().length > 0 ? (
            getCurrentPageTags().map((tag) => (
              <div
                className="col-6 col-md-4 col-lg-2 mb-4"
                key={tag._id}
                onClick={() => handleTagClick(tag._id)}
              >
                <TagsBoxComponent
                  tagsname={tag.name}
                  description={tag.description}
                  quantity={tag.usedCount || 0}
                />
              </div>
            ))
          ) : (
            <p>No tags match your search.</p>
          )}
        </div>

        {/* Pagination */}
        {getFilteredTags().length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modal thêm tag mới */}
      <ModalComponent
        isOpen={showModal}
        title="ADD NEW TAG"
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
            {data?.status === "ERR" && (
              <span style={{ color: "red", fontSize: "16px" }}>
                {data?.message}
              </span>
            )}
          </>
        }
        textButton1="Add"
        onClick1={handleSaveTag}
        onClick2={onCancel}
      />
    </>
  );
};

export default TagsPage;
