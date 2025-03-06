import React, { useState, useEffect} from "react";
import { Button, Checkbox, Form, Input } from "antd";
import { img1 } from "../assets/images";
import axios from "axios";
import { data, useNavigate } from "react-router-dom";


const Login = () => {
  const onFinish = (values) => {
    handleSubmit()
    console.log("Success:", values);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const [email, setEmail] = useState('')
  const [password, setPassword ] = useState('')
  const navigateTo = useNavigate()

  const handleSubmit = async () => {
    try {
      const formData = {
        email, password
      }

      const response = await axios.post(`${import.meta.env.VITE_DEV_ENDPOINT}/api/login`, formData)

      if(response.status === 401) {
        console.log("Wrong email or password")
        return
      } else if (response.status === 404) {
        console.log('User not found')
        return
      } else {
        const { userId, accessToken, targetAmount, currentAmount } = response.data
        localStorage.setItem('code', userId)
        localStorage.setItem('at', accessToken)
        console.log("Login successful")
        navigateTo('/dashboard')
      }


    } catch (err) {
      console.error(err)
    }
  }
  
  return (
    <div className="flex flex-col lg:flex-row gap-10 justify-center items-center w-full py-10">
      <div className="hidden lg:flex h-full">
        <div></div>
        <img src={img1} alt="" className="h-screen" />
      </div>
      <div className="flex flex-col gap-10 justify-center items-center w-full md:w-1/2 h-full">
        <h3 className="text-2xl font-bold text-center">CrowdFundX Login</h3>
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
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
            ]}
          >
            <Input onChange={(e) => setEmail(e.target.value)} value={email}/>
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
            <Input.Password onChange={(e) => setPassword(e.target.value)} value={password}/>
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" label={null}>
            <Checkbox>Remember me</Checkbox>
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
export default Login;
