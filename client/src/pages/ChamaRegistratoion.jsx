import React, { use, useState } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  DatePicker, 
  Button, 
  Card, 
  Divider, 
  Typography,
  Alert,
  Switch
} from 'antd';
import { SnackbarProvider, enqueueSnackbar } from 'notistack'
import { UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title } = Typography;

const ChamaRegistratonForm = ({ onCreateSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enablePenalty, setEnablePenalty] = useState(false);
    const navigate = useNavigate()
  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        penaltyRate: enablePenalty ? values.penaltyRate : 0
      };

      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/createchama`,
        payload
      );

    //   notification.success({
    //     message: 'Chama Created',
    //     description: `${values.name} has been successfully created`
    //   });

    if (response.status === 201) {
        enqueueSnackbar('Chama created successfully', {variant: 'success'})
        form.resetFields();
        navigate('/dashboard')
    }

    enqueueSnackbar('Failed to create chama', {variant: 'error'})


    } catch (err) {
      console.error('Chama creation error:', err);
      setError(err.response?.data?.message || 'Failed to create chama');
    } finally {
      setLoading(false);
    }
  };

  const cycleDurations = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  return (
    <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <SnackbarProvider />
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        Create New Chama
      </Title>
      
      {error && (
        <Alert
          message="Creation Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          cycleDuration: 'monthly',
          penaltyRate: 0.1,
          startDate: dayjs()
        }}
      >
        {/* Basic Information Section */}
        <Divider orientation="left">Basic Information</Divider>
        
        <Form.Item
          name="name"
          label="Chama Name"
          rules={[
            { required: true, message: 'Please enter chama name' },
            { max: 50, message: 'Name must be less than 50 characters' }
          ]}
        >
          <Input 
            placeholder="Enter chama name" 
            prefix={<UserOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: 'Please enter description' },
            { max: 200, message: 'Description must be less than 200 characters' }
          ]}
        >
          <Input.TextArea 
            placeholder="Briefly describe the purpose of this chama" 
            rows={3}
          />
        </Form.Item>

        {/* Contribution Settings Section */}
        <Divider orientation="left">Contribution Settings</Divider>
        
        <Form.Item
          name="cycleAmount"
          label="Contribution Amount (KES)"
          rules={[
            { required: true, message: 'Please enter contribution amount' },
            { type: 'number', min: 100, message: 'Minimum amount is KES 100' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={100}
            formatter={value => `KES ${value}`}
            parser={value => value.replace(/KES\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="cycleDuration"
          label="Contribution Cycle"
          rules={[{ required: true, message: 'Please select cycle duration' }]}
        >
          <Select placeholder="Select contribution frequency">
            {cycleDurations.map(duration => (
              <Option key={duration.value} value={duration.value}>
                {duration.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Start Date"
          rules={[{ required: true, message: 'Please select start date' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            disabledDate={current => current && current < dayjs().startOf('day')}
          />
        </Form.Item>

        {/* Penalty Settings Section */}
        <Divider orientation="left">Late Payment Settings</Divider>
        
        <Form.Item label="Enable Late Penalties">
          <Switch 
            checked={enablePenalty}
            onChange={checked => setEnablePenalty(checked)}
          />
        </Form.Item>

        {enablePenalty && (
          <Form.Item
            name="penaltyRate"
            label="Penalty Rate (%)"
            rules={[
              { required: true, message: 'Please enter penalty rate' },
              { type: 'number', min: 0, max: 100, message: 'Must be between 0-100%' }
            ]}
            tooltip={{
              title: 'Percentage charged on late payments',
              icon: <InfoCircleOutlined />
            }}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={100}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
            />
          </Form.Item>
        )}

        <Form.Item style={{ marginTop: 32 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
            size="large"
          >
            Create Chama
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChamaRegistratonForm;