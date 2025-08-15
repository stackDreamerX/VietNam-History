import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  InputNumber, 
  Space, 
  Card, 
  Typography,
  Radio,
  message,
  Switch,
  Spin
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { getQuizById, updateQuiz } from '../../services/QuizService';
import * as TagService from '../../services/TagService';
import * as QuestionService from '../../services/QuestionService';
import './EditQuizPage.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
  FILL_IN_BLANK: 'FILL_IN_BLANK'
};

const EditQuizPage = () => {
  const { quizId } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Fetch quiz details
  const { data: quizData, isLoading: isQuizLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId),
    enabled: !!quizId,
    onSuccess: (data) => {
      transformAndSetFormData(data);
    },
    onError: (error) => {
      message.error('Failed to load quiz data');
      console.error('Error loading quiz:', error);
    }
  });

  // Fetch all tags
  const { data: tagsResponse } = useQuery({
    queryKey: ['tags'],
    queryFn: TagService.getAllTag,
    select: (response) => {
      return {
        status: 'OK',
        data: Array.isArray(response) ? response : []
      };
    }
  });

  const tags = tagsResponse?.data || [];

  // Transform API quiz data to form format
  const transformAndSetFormData = (quizData) => {
    if (!quizData) return;

    try {
      console.log('Raw quiz data:', quizData);
      
      const questions = quizData.questions.map(question => {
        let formattedQuestion = {
          content: question.questionText,
          type: question.type,
          explanation: question.explanation || ''
        };

        // Process based on question type
        switch (question.type) {
          case QUESTION_TYPES.MULTIPLE_CHOICE:
            formattedQuestion.options = question.options.map(opt => opt.text);
            formattedQuestion.correctAnswer = question.options.findIndex(opt => opt.isCorrect).toString();
            break;
          
          case QUESTION_TYPES.TRUE_FALSE:
            formattedQuestion.correctAnswer = question.options.find(opt => opt.isCorrect)?.text === 'True' ? 'true' : 'false';
            break;
          
          case QUESTION_TYPES.FILL_IN_BLANK:
            formattedQuestion.correctAnswer = question.options.find(opt => opt.isCorrect)?.text || '';
            break;
        }

        return formattedQuestion;
      });

      // Xử lý tags (đảm bảo chúng ta chỉ lấy ID của tag)
      let tagIds = [];
      if (quizData.tags) {
        tagIds = quizData.tags.map(tag => {
          // Nếu tag là object, lấy _id, nếu không thì giả định tag là string id
          return typeof tag === 'object' ? tag._id : tag;
        });
      }
      
      console.log('Processed tag IDs:', tagIds);

      const formValues = {
        title: quizData.title,
        description: quizData.description,
        tags: tagIds,
        timeLimit: quizData.timeLimit ? quizData.timeLimit / 60 : undefined, // Convert from seconds to minutes
        questions
      };

      console.log('Form values set:', formValues);
      form.setFieldsValue(formValues);
      setInitializing(false);
    } catch (error) {
      console.error('Error transforming quiz data:', error);
      message.error('Error processing quiz data');
    }
  };

  // Check permissions
  useEffect(() => {
    if (!isQuizLoading && quizData) {
      // Kiểm tra xem createdBy là object hay string ID
      const createdById = typeof quizData.createdBy === 'object' ? 
        quizData.createdBy._id : quizData.createdBy;
      
      if (createdById !== user?.id && user?.role !== 'ADMIN') {
        message.error('You do not have permission to edit this quiz');
        navigate('/quizzes');
      }
    }
  }, [quizData, isQuizLoading, user, navigate]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('Form submitted with values:', values);
      
      const formattedQuestions = values.questions.map(question => {
        let formattedOptions = [];
        
        switch (question.type) {
          case QUESTION_TYPES.MULTIPLE_CHOICE:
            formattedOptions = question.options.map((option, index) => ({
              text: option,
              isCorrect: index === parseInt(question.correctAnswer)
            }));
            break;
          
          case QUESTION_TYPES.TRUE_FALSE:
            formattedOptions = [
              { text: 'True', isCorrect: question.correctAnswer === 'true' },
              { text: 'False', isCorrect: question.correctAnswer === 'false' }
            ];
            break;
          
          case QUESTION_TYPES.FILL_IN_BLANK:
            formattedOptions = [{ text: question.correctAnswer, isCorrect: true }];
            break;
        }

        return {
          questionText: question.content,
          type: question.type,
          options: formattedOptions,
          explanation: question.explanation
        };
      });

      // Đảm bảo tags là array of strings (IDs)
      const tagIds = values.tags.map(tag => {
        return typeof tag === 'object' ? tag._id : tag;
      });

      const updatedQuizData = {
        title: values.title,
        description: values.description,
        questions: formattedQuestions,
        timeLimit: values.timeLimit ? values.timeLimit * 60 : undefined, // Convert to seconds
        tags: tagIds
      };

      console.log('Sending updated quiz data to API:', updatedQuizData);
      await updateQuiz(quizId, updatedQuizData);
      message.success('Quiz updated successfully!');
      navigate('/my-quizzes'); // Chuyển về trang My Quizzes sau khi cập nhật
    } catch (error) {
      console.error('Error updating quiz:', error);
      message.error(error.message || 'Failed to update quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionTypeChange = (type, questionIndex) => {
    const currentQuestion = form.getFieldValue(['questions', questionIndex]);
    form.setFieldsValue({
      questions: {
        [questionIndex]: {
          ...currentQuestion,
          options: [],
          correctAnswer: undefined
        }
      }
    });
  };

  if (isQuizLoading || initializing) {
    return (
      <div className="edit-quiz-container">
        <div className="loading-container">
          <Spin size="large" />
          <p className="loading-text">Loading quiz data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-quiz-container">
      <Title level={2} className="edit-quiz-title">Edit Quiz</Title>
      <Text className="edit-quiz-subtitle">Update your quiz content and settings</Text>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Card className="edit-quiz-card">
          <Form.Item
            name="title"
            label="Quiz Title"
            rules={[{ required: true, message: 'Please enter a quiz title' }]}
          >
            <Input placeholder="Enter quiz title" className="form-input" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={4} placeholder="Enter quiz description" className="form-input" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
            rules={[{ required: true, message: 'Please select at least one tag' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select tags"
              className="form-select"
            >
              {tags && tags.length > 0 ? (
                tags.map(tag => (
                  <Option key={tag._id} value={tag._id}>{tag.name}</Option>
                ))
              ) : null}
            </Select>
          </Form.Item>

          <Form.Item
            name="timeLimit"
            label="Time Limit (minutes)"
            rules={[{ type: 'number', min: 1 }]}
          >
            <InputNumber placeholder="Optional" className="form-number-input" />
          </Form.Item>
        </Card>

        <Title level={4} className="section-title">Questions</Title>

        <Form.List name="questions">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} className="question-card">
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Form.Item
                      {...restField}
                      name={[name, 'content']}
                      label="Question"
                      rules={[{ required: true, message: 'Question content is required' }]}
                    >
                      <TextArea rows={3} placeholder="Enter question" className="question-textarea" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      label="Question Type"
                      rules={[{ required: true }]}
                    >
                      <Radio.Group 
                        onChange={(e) => handleQuestionTypeChange(e.target.value, name)}
                        className="question-type-radio"
                      >
                        <Radio value={QUESTION_TYPES.MULTIPLE_CHOICE}>Multiple Choice</Radio>
                        <Radio value={QUESTION_TYPES.TRUE_FALSE}>True/False</Radio>
                        <Radio value={QUESTION_TYPES.FILL_IN_BLANK}>Fill in the Blank</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => {
                        return prevValues.questions?.[name]?.type !== currentValues.questions?.[name]?.type;
                      }}
                    >
                      {({ getFieldValue }) => {
                        const questionType = getFieldValue(['questions', name, 'type']);

                        if (questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
                          return (
                            <Form.List name={[name, 'options']}>
                              {(optionFields, { add: addOption, remove: removeOption }) => (
                                <>
                                  {optionFields.map((optionField, index) => (
                                    <Space key={optionField.key} align="baseline">
                                      <Form.Item
                                        {...optionField}
                                        validateTrigger={['onChange', 'onBlur']}
                                        rules={[{ required: true, message: 'Please input option content' }]}
                                      >
                                        <Input 
                                          placeholder={`Option ${index + 1}`} 
                                          className="option-input"
                                        />
                                      </Form.Item>
                                      {optionFields.length > 2 && (
                                        <MinusCircleOutlined 
                                          onClick={() => removeOption(optionField.name)} 
                                          className="remove-option-btn"
                                        />
                                      )}
                                    </Space>
                                  ))}
                                  {optionFields.length < 5 && (
                                    <Button
                                      type="dashed"
                                      onClick={() => addOption()}
                                      block
                                      icon={<PlusOutlined />}
                                      className="add-option-btn"
                                    >
                                      Add Option
                                    </Button>
                                  )}
                                </>
                              )}
                            </Form.List>
                          );
                        }

                        if (questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
                          return (
                            <Form.Item
                              name={[name, 'correctAnswer']}
                              label="Correct Answer"
                              rules={[{ required: true, message: 'Please select the correct answer' }]}
                            >
                              <Select placeholder="Select correct answer" className="form-select">
                                {(getFieldValue(['questions', name, 'options']) || []).map((option, index) => (
                                  <Option key={index} value={index.toString()}>{option}</Option>
                                ))}
                              </Select>
                            </Form.Item>
                          );
                        }

                        if (questionType === QUESTION_TYPES.TRUE_FALSE) {
                          return (
                            <Form.Item
                              name={[name, 'correctAnswer']}
                              label="Correct Answer"
                              rules={[{ required: true, message: 'Please select the correct answer' }]}
                            >
                              <Radio.Group className="question-type-radio">
                                <Radio value="true">True</Radio>
                                <Radio value="false">False</Radio>
                              </Radio.Group>
                            </Form.Item>
                          );
                        }

                        if (questionType === QUESTION_TYPES.FILL_IN_BLANK) {
                          return (
                            <Form.Item
                              name={[name, 'correctAnswer']}
                              label="Correct Answer"
                              rules={[{ required: true, message: 'Please enter the correct answer' }]}
                            >
                              <Input placeholder="Enter correct answer" className="form-input" />
                            </Form.Item>
                          );
                        }

                        return null;
                      }}
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'explanation']}
                      label="Explanation (Optional)"
                    >
                      <TextArea 
                        rows={2} 
                        placeholder="Explanation of the correct answer" 
                        className="explanation-textarea"
                      />
                    </Form.Item>

                    {fields.length > 1 && (
                      <Button 
                        danger 
                        onClick={() => remove(name)}
                        className="remove-question-btn"
                      >
                        Remove Question
                      </Button>
                    )}
                  </Space>
                </Card>
              ))}
              <Button
                type="dashed"
                onClick={() => add({ type: QUESTION_TYPES.MULTIPLE_CHOICE })}
                block
                icon={<PlusOutlined />}
                className="add-question-btn"
              >
                Add Question
              </Button>
            </>
          )}
        </Form.List>

        <div className="form-buttons">
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="submit-btn"
          >
            Update Quiz
          </Button>
          <Button 
            onClick={() => navigate('/my-quizzes')}
            className="cancel-btn"
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditQuizPage; 