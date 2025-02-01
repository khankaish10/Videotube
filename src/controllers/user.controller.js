import {asyncHandler} from '../utils/asyncHandler.js'





const registerUser = asyncHandler(async (req, res) => {
    return res.status(200).json({
        message: "OK"
    })
})

const loginUser = asyncHandler(async (req, res) => {
    return res.status(200).json({
        message: "login"
    })
})

export {registerUser, loginUser};