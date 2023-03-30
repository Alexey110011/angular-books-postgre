const express  = require('express')
const bodyParser = require('body-parser')
const model=require('./model')
require('./passport')
const authMethods = require('./authentication')
const passport = require('passport')
const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
})
const jwt = require('jsonwebtoken')

/*const {expressjwt:jwt} = require('express-jwt')---Usinf wxpress-jwt package
  let auth = jwt({
  secret:process.env.JWT_SECRET,
  userProperty:'payload',
  algorithms:['HS256']
})*/
const app = express()

let auth = (req, res, next)=>{
  //console.log("Auth!")
  try{
      const {authorization} = req.headers
      console.log(10,req.headers.authorization)
      if(authorization){
          const token =  req.headers.authorization.split(" ")[1]
          console.log(11,token)
          const result = jwt.verify(token, process.env.JWT_SECRET,{algorithms:['HS256']})
          req.payload = result
      console.log(11,result,12,req.payload)
      next()
      } else {
          res.send("No Token")
      } 
  }
  catch{
      res.send({"message":'ERROR'})
  }
}

let books=[];
let reviews=[];

const getBook = (_id)=>{
  try{
  return books.find(book=>book._id==_id)
} catch (err){
  console.log("Error")
}
}

function getReviewsForBook(bookId){
  return reviews.filter(review=>review.bookid==bookId)
}

const emailExists = (username)=>{
  return new Promise (function(resolve, reject){
    pool.query(`SELECT * FROM users WHERE email = $1`,[username],(error, results)=>{
      if (error) {
        reject(error)
      }
        resolve(results.rows)
      })
  })
}

app.use(function(err, req, res,next){
  if(err.name==="UnauthorizedError"){
    res.status(401)
    res.json({"message":err.name + ":" + err.message})
}
})

app.use(function(req, res, next){
res.setHeader('Access-Control-Allow-Origin','*'),
res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT, DELETE, OPTIONS'),
res.setHeader('Access-Control-Allow-Headers','Content-Type, Access-Control-Allow-Headers,Authorization');
next()
})

app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(passport.initialize())

/*  app.get('/bearer', function (req, res){
  const bearer  =  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsbGVzaGt2Y2hAZ21haWwuY29tIiwibmFtZSI6IkFsZXhleSIsImV4cCI6MTY4MDEwNzMxMiwiaWF0IjoxNjc5NTAyNTEyfQ.Vtt604QTsAJKMykUv6yWe0VS-POynTMMutxmueFpnOc'
  const token =  bearer.split(" ")[1]
          console.log(11,token)
          const result = jwt.verify(token, process.env.JWT_SECRET,{algorithms:['HS256']})
          req.payload = result
      console.log(11,result,12,req.payload)
      res.send(result.name)
  })*/

app.get('/', function(req, res){
  model.getAllBooks()
  .then(response=>{
    res.status(200);
    books = response
    res.send(books)
      console.log(books)})
  .catch(err=>{
      res.status(500).send(err)
  })
  model.getReviewsForBooks()
  .then(response=>{
    res.status(200)
    reviews = response
  
    console.log(reviews)})
    .catch(err=>{console.log(err)})
  })
 
  app.get('/products/:_id', (req, res)=>{
  console.log(books)
 res.json(getBook(req.params._id))
 const filtered = getReviewsForBook(req.params._id)
 console.log(req.params._id, filtered)
  })

  app.get('/products/:_id/reviews', (req, res)=>{
   res.json(getReviewsForBook(req.params._id))
  })

app.post('/booksFromDb1', (req, res)=>{
    console.log(req.body)
   /* return new Promise(function(resolve, reject) {
        //const {authors, title, description, year,category,pictureUrl,rating, price,shops } = body
        const authors=req.body.authors
        const title = req.body.title
        const description = req.body.description
        const year = req.body.year
        const category = req.body.category
        const pictureUrl = req.body.pictureUrl
        const rating = req.body.rating
        const price = req.body.price
        const shops = req.body.shops
        pool.query('INSERT INTO book (authors, title, description, year, category,pictureUrl,rating,price, shops) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [authors, title, description, year, category,pictureUrl, rating, price, shops], (error, results) => {
          if (error) {
            reject(error)
          }
          resolve(`A new merchant has been added added: ${results}`)
        })
      })
    //}*/model.createBook(req.body)
    .then(response => {
      res.status(200).send(response);
      //console.log('Req')
    })
    .catch(error => {
      res.status(500).send(error);
    })})
       
    /*process.on('SIGTERM',()=>{
    server.close(()=>{
        console.log("Server  close: process terminated")
    })
})*/
//-----------------------------------------------------------------------------------------------------------------------
app.post('/products/:bookId/addReview',auth,(req, res)=>{
    model.addReviewToDb(req/*,res*/)
    .then(response => {
      reviews.push(response)
      res.status(200).send(response/*reviews*/);
      console.log(1000,response.rows)
    })
    .catch(error => {
      res.status(500).send(error);
      console.log("k")
    })
  })
//---------------------------------------------------------------------------------------------------------------------------
  app.put('/products/:bookId/addReview/updateRating',(req, res)=>{
    model.updateRating(req/*, res*/)
    .then(response=>{
      res.status(200).send(response)
      console.log(5,response)
    })
    .catch(error=>{
      res.status(500).send(error);
      console.log(error)
    })
 })
       
app.post('/register', (req, res)=>{
  authMethods.register(req,res)
    .then(response => {
      //res.status(200).send(response);
        console.log(response)
        
      })
      .catch(error => {
        res.status(500).send(error);
      })
})
      
app.post('/login', (req, res)=>{
  console.log(2,req.body)
    authMethods.login(req,res)
})

app.get('/getUser', (req, res)=>{
    authMethods.getUser(req)
    .then (response=>{res.send(response)})
    .catch(err=>console.log(err))
})

app.post('/checkUserName', (req, res)=>{
  authMethods.checkUserName(req.body)
  .then (response=>{res.send(response);console.log(response)})
  .catch(err=>console.log(err))
})

app.post('/checkUserEmail', (req, res)=>{
  authMethods.getUserByEmail(req.body)
  .then (response=>{res.send(response);console.log(response)})
  .catch(err=>console.log(err))
})

app.post('/checkRegExpName', (req, res)=>{
    authMethods.getRegExpName(req)
    .then(response=>{res.send(response);console.log(response)})
  })

app.post('/checkRegExpEmail', (req, res)=>{
    authMethods.getRegExpEmail(req)
    .then(response=>{res.send(response);console.log(response)})
  })

app.listen(8000/*process.env.PORT||port*/, ()=>console.log(`Server is listening at port 8000`))