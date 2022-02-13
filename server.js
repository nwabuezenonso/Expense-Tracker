const express = require('express');
const mongoose = require('mongoose')
// const Authrouters = require('./routes/authRoutes');
// const cookieParser = require('cookie-parser');
// const { requireAuth, checkUser } = require('./middleware/authmiddleware'); 
// const { sendWelcomeEmail } = require('./emails/mail')
// const sendMail = require('./mail')

//set up the express function
const app = express()

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb://localhost/user'
mongoose.connect(dbURI, {useNewUrlParser: true , useUnifiedTopology: true})
  .then((result) => app.listen(3000, () => {'Server is running on port 3000'}))
  .catch((err) => console.log(err));

//routes
// app.get('*', checkUser)
app.get('/', (req, res)=>{
  res.render('index')
})
// app.get('/member',requireAuth,  (req, res) =>{
//   res.render('member')
// })
// app.post("/email", (req, res) =>{
//   const {email, subject} = req.body
//   console.log('Data: ', req.body)
  
//   sendMail(email, subject , function(err,data){
//       if(err){
//           res.status(500).json({message: 'Internal Error'});
//       }else{
//           res.json({message: 'Email sent!!!!'})
//       }
//   })
//   res.json({message: 'Message recieved!'})
// })
// app.use(Authrouters);

//Error routes
app.use((req, res)=>{
  res.status(404).render('404')
})
