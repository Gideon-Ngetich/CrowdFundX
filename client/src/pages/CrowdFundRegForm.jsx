import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import '../assets/CrowdFundingForm.css'; // We'll create this CSS file

const CrowdFundingRegistration = () => {
  const [formData, setFormData] = useState({
    campaignTitle: '',
    description: '',
    targetAmount: '',
    deadLine: '',
    mpesaAccount: ''
  });
  const [mpesaAccounts, setMpesaAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem('code');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMpesaAccounts = async () => {
      if (!userId) return;
      
      try {
        setFetchingAccounts(true);
        const response = await axios.get(
          `${import.meta.env.VITE_DEV_ENDPOINT}/api/getmpesadetails?id=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data?.success) {
          setMpesaAccounts(response.data.mpesaAccounts || []);
          if (response.data.mpesaAccounts.length === 1) {
            setFormData(prev => ({ ...prev, mpesaAccount: response.data.mpesaAccounts[0]._id }));
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (e) => {
    setFormData(prev => ({ ...prev, mpesaAccount: e.target.value }));
    if (errors.mpesaAccount) {
      setErrors(prev => ({ ...prev, mpesaAccount: null }));
    }
  };

  const validateAmount = (value) => {
    const numValue = Number(value.replace(/\D/g, ''));
    if (isNaN(numValue)) return false;
    return numValue >= 1000; // Minimum KSH 1,000
  };

  const formatCurrency = (value) => {
    const num = value.replace(/\D/g, '');
    if (!num) return '';
    return `KSH ${parseInt(num, 10).toLocaleString('en-KE')}`;
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formattedValue = formatCurrency(rawValue);
    setFormData(prev => ({ ...prev, targetAmount: formattedValue }));
    
    // Validate minimum amount
    if (rawValue && !validateAmount(rawValue)) {
      setErrors(prev => ({ ...prev, targetAmount: 'Minimum amount is KSH 1,000' }));
    } else if (errors.targetAmount) {
      setErrors(prev => ({ ...prev, targetAmount: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.campaignTitle) newErrors.campaignTitle = 'Campaign title is required';
    else if (formData.campaignTitle.length > 100) newErrors.campaignTitle = 'Title cannot exceed 100 characters';
    
    if (!formData.description) newErrors.description = 'Description is required';
    else if (formData.description.length < 50) newErrors.description = 'Description should be at least 50 characters';
    else if (formData.description.length > 2000) newErrors.description = 'Description cannot exceed 2000 characters';
    
    if (!formData.targetAmount) newErrors.targetAmount = 'Target amount is required';
    else if (!validateAmount(formData.targetAmount)) newErrors.targetAmount = 'Minimum amount is KSH 1,000';
    
    if (!formData.deadLine) newErrors.deadLine = 'Deadline is required';
    else if (dayjs(formData.deadLine).isBefore(dayjs().add(7, 'day'))) newErrors.deadLine = 'Deadline must be at least 7 days from now';
    
    if (!formData.mpesaAccount) newErrors.mpesaAccount = 'M-Pesa account is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      const numericAmount = Number(formData.targetAmount.replace(/\D/g, ''));
      
      const response = await axios.post(
        `${import.meta.env.VITE_DEV_ENDPOINT}/api/crowdfunding`,
        {
          ...formData,
          userId,
          targetAmount: numericAmount,
          deadLine: dayjs(formData.deadLine).toDate()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        navigate(`/dashboard`);
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
    <div className="cf-container">
      <div className="cf-card">
        <h2 className="cf-title">Create New Crowdfunding Campaign</h2>
        
        {submitError && (
          <div className="cf-alert cf-alert-error">
            <span className="cf-alert-icon">!</span>
            <div>
              <h4>Error</h4>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="cf-form">
          <div className="cf-form-group">
            <label className="cf-label">Campaign Title</label>
            <input
              type="text"
              name="campaignTitle"
              value={formData.campaignTitle}
              onChange={handleChange}
              className={`cf-input ${errors.campaignTitle ? 'cf-input-error' : ''}`}
              placeholder="Enter your campaign title"
            />
            {errors.campaignTitle && <span className="cf-error">{errors.campaignTitle}</span>}
          </div>

          <div className="cf-form-group">
            <label className="cf-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`cf-textarea ${errors.description ? 'cf-input-error' : ''}`}
              rows={6}
              placeholder="Explain your campaign's purpose and goals..."
            />
            {errors.description && <span className="cf-error">{errors.description}</span>}
          </div>

          <div className="cf-form-group">
            <label className="cf-label">Target Amount (KSH)</label>
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
              className={`cf-input ${errors.targetAmount ? 'cf-input-error' : ''}`}
              placeholder="Enter target amount (min KSH 1,000)"
            />
            {errors.targetAmount && <span className="cf-error">{errors.targetAmount}</span>}
          </div>

          <div className="cf-form-group">
            <label className="cf-label">Campaign Deadline</label>
            <input
              type="date"
              name="deadLine"
              value={formData.deadLine}
              onChange={handleChange}
              min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
              className={`cf-input ${errors.deadLine ? 'cf-input-error' : ''}`}
            />
            {errors.deadLine && <span className="cf-error">{errors.deadLine}</span>}
          </div>

          <div className="cf-form-group">
            <label className="cf-label">M-Pesa Account for Receiving Funds</label>
            <select
              value={formData.mpesaAccount}
              onChange={handleSelectChange}
              className={`cf-select ${errors.mpesaAccount ? 'cf-input-error' : ''}`}
              disabled={fetchingAccounts || mpesaAccounts.length === 0}
            >
              <option value="">{fetchingAccounts ? 'Loading accounts...' : 'Select M-Pesa account'}</option>
              {mpesaAccounts.map(account => (
                <option key={account._id} value={account._id}>
                  {account.AccountName} ({account.businessShortCode})
                </option>
              ))}
            </select>
            {errors.mpesaAccount && <span className="cf-error">{errors.mpesaAccount}</span>}
            <p className="text-sm py-2 text-blue-500"><Link to={'/accountregistration'}>Add Mpesa Account</Link></p>
          </div>

          <div className="cf-form-group">
            <button
              type="submit"
              className="cf-button cf-button-primary"
              disabled={loading || mpesaAccounts.length === 0}
            >
              {loading ? (
                <span className="cf-spinner"></span>
              ) : mpesaAccounts.length === 0 ? (
                "Add M-Pesa Account to Continue"
              ) : (
                "Launch Campaign"
              )}
            </button>
            {mpesaAccounts.length === 0 && !fetchingAccounts && (
              <button
                type="button"
                className="cf-link-button"
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

export default CrowdFundingRegistration;