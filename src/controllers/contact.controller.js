import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import logger from "../utils/logger.js";
import { publishContactEvent } from "../config/kafka.js";

// In-Memory Database Fallback for Offline Mode
const mockDb = [];

/**
 * @desc    Create Contact Message
 * @route   POST /api/contact
 */
export const createContact = async (req, res, next) => {
  try {
    let contact;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      contact = await Contact.create(req.body);
    } else {
      contact = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...req.body,
        createdAt: new Date(),
      };
      mockDb.push(contact);
      logger.info(`[Offline DB] Contact saved to in-memory store: ${contact.email}`);
    }

    logger.info(`New contact submitted by ${contact.email}`);

    // Publish event asynchronously to Kafka
    publishContactEvent(contact);

    res.status(201).json({
      success: true,
      message: isConnected 
        ? "Contact message submitted successfully."
        : "Contact message submitted successfully (In-Memory Fallback).",
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
    let contacts;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      contacts = await Contact.find().sort({
        createdAt: -1,
      });
    } else {
      contacts = [...mockDb].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      logger.info(`[Offline DB] Retrieved ${contacts.length} contacts from in-memory store`);
    }

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
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      const contact = await Contact.findByIdAndDelete(req.params.id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact not found.",
        });
      }

      logger.info(`Contact deleted : ${req.params.id}`);
    } else {
      const index = mockDb.findIndex((c) => c._id.toString() === req.params.id);
      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: "Contact not found.",
        });
      }
      mockDb.splice(index, 1);
      logger.info(`[Offline DB] Deleted contact : ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};