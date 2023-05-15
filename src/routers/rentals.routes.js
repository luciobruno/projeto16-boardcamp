import { Router } from "express";
import { deleteRental, newRental, rentalFinalization, rentals } from "../controllers/rentals.controllers.js";

const rentalsRouter = Router()

rentalsRouter.post("/rentals", newRental)
rentalsRouter.get("/rentals", rentals)
rentalsRouter.post("/rentals/:id/return", rentalFinalization)
rentalsRouter.delete("/rentals/:id", deleteRental)

export default rentalsRouter