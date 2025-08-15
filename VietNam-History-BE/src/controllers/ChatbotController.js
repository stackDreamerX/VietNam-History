const Question = require('../models/QuestionModel');
const User = require('../models/UserModel');
const axios = require('axios');

class ChatbotController {
  // Process user queries and generate responses
  async processQuery(req, res) {
    try {
      const { query, userId } = req.body;

      if (!query) {
        return res.status(400).json({
          status: 'ERR',
          message: 'Vui lòng cung cấp nội dung truy vấn'
        });
      }

      // Process query using Google Gemini API
      const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBCMnBzmrxDbV--WttfdzxHKjx6nFUH-Ik';
      const MODEL = 'gemini-1.5-flash-002';
      const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

      // Prepare the prompt with instructions for the AI assistant
      const prompt = `
        Bạn là trợ lý AI về lịch sử Việt Nam. Bạn có các chức năng sau:

        1. Trả lời các câu hỏi về lịch sử Việt Nam:
           - Các triều đại, vua chúa, nhân vật lịch sử
           - Các sự kiện, chiến tranh, cách mạng quan trọng
           - Văn hóa, phong tục, tập quán qua các thời kỳ

        2. Cung cấp thông tin về các di tích lịch sử:
           - Vị trí, lịch sử, ý nghĩa của các di tích
           - Kiến trúc, nghệ thuật đặc trưng
           - Gợi ý tham quan, thời điểm tốt nhất để đến

        3. Giới thiệu về các bảo tàng và triển lãm:
           - Các bảo tàng lịch sử nổi tiếng ở Việt Nam
           - Các bộ sưu tập, hiện vật quan trọng
           - Thông tin tham quan, giờ mở cửa

        4. Thông tin về website Lịch sử Việt Nam:
           - Các tài liệu, bài viết có trên website
           - Cách tìm kiếm thông tin
           - Các tính năng đặc biệt của website

        5. Hỗ trợ tra cứu và học tập:
           - Gợi ý tài liệu tham khảo
           - Giải thích các thuật ngữ lịch sử
           - Hỗ trợ các câu hỏi liên quan đến bài học lịch sử

        Khi trả lời:
        - Luôn trả lời bằng tiếng Việt thân thiện, ngắn gọn và đầy đủ thông tin
        - Nếu không biết thông tin về một chủ đề cụ thể, hãy thành thật và gợi ý nguồn tham khảo
        - Nếu khách hỏi về chủ đề không liên quan đến lịch sử Việt Nam, vẫn trả lời thân thiện và hữu ích

        Câu hỏi của người dùng: ${query}
      `;

      const apiRequest = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      };

      const response = await axios.post(
        API_URL,
        apiRequest,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract the response text from the Gemini API response
      let responseText = '';
      if (response.data &&
          response.data.candidates &&
          response.data.candidates[0] &&
          response.data.candidates[0].content &&
          response.data.candidates[0].content.parts &&
          response.data.candidates[0].content.parts[0]) {
        responseText = response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Không tìm thấy nội dung phản hồi từ API');
      }

      return res.status(200).json({
        status: 'OK',
        message: responseText,
        data: null
      });

    } catch (error) {
      console.error('Error in chatbot processing:', error);
      return res.status(500).json({
        status: 'ERR',
        message: 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.'
      });
    }
  }

  // Get history article details by ID
  async getArticleDetails(req, res) {
    try {
      const { articleId } = req.params;

      if (!articleId) {
        return res.status(400).json({
          status: 'ERR',
          message: 'Vui lòng cung cấp ID bài viết'
        });
      }

      // Here you would fetch the article from your database
      const article = await Question.findById(articleId);

      if (!article) {
        return res.status(404).json({
          status: 'ERR',
          message: 'Không tìm thấy bài viết'
        });
      }

      return res.status(200).json({
        status: 'OK',
        data: article
      });

    } catch (error) {
      console.error('Error getting article details:', error);
      return res.status(500).json({
        status: 'ERR',
        message: 'Xin lỗi, đã xảy ra lỗi khi lấy thông tin bài viết.'
      });
    }
  }
}

module.exports = new ChatbotController();