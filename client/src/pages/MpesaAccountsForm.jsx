import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import axios from "axios";
import { Link , useNavigate} from "react-router-dom";

const { Title } = Typography;

const MpesaAccountForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Add the userId from local storage to the form values
      const userId = localStorage.getItem("code");
      if (!userId) {
        throw new Error("User ID not found in local storage");
      }

      const payload = {
        ...values,
        userId,
      };

      // Send the data to the backend
      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/mpesadetails`,
        payload
      );

      if (response.data.success) {
        message.success("Mpesa account created successfully!");
        form.resetFields();
        navigate('/dashboard')
      } else {
        throw new Error(response.data.message || "Failed to create Mpesa account");
      }
    } catch (error) {
      console.error("Error creating Mpesa account:", error);
      message.error(error.message || "An error occurred while creating the Mpesa account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px" }}>
      <Title level={2}>Create Mpesa Account</Title>
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Account Name */}
          <Form.Item
            label="Account Name"
            name="AccountName"
            rules={[{ required: true, message: "Please enter the account name!" }]}
          >
            <Input placeholder="Enter account name" />
          </Form.Item>

          {/* Business Short Code */}
          <Form.Item
            label="Business Short Code"
            name="businessShortCode"
            rules={[{ required: true, message: "Please enter the business short code!" }]}
          >
            <Input placeholder="Enter business short code" />
          </Form.Item>

          {/* Consumer Key */}
          <Form.Item
            label="Consumer Key"
            name="consumerKey"
            rules={[{ required: true, message: "Please enter the consumer key!" }]}
          >
            <Input placeholder="Enter consumer key" />
          </Form.Item>

          {/* Consumer Secret */}
          <Form.Item
            label="Consumer Secret"
            name="consumerSecret"
            rules={[{ required: true, message: "Please enter the consumer secret!" }]}
          >
            <Input.Password placeholder="Enter consumer secret" />
          </Form.Item>

          {/* Passkey */}
          <Form.Item
            label="Passkey"
            name="passkey"
            rules={[{ required: true, message: "Please enter the passkey!" }]}
          >
            <Input.Password placeholder="Enter passkey" />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Mpesa Account
            </Button>
          </Form.Item>

          <message type="secondary" style={{ display: "block", marginTop: 16 }}>
            <strong>Note:</strong> You must have a valid Till Number or Paybill Account registered on the{" "}
            <a href="https://developer.safaricom.co.ke/" target="_blank" rel="noopener noreferrer">
              Daraja Portal
            </a>
            . All details provided are securely stored and encrypted to protect your information.
          </message>
        </Form>
      </Card>
    </div>
  );
};

export default MpesaAccountForm;