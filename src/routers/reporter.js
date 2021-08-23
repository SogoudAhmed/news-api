const express = require('express')
const router = new express.Router()
const Reporter = require('../models/reporter')
const auth = require('../middleware/auth')
const multer = require('multer')


router.post('/reporters', async (req, res) => {
        const reporterIn = new reporter(req.body)///////////
        try{
           await reporterIn.save()
           const token = await reporterIn.generateToken()
           res.status(200).send({reporterIn,token})
        }
        catch(e){
            res.status(400).send(e)
        }
     
})

router.post('/reporters/login',async(req,res)=>{
    try{
        const reporter = await Reporter.findByCredentials(req.body.email,req.body.password)
        const token = await reporter.generateToken()
        res.send({reporter,token})
    }
    catch(e){
        res.send('Try again ' + e)
    }
})

router.get('/reporters',auth, (req, res) => {
    Reporter.find({}).then((reporters) => {
        res.status(200).send(reporters)
    }).catch((e) => {
        res.status(500).send(e)
    })
})

router.get('/profile',auth,(req,res)=>{
    res.send(req.reporter)
})

router.get('/reporters/:id',auth, (req, res) => {
    console.log(req.params.id)

    const _id = req.params.id
    Reporter.findById(_id).then((reporter) => {
        if (!reporter) {
            return res.status(404).send('Unable to find reporter')
        }
        res.status(200).send(reporter)
    }).catch((e) => {
        res.status(500).send('Unable to connect to data base' + e)
    })
})
router.patch("/reporters/:id",auth, async (req, res) => {
    const updates = Object.keys(req.body)
    console.log(updates)
    const _id = req.params.id;
    try {
        const reporter = await Reporter.findById(_id)
        if (!reporter) {
            return res.send("No reporter is found");
        }
        updates.forEach((update) => reporter[update] = req.body[update])
        await reporter.save();

        res.status(200).send(reporter);
    } catch (e) {
        res.status(400).send('Error' + e);
    }
});

router.delete('/reporters/logout',auth,async(req,res)=>{
    try{
        req.reporter.tokens = req.reporter.tokens.filter((el)=>{
            return el.token !== req.token
        })
        await req.reporter.save()
        res.send('Logout Successfully')
    }
    catch(e){
        res.send(e)
    }
})


router.delete('/reporters/logoutAll',auth,async(req,res)=>{
    try{
        req.reporter.tokens = []
        await req.reporter.save()
        res.send('Logout all was done succesfully')
    }
    catch(e){
        res.send(e)
    }
})

router.delete('/reporters/:id',auth, async (req, res) => {
    const _id = req.params.id
    try {
        const reporter = await Reporter.findByIdAndDelete(_id)
        if (!reporter) {
            return res.send('No reporter is found')
        }
        res.send(reporter)
    }
    catch (e) {
        res.send(e)
    }
})




const upload = multer({
    limits:{
        fileSize: 1000000   // 1 M 
    },
    fileFilter(req,file,cb){
       if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
          return  cb(new Error('Please upload an image'))
        } 
        cb(null, true)  
    }
})

router.post('/profile/avatar',auth,upload.single('image'),async(req,res)=>{
    try{
        req.reporter.avatar = req.file.buffer
        await req.reporter.save()
        res.send('Image uploaded')
    }
    catch(e){
        res.send(e)
    }
})


module.exports = router