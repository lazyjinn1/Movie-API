const express = require("express"),
    mongoose = require("mongoose"),
    Models = require("./models.js"),
    bodyParser = require("body-parser"),
    path = require("path"),
    cors = require("cors");
// defining a variable app as express's many functions
const app = express();

// uses body Parser, which allows you to read from the body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// defines express-validator and what we're using from it.
const { check, validationResult } = require('express-validator');

// importing the auth.js file.
let auth = require('./auth.js')(app);

//importing the passport.js file.
const passport = require('passport');
require('./passport');

// If you want to connect locally:
const port = 8080;

// defines a Movies variable that relates to each movie in the Models' Movie Schema.
const Movies = Models.Movie;

// defines a USers variable that relates to each user in the Models' User Schema.
const Users = Models.User;

// connects our server to the MongoDB Database LOCALLY
// mongoose.connect('http://localhost:12017', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

//connects our server to the MongoDB Database ON ATLAS
mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// list of origins that are allowed by CORS
let allowedOrigins = ['http://localhost:1234', 'http://testsite.com', 'http://localhost:8080', 'https://jeriflix.onrender.com'];

// launches CORS
app.use(cors({
    // this looks for what the origin is and the appropriate response
    origin: (origin, callback) => {
        // if there is NO origin, then it goes through
        if (!origin) return callback(null, true);
        // if the origin exists but does NOT match an origin in the allowedOrigins array, then this error happens
        if (allowedOrigins.indexOf(origin) === -1) {
            let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        // if it does match an origin in the allowedOrigins array, then it goes through.
        return callback(null, true);
    }
}));

// activates the ability to use public folders using express
app.use(express.static('public'));

// default page with no path brings you to documentation
app.get('/', (request, response) => {
    response.sendFile('public/documentation.html', { root: __dirname });
});

// if user loads into /movies, this returns the movies in JSON
// Request: See all movies
app.get('/movies', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        await Movies.find()
            // if movies are found, it responds with a positive status code and a list of the 
            // movies written in Json
            .then((movies) => {
                response.status(200).json(movies);
            })
            // if movies are not found, sends back an error.
            .catch((error) => {
                console.error(error);
                response.status(404).send('Error: ' + error.message);
            });
    });

// Request: See specific movie details
app.get('/movies/:title', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        await Movies.findOne({ Title: request.params.title })
            // if a movie is found with the given title, said movie is returned.
            .then((movies) => {
                response.status(200).json(movies);
            })
            // if no movies are found, sends back an error.
            .catch((error) => {
                console.error(error);
                response.status(404).send('Error: ' + error.message);
            });
    })

// Request: See movies by genre
app.get('/movies/genres/:genre', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        await Movies.find({ 'Genre.Name': request.params.genre })
            // if movies are found with the given genre, said movies is returned.
            .then((movie) => {
                response.json(movie);
            })
            // if no movies are found, sends back an error.
            .catch((error) => {
                console.error(error);
                response.status(404).send('Error: ' + error.message);
            })
    })

// Request: See movies by director
app.get('/movies/directors/:director', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        await Movies.find({ 'Director.Name': request.params.director })
            // if movies are found with the given director, said movies is returned.
            .then((movie) => {
                response.json(movie);
            })
            // if no movies are found, sends back an error.
            .catch((error) => {
                console.error(error);
                response.status(404).send('Error: ' + error.message);
            })
    })

// Request: Registration
app.post('/users',
    [
        check('Username', 'Username is too short').isLength({ min: 5 }),
        check('Username', 'Non-alphanumeric Usernames are not allowed').isAlphanumeric(),
        check('Password', 'Password cannot be empty').not().isEmpty(),
        check('Email', 'Email is invalid').isEmail()
    ], async (request, response) => {
        try {
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(422).json({ errors: errors.array() });
            }

            const existingUser = await Users.findOne({ Username: request.body.Username });
            if (existingUser) {
                return response.status(400).send(request.body.Username + ' already exists');
            }

            const hashedPassword = await Users.hashPassword(request.body.Password);
            await Users.create({
                Username: request.body.Username,
                Password: hashedPassword,
                Email: request.body.Email,
                Birthday: request.body.Birthday
            });

            response.status(201).send(request.body.Username + ' has been successfully registered!');
        } catch (error) {
            console.error(error);
            response.status(500).send('Error: ' + error.message);
        }
    }
);


//Request: See all users
app.get('/users', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        await Users.find()
            // if there are users to be found, this will bring you to all of them.
            .then((users) => {
                response.status(201).json(users);
            })
            // if there are none, an error is sent.
            .catch((error) => {
                console.error(error);
                response.status(404).send('Error: ' + error.message);
            });
    });

// Request: See specific users
app.get('/users/:username', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        await Users.findOne({ Username: request.params.username })
            // If this username exist in the database, this returns their info.
            .then((user) => {
                response.json(user);
            })
            // otherwise, an error is sent.
            .catch((error) => {
                console.error(error);
                response.status(404).send('Error: ' + error.message);
            });
    });

// Request: Change Account Information
app.put('/users/:username',
    [check('Username', 'Username is too short').isLength({ min: 5 }).optional({ checkFalsy: true }),
    check('Username', 'Non-alphanumeric Usernames are not allowed').isAlphanumeric().optional({ checkFalsy: true }),
    check('Email', 'Email is invalid').isEmail().optional({ checkFalsy: true }),
    check('Birthday', 'Birthday is invalid').isDate().optional({ checkFalsy: true }),
    ],
    passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        try {
            const hashedPassword = await Users.hashPassword(request.body.Password);
            const errors = validationResult(request);
            if (!errors.isEmpty()) {
                return response.status(422).json({ errors: errors.array() });
            }

            if (request.user.Username !== request.params.username) {
                return response.status(401).send('Permission denied');
            }

            // Check if the request body has something else.
            const updatedUser = await Users.findOneAndUpdate({ Username: request.params.username }, {
                $set: {
                    Username: request.body.Username,
                    Password: hashedPassword,
                    Email: request.body.Email,
                    Birthday: request.body.Birthday
                }
            },

                { new: true });

            response.json(updatedUser);
        } catch (error) {
            console.error(error);
            response.status(500).send('Error: ' + error.message);
        }
    });


// Request: Delete specific users
app.delete('/users/:username', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        // this looks to see if there are any people with this username AND deletes it.
        await Users.findOneAndRemove({ Username: request.params.username })
            .then((user) => {
                // if username is not found, then an error is sent.
                if (!user) {
                    response.status(404).send(request.params.username + ' was not found');
                } else {
                    // If username IS found, then the username and document is deleted.
                    response.status(204).send(request.params.username + ' was deleted.');
                }
            })
            .catch((error) => {
                console.error(error);
                response.status(500).send('Error: ' + error.message);
            });
    });

// Request: Add movie to favorites
app.put('/users/:username/favorites/:movieID', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        try {
            // defines user as someone in the Users database with the username stated in :username
            const user = await Users.findOne({ Username: request.params.username })
            // checks to see if the User is IN the database.
            if (!user) {
                return response.status(404).send('User not found.');
            }
            //defines movie as a movie with the movieID in :movieID
            const movie = await Movies.findOne({ _id: request.params.movieID })


            if (!movie) {
                response.status(404).send(movie.Title + ' was not found in the database.');
                // if movie does exist but is already in the user's Favorites list, then this error is sent.
            } else if (user.FavoriteMovies.includes(movie._id)) {
                response.status(400).send(movie.Title + ' is already in your Favorites.');
            } else {
                // otherwise, it all goes through and a new movie is added to Favorites.
                await Users.findOneAndUpdate({ Username: request.params.username }, {
                    $push: { FavoriteMovies: request.params.movieID }
                },
                    { new: true })
                // this saves the data.
                await user.save();
                response.status(201).json(movie.Title + ' has been added to Favorites.');

            }

        } catch (error) {
            console.error(error);
            response.status(500).send('Error: ' + error.message);
        }

    });

// Request: Remove movie from favorites
app.delete('/users/:username/favorites/:movieID', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        try {
            // defines user as someone in the Users database with the username stated in :username
            const user = await Users.findOne({ Username: request.params.username })
            // if user does not exist then an error will occur.
            if (!user) {
                return response.status(404).send('User not found.');
            }

            //defines movie as a movie with the movieID in :movieID
            const movie = await Movies.findOne({ _id: request.params.movieID })

            if (!movie) {
                response.status(404).send(movie.Title + ' was not found in the database.');
                // if this movie was not in your favorites, then this error occurs.
            } else if (!user.FavoriteMovies.includes(movie._id)) {
                response.status(404).send(movie.Title + ' was not found in your Favorites.');
            } else {
                // otherwise, this pulls the old movie id away and removes it from your Favorites List.
                await Users.findOneAndUpdate({ Username: request.params.username }, {
                    $pull: { FavoriteMovies: request.params.movieID }
                },
                    { new: true })
                // saves the data.
                await user.save();
                response.status(204).json(movie.Title + ' has been removed from Favorites.');

            }

        } catch (error) {
            console.error(error);
            response.status(500).send('Error: ' + error.message);
        }

    });

// error logger just in case something wrong happens
app.use((error, request, response, next) => {
    console.error(error.stack);
    console.log('Whoops, something broke');
    response.status(500).json({ error: 'Something Broke Oh no!', message: error.message });
});

//default port
app.listen(port, '0.0.0.0', () => {
    console.log(`You are listening on port ` + `${port}`)
});