// defining express to a variable. Express is used as a way to make writing node easier
const { error } = require('console');
const express = require('express');
const mongoose = require('mongoose');
const Models = require('./models.js');
const { Movie } = require('./models');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:3000/test', { 
    useNewURLParser: true, 
    useUnifiedTopology:true
});

bodyParser = require('body-parser');
//uuid = require('uuid');


// defining morgan. morgan allows you to have an easier time in handling logging
//morgan = require('morgan');

// defining fs. fs is the file system and has access to your computer's files
//fs = require('fs'),

// defining path. path is the last part of the url
path = require('path');

// defining a variable app as express's many functions
const app = express();

// creating an empty log stream  @ __dirname/txt.log
//__dirname = directory name. In this case movie_api cus thats where index is //txt.log is a new file
//flags: 'a' APPENDS/creates that txt log in that path (directory name);
//const accessLogStream = fs.createWriteStream(path.join(__dirname, 'txt.log'), {flags: 'a'})

// accessing morgan's 'combined' preset and logging what it finds directly into the previously created file
//app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.json());

//requests the time whenever it is called
// let timeKeeper = (request,response,next) =>{
//     request.timeKeeper = Date.now();
//     //next() opens up the next middleware
//     next();
// };

//activates timeKeeper
// app.use(timeKeeper);
//activates morgan's ('common') preset
// app.use(morgan('common'));
// opens up static files in the public folder 
app.use(express.static('public'));

// default page with no path brings you to documentation
app.get('/', (request, response) => {
    response.sendFile('public/documentation.html', {root: __dirname});
});

// if user loads into /movies, this returns the topTenMovies array in JSON
// Request: See all movies
app.get('/movies',async (request, response) => {
    await Movies.find()
        .then ((movies)=>{
            response.status(201).json(movies);
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
});

// Request: See specific movie details
app.get('/movies/title/:title', async (request, response) => {
    await Movies.findOne({Title: request.params.title})
        .then((movies)=> {
            response.status(201).json(movies);
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
})

// Request: See movies by genre
app.get('/movies/genre/:genre', async (request, response) =>{
    await Movies.findOne({'Genre.Name': request.params.genre})
        .then((movie) => {
            response.json(movie);
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        })
})

// Request: See movies by director
app.get('/movies/director/:director', async (request, response) =>{
    await Movies.findOne({'Director.Name': request.params.director})
        .then((movie) => {
            response.json(movie);
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        })
})

// Request: Registration
app.post('/account/user-info/register', async (request, response) => {
    await Users.findOne({Username: request.body.Username})
        .then((user)=> {
            if (user) {
                return response.status(400).send(request.body.Username + ' already exists');
            } else {
                Users.create({
                    Username: request.body.Username,
                    Password: request.body.Password,
                    Email: request.body.Email,
                    Birthday: request.body.Birthday
                })
                    .then ((user) => {
                        response.status(200).send(user + ' has been successfully registered!');
                    })
                .catch((error) => {
                    console.error(error);
                    response.status(500).send('Error: ' + error);
                })
            }     
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
});

app.get('/users',async (request, response) => {
    await Users.find()
        .then ((users)=>{
            response.status(201).json(users);
        })
        .catch((error) => {
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
});

app.get('/users/:Username', async (request, response) => {
    await Users.findOne({Username: request.params.Username})
        .then ((user) => {
            response.json(user);
        })
        .catch ((error)=>{
            console.error(error);
            response.status(500).send('Error: ' + error);
        });
}); 

app.put('/users/:Username', async (request, response) => {
    await UsersfindOneAndUpdate(
        { 
        Username: request.params.Username
        }, 
        {
        $set:{
            Username: request.body.Username,
            Password: request.body.Password,
            Email: request.body.Email,
            Birthday: request.body.Birthday
        }
    },
    { 
        new: true 
    })
    .then((updatedUser) => {
        response.json(updatedUser);
    })
    .catch((error) => {
        console.error(error);
        response.status(500).send('Error: ' + error);
    });
});

app.delete('/users/:Username', async (request, response) => {
    await Users.findOneAndRemove({ Username: request.params.Username })
      .then((user) => {
        if (!user) {
            response.status(400).send(request.params.Username + ' was not found');
        } else {
            response.status(200).send(request.params.Username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(error);
        response.status(500).send('Error: ' + error);
      });
  });

// Request: Add movie to favorites
// app.put('/movies/favorites/:addFav', async (request, response) => {

// })


// // Request: Remove movie from favorites
// app.delete('/movies/favorites/:removeFav', async (request, response) => {
// });

// error logger just in case something wrong happens
app.use((error, request, response, next) => {
    console.error(error.stack);
    console.log('Whoops, something broke');
    response.status(500).send('Something Broke Oh no!');
})

//default port
app.listen(3000, () => {
    console.log('You are listening on port 3000');
});