const fs = require("fs").promises;
const path = require("path");

/**
 * Delete a file from the filesystem
 * @param {string} filePath - Full or relative path to the file
 * @returns {Promise<void>}
 */
async function deleteFile(filePath) {
  try {
    const resolvedPath = path.resolve(filePath);
    await fs.unlink(resolvedPath);
    console.log(`✅ Deleted file: ${resolvedPath}`);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn(`⚠️ File not found: ${filePath}`);
    } else {
      console.error(`❌ Error deleting file: ${filePath}`, err);
      throw err; // optional: rethrow if you want to fail on error
    }
  }
}

module.exports = deleteFile;
