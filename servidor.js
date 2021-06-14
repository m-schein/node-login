
const express = require('express')
const app = express()
const PORT = process.env.PORT || 4000
const { pool } = require('./dbConfig')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')
const initializePassport = require('./passportConfig')
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

initializePassport(passport)


app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))

app.use(flash())
app.get('/users/register', (req, res) => {
    res.render('register')
})

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/users/login', (req, res) => {
    res.render('login')
})

app.get('/users/dashboard', (req, res) => {
    res.render('dashboard', {user: 'Maiara'})
})

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
                if(results.rows.length > 0){
                    errors.push({message: 'Email already registered'})
                    res.render('register', { errors })
                }else{
                    pool.query(
                        `INSERT INTO users (name, email, password)
                        VALUES $1, $2, $3
                        RETURNING id, password`, [name, email, hashedPassword], 
                        (err, result) => {
                            if(err){
                                throw err
                            }
                            console.log(results.rows)
                            req.flash('success_msg', 'You are now registered. Please log in')
                            res.redirect('/users/login')
                        })
                }
               
                
            }
        )
    }
 })


app.get('/clientes', (req, res) =>{
    res.json([{id: 1, nome: 'Paulo'}])

})

app.post('/login', (req, res) => {
    //antes de entrar nesse if precisa verificar no banco de dados se este usuário e
    if(req.body.user === 'Paulo' && req.body.passoword === '123'){
        return res.end()
    }

    res.status(401).end()
})

app.post('/logout', (req, res) => {
    res.end()
})

app.listen(PORT, () => {
    console.log(`Servidor executando na porta ${PORT}.`)
})