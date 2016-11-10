var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');

var app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/static/views'));

app.use(express.static(path.join(__dirname, '/static')));
app.use(bodyParser.urlencoded({extended: false}));

mongoose.connect('mongodb://localhost/example_db');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: String,
  age: Number,
  _messages: [{message: String}]
});

var MessageSchema = new Schema({
  message: String,
  _user: {type: Schema.Types.ObjectId, ref: 'User'}
})

var User = mongoose.model('User', UserSchema);
var Message = mongoose.model('Message', MessageSchema);

app.get('/', function(req, res){

  User.find({}).populate('_messages').exec(function(err, data){
    console.log(data);
    if(err){
      console.log('error!')
    }else{
      res.render('index', {users: data});
    }
  })
});

app.post('/users', function(req, res){
  // console.log(req.body);
  var new_user = new User(req.body);
  new_user.save(function(err){
    // console.log(results);
    if(err){
      console.log(err);
      console.log('There was a problem!');
      res.redirect('/');
    }else{
      res.redirect('/');
    }
  })
})

app.post('/messages/:_id', function(req, res){
  var new_message = new Message(req.body);
  User.findOne({_id: req.params._id}, function(err, user){
    if(err){
      console.log('error!');
    }else{
      console.log(user);
      user._messages.push(new_message);
      new_message._user = user;
      new_message.save(function(err){
        if(err){
          console.log('error!');
        }else{
          user.save(function(err){
            if(err){
              console.log('err');
            }else{
              res.redirect('/');
            }
          })
        }
      })
    }
  })
})

app.get('/users/:_id/destroy', function(req, res){
  console.log(req.params);
  res.redirect('/');
})

app.listen(8001, function(){
  console.log('Listening on 8001 to sample app');
})
