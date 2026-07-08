import Contact from "../models/Contact.js";
import logger from "../utils/logger.js";

/**
 * @desc    Create Contact Message
 * @route   POST /api/contact
 */
export const createContact = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);

    logger.info(`New contact submitted by ${contact.email}`);

    res.status(201).json({
      success: true,
      message: "Contact message submitted successfully.",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get All Contacts
 * @route   GET /api/contact
 */
export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Contact
 * @route   DELETE /api/contact/:id
 */
export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found.",
      });
    }

    logger.info(`Contact deleted : ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};