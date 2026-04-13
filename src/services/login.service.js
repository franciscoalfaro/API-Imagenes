import bcrypt from "bcrypt";
import User from "../models/user.model.js";

export async function login(email, password) {
  try {
    const user = await User.findOne({ email, status: true });
    if (!user) {
      return false;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return false;
    }
    return true;
  } catch (error) {
    throw new Error(`Error al realizar el login: ${error.message}`);
  }
}
