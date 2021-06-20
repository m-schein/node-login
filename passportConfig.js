const localStrategy =  require('passport-local').Strategy
const { pool } = require('./dbConfig')
const bcrypt = require('bcrypt')

function initialize(passport){
    console.log("Initialized");
    const authenticateUser = (email, password, done) => {
        console.log(email, password);
        pool.query(` SELECT * FROM users WHERE email = $1`, [email], (err, results) => {
            if(err){
                throw err
            }
            console.log(results.rows)

            if(results.rows.length > 0){
                const user = results.rows[0] //we need the first user of that list

                bcrypt.compare(password, user.password, (err, isMatch) =>{
                    if(err){
                        console.log(err)
                    }
                    
                    if(isMatch){
                        console.log('user is match')
                        console.log(user)
                        return done (null, user)
                    }else{
                        return done (null, false, {message: 'Password is not correct'} )
                    }
                })
            }else{ //if there are no users in the database:
                return done(null, false, {message: 'Email is not registered'})
            }
        })
    }
    passport.use(new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        }, authenticateUser
    ))
    
    passport.serializeUser((user, done) => done (null, user.id)) //store the user id in a session cookie
    passport.deserializeUser((id, done)=> { //uses the user id to get infomation about the user in the database
        pool.query(`
        SELECT * FROM users WHERE id = $1`, [id], (err, results) =>{
            if(err){
                return done(err)
            }
            console.log(`ID is ${results.rows[0].id}`);
            return done(null, results)
        })
    })

}

module.exports = initialize;