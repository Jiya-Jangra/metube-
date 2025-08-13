import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos, getVideoById, publishAVideo } from "../controllers/video.controller.js";

const router = Router(); 

router.route("/allvideos").get(verifyJWT,getAllVideos)
router.route("/publishVideo").post(verifyJWT,upload.fields([
    {
        name: "video",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),
publishAVideo),
router.route("/videosId/:videoId").get(verifyJWT,getVideoById)



export default router ; 