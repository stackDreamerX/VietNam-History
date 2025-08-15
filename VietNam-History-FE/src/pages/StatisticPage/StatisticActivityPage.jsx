import React, { useEffect, useState } from "react";
import "../../css/StatisticActivityPage.css";
import * as QuestionService from "../../services/QuestionService";
import * as AnswerService from "../../services/AnswerService";
import * as UserService from "../../services/UserService";

function StatisticActivityPage() {
  const [dataActivity, setDataActivity] = useState([]);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    // Tạo danh sách năm từ 2024 đến năm hiện tại
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2023 }, (_, i) => 2024 + i);
    setAvailableYears(years);
  }, []);

  // Tính tổng dữ liệu
  const totalPost = dataActivity.reduce((sum, user) => sum + user.post, 0);
  const totalAnswer = dataActivity.reduce((sum, user) => sum + user.answer, 0);
  const totalVote = dataActivity.reduce((sum, user) => sum + user.vote || 0, 0);

  // Lọc dữ liệu theo năm và tháng từ các API
  const filterData = async () => {
    try {
      // Gọi API để lấy tất cả người dùng
      const response = await UserService.getAllUser();
      const users = response.data;
      console.log("Fetched Users:", users);

      if (Array.isArray(users)) {
        const filteredData = await Promise.all(
          users.map(async (user) => {
            console.log(`Fetching data for user: ${user._id}, year: ${year}, month: ${month}`);

            // Kiểm tra và đảm bảo rằng user._id, year, và month có giá trị hợp lệ
            if (!user._id || !year || !month) {
              console.error("Missing required parameters:", user._id, year, month);
              return null;
            }

            // Gọi API để lấy câu hỏi đã được đếm và lọc từ QuestionService
            const questions = await QuestionService.getStatisticQuestion(
              user._id,
              year,
              month
            );
            console.log(`Questions for User ${user._id}:`, questions);

            // Gọi API để lấy câu trả lời đã được đếm từ AnswerService
            const answers = await AnswerService.getStatisticAnswer(user._id, year, month);
            console.log(`Answers for User ${user._id}:`, answers);

            return {
              uid: user._id,
              userName: user.name,
              post: user.quesCount,
              answer: user.answerCount,
              // vote: 0,
            };
          })
        );

        // Lọc các dữ liệu hợp lệ và set state
        setDataActivity(filteredData.filter(data => data !== null));
      } else {
        console.error("Error: users is not an array", users);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };


  useEffect(() => {
    filterData(); // Gọi khi year hoặc month thay đổi
  }, [year, month]);

  return (
    <div>
      <div className="container">
        <h1 className='title'>STATISTIC ACTIVITIES</h1>

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

        {/* Tổng dữ liệu */}
        <div className="total">
          <section className="section__total-question">
            <label className="total__title">Total post</label>
            <h2 className="total__number">{totalPost}</h2>
          </section>
          <section className="section__total-question">
            <label className="total__title">Total answer</label>
            <h2 className="total__number">{totalAnswer}</h2>
          </section>
          {/* <section className="section__total-question">
            <label className="total__title">Total vote</label>
            <h2 className="total__number">{totalVote}</h2>
          </section> */}
        </div>

        {/* Bảng dữ liệu */}
        <div className="dashboard">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>No</th>
                  <th style={{ width: '30%' }}>ID</th>
                  <th style={{ width: '30%' }}>User Name</th>
                  <th style={{ width: '10%' }}>Post</th>
                  <th style={{ width: '10%' }}>Answer</th>
                  {/* <th style={{ width: '10%' }}>Vote</th> */}
                </tr>
              </thead>
              <tbody>
                {dataActivity.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">No data available</td>
                  </tr>
                ) : (
                  dataActivity.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{row.uid}</td>
                      <td>{row.userName}</td>
                      <td>{row.post}</td>
                      <td>{row.answer}</td>
                      {/* <td>{row.vote}</td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default StatisticActivityPage;
