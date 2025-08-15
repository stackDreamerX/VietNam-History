// src/components/PieChart.js
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Đăng ký các thành phần của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, labels, colors }) => {
  // Dữ liệu cho biểu đồ
  const chartData = {
    labels: labels || ["Category A", "Category B", "Category C"], // Các danh mục hiển thị trên biểu đồ
    datasets: [
      {
        data: data, // Dữ liệu phần trăm hoặc số liệu bạn truyền vào
        backgroundColor: colors || ["#FF6384", "#36A2EB", "#FFCE56"], // Màu sắc cho từng phần
        hoverBackgroundColor: colors || ["#FF6384", "#36A2EB", "#FFCE56"], // Màu sắc khi hover
      },
    ],
  };

  return (
    <div style={{ width: "300px", height: "300px", margin: "auto" }}>
      <Pie data={chartData} />
    </div>
  );
};

export default PieChart;
