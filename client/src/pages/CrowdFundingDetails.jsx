import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Carousel, Input, Button, Card, Progress, message } from "antd";
import Navbar from "../components/Navbar";
import axios from "axios";

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isDonating, setIsDonating] = useState(false);

  // Predefined custom amounts
  const presetAmounts = [100, 500, 1000, 2000, 5000];

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_DEV_ENDPOINT}/api/campaigndetails?id=${id}`
        );
        setCampaign(response.data);
      } catch (err) {
        message.error("Failed to load campaign details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

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
      message.error(
        "Please enter a valid M-Pesa phone number (format: 254...)"
      );
      return;
    }

    setIsDonating(true);

    try {
      // Make actual API call to process donation
      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/donate`,
        {
          campaignId: id,
          amount: donationAmount,
          phoneNumber: phoneNumber,
        }
      );

      message.success(
        `Donation of KES ${donationAmount} to ${campaign.campaignTitle} is being processed.`
      );

      // Reset form
      setPhoneNumber("");
      setCustomAmount("");
      setSelectedAmount(null);

      // Refresh campaign data to update progress
      const updatedCampaign = await axios.get(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/campaigndetails?id=${id}`
      );
      setCampaign(updatedCampaign.data);
    } catch (error) {
      message.error("Donation failed. Please try again.");
      console.error("Donation error:", error);
    } finally {
      setIsDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading campaign details...</div>
      </div>
    );
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
          backgroundImage: `url(${
            campaign.bannerImage || "https://via.placeholder.com/1200x400"
          })`,
        }}
      >
        <h1 className="text-4xl font-bold text-white text-center bg-black bg-opacity-50 p-4 rounded">
          {campaign.campaignTitle}
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Image Slider Section */}
        <div className="p-4 md:p-8">
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

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-8">
          {/* Description Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <h2 className="text-2xl font-bold mb-4">About the Campaign</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {campaign.description || "No description available."}
              </p>
            </Card>

            {/* Additional campaign details can go here */}
            {campaign.additionalDetails && (
              <Card>
                <h2 className="text-2xl font-bold mb-4">More Information</h2>
                <div className="text-gray-700 whitespace-pre-line">
                  {campaign.additionalDetails}
                </div>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Takes 1 column on large screens */}
          <div className="space-y-8">
            {/* Donation Section */}
            {/* Donation Section */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">Support This Campaign</h2>
              <div className="space-y-4">
                {/* Phone Number Input */}
                <div>
                  <label className="block text-gray-700 mb-1">
                    Phone Number (M-Pesa)
                  </label>
                  <Input
                    placeholder="2547XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
                    maxLength={12}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 254 followed by 9 digits (e.g., 254712345678)
                  </p>
                </div>

                {/* Preset Amount Selection */}
                <div>
                  <label className="block text-gray-700 mb-1">
                    Select Amount (KES)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {presetAmounts.map((amt) => (
                      <Button
                        key={amt}
                        type={selectedAmount === amt ? "primary" : "default"}
                        onClick={() => {
                          if (selectedAmount === amt) {
                            // Deselect if clicking the already selected amount
                            setSelectedAmount(null);
                            setCustomAmount("");
                          } else {
                            // Select new amount
                            setSelectedAmount(amt);
                            setCustomAmount(amt.toString());
                          }
                        }}
                      >
                        {amt.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Amount Input Field */}
                <div>
                  <label className="block text-gray-700 mb-1">
                    {selectedAmount ? "Selected Amount" : "Enter Custom Amount"}
                  </label>
                  <div className="flex">
                    <Input
                      placeholder={selectedAmount ? "" : "Enter amount in KES"}
                      value={
                        selectedAmount
                          ? selectedAmount.toString()
                          : customAmount
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setCustomAmount(value);
                        // Clear selected amount if user types in the input
                        if (
                          selectedAmount &&
                          value !== selectedAmount.toString()
                        ) {
                          setSelectedAmount(null);
                        }
                      }}
                      prefix="KES"
                      suffix={
                        selectedAmount && (
                          <Button
                            type="text"
                            size="small"
                            onClick={() => {
                              setSelectedAmount(null);
                              setCustomAmount("");
                            }}
                          >
                            ×
                          </Button>
                        )
                      }
                    />
                  </div>
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

            {/* Progress Section */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">Campaign Progress</h2>
              <div className="space-y-4">
                <div>
                  Raised:{" "}
                  <b>KES {campaign.currentAmount?.toLocaleString() || "0"}</b>
                </div>
                <div>
                  Target: <b>KES {campaign.targetAmount?.toLocaleString()}</b>
                </div>
                <Progress
                  percent={completionPercentage}
                  status={completionPercentage >= 100 ? "success" : "active"}
                  strokeColor={{
                    "0%": "#108ee9",
                    "100%": "#87d068",
                  }}
                />
                {campaign.deadline && (
                  <div className="text-sm text-gray-500">
                    Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
