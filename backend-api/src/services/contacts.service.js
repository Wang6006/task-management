const knex = require("../database/knex");
const { unlink } = require("node:fs");
const Paginator = require("./paginator");

/**
 * 
const { z } = require("zod");
const {
  contactSchema,
  partialContactSchema,
} = require("./schemas/contact.schemas");

 * @typedef {z.infer<typeof contactSchema>} Contact
 * @typedef {z.infer<typeof partialContactSchema>} PartialContact
 */

/**
 * Returns the base query builder for the contacts table.
 */
function contactRepository() {
  return knex("contacts");
}

/**
 * Filters and returns only defined contact fields.
 *
 * @param {PartialContact} payload
 * @returns {PartialContact}
 */
function readContactData(payload) {
  return {
    ...(payload.name && { name: payload.name }),
    ...(payload.email && { email: payload.email }),
    ...(payload.address && { address: payload.address }),
    ...(payload.phone && { phone: payload.phone }),
    ...(payload.favorite !== undefined && { favorite: payload.favorite }),
    ...(payload.avatar && { avatar: payload.avatar }),
  };
}
/**
 * Create a new contact in the database.
 *
 * @param {PartialContact} payload
 * @returns {Promise<Contact>}
 */
async function createContact(payload) {
  const contactData = readContactData(payload);
  const [id] = await contactRepository().insert(contactData).returning("id");
  return { id, ...contactData };
}

async function getManyContacts(query) {
  const { name, favourite, page = 1, limit = 5 } = query;
  const paginator = new Paginator(page, limit);
  const results = await contactRepository()
    .where((builder) => {
      if (name) {
        builder.where("name", "like", `%${name}%`);
      }
      if (favourite !== undefined && favourite === "true") {
        builder.where("favorite", favourite === "true");
      }
    })
    .select(
      knex.raw("COUNT(id) OVER() AS record_count"),
      "id",
      "name",
      "email",
      "address",
      "phone",
      "favorite",
      "avatar"
    )
    .orderBy("id", "asc")
    .limit(paginator.limit)
    .offset(paginator.offset);

  const totalRecords = results[0]?.record_count ?? 0;

  const contacts = results.map((result) => {
    result.record_count = undefined;
    return result;
  });

  return {
    metadata: paginator.getMetadata(totalRecords),
    contacts,
  };
}
async function getContactById(id) {
  return contactRepository().where("id", id).select("*").first();
}
/**
 * Deletes a contact by ID.
 *
 * @param {Number} contactId
 * @returns {PartialContact} updatedData;
 */
async function updateContact(id, updateData) {
  const updatedData = await contactRepository()
    .where("id", id)
    .select("*")
    .first();
  if (!updateContact) {
    return null;
  }
  const contactData = readContactData(updateData);
  if (Object.keys(contactData).length > 0) {
    return contactRepository().where("id", id).update(contactData);
  }
  if (
    contactData.avatar &&
    updatedData.avatar &&
    contactData.avatar !== updatedData.avatar &&
    updatedData.avartar.startsWith("/public/uploads")
  ) {
    unlink(`.${updatedData.avatar}`, () => {});
  }
  return {
    ...updateContact,
    ...contactData,
  };
}

async function deleteContact(id) {
  const deleteContact = await contactRepository()
    .where("id", id)
    .select("avatar")
    .first();
  if (!deleteContact) {
    return null;
  }
  await contactRepository().where("id", id).del();
  if (
    deleteContact.avatar &&
    deleteContact.avatar.startsWith("/public/uploads")
  ) {
    unlink(`.${deleteContact.avatar}`, () => {});
  }
  return deleteContact;
}
async function deleteAllContacts() {
  const contacts = await contactRepository().select("avatar");
  await contactRepository().del();
  contacts.forEach((contact) => {
    if (contact.avatar && contact.avatar.startsWith("/public/uploads")) {
      unlink(`.${contact.avatar}`, () => {});
    }
  });
}
module.exports = {
  createContact,
  getManyContacts,
  getContactById,
  updateContact,
  deleteContact,
  deleteAllContacts,
};
