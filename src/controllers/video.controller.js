import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!title) throw new ApiError(400, "Title is required");

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(!videoFileLocalPath || !thumbnailLocalPath) throw new ApiError(400, "something went wrong while uploading video");

    // upload on cloudinary
    const videoOnCloudinary = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnailOnCloudinary = await uploadOnCloudinary(thumbnailLocalPath)


    if(!videoOnCloudinary || !thumbnailOnCloudinary)
        throw new ApiError(500, "uploading went wrong")

    const video = await Video.create({
        videoFile: videoOnCloudinary?.url,
        thumbnail: thumbnailOnCloudinary?.url,
        description,
        duration: 2,
        owner: req.user?._id
    })

    return res.status(200)
    .json(new ApiResponse(
        200,
        video,
        "video uploaded successfully"
    ))

    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
