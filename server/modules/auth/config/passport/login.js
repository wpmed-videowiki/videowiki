const LocalStrategy = require('passport-local').Strategy
const User = require('../../models/User')
import { isValidPassword } from '../../utils'

module.exports = (passport) => {
  passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  }, (req, email, password, done) => {
    const emailLowercase = email.toLowerCase()
    process.nextTick(() => {
      // check in mongo if a user with email exists or not
      User.findOne({ email: emailLowercase }).then(( user) => {
        // Username does not exist, log the error and redirect back
        if (!user) {
          console.log(`User Not Found with email ${emailLowercase}`)
          return done(null, false, 'Invalid Username or Password!')
        }
        // User exists but wrong password, log the error
        if (!isValidPassword(user, password)) {
          console.log('Invalid Password')
          return done(null, false, 'Invalid Username or Password!') // redirect back to login page
        }

        if (!user.verified) {
          return done(null, false, 'Email not verified! Please verify your email using the link sent to your account')
        }

        // User and password both match, return user from done method
        // which will be treated like success
        return done(null, user)
      })
      .catch(err => {
        // In case of any error, return using the done method
        if (err) {
          console.error('Error while finding user for login')
          console.tag('passport').error(err)
          return done(err)
        }
      })
    })
  }))
}
