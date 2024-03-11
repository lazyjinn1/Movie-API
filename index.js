const express = require("express");
const mongoose = require("mongoose");
const Models = require("./models.js");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

// Defining an instance of express application
const app = express();

// Middleware for parsing request bodies as JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// list of origins that are allowed by CORS
let allowedOrigins = [
    'http://localhost:1234',
    'http://localhost:8080',
    'http://localhost:4200',
    'http://localhost:4200/',
    'https://jeriflix.netlify.app',
    'https://main--jeriflix.netlify.app',
    'https://jeriflix.netlify.com',
    'https://jeriflix.onrender.com/login',
    'https://jeriflix.onrender.com',
    'https://lazyjinn1.github.io/Jeriflix-Angular-client/welcome',
    'https://lazyjinn1.github.io/Jeriflix-Angular-client/movies',
    'https://lazyjinn1.github.io/Jeriflix-Angular-client',
    'https://lazyjinn1.github.io'
];

// Middleware for CORS configuration
app.use(cors({
    // Checks if the origin is allowed and responds accordingly
    origin: (origin, callback) => {
        // If no origin is provided, proceed
        if (!origin) return callback(null, true);
        // If the origin is not found in the allowedOrigins array, return an error
        if (allowedOrigins.indexOf(origin) === -1) {
            let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        // If the origin is found in the allowedOrigins array, proceed
        return callback(null, true);
    },
    credentials: true
}));

// Express-validator
const { check, validationResult } = require('express-validator');

// Importing authentication middleware
let auth = require('./auth.js')(app);

// Importing passport authentication middleware
const passport = require('passport');
require('./passport');

// Middleware to serve static files from the 'public' folder
app.use(express.static('public'));

const port = 8080;

// Define Movies and Users variables based on models from models.js
const Movies = Models.Movie;
const Users = Models.User;

// Connect to MongoDB Atlas
mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Default page with no path redirects to documentation
app.get('/', (request, response) => {
    response.sendFile('public/documentation.html', { root: __dirname });
});

// Endpoint to get all movies
/**
 * Request: See all movies
 * Authorization: JWT token required
 */
app.get('/movies', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        await Movies.find()
            // Respond with list of movies in JSON format
            .then((movies) => {
                response.status(200).json(movies);
            })
            // Respond with error if movies are not found
            .catch((error) => {
                console.error(error);
                response.status(404).send('Error: ' + error.message);
            });
    });

// Endpoint to get specific movie details by title
/**
 * Request: See specific movie details
 * Authorization: JWT token required
 * @param {string} title - Title of the movie
 */
app.get('/movies/:title', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        await Movies.findOne({ Title: request.params.title })
            // Respond with the movie details if found
            .then((movies) => {
                response.status(200).json(movies);
            })
            // Respond with error if movie is not found
            .catch((error) => {
                console.error(error);
                response.status(404).send('Error: ' + error.message);
            });
    })

// Endpoint to get movies by genre
/**
 * Request: See movies by genre
 * Authorization: JWT token required
 * @param {string} genre - Genre of the movies
 */
app.get('/movies/genres/:genre', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        await Movies.find({ 'Genre.Name': request.params.genre })
            // Respond with movies filtered by genre
            .then((movie) => {
                response.json(movie);
            })
            // Respond with error if movies are not found
            .catch((error) => {
                console.error(error);
                response.status(404).send('Error: ' + error.message);
            })
    })

// Endpoint to get movies by director
/**
 * Request: See movies by director
 * Authorization: JWT token required
 * @param {string} director - Name of the director
 */
app.get('/movies/directors/:director', passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        await Movies.find({ 'Director.Name': request.params.director })
            // Respond with movies filtered by director
            .then((movie) => {
                response.json(movie);
            })
            // Respond with error if movies are not found
            .catch((error) => {
                console.error(error);
                response.status(404).send('Error: ' + error.message);
            })
    })

/**
 * Handles user registration.
 * @param {Object} request - The HTTP request object.
 * @param {Object} response - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when registration is complete.
 */
app.post('/users',
    [
        check('Username', 'Username is too short').isLength({ min: 5 }),
        check('Username', 'Non-alphanumeric Usernames are not allowed').isAlphanumeric(),
        check('Password', 'Password cannot be empty').not().isEmpty(),
        check('Email', 'Email is invalid').isEmail()
    ], async (request, response) => {
        try {
            const errors = validationResult(request);
            const existingUser = await Users.findOne({ Username: request.body.Username });
            const hashedPassword = await Users.hashPassword(request.body.Password);
            if (!errors.isEmpty()) {
                return response.status(422).json({ errors: errors.array() });
            }

            if (existingUser) {
                return response.status(400).send(request.body.Username + ' already exists');
            } else {
                await Users.create({
                    Username: request.body.Username,
                    Password: hashedPassword,
                    Email: request.body.Email,
                    Birthday: request.body.Birthday,
                    ProfilePicture: request.body.ProfilePicture
                });
                response.status(201).send(request.body.Username + ' has been successfully registered!');
            }
        } catch (error) {
            console.error(error);
            response.status(500).send('Error: ' + error.message);
        }
    }
);


/**
 * Retrieves all users.
 * @param {Object} request - The HTTP request object.
 * @param {Object} response - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when user retrieval is complete.
 */
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

/**
 * Retrieves a specific user by username.
 * @param {Object} request - The HTTP request object.
 * @param {Object} response - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when user retrieval is complete.
 */
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

/**
 * Updates account information for a user.
 * @param {Object} request - The HTTP request object.
 * @param {Object} response - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the account information is updated.
 */
app.put('/users/:username',
    [
        check('Username', 'Username is too short').isLength({ min: 5 }).optional({ checkFalsy: true }),
        check('Username', 'Non-alphanumeric Usernames are not allowed').isAlphanumeric().optional({ checkFalsy: true }),
        check('Email', 'Email is invalid').isEmail().optional({ checkFalsy: true }),
        check('Birthday', 'Birthday is invalid').isDate().optional({ checkFalsy: true }),
    ],
    passport.authenticate('jwt', { session: false }),
    async (request, response) => {
        try {
            const errors = validationResult(request.body);
            if (!errors.isEmpty()) {
                return response.status(422).json({ errors: errors.array() });
            }

            if (request.user.Username !== request.params.username) {
                return response.status(401).send('Permission denied');
            }

            if (
                !request.body.Username &&
                !request.body.Email &&
                !request.body.Birthday &&
                !request.body.ProfilePicture &&
                !request.body.Bio &&
                !request.body.Password
            ) {
                return response.status(400).json({ message: 'No updates provided' });
            }

            // Check if the request body includes a new password.
            if (request.body.Password) {
                // If a new password is provided, hash it.
                const hashedPassword = await Users.hashPassword(request.body.Password);

                // Update the user's password with the new hashed password.
                const updatedUser = await Users.findOneAndUpdate({ Username: request.params.username }, {
                    $set: {
                        Password: hashedPassword,
                    }
                },
                    { new: true });
                return response.json(updatedUser);
            }

            // Update other user information
            const updateFields = {};
            if (request.body.Username) updateFields.Username = request.body.Username;
            if (request.body.Email) updateFields.Email = request.body.Email;
            if (request.body.Birthday) updateFields.Birthday = request.body.Birthday;
            if (request.body.ProfilePicture) updateFields.ProfilePicture = request.body.ProfilePicture;
            if (request.body.Bio) updateFields.Bio = request.body.Bio;

            const updatedUser = await Users.findOneAndUpdate({ Username: request.params.username }, {
                $set: updateFields
            },
                { new: true });

            response.json(updatedUser);

        } catch (error) {
            console.error(error);
            response.status(500).send('Error: ' + error.message);
        }
    });


/**
 * Deletes a specific user.
 * @param {Object} request - The HTTP request object.
 * @param {Object} response - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the user is deleted.
 */
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

/**
 * Adds a movie to the user's favorites list.
 * @param {Object} request - The HTTP request object.
 * @param {Object} response - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the movie is added to favorites.
 */
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

/**
 * Removes a movie from the user's favorites list.
 * @param {Object} request - The HTTP request object.
 * @param {Object} response - The HTTP response object.
 * @returns {Promise<void>} - A promise that resolves when the movie is removed from favorites.
 */
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

// Error logger middleware
app.use((error, request, response, next) => {
    console.error(error.stack);
    console.log('Whoops, something broke');
    response.status(500).json({ error: 'Something Broke Oh no!', message: error.message });
});

// Default port
app.listen(port, '0.0.0.0', () => {
    console.log(`You are listening on port ` + `${port}`)
});