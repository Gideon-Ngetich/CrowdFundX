const express = require('express');
const router = express.Router();
const {User} = require('../models/user.model');

// Get user info by ID
router.get('/userinfo', async (req, res) => {
    const { id } = req.query
    console.log(id)
  try {
    const user = await User.findById(id)    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
    console.log(user)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});

router.get('/userinfoemail', async (req, res) => {
  const { email } = req.query
  console.log(email)
try {
  const user = await User.findOne({"email": email})    
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json(user);
  console.log(user)
} catch (err) {
  console.log(err)
  res.status(500).json({ error: err.message });
}
});

module.exports = router;