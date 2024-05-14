
const express = require('express');
const cors = require('cors');
const data = require('./Movie Data/data.json');
const axios = require('axios').default;
require('dotenv').config();


const myApiKey = process.env.API_KEY;
const url = process.env.URL_PG;


const {Client} = require('pg');
let client = new Client(url);


const app = express();
app.use(cors());
app.use(express.json());

// Defining the port number for the server to listen on
const port = 3001;



client.connect().then(() => {

    // Starting the server to listen on the 3000 port
app.listen(port, () => {
    console.log(`the server is running on port: ${port}`);
});

});

//Create movie in the database (add)




// movie constructor
class Movie {
    constructor(title, poster_path, overview) {
        this.title = title;
        this.poster_path = poster_path;
        this.overview = overview;
    }
}

// movie constructor
class Movie2 {
    constructor(id, title, release_date, poster_path, overview) {
        this.id = id;
        this.title = title;
        this.release_date = release_date;
        this.poster_path = poster_path;
        this.overview = overview;
    }
}


//get
app.get('/', getMovieFromDummyData);
app.get('/getFavorite', getFavorite);
app.get('/trending', getTrendingMoviesFromTMDB);
app.get('/search', searchMovieByNameFromTMDB);
app.get('/nowPlayingMovies', getNowPlayingMoviesFromTMDB);
app.get('/topRatedMovies', getTopRatedMoviesFromTMDB);
app.get('/getMovies', getMoviesFromPostgreDB);
app.get('/getMovie/:id', getMovieByIdFromPostgreDB);

//post
app.post('/addMovie', addMovieToPostgreDB);

//put
app.put('/updateMovie/:id', updateMovieByIdInThePostgreDB);
app.put('/updatecomment/:id', updatecomment);

//delete
app.delete('/deleteMovie/:id', deleteMovieByIdFromThePostgreDB);
app.delete('/deleteFavorite/:id', deleteFavorite);









function addMovieToPostgreDB(req, res){

    let {id, title, release_date, poster_path, overview, comment} = req.body;

    //let id = generateId();

    let sqlQuery = 'INSERT INTO favoritelist(id, title, release_date, poster_path, overview, comment) VALUES($1, $2, $3, $4, $5, $6)';
    let values = [id, title, release_date, poster_path, overview, comment];

    client.query(sqlQuery, values).then( () => {

        res.send('Data was added successfully');

    }).catch((e) => {
        res.send(`Something went wrong, the error: ${e}`);
    });
    
}
//genete a random id when adding a movie to the database.
function generateId() {
    // Get current timestamp in milliseconds
    const timestamp = new Date().getTime();
    
    // Generate two random numbers between 0 and 99
    const randomNum1 = Math.floor(Math.random() * 100);
    const randomNum2 = Math.floor(Math.random() * 100);
    
    // Combine the random numbers and timestamp
    const combinedId = randomNum1.toString().padStart(2, '0') +
                      randomNum2.toString().padStart(2, '0') +
                      timestamp.toString().slice(-3);
    
    // Ensure the total length of the ID is 5 characters
    const id = combinedId.slice(0, 5);
    
    return id;
}

function getMoviesFromPostgreDB(req, res){

    
    let sqlQuery = 'SELECT * FROM moviesList';

    client.query(sqlQuery).then( (reslut) => {

        //console.log(reslut);

        res.json(reslut.rows);

    }).catch((e) => {
        res.send(`Something went wrong, the error: ${e}`);
    });
    
}

function getMovieFromDummyData(req, res){

    let result = new Movie(data.title, data.poster_path, data.overview);

    res.json(result);

}

function getFavorite(req, res){

    let sqlQuery = 'SELECT * FROM favoritelist';

    client.query(sqlQuery).then( (reslut) => {

        console.log(reslut);

        res.json(reslut.rows);

    }).catch((e) => {
        res.send(`Something went wrong, the error: ${e}`);
    });

}

function getTrendingMoviesFromTMDB(req, res){

    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${myApiKey}`;
    try{
        axios.get(url)
        .then(result => {
            let movies = result.data.results.map(movie => {
                return new Movie2(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
            });
            res.json(movies);
        })
        .catch((error) => {
            console.log(error);
           
        });
    }
    catch (error) {
        handleError500(error,req,res);
    }
 
}

function searchMovieByNameFromTMDB(req, res){

    let queryName = req.query.movieName;

    let url = `https://api.themoviedb.org/3/search/movie?api_key=${myApiKey}&language=en-US&query=${queryName}&page=2`;

    axios.get(url)
    .then(result => {

        let moviesResult = result.data.results.map(movie => {
            return new Movie2(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
        });
        res.json(moviesResult);

    })
    .catch(error => {
        console.log(error);
    });
}

function getNowPlayingMoviesFromTMDB(req, res){

    let url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${myApiKey}`;
    axios.get(url).then(reslut => {

        let nowPlayingMoviesResult = reslut.data.results.map((movie) => {
            return new Movie2(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
        });

        res.json(nowPlayingMoviesResult);

    })
    .catch(error =>{
    console.log(error)
});
}

function getTopRatedMoviesFromTMDB(req, res){

    let url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${myApiKey}`;
    axios.get(url).then(reslut => {

        let topRatedMoviesResult = reslut.data.results.map((movie) => {
            return new Movie2(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
        });

        res.json(topRatedMoviesResult);

    })
    .catch(error =>{
    console.log(error)
});
}

function getMovieByIdFromPostgreDB(req, res) {
    let movieId = req.params.id; 
    
    let sqlQuery = 'SELECT * FROM moviesList WHERE id = $1'; 

    client.query(sqlQuery, [movieId]).then((result) => {
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Movie not found' });
        } else {
            res.json(result.rows[0]); 
        }
    }).catch((e) => {
        res.status(500).send(`Something went wrong,${e}`);
    });
}

function updateMovieByIdInThePostgreDB(req, res){

    let movieId = req.params.id;

    //new data, you should send them with the body of the request.
    console.log(req.body);
    if(!req.body.title || !req.body.release_date || !req.body.overview){
        res.send('The body shouldn\'t be undefined, please enter the new data to update the movie');
    }
        
        let {title, release_date, overview} = req.body;
   
    let updateSQL = 'UPDATE moviesList SET title = $1, release_date = $2, overview = $3 WHERE id = $4';

    let values = [title, release_date, overview, movieId];

    client.query(updateSQL, values).then((result) => {

        if (result.rowCount === 0) {
            //movie not found
            res.status(404).json({ error: 'Movie not found' });
        } else {
            // successfully updated
            res.json({ message: 'Movie updated successfully' });
        }
    }).catch((e) => {
        // Error occurred while updating
        res.status(500).send(`Something went wrong, ${e}`);
    });

}


function updatecomment(req, res){

    let movieId = req.params.id;

    //new data, you should send them with the body of the request.
    if(!req.body.title || !req.body.release_date || !req.body.overview){
        res.send('The body shouldn\'t be undefined, please enter the new data to update the movie');
    }
        
        let comment = req.body.comment;
   
    let updateSQL = 'UPDATE favoritelist SET comment = $1 WHERE id = $2';

    let values = [comment, movieId];

    client.query(updateSQL, values).then((result) => {

        if (result.rowCount === 0) {
            //movie not found
            res.status(404).json({ error: 'Movie not found' });
        } else {
            // successfully updated
            res.json({ message: 'Movie updated successfully' });
        }
    }).catch((e) => {
        // Error occurred while updating
        res.status(500).send(`Something went wrong, ${e}`);
    });

}

function deleteMovieByIdFromThePostgreDB(req, res){

    let movieId = req.params.id;

    let sqlQuery = "DELETE FROM moviesList WHERE id = $1";

    client.query(sqlQuery,[movieId]).then((result) => {

        if (result.rowCount === 0) {
            // No rows were deleted, movie not found
            res.status(404).json({ error: 'Movie not found' });
        } else {
            // Movie successfully deleted
            res.json({ message: 'Movie deleted successfully' });
        }

    }).catch((e) => {
        // Error occurred while deleting the movie
        res.status(500).send(`Something went wrong, ${e}`);
    });

}

function deleteFavorite(req, res){

    let movieId = req.params.id;

    let sqlQuery = "DELETE FROM favoritelist WHERE id = $1";

    client.query(sqlQuery,[movieId]).then((result) => {

        if (result.rowCount === 0) {
            // No rows were deleted, movie not found
            res.status(404).json({ error: 'Movie not found' });
        } else {
            // Movie successfully deleted
            res.json({ message: 'Movie deleted successfully' });
        }

    }).catch((e) => {
        // Error occurred while deleting the movie
        res.status(500).send(`Something went wrong, ${e}`);
    });

}




//Handling 500 status code error
app.use((err, req, res, next) => {handleError500(err, req, res);});

//Handling 404 status code error (NOT Found)
app.use((req, res) => {handleError404(req, res);});


function handleError500(err,req,res){

    console.error(err.stack);

    res.status(500).json({
        "status": 500,
        "responseText": "Sorry, something went wrong"
    });

}

function handleError404(req,res){

    res.status(404).json({
        "status": 404,
        "responseText": "Sorry, rount not found"
    });
}