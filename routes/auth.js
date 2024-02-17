const bcrypt = require("bcrypt");
const Users = require("../models/User");
var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken")
const {body, validationResult} = require("express-validator");
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "P0WER";

router.post("/signUp", [
    //this is to check that the fields should not be left empty and if they are valid
    body('username', 'Enter a valid userame').isLength({min: 3}),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({min: 5})
], async (req, res) => {
    //If there are errors, return the error and print the message
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    try{
    
    //This is to check whether the user has a unique email
    let user = await Users.findOne({email: req.body.email});
    if(user){
        return res.status(400).json({error: 'This email already exists'})
    }
    //This is to provide the user details
    user = await Users.create({
        username: req.body.username,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 5),        
    })
    res.json(user);

    }
    catch(error){
        console.error(error);
    }
});

router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
  ], async (req, res) => {
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password } = req.body;
    try {
      let user = await Users.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Please try to login with correct credentials" });
      }
  
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Please try to login with correct credentials" });
      }
  
      const data = {
        user: {
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({authtoken })
  
    } catch (error) {
      console.error(error);
    }
  
  
  });


  router.post('/fetchuser', fetchuser,  async (req, res) => {

    try {
      userId = req.user.id;
      const user = await Users.findById(userId).select("-password")
      res.send(user)
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  });

  router.put('/updateuser/:id', fetchuser, async (req, res) => {
    const { username, password } = req.body;
    try {
        // Create a newUser object
        const newUser = {};
        if (username && username.length >= 3) { newUser.username = username };
        if (password) {
            if (password.length < 5) {
                return res.status(400).json({ error: "Password should be at least 5 characters long" });
            }
            newUser.password = await bcrypt.hash(password, 5);
        }

        // Find the user to be updated and update it
        let user = await Users.findById(req.params.id);
        if (!user) { return res.status(404).send("User Not Found") }

        // Perform other checks as needed...

        user = await Users.findByIdAndUpdate(req.params.id, { $set: newUser }, { new: true })
        res.json({ user });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


router.delete('/deleteuser/:id', fetchuser, async (req, res) => {
  try {
      // Find the note to be delete and delete it
      let user = await Users.findById(req.params.id);
      if (!user) { return res.status(404).send("Not Found") }

      // Allow deletion only if user owns this Note
      if (user._id.toString() !== req.user.id) {
          return res.status(401).send("Not Allowed");
      }

      user = await Users.findByIdAndDelete(req.params.id)
      res.json({ "Success": "User has been deleted", user: user });
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
  }
})


module.exports = router