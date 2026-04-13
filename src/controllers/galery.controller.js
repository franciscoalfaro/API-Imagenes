import {
  createGallery,
  updateGallery,
  deleteGallery,
} from "../services/gallery.service.js";
import { handleGenericError } from "../utils/error.util.js";
import { handleGenericSuccess } from "../utils/success.util.js";

export async function createGalleryController(req, res) {
  try {
    const { name, description, imageIds, public: isPublic } = req.body;
    const userId = req.user.id; // Obtenido desde el middleware de autenticación

    const newGallery = await createGallery(
      { name, description, public: isPublic, userId },
      imageIds
    );

    return handleGenericSuccess(
      res,
      201,
      newGallery,
      "Galería creada exitosamente!"
    );
  } catch (error) {
    return handleGenericError(
      res,
      400,
      `Error al crear galería: ${error.message}`
    );
  }
}


export async function updateGalleryController(req, res, next) {
  try {
    const userId = req.user.id;
    const idGallery = req.params.id;
    const galleryData = req.body;

    const updatedGallery = await updateGallery(idGallery, userId, galleryData);
    handleGenericSuccess(
      res,
      200,
      updatedGallery,
      "Galeria actualizada correctamente!"
    );
  } catch (error) {
    handleGenericError(
      res,
      400,
      `Error al actualizar galería: ${error.message}`
    );
    next(error);
  }
}

export async function deleteGalleryController(req, res, next) {
  try {
    const userId = req.user.id;
    const idGallery = req.params.id;

    await deleteGallery(idGallery, userId);

    res.status(200).json({
      status: "success",
      message: "Galeria eliminada correctamente!"
    });
  } catch (error) {
    handleGenericError(
      res,
      400,
      `Error al eliminar galería: ${error.message}`
    );
    next(error);
  }
}
