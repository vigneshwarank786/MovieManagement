const movies = require('../data/movies.json');

const Movie = require('../models/movieModel'); // Replace 'movieModel' with your Movie model import
const dotenv = require('dotenv');
const connectDatabase = require('../config/database');

dotenv.config({ path: 'config/config.env' });
connectDatabase();

const seedMovies = async () => {
  try {
    await Movie.deleteMany();
    console.log('Movies deleted!');
    await Movie.insertMany(movies);
    console.log('All movies added!');
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};

seedMovies();
