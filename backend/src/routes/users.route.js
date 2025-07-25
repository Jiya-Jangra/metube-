import { Router } from "express";
import { loginUser, logOutUser, refreshAccessToken, userRegister } from "../controllers/users.controller.js";
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

export default router;