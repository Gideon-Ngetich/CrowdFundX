import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Tabs,
  Spin,
  Avatar,
  Button,
  message,
  Modal,
  Input,
  Form,
  Typography,
} from "antd";
import {
  TeamOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  MobileOutlined,
  MoneyCollectOutlined,
  HistoryOutlined,
  SyncOutlined,
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
import AddMembersModal from "../components/AddGroupMemberModal";
import Navbar from "../components/Navbar";

const { Text } = Typography;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const GroupFundingDashboard = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState(null);
  const [members, setMembers] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [contributeModalVisible, setContributeModalVisible] = useState(false);
  const [contributionForm] = Form.useForm();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("email");
    setUserEmail(userData);
  }, []);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_DEV_ENDPOINT
        }/api/getgroupfundingdetails?id=${id}`
      );

      const group = response.data;
      console.log(group);
      const membersWithDetails = await Promise.all(
        group.member.map(async (member) => {
          try {
            const userRes = await axios.get(
              `${import.meta.env.VITE_DEV_ENDPOINT}/api/userinfoemail?email=${
                member.email
              }`
            );
            return {
              ...member,
              user: userRes.data,
              hasContributed: member.transactions?.length > 0,
            };
          } catch (error) {
            console.error("Failed to fetch user:", error);
            return {
              ...member,
              user: { firstName: "Unknown", lastName: "User" },
              hasContributed: false,
            };
          }
        })
      );

      setGroupData(group);
      setMembers(membersWithDetails);
    } catch (error) {
      console.error("Error fetching group data:", error);
      message.error("Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  const handleMembersAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleContribution = async (values) => {
    try {
      setProcessingPayment(true);
      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/groupfundcontribution`,
        {
          email: values.email,
          amount: values.amount,
          groupId: id,
          phoneNumber: values.phoneNumber,
        }
      );

      if (response.data.success) {
        message.success("Payment initiated! Check your phone to complete");
        setContributeModalVisible(false);
        contributionForm.resetFields();
        fetchGroupData();
      } else {
        message.error(response.data.message || "Payment failed");
      }
    } catch (error) {
      console.error("Contribution error:", error);
      message.error(error.response?.data?.message || "Payment failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [id, refreshKey]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!groupData) {
    return (
      <div style={{ padding: 24 }}>
        <Card title="Group Not Found">
          <Text type="danger">
            The group you are looking for does not exist.
          </Text>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const contributedMembers = members.filter((m) => m.hasContributed).length;
  const totalMembers = members.length;
  const contributionPercentage =
    totalMembers > 0
      ? Math.round((contributedMembers / totalMembers) * 100)
      : 0;

  // Prepare chart data
  const contributionData = [
    { name: "Contributed", value: contributedMembers },
    { name: "Pending", value: Math.max(0, totalMembers - contributedMembers) },
  ];

  const allTransactions = members.flatMap(
    (member) =>
      member.transactions?.map((t) => ({
        ...t,
        memberName: `${member.user?.firstName} ${member.user?.lastName}`,
        memberEmail: member.email,
        phoneNumber: member.phoneNumber,
      })) || []
  );

  const contributionTrendData = allTransactions
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
    name: `${member.user?.firstName} ${member.user?.lastName}`,
    contributions: member.transactions?.length || 0,
    amount: member.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0,
  }));

  return (
    <>
      <Navbar />
      <div style={{ padding: 24 }}>
        {/* Summary Cards */}
        <Card
          title={groupData.groupName}
          extra={
            <Tag color="blue">
              Target: KSH {groupData.targetAmount?.toLocaleString()}
            </Tag>
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
                  title="Active Contributors"
                  value={contributedMembers}
                  suffix={`/ ${totalMembers}`}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Collected"
                  value={groupData.currentAmount || 0}
                  prefix={<DollarOutlined />}
                  suffix="KES"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Funding Progress"
                  value={
                    Math.round(
                      (groupData.currentAmount / groupData.targetAmount) * 100
                    ) || 0
                  }
                  suffix="%"
                  prefix={<ClockCircleOutlined />}
                />
                <Progress
                  percent={
                    Math.round(
                      (groupData.currentAmount / groupData.targetAmount) * 100
                    ) || 0
                  }
                  status="active"
                  size="small"
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Charts Section */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={8}>
            <Card title="Contribution Status">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contributionData}
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
                    {contributionData.map((entry, index) => (
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

        {/* Main Tabs */}
        <Tabs defaultActiveKey="1">
          {/* Members Tab */}
          <Tabs.TabPane
            tab={
              <span>
                <TeamOutlined />
                Members
              </span>
            }
            key="1"
          >
            <Card
              extra={
                <AddMembersModal groupId={id} onSuccess={handleMembersAdded} />
              }
            >
              <Table
                columns={[
                  {
                    title: "Member",
                    dataIndex: "user",
                    key: "member",
                    render: (user) => (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          style={{ marginRight: 8 }}
                          src={user.photo}
                          icon={<UserOutlined />}
                        >
                          {user.firstName?.charAt(0)}
                          {user.lastName?.charAt(0)}
                        </Avatar>
                        <div>
                          <div>
                            {user.firstName} {user.lastName}
                          </div>
                          <Text type="secondary">{user.email}</Text>
                        </div>
                      </div>
                    ),
                  },
                  // {
                  //   title: 'Contact',
                  //   key: 'contact',
                  //   render: (_, record) => (
                  //     <div>
                  //       <div style={{ display: 'flex', alignItems: 'center' }}>
                  //         <PhoneOutlined style={{ marginRight: 8 }} />
                  //         {record.phoneNumber || 'N/A'}
                  //       </div>
                  //     </div>
                  //   )
                  // },
                  {
                    title: "Status",
                    key: "status",
                    render: (_, record) => (
                      <Tag
                        color={record.hasContributed ? "green" : "orange"}
                        icon={
                          record.hasContributed ? (
                            <CheckCircleOutlined />
                          ) : (
                            <SyncOutlined spin />
                          )
                        }
                      >
                        {record.hasContributed ? "Contributed" : "Pending"}
                      </Tag>
                    ),
                  },
                  {
                    title: "Total Contributed",
                    key: "total",
                    render: (_, record) => (
                      <Text strong>
                        KES{" "}
                        {record.transactions
                          ?.reduce((sum, t) => sum + t.amount, 0)
                          ?.toLocaleString() || 0}
                      </Text>
                    ),
                  },
                ]}
                dataSource={members}
                rowKey="email"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Tabs.TabPane>

          {/* Contributions Tab */}
          <Tabs.TabPane
            tab={
              <span>
                <HistoryOutlined />
                Transactions
              </span>
            }
            key="2"
          >
            <Card>
              <Table
                columns={[
                  {
                    title: "Member",
                    dataIndex: "memberName",
                    key: "member",
                    render: (name, record, index) => (
                      <div>
                        <div>{name}</div>
                        <Text key={index} type="secondary">
                          {record.memberEmail}
                        </Text>
                      </div>
                    ),
                  },
                  {
                    title: "Amount (KES)",
                    dataIndex: "amount",
                    key: "amount",
                    render: (amount) => (
                      <Text strong>KES {amount?.toLocaleString()}</Text>
                    ),
                  },
                  // {
                  //   title: 'Phone Used',
                  //   dataIndex: 'phoneNumber',
                  //   key: 'phone',
                  //   render: (record) => <Text>{record.phoneNumber}</Text>
                  // },
                  {
                    title: "Date",
                    dataIndex: "createdAt",
                    key: "date",
                    render: (date) => dayjs(date).format("MMM D, YYYY h:mm A"),
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (status) => {
                      let color =
                        status === "completed"
                          ? "green"
                          : status === "failed"
                          ? "red"
                          : "orange";
                      return <Tag color={color}>{status?.toUpperCase()}</Tag>;
                    },
                  },
                ]}
                dataSource={allTransactions.sort(
                  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                )}
                rowKey="transactionId"
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Tabs.TabPane>

          {/* Contribute Tab */}
          <Tabs.TabPane
            tab={
              <span>
                <MoneyCollectOutlined />
                Contribute
              </span>
            }
            key="3"
          >
            <Card
              title="Make a Contribution"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setContributeModalVisible(true)}
                >
                  New Contribution
                </Button>
              }
            >
              {allTransactions.length > 0 ? (
                <Table
                  columns={[
                    {
                      title: "Amount",
                      dataIndex: "amount",
                      key: "amount",
                      render: (amount) => (
                        <Text strong>KES {amount?.toLocaleString()}</Text>
                      ),
                    },
                    {
                      title: "Date",
                      dataIndex: "createdAt",
                      key: "date",
                      render: (date) =>
                        dayjs(date).format("MMM D, YYYY h:mm A"),
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      render: (status) => (
                        <Tag
                          color={
                            status === "completed"
                              ? "green"
                              : status === "failed"
                              ? "red"
                              : "orange"
                          }
                        >
                          {status?.toUpperCase()}
                        </Tag>
                      ),
                    },
                  ]}
                  dataSource={allTransactions
                    .filter(
                      (t) =>
                        t.memberEmail ===
                        groupData.member.find((m) => m.email)?.email
                    )
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )}
                  rowKey="transactionId"
                  pagination={{ pageSize: 5 }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: 24 }}>
                  <MoneyCollectOutlined
                    style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }}
                  />
                  <Text type="secondary">No contributions yet</Text>
                  <div style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      onClick={() => setContributeModalVisible(true)}
                    >
                      Make First Contribution
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </Tabs.TabPane>
        </Tabs>

        {/* Contribution Modal */}
        <Modal
          title="Make M-Pesa Contribution"
          visible={contributeModalVisible}
          onCancel={() => {
            setContributeModalVisible(false);
            contributionForm.resetFields();
          }}
          onOk={() => contributionForm.submit()}
          confirmLoading={processingPayment}
          okText={processingPayment ? "Processing..." : "Contribute"}
          destroyOnClose
        >
          <Form
            form={contributionForm}
            layout="vertical"
            onFinish={handleContribution}
            initialValues={{
              email: userEmail,
            }}
          >
            <Form.Item label="Your Email" name="email">
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="M-Pesa Phone Number"
              name="phoneNumber"
              rules={[
                {
                  required: true,
                  message: "Please enter your M-Pesa phone number",
                },
                {
                  pattern: /^254[0-9]{9}$/,
                  message: "Format: 2547XXXXXXXX (e.g., 254712345678)",
                },
              ]}
            >
              <Input prefix={<MobileOutlined />} placeholder="2547XXXXXXXX" />
            </Form.Item>

            <Form.Item
              label="Amount (KES)"
              name="amount"
              rules={[
                { required: true, message: "Please enter amount" },
                // {
                //   type: 'number',
                // },
                {
                  validator: (_, value) => {
                    if (
                      value >
                      groupData.targetAmount - groupData.currentAmount
                    ) {
                      return Promise.reject("Amount exceeds remaining target");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                type="number"
                prefix={<DollarOutlined />}
                placeholder="Enter amount"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default GroupFundingDashboard;
