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
  Divider
} from 'antd';
import { 
  UserOutlined, 
  MoneyCollectOutlined, 
  ClockCircleOutlined,
  TeamOutlined,
  MailOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined
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

  const fetchChamaData = async () => {
    try {
      setLoading(true);
      
      const [chamaRes, membersRes, contributionsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/getchamabyid?id=${id}`),
        axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/group?id=${id}`),
        axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/chamacontribution?id=${id}`)
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
              user: { firstName: "Unknown", lastName: "User", email: "N/A", phoneNumber: "N/A" },
              hasPaid: false
            };
          }
        })
      );

      setChama(chamaRes.data);
      setMembers(membersWithUsers);
      setContributions(contributionsRes.data);
      
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
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

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={chama.name} 
        extra={
          <Tag color="blue">Cycle {currentCycle}</Tag>
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
      </Card>

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
                        <div style={{ fontSize: 12, color: '#888' }}>{user.email}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Contact',
                  dataIndex: 'user',
                  key: 'contact',
                  render: (user) => user.phoneNumber || 'N/A'
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
      </Tabs>
    </div>
  );
};

export default ChamaDashboard;