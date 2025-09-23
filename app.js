const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const wrapAsync = require('./utils/wrapAsyn.js')
const ExpressError = require('./utils/ExpressError.js')

const port = 8080;

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate)
app.use(express.static(path.join(__dirname,'public')))


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
   .then(()=>{
    console.log('connect to DB');
   })
   .catch((err)=>{
    console.log(err);
   });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get('/',(req,res)=>{
    res.send('Hi, I am root');
});

// index route 
app.get('/listings',wrapAsync(async(req,res)=>{
    const allListing= await Listing.find({});
    res.render("listings/index.ejs",{allListing})
}));

// New Route 
app.get('/listings/new',(req,res)=>{
    res.render('listings/new.ejs')
})

// show Route 
app.get('/listings/:id',wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing})
}));

// Create Route 
app.post('/listings',wrapAsync(async (req,res,next)=>{
     // let {title,description,image,price,country,location} = req.body;
     if(!req.body.listing){
        throw new ExpressError(404,"Send valid data for listing")
     }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
}));

// Edit Route 
app.get('/listings/:id/edit',wrapAsync(async(req,res)=>{
    let{id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs',{listing});
}));

// Update Route 
app.put('/listings/:id',wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for listing");
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing})
    res.redirect(`/listings/${id}`);
}));

// Delete route 
app.delete('/listings/:id',wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect('/listings')
}));

// app.get('/testListing',async(req,res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description : "By the beach",
//         price : 1200,
//         location :"Calangute, Goa",
//         country : "India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("succesfully saved")
// });

app.all(/.*/,(req,res,next)=>{
    next(new ExpressError(404,"Path Not Found!"));
})

app.use((err,req,res,next)=>{
    let {statusCode = 500,message = "Something went wrong"} = err;
    res.status(statusCode).send(message);
})

app.listen(port,()=>{
    console.log(`server is listening to port ${port}`);
});
