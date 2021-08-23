
const express = require('express')
const News = require('../models/news')
const router = new express.Router()
const auth = require('../middleware/auth')

router.post('/news',auth,async(req,res)=>{
    const news = new News({...req.body,owner:req.reporter._id})
    try{
        await news.save()
        res.status(200).send(news)
    }
    catch(e){
        res.status(400).send(e)
    }
})


router.get('/news',auth,async(req,res)=>{
    try{
       await req.reporter.populate('news').execPopulate()
       res.send(req.reporter.news)
    }
    catch(e){
        res.status(500).send(e)
    }
})


router.get('/news/:id',auth,async(req,res)=>{
    const _id = req.params.id
    try{
        const news = await News.findOne({_id,owner:req.reporter._id})
        if(!news){
            return res.status(404).send('news not found')
        }
        res.status(200).send(news)
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.patch('/news/:id',auth,async(req,res)=>{
    const _id = req.params.id
    const updates = Object.keys(req.body)
    try{
        const news = await News.findOne({_id,owner:req.reporter._id})
        if(!news){
            return res.status(404).send('news is not found')
        }
        updates.forEach((update)=> news[update] = req.body[update])
        await news.save()
        res.send(news)
    }
    catch(e){
        res.status(400).send(e)
    }

})

// Delete
router.delete('/news/:id',auth,async(req,res)=>{
    const _id = req.params.id
    try{
        const news = await News.findOneAndDelete({_id,owner:req.reporter._id})
        if(!news){
            return res.status(404).send('news is not found')
        }
        res.send(news)
    }
    catch(e){
        res.status(500).send(e)
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
router.post('newsAvatar/:id',auth,upload.single('image'),(req,res)=>{
    const _id = req.params.id
    try{
        const task = await News.findOne({_id,owner:req.user._d})
        if(!task){
            return res.status(400).send('No news is found')
        }
        task.image = req.file.buffer
        task.save()
        res.send('saved')
    }
    catch(e){
        res.send(e)
    }
})


module.exports = router