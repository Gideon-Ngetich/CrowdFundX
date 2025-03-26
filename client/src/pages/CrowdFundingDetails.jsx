import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Carousel, Input, Button, Card, Progress, message, Modal } from "antd";
import Navbar from "../components/Navbar";
import axios from "axios";

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [socket, setSocket] = useState(null);

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

    // Initialize WebSocket connection
    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_ENDPOINT}?campaignId=${id}`
    );

    ws.onopen = () => {
      console.log("WebSocket connected");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "payment_update") {
        handlePaymentUpdate(data.success);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [id]);

  const handlePaymentUpdate = (success) => {
    if (success) {
      setPaymentStatus("success");
      message.success("Payment completed successfully!");

      // Refresh campaign data
      axios
        .get(
          `${import.meta.env.VITE_DEV_ENDPOINT}/api/campaigndetails?id=${id}`
        )
        .then((response) => setCampaign(response.data))
        .catch((err) => console.error(err));

      // Reset form fields and close modal after delay
      setTimeout(() => {
        setPhoneNumber("");
        setAmount("");
        setIsModalVisible(false);
        setPaymentStatus(null);
      }, 2000);
    } else {
      setPaymentStatus("failed");
      message.error("Payment failed. Please try again.");
    }
  };

  const validatePhoneNumber = (number) => {
    return /^254[0-9]{9}$/.test(number);
  };

  const handleDonate = async () => {
    if (!amount) {
      message.error("Please enter an amount");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      message.error(
        "Please enter a valid M-Pesa phone number (format: 254...)"
      );
      return;
    }

    setIsDonating(true);
    setPaymentStatus("pending");
    setIsModalVisible(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/crowddonation`,
        {
          campaignId: id,
          amount: amount,
          phoneNumber: phoneNumber,
        }
      );

      if (response.data.success) {
        message.success("Payment request sent to your phone");
      } else {
        setPaymentStatus("failed");
        message.error("Failed to initiate payment");
      }
    } catch (error) {
      setPaymentStatus("failed");
      message.error("Donation failed. Please try again.");
      console.error("Donation error:", error);
    } finally {
      setIsDonating(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setPaymentStatus(null);
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "pending":
        return "Waiting for payment confirmation...";
      case "success":
        return "Payment successful! Thank you for your donation.";
      case "failed":
        return "Payment failed. Please try again.";
      default:
        return "Processing your donation...";
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "success":
        return <span className="text-green-500 text-2xl">✓</span>;
      case "failed":
        return <span className="text-red-500 text-2xl">✗</span>;
      default:
        return <span className="text-blue-500 text-2xl">⏳</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
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
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Carousel */}
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
                <p>No images available</p>
              </div>
            )}

            {/* Campaign Details */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">About the Campaign</h2>
              <p className="whitespace-pre-line">
                {campaign.description || "No description available."}
              </p>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Donation Card */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">Support This Campaign</h2>

              {/* Phone Input */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">
                  M-Pesa Number
                </label>
                <Input
                  placeholder="254712345678"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={12}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 254XXXXXXXXX
                </p>
              </div>

              {/* Amount Selection */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Amount (KES)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {presetAmounts.map((amt) => (
                    <Button
                      key={amt}
                      type={amount === amt.toString() ? "primary" : "default"}
                      onClick={() => setAmount(amt.toString())}
                    >
                      {amt.toLocaleString()}
                    </Button>
                  ))}
                </div>
                <Input
                  placeholder="Or enter custom amount"
                  value={presetAmounts.includes(parseInt(amount)) ? "" : amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                  prefix="KES"
                />
              </div>

              {/* Donate Button */}
              <Button
                type="primary"
                size="large"
                block
                onClick={handleDonate}
                loading={isDonating}
                disabled={!phoneNumber || !amount}
              >
                Donate Now
              </Button>
            </Card>

            {/* Progress Card */}
            <Card>
              <h2 className="text-2xl font-bold mb-4">Progress</h2>
              <div className="space-y-2">
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

      {/* Payment Status Modal */}
      <Modal
        title="Payment Status"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
      >
        <div className="text-center p-4">
          <div className="mb-4">{getStatusIcon()}</div>
          <h3 className="text-lg font-medium mb-2">{getStatusMessage()}</h3>

          {paymentStatus === "pending" && (
            <p className="text-gray-600">
              Please complete the payment on your phone. We'll notify you when
              it's processed.
            </p>
          )}

          {paymentStatus === "success" && (
            <p className="text-gray-600">
              Your contribution has been recorded. Thank you!
            </p>
          )}

          {paymentStatus === "failed" && (
            <Button
              type="primary"
              onClick={() => {
                setIsModalVisible(false);
                setPaymentStatus(null);
              }}
            >
              Try Again
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CampaignDetails;
