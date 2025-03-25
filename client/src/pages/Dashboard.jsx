import React, { useState, useEffect } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DoubleRightOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Spin, Alert } from "antd";
import { Avatar, Card } from "antd";
import axios from "axios";
import { Link } from "react-router-dom";
import { useCampaigns } from "../utils/campaignContext";
import Navbar from "../components/Navbar";

const { Meta } = Card;
const { Sider, Content } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const [loading, setLoading] = useState(true);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("code");
  const { setCampaigns } = useCampaigns();

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!token) {
        setError("Login required");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_DEV_ENDPOINT}/api/mycampaigns?code=${userId}`
        );
        const data = response.data;

        if (data && data.length > 0) {
          setCampaigns(data);
          setMyCampaigns(data);
        } else {
          setError("No campaigns found.");
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("Failed to fetch campaigns. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [userId, setCampaigns]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCampaigns.map((campaign) => (
              <Card
                key={campaign._id}
                style={{
                  width: 300,
                }}
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
        );
      case "2":
        return <div>Invited Campaigns</div>;
      case "3":
        return <div>Bank Accounts</div>;
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <Layout className="h-screen pt-20">
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
              { key: "1", icon: <UserOutlined />, label: "My Campaigns" },
              {
                key: "2",
                icon: <VideoCameraOutlined />,
                label: "Invited Campaigns",
              },
              { key: "3", icon: <UploadOutlined />, label: "Bank Accounts" },
            ]}
          />
        </Sider>
        <Layout className="overflow-y-scroll">
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Button className="mb-5 text-white " style={{backgroundColor: '#2d7ded', color: 'white'}}><Link to={'/dashboard/accountselection'}>Add Campaign</Link><PlusOutlined /></Button>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default Dashboard;
