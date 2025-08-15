import React, { useEffect, useState } from "react";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import "../../css/AskQuestionPage.css";
import TextEditor from "./partials/TextEditor";
import * as TagService from "../../services/TagService";
import * as UserService from "../../services/UserService";
import * as QuestionService from "../../services/QuestionService";
import { useQuery } from "@tanstack/react-query";
import FormSelectComponent from "../../components/FormSelectComponent/FormSelectComponent";
import { useSelector } from "react-redux";
import { useMutationHook } from "../../hooks/useMutationHook";
import * as message from "../../components/MessageComponent/MessageComponent";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import Compressor from "compressorjs";
import { useNavigate } from "react-router-dom";

const AskQuestionPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [note, setNote] = useState("");
  const [userQues, setIdUser] = useState("");
  const [selectedTags, setTags] = useState([]); // Chứa các tags đã chọn
  const [imageSrcs, setImageSrcs] = useState([]); // Chứa nhiều ảnh đã chọn

  // Lấy tất cả các tag
  const getAllTag = async () => {
    const res = await TagService.getAllTag();
    console.log("res.data.tag", res);
    return res || []; // Trả về mảng rỗng nếu không có dữ liệu
  };

  useEffect(() => {
    console.log("user:", user);
    if (user?.id) {
      setIdUser(user.id);
    }
  }, [user]);

  const { isLoading: isTagLoading, data: tagsData } = useQuery({
    queryKey: ["tagsData"],
    queryFn: getAllTag,
  });

  // Chuyển đổi tags thành mảng để dùng trong dropdown
  const allTags = Array.isArray(tagsData)
    ? tagsData.map((tag) => ({
        value: tag._id,
        label: tag.name,
      }))
    : [];

  console.log("tahsData", tagsData);
  console.log("allTags", allTags);

  const handleTitle = (value) => {
    setTitle(value);
  };

  const handleContent = (value) => {
    setContent(value);
  };

  const handleNote = (value) => {
    setNote(value);
  };

  const handleTagsChange = (selectedOptions) => {
    if (Array.isArray(selectedOptions)) {
      // Kiểm tra nếu số lượng tag lớn hơn 5
      if (selectedOptions.length <= 5) {
        const selectedTagIds = selectedOptions.map((option) => option.value);
        setTags(selectedTagIds);
      } else {
        // Nếu chọn hơn 5 tag, không cho phép chọn thêm
        alert("You can select up to 5 tags only.");
      }
    } else {
      setTags([]);
    }
  };

  // Xử lý khi chọn ảnh và nén ảnh
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      new Compressor(file, {
        quality: 0.6,
        maxWidth: 800,
        maxHeight: 800,
        success(result) {
          // Đọc file đã nén thành Base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result;
            setImageSrcs((prevImages) => [...prevImages, base64String]);
          };
          reader.readAsDataURL(result);
        },
        error(err) {
          console.error(err);
        },
      });
    });
  };

  // Xử lý xóa ảnh
  const handleRemoveImage = (index) => {
    const newImageSrcs = [...imageSrcs];
    newImageSrcs.splice(index, 1);
    setImageSrcs(newImageSrcs);
  };

  // Lưu câu hỏi
  const mutation = useMutationHook((data) => QuestionService.addQues(data));
  const { data, isLoading, isSuccess, isError } = mutation;

  const mutationUpdate = useMutationHook((id) =>
    UserService.updateQuesCount(id)
  );
  const {
    data: dataUpdate,
    isLoading: isLoadingUpdate,
    isSuccess: isSuccessUpdate,
    isError: isErrorUpdate,
  } = mutationUpdate;

  useEffect(() => {
    if (isSuccess && data?.status !== "ERR") {
      message.success();
      alert("Question has been added successfully!");
      navigate("/question");
    }
    if (isError) {
      message.error();
    }
  }, [isSuccess, isError, data]);

  useEffect(() => {
    if (isSuccessUpdate && dataUpdate?.status !== "ERR") {
      message.success();
      alert("a");
      //navigate("/question")
    }
    if (isErrorUpdate) {
      message.error();
    }
  }, [isSuccessUpdate, isErrorUpdate, dataUpdate]);

  const handleAskQuestionClick = async () => {
    // Kiểm tra nếu không có tag được chọn
    if (selectedTags.length < 1) {
      alert("Please select at least 1 tag.");
      return;
    }

    if (!userQues) {
      alert("User ID is missing. Please log in again.");
      return;
    }

    const questionData = {
      title,
      content,
      userQues,
      note: "asd",
      images: imageSrcs, // Truyền mảng ảnh vào câu hỏi
      tags: selectedTags, // Truyền mảng tag đã chọn vào câu hỏi
    };

    try {
      // Gửi dữ liệu câu hỏi
      await mutation.mutateAsync(questionData);
      await mutationUpdate.mutateAsync(userQues);
    } catch (error) {
      console.error(error);
      alert("An error occurred while processing your request.");
    }
  };

  const handleCancelClick = () => {
    alert("Cancel adding the question!");
    navigate("/question");
  };

  return (
    <div className="container">
      <div className="title" style={{ marginTop: "30px" }}>
        <h1 className="title">Add a post</h1>
      </div>

      <div className="input">
        <h1 className="label">
          Post title <span className="asterisk">*</span>
        </h1>
        <h2 className="description">
          Be specific and imagine you're asking a question to another person.
        </h2>
        <input
          type="text"
          className="input-field"
          value={title}
          onChange={(e) => handleTitle(e.target.value)}
        />
      </div>

      {/* Upload nhiều ảnh */}
      <div className="input" style={{ marginTop: "30px" }}>
        <h1 className="label">Upload Images</h1>
        <input type="file" multiple onChange={handleImageUpload} />
        {imageSrcs.length > 0 && (
          <div>
            <h3>Preview Images</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {imageSrcs.map((src, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={src}
                    alt={`Uploaded preview ${index}`}
                    style={{
                      width: "500px", // Adjusted size
                      height: "auto", // Keep aspect ratio
                      margin: "10px",
                      objectFit: "cover", // To ensure images are properly scaled
                    }}
                  />
                  <button
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      backgroundColor: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="input" style={{ marginTop: "30px" }}>
        <h1 className="label">
          Post Content <span className="asterisk">*</span>
        </h1>
        {/* <h2 className="description">
          Introduce the problem and expand on what you put in the title. Minimum
          20 characters.
        </h2> */}
        <TextEditor
          value={content}
          onChange={handleContent}
          placeholder="Describe the problem here..."
        />
      </div>

      {/* <div className="input" style={{ marginTop: "30px" }}>
        <h1 className="label">What did you try and what were you expecting?</h1>
        <h2 className="description">
          Describe what you tried, what you expected to happen, and what
          actually resulted. Minimum 20 characters.
        </h2>
        <TextEditor
          value={note}
          onChange={handleNote}
          placeholder="Describe what you tried and expected here..."
        />
      </div> */}

      {/* ComboBox Tags với thẻ select */}
      <div className="input" style={{ marginTop: "30px" }}>
        <h1 className="label">Tags</h1>
        <h2 className="description">
          Add up to 5 tags to describe what your question is about. Start typing
          to see suggestions.
        </h2>
        <FormSelectComponent
          placeholder={isTagLoading ? "Đang tải..." : "Chọn Tags"}
          options={allTags}
          selectedValue={selectedTags}
          onChange={handleTagsChange}
          isMulti
        />
      </div>

      {data?.status === "ERR" && (
        <span style={{ color: "red", fontSize: "16px" }}>{data?.message}</span>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "30px",
        }}
      >
        <ButtonComponent textButton="Cancel" onClick={handleCancelClick} />
        <LoadingComponent isLoading={isLoading}>
          <ButtonComponent
            textButton="Submit question"
            onClick={handleAskQuestionClick}
          />
        </LoadingComponent>
      </div>
    </div>
  );
};

export default AskQuestionPage;
