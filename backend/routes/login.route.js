const router = require('express').Router()
const { User } = require('../models/user.model')
const bcryptjs = require('bcryptjs')

router.post('/', async (req, res) => {
    const { email, password } = req.body

    try{
        const user = await User.findOne({email})

        if(!user) {
            return res.status(404).json({message: "User not found"})
        }

        const validatePassword = await bcryptjs.compare(password, user.password)

        if(!validatePassword) {
            return res.status(400).json({message: 'Wrong email or password'})
        }

        res.status(200).json({message: 'Login successful'})
    } catch (err) { 
        res.status(500).json({message: 'Internal server error'})
    }
})

module.exports = router;