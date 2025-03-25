import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Avatar,
  Divider,
  Steps,
  message
} from 'antd';
import {
  MoneyCollectOutlined,
  TeamOutlined,
  UserOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const AccountTypeSelection = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (type) => {
    setSelectedType(type);
  };

  const handleConfirm = () => {
    if (!selectedType) {
      message.warning('Please select an account type first');
      return;
    }
    
    setIsConfirming(true);
    
    // Find the selected account type
    const accountType = accountTypes.find(t => t.id === selectedType);
    
    // Simulate a brief loading state before navigation
    setTimeout(() => {
      navigate(accountType.link);
      setIsConfirming(false);
    }, 800);
  };

  const accountTypes = [
    {
      id: 'crowdfunding',
      title: 'Crowdfunding',
      icon: <MoneyCollectOutlined />,
      description: 'Raise funds for projects or causes from many contributors',
      benefits: [
        'Reach a wide audience',
        'Set flexible funding goals',
        'Offer rewards to backers'
      ],
      color: '#1890ff',
      link: '/dashboard/accountselection/crowdfundingregistration'
    },
    {
      id: 'group',
      title: 'Group Funding',
      icon: <TeamOutlined />,
      description: 'Collaborate with a defined group to pool resources',
      benefits: [
        'Shared financial goals',
        'Transparent tracking',
        'Scheduled contributions'
      ],
      color: '#13c2c2',
      link: '/dashboard/accountselection/groupfundingregistration'
    },
    {
      id: 'chama',
      title: 'Chama Account',
      icon: <UserOutlined />,
      description: 'Traditional rotating savings and credit association',
      benefits: [
        'Trusted circle of members',
        'Rotating payouts',
        'Cultural familiarity'
      ],
      color: '#722ed1',
      link: '/dashboard/accountselection/chamaregistration'
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title level={2}>Join Our Community</Title>
        <Paragraph type="secondary" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Select the type of account that best fits your needs. You can always 
          create additional accounts later.
        </Paragraph>
      </div>

      <Steps current={selectedType ? 1 : 0} style={{ marginBottom: '40px' }}>
        <Step title="Select Account Type" />
        <Step title="Complete Registration" />
      </Steps>

      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {accountTypes.map((type) => (
          <Col xs={24} md={8} key={type.id}>
            <Card
              hoverable
              onClick={() => handleSelect(type.id)}
              style={{
                height: '100%',
                border: selectedType === type.id 
                  ? `2px solid ${type.color}` 
                  : '1px solid #f0f0f0',
                transition: 'all 0.3s'
              }}
              bodyStyle={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Avatar 
                  size={64} 
                  icon={type.icon} 
                  style={{ 
                    backgroundColor: type.color,
                    marginBottom: '16px'
                  }} 
                />
                <Title level={3} style={{ color: type.color }}>
                  {type.title}
                </Title>
              </div>
              
              <Paragraph style={{ flexGrow: 1 }}>
                {type.description}
              </Paragraph>
              
              <div style={{ margin: '16px 0' }}>
                <Text strong>Benefits:</Text>
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  {type.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
              
              <Button 
                type={selectedType === type.id ? 'primary' : 'default'}
                style={{
                  backgroundColor: selectedType === type.id ? type.color : '',
                  borderColor: selectedType === type.id ? type.color : '',
                  marginTop: 'auto'
                }}
                block
              >
                {selectedType === type.id ? 'Selected' : 'Select'}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedType && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleConfirm}
            loading={isConfirming}
            icon={<ArrowRightOutlined />}
          >
            Continue to {accountTypes.find(t => t.id === selectedType).title} Registration
          </Button>
        </div>
      )}

      <Divider style={{ margin: '40px 0' }} />

      <div style={{ textAlign: 'center' }}>
        <Title level={4}>Not sure which to choose?</Title>
        <Paragraph type="secondary" style={{ maxWidth: '600px', margin: '0 auto 16px' }}>
          Our support team can help you decide which account type is right for you.
        </Paragraph>
        <Button type="link">Contact Support</Button>
      </div>
    </div>
  );
};

export default AccountTypeSelection;