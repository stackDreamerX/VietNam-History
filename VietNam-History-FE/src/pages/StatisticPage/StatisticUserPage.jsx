import React, { useEffect, useState } from "react";
import "../../css/StatisticUserPage.css";
import PieChart from "../../components/PieChartComponent/PieChartComponent";
import DropdownComponent from "../../components/DropdownComponent/DropdownComponent";

const StatisticUserPage = () => {
  const [dataUser, setDataUser] = useState([
    { uid: 2211000, userName: "NAB", reputation: 100 },
    { uid: 2211001, userName: "NTD", reputation: 200 },
    { uid: 2211002, userName: "ABC", reputation: 300 },
    { uid: 2211003, userName: "XYZ", reputation: 400 },
  ]);

  const [dataInfringe, setDataInfringe] = useState([
    { uid: 2211000, userName: "NAB", infringe: 2, infringeName: "Spam" },
    { uid: 2211001, userName: "NTD", infringe: 3, infringeName: "Abuse" },
    { uid: 2211002, userName: "ABC", infringe: 5, infringeName: "Spam" },
    { uid: 2211003, userName: "XYZ", infringe: 1, infringeName: "Violation" },
  ]);

  const [reputationPercent, setReputationPercent] = useState([]);
  const [reputationLabels, setReputationLabels] = useState([]);
  const [reputationColors, setReputationColors] = useState([]);

  const [infringePercent, setInfringePercent] = useState([]);
  const [infringeLabels, setInfringeLabels] = useState([]);
  const [infringeColors, setInfringeColors] = useState([]);

  // Hàm sinh màu sắc ngẫu nhiên
  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    // Tính phần trăm reputation
    const totalReputation = dataUser.reduce(
      (total, user) => total + user.reputation,
      0
    );

    const newReputationPercent = dataUser.map(
      (user) => (user.reputation / totalReputation) * 100
    );
    const newReputationLabels = dataUser.map((user) => user.userName);
    const newReputationColors = dataUser.map(() => generateRandomColor());

    setReputationPercent(newReputationPercent);
    setReputationLabels(newReputationLabels);
    setReputationColors(newReputationColors);

    // Tính phần trăm infringe
    const infringeCounts = dataInfringe.reduce((acc, curr) => {
      acc[curr.infringeName] = (acc[curr.infringeName] || 0) + curr.infringe;
      return acc;
    }, {});

    const totalInfringe = Object.values(infringeCounts).reduce(
      (total, count) => total + count,
      0
    );

    const newInfringePercent = Object.values(infringeCounts).map(
      (count) => (count / totalInfringe) * 100
    );
    const newInfringeLabels = Object.keys(infringeCounts);
    const newInfringeColors = newInfringeLabels.map(() =>
      generateRandomColor()
    );

    setInfringePercent(newInfringePercent);
    setInfringeLabels(newInfringeLabels);
    setInfringeColors(newInfringeColors);
  }, [dataUser, dataInfringe]);

  return (
    <div>
      <div className="container">
      <h1 className='title'>STATISTIC USERS</h1>
        {/* drop down */}
        <div className="row text-center d-flex ">
          <div className="col ">
            <DropdownComponent>Type</DropdownComponent>
          </div>
          <div className="col">
            <DropdownComponent>Month</DropdownComponent>
          </div>
          <div className="col">
            <DropdownComponent>Year</DropdownComponent>
          </div>
        </div>
        {/* top */}
        <div className="total">
          <section className="section__total-question">
            <label className="total__title">Total user</label>
            <h2 className="total__number">{dataUser.length}</h2>
          </section>
          <section className="section__total-question">
            <label className="total__title">Total user infringe</label>
            <h2 className="total__number">{dataInfringe.length}</h2>
          </section>
        </div>
        {/* pie chart */}
        <div className="pie-chart">
          <h2>Reputation Distribution</h2>
          <PieChart
            data={reputationPercent}
            labels={reputationLabels}
            colors={reputationColors}
          />
          <h2>Infringement Distribution</h2>
          <PieChart
            data={infringePercent}
            labels={infringeLabels}
            colors={infringeColors}
          />
        </div>
        {/* tables */}
        <h2 className="sub-title">User</h2>
        <div className="dashboard">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>UID</th>
                  <th>Name</th>
                  <th>Reputation</th>
                </tr>
              </thead>
              <tbody>
                {dataUser.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row.uid}</td>
                    <td>{row.userName}</td>
                    <td>{row.reputation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <h2 className="sub-title">Infringement</h2>
        <div className="dashboard">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>UID</th>
                  <th>Name</th>
                  <th>Infringe</th>
                  <th>Name of Infringe</th>
                </tr>
              </thead>
              <tbody>
                {dataInfringe.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row.uid}</td>
                    <td>{row.userName}</td>
                    <td>{row.infringe}</td>
                    <td>{row.infringeName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticUserPage;
