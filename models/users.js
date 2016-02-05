var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL);

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
    
var stringField = {
        type: String, 
        minlength: 1,
        maxlength: 50
}

var UserSchema = new Schema({
    email: {
        type:String,
        minlength: 1,
        maxlength: 50,
        lowercase: true
    },
    name: stringField,
    hashed_password: stringField
});

// assign a function to the "methods" object of our UserSchema
UserSchema.statics.count = function (cb) {
  return this.model('Users').find({}, cb);
}
module.exports = mongoose.model('Users', UserSchema);