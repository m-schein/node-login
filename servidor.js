
const express = require('express')
const app = express()
const PORT = process.env.PORT || 4000
const { pool } = require('./dbConfig')
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

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
    res.render('dashboard', {user: 'Maiara'})
})

app.post('/users/register', (req, res)=> {

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