const SavedService = require("../services/SavedService");

const createSaved = async (req, res) => {
  try {
    const { question, user } = req.body;

    if (!question || !user) {
      return res.status(400).json({
        status: "ERR",
        message: "question and user are required",
      });
    }

    const response = await SavedService.createSaved(req.body);
    return res.status(201).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

const updateSaved = async (req, res) => {
  try {
    const savedID = req.params.id;
    const data = req.body;

    if (!savedID) {
      return res.status(400).json({
        status: "ERR",
        message: "The savedID is required",
      });
    }

    const response = await SavedService.updateSaved(savedID, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

const deleteSaved = async (req, res) => {
  try {
    const savedID = req.params.id;

    if (!savedID) {
      return res.status(400).json({
        status: "ERR",
        message: "The savedID is required",
      });
    }

    const response = await SavedService.deleteSaved(savedID);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

const getDetailSaved = async (req, res) => {
  try {
    const savedID = req.params.id;

    if (!savedID) {
      return res.status(400).json({
        status: "ERR",
        message: "The savedID is required",
      });
    }

    const response = await SavedService.getDetailSaved(savedID);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

const getAllSaved = async (req, res) => {
  try {
    const postID = req.params.postId;

    if (!postID) {
      return res.status(400).json({
        status: "ERR",
        message: "The postID is required",
      });
    }

    const response = await SavedService.getAllSaved(postID);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

module.exports = {
  createSaved,
  updateSaved,
  deleteSaved,
  getDetailSaved,
  getAllSaved,
};
