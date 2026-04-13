import * as userService from "../services/user.service.js";
import { handleGenericError } from "../utils/error.util.js";
import { handleGenericSuccess } from "../utils/success.util.js";
import { toBoolean } from "../utils/boolean.util.js";

export async function createUserController(req, res, next) {
  try {
    const userData = {
      nameUser: req.body.nameUser,
      email: req.body.email,
      password: req.body.password,
      profileImage: req.processedImagePath,
      userInfo: req.body.userInfo,
    };

    const newUser = await userService.createUser(userData);

    // Si el campo profileImage es "default", eliminarlo
    let realUser = newUser;
    if (newUser.profileImage === "default") {
      realUser = await userService.deleteDefaultProfileImage(newUser._id);
    }

    return handleGenericSuccess(
      res,
      201,
      realUser,
      "Usuario creado con éxito!"
    );
  } catch (error) {
    return handleGenericError(
      res,
      400,
      `Error al crear usuario: ${error.message}`
    );
  }
}

export async function getRandomUserController(req, res, next) {
  try {
    const user = await userService.getRandomUser();
    if (!user) {
      handleGenericError(res, 404, `No se encontró ningún usuario`);
    }

    handleGenericSuccess(res, 200, user, "Usuario random obtenido con exito!!");
  } catch (error) {
    if (error.message.includes("No se encontró ningún usuario")) {
      handleGenericError(res, 404, `No se encontró ningún usuario`);
    } else {
      handleGenericError(
        res,
        400,
        `Error al obtener un usuario random: ${error.message}`
      );
    }
    next(error);
  }
}

export async function getUserController(req, res, next) {
  try {
    const nameUser = req.params.nameUser;
    const lang = req.query.lang || "es"; // 🔹 nuevo: idioma por query (default español)
    const user = await userService.getUser(nameUser, lang);

    if (!user) {
      return handleGenericError(res, 404, `Usuario no encontrado`);
    }

    // 3. Filtrar datos sensibles
    const safeUserData = {
      id: user._id,
      nameUser: user.nameUser,
      email: user.email,
      profileImage: user.profileImage,
      userInfo: user.userInfo,
      galleries: user.galleries,
      images: user.images,
    };

    return handleGenericSuccess(
      res,
      200,
      safeUserData,
      "Usuario obtenido con éxito!!"
    );
  } catch (error) {
    if (error.message.includes("Usuario no encontrado")) {
      return handleGenericError(res, 404, `Usuario no encontrado`);
    } else {
      return handleGenericError(
        res,
        400,
        `Error al obtener un usuario random: ${error.message}`
      );
    }
  }
}

export async function getPublicUserController(req, res, next) {
  try {
    const nameUser = req.params.nameUser;
    const lang = req.query.lang || "es"; // 🔹 nuevo: idioma por query (default español)

    const user = await userService.publicGetUser(nameUser, lang);

    if (!user) {
      return handleGenericError(res, 404, "Usuario no encontrado");
    }

    handleGenericSuccess(res, 200, user, "Usuario obtenido con éxito!!");
  } catch (error) {
    if (error.message.includes("Usuario no encontrado")) {
      handleGenericError(res, 404, "Usuario no encontrado");
    } else {
      handleGenericError(
        res,
        400,
        `Error al obtener un usuario público: ${error.message}`
      );
    }
    next(error);
  }
}

export async function updateUserController(req, res, next) {
  const id = req.params.id;
  const userData = req.body;

  console.log("updateUserController - req.body.clearImage:", req.body.clearImage);
  console.log("updateUserController - req.body:", req.body);

  // Asegúrate de agregar processedImagePath si existe
  if (req.processedImagePath) {
    userData.profileImage = req.processedImagePath; // Asignar la ruta procesada de la imagen
  }

  const clearImage = toBoolean(req.body.clearImage);
  console.log("updateUserController - clearImage after toBoolean:", clearImage);

  try {
    const updateUser = await userService.updateUser(id, userData, clearImage);
    handleGenericSuccess(
      res,
      200,
      updateUser,
      "Usuario actualizado con exito!!"
    );
  } catch (error) {
    if (error.message.includes("Usuario no encontrados")) {
      handleGenericError(res, 404, `Usuario no encontrado`);
    } else {
      handleGenericError(
        res,
        400,
        `Error al modificar el usuario: ${error.message}`
      );
    }
    next(error);
  }
}

export async function requestPasswordResetController(req, res, next) {
  const { email } = req.body;
  try {
    const response = await userService.forgotPassword(email);
    handleGenericSuccess(
      res,
      200,
      response,
      "Solicitud de restablecimiento de contraseña enviada con exito!!"
    );
  } catch (error) {
    handleGenericError(
      res,
      500,
      `Error al solicitar restablecimiento de contraseña: ${error.message}`
    );
    next(error);
  }
}

export async function resetPasswordController(req, res, next) {
  const { email, token, newPassword } = req.body;
  try {
    const response = await userService.resetPasswordFlow(
      email,
      token,
      newPassword
    );
    handleGenericSuccess(
      res,
      200,
      response,
      "Restablecimiento de contraseña exitoso!!"
    );
  } catch (error) {
    if (error.code === "INVALID_TOKEN") {
      handleGenericError(
        res,
        400,
        `Token inválido o expirado: ${error.message}`
      );
    }
    if (error.code === "USER_NOT_FOUND") {
      handleGenericError(res, 404, `Usuario no encontrado: ${error.message}`);
    }
    handleGenericError(
      res,
      500,
      `Error al restablecer contraseña: ${error.message}`
    );
    next(error);
  }
}
