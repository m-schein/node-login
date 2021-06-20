
const express = require('express')
const { pool } = require('./dbConfig')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')


const { response } = require('express')
require("dotenv").config();
const app = express()
const PORT = process.env.PORT || 4000

const initializePassport = require('./passportConfig')
initializePassport(passport)


app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/users/register', (req, res) => {
    res.render('register')
})


app.get('/users/login', (req, res) => {
    res.render('login')
})

app.get('/users/dashboard', (req, res) => {
    let name = req.user.rows[0].name
    let formattedName = name[0].toUpperCase()+ name.slice(1)
    
    res.render('dashboard', {user: formattedName})
})

app.get('/users/logout', (req, res) => {
    req.logout();
    res.render("index", { message: "You have logged out successfully" });
})

app.post('/users/login',
    passport.authenticate('local', {
        successRedirect: '/users/dashboard', //isso nao esta funcia
        failureRedirect: '/users/login',
        failureFlash: true
    })
)

app.post('/users/register', async (req, res)=> {

    let { name, email, password, confirmPassword } = req.body
   
    console.log({
        name, 
        email, 
        password, 
        confirmPassword
     })

    let errors = []

    if(!name || !email || !password || !confirmPassword){
        errors.push({message: 'Please enter all the fields'})
    }

    if(password.length < 6){
        errors.push({message: 'Password should be at least 6 characters'})
    }

    if(password != confirmPassword){
        errors.push({message: 'Passwords do not match'})
    }

    if(errors.length > 0){
        res.render('register', {errors})
    }else{
        let hashedPassword = await bcrypt.hash(password, 10)
        console.log(hashedPassword)

        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [email], (err, results) => {
                if (err){
                    console.log(err)
                }
                //console.log(results.rows)
                
                if(results.rowCount > 0){
                    errors.push({message: 'Email already registered'})
                    res.render('register', { errors })
                }else{
                    pool.query(
                        `INSERT INTO users (name, email, password)
                        VALUES ($1, $2, $3)
                        RETURNING id, password`, [name, email, hashedPassword], 
                        (err, results) => {
                            //console.log(results.rows)
                            if(err){
                                throw err
                            }
                        req.flash('success_msg', 'You are now registered. Please log in')
                        res.redirect('/users/login')
                    })
                }
        
            }
        )
    }
 })

app.listen(PORT, () => {
    console.log(`Servidor executando na porta ${PORT}.`)
})