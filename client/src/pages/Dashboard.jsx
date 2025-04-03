import React, { useState, useEffect } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DoubleRightOutlined,
  PlusOutlined,
  TeamOutlined,
  DollarOutlined,
  MailOutlined
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Spin, Alert, Card, List, Typography, Divider, Tag, Avatar } from "antd";
import axios from "axios";
import { Link } from "react-router-dom";
import { useCampaigns } from "../utils/campaignContext";
import Navbar from "../components/Navbar";

const { Meta } = Card;
const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const [loading, setLoading] = useState(true);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [error, setError] = useState("");
  const [chamas, setChamas] = useState([]);
  const [groups, setGroups] = useState([]);
  const [invitedCampaigns, setInvitedCampaigns] = useState([]);
  const [invitedLoading, setInvitedLoading] = useState(false);

  const token = localStorage.getItem("at");
  const userId = localStorage.getItem("code");
  const userEmail = localStorage.getItem("email"); // Assuming email is stored
  const { setCampaigns } = useCampaigns();

  useEffect(() => {
    if (!userId) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [campaignsRes, chamasRes, groupsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/mycampaigns?code=${userId}`),
          axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/getchama?userId=${userId}`),
          axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/getgroups?userId=${userId}`),
        ]);

        setMyCampaigns(campaignsRes.data || []);
        setChamas(chamasRes.data || []);
        setGroups(groupsRes.data || []);
        setCampaigns(campaignsRes.data || []);

        // Fetch invited campaigns separately
        await fetchInvitedCampaigns();

        if (campaignsRes.data.length === 0 && 
            chamasRes.data.length === 0 && 
            groupsRes.data.length === 0) {
          setError("No campaigns found.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchInvitedCampaigns = async () => {
      try {
        setInvitedLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_DEV_ENDPOINT}/api/campaigns/invited/${userId}`
        );
        setInvitedCampaigns(response.data || []);
      } catch (err) {
        console.error("Error fetching invited campaigns:", err);
      } finally {
        setInvitedLoading(false);
      }
    };

    fetchAllData();
  }, [userId, setCampaigns]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const renderInvitedCampaigns = () => (
    <div style={{ marginTop: 24 }}>
      <Title level={4}>Invited Campaigns</Title>
      <Divider />
      {invitedLoading ? (
        <Spin />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
          dataSource={invitedCampaigns}
          renderItem={(campaign) => (
            <List.Item>
              <Card
                title={
                  <span>
                    {campaign.type === 'chama' ? (
                      <TeamOutlined style={{ marginRight: 8 }} />
                    ) : (
                      <DollarOutlined style={{ marginRight: 8 }} />
                    )}
                    {campaign.name}
                  </span>
                }
                style={{ width: '100%' }}
                actions={[
                  <Tag color={campaign.type === 'chama' ? 'blue' : 'green'}>
                    {campaign.type === 'chama' ? 'Chama' : 'Funding'}
                  </Tag>,
                  
                ]}
              >
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  {campaign.description || 'No description'}
                </Text>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>{campaign.memberCount} members</Text>
                  {campaign.type === 'group' && (
                    <Text>Cycle: {campaign.cycleAmount} KES</Text>
                  )}
                </div>
              </Card>
            </List.Item>
          )}
          locale={{ emptyText: 'No invited campaigns found' }}
        />
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Spin size="large" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-full">
          <Alert message={error} type="error" showIcon />
        </div>
      );
    }

    switch (selectedKey) {
      case "1":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCampaigns.map((campaign) => (
                <Card
                  key={campaign._id}
                  style={{ width: 300 }}
                  cover={
                    <img
                      alt="example"
                      src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                    />
                  }
                  className="z-0"
                >
                  <Meta
                    title={campaign.campaignTitle}
                    description={campaign.description}
                  />
                  <Link
                    to={`/dashboard/${campaign._id}`}
                    className="pt-3 text-blue-500 cursor-pointer flex gap-2 hover:gap-3 hover:text-blue-600 duration-100"
                  >
                    <p>View</p> <DoubleRightOutlined />
                  </Link>
                </Card>
              ))}
            </div>
            {renderInvitedCampaigns()}
          </>
        );
      case "2":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card
                  key={group._id}
                  style={{ width: 300 }}
                  cover={
                    <img
                      alt="example"
                      src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                    />
                  }
                  className="z-0"
                 
                >
                  <Meta title={group.groupName} description={group.description} />
                  <Link
                    to={`/dashboard/groups/${group._id}`}
                    className="pt-3 text-blue-500 cursor-pointer flex gap-2 hover:gap-3 hover:text-blue-600 duration-100"
                  >
                    <p>View</p> <DoubleRightOutlined />
                  </Link>
                </Card>
              ))}
            </div>
            {renderInvitedCampaigns()}
          </>
        );
      case "3":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chamas.map((chama) => (
                <Card
                  key={chama._id}
                  style={{ width: 300 }}
                  cover={
                    <img
                      alt="example"
                      src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                    />
                  }
                  className="z-0"
                  
                >
                  <Meta title={chama.name} description={chama.description} />
                  <Text style={{ display: 'block', marginBottom: 8 }}>
                    Cycle: {chama.cycleAmount} KES
                  </Text>
                  <Link
                    to={`/dashboard/chama/${chama._id}`}
                    className="pt-3 text-blue-500 cursor-pointer flex gap-2 hover:gap-3 hover:text-blue-600 duration-100"
                  >
                    <p>View</p> <DoubleRightOutlined />
                  </Link>
                </Card>
              ))}
            </div>
            {renderInvitedCampaigns()}
          </>
        );
      case "4":
        return renderInvitedCampaigns();
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <Layout className="h-screen">
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="demo-logo-vertical" />
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              color: "white",
            }}
          />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            onClick={(e) => setSelectedKey(e.key)}
            items={[
              { key: "1", icon: <UserOutlined />, label: "My Fund Raising" },
              { key: "2", icon: <VideoCameraOutlined />, label: "My Groups" },
              { key: "3", icon: <UploadOutlined />, label: "My Chama" },
              { key: "4", icon: <TeamOutlined />, label: "Invited Campaigns" },
            ]}
          />
        </Sider>
        <Layout className="h- overflow-y-scroll">
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Button
              className="mb-5 text-white"
              style={{ backgroundColor: "#2d7ded", color: "white" }}
            >
              <Link to={"/dashboard/accountselection"}>Add Campaign</Link>
              <PlusOutlined />
            </Button>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default Dashboard;