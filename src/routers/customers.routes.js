import { Router } from "express";
import { customers, customersById, newCustomers, updateCustomer } from "../controllers/customers.controllers.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { customersSchema } from "../schemas/customers.schema.js";

const customersRouter = Router()
customersRouter.get("/customers", customers)
customersRouter.get("/customers/:id", customersById)
customersRouter.post("/customers", validateSchema(customersSchema), newCustomers)
customersRouter.put("/customers/:id", validateSchema(customersSchema), updateCustomer)

export default customersRouter