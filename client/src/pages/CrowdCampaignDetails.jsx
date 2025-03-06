import React, { useState } from "react";
import { Layout, Card, Tabs, Table, Spin, Button } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import moment from "moment";
import { useCampaigns } from "../utils/campaignContext";
import { useParams } from "react-router-dom";

const { Content } = Layout;

// Table Component
const ContributionTable = () => {
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      filters: [
        { text: "Joe", value: "Joe" },
        { text: "Jim", value: "Jim" },
      ],
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.name.includes(value),
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.columnKey === "name" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      sorter: (a, b) => a.age - b.age,
      sortOrder: sortedInfo.columnKey === "age" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      filters: [
        { text: "London", value: "London" },
        { text: "New York", value: "New York" },
      ],
      filteredValue: filteredInfo.address || null,
      onFilter: (value, record) => record.address.includes(value),
      sorter: (a, b) => a.address.length - b.address.length,
      sortOrder: sortedInfo.columnKey === "address" ? sortedInfo.order : null,
      ellipsis: true,
    },
  ];

  const data = [
    { key: "1", name: "Joe", age: 32, address: "New York" },
    { key: "2", name: "Jim", age: 40, address: "London" },
  ];

  return <Table columns={columns} dataSource={data} onChange={handleChange} />;
};

const CrowdCampaignDetails = () => {
  const { id } = useParams();
  const { campaigns, updateCampaignAmount, processong } = useCampaigns();
  console.log(campaigns);
  const campaign = campaigns.find((c) => c._id === id);
  console.log(campaign);
  if (!campaign) {
    return (
      <Layout className="h-screen p-5">
        <Content>
          <Card title="Campaign Not Found" variant={false} className="mb-5">
            <p className="text-red-500">
              The campaign you are looking for does not exist.
            </p>
          </Card>
        </Content>
      </Layout>
    );
  }

  const [loading, setLoading] = useState(false);

  const daysRunning = moment().diff(moment(campaign.startDate), "days");

  const data = [
    { name: "Raised", value: campaign.currentAmount },
    {
      name: "Remaining",
      value: campaign.targetAmount - campaign.currentAmount,
    },
  ];

  const COLORS = ["#0088FE", "#FFBB28"];

  return (
    <Layout className="h-screen p-5">
      <Content>
        <Card title={campaign.campaignTitle} variant={false} className="mb-5">
          <div className="flex gap-5">
            <div className="flex items-center w-full md:w-3/4 border-r-[1px] border-slate-300">
              <ResponsiveContainer width="50%" height={250}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`Ksh ${value}`, name]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>

              <div>
                <p className="text-lg font-bold">
                  Current Amount:{" "}
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
              </div>
              <Button
                type="primary"
                onClick={() => updateCampaignAmount(campaign._id)}
                loading={loading}
                className="mt-4"
              >
                Refresh Campaign Amount
              </Button>
            </div>

            <div className="flex flex-col w-full md:w-1/4">
              <p className="text-lg">
                <strong>Start Date:</strong> {campaign.startDate}
              </p>
              <p className="text-lg">
                <strong>Days Running:</strong> {daysRunning} days
              </p>
            </div>
          </div>
        </Card>

        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Contribution" key="1">
            {loading ? <Spin size="large" /> : <ContributionTable />}
          </Tabs.TabPane>
          <Tabs.TabPane tab="Invited Campaigns" key="2">
            <p>Invited Campaigns content goes here.</p>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Bank Accounts" key="3">
            <p>Bank Accounts content goes here.</p>
          </Tabs.TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default CrowdCampaignDetails;
