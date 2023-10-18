const jwtSecret = 'your_jwt_secret'; //this has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); //the local passport file.

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, //This is the username you are encoding in the JWT
        expiresIn: '7d', //This specifies that the token will expire in 7 days.
        algorithm: 'HS256' //This is the algorith used to 'sign' or encode the values of the JWT
    });
}

// POST Login
module.exports = (router) => {
    router.post('/login', (request, response) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return response.status(400).json({
                    message: 'Something is not right.',
                    user:user
                });
            }
            request.login(user, { session: false }, (error) => {
                if (error) {
                    response.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return response.json({user, token}); 
            });
        }) (request, response);
    });
}
