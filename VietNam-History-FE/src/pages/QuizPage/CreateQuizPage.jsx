import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Switch
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { createQuiz } from '../../services/QuizService';
import * as TagService from '../../services/TagService';
import * as QuestionService from '../../services/QuestionService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PageContainer = styled.div`
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
  FILL_IN_BLANK: 'FILL_IN_BLANK'
};

const CreateQuizPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  // Fetch all tags
  const { data: tagsResponse } = useQuery({
    queryKey: ['tags'],
    queryFn: TagService.getAllTag,
    select: (response) => {
      console.log('Raw tags response:', response);
      // Kiểm tra và xử lý dữ liệu theo định dạng phù hợp
      if (Array.isArray(response)) {
        console.log('Tags is an array:', response);
        return response;
      } else if (response && response.data && Array.isArray(response.data)) {
        console.log('Tags in response.data:', response.data);
        return response.data;
      } else if (response && Array.isArray(response.data?.data)) {
        console.log('Tags in response.data.data:', response.data.data);
        return response.data.data;
      }
      console.log('Returning empty array for tags');
      return [];
    }
  });

  // Đảm bảo tags luôn là một mảng
  const tags = Array.isArray(tagsResponse) ? tagsResponse : [];

  // Fetch user's questions
  const { data: questions } = useQuery({
    queryKey: ['user-questions', user?.id],
    queryFn: () => QuestionService.getQuestionsByUserId(user?.id),
    enabled: !!user?.id
  });

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
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

      const quizData = {
        title: values.title,
        description: values.description,
        questions: formattedQuestions,
        timeLimit: values.timeLimit ? values.timeLimit * 60 : undefined, // Convert to seconds
        tags: values.tags,
        createdBy: user.id
      };

      await createQuiz(quizData, user.access_token);
      message.success('Quiz created successfully!');
      navigate('/quizzes');
    } catch (error) {
      message.error(error.message || 'Failed to create quiz');
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

  return (
    <PageContainer>
      <Title level={2}>Create New Quiz</Title>
      <Text>Create a quiz to help others test their history knowledge</Text>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          questions: [{ type: QUESTION_TYPES.MULTIPLE_CHOICE }]
        }}
      >
        <Card style={{ marginTop: '24px' }}>
          <Form.Item
            name="title"
            label="Quiz Title"
            rules={[{ required: true, message: 'Please enter a quiz title' }]}
          >
            <Input placeholder="Enter quiz title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={4} placeholder="Enter quiz description" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
            rules={[{ required: true, message: 'Please select at least one tag' }]}
          >
            <Select
              mode="multiple"
              placeholder="Search and select tags"
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) => {
                if (!input) return true;
                // Hỗ trợ tìm kiếm không phân biệt chữ hoa/thường và tìm kiếm từng phần
                return option.children.toLowerCase().includes(input.toLowerCase());
              }}
              optionFilterProp="children"
              notFoundContent="No matching tags found"
              loading={!tags.length}
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSearch={(value) => console.log('Searching for:', value)}
            >
              {tags && tags.length > 0 ? (
                tags.map(tag => (
                  <Option key={tag._id} value={tag._id}>{tag.name}</Option>
                ))
              ) : (
                <Option value="loading" disabled>Loading tags...</Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            name="timeLimit"
            label="Time Limit (minutes)"
            rules={[{ type: 'number', min: 1 }]}
          >
            <InputNumber placeholder="Optional" style={{ width: '100%' }} />
          </Form.Item>
        </Card>

        <Title level={4} style={{ marginTop: '24px' }}>Questions</Title>

        <Form.List name="questions">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} style={{ marginBottom: '16px' }}>
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Form.Item
                      {...restField}
                      name={[name, 'content']}
                      label="Question"
                      rules={[{ required: true, message: 'Question content is required' }]}
                    >
                      <TextArea rows={3} placeholder="Enter question" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      label="Question Type"
                      initialValue={QUESTION_TYPES.MULTIPLE_CHOICE}
                      rules={[{ required: true }]}
                    >
                      <Radio.Group onChange={(e) => handleQuestionTypeChange(e.target.value, name)}>
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
                                        <Input placeholder={`Option ${index + 1}`} />
                                      </Form.Item>
                                      {optionFields.length > 2 && (
                                        <MinusCircleOutlined onClick={() => removeOption(optionField.name)} />
                                      )}
                                    </Space>
                                  ))}
                                  {optionFields.length < 5 && (
                                    <Button type="dashed" onClick={() => addOption()} block icon={<PlusOutlined />}>
                                      Add Option
                                    </Button>
                                  )}
                                </>
                              )}
                            </Form.List>
                          );
                        }

                        if (questionType === QUESTION_TYPES.TRUE_FALSE) {
                          return (
                            <Form.Item
                              {...restField}
                              name={[name, 'correctAnswer']}
                              label="Correct Answer"
                              rules={[{ required: true, message: 'Please select the correct answer' }]}
                            >
                              <Radio.Group>
                                <Radio value="true">True</Radio>
                                <Radio value="false">False</Radio>
                              </Radio.Group>
                            </Form.Item>
                          );
                        }

                        if (questionType === QUESTION_TYPES.FILL_IN_BLANK) {
                          return (
                            <Form.Item
                              {...restField}
                              name={[name, 'correctAnswer']}
                              label="Correct Answer"
                              rules={[{ required: true, message: 'Please enter the correct answer' }]}
                            >
                              <Input placeholder="Enter the correct answer" />
                            </Form.Item>
                          );
                        }

                        return null;
                      }}
                    </Form.Item>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => {
                        return prevValues.questions?.[name]?.type !== currentValues.questions?.[name]?.type ||
                               prevValues.questions?.[name]?.options !== currentValues.questions?.[name]?.options;
                      }}
                    >
                      {({ getFieldValue }) => {
                        const questionType = getFieldValue(['questions', name, 'type']);
                        const options = getFieldValue(['questions', name, 'options']) || [];

                        if (questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
                          return (
                            <Form.Item
                              {...restField}
                              name={[name, 'correctAnswer']}
                              label="Correct Answer"
                              rules={[{ required: true, message: 'Please select the correct answer' }]}
                            >
                              <Select placeholder="Select correct answer">
                                {options.map((option, index) => (
                                  <Option key={index} value={index.toString()}>
                                    Option {index + 1}: {option}
                                  </Option>
                                ))}
                              </Select>
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
                      <TextArea rows={2} placeholder="Explain why this is the correct answer" />
                    </Form.Item>

                    {fields.length > 1 && (
                      <Button type="text" danger onClick={() => remove(name)}>
                        Delete Question
                      </Button>
                    )}
                  </Space>
                </Card>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add({ type: QUESTION_TYPES.MULTIPLE_CHOICE })}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Question
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Create Quiz
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );
};

export default CreateQuizPage;