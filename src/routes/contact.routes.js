import { Router } from "express";
import {createContact,deleteContact,getAllContacts,} from "../controllers/contact.controller.js";
import validate from "../middlewares/validate.middleware.js";
import contactLimiter from "../middlewares/rateLimit.middleware.js";
import contactSchema from "../schemas/contact.schema.js";

const router = Router();

router.post("/", contactLimiter, validate(contactSchema), createContact);

export default router;