import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  Alert,
  Typography,
  Popconfirm
} from "antd";
import {
  UserOutlined,
  MoneyCollectOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  DollarOutlined,
  HistoryOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
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
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const MpesaProcessingModal = ({ visible, onClose, onSuccess }) => {
  const [countdown, setCountdown] = useState(8);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;

    // Reset values when modal opens
    setCountdown(8);
    setProgress(0);

    const timer = setInterval(() => {
      
      setCountdown(prev => {
        const newCount = prev - 1;
        setProgress(((8 - newCount) / 8) * 100);
        
        if (newCount <= 0) {
          clearInterval(timer);
          onSuccess();
          return 0;
        }
        return newCount;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, onSuccess]);

  return (
    <Modal
      title="MPESA Payment Processing"
      visible={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={400}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Progress
          percent={progress}
          status="active"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
        
        <Text strong>Processing your payment...</Text>
        <Text type="secondary">Please check your phone for MPESA prompt</Text>
        
        <Text>
          {countdown > 0 ? (
            <Text type="warning">Timeout in {countdown} seconds</Text>
          ) : (
            <Text type="success">Processing complete!</Text>
          )}
        </Text>
      </Space>
    </Modal>
  );
};

const ChamaDashboard = () => {
  const { id } = useParams();
  const userId = localStorage.getItem("code");
  const [loading, setLoading] = useState(true);
  const [chama, setChama] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [nextRecipient, setNextRecipient] = useState(null);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [contributeModalVisible, setContributeModalVisible] = useState(false);
  const [mpesaModalVisible, setMpesaModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [contributionForm] = Form.useForm();
  const [currentUserMember, setCurrentUserMember] = useState(null);

  // Fetch all chama data
  const fetchChamaData = async () => {
    try {
      setLoading(true);

      const [chamaRes, membersRes, contributionsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/getchamabyid?id=${id}`),
        axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/group?id=${id}`),
        axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/chamacontribution?id=${id}`),
      ]);

      // Ensure contributions is always an array
      const contributionsData = Array.isArray(contributionsRes?.data)
        ? contributionsRes.data
        : [];

      // Process members with user info and payment status
      const membersWithUsers = await Promise.all(
        membersRes.data.map(async (member) => {
          try {
            const userRes = await axios.get(
              `${import.meta.env.VITE_DEV_ENDPOINT}/api/userinfo?id=${member.user._id}`
            );

            // Ensure we have user data
            const userData = userRes.data || {
              firstName: "Unknown",
              lastName: "User",
              phoneNumber: "N/A",
              photo: null,
            };

            return {
              ...member,
              user: userData,
              hasPaid: contributionsData.some(
                (c) =>
                  c.member?._id?.toString() === member._id?.toString() &&
                  c.cycleNumber === chamaRes.data.currentCycle
              ),
            };
          } catch (error) {
            console.error("Failed to fetch user:", error);
            return {
              ...member,
              user: {
                firstName: "Unknown",
                lastName: "User",
                phoneNumber: "N/A",
                photo: null,
              },
              hasPaid: false,
            };
          }
        })
      );

      // Find current user's member record
      const currentMember = membersWithUsers.find(m => m.user?._id === userId);
      setCurrentUserMember(currentMember);

      // Determine next payout recipient
      const rotationOrder = chamaRes.data.rotationOrder || [];
      const currentRecipientIndex = chamaRes.data.currentRecipientIndex || 0;
      const nextRecipientId = rotationOrder[currentRecipientIndex % rotationOrder.length];
      const nextRecipientData = membersWithUsers.find(
        (m) => m._id?.toString() === nextRecipientId?.toString()
      );

      setChama(chamaRes.data);
      setMembers(membersWithUsers);
      setContributions(contributionsData);
      setPayoutHistory(chamaRes.data.previousRecipients || []);
      setNextRecipient(nextRecipientData);
    } catch (err) {
      console.error("API Error:", err);
      notification.error({
        message: "Failed to load data",
        description: "Could not fetch chama information",
      });
    } finally {
      setLoading(false);
    }
  };

  // Process payout to next recipient
  const handleProcessPayout = async () => {
    setIsProcessingPayout(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/${id}/process-payout`,
        { groupId: id }
      );

      notification.success({
        message: "Payout Processed",
        description: `KES ${response.data.amount} paid to ${response.data.recipient.name}`,
      });

      await fetchChamaData();
    } catch (error) {
      console.error("Payout error:", error);
      notification.error({
        message: "Payout Failed",
        description: error.response?.data?.message || "Could not process payout",
      });
    } finally {
      setIsProcessingPayout(false);
    }
  };

  // Add new member to chama
  const handleAddMember = async (values) => {
    try {
      await axios.post(`${import.meta.env.VITE_DEV_ENDPOINT}/api/addmember`, {
        user: values.userId,
        group: id,
        phoneNumber: values.phoneNumber,
      });

      notification.success({
        message: "Member Added",
        description: "New member successfully added to the chama",
      });

      setAddMemberModalVisible(false);
      form.resetFields();
      fetchChamaData();
    } catch (error) {
      console.error("Add member error:", error);
      notification.error({
        message: "Failed to Add Member",
        description: error.response?.data?.message || "Could not add member",
      });
    }
  };

  const handleContribute = async (values) => {
    try {
      setMpesaModalVisible(true);

      if (!currentUserMember) {
        throw new Error("Could not verify your membership in this group");
      }

      await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/chamastk`,
        {
          userId: userId,
          memberId: currentUserMember._id,
          groupId: id,
          amount: values.amount,
          phoneNumber: currentUserMember.user.phoneNumber,
        }
      );

      // The MPESA modal will handle the success notification after timeout
    } catch (error) {
      setMpesaModalVisible(false);
      console.error("Contribution error:", error);
      notification.error({
        message: "Contribution Failed",
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleMpesaSuccess = () => {
    notification.success({
      message: "Payment Initiated",
      description: "MPESA payment request sent successfully"
    });
    setContributeModalVisible(false);
    contributionForm.resetFields();
    fetchChamaData();
  };

  // Remove member from chama
  const handleDeleteMember = async (memberId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/members/${memberId}`
      );
      notification.success({
        message: "Member Removed",
        description: "Member has been successfully removed from the group",
      });
      fetchChamaData();
    } catch (error) {
      console.error("Delete member error:", error);
      notification.error({
        message: "Failed to Remove Member",
        description: error.response?.data?.message || "Could not remove member",
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchChamaData();
  }, [id]);

  // Calculate chama statistics
  const currentCycle = chama?.currentCycle || 1;
  const currentCycleContributions = contributions.filter(
    (c) => c.cycleNumber === currentCycle
  );
  const paidCount = currentCycleContributions.length;
  const totalMembers = members.length;
  const paymentPercentage =
    totalMembers > 0 ? Math.round((paidCount / totalMembers) * 100) : 0;
  const currentCycleTotal = currentCycleContributions.reduce(
    (sum, c) => sum + c.amount,
    0
  );

  // Chart data preparation
  const paymentData = [
    { name: "Paid", value: paidCount },
    { name: "Pending", value: Math.max(0, totalMembers - paidCount) },
  ];

  const contributionTrendData = contributions
    .filter((c) => c.cycleNumber === currentCycle)
    .reduce((acc, curr) => {
      const date = dayjs(curr.createdAt).format("MMM DD");
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.amount += curr.amount;
      } else {
        acc.push({ date, amount: curr.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

  const memberContributionData = members.map((member) => ({
    name: `${member.user.firstName} ${member.user.lastName}`,
    contributions: contributions.filter((c) => c.member?._id === member._id)
      .length,
    amount: contributions
      .filter((c) => c.member?._id === member._id)
      .reduce((sum, c) => sum + c.amount, 0),
  }));

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!chama) {
    return (
      <div style={{ padding: 24 }}>
        <Card title="Chama Not Found">
          <p style={{ color: "#ff4d4f" }}>
            The chama you are looking for does not exist.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Add Member Modal */}
      <Modal
        title="Add New Member"
        visible={addMemberModalVisible}
        onCancel={() => setAddMemberModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddMember}>
          <Form.Item
            name="userId"
            label="User ID"
            rules={[{ required: true, message: "Please input user ID" }]}
          >
            <Input placeholder="Enter user ID" />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[{ required: true, message: "Please input phone number" }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        title="Make Your Contribution"
        visible={contributeModalVisible}
        onCancel={() => setContributeModalVisible(false)}
        onOk={() => contributionForm.submit()}
      >
        <Form
          form={contributionForm}
          layout="vertical"
          initialValues={{
            amount: chama?.cycleAmount || 2000,
          }}
          onFinish={handleContribute}
        >
          {/* Auto-display user info */}
          <Form.Item label="Contributor">
            {currentUserMember ? (
              <Space>
                <Avatar 
                  src={currentUserMember?.user?.photo} 
                  icon={<UserOutlined />} 
                />
                <div>
                  <Text strong>
                    {currentUserMember?.user?.firstName || "User"}{" "}
                    {currentUserMember?.user?.lastName || ""}
                  </Text>
                  <br />
                  <Text type="secondary">
                    {currentUserMember?.user?.phoneNumber || "Phone not available"}
                  </Text>
                </div>
              </Space>
            ) : (
              <Text type="warning">Member data not available</Text>
            )}
          </Form.Item>

          {/* Group info */}
          <Form.Item label="Group">
            <Text strong>{chama?.name || "Chama"}</Text>
            <br />
            <Text type="secondary">Cycle {chama?.currentCycle || 1}</Text>
          </Form.Item>

          {/* Amount input with proper validation */}
          <Form.Item
            name="amount"
            label={`Amount to Contribute (KES) - Minimum ${chama?.cycleAmount || 2000}`}
            rules={[
              {
                required: true,
                message: "Please enter amount",
              },
              () => ({
                validator(_, value) {
                  const minAmount = chama?.cycleAmount || 2000;
                  if (value >= minAmount) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    `Minimum contribution is KES ${minAmount}`
                  );
                },
              }),
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={chama?.cycleAmount || 2000}
              defaultValue={chama?.cycleAmount || 2000}
              step={100}
              formatter={(value) =>
                `KES ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/KES\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* MPESA Processing Modal */}
      <MpesaProcessingModal
        visible={mpesaModalVisible}
        onClose={() => setMpesaModalVisible(false)}
        onSuccess={handleMpesaSuccess}
      />

      {/* Main Dashboard Content */}
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
      >f
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

        {/* Charts Row */}
        <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
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
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {paymentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
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
                  data={memberContributionData
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5)}
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

        {/* Action Buttons */}
        <Space style={{ marginTop: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddMemberModalVisible(true)}
          >
            Add Member
          </Button>
          <Button
            icon={<MoneyCollectOutlined />}
            onClick={() => setContributeModalVisible(true)}
          >
            Record Contribution
          </Button>
        </Space>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultActiveKey="payouts">
        <Tabs.TabPane tab="Payout Management" key="payouts">
          <Card
            title="Next Payout Recipient"
            style={{ marginBottom: 24 }}
            extra={
              paymentPercentage === 100 && (
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  loading={isProcessingPayout}
                  onClick={handleProcessPayout}
                >
                  Process Payout
                </Button>
              )
            }
          >
            {nextRecipient ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Avatar
                    size={64}
                    src={nextRecipient.user?.photo}
                    icon={<UserOutlined />}
                    style={{ marginRight: 16 }}
                  />
                  <div>
                    <Title level={4} style={{ marginBottom: 0 }}>
                      {nextRecipient.user?.firstName}{" "}
                      {nextRecipient.user?.lastName}
                    </Title>
                    <Text type="secondary">
                      {nextRecipient.user?.phoneNumber}
                    </Text>
                  </div>
                </div>

                <Divider />

                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="Payout Amount"
                      value={currentCycleTotal}
                      prefix="KES"
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic title="Current Cycle" value={currentCycle} />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Position in Rotation"
                      value={`${(chama.currentRecipientIndex || 0) + 1} of ${
                        chama.rotationOrder?.length || 0
                      }`}
                    />
                  </Col>
                </Row>

                {paymentPercentage < 100 && (
                  <Alert
                    message="Payout Not Ready"
                    description={`Waiting for ${
                      totalMembers - paidCount
                    } more members to contribute (${paymentPercentage}% complete)`}
                    type="warning"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
              </div>
            ) : (
              <Alert
                message="No Next Recipient"
                description="The rotation order has not been set up yet"
                type="info"
                showIcon
              />
            )}
          </Card>

          <Card title="Rotation Order" style={{ marginTop: 24 }}>
            <Table
              columns={[
                {
                  title: "Position",
                  dataIndex: "position",
                  key: "position",
                  render: (_, __, index) => index + 1,
                },
                {
                  title: "Member",
                  key: "member",
                  render: (record) => (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={record.user?.photo}
                        style={{ marginRight: 8 }}
                      >
                        {record.user?.firstName?.charAt(0)}
                        {record.user?.lastName?.charAt(0)}
                      </Avatar>
                      <div>
                        <div>
                          {record.user?.firstName} {record.user?.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          {record.member?.phoneNumber ||
                            record.user?.phoneNumber}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Status",
                  key: "status",
                  render: (memberId) => {
                    const isCurrent =
                      chama.rotationOrder?.indexOf(memberId) ===
                      chama.currentRecipientIndex;
                    return isCurrent ? (
                      <Tag icon={<ArrowRightOutlined />} color="blue">
                        Current
                      </Tag>
                    ) : (
                      <Tag color="default">Pending</Tag>
                    );
                  },
                },
              ]}
              dataSource={chama.rotationOrder || []}
              rowKey={(memberId) => memberId}
              pagination={false}
            />
          </Card>

          <Card title="Payout History" style={{ marginTop: 24 }}>
            <Table
              columns={[
                {
                  title: "Cycle",
                  dataIndex: "cycleNumber",
                  key: "cycle",
                  sorter: (a, b) => a.cycleNumber - b.cycleNumber,
                  defaultSortOrder: "descend",
                },
                {
                  title: "Recipient",
                  key: "recipient",
                  render: (record) => {
                    const member = members.find((m) => m._id === record.member);
                    return member ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={member.user?.photo}
                          icon={<UserOutlined />}
                          style={{ marginRight: 8 }}
                        />
                        <span>
                          {member.user?.firstName} {member.user?.lastName}
                        </span>
                      </div>
                    ) : (
                      "Unknown Member"
                    );
                  },
                },
                {
                  title: "Amount (KES)",
                  dataIndex: "amount",
                  key: "amount",
                  render: (amount) => `KES ${amount.toLocaleString()}`,
                },
                {
                  title: "Date",
                  dataIndex: "payoutDate",
                  key: "date",
                  render: (date) => dayjs(date).format("MMM D, YYYY"),
                  sorter: (a, b) =>
                    new Date(a.payoutDate) - new Date(b.payoutDate),
                },
              ]}
              dataSource={payoutHistory}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Members" key="members">
          <Card>
            <Table
              columns={[
                {
                  title: "Member",
                  dataIndex: "user",
                  key: "user",
                  render: (user) => (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Avatar style={{ marginRight: 8 }} src={user.photo}>
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </Avatar>
                      <div>
                        <div>
                          {user.firstName} {user.lastName}
                        </div>
                        <div style={{ fontSize: 12, color: "#888" }}>
                          {user.phoneNumber}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: "Status",
                  key: "status",
                  render: (_, record) => {
                    let icon, color, text;
                    if (record.hasPaid) {
                      icon = <CheckCircleOutlined />;
                      color = "green";
                      text = "Paid";
                    } else {
                      icon = <SyncOutlined spin />;
                      color = "orange";
                      text = "Pending";
                    }
                    return (
                      <Tag icon={icon} color={color}>
                        {text}
                      </Tag>
                    );
                  },
                },
                {
                  title: "Total Contributed",
                  key: "total",
                  render: (_, record) => {
                    const total = contributions
                      .filter((c) => c.member?._id === record._id)
                      .reduce((sum, c) => sum + c.amount, 0);
                    return `KES ${total.toLocaleString()}`;
                  },
                },
                {
                  title: "Action",
                  key: "action",
                  render: (_, record) => (
                    <Popconfirm
                      title="Are you sure you want to remove this member?"
                      onConfirm={() => handleDeleteMember(record._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="text" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  ),
                },
              ]}
              dataSource={members}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Contributions" key="contributions">
          <Card>
            <Table
              columns={[
                {
                  title: "Member",
                  dataIndex: "member",
                  key: "member",
                  render: (member) => (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        style={{ marginRight: 8 }}
                        src={member.user?.photo}
                      >
                        {member.user?.firstName?.charAt(0)}
                        {member.user?.lastName?.charAt(0)}
                      </Avatar>
                      <span>
                        {member.user?.firstName} {member.user?.lastName}
                      </span>
                    </div>
                  ),
                },
                {
                  title: "Amount (KES)",
                  dataIndex: "amount",
                  key: "amount",
                  render: (amount) => `KES ${amount.toLocaleString()}`,
                },
                {
                  title: "Cycle",
                  dataIndex: "cycleNumber",
                  key: "cycleNumber",
                  render: (cycle) => `Cycle ${cycle}`,
                },
                {
                  title: "Date",
                  dataIndex: "createdAt",
                  key: "date",
                  render: (date) => dayjs(date).format("MMM D, YYYY"),
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
