import crypto from "crypto";

const ALGORITHM = process.env.ENCRYPTION_ALGORITHM;
const SECRET_KEY = process.env.ENCRYPTION_KEY;

/**
 * 
 * @param {String} text - text string to encrypt
 * @returns {Object}
 */
function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  }
}

/**
 * 
 * @param {Object} hash
 * @returns {String}
 */
function decrypt(hash) {    
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, Buffer.from(hash.iv, 'hex'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])

  return decrypted.toString();
}

export {
  encrypt,
  decrypt
}
