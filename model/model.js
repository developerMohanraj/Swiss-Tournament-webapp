var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema(
{
    firstName       : {type: String, required: true},
    lastName        : {type: String, required: true},
    email           : {type: String, unique : true, required : true, dropDups: true},
    password        : {type: String, required : true},
    address         : {type: String,required : true,},
    mobile          : {type: Number,required : true,},
    role            : {type:String,required : true,},
    tournament      : [{type: Schema.Types.ObjectId, ref: 'Tournament' }]
});

var playerSchema = new Schema({

    name           : {type:String }
});

var matchSchema = new Schema(
{
    player_one     : playerSchema,
    player_two     : playerSchema,
    round          : {type: Number,required: true,default:0},
    winner         : playerSchema,
    loser          : playerSchema
});

var tournamentSchema = new Schema(
{
    tournament_name: {type:String },
    tour_owner     : {type: Schema.Types.ObjectId,required: true,ref:'User'},
    players        : [playerSchema],
    matches        : [matchSchema],
    status         : {type:String , default:"NOTSTARTED"}
});

var Tournament=mongoose.model('Tournament',tournamentSchema);
var User=mongoose.model('User',userSchema);
module.exports= {
    User  :User,
    Tournament:Tournament
}
