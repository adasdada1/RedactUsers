import express from "express";
import {
  getOneUser,
  deleteUser,
  addUser,
  editUser,
  con,
  getIndexPage,
} from "../controllers/userController.mjs";

const router = express.Router();

router.get("/", getIndexPage);
router.post("/getOneUser", getOneUser);
router.get("/getUsers", con);
router.post("/addUser", addUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id", editUser);

export { router as UserRoute };
