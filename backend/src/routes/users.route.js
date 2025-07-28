import { Router } from "express";
import {
    getWatchHistory,
    getUserChannelProfile,
    updateCoverImage,updateUserAvatar, 
    changePassword, 
    loginUser, 
    logOutUser,
    refreshAccessToken, 
    updateAccountDetails, 
    userRegister,
    currentUser 
} from "../controllers/users.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router() ; 
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount: 1 
        }

    ]),
    userRegister
); 
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logOutUser);
router.route("/refreshToken").post(refreshAccessToken);
router.route("/changePassword").post(verifyJWT,changePassword);
router.route("/updateAccountDetails").patch(verifyJWT,updateAccountDetails)
router.route("/updateUserAvatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/updateCoverImage").patch(verifyJWT,upload.single("coverImage"),updateCoverImage);
router.route("/currentUser").get(verifyJWT,currentUser);
router.route("/c/:userName".get(verifyJWT,getUserChannelProfile))
router.route("/watchHistory").get(verifyJWT,getWatchHistory)


export default router;

    // changePassword,
    // currentUser,
    // updateAccountDetails,
    // updateUserAvatar,
    // updateCoverImage