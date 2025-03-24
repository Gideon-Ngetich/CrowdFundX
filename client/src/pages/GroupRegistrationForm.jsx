import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  List,
  Typography,
  Steps,
  Card,
  Select,
} from "antd";
import { PlusOutlined, ArrowRightOutlined, ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { Link } from "react-router-dom";

const { TextArea } = Input;
const { Title } = Typography;
const { Step } = Steps;
const { Option } = Select;

const GroupRegistrationForm = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [members, setMembers] = useState([]);
  const [mpesaAccounts, setMpesaAccounts] = useState([]);
  const [selectedMpesaAccount, setSelectedMpesaAccount] = useState(null);
  const userId = localStorage.getItem("code");

  // Fetch Mpesa accounts from the database
  useEffect(() => {
    const fetchMpesaAccounts = async () => {
      try {
        console.log(userId);
        const response = await axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/getmpesadetails?id=${userId}`);
        console.log("API Response:", response.data.mpesaAccounts);

        // Handle empty or invalid responses
        if (!response.data) {
          console.warn("No Mpesa accounts found");
          setMpesaAccounts([]); // Set to an empty array
          return;
        }

        setMpesaAccounts(response.data.mpesaAccounts);
        setSelectedMpesaAccount(response.data.mpesaAccounts)
      } catch (error) {
        console.error("Error fetching Mpesa accounts:", error);
        setMpesaAccounts([]); // Set to an empty array in case of error
      }
    };
    fetchMpesaAccounts();
  }, [userId]);

 

  const addMember = () => {
    setMembers([...members, { email: "" }]);
  };

  const updateMemberField = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  const removeMember = (index) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
  };

  const steps = [
    {
      title: "Group Information",
      content: (
        <>
          {/* Group Name */}
          <Form.Item
            label="Group Name"
            name="groupName"
            rules={[{ required: true, message: "Please enter the group name!" }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description!" }]}
          >
            <TextArea rows={4} placeholder="Enter group description" />
          </Form.Item>

          {/* Target Amount */}
          <Form.Item
            label="Target Amount"
            name="targetAmount"
            rules={[{ required: true, message: "Please enter the target amount!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} placeholder="Enter target amount" />
          </Form.Item>

          {/* Deadline (Optional) */}
          <Form.Item label="Deadline" name="deadLine">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          {/* Mpesa Account */}
          <Form.Item
            label="Mpesa Account"
            name="mpesaAccount"
            rules={[{ required: true, message: "Please select an Mpesa account!" }]}
          >
            <Select
              placeholder="Select an Mpesa account"
              style={{ width: "100%" }}
              onChange={(value) => setSelectedMpesaAccount(mpesaAccounts.find((acc) => acc.id === value))}
            >
              {mpesaAccounts.length > 0 ? (
                mpesaAccounts.map((account, index) => (
                  <Option key={index} value={account.id}>
                    {account.AccountName} ({account.businessShortCode})
                  </Option>
                ))
              ) : (
                <Option disabled value="no-accounts">
                  No Mpesa accounts found
                </Option>
              )}
            </Select>
          </Form.Item>

          {/* Create New Account Button */}
          <Button type="default" style={{ marginTop: 10 }}>
            <Link to={"/mpesaacountregistration"}>Create New Mpesa Account</Link>
          </Button>
        </>
      ),
    },
    {
      title: "Invite Members (Optional)",
      content: (
        <>
          <List
            dataSource={members}
            renderItem={(member, index) => (
              <List.Item
                key={index}
                actions={[
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeMember(index)}
                  >
                    Remove
                  </Button>,
                ]}
              >
                <Form.Item
                  label="Email"
                  rules={[{ required: true, message: "Please enter an email address!" }]}
                >
                  <Input
                    placeholder="Enter email"
                    value={member.email}
                    onChange={(e) => updateMemberField(index, "email", e.target.value)}
                  />
                </Form.Item>
              </List.Item>
            )}
          />
          <Button type="dashed" onClick={addMember} icon={<PlusOutlined />}>
            Add Member
          </Button>
        </>
      ),
    },
  ];

  const onFinish =  (values) => {
    console.log("Form Values:", {
      ...values,
      members,
      createdBy: userId,
      createdAt: new Date(),
    });

    const submitForm = async () => {
      const response = await axios.post(`${import.meta.env.VITE_DEV_ENDPOINT}/api/groupfundingregistration`, values)

      if(response.status === 200) {
        
      }

    }
    alert("Group registration submitted successfully!");
    form.resetFields();
    setMembers([]);
    setCurrentStep(0);
    setSelectedMpesaAccount(null);
  };

  const nextStep = () => {
    if (currentStep === 0) {
      form
        .validateFields()
        .then(() => setCurrentStep(currentStep + 1))
        .catch((err) => console.log("Validation failed:", err));
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px" }}>
      <Title level={2}>Group Registration Form</Title>
      <Steps current={currentStep} style={{ marginBottom: 20 }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} />
        ))}
      </Steps>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {steps[currentStep].content}

          <div style={{ marginTop: 20, textAlign: "right" }}>
            {currentStep > 0 && (
              <Button style={{ marginRight: 8 }} onClick={prevStep} icon={<ArrowLeftOutlined />}>
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={nextStep} icon={<ArrowRightOutlined />}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default GroupRegistrationForm;