const QuestionReportService = require("../services/QuestionReportService");

const createQuestionReport = async (req, res) => {
  try {
    const { user, question } = req.body;
    const reportThreshold = 2; // Ngưỡng để vô hiệu hóa câu hỏi

    const result = await QuestionReportService.createQuestionReport({ user, question }, reportThreshold);

    return res.status(result.status === "OK" ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};




const getAllReports = async (req, res) => {
  try {
    const response = await QuestionReportService.getAllReports();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await QuestionReportService.getReportById(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await QuestionReportService.deleteReport(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};

module.exports = {
  createQuestionReport,
  getAllReports,
  getReportById,
  deleteReport,
  
};
