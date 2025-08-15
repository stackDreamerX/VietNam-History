// src/tests/TagController.test.js
const TagController = require('../controllers/TagController');
const TagService = require('../services/TagService');

jest.mock('../services/TagService'); // mock toàn bộ TagService

describe('TagController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createTag', () => {
    test('should return error if missing fields', async () => {
      req.body = { name: 'tag1', description: 'desc' }; // thiếu userTag

      await TagController.createTag(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ERR',
        message: 'The input is required',
      });
    });

    test('should create tag successfully', async () => {
      req.body = { name: 'tag1', description: 'desc', userTag: 'user1' };
      const mockResponse = { status: 'OK', data: { id: '1', ...req.body } };
      TagService.createTag.mockResolvedValue(mockResponse);

      await TagController.createTag(req, res);

      expect(TagService.createTag).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    test('should catch error and respond 404', async () => {
      req.body = { name: 'tag1', description: 'desc', userTag: 'user1' };
      TagService.createTag.mockRejectedValue(new Error('Service error'));

      await TagController.createTag(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Service error' });
    });
  });

  describe('updateTag', () => {
    test('should return error if no tagID', async () => {
      req.params = {};
      req.body = {};

      await TagController.updateTag(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ERR',
        message: 'The tagID is required',
      });
    });

    test('should update tag successfully', async () => {
      req.params = { id: '1' };
      req.body = { name: 'newname' };
      const mockResponse = { status: 'OK', data: { id: '1', name: 'newname' } };
      TagService.updateTag.mockResolvedValue(mockResponse);

      await TagController.updateTag(req, res);

      expect(TagService.updateTag).toHaveBeenCalledWith('1', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    test('should catch error and respond 404', async () => {
      req.params = { id: '1' };
      req.body = {};
      TagService.updateTag.mockRejectedValue(new Error('Update error'));

      await TagController.updateTag(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Update error' });
    });
  });

  describe('deleteTag', () => {
    test('should return error if no tagID', async () => {
      req.params = {};

      await TagController.deleteTag(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ERR',
        message: 'The tagID is required',
      });
    });

    test('should delete tag successfully', async () => {
      req.params = { id: '1' };
      const mockResponse = { status: 'OK', message: 'Deleted' };
      TagService.deleteTag.mockResolvedValue(mockResponse);

      await TagController.deleteTag(req, res);

      expect(TagService.deleteTag).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    test('should catch error and respond 404', async () => {
      req.params = { id: '1' };
      TagService.deleteTag.mockRejectedValue(new Error('Delete error'));

      await TagController.deleteTag(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Delete error' });
    });
  });

  describe('getAllTag', () => {
    test('should get all tags successfully', async () => {
      req.query = { userTag: 'user1' };
      const mockResponse = { status: 'OK', data: ['tag1', 'tag2'] };
      TagService.getAllTag.mockResolvedValue(mockResponse);

      await TagController.getAllTag(req, res);

      expect(TagService.getAllTag).toHaveBeenCalledWith('user1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    test('should catch error and respond 404', async () => {
      req.query = { userTag: 'user1' };
      TagService.getAllTag.mockRejectedValue(new Error('Fetch error'));

      await TagController.getAllTag(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Fetch error' });
    });
  });

  describe('getDetailsTag', () => {
    test('should return 400 if no tagId', async () => {
      req.params = {};

      await TagController.getDetailsTag(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ERR',
        message: 'Tag ID is required',
      });
    });

    test('should return 404 if tag not found', async () => {
      req.params = { id: '1' };
      TagService.getDetailsTag.mockResolvedValue(null);

      await TagController.getDetailsTag(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ERR',
        message: 'Tag not found',
      });
    });

    test('should return tag details successfully', async () => {
      req.params = { id: '1' };
      const mockResponse = { status: 'OK', data: { id: '1', name: 'tag1' } };
      TagService.getDetailsTag.mockResolvedValue(mockResponse);

      await TagController.getDetailsTag(req, res);

      expect(TagService.getDetailsTag).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    test('should catch error and respond 500', async () => {
      req.params = { id: '1' };
      TagService.getDetailsTag.mockRejectedValue(new Error('Service error'));

      await TagController.getDetailsTag(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'ERR',
        message: 'An error occurred while fetching the question details.',
      });
    });
  });
});
