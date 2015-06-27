var mongoose = require('mongoose');

//mongoose.createConnection('mongodb://localhost/supfighter');
mongoose.connect('mongodb://localhost/supfighter');

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function (callback) {
    console.log('Connected to mongoose');
});

exports.mongoose = mongoose;
