import { Video } from "../models/video.models";
import { APIError } from "../utils/apiError.js";
import asyncHandler from "../utils/asynchandler.js";



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})


export {getAllVideo}