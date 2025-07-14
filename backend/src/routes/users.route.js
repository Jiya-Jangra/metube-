import { Router } from "express";
import { userRegister } from "../controllers/users.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
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
router.get('/test', (req, res) => {
  res.send('User route is working!');
});
export default router;