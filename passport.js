// constructs a key that allows the user to access files that may require one. 
// also restricts those without said key.
const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

// bringing User from Models.js and giving different middleware functions for JWTStrategy and ExtractJWT
let Users = Models.User;
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    // LocalStrategy looks for just Username and Password
    new LocalStrategy(
        {   
            Username: 'Username',
            Password: 'Password',
        },
        // this looks to see if said username is found in the database
        async (username, password, callback) => {
            console.log(`${username} ${password}`);
            await Users.findOne({Username: username})
                .then((user)=> {
                    if(!user){
                        console.log('Username not found');
                        return callback(null, false, {
                            message: 'Incorrect username or password.',
                        });
                    }

                    // validates if hashed password matches hashed password in database
                    if(!user.validatePassword(password)) {
                        console.log('Incorrect Password');
                        return callback(null, false, {
                            message: 'Incorrect username or password.'
                        });
                    }
                    console.log('finished');
                    return callback(null, user);
                })
            .catch((error) => {
                if(error){
                    console.log(error);
                    return callback(error);
                }
            })
        }
    )
);

// this is the key that is extracted in order to access restricted endpoints.
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret' 
}, async (jwtPayload, callback) => {
    try {
        const user = await Users.findById(jwtPayload._id);
        if (user) {
            return callback(null, user);
        } else {
            return callback(null, false, { message: 'User not found' });
        }
    } catch (error) {
        return callback(error);
    }
}));
