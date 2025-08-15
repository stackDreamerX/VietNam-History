import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as UserService from "../../services/UserService"; 
import * as TagService from "../../services/TagService"; 
import "./SearchPostPage.css";

const SearchResultsPage = () => {
  const location = useLocation();
  const { searchKeyword, searchResults } = location.state || {};

  const [userData, setUserData] = useState({});
  const [tagsData, setTagsData] = useState({});
  const [loading, setLoading] = useState(true);

  // Kiểm tra cấu trúc của searchResults
  const results = searchResults?.data || [];
  const hasResults = results.length > 0;

  useEffect(() => {
    const fetchUserData = async (userId) => {
      try {
        const response = await UserService.getDetailsUser(userId);
  
        if (response.status === "OK" && response.data) {
          setUserData(response.data);  // Lưu dữ liệu người dùng vào state
        } else {
          setUserData({ name: "Unknown User" });  // Nếu không tìm thấy người dùng, hiển thị Unknown User
        }
        setLoading(false); // Đánh dấu kết thúc quá trình tải
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData({ name: "Unknown User" }); // Hiển thị Unknown User khi có lỗi
        setLoading(false);
      }
    };
  
    if (hasResults && results[0]?.userQues) {
      fetchUserData(results[0]?.userQues);  // Gọi API lấy thông tin người dùng từ ID
    }
  }, [results]);

  useEffect(() => {
    // Hàm để lấy tên tags dựa trên tagId
    const fetchTagsData = async (tagIds) => {
      try {
        const tagsDetails = await Promise.all(tagIds.map(tagId => TagService.getDetailsTag(tagId)));
        const tagsDataMap = tagsDetails.reduce((acc, response) => {
          const tag = response.data; // Lấy thông tin tag từ trường 'data'
          if (tag && tag._id && tag.name) {
            acc[tag._id] = tag.name;  // Chỉ thêm tag nếu tag có _id và name
          } else {
            console.log("Invalid tag data:", tag); 
          }
          return acc;
        }, {});
        
        // Kiểm tra tagsDataMap trước khi cập nhật state
        if (Object.keys(tagsDataMap).length > 0) {
          setTagsData(tagsDataMap);
        } else {
          console.log("No valid tags data to update");
        }
  
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tag data:", error);
        setLoading(false);
      }
    };
  
    // Kiểm tra và gọi fetchTagsData nếu có tags trong kết quả tìm kiếm
    if (hasResults && results.length > 0) {
      const allTagIds = results.flatMap(result => result.tags); // Lấy tất cả tagId từ kết quả
      const uniqueTagIds = [...new Set(allTagIds)]; // Chỉ lấy các tagId duy nhất
      fetchTagsData(uniqueTagIds);  // Lấy thông tin của các tag duy nhất
    }
  }, [results, hasResults]);
  

  return (
    <div className="question-page-container">
  <div className="question-page-header">
    <h2 className="question-page-title">
      Search Results for: <span className="highlight">{searchKeyword}</span>
    </h2>
    {hasResults && (
      <p className="question-count">
        {results.length} {results.length > 1 ? "questions" : "question"} found
      </p>
    )}
  </div>
  <div className="question-page-content">
    {hasResults ? (
      <div className="question-list">
        {results.map((result, index) => (
          <div className="question-item" key={index}>
            <a href={`/question-detail/${result._id}`} className="question-link">
              <h3 className="question-item-title">{result.title}</h3>
              <div className="question-item-meta">
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                  
                    <span className="question-item-user">
                      {userData?.name || "Unknown User"}
                    </span>
                    {" | "}
                    <span className="question-item-date">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </span>
                  </>
                )}
    
              {result.tags && result.tags.length > 0 && (
                <div className="tags-container">
                  <ul className="tags-list">
                    {result.tags.map((tagId) => (
                      tagsData[tagId] ? (
                        <li key={tagId} className="tag-item">
                          {tagsData[tagId]}
                        </li>
                      ) : null
                    ))}
                  </ul>
                </div>
              )} 
              </div>
              <p className="question-item-excerpt">{result.content || 'No content available.'}</p>
              
            </a>
          </div>
        ))}
      </div>
    ) : (
      <p className="no-results-message">No results found</p>
    )}
  </div>
</div>

  );
};

export default SearchResultsPage;
