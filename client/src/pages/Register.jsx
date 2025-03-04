import React, { useState, useEffect } from "react";
import { Button, Checkbox, Form, Input } from "antd";
import { img1 } from "../assets/images";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);

  const navigateTo = useNavigate();

  const onFinish = (values) => {
    handleSubmit();
    console.log("Success:", values);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();

    try {

      const formData = {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      };

      if (password !== confirmPassword) {
        setPasswordMatch(false);
        console.log("Password does not match");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/register`,
        formData
      );
      if (response.status === 200) {
        console.log("Registration success");
        navigateTo("/login");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 justify-center items-center w-full py-10">
      <div className="hidden lg:flex h-full">
        <div></div>
        <img src={img1} alt="" className="h-screen" />
      </div>
      <div className="flex flex-col gap-10 justify-center items-center w-full md:w-1/2 h-full">
        <h3 className="text-2xl font-bold text-center">Register an Account</h3>
        <Form
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="w-3/4"
        >
          <Form.Item
            label="Firstname"
            name="firstName"
            rules={[
              {
                required: true,
                message: "Please input your firstname!",
              },
            ]}
          >
            <Input
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
          </Form.Item>

          <Form.Item
            label="LastName"
            name="lastName"
            rules={[
              {
                required: true,
                message: "Please input your lastname!",
              },
            ]}
          >
            <Input
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
            />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
            ]}
          >
            <Input onChange={(e) => setEmail(e.target.value)} value={email} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </Form.Item>

          <Form.Item
            label="confirm Password"
            name="confirm-password"
            rules={[
              {
                required: true,
                message: "Please confirm your password",
              },
            ]}
          >
            <Input.Password
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            />
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
export default Register;
