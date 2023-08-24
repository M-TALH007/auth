var mongoose = require("mongoose");
const bcrypt = require("bcrypt");

var userSchema = mongoose.Schema({
username :{
    type : String,
    unique :  true,
    required : true
},

email :{
type : String,
unique :  [true,"email is already exist"],
required : true
} ,

password :{
type : String,
unique : true,
required : true
}

})

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });
  
  userSchema.methods.comparePassword = function (plainText) {
    return bcrypt.compareSync(plainText, this.password);
  };
var userModel = mongoose.model("user",userSchema);
module.exports= userModel;
