import React, { useState, useEffect } from "react";
import { Layout, Card, Tabs, Table, Spin, Progress } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useCampaigns } from "../utils/campaignContext";
import axios from "axios";
import { useParams } from "react-router-dom";

const { Content } = Layout;
const COLORS = ["#0088FE", "#FFBB28"];

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-GB");
const calculateCampaignDays = (startDate) =>
  Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24));

const ContributionTable = ({ records }) => {
  const columns = [
    { title: "Phone Number", dataIndex: "phoneNumber", key: "phoneNumber" },
    {
      title: "Amount (KES)",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={records.map((record) => ({ ...record, key: record._id }))}
      pagination={{ pageSize: 5 }}
    />
  );
};

const CrowdCampaignDetails = () => {
  const { id } = useParams();
  const uid = localStorage.getItem("code");
  const { campaigns } = useCampaigns();
  const campaign = campaigns.find((c) => c._id === id);
  const [records, setRecords] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);

  useEffect(() => {
    const fetchTransactionRecords = async () => {
      try {
        const { data, status } = await axios.get(
          `${import.meta.env.VITE_DEV_ENDPOINT}/api/getcrowdrecords?cid=${id}`
        );
        if (status === 200) setRecords(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTransactionRecords();
  }, [id]);

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_DEV_ENDPOINT
          }/api/getaccountdetails?uid=${uid}`
        );
        const data = response.data;
        console.log(data);

        if (response.status === 200) {
          const filteredData = data.filter(
            (account) => account.AccountName === campaign?.campaignTitle
          );
          console.log(filteredData);
          setBankDetails(filteredData);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (campaign) {
      fetchBankDetails();
    }
  }, [uid, campaign]);

  if (!campaign) {
    return (
      <Layout className="h-screen p-5">
        <Content>
          <Card title="Campaign Not Found" className="mb-5">
            <p className="text-red-500">
              The campaign you are looking for does not exist.
            </p>
          </Card>
        </Content>
      </Layout>
    );
  }

  const pieData = [
    { name: "Raised", value: campaign.currentAmount },
    {
      name: "Remaining",
      value: campaign.targetAmount - campaign.currentAmount,
    },
  ];

  const completionPercentage = Math.round(
    (campaign.currentAmount / campaign.targetAmount) * 100
  );

  return (
    <Layout className="h-screen p-5">
      <Content>
        <Card title={campaign.campaignTitle} className="mb-5">
          <div className="flex gap-5">
            <div className="flex items-center w-full md:w-3/4 border-r border-slate-300">
              <ResponsiveContainer width="50%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`Ksh ${value}`]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <div>
                <p className="text-lg font-bold">
                  Amount Raised:{" "}
                  <span className="text-blue-500">
                    Ksh {campaign.currentAmount}
                  </span>
                </p>
                <p className="text-lg font-bold">
                  Target Amount:{" "}
                  <span className="text-amber-500">
                    Ksh {campaign.targetAmount}
                  </span>
                </p>
                <p className="text-lg font-bold">
                  Completion:{" "}
                  <span className="text-green-500">{completionPercentage}%</span>
                </p>
                <Progress
                  percent={completionPercentage}
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col w-full md:w-1/4">
              <p className="text-lg">
                <strong>Start Date:</strong> {formatDate(campaign.createdAt)}
              </p>
              <p className="text-lg">
                <strong>Days Running:</strong>{" "}
                {calculateCampaignDays(campaign.createdAt)} days
              </p>
            </div>
          </div>
        </Card>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Contribution" key="1">
            <ContributionTable records={records} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Invited Campaigns" key="2">
            <p>Invited Campaigns content goes here.</p>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Bank Accounts" key="3">
            <div>
              <div>
                {bankDetails.length > 0 ? (
                  <div>
                    {bankDetails.map((details) => (
                      <div>
                        <p>
                          <b>Account Name:</b> {details.AccountName}
                        </p>
                        <p>
                          <b>Business Shortcode:</b> {details.businessShortCode}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No bank details available.</p>
                )}
              </div>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default CrowdCampaignDetails;