var mongoose = require('mongoose'),
  crypto = require('crypto'),

  Schema = mongoose.Schema,

  User = new Schema({
    githubId: {
      type: Number,
      unique: true
    },
    nickname: {
      type: String,
      unique: true,
      required: true
    },
    avatar_url: {
      type: String
    }
  });

/*User.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512).toString('hex');
};*/

User.virtual('userId')
.get(function () {
  return this._id;
});

/*User.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = crypto.randomBytes(32).toString('hex');
            //more secure - this.salt = crypto.randomBytes(128).toString('hex');
            this.hashedPassword = this.encryptPassword(password);
        })
  .get(function() { return this._plainPassword; });


User.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};*/

module.exports = mongoose.model('User', User);
