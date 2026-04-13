import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DB = process.env.MONGODB_URI;
export const TOKEN_SECRET = process.env.TOKEN_SECRET;
export const IMAGES_DIR = path.join(__dirname, "uploads");
export const API_KEY_BREVO = process.env.BREVO_API_KEY;
export const EMAIL = process.env.SUPPORT_EMAIL;
export const MYMEMORY = "https://api.mymemory.translated.net/get";
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

export function ensureUploadsDir() {
	if (!fs.existsSync(IMAGES_DIR)) {
		fs.mkdirSync(IMAGES_DIR, { recursive: true });
		console.log(`[INIT] Carpeta uploads creada en: ${IMAGES_DIR}`);
	}
}