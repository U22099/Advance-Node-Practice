import fs from "fs";
import zlib from "zlib";
import crypto from "crypto";
import { Transform } from "stream";

// const psw = Buffer.from("hello");
// const ivTxt = Buffer.from("hey");

// const key = crypto.createHash("sha256").update(psw).digest();
// const iv = crypto.createHash("sha256").update(ivTxt).digest().slice(0, 16);

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

class EncryptStream extends Transform {
  constructor(key, iv) {
    super();
    this.cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  }

  _transform(chunk, encoding, callback) {
    this.push(this.cipher.update(chunk));
    callback();
  }

  _flush(callback) {
    this.push(this.cipher.final());
    callback();
  }
}

const fileToReadStream = fs.createReadStream("input.txt");
const encryptStream = new EncryptStream(key, iv);
const writeStream = fs.createWriteStream("output.txt.gz.enc");

// DECRYPTION & DECOMPRESSION

class DecryptStream extends Transform {
  constructor(key, iv) {
    super();
    this.cipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  }

  _transform(chunk, encoding, callback) {
    this.push(this.cipher.update(chunk));
    callback();
  }

  _flush(callback) {
    this.push(this.cipher.final());
    callback();
  }
}

fileToReadStream
  .pipe(zlib.createGzip())
  .pipe(encryptStream)
  .pipe(writeStream)
  .on("finish", () => {
    console.log("Encryption and compression successful!");
    console.log("Starting decryption and decompression");

    const decryptStream = new DecryptStream(key, iv);
    const fileToReadStream2 = fs.createReadStream("output.txt.gz.enc");
    const writeStream2 = fs.createWriteStream("output_decrypt.txt");

    fileToReadStream2
      .pipe(decryptStream)
      .pipe(zlib.createGunzip())
      .pipe(writeStream2)
      .on("finish", () => {
        console.log("Decryption and decompression successful!");
      })
      .on("error", (err) => {
        console.error("Pipeline failed:", err.message);
      });
  })
  .on("error", (err) => {
    console.error("Pipeline failed:", err.message);
  });

console.log(key.toString("hex"), iv.toString("hex"));
