const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter movie title"],
    unique: true,
  },
  director: {
    type: String,
    required: [true, "Please enter director name"],
  },
  description: {
    type: String,
    required: [true, "Please enter discription"],
  },
  releaseDate: {
    type: Date,
    required: [true, "Please enter releasedate"],
  },
  genre: [{
    type: String,
    enum: ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Horror', 'Romance', 'Other'],
  }],
  duration: {
    type: Number,
    required: [true, "Please enter duration"],
  },
  cast: [{
    actorName: {
      type: String,
      required: [true, "Please enter actorname"],
    },
    characterName: String,
  }],
  poster: String,
  trailer: String,
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  fullMovie: {
    type: String,
    select: false, 
},
  category: {
    type: String,
    required: [true, "Please enter product category"],
    enum: {
      values: [
        "Movies",
        "TV Shows",
        "Documentaries",
        "Anime",
        "Reality TV",
        "Kids & Family",
        "Stand-Up Comedy"
      ],
      message: "Please select correct category",
    },
  },
  language: {
    type: String,
    required: [true, "Please enter movie language"],
},
  country: {
    type: String,
    required: [true, "Please enter country"],
  },
  productionCompany: {
    type: String,
    required: [true, "Please enter production company"],
  },
  awards: {
    type: String,
  },
}, { timestamps: true });

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
