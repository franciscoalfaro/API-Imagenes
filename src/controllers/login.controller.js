import * as loginService from "../services/login.service.js";
import * as userService from "../services/user.service.js";
import { handleGenericError } from "../utils/error.util.js";
import { handleGenericSuccess } from "../utils/success.util.js";
import { createToken } from "../libs/jwt.js";
import { COOKIE_DOMAIN } from "../config.js";

export async function loginController(req, res, next) {
  const { email, password } = req.body;
  try {
    const success = await loginService.login(email, password);
    if (!success) {
      return handleGenericError(res, 401, "Credenciales incorrectas");
    }

    const user = await userService.findUser(email);
    if (!user) {
      return handleGenericError(
        res,
        404,
        `Usuario con el correo ${email} no encontrado`
      );
    }

    const token = await createToken({ id: user._id });

    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction && COOKIE_DOMAIN ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    if (COOKIE_DOMAIN && isProduction) {
      cookieOptions.domain = COOKIE_DOMAIN;
    }

    res.cookie("token", token, cookieOptions);

    const userData = {
      _id: user._id,
      nameUser: user.nameUser,
      email: user.email,
      profileImage: user.profileImage,
      userInfo: user.userInfo,
      galleries: user.galleries,
      images: user.images,
    };

    handleGenericSuccess(res, 200, userData, "Login exitoso");
  } catch (error) {
    handleGenericError(res, 500, `Error al hacer el login: ${error.message}`);
    next(error);
  }
}

export async function logout(req, res) {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
      expires: new Date(0),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction && COOKIE_DOMAIN ? "None" : "Lax",
      path: "/",
    };

    if (COOKIE_DOMAIN && isProduction) {
      cookieOptions.domain = COOKIE_DOMAIN;
    }

    res.cookie("token", "", cookieOptions);
    return res.sendStatus(204);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return res.status(500).send("Error al cerrar sesión");
  }
}
