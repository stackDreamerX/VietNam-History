import React from 'react';
import ApplyBtn from '../../components/ApplyBtn/ApplyBtn';

const QuestionFilter = ({ onApplyFilters }) => {
  const [filters, setFilters] = React.useState({
    no_answers: false,
    no_accepted_answer: false,
    tag : '',
    sort_by: '', // Lưu giá trị của "Sorted by"
    the_following_tags: false,
  });

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setFilters((prevFilters) => {
      // Xử lý checkbox nhóm "Sorted by"
      if (["newest", "recent_activity", "highest_score", "most_frequent"].includes(name)) {
        return {
          ...prevFilters,
          sort_by: checked ? name : '', // Chỉ lưu giá trị của checkbox được chọn
        };
      }

      

      // Checkbox khác
      return {
        ...prevFilters,
        [name]: checked,
      };
    });
  };

  const handleInputChange = (event) => {
    const { value } = event.target;
    

    setFilters((prevFilters) => ({
      ...prevFilters,
      tag: value,
    }));
  };

  

  const handleApplyClick = () => {
    if (onApplyFilters) {
        onApplyFilters(filters); // Truyền dữ liệu filter khi nhấn nút "Apply"
        alert('Đã áp dụng bộ lọc.');
    }
};

  return (
    <div
      style={{
        marginTop: '30px',
        padding: '10px 20px',
        border: '1px solid #FFEA75',
        borderRadius: '16px',
        backgroundColor: '#FFFDF0',
        maxWidth: '1000px',
        width: '100%',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        left: '20px',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {/* Cột đầu tiên */}
      <div style={{ flex: 1, marginRight: '20px' }}>
        <h4 style={{ marginBottom: '15px', color: '#121212', fontSize: '20px', fontWeight: '700' }}>
          Filter by
        </h4>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="checkbox"
            name="no_answers"
            checked={filters.no_answers}
            onChange={handleCheckboxChange} // Cập nhật sự thay đổi trạng thái
          />
          <label style={{ marginLeft: '8px', color: '#121212' }}>No answers</label>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="checkbox"
            name="no_accepted_answer"
            checked={filters.no_accepted_answer}
            onChange={handleCheckboxChange} // Cập nhật sự thay đổi trạng thái
          />
          <label style={{ marginLeft: '8px', color: '#121212' }}>No accepted answer</label>
        </div>
      </div>

      {/* Cột thứ hai */}
      <div style={{ flex: 1, marginRight: '20px' }}>
        <h4 style={{ marginBottom: '15px', color: '#121212', fontSize: '20px', fontWeight: '700' }}>
          Sorted by
        </h4>
        {["newest", "recent_activity", "highest_score", "most_frequent"].map((sortOption) => (
          <div style={{ marginBottom: '12px' }} key={sortOption}>
            <input
              type="checkbox"
              name={sortOption}
              checked={filters.sort_by === sortOption}
              onChange={handleCheckboxChange}
            />
            <label style={{ marginLeft: '8px', color: '#121212' }}>
              {sortOption.replace(/_/g, ' ')}
            </label>
          </div>
        ))}
      </div>

      {/* Cột thứ ba */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h4 style={{ marginBottom: '15px', color: '#121212', fontSize: '20px', fontWeight: '700' }}>
            Tags
          </h4>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="checkbox"
              name="the_following_tags"
              checked={filters.the_following_tags} // Chuyển đối giá trị boolean cho tags
              onChange={handleCheckboxChange}
            />
            <label style={{ marginLeft: '8px', color: '#121212' }}>The following tags:</label>
          </div>
          <input
            className="form-control"
            type="text"
            value={filters.tag}
            onChange={handleInputChange}
            style={{
              width: '100%',
              height: '35px',
              marginTop: '10px',
              border: '1px solid #FFEA75',
            }}
          />
        </div>
        <div style={{ position: 'absolute', bottom: '10px', right: '0px' }}>
          <ApplyBtn onClick={handleApplyClick} />
        </div>
      </div>
    </div>
  );
};

export default QuestionFilter;
