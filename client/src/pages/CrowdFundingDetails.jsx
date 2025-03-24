import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Carousel, Input, Button, Card, Progress, message } from "antd";
import Navbar from "../components/Navbar";
import { useCampaigns } from "../utils/campaignContext";

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaigns } = useCampaigns();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isDonating, setIsDonating] = useState(false);

  // Find the campaign by ID from the context
  const campaign = campaigns.find((c) => c._id === id);

  // Predefined custom amounts
  const presetAmounts = [100, 500, 1000, 2000, 5000];

  if (!campaigns.length) {
    return <div>Loading campaigns...</div>;
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center">
        <h2>Campaign not found</h2>
        <Button type="primary" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </div>
    );
  }

  const validatePhoneNumber = (number) => {
    return /^254[0-9]{9}$/.test(number);
  };

  const handleDonate = async () => {
    const donationAmount = selectedAmount || customAmount;
    
    if (!donationAmount) {
      message.error("Please select or enter an amount");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      message.error("Please enter a valid M-Pesa phone number (format: 254...)");
      return;
    }

    setIsDonating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success(
        `Donation of KES ${donationAmount} to ${campaign.campaignTitle} is being processed.`
      );
      
      // Reset form
      setPhoneNumber("");
      setCustomAmount("");
      setSelectedAmount(null);
    } catch (error) {
      message.error("Donation failed. Please try again.");
    } finally {
      setIsDonating(false);
    }
  };

  const completionPercentage = Math.round(
    (campaign.currentAmount / campaign.targetAmount) * 100
  );

  return (
    <div>
      <Navbar />

      {/* Banner Section */}
      <div
        className="w-full h-64 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url(${campaign.bannerImage || 'https://via.placeholder.com/1200x400'})`,
        }}
      >
        <h1 className="text-4xl font-bold text-white text-center">
          {campaign.campaignTitle}
        </h1>
      </div>

      {/* Image Slider Section */}
      <div className="p-8">
        {campaign.images?.length ? (
          <Carousel autoplay>
            {campaign.images.map((image, index) => (
              <div key={index}>
                <img
                  src={image}
                  alt={`Campaign ${index + 1}`}
                  className="w-full h-96 object-cover"
                />
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
            <p>No images available for this campaign</p>
          </div>
        )}
      </div>

      {/* Description Section */}
      <div className="p-8">
        <Card>
          <h2 className="text-2xl font-bold mb-4">About the Campaign</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {campaign.description || "No description available."}
          </p>
        </Card>
      </div>

      {/* Donation Section */}
      <div className="p-8">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Support This Campaign</h2>
          <div className="space-y-4">
            {/* Phone Number Input */}
            <div>
              <label className="block text-gray-700 mb-1">Phone Number (M-Pesa)</label>
              <Input
                placeholder="2547XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                maxLength={12}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 254 followed by 9 digits (e.g., 254712345678)
              </p>
            </div>

            {/* Preset Amount Selection */}
            <div>
              <label className="block text-gray-700 mb-1">Select Amount (KES)</label>
              <div className="flex flex-wrap gap-2">
                {presetAmounts.map((amt) => (
                  <Button
                    key={amt}
                    type={selectedAmount === amt ? "primary" : "default"}
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount("");
                    }}
                  >
                    {amt.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="block text-gray-700 mb-1">Or Enter Custom Amount</label>
              <Input
                placeholder="Enter amount in KES"
                value={selectedAmount ? "" : customAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setCustomAmount(value);
                  setSelectedAmount(null);
                }}
                disabled={!!selectedAmount}
              />
            </div>

            {/* Donate Button */}
            <Button
              type="primary"
              size="large"
              block
              onClick={handleDonate}
              loading={isDonating}
              disabled={!phoneNumber || (!selectedAmount && !customAmount)}
            >
              Donate Now
            </Button>
          </div>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="p-8">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Campaign Progress</h2>
          <div className="space-y-4">
            <div>
              Raised: <b>KES {campaign.currentAmount?.toLocaleString() || "0"}</b>
            </div>
            <div>
              Target: <b>KES {campaign.targetAmount?.toLocaleString()}</b>
            </div>
            <Progress
              percent={completionPercentage}
              status={completionPercentage >= 100 ? "success" : "active"}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CampaignDetails;