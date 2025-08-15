const TagService = require('../services/TagService');

const createTag = async (req, res) => {
    try {
        const { name, description, userTag } = req.body;

        console.log('req.body', req.body);

        // Kiểm tra trường nào bị thiếu
        if (!name|| !description ||!userTag) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            });
        }

        const response = await TagService.createTag(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e.message
        });
    }
};

const updateTag = async (req, res) => {
    try {
        const tagID = req.params.id;
        const data = req.body;
        if (!tagID) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The tagID is required'
            });
        }
        // Truyền dữ liệu req.body vào TagService
        const response = await TagService.updateTag(tagID, data);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e.message
        });
    }
};

const deleteTag = async (req, res) => {
    try {
        const tagID = req.params.id;
        if (!tagID) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The tagID is required'
            });
        }

        const response = await TagService.deleteTag(tagID);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e.message
        });
    }
};

const getAllTag = async (req, res) => {
    try {
        const { userTag } = req.query; 

        const response = await TagService.getAllTag(userTag); 

        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e.message
        });
    }
};


const getDetailsTag = async (req, res) => {
  try {
    const tagId = req.params.id;
    // console.log("tagId", tagId);
    
    if (!tagId) {
      return res.status(400).json({
        status: "ERR",
        message: "Tag ID is required",
      });
    }

    const response = await TagService.getDetailsTag(tagId);
    if (!response) {
      return res.status(404).json({
        status: "ERR",
        message: "Tag not found",
      });
    }

    return res.status(200).json(response);
  } catch (e) {
    console.error("Error fetching question details: ", e);
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred while fetching the question details.",
    });
  }
};
module.exports = { createTag, updateTag, deleteTag, getAllTag, getDetailsTag };
