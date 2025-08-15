import { useQuery } from '@tanstack/react-query';
import Compressor from 'compressorjs';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import FormSelectComponent from '../../components/FormSelectComponent/FormSelectComponent';
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent';
import '../../css/AskQuestionPage.css';
import { useMutationHook } from '../../hooks/useMutationHook';
import * as QuestionService from "../../services/QuestionService";
import * as TagService from "../../services/TagService";
import TextEditor from './partials/TextEditor';

const UpdateQuestionPage = () => {
  const { id:quesId } = useParams(); 
  console.log('res', quesId)// Lấy ID câu hỏi từ URL
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [note, setNote] = useState('');
  const [userQues, setIdUser] = useState('');
  const [selectedTags, setTags] = useState([]); // Chứa các tags đã chọn
  const [imageSrcs, setImageSrcs] = useState([]); // Chứa nhiều ảnh đã chọn

  // Hàm lấy chi tiết câu hỏi
  const getDetailsQuestion = async (id) => {
    const res = await QuestionService.getDetailsQuestion(id);
    return res?.data || null; // Trả về null nếu không có dữ liệu
  };

  useEffect(() => {
    // Gọi API lấy thông tin chi tiết câu hỏi khi trang được tải
    const fetchQuestionDetail = async () => {
      const questionDetail = await getDetailsQuestion(quesId);
      if (questionDetail) {
        setTitle(questionDetail.title);
        setContent(questionDetail.content);
        setNote(questionDetail.note);
        setTags(questionDetail.tags || []);
        setImageSrcs(questionDetail.images || []);
        setIdUser(questionDetail.userQues || '');
      }
    };

    fetchQuestionDetail();
  }, [quesId]);

  // Hàm lấy tất cả các tag
  const getAllTag = async () => {
    const res = await TagService.getAllTag();
    return res?.data || [];
  };

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

  // Các hàm xử lý sự kiện
  const handleTitle = (value) => setTitle(value);
  const handleContent = (value) => setContent(value);
  const handleNote = (value) => setNote(value);
  const handleTagsChange = (selectedOptions) => {
    if (Array.isArray(selectedOptions)) {
      if (selectedOptions.length <= 5) {
        const selectedTagIds = selectedOptions.map(option => option.value);
        setTags(selectedTagIds);
      } else {
        alert("You can select up to 5 tags only.");
      }
    } else {
      setTags([]);
    }
  };

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
  

  const handleRemoveImage = (index) => {
    const newImageSrcs = [...imageSrcs];
    newImageSrcs.splice(index, 1);
    setImageSrcs(newImageSrcs);
  };

  const mutation = useMutationHook(data => QuestionService.updateQuestion(quesId, data));

  const handleUpdateQuestionClick = async () => {
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
      note,
      images: imageSrcs,
      tags: selectedTags,
    };

    await mutation.mutateAsync(questionData);
    alert('Question has been updated successfully!');
    navigate("/question");
  };

  const handleCancelClick = () => {
    alert("Cancel updating the question!");
    navigate("/question");
  };

  return (
    <div className="container">
      <div className="title" style={{ marginTop: '30px' }}>
        <h1 className="title">Update Question</h1>
      </div>

      <div className="input">
        <h1 className="label">Question title <span className="asterisk">*</span></h1>
        <input
          type="text"
          className="input-field"
          value={title}
          onChange={(e) => handleTitle(e.target.value)}
        />
      </div>

      {/* Upload nhiều ảnh */}
      <div className="input" style={{ marginTop: '30px' }}>
        <h1 className="label">Upload Images</h1>
        <input type="file" multiple onChange={handleImageUpload} />
        {imageSrcs.length > 0 && (
          <div>
            <h3>Preview Images</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {imageSrcs.map((src, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img
                    src={src}
                    alt={`Uploaded preview ${index}`}
                    style={{
                      width: '500px',
                      height: 'auto',
                      margin: '10px',
                      objectFit: 'cover',
                    }}
                  />
                  <button
                    style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '12px',
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

      {/* Nội dung */}
      <div className="input" style={{ marginTop: '30px' }}>
        <h1 className="label">Problem details <span className="asterisk">*</span></h1>
        <TextEditor
          value={content}
          onChange={handleContent}
          placeholder="Describe the problem here..."
        />
      </div>

      <div className="input" style={{ marginTop: '30px' }}>
        <h1 className="label">What did you try and what were you expecting?</h1>
        <TextEditor
          value={note}
          onChange={handleNote}
          placeholder="Describe what you tried and expected here..."
        />
      </div>

      {/* Tags */}
      <div className="input" style={{ marginTop: '30px' }}>
        <h1 className="label">Tags</h1>
        <FormSelectComponent
          placeholder={isTagLoading ? "Đang tải..." : "Chọn Tags"}
          options={allTags}
          selectedValue={selectedTags}
          onChange={handleTagsChange}
          isMulti
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '30px',
        }}
      >
        <ButtonComponent textButton="Cancel" onClick={handleCancelClick} />
        <LoadingComponent isLoading={mutation.isLoading}>
          <ButtonComponent textButton="Update question" onClick={handleUpdateQuestionClick} />
        </LoadingComponent>
      </div>
    </div>
  );
};

export default UpdateQuestionPage;
