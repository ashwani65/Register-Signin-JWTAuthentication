require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


require('./db/conn');
const Register = require('./models/registers');

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(express.urlencoded({
    extended:false
}))


app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);

console.log(process.env.SECRET_KEY);

app.get('/',(req,res)=>{
    res.render('index');
})

app.get('/register',(req,res)=>{
    res.render('register');
})

app.get('/login',(req,res)=>{
    res.render('login');
})

// POST 
app.post('/register',async (req,res)=>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password === cpassword){
            const registerEmployee = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                gender : req.body.gender,
                phone : req.body.phone,
                age : req.body.age,
                password : password,
                confirmpassword : cpassword,
            })

           const token = await registerEmployee.generateAuthToken();
           console.log('success part  '+token);

           const registered = await registerEmployee.save()
           res.status(201).render('index');
        }else{
            res.send("Passwords are not matching");
        }
    }catch(error){
        res.status(400).send(error);
        console.log('error part page');
    }
})

// login check
app.post('/login',async (req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email});

        const isMatch = await bcrypt.compare(password,useremail.password);
        
        const token = await useremail.generateAuthToken();
        console.log('success part '+token);

        if(isMatch){
            res.status(201).render('index');
        }
        else{
            res.send('Invalid Login Details');
        }
    } catch (error) {   
        res.status(400).send('Invalid Login Details');
    }
})


const createToken = async ()=>{
    const token = await jwt.sign({_id:"5fcfcc2eea19d10f074a4950"},"abcdefghijklmnopqrstuvwxyzfsdafdasdasfds",{
        expiresIn : '2 minutes'
    })
    console.log(token);

    const userVar = await jwt.verify(token,'abcdefghijklmnopqrstuvwxyzfsdafdasdasfds');
    console.log(userVar);
}

createToken();

app.listen(port,()=>{
    console.log(`listening on port ${port}`);
})