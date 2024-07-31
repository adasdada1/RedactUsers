import express from "express";
import { UserRoute } from "./userRouter.mjs";
const router = express.Router();
router.use("/", UserRoute);
export {router}