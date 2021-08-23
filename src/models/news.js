const mongoose = require('mongoose')

const newsSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    avatar:{
        type:Buffer  
    }

})

const news = mongoose.model('news',newsSchema)
module.exports = news