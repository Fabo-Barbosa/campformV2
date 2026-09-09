if (process.env.NODE_ENV == "production") {
    module.exports = {mongoURI: "mongodb://fabio"};
}else {
    module.exports = {mongoURI: "mongodb://localhost/campform"};
}