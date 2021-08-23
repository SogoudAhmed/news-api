const jwt = require('jsonwebtoken')
const reporter = require('../models/reporter')
const auth = async (req,res,next) =>{
    try{

        const token = req.header('Authorization').replace('Bearer ','')
        console.log(token)

        const decode = jwt.verify(token,'node-course')
        console.log(decode)

        const reporter = await reporter.findOne({_id:decode._id,'tokens.token':token})

        if(!reporter){
            console.log('No reporter is found')
            throw new Error()
        }
        req.reporters = reporter
        console.log(req.reporter)

        req.token = token
        next()
    }
    catch(e){
        res.status(401).send({error:'Please authenticate'})
    }

  
}

module.exports = auth