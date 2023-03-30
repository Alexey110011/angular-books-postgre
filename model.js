require('dotenv').config()
const authMethods = require('./authentication')
const Pool = require('pg').Pool
const passport = require('passport')
//require('./passport')
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT

})

const getAllBooks = ()=>{
    return new Promise(function(resolve, reject){
        pool.query(
            `SELECT * FROM book ORDER BY _id ASC`, (error, results)=>{
                if(error) {reject(error)};
                resolve(results.rows)
            })
    });
}

/*const getBook = (_id)=>{
    return new Promise(function(resolve, reject){
       // const _id = _id
        pool.query(
            `SELECT * FROM book WHERE _id =${_id}`, (error, results)=>{
                if(error) {reject(error)};
                resolve(results.rows)
            })
    })
}*/


const createBook = (body) => {
    return new Promise(function(resolve, reject) {
      const {authors, title, description, year, category, pictureUrl, rating, price, shops } = body
        pool.query('INSERT INTO book (authors, title, description, year, category,pictureUrl,rating,price, shops) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [authors, title, description, year, category,pictureUrl, rating, price, shops], (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results/*`A new merchant has been added added: ${results}`*/)
      })
    })
  }

  const createUser = (user) =>{
console.log(user)
//authMethods.register(body)
/*if(!body.name ||!body.email ||!body.password){
sendJSONResponse( res, 400, {"message":"All fields required"});
return;
}
let user={name:'', email:'', salt:'', hash:''}
user.name = body.name
user.email = body.email 
setPassword(user,body.password)
console.log(user)
var token;
    token = generateJWT()
    sendJSONResponse(res,200,{"token":token})
//}*/
    return new Promise(function (resolve,reject) {
    pool.query('INSERT INTO users (name, email, salt, hash) VALUES ($1, $2, $3, $4) RETURNING *',[user.name, user.email, user.salt, user.hash], (error, results) => {
        if (error) {
            reject(error)
          }
          resolve(results/*`A new merchant has been added added: ${results}`*/)
        })
      })
    }
//----------------------------------------------------------------------------------------------------------------------
const addReviewToBook = (req) =>{
    const  bookid = req.params.bookId
    let author="1"
    const {/*author,*/ rating, reviewtext/*, createdOn*/} = req.body
    return new Promise (function(resolve, reject){
    pool.query('INSERT INTO reviews (bookid, author, rating, reviewtext) VALUES ($1, $2, $3, $4) RETURNING *', [bookid, author, rating, reviewtext], (error, results) => {
        if (error) {
            reject(error)
          }
          resolve(results.rows)
          //res.send("Good!")
        })
      })
    }
    /*const addReviewToBook = (body,author) =>{
        const  bookId = body.params._id
        const {author,rating, reviewtext, createdOn} = body.body
        return new Promise (function(resolve, reject){
        pool.query('INSERT INTO reviews (bookId, author, rating, reviewtext, createdOn) VALUES ($1, $2, $3, $4, $5) RETURNING *', [bookId, author, rating, reviewtext, createdOn], (error, results) => {
            if (error) {
                reject(error)
              }
              resolve(results)
            })
          })
    }*/function addReviewToDb(req/*, res*/){
        let author;
        //const newReview = new Review
        if(req.payload&&req.payload.name){
        author = req.payload.name
        } else {console.log("No name presented")
        }
        const bookid = req.params.bookId
        const {rating, reviewtext/*, createdOn*/} = req.body
        console.log(100000,req.body)//,
        //newReview.createdOn = req.body.createdOn
       
        //reviews.push(newReview)
        //res.send(newReview)

        return new Promise (function(resolve, reject){
            pool.query('INSERT INTO reviews (bookid, author, rating, reviewtext) VALUES ($1, $2, $3, $4) RETURNING *', [bookid, author, rating, reviewtext/*, createdOn*/], (error, results) => {
                if (error) {
                    reject(error)
                    console.log("tyu")
                  }
                  resolve(results.rows)
                })
              })
              
            }

    /*const getAuthor = (req, res, callback)=>{
        console.log(localStorage['token'])
        if(req.payload&&req.payload.email){
            console.log("this is req.payload", req.payload)
            authMethods.getUserByEmail(req.payload/*.email)
            .then(response=>console.log(response))
            .catch(error=>console.log(error))
            callback(req, res, user.name)
        } else{
            sendJSONResponse(res, 404, {
                'messge':"User not Found"
            })
        }
    }

    const createReview=(req, res)=>{
        getAuthor(req, res, function(req, res, userName){
            if(req.params._id){
                addReviewToBook(req,userName)
            } else{
                sendJSONResponse(res,404, {"message":"Book not found"})
            }
        })
    }*/
//************************************************************************************************************************ */
    const updateRating = (req)=>{
        const bookid = req.params.bookId
        const newRating = req.body.rating
        console.log(150, req.body)
        return new Promise(function(resolve, reject){
            pool.query('UPDATE book SET rating = $2 WHERE _id = $1',[bookid, newRating], (error, results)=>{
            if(error){
                reject (error)
                console.log(body.body)
            }
            resolve(results.rows)
            console.log('Success', results.rows)
        })
    })
}

    const getReviewsForBooks = ()=>{
        return new Promise(function(resolve, reject){
            pool.query(
                `SELECT * FROM reviews ORDER BY _id ASC`, (error, results)=>{
                    if(error) {reject(error)};
                    resolve(results.rows)
                })
        })
    }

  const sendJSONResponse = function(res, status, content){
    res.status(status)
    res.json(content)
}
/*
const register = function(req, res) {
        if(!req.body.name ||!req.body.email ||!req.body.password){
        sendJSONResponse( res, 400, {"message":"All fields required"});
    return;
    }
    let user;
    user.name = req.body.name
    user.email = req.body.email 
    setPassword(req.body.password)
    console.log(user)//return user
    /*user.save(function(err){
        var token;
            token = user.generateJWT()
            sendJSONResponse(res,200,{"token":token})
        }
    })
    pool.query('INSERT iNTO users (id, name, salt, hash)  VALUES ($1, $2, $3, $4)RERTURNING *',[id, name,salt, hash])
}*/



/*const login = function(req, res){
if(!req.body.email||!req.body.password) {
    sendJSONResponse(res, 400, {"messsage":"All fields required"});
    return
}
passport.authenticate('local', 
function(err, user, info){
    let token;
    if(err){
        sendJSONResponse(res, 404, err);
        return
    }
    if(user){
        token = authMethods.generateJWT(user);
        sendJSONResponse(res, 200,{"token":token})
    }
    else {
        sendJSONResponse(res,401,info)
    }
})(req, res)
}*/
module.exports = {getAllBooks,
                  //getBook,
                  createBook, 
                  createUser,
                  addReviewToDb,
                addReviewToBook,
                updateRating,
            getReviewsForBooks,
        }