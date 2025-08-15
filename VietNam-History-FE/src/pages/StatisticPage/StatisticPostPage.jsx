import React, { useEffect, useState } from "react";
import "../../css/StatisticQuestionPage.css";
import PieChart from "../../components/PieChartComponent/PieChartComponent";
import * as QuestionService from "../../services/QuestionService";
import * as TagService from "../../services/TagService";

const StatisticQuestionPage = () => {
  const [dataQuestion, setDataQuestion] = useState([]); // Dữ liệu tags
  const [year, setYear] = useState(""); // Bộ lọc theo năm
  const [month, setMonth] = useState(""); // Bộ lọc theo tháng
  const [filteredData, setFilteredData] = useState([]); // Dữ liệu đã lọc
  const [availableYears, setAvailableYears] = useState([]); // Danh sách năm

  useEffect(() => {
    // Tạo danh sách năm từ 2024 đến năm hiện tại
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2023 }, (_, i) => 2024 + i);
    setAvailableYears(years);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await QuestionService.getAllQues();
        const questions = response.data; // Đây phải là danh sách câu hỏi, không phải tag

        console.log("Questions fetched:", questions); // Kiểm tra lại câu hỏi

        // Xử lý các tag và câu hỏi
        const tags = {};
        questions.forEach((q) => {
          q.tags.forEach((tagId) => {
            if (!tags[tagId]) {
              tags[tagId] = { quantity: 0, notAnswered: 0, rate: 0, createdAt: q.createdAt };
            }
            tags[tagId].quantity++;
            if (q.answerCount === 0) {
              tags[tagId].notAnswered++;
            }
            if (q.rate) {
              tags[tagId].rate += q.rate;
            }
          });
        });

        const tagDetails = await Promise.all(
          Object.keys(tags).map(async (tagId) => {
            const tagDetail = await TagService.getDetailsTag(tagId);
            return { id: tagId, name: tagDetail.data.name };
          })
        );

        const tagMap = Object.fromEntries(
          tagDetails.map((tag) => [tag.id, tag.name])
        );

        const data = Object.keys(tags).map((tagId) => ({
          id: tagId,
          name: tagMap[tagId] || tagId,
          quantity: tags[tagId].quantity,
          // Cập nhật lại số câu hỏi chưa trả lời từ ansCount
          notAnswered: Math.min(tags[tagId].notAnswered, tags[tagId].quantity),
          rate: tags[tagId].quantity
            ? (tags[tagId].rate / tags[tagId].quantity).toFixed(1)
            : 0,
          createdAt: tags[tagId].createdAt,
        }));

        setDataQuestion(data); // Gắn dữ liệu đã xử lý vào dataQuestion
        setFilteredData(data);  // Ban đầu hiển thị tất cả câu hỏi

      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };


    fetchData();
  }, []);

  useEffect(() => {
    const filterData = async () => {
      console.log("Filtering for year:", year, "month:", month);
      console.log("Data before filtering:", dataQuestion);

      // Lọc câu hỏi theo tagId
      const filtered = await Promise.all(
        dataQuestion.map(async (item) => {
          // Sử dụng tagId để lấy câu hỏi từ API
          const response = await QuestionService.getAllQuesByTag(item.id);
          const questions = response.data;

          // Lọc câu hỏi theo ngày tạo (createdAt)
          const filteredQuestions = questions.filter((question) => {
            const questionDate = new Date(question.createdAt); // Lấy ngày tạo của câu hỏi
            const questionYear = questionDate.getFullYear(); // Lấy năm từ createdAt
            const questionMonth = questionDate.getMonth() + 1; // Lấy tháng từ createdAt (lưu ý getMonth() trả về 0-11, nên cộng 1 để tương ứng với 1-12)

            // Kiểm tra nếu năm và tháng của câu hỏi khớp với bộ lọc
            return (
              (!year || questionYear === parseInt(year)) &&
              (!month || questionMonth === parseInt(month))
            );
          });

          // Đếm số câu hỏi chưa trả lời (ansCount === 0)
          const notAnswered = filteredQuestions.filter(
            (question) => question.answerCount === 0
          ).length;

          // Tính tổng upVote và downVote
          const upVote = filteredQuestions.reduce(
            (sum, question) => sum + (question.upVoteCount || 0),
            0
          );
          const downVote = filteredQuestions.reduce(
            (sum, question) => sum + (question.downVoteCount || 0),
            0
          );

          // Trả về tag này cùng với câu hỏi đã lọc và thông tin tổng hợp
          return {
            ...item,
            questions: filteredQuestions,
            quantity: filteredQuestions.length,
            notAnswered: notAnswered,
            upVote: upVote,
            downVote: downVote,
          };
        })
      );

      // Lọc những tag có câu hỏi
      const finalFilteredData = filtered.filter((item) => item.questions.length > 0);

      console.log("Filtered data:", finalFilteredData);
      setFilteredData(finalFilteredData);
    };

    filterData();
  }, [year, month, dataQuestion]);


  // Tính tổng
  const totalQuestions = filteredData.reduce((sum, item) => sum + item.quantity, 0);


  // Chuẩn bị dữ liệu cho PieChart
  const dataTopic = filteredData.map((item) => item.quantity);
  const labels = filteredData.map((item) => item.name);
  const colors = filteredData.map(
    () => `#${Math.floor(Math.random() * 16777215).toString(16)}`
  );

  return (
    <div>
      <div className="container">
      <h1 className='title'>STATISTIC POSTS</h1>

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

        {/* Tổng số liệu */}
        <div className="total">
          <section className="section__total-question">
            <label className="total__title">Total Posts</label>
            <h2 className="total__number">{totalQuestions}</h2>
          </section>
        </div>

        {/* Biểu đồ tròn */}
        <div className="pie-chart">
          {filteredData.length > 0 ? (
            <PieChart data={dataTopic} labels={labels} colors={colors} />
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
                    <th>Tag</th>
                    <th>Quantity</th>
                    <th>Not Answered</th>
                    <th>Up Vote</th>
                    <th>Down Vote</th>
                  </tr>
                </thead>
              </table>
              <div className="table-body-scroll">
                <table className="data-table">
                  <tbody>
                    {filteredData.map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{row.name}</td>
                        <td>{row.quantity}</td>
                        <td>{row.notAnswered}</td>
                        <td>{row.upVote}</td>
                        <td>{row.downVote}</td>
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

export default StatisticQuestionPage;
