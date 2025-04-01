import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import '../assets/GroupFundingForm.css';

const GroupRegistrationForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    groupName: '',
    description: '',
    targetAmount: '',
    deadLine: '',
    mpesaAccount: '',
    members: [{ email: '', phoneNumber: '' }]
  });
  
  // UI state
  const [mpesaAccounts, setMpesaAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  
  const navigate = useNavigate();
  const userId = localStorage.getItem('code');
  const token = localStorage.getItem('token');

  // Fetch M-Pesa accounts on mount
  useEffect(() => {
    const fetchMpesaAccounts = async () => {
      if (!userId) return;
      
      try {
        setFetchingAccounts(true);
        const response = await axios.get(
          `${import.meta.env.VITE_DEV_ENDPOINT}/api/getmpesadetails?id=${userId}`
        );
        
        if (response.data?.success) {
          setMpesaAccounts(response.data.mpesaAccounts || []);
          // Auto-select if only one account exists
          if (response.data.mpesaAccounts?.length === 1) {
            setFormData(prev => ({ 
              ...prev, 
              mpesaAccount: response.data.mpesaAccounts[0]._id 
            }));
          }
        }
      } catch (error) {
        setSubmitError(error.response?.data?.message || 'Failed to load M-Pesa accounts');
      } finally {
        setFetchingAccounts(false);
      }
    };

    fetchMpesaAccounts();
  }, [userId, token]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle member input changes
  const handleMemberChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMembers = [...formData.members];
    updatedMembers[index] = { ...updatedMembers[index], [name]: value };
    setFormData(prev => ({ ...prev, members: updatedMembers }));
  };

  // Add new member field
  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { email: '', phoneNumber: '' }]
    }));
  };

  // Remove member field
  const removeMember = (index) => {
    const updatedMembers = [...formData.members];
    updatedMembers.splice(index, 1);
    setFormData(prev => ({ ...prev, members: updatedMembers }));
  };

  // Format currency display
  const formatCurrency = (value) => {
    const num = value.replace(/\D/g, '');
    return num ? `KSH ${parseInt(num, 10).toLocaleString('en-KE')}` : '';
  };

  // Handle amount input changes
  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, targetAmount: formatCurrency(rawValue) }));
    
    // Validate minimum amount
    if (rawValue && Number(rawValue) < 1000) {
      setErrors(prev => ({ ...prev, targetAmount: 'Minimum amount is KSH 1,000' }));
    } else if (errors.targetAmount) {
      setErrors(prev => ({ ...prev, targetAmount: null }));
    }
  };

  // Validate form inputs
  const validate = () => {
    const newErrors = {};
    
    // Group name validation
    if (!formData.groupName) {
      newErrors.groupName = 'Group name is required';
    } else if (formData.groupName.length > 100) {
      newErrors.groupName = 'Name cannot exceed 100 characters';
    }
    
    // Description validation
    if (!formData.description) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description should be at least 50 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }
    
    // Amount validation
    const amount = Number(formData.targetAmount.replace(/\D/g, ''));
    if (!formData.targetAmount) {
      newErrors.targetAmount = 'Target amount is required';
    } else if (amount < 1000) {
      newErrors.targetAmount = 'Minimum amount is KSH 1,000';
    }
    
    // Deadline validation
    if (!formData.deadLine) {
      newErrors.deadLine = 'Deadline is required';
    } else if (dayjs(formData.deadLine).isBefore(dayjs().add(7, 'day'))) {
      newErrors.deadLine = 'Deadline must be at least 7 days from now';
    }
    
    // M-Pesa account validation
    if (!formData.mpesaAccount) {
      newErrors.mpesaAccount = 'M-Pesa account is required';
    }
    
    // Members validation
    formData.members.forEach((member, index) => {
      if (!member.email) {
        newErrors[`memberEmail_${index}`] = 'Member email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(member.email)) {
        newErrors[`memberEmail_${index}`] = 'Invalid email format';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    if (!userId) {
      setSubmitError('You must be logged in to create a campaign');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare campaign data according to schema
      const campaignData = {
        groupName: formData.groupName,
        description: formData.description,
        targetAmount: Number(formData.targetAmount.replace(/\D/g, '')),
        deadLine: new Date(formData.deadLine), // Convert to Date object
        mpesaAccount: formData.mpesaAccount,
        userId: userId, // Using the user's code
        members: formData.members.map(member => ({
          email: member.email,
          phoneNumber: member.phoneNumber || undefined,
          status: "Pending", // Default status
          totalContributed: 0, // Initial contribution
          transactions: [] // Empty transactions array
        }))
      };
      console.log(formData)
      // Submit to backend
      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/groupfundingregistration`,
        campaignData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        navigate('/dashboard');
      } else {
        throw new Error(response.data?.message || 'Failed to create campaign');
      }
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gf-container">
      <div className="gf-card">
        <h2 className="gf-title">Create Group Funding Campaign</h2>
        
        {submitError && (
          <div className="gf-alert gf-alert-error">
            <span className="gf-alert-icon">!</span>
            <div>
              <h4>Error</h4>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="gf-form">
          {/* Group Name Field */}
          <div className="gf-form-group">
            <label className="gf-label">Group Name</label>
            <input
              type="text"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
              className={`gf-input ${errors.groupName ? 'gf-input-error' : ''}`}
              placeholder="Enter your group name"
            />
            {errors.groupName && <span className="gf-error">{errors.groupName}</span>}
          </div>

          {/* Description Field */}
          <div className="gf-form-group">
            <label className="gf-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`gf-textarea ${errors.description ? 'gf-input-error' : ''}`}
              rows={6}
              placeholder="Explain your group's funding purpose and goals..."
            />
            {errors.description && <span className="gf-error">{errors.description}</span>}
          </div>

          {/* Target Amount Field */}
          <div className="gf-form-group">
            <label className="gf-label">Target Amount (KSH)</label>
            <input
              type="text"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleAmountChange}
              onBlur={() => {
                if (formData.targetAmount) {
                  setFormData(prev => ({ 
                    ...prev, 
                    targetAmount: formatCurrency(prev.targetAmount.replace(/\D/g, '')) 
                  }));
                }
              }}
              className={`gf-input ${errors.targetAmount ? 'gf-input-error' : ''}`}
              placeholder="Enter target amount (min KSH 1,000)"
            />
            {errors.targetAmount && <span className="gf-error">{errors.targetAmount}</span>}
          </div>

          {/* Deadline Field */}
          <div className="gf-form-group">
            <label className="gf-label">Campaign Deadline</label>
            <input
              type="date"
              name="deadLine"
              value={formData.deadLine}
              onChange={handleChange}
              min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
              className={`gf-input ${errors.deadLine ? 'gf-input-error' : ''}`}
            />
            {errors.deadLine && <span className="gf-error">{errors.deadLine}</span>}
          </div>

          {/* M-Pesa Account Field */}
          <div className="gf-form-group">
            <label className="gf-label">M-Pesa Account for Receiving Funds</label>
            <select
              value={formData.mpesaAccount}
              onChange={handleChange}
              name="mpesaAccount"
              className={`gf-select ${errors.mpesaAccount ? 'gf-input-error' : ''}`}
              disabled={fetchingAccounts || mpesaAccounts.length === 0}
            >
              <option value="">{fetchingAccounts ? 'Loading accounts...' : 'Select M-Pesa account'}</option>
              {mpesaAccounts.map(account => (
                <option key={account._id} value={account._id}>
                  {account.AccountName} ({account.businessShortCode})
                </option>
              ))}
            </select>
            {errors.mpesaAccount && <span className="gf-error">{errors.mpesaAccount}</span>}
            <p className="gf-hint">Funds will be deposited to this account</p>
          </div>

          {/* Members Fields */}
          <div className="gf-form-group">
            <label className="gf-label">Group Members</label>
            {formData.members.map((member, index) => (
              <div key={index} className="gf-member-row">
                <div className="gf-member-inputs">
                  <input
                    type="email"
                    name="email"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, e)}
                    className={`gf-input gf-member-email ${errors[`memberEmail_${index}`] ? 'gf-input-error' : ''}`}
                    placeholder="Member email (required)"
                  />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={member.phoneNumber}
                    onChange={(e) => handleMemberChange(index, e)}
                    className="gf-input gf-member-phone"
                    placeholder="Phone number (optional)"
                  />
                  {formData.members.length > 1 && (
                    <button
                      type="button"
                      className="gf-remove-member"
                      onClick={() => removeMember(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
                {errors[`memberEmail_${index}`] && (
                  <span className="gf-error">{errors[`memberEmail_${index}`]}</span>
                )}
              </div>
            ))}
            <button
              type="button"
              className="gf-add-member"
              onClick={addMember}
            >
              + Add Another Member
            </button>
          </div>

          {/* Submit Button */}
          <div className="gf-form-group">
            <button
              type="submit"
              className="gf-button gf-button-primary"
              disabled={loading || mpesaAccounts.length === 0}
            >
              {loading ? (
                <span className="gf-spinner"></span>
              ) : mpesaAccounts.length === 0 ? (
                "Add M-Pesa Account to Continue"
              ) : (
                "Create Group Campaign"
              )}
            </button>
            {mpesaAccounts.length === 0 && !fetchingAccounts && (
              <button
                type="button"
                className="gf-link-button"
                onClick={() => navigate('/settings/payment-methods')}
              >
                Add M-Pesa Account
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupRegistrationForm;