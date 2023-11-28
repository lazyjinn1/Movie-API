//this has to be the same key used in the JWTStrategy
const jwtSecret = 'your_jwt_secret'; 
const jwt = require('jsonwebtoken');
const passport = require('passport');
//the local passport file.
require('./passport'); 

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        //This is the username you are encoding in the JWT
        subject: user.Username, 
        //This specifies that the token will expire in 7 days.
        expiresIn: '7d',
        //This is the algorithm used to 'sign' or encode the values of the JWT 
        algorithm: 'HS256' 
    });
}

// POST Login
    
module.exports = (router) => {
    router.post('/login', (request, response) => {
        // this tries to either give or deny authentication to user
        passport.authenticate('local', { session: false }, (error, user, info) => {
            // if there is an error or user is not found, this is what is sent:
            if (error || !user) {
                return response.status(400).json({
                    message: 'Something is not right.',
                    user: user,
                    info: info
                });
            }
            // if the user exists and there is not currently a session going, then this goes through
            request.login(user, { session: false }, (error) => {
                // if an error occurs then this triggers
                if (error) {
                    response.send(error);
                }
                // this generates the key that allows the user to enter privated endpoints
                let token = generateJWTToken(user.toJSON());
                return response.json({user, token}); 
            });
        }) (request, response);
    });
}


