const catchAsyncError = require('../middlewares/catchAsyncError');
const Movie = require('../models/movieModel');
const ErrorHandler = require('../utils/errorHandler');
const APIFeatures = require('../utils/apiFeautures');


// Get all movies
exports.getMovies = catchAsyncError(async (req, res, next) => {
    const resPerPage = 12;

    let buildQuery = () => {
        return new APIFeatures(Movie.find(), req.query).search().filter();
    };

    let moviesCount;

    if (req.query.keyword && req.query.keyword.length > 0) {
        const searchQuery = buildQuery();
        moviesCount = await searchQuery.query.countDocuments(); // Count documents based on the search query
    } else {
        moviesCount = await Movie.countDocuments(); // Count all documents
    }

    let movies = await buildQuery().paginate(resPerPage).query;

   

    res.status(200).json({
        success: true,
        count: moviesCount,
        resPerPage,
        movies: movies,
    });
});


// Get a single movie by ID
exports.getMovieById = async (req, res, next) => {
    try {
        let movieQuery = Movie.findById(req.params.id);

        if (!movieQuery) {
            return next(new ErrorHandler('Movie not found', 404));
        }

        if (req.user) {
            movieQuery = movieQuery.select('+fullMovie');
        } else {
            movieQuery = movieQuery.select('-fullMovie');
        }

        const movie = await movieQuery.exec();

        if (!movie) {
            return next(new ErrorHandler('Movie not found', 404));
        }

        res.status(200).json({ success: true, data: movie });
    } catch (error) {
        return next(new ErrorHandler('Internal Server Error', 500));
    }
};


  

// Create a new movie
exports.createMovie = catchAsyncError(async (req, res, next) => {
  const movie = await Movie.create(req.body);
  res.status(201).json({ success: true, data: movie });
});

// Update a movie by ID
exports.updateMovie = catchAsyncError(async (req, res, next) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!movie) {
    return next(new ErrorHandler('Movie not found', 404));
  }
  res.status(200).json({ success: true, data: movie });
});

// Delete a movie by ID
exports.deleteMovie = catchAsyncError(async (req, res, next) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) {
    return next(new ErrorHandler('Movie not found', 404));
  }
  res.status(200).json({ success: true, data: {} });
});
