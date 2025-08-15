import React, { useEffect, useState } from "react";
import "../../css/StatisticTopicPage.css";
import PieChart from "../../components/PieChartComponent/PieChartComponent";
import * as TagService from "../../services/TagService";
import * as QuestionService from "../../services/QuestionService";

const StatisticTopicPage = () => {
  const [tagsWithCount, setTagsWithCount] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState(""); 
  const [month, setMonth] = useState(""); 
  const [filteredData, setFilteredData] = useState([]); 
  const [availableYears, setAvailableYears] = useState([]); 

  useEffect(() => {
    // Tạo danh sách năm từ 2024 đến năm hiện tại
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2023 }, (_, i) => 2024 + i);
    setAvailableYears(years);
  }, []);

  useEffect(() => {
    const fetchTagsWithCount = async () => {
      setIsLoading(true);
      try {
        const res = await TagService.getAllTag();
        const tags = res;

        const updatedTags = await Promise.all(
          tags.map(async (tag) => {
            const questions = await getAllQues(tag._id);
            return { ...tag, usedCount: questions.length };
          })
        );

        setTagsWithCount(updatedTags);
        setFilteredData(updatedTags); 
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

  // Lọc dữ liệu theo year và month
  useEffect(() => {
    const filterData = () => {
      if (!year && !month) {
        setFilteredData(tagsWithCount); 
        return;
      }

      const filtered = tagsWithCount.filter((tag) => {
        const tagYear = new Date(tag.createdAt).getFullYear(); 
        const tagMonth = new Date(tag.createdAt).getMonth() + 1; 

        return (
          (!year || tagYear === parseInt(year)) &&
          (!month || tagMonth === parseInt(month))
        );
      });

      setFilteredData(filtered);
    };

    filterData();
  }, [year, month, tagsWithCount]);

  // Tính tổng
  const totalTag = filteredData.length;
  const totalQuantity = filteredData.reduce((sum, tag) => sum + tag.usedCount, 0);

  // Chuẩn bị dữ liệu cho PieChart
  const dataQuantity = filteredData.map((tag) => tag.usedCount);
  const labels = filteredData.map((tag) => tag.name);
  const colors = filteredData.map(
    () => `#${Math.floor(Math.random() * 16777215).toString(16)}`
  );

  return (
    <div>
      <div className="container">
      <h1 className='title'>STATISTIC TAGS</h1>

        {/* Dropdown lọc */}
        <div className="row text-center d-flex">
          <div className="col">
            <label htmlFor="year">Select Year:</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="form-select"
            >
              <option value="">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
          <div className="col">
            <label htmlFor="month">Select Month:</label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="form-select"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Thống kê tổng */}
        <div className="total">
          <section className="section__total-question">
            <label className="total__title">Total Tags</label>
            <h2 className="total__number">{totalTag}</h2>
          </section>
          <section className="section__total-question">
            <label className="total__title">Total Quantity Used</label>
            <h2 className="total__number">{totalQuantity}</h2>
          </section>
        </div>

        {/* Biểu đồ tròn */}
        <div className="pie-chart">
          {filteredData.length > 0 ? (
            <PieChart data={dataQuantity} labels={labels} colors={colors} />
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>

        {/* Bảng thống kê */}
        <div className="dashboard">
          {filteredData.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Tag ID</th>
                    <th>Tag Name</th>
                    <th>Quantity Used</th>
                  </tr>
                </thead>
              </table>
              <div className="table-body-scroll">
                <table className="data-table">
                  <tbody>
                    {filteredData.map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{row._id}</td>
                        <td>{row.name}</td>
                        <td>{row.usedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="no-data">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticTopicPage;
