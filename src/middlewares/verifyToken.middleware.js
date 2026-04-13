import jwt from "jsonwebtoken";
import { handleGenericError } from "../utils/error.util.js";
import User from "../models/user.model.js";
import { TOKEN_SECRET } from "../config.js";

export async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return handleGenericError(res, 401, "Acceso no autorizado");
    }

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    const user = await User.findById(decoded.id);

    if (!user) {
      return handleGenericError(res, 401, "Usuario no encontrado en la base de datos");
    }

    if (!user.status) {
      return handleGenericError(res, 401, "Usuario inactivo");
    }

    req.user = {
      id: user._id,
      nameUser: user.nameUser,
      email: user.email,
      profileImage: user.profileImage,
      userInfo: user.userInfo,
      galleries: user.galleries,
      images: user.images,
    };

    next();
  } catch (error) {
    const message =
      error instanceof jwt.JsonWebTokenError
        ? "Token inválido"
        : error instanceof jwt.TokenExpiredError
        ? "Token expirado"
        : "Error de autenticación";

    handleGenericError(res, 401, message);
  }
}

export function checkUserOwnership(req, res, next) {
  try {
    const idParams = String(req.params.id);
    const loggedInUser = String(req.user.id); // req.user.id es ObjectId => str

    if (idParams !== loggedInUser) {
      return res.status(403).json({
        message: "No tienes permisos para modificar este usuario",
      });
    }

    next();
  } catch (e) {
    return res.status(500).json({ message: "Error al validar propiedad" });
  }
}

