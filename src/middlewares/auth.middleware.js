import jwt, { decode } from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';



const verifyJwt = async(req, res, next) => {
    try {
        
        const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token) throw new ApiError(401, "Unauthorized access")

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id)
                                        .select("-password -refreshToken");

        if(!user) throw new ApiError(401, "Invalid Access Token");

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(400, error?.message || "Unauthorized access!")
    }

}


export {verifyJwt}