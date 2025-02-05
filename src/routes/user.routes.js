import { Router } from "express";
import {
    loginUser, 
    registerUser, 
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage,
} from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJwt} from '../middlewares/auth.middleware.js'


const router = Router();


router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route('/login').post(loginUser)


//secured Routes
router.route("/logout").post(verifyJwt, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-current-password').post(verifyJwt, changeCurrentPassword)
router.route('/getcurrentuser').get(verifyJwt,getCurrentUser);
router.route('/update-avatar').get(verifyJwt,
    upload.single("avatar"),
    getCurrentUser);

router.route('/update-coverimage').get(verifyJwt,
    upload.single("coverImage"),
    getCurrentUser);


export default router;