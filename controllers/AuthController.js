import agron2 from 'argon2';  
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dov from 'dotenv';
import mongoose from 'mongoose';
dov.config();
import { UserModel } from "../models/UserModel.js";

// const generateToken = (payload) =>{
//     const accessToken = jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,
//         {expiresIn:process.env.ACCESS_TOKEN_LIFE});
//     const refreshToken = jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET); 

//     return {accessToken, refreshToken};
// }
// export const verify =async (req,res,next)=>{
//     const authHeader = req.header('Authorization');
//     const token = authHeader && authHeader.split(' '[1]);
//     console.log("Token:",token);

//     if(!token) return res.status(401).json({Message:"You may not have access"})

//     try {
//         // console.log("Start decode");
//         const decode = jwt.verify(token.toString(),process.env.ACCESS_TOKEN_SECRET)
//         // console.log("Decode:",decode);
//         const user = await UserModel.findById({_id:decode.userId});
//         if(user.refreshToken === "") return res.status(401).json({Success:false, Message:"Please login to your account"})
//         req.user = user;
//         // req.userId = decode.userId;
//         // req.fullName = decode.fullName;
//         // req.role = decode.role;
//         next();
//     } catch (error) {
//         console.log(error);
//         return res.status(403).json({Message:"Error, please try again",Error:error});        
//     }
// }
// export const authRegister = async (req, res) =>{
//     try {
//         req.body.username = req.body.username.toLowerCase();
//         const {username,password ,phone} = req.body;
//         console.log("username:",username);
//         const userExist = await UserModel.findOne({ username: username }).exec();
//         const phoneExist = await UserModel.findOne({ phone: phone }).exec();
//         if(phoneExist) return res.status(403).json({Success:false, Message:"Your number phone has been exist"});
//         else if (!userExist && !phoneExist){
//             const hashPassword = await agron2.hash(password);
//             req.body.password = hashPassword;
//             const user = new UserModel(req.body);
//             await user.save();
        
//             // return token
//             const token = generateToken({user});
//             //add refreshToken in database

//             const addRefreshToken =  await UserModel.findOneAndUpdate({_id:user._id},{refreshToken:token.refreshToken});
//             await addRefreshToken.save();
//             res.status(200).json({Success:true,Message:"Register successfully",token});
//         }
//         else{
//             res.status(403).json({Success:false, Message:"User already exist"});
//         }
//     } catch (error) {
//         res.status(500).json({Success:false, Error:error});
//     }
// }
// export const authLogin = async (req,res) =>{
//     try {
//         req.body.email = req.body.email.toLowerCase();
//         const {email,password} = req.body;
//         console.log("email and password:",req.body);
//         if(!email || !password){
//             res.status(400).json({Success:false, Message:"Enter your email and Password"});
//         }
//         else{
//             const user = await UserModel.findOne({email});
//             if(!user){
//                 res.status(400).json({Success:false, Message:"email or Password incorrect"})
//             }else{
//                 // console.log("email hop le!");
//                 // const passwordValid = await agron2.verify(user.password, password);
//                 const passwordValid = await bcrypt.compare(password, user.password);
//                 if(!passwordValid){
//                     res.status(400).json({Success:false, Message:"email or Password incorrect"})
//                 }
//                 else{
//                     // console.log("Password hop le!");
//                     // return token
                    
//                     const token = generateToken({userId:user._id, fullName:user.fullName , role:user.role});
//                     const addRefreshToken =  await UserModel.findOneAndUpdate({_id:user._id},{refreshToken:token.refreshToken});
//                     await addRefreshToken.save();
//                     res.status(200).json({Success:true,Message:"Login successfully",token});
//                 }
//             }
//         }
//     } catch (error) {
//         res.status(500).json({Success:false, Error:error ,Message:"Error occurred, please try again"});
//     }
// }
// export const authLogout =async (req,res) =>{
//     try {
//         const updateRefreshToken = await UserModel.findOneAndUpdate({_id:req.userId},{refreshToken:""},{new:true});
//         await updateRefreshToken.save();
//         if(updateRefreshToken) return res.status(200).json({Success:true, Message:"Logout successfully"});
//         return res.status(400).json({Success:false,Message:"User not found"});
//     } catch (error) {
//         res.status(500).json({Success:false,Message:"Error, please try again!", Error:error});
//     }
// }
// export const token = async (req,res) =>{
//     const refreshToken = req.body.refreshToken;
//     // console.log("RefreshToken:",refreshToken);
//     if(!refreshToken) return res.status(401).json({Success:false, Message:"Not found refresh token"});

//     const user = await UserModel.findOne({refreshToken});
//     if(!user) return res.status(403).json({Success:false, Message:"Not found user"});
//     try {
//         jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);

//         const token = generateToken({user});
//         res.status(200).json({Success:true, Message:"Refresh Token successfully" ,Token:token});
//     } catch (error) {
//         res.status(500).json({Success:false,Message:"Error, please try again!", Error:error});
//     }
// }

// Register <=> Create new user


export const register =  async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new UserModel({
      _id: new mongoose.Types.ObjectId(),
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      fullname: req.body.fullname,
      phone: req.body.phone,
      avatar: req.body.avatar,
      role: req.body.role,
    });
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, "MPBA", {
    expiresIn: "1000s",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, "MA");
};

let listRefreshToken = [];

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email: email }).populate("role");
    await bcrypt.compare(password, user.password);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    listRefreshToken.push(refreshToken);

    res.status(200).json({
      id: user._id,
      role: user.role,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(400).json("User name or password is invalid");
  }
};

// Refresh Tokens
export const refresh =(req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.status(400).json("You're not authenticated");
  } else if (!listRefreshToken.includes(refreshToken)) {
    return res.status(400).json("Refresh token is invalid");
  }

  jwt.verify(refreshToken, "MA", (err, user) => {
    err && console.log(err);
    listRefreshToken = listRefreshToken.filter(
      (token) => token !== refreshToken
    );

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    listRefreshToken.push(newRefreshToken);
    console.log(
      "newAccessToken : " +
        newAccessToken +
        " - refreshToken: " +
        newRefreshToken
    );
    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
};

export const verify = (req, res, next) => {
  // console.log("verify: " + listRefreshToken);
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).json({Message:"You're not authenticated"})
  const token = authHeader.split(" ")[1];
  try {
    console.log("verify token: " + token);
      jwt.verify(token.toString(), "MPBA", (err, user) => {
        if(err)
          console.log(err);
        {
          req.user = user;
          next();
        }
      });
  } catch (error) {
    return res.status(403).json({Message:"Error, please try again",Error:error});
  }
};

// Logout
export const logout =  (req, res) => {
  const refreshToken = req.body.token;
  listRefreshToken = listRefreshToken.filter((token) => token !== refreshToken);
  res.status(200).json({Success:true,UserInfo:req.user,Message:"Log out! successfuly!"});
};
