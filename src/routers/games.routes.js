import { Router } from "express";
import { games, newGame } from "../controllers/games.controllers.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { gamesSchema } from "../schemas/games.schema.js";

const gamesRouter = Router()

gamesRouter.get("/games", games)
gamesRouter.post("/games",validateSchema(gamesSchema), newGame)

export default gamesRouter