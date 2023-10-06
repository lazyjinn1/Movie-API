// defining express to a variable. Express is used as a way to make writing node easier
const { error } = require('console');
const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid')

// defining morgan. morgan allows you to have an easier time in handling logging
morgan = require('morgan'),

// defining fs. fs is the file system and has access to your computer's files
fs = require('fs'),

// defining path. path is the last part of the url
path = require('path');

// defining a variable app as express's many functions
const app = express();

// creating an empty log stream  @ __dirname/txt.log
//__dirname = directory name. In this case movie_api cus thats where index is //txt.log is a new file
//flags: 'a' APPENDS/creates that txt log in that path (directory name);
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'txt.log'), {flags: 'a'})

// accessing morgan's 'combined' preset and logging what it finds directly into the previously created file
app.use(morgan('combined', {stream: accessLogStream}));

app.use(bodyParser.json());

//requests the time whenever it is called
let timeKeeper = (request,response,next) =>{
    request.timeKeeper = Date.now();
    //next() opens up the next middleware
    next();
};

//activates timeKeeper
app.use(timeKeeper);
//activates morgan's ('common') preset
app.use(morgan('common'));
// 4. opens up static files in the public folder 
app.use(express.static('public'));

//sample array for top ten movies
let topTenMovies = [
    {
        movieName: 'movie1',
        movieDirector: 'director1',
        movieGenre: 'genre1'
    },
    {
        movieName: 'movie2',
        movieDirector: 'director1',
        movieGenre: 'genre2'
    },
    {
        movieName: 'movie3',
        movieDirector: 'director1',
        movieGenre: 'genre5'
    },
    {
        movieName: 'movie4',
        movieDirector: 'director2',
        movieGenre: 'genre4'
    },
    {
        movieName: 'movie5',
        movieDirector: 'director2',
        movieGenre: 'genre1'
    },
    {
        movieName: 'movie6',
        movieDirector: 'director3',
        movieGenre: 'genre2'
    },
    {
        movieName: 'movie7',
        movieDirector: 'director4',
        movieGenre: 'genre1'
    },
    {
        movieName: 'movie8',
        movieDirector: 'director4',
        movieGenre: 'genre3'
    },
    {
        movieName: 'movie9',
        movieDirector: 'director4',
        movieGenre: 'genre4'
    },
    {
        movieName: 'movie10',
        movieDirector: 'director5',
        movieGenre: 'genre3'
    },
];

userList = [
    {
        userName: 'username1',
        passWord: 'password1',
        eMail: 'email1@gmail.com',
        accountStatus: 'Active',
        id: 1
    },
    {
        userName: 'username2',
        passWord: 'password2',
        eMail: 'email2@gmail.com',
        accountStatus: 'Active',
        id: 2
    },
    {
        userName: 'username3',
        passWord: 'password3',
        eMail: 'email3@gmail.com',
        accountStatus: 'Active',
        id: 3
    },
    {
        userName: 'username4',
        passWord: 'password4',
        eMail: 'email4@gmail.com',
        accountStatus: 'Active',
        id: 4
    },
    {
        userName: 'username5',
        passWord: 'password5',
        eMail: 'email5@gmail.com',
        accountStatus: 'Active',
        id: 5
    },
    
]

// default page with no path brings you to documentation
app.get('/', (request, response) => {
    response.sendFile('public/documentation.html', {root: __dirname});
});

// if user loads into /movies, this returns the topTenMovies array in JSON
// Request: See all movies
app.get('/movies', (request, response) => {
    response.json(topTenMovies);
});

// Request: See specific movie details
app.get('/movies/title/:title', (request, response) => {
    response.json(topTenMovies.find((movie) => {
        return movie.movieName === request.params.title
    }));
});

// Request: See movies by genre
app.get('/movies/genre/:genre', (request, response) =>{
    response.json(topTenMovies.filter((movie) => {
        return movie.movieGenre === request.params.genre
    }));
    response.status(200).send('Successfully filtered movies based on ' + request.params.genre + ".");
});

// Request: See movies by director
app.get('/movies/director/:director', (request, response) => {
    response.json(topTenMovies.filter((movie) => {
        return movie.movieDirector === request.params.director
    }));
    response.status(200).send('Successfully filtered movies based on ' + request.params.director + ".");
});

// Request: Registration
app.post('/account/user-info/register', (request, response) => {
    // let newUser = request.body;

    // if (!newUser.userName || !newUser.passWord || !newUser.eMail){
    //     let errorMessage = 'Error, invalid info';
    //     response.status('400').send(errorMessage);
    // } else{
    //     let successMessage = 'Congratulations, your account is now registered! \n Please enjoy our selection.'
    //     newUser.accountStatus === 'Active';
    //     newUser.id = uuid.v5();
    //     userList.push(newUser)
    //     response.status(200).send(successMessage);
    // }
    response.status(200).send('Successfully registered!');
});

// Request: Change username
app.put('/account/user-info/:user/:username', (request, response) => {
    // let user = userList.find((user) =>{
    //     return user.userName === request.params.user;
    // });
    
    // if (user){
    //     user.userName === request.params.username;
    //     response.status(200).send('Your username is now ' + request.params.username)
    // } else {
    //     let errorMessage = 'Error, invalid info';
    //     response.status('400').send(errorMessage);
    // }
    response.status(200).send('Successfully change username to: ' + request.params.user + '.');
})

// Request: Add movie to favorites
app.put('/movies/favorites/:addFav', (request, response) => {
    response.status(200).send('Successfully added ' + request.params.addFav + ' to favorites.');
});

// Request: Remove movie from favorites
app.delete('/movies/favorites/:removeFav', (request, response) => {
    response.status(200).send('Successfully removed ' + request.params.removeFav + ' from favorites.');
});

// Request: Delete Account
app.delete('/account/user-info/:user/deregister', (request, response) => {
    response.status(200).send('Successfully deleted ' + request.params.user + "'s account from the server.");
});

// error logger just in case something wrong happens
app.use((err, request, res, next) => {
    console.error(err.stack);
    console.log('Whoops, something broke');
    res.status(500).send('Something Broke Oh no!');
})

//default port
app.listen(8080, () => {
    console.log('You are listening on port 8080');
});