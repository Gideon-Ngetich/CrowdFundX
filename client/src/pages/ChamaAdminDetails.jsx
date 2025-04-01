import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Space, 
  Progress,
  Tabs,
  Spin,
  Avatar,
  Divider,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  notification,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  MoneyCollectOutlined, 
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  DollarOutlined,
  HistoryOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { 
  PieChart, 
  Pie, 
  Cell,
  BarChart, 
  Bar,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import dayjs from 'dayjs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ChamaDashboard = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [chama, setChama] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [nextRecipient, setNextRecipient] = useState(null);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [contributeModalVisible, setContributeModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [contributionForm] = Form.useForm();

  // For phone number search
  const [phoneNumber, setPhoneNumber] = useState('');
  const [memberOptions, setMemberOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchChamaData = async () => {
    try {
      setLoading(true);
      
      const [chamaRes, membersRes, contributionsRes, payoutsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/getchamabyid?id=${id}`),
        axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/group?id=${id}`),
        axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/chamacontribution?id=${id}`),
        // axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/payouthistory?group=${id}`)
      ]);

      const membersWithUsers = await Promise.all(
        membersRes.data.map(async member => {
          try {
            const userRes = await axios.get(
              `${import.meta.env.VITE_DEV_ENDPOINT}/api/userinfo?id=${member.user._id}`
            );

            return { 
              ...member, 
              user: userRes.data,
              hasPaid: contributionsRes.data.some(
                c => c.member._id === member._id && c.cycleNumber === chamaRes.data.currentCycle
              )
            };
          } catch (error) {
            console.error("Failed to fetch user:", member.user, error);
            return { 
              ...member, 
              user: { firstName: "Unknown", lastName: "User", phoneNumber: "N/A" },
              hasPaid: false
            };
          }
        })
      );

      // Determine next recipient
      const rotationOrder = chamaRes.data.rotationOrder || [];
      const currentRecipientIndex = chamaRes.data.currentRecipientIndex || 0;
      const nextRecipientId = rotationOrder[currentRecipientIndex % rotationOrder.length];
      const nextRecipientData = membersWithUsers.find(m => m._id === nextRecipientId);

      setChama(chamaRes.data);
      setMembers(membersWithUsers);
      setContributions(contributionsRes.data);
      setPayoutHistory(payoutsRes.data);
      setNextRecipient(nextRecipientData);
      
    } catch (err) {
      console.error("API Error:", err);
      notification.error({
        message: 'Failed to load data',
        description: 'Could not fetch chama information'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    setIsProcessingPayout(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/${id}/process-payout`,
        { groupId: id }
      );

      notification.success({
        message: 'Payout Processed',
        description: `KES ${response.data.amount} paid to ${response.data.recipient.name}`
      });

      await fetchChamaData();
    } catch (error) {
      console.error('Payout error:', error);
      notification.error({
        message: 'Payout Failed',
        description: error.response?.data?.message || 'Could not process payout'
      });
    } finally {
      setIsProcessingPayout(false);
    }
  };

  const handleAddMember = async (values) => {
    try {
      await axios.post(`${import.meta.env.VITE_DEV_ENDPOINT}/api/addmember`, {
        user: values.userId,
        group: id,
        phoneNumber: values.phoneNumber
      });
      
      notification.success({
        message: 'Member Added',
        description: 'New member successfully added to the chama'
      });
      
      setAddMemberModalVisible(false);
      form.resetFields();
      fetchChamaData();
    } catch (error) {
      console.error('Add member error:', error);
      notification.error({
        message: 'Failed to Add Member',
        description: error.response?.data?.message || 'Could not add member'
      });
    }
  };

  const handleContribute = async (values) => {
    try {
      await axios.post(`${import.meta.env.VITE_DEV_ENDPOINT}/api/contribute`, {
        memberId: values.memberId,
        groupId: id,
        amount: values.amount
      });
      
      notification.success({
        message: 'Contribution Recorded',
        description: `KES ${values.amount} contribution successfully recorded`
      });
      
      setContributeModalVisible(false);
      setPhoneNumber('');
      setMemberOptions([]);
      setSelectedMember(null);
      contributionForm.resetFields();
      fetchChamaData();
    } catch (error) {
      console.error('Contribution error:', error);
      notification.error({
        message: 'Contribution Failed',
        description: error.response?.data?.message || 'Could not record contribution'
      });
    }
  };

  const handlePhoneNumberSearch = async (value) => {
    setPhoneNumber(value);
    if (value.length >= 4) {
      setSearching(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_DEV_ENDPOINT}/api/searchmember?phone=${value}&group=${id}`
        );
        setMemberOptions(response.data);
      } catch (error) {
        console.error('Search error:', error);
        notification.error({
          message: 'Search Failed',
          description: 'Could not search for members'
        });
      } finally {
        setSearching(false);
      }
    }
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    contributionForm.setFieldsValue({ 
      memberId: member._id,
      phoneNumber: member.phoneNumber 
    });
  };

  useEffect(() => {
    fetchChamaData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!chama) {
    return (
      <div style={{ padding: 24 }}>
        <Card title="Chama Not Found">
          <p style={{ color: '#ff4d4f' }}>
            The chama you are looking for does not exist.
          </p>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const currentCycle = chama?.currentCycle || 1;
  const currentCycleContributions = contributions.filter(
    c => c.cycleNumber === currentCycle
  );
  const paidCount = currentCycleContributions.length;
  const totalMembers = members.length;
  const paymentPercentage = totalMembers > 0 
    ? Math.round((paidCount / totalMembers) * 100) 
    : 0;

  // Chart data
  const paymentData = [
    { name: "Paid", value: paidCount },
    { name: "Pending", value: Math.max(0, totalMembers - paidCount) },
  ];

  const contributionTrendData = contributions
    .filter(c => c.cycleNumber === currentCycle)
    .reduce((acc, curr) => {
      const date = dayjs(curr.createdAt).format('MMM DD');
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.amount += curr.amount;
      } else {
        acc.push({ date, amount: curr.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

  const memberContributionData = members.map(member => ({
    name: `${member.user.firstName} ${member.user.lastName}`,
    contributions: contributions.filter(c => c.member._id === member._id).length,
    amount: contributions
      .filter(c => c.member._id === member._id)
      .reduce((sum, c) => sum + c.amount, 0)
  }));

  // Calculate total contributions for current cycle
  const currentCycleTotal = currentCycleContributions.reduce(
    (sum, c) => sum + c.amount, 0
  );

  return (
    <div style={{ padding: 24 }}>
      {/* Add Member Modal */}
      <Modal
        title="Add New Member"
        visible={addMemberModalVisible}
        onCancel={() => setAddMemberModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddMember}
        >
          <Form.Item
            name="userId"
            label="User ID"
            rules={[{ required: true, message: 'Please input user ID' }]}
          >
            <Input placeholder="Enter user ID" />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[{ required: true, message: 'Please input phone number' }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        title="Record Contribution"
        visible={contributeModalVisible}
        onCancel={() => {
          setContributeModalVisible(false);
          setPhoneNumber('');
          setMemberOptions([]);
          setSelectedMember(null);
          contributionForm.resetFields();
        }}
        onOk={() => contributionForm.submit()}
        okButtonProps={{ disabled: !selectedMember }}
      >
        <Form
          form={contributionForm}
          layout="vertical"
          onFinish={handleContribute}
          initialValues={{ amount: chama.cycleAmount }}
        >
          <Form.Item
            name="phoneNumber"
            label="Member Phone Number"
            rules={[{ required: true, message: 'Please select a member' }]}
          >
            <Input.Search
              placeholder="Search member by phone number"
              value={phoneNumber}
              onChange={(e) => handlePhoneNumberSearch(e.target.value)}
              enterButton
              loading={searching}
            />
          </Form.Item>

          {memberOptions.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4>Select Member:</h4>
              <Space direction="vertical" style={{ width: '100%' }}>
                {memberOptions.map(member => (
                  <Card 
                    key={member._id}
                    size="small"
                    hoverable
                    onClick={() => handleMemberSelect(member)}
                    style={{ 
                      cursor: 'pointer',
                      borderColor: selectedMember?._id === member._id ? '#1890ff' : '#f0f0f0'
                    }}
                  >
                    <Space>
                      <Avatar src={member.user?.photo} icon={<UserOutlined />} />
                      <div>
                        <div>{member.user?.firstName} {member.user?.lastName}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>
                          {member.phoneNumber}
                        </div>
                      </div>
                    </Space>
                  </Card>
                ))}
              </Space>
            </div>
          )}

          {selectedMember && (
            <Alert
              message={`Contributing for: ${selectedMember.user?.firstName} ${selectedMember.user?.lastName}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Hidden field to store member ID */}
          <Form.Item name="memberId" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount (KES)"
            rules={[{ required: true, message: 'Please input amount' }]}
          >
            <InputNumber 
              style={{ width: '100%' }}
              min={1}
              formatter={value => `KES ${value}`}
              parser={value => value.replace(/KES\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Card 
        title={chama.name} 
        extra={
          <Space>
            <Tag color="blue">Cycle {currentCycle}</Tag>
            {nextRecipient && (
              <Tag icon={<DollarOutlined />} color="green">
                Next: {nextRecipient.user.firstName}
              </Tag>
            )}
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Members"
                value={totalMembers}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Paid This Cycle"
                value={paidCount}
                suffix={`/ ${totalMembers}`}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Cycle Amount"
                value={chama.cycleAmount || 0}
                prefix={<MoneyCollectOutlined />}
                suffix="KES"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Payment Progress"
                value={paymentPercentage}
                suffix="%"
                prefix={<ClockCircleOutlined />}
              />
              <Progress 
                percent={paymentPercentage} 
                status={paymentPercentage === 100 ? "success" : "active"} 
                size="small" 
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setAddMemberModalVisible(true)}
            >
              Add Member
            </Button>
          </Col>
          <Col>
            <Button 
              type="default" 
              icon={<MoneyCollectOutlined />}
              onClick={() => setContributeModalVisible(true)}
            >
              Record Contribution
            </Button>
          </Col>
        </Row>

        {/* Payout Action Card */}
        {paymentPercentage === 100 && (
          <Card 
            title="Payout Management" 
            style={{ marginTop: 16 }}
            headStyle={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}
          >
            <Row align="middle" gutter={16}>
              <Col flex="auto">
                <Space>
                  <Avatar 
                    size="large" 
                    src={nextRecipient?.user?.photo}
                    icon={<UserOutlined />}
                  />
                  <div>
                    <h4 style={{ margin: 0 }}>
                      {nextRecipient?.user?.firstName} {nextRecipient?.user?.lastName}
                    </h4>
                    <p style={{ margin: 0, color: '#666' }}>
                      {nextRecipient?.user?.phoneNumber}
                    </p>
                  </div>
                  <Divider type="vertical" />
                  <Statistic
                    title="Payout Amount"
                    value={currentCycleTotal}
                    prefix="KES"
                    valueStyle={{ fontSize: 24 }}
                  />
                </Space>
              </Col>
              <Col>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<DollarOutlined />}
                  loading={isProcessingPayout}
                  onClick={handleProcessPayout}
                >
                  Process Payout
                </Button>
              </Col>
            </Row>
          </Card>
        )}
      </Card>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Payment Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} members`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Contribution Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={contributionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`KES ${value}`]} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  name="Amount" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Top Contributors">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={memberContributionData.sort((a, b) => b.amount - a.amount).slice(0, 5)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value) => [`KES ${value}`]} />
                <Legend />
                <Bar dataKey="amount" name="Amount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Members" key="1">
          <Card>
            <Table
              columns={[
                {
                  title: 'Member',
                  dataIndex: 'user',
                  key: 'user',
                  render: (user) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        style={{ marginRight: 8 }} 
                        src={user.photo}
                      >
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </Avatar>
                      <div>
                        <div>{user.firstName} {user.lastName}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{user.phoneNumber}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: (_, record) => {
                    let icon, color, text;
                    if (record.hasPaid) {
                      icon = <CheckCircleOutlined />;
                      color = 'green';
                      text = 'Paid';
                    } else {
                      icon = <SyncOutlined spin />;
                      color = 'orange';
                      text = 'Pending';
                    }
                    return (
                      <Tag icon={icon} color={color}>
                        {text}
                      </Tag>
                    );
                  },
                },
                {
                  title: 'Total Contributed',
                  key: 'total',
                  render: (_, record) => {
                    const total = contributions
                      .filter(c => c.member._id === record._id)
                      .reduce((sum, c) => sum + c.amount, 0);
                    return `KES ${total.toLocaleString()}`;
                  }
                },
                {
                  title: 'Last Received',
                  key: 'lastReceived',
                  render: (_, record) => {
                    const lastPayout = payoutHistory
                      .filter(p => p.recipient._id === record._id)
                      .sort((a, b) => b.cycleNumber - a.cycleNumber)[0];
                    
                    return lastPayout 
                      ? `Cycle ${lastPayout.cycleNumber} (KES ${lastPayout.amount})`
                      : 'Never';
                  }
                }
              ]}
              dataSource={members}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Contributions" key="2">
          <Card>
            <Table
              columns={[
                {
                  title: 'Member',
                  dataIndex: 'member',
                  key: 'member',
                  render: (member) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        style={{ marginRight: 8 }} 
                        src={member.user?.photo}
                      >
                        {member.user?.firstName?.charAt(0)}{member.user?.lastName?.charAt(0)}
                      </Avatar>
                      <span>{member.user?.firstName} {member.user?.lastName}</span>
                    </div>
                  ),
                },
                { 
                  title: 'Amount (KES)', 
                  dataIndex: 'amount', 
                  key: 'amount',
                  render: (amount) => `KES ${amount.toLocaleString()}`
                },
                { 
                  title: 'Cycle', 
                  dataIndex: 'cycleNumber', 
                  key: 'cycleNumber',
                  render: (cycle) => `Cycle ${cycle}`
                },
                { 
                  title: 'Date', 
                  dataIndex: 'createdAt', 
                  key: 'date',
                  render: (date) => dayjs(date).format('MMM D, YYYY')
                },
              ]}
              dataSource={contributions}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Payout History" key="3">
          <Card>
            <Table
              columns={[
                {
                  title: 'Cycle',
                  dataIndex: 'cycleNumber',
                  key: 'cycle',
                  sorter: (a, b) => a.cycleNumber - b.cycleNumber
                },
                {
                  title: 'Recipient',
                  dataIndex: 'recipient',
                  key: 'recipient',
                  render: (recipient) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        style={{ marginRight: 8 }} 
                        src={recipient.user?.photo}
                      >
                        {recipient.user?.firstName?.charAt(0)}{recipient.user?.lastName?.charAt(0)}
                      </Avatar>
                      <span>{recipient.user?.firstName} {recipient.user?.lastName}</span>
                    </div>
                  )
                },
                { 
                  title: 'Amount (KES)', 
                  dataIndex: 'amount', 
                  key: 'amount',
                  render: (amount) => `KES ${amount.toLocaleString()}`
                },
                { 
                  title: 'Date', 
                  dataIndex: 'payoutDate', 
                  key: 'date',
                  render: (date) => dayjs(date).format('MMM D, YYYY'),
                  sorter: (a, b) => new Date(a.payoutDate) - new Date(b.payoutDate)
                },
              ]}
              dataSource={payoutHistory}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default ChamaDashboard;