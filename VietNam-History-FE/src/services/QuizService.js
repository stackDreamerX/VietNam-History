import axiosInstance from '../utils/axiosConfig';

// Individual exports for direct importing
export const getAllQuizzes = async (page = 1, limit = 10, tag = '', search = '') => {
    try {
        console.log('Fetching quizzes with params:', { page, limit, tag, search });
        const response = await axiosInstance.get('/quiz/get-all', {
            params: { page, limit, tag, search }
        });

        // Ensure each quiz has totalAttempts and averageScore with default values if missing
        if (response.data && response.data.data && response.data.data.quizzes) {
            response.data.data.quizzes = response.data.data.quizzes.map(quiz => ({
                ...quiz,
                totalAttempts: quiz.totalAttempts || 0,
                averageScore: quiz.averageScore || 0
            }));
        }

        return response.data;
    } catch (error) {
        console.error('Error in getAllQuizzes:', error);
        throw error.response?.data || error;
    }
};

export const getQuizById = async (quizId) => {
    try {
        console.log(`Fetching quiz details for ID: ${quizId}`);
        const response = await axiosInstance.get(`/quiz/get-details/${quizId}`);
        console.log('Raw response from getQuizById:', response);

        // The backend always returns { status, message, data } structure
        if (response.data && response.data.status === 'OK' && response.data.data) {
            return {
                data: response.data.data
            };
        }

        throw new Error('Invalid response structure from server');
    } catch (error) {
        console.error('Error in getQuizById:', error);
        throw error.response?.data || error;
    }
};

export const createQuiz = async (quizData) => {
    try {
        const response = await axiosInstance.post('/quiz/create', quizData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateQuiz = async (quizId, updateData) => {
    try {
        const response = await axiosInstance.put(`/quiz/update-quiz/${quizId}`, updateData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteQuiz = async (quizId) => {
    try {
        const response = await axiosInstance.delete(`/quiz/delete-quiz/${quizId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const submitQuizAttempt = async (quizId, attemptData) => {
    try {
        console.log(`Submitting quiz attempt to /quiz/submit/${quizId}`);
        console.log('Request data:', attemptData);

        const response = await axiosInstance.post(`/quiz/submit/${quizId}`, attemptData);
        console.log('Raw API response:', response);

        // Ensure we return the data property from the response
        return response.data;
    } catch (error) {
        console.error('Error in submitQuizAttempt:', error);
        // Log the error response details
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
        }
        throw error.response?.data || error;
    }
};

export const getLeaderboard = async (quizId, limit = 10) => {
    try {
        const response = await axiosInstance.get(`/quiz/leaderboard/${quizId}`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getRandomQuizByTag = async (tag = '') => {
    try {
        const response = await axiosInstance.get('/quiz/random', {
            params: { tag }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Default export as an object containing all methods
const QuizService = {
    getAllQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
    getLeaderboard,
    getRandomQuizByTag
};

export default QuizService;