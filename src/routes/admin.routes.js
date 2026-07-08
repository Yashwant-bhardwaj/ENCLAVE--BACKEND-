import { Router } from "express";

import {
  getAllContacts,
  deleteContact,
} from "../controllers/contact.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| GET ALL CONTACTS
|--------------------------------------------------------------------------
*/

router.get("/contacts", getAllContacts);

/*
|--------------------------------------------------------------------------
| DELETE CONTACT
|--------------------------------------------------------------------------
*/

router.delete("/contacts/:id", deleteContact);

export default router;