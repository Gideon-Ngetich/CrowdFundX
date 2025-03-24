const router = require('express').Router();
const { User } = require('../models/user.model')
const bcrypt = require('bcryptjs')

router.post('/', async (req, res) => {
    try{
        const { firstName, lastName, email, password } = req.body
        console.log(firstName, lastName, email, password)

        const salt = await bcrypt.genSalt(10)
        const hashed_password = await bcrypt.hash(password, salt)

        const checkIfExist = await  User.findOne({"email": email})

        if(checkIfExist) {
            res.status(400).json({"message": "User exists"})
            return
        }

    const user = new User({
        firstName,
        lastName,
        email,
        password: hashed_password,
    })

    

    await user.save()

    res.status(201).json({"message": "User created successfully"})

    } catch (err) {
        console.error(err)
        res.status(500).json({"message": "Intenal sever error"})
    }
})

module.exports = router