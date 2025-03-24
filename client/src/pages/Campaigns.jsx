import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
  DoubleRightOutlined,
} from "@ant-design/icons";
import { Avatar, Card, Progress } from "antd";
import { Link } from "react-router-dom";
const { Meta } = Card;

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_DEV_ENDPOINT}/api/getcampaigns`
        );
        const data = response.data;
        console.log(data);
        if (response.status === 200) {
          setCampaigns(data);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div>
      <Navbar />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {campaigns.map((campaign) => {
          const completionPercentage = Math.round(
            (campaign.currentAmount / campaign.targetAmount) * 100
          );

          return (
            <Card
              key={campaign._id}
              style={{ width: 300 }}
              cover={
                <img
                  alt="example"
                  src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                />
              }
              actions={[
                <Link
                  to={`/campaign/${campaign._id}`}
                  className="text-blue-500 cursor-pointer flex gap-2 hover:gap-3 hover:text-blue-600 duration-100"
                >
                  <p>View <DoubleRightOutlined /> </p>
                </Link>,
              ]}
            >
              <div className="flex flex-col justify-between">
                <Meta
                  title={campaign.campaignTitle}
                  // description={campaign.description}
                />
                <div className="mt-3">
                  <div>
                    Raised: <b>KES {campaign.currentAmount}</b>
                  </div>
                  <div>
                    Target: <b>KES {campaign.targetAmount}</b>
                  </div>
                  <div>
                    Completion: <b>{completionPercentage}%</b>
                  </div>
                  <Progress
                    percent={completionPercentage}
                    status="active"
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Campaigns;