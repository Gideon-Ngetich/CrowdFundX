import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GroupRegistrationForm = () => {
  const [formData, setFormData] = useState({
    groupName: '',
    description: '',
    targetAmount: '1000'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('code');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/groupfundingregistration`,
        {
          ...formData,
          targetAmount: Number(formData.targetAmount),
          createdBy: userId
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Create New Group</h2>
      
      {error && (
        <div style={{ 
          color: 'red', 
          padding: '10px', 
          marginBottom: '20px',
          border: '1px solid red',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: 'green', 
          padding: '10px', 
          marginBottom: '20px',
          border: '1px solid green',
          borderRadius: '4px'
        }}>
          Group created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Group Name *
          </label>
          <input
            type="text"
            name="groupName"
            value={formData.groupName}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minHeight: '100px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Target Amount (KES) *
          </label>
          <input
            type="number"
            name="targetAmount"
            value={formData.targetAmount}
            onChange={handleChange}
            min="100"
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            background: loading ? '#ccc' : '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px'
          }}
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
};

export default GroupRegistrationForm;