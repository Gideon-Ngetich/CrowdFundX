import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  DatePicker, 
  Button, 
  List, 
  Typography, 
  Steps, 
  Card, 
  Select, 
  message,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  ArrowRightOutlined, 
  ArrowLeftOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const { TextArea } = Input;
const { Title } = Typography;
const { Step } = Steps;
const { Option } = Select;

const GroupRegistrationForm = () => {
  // State management
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [members, setMembers] = useState([]);
  const [mpesaAccounts, setMpesaAccounts] = useState([]);
  const [loading, setLoading] = useState({
    form: false,
    mpesaAccounts: true
  });
  
  const navigate = useNavigate();
  const userId = localStorage.getItem('code');

  // Fetch Mpesa accounts on component mount
  useEffect(() => {
    const fetchMpesaAccounts = async () => {
      try {
        if (!userId) {
          message.error('User authentication required');
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_DEV_ENDPOINT}/api/getmpesadetails`,
          { params: { id: userId } }
        );

        if (response.data?.success && response.data.mpesaAccounts?.length) {
          setMpesaAccounts(response.data.mpesaAccounts);
          // Set the first account as default selection
          form.setFieldsValue({
            mpesaAccount: response.data.mpesaAccounts[0]._id
          });
        } else {
          message.warning('No Mpesa accounts found. Please create one first.');
        }
      } catch (error) {
        console.error('Failed to fetch Mpesa accounts:', error);
        message.error('Failed to load payment options');
      } finally {
        setLoading(prev => ({ ...prev, mpesaAccounts: false }));
      }
    };

    fetchMpesaAccounts();
  }, [userId, form]);

  // Member management functions
  const handleAddMember = () => setMembers([...members, { email: '' }]);
  
  const handleUpdateMember = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  const handleRemoveMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  // Form steps configuration
  const steps = [
    {
      title: 'Group Details',
      content: (
        <Spin spinning={loading.mpesaAccounts}>
          <Form.Item
            label="Group Name"
            name="groupName"
            rules={[
              { required: true, message: 'Group name is required' },
              { min: 3, message: 'Minimum 3 characters' }
            ]}
          >
            <Input placeholder="e.g., Family Savings Group" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please describe your group' }]}
          >
            <TextArea rows={3} placeholder="Group purpose and objectives" />
          </Form.Item>

          <Form.Item
            label="Target Amount (KES)"
            name="targetAmount"
            rules={[
              { required: true, message: 'Target amount is required' },
              { type: 'number', min: 100, message: 'Minimum KES 100' }
            ]}
          >
            <InputNumber
              min={100}
              style={{ width: '100%' }}
              formatter={value => `KES ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/KES\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="Deadline"
            name="deadLine"
            rules={[{ required: true, message: 'Please set a target date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Payment Account"
            name="mpesaAccount"
            rules={[{ required: true, message: 'Please select a payment account' }]}
          >
            <Select placeholder="Select Mpesa account">
              {mpesaAccounts.map(account => (
                <Option key={account._id} value={account._id}>
                  {account.AccountName} ({account.businessShortCode})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Button type="dashed" block>
            <Link to="/mpesaaccountregistration">
              <PlusOutlined /> Add New Mpesa Account
            </Link>
          </Button>
        </Spin>
      )
    },
    {
      title: 'Add Members',
      content: (
        <>
          <List
            dataSource={members}
            renderItem={(member, index) => (
              <List.Item
                actions={[
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveMember(index)}
                  />
                ]}
              >
                <Form.Item
                  label={`Member ${index + 1}`}
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Invalid email format' }
                  ]}
                >
                  <Input
                    placeholder="member@example.com"
                    value={member.email}
                    onChange={e => handleUpdateMember(index, 'email', e.target.value)}
                  />
                </Form.Item>
              </List.Item>
            )}
          />
          <Button 
            type="dashed" 
            onClick={handleAddMember}
            icon={<PlusOutlined />}
            block
          >
            Add Member
          </Button>
        </>
      )
    }
  ];

  // Form submission handler
  const handleSubmit = async (values) => {
    try {
      setLoading(prev => ({ ...prev, form: true }));
      console.log(values)
      const payload = {
        ...values,
        targetAmount: Number(values.targetAmount),
        deadLine: values.deadLine,
        members: members.filter(m => m.email),
        createdBy: userId,
        mpesaAccountId: values.mpesaAccount
      };

      console.log(payload)
      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/groupfundingregistration`,
        payload
      );

      if (response.data.success) {
        message.success('Group created successfully!');
        form.resetFields();
        setMembers([]);
        navigate('/dashboard');
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      message.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  // Step navigation
  const handleNextStep = () => {
    form.validateFields()
      .then(() => setCurrentStep(currentStep + 1))
      .catch(err => console.log('Validation errors:', err));
  };

  const handlePrevStep = () => setCurrentStep(currentStep - 1);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Create New Group
      </Title>
      
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} />
        ))}
      </Steps>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ targetAmount: 1000 }}
        >
          {steps[currentStep].content}

          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
            {currentStep > 0 && (
              <Button onClick={handlePrevStep} icon={<ArrowLeftOutlined />}>
                Previous
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button 
                type="primary" 
                onClick={handleNextStep}
                icon={<ArrowRightOutlined />}
              >
                Next
              </Button>
            ) : (
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading.form}
              >
                Create Group
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default GroupRegistrationForm;