import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'


const generateAccessAndRefreshToken = async(userId) => {

    try {

        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false });

        return {
            accessToken,
            refreshToken
        }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokn")
    }

   
}



const registerUser = asyncHandler(async (req, res) => {
    // get use details
    // validatation - not empty and more
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove passord and refresh token field from response
    // check for user creation
    // return res

    const {fullName, email, userName, password} = req.body;

    // if(fullName === "") {
    //     throw new ApiError(400, "Fullname is required")    "Either check all the fields
    //                                                         one by one of directly write like below code"
    // }
    
    if([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, " All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{userName}, {email}]
    })


    if (existedUser){
        throw new ApiError(409, "User with email or username already exist")
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath) {
        throw new ApiError(409, "Avatar file is required");
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(500, "something went wrong while upload avatar")
    }


    const createdUser = await User.create({
        fullName,
        email,
        userName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const user = await User.findById(createdUser._id).select("-password -refreshToken")
    if(!user) {
        throw new ApiError(500, "something went wrong while upload avatar")
    }

    return res.status(201).json(new ApiResponse(200, user, "User registered successfully"))

})

const loginUser = asyncHandler( async (req, res) => {
    
    // get the data from the user
    //validation - userName, email, password
    // check if user exist or not 
    // match password
    // generate accessToken/refreshtoken
    // send respnse without password and refresh token

    const {userName, email } = req.body;

    if([userName, email].some(field => field.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({$or: [{userName}, {email}]})
                            .select("-password -refreshToken");
    if(!existedUser){
        throw new ApiError(400, "User doesnot exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) throw new ApiError(400, "email or password is incorrect");

    // generate access/refreshToken

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(existedUser._id);



    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            201, 
            {
                user: existedUser, accessToken, refreshToken
            },
            "User successfully LoggedIn"
        )
    )

})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined}
        },
        {new: true}
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).
    clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            201,
            {},
            "Use Successfully LoggedOut"
        )
    )

})

const refreshAccessToken = asyncHandler( async (req, res) => {

    const incomingToken = req.cookie?.refreshToken || req.body?.refreshToken
    if(!incomingToken) throw new ApiError(400, "Unauthorized request");

    try {
        const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id);        

        if(!user) throw new ApiError(400, "Invalid refresh token")
        
        if(incomingToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(decodedToken._id);
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201, 
                {
                  accessToken, refreshToken
                },
                "Access token refreshed"
            )
        )

    } catch (error) {
        throw new ApiError(400, error?.message ||  "Invalid Token")
    }

})










export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
}