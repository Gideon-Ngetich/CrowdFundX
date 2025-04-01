import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Tag } from 'antd';
import axios from 'axios';

const AddMembersModal = ({ groupId, onSuccess }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Format: Split by lines and filter empty entries
      const newMembers = values.emails
        .split('\n')
        .map(email => email.trim())
        .filter(email => email.length > 0)
        .map(email => ({ email, phoneNumber: '' })); // Add phone if needed

      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/${groupId}/add-members`,
        { newMembers }
      );

      message.success(`Invites sent to ${response.data.newCount} members`);
      form.resetFields();
      setVisible(false);
      onSuccess?.(); // Refresh members list
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        + Add Members
      </Button>

      <Modal
        title="Add Members to Group"
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="emails"
            label="Enter Emails (One per line)"
            rules={[
              { required: true, message: 'Please enter at least one email' },
              {
                validator: (_, value) => {
                  const emails = value?.split('\n').filter(e => e.trim());
                  if (emails?.length > 0) return Promise.resolve();
                  return Promise.reject('Enter valid emails');
                },
              },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder="john@example.com\njane@example.com"
            />
          </Form.Item>
          <Tag color="blue">Tip: Paste a list of emails separated by new lines</Tag>
        </Form>
      </Modal>
    </>
  );
};

export default AddMembersModal;