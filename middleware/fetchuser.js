var jwt = require('jsonwebtoken');
const JWT_SECRET = 'P0WER';

const fetchuser = (req, res, next) => {
    //Get the user from the jwt auth token assigned to him when he logs in and adds the id to the req object
    const token = req.header('authtoken');
    if(!token){
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }
    try{
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    }
    catch(error){
        console.error(error);
    }
}

module.exports = fetchuser;