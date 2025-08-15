import React from "react";
import PropTypes from "prop-types";
import "../../css/PaginationComponent.css"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePreviousClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  };

  // Tạo danh sách các trang, chỉ hiển thị các trang gần với currentPage
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const range = 2; // Hiển thị 2 trang trước và 2 trang sau
    const start = Math.max(1, currentPage - range);
    const end = Math.min(totalPages, currentPage + range);

    for (let i = start; i <= end; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`pagination-button ${i === currentPage ? "active" : ""}`}
          onClick={() => handlePageClick(i)}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-button"
        onClick={handlePreviousClick}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      {renderPageNumbers()}
      <button
        className="pagination-button"
        onClick={handleNextClick}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
