import { Video } from "../models/video.models.js";
import { APIError } from "../utils/apiError.js";
import asyncHandler from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiResponse.js"; 
import {uploadonCloudinary} from "../utils/cloudnary.js" ;



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    console.log(req.query)
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const matchStage = { isPublished: true };
      if (query) {
        matchStage.$text = { $search: query };}
    const videos = await Video.aggregate(
        [
    {
        $match:  matchStage 
    },
    {
        $addFields: {
            score: { $meta: "textScore" }
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }
            ]
        }
    },
    {
        $addFields: {
            owner: { $first: "$owner" }
        }
    },
    {
        $sort: {
            score: -1,  // Highest relevance first
            views: -1   // Then highest view count
        }
    },
    {
        $skip: (pageNum - 1) * limitNum  // <-- Skip documents for previous pages
    },
    {
        $limit: limitNum               // <-- Limit to 'limit' documents
    }
]
    )

    if(!videos || videos.length === 0){
        throw new APIError(400,"videos are not fetched")
    }

    return res.status(200).json(new ApiResponse(200,videos,"videos are fetched"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
         //get video and thumb nail 
         const videoLocalPath = req.files?.video[0]?.path ; 
         if(!videoLocalPath){
            throw new APIError(400,"upload video again")
         }
         const  thumbnailLocalPath = req.files?.thumbnail[0]?.path 
         if(!thumbnailLocalPath){
            throw new APIError(400,"upload thumbNail again")
         }
         const videofile = await uploadonCloudinary(videoLocalPath);
         if(!videofile){
            throw new APIError(500,"file not uploaded on cloudinary(video)")
         } 
         const thumbnail = await uploadonCloudinary(thumbnailLocalPath);
        if(!thumbnail){
            throw new APIError(500,"file not uploaded on cloudinary(video)")
         }

         const newVideo = await Video.create({
            videofile :videofile.url ,
            thumbnail:thumbnail.url,
            title ,
            description,   
            duration : videofile.duration,
            owner: req.user?._id ,
            views:0,
            isPublished:true 

         });

         if(!newVideo){
            throw new APIError(500,"document failed to be stored ")
         }

         return res.status(200)
        .json(new ApiResponse(200,newVideo,"video uploaded sucessfully"))




})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId); 
    console.log(video); 
    if(!video){
        throw new APIError(400,"invalid videoId "); 
    } 

    return res.status(200).json(new ApiResponse(200,"video fetched successfully",video))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const user = req.user 
    const {title,description } = req.body
    //TODO: update video details like title, description, thumbnail
    const validUser = await Video.findById(videoId); 
    if(!validUser){
        throw new APIError(404,"invalid video id")
    }
    console.log(validUser);

    if(!user == validUser.owner){
        throw new APIError(404,"you are not the onwner of the video")
    }
    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                title,
                description
            }
        },{new:true}
    )
    if(!updatedVideo){
        throw new APIError(500,"updation failed")
    }

    return res.status(200)
    .json(new ApiResponse(200,"video is updated",updatedVideo))
})

const updateThumbnail = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const thumnail = req.file?.thumbnail.path 
    if(!thumnail){
        throw new APIError(404,"upload the thumbnail")
    }
    const uploadThumnail = await uploadonCloudinary(thumnail); 
    if(!uploadThumnail.url){
        throw new APIError(500,"upload on cloudinary failed")
    }

    const newThumnail = await Video.findByIdAndUpdate(videoId,{
        $set:{
            thumnail:uploadThumnail.url
        }
    },{
        new:true
    })

    return res.status(200).json(new ApiResponse(200,"thumbnail updated"))
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
    updateThumbnail,
    deleteVideo,
    togglePublishStatus
}