var UserSchema = new db.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

/**
 * Compare user's password with the provided one
 * @param password
 * @returns {boolean}
 */
UserSchema.methods.comparePassword = function(password) {
    var md5 = require('crypto-md5');
    return (md5(password) == this.password);
};

exports.User = db.model('User', UserSchema);