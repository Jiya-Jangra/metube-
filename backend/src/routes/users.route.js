import { Router } from "express";
import {updateCoverImage,updateUserAvatar, changePassword, loginUser, logOutUser, refreshAccessToken, updateAccountDetails, userRegister, currentUser } from "../controllers/users.controller.js";
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


export default router;

    // changePassword,
    // currentUser,
    // updateAccountDetails,
    // updateUserAvatar,
    // updateCoverImage