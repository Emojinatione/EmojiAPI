import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import unicodeData from "../emoji.json";

const router: express.Router = express.Router();

router.post(
  "/unicode/full",
  function (req: Request, res: Response, next: NextFunction) {
    res.json(unicodeData);
  }
);


export default router;
