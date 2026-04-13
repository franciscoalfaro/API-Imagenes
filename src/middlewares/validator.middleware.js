import fs from "fs/promises";
import path from "path";

export const validateSchema = (schema) => (req, res, next) => {
  try {
    if (req.body.public !== undefined) {
      req.body.public = req.body.public === true || req.body.public === "true";
    }

    schema.parse(req.body);

    next();
  } catch (error) {
    let errorMessage;
    if (error.errors && error.errors.length > 0 && error.errors[0].message) {
      errorMessage = error.errors[0].message;
    } else {
      errorMessage = error.message;
    }
    res.status(400).json({ error: errorMessage });
  }
};

export const validateSchemaParams = (schema) => (req, res, next) => {
  try {
    schema.parse(req.params);
    next();
  } catch (error) {
    let errorMessage;
    if (error.errors && error.errors.length > 0 && error.errors[0].message) {
      errorMessage = error.errors[0].message;
    } else {
      errorMessage = error.message;
    }
    res.status(400).json({ error: errorMessage });
  }
};

export const validateSchemaWithFileAndCleanup =
  (schema, fileKey, uploadDir) => async (req, res, next) => {
    try {
      const data = {
        name: req.body.name,
        public: Boolean(req.body.public),
        galleryId: req.body.galleryId,
        path: req[fileKey], // Archivo procesado
      };

      schema.parse(data);

      next();
    } catch (error) {
      try {
        // Construir la ruta completa del archivo
        const filePath = path.join(uploadDir, req[fileKey]);

        // Verificar si el archivo existe antes de eliminarlo
        await fs.access(filePath); // Si no existe, lanzará un error

        // Eliminar el archivo
        await fs.unlink(filePath);
        console.log("Imagen inválida eliminada correctamente.");
      } catch (unlinkError) {
        if (unlinkError.code === "ENOENT") {
          console.log("El archivo ya no existe, nada que eliminar.");
        } else {
          console.error(`Error al eliminar la imagen: ${unlinkError.message}`);
        }
      }

      // Devolver el error de validación al cliente
      const errorMessage = error.errors?.[0]?.message || "Error de validación";
      return res.status(400).json({ error: errorMessage });
    }
  };

export const validateUserSchemaWithFileAndCleanup =
  (schema, fileKey, uploadDir) => (req, res, next) => {
    try {
      const data = {
        nameUser: req.body.nameUser,
        email: req.body.email,
        password: req.body.password,
        profileImage: req[fileKey],
        userInfo: req.body.userInfo,
      };

      schema.parse(data);

      next();
    } catch (error) {
      // Limpiar el archivo en caso de error
      if (req[fileKey]) {
        const filePath = path.join(uploadDir, req[fileKey]);
        fs.unlink(filePath, (unlinkError) => {
          if (unlinkError) {
            if (unlinkError.code === "ENOENT") {
              console.log("El archivo ya no existe, nada que eliminar.");
            } else {
              console.error(
                `Error al eliminar la imagen: ${unlinkError.message}`
              );
            }
          } else {
            console.log("Imagen inválida eliminada correctamente.");
          }
        });
      }

      // Devolver el error al cliente
      const errorMessage = error.errors?.[0]?.message || "Error de validación";
      return res.status(400).json({ error: errorMessage });
    }
  };

export const validateUserSchemaWithFileAndCleanupForUpdate =
  (schema, fileKey, uploadDir) => (req, res, next) => {
    try {
      const data = {
        nameUser: req.body.nameUser || undefined,
        email: req.body.email || undefined,
        password: req.body.password || undefined,
        profileImage: req.processedImagePath || undefined,
        userInfo: req.body.userInfo || undefined,
      };

      schema.parse(data);

      next();
    } catch (error) {
      // Limpiar el archivo en caso de error (si se subió un archivo y ocurrió un error de validación)
      if (req[fileKey]) {
        const filePath = path.join(uploadDir, req[fileKey]);
        fs.unlink(filePath, (unlinkError) => {
          if (unlinkError) {
            if (unlinkError.code === "ENOENT") {
              console.log("El archivo ya no existe, nada que eliminar.");
            } else {
              console.error(
                `Error al eliminar la imagen: ${unlinkError.message}`
              );
            }
          } else {
            console.log("Imagen inválida eliminada correctamente.");
          }
        });
      }

      // Devolver el error al cliente
      const errorMessage = error.errors?.[0]?.message || "Error de validación";
      return res.status(400).json({ error: errorMessage });
    }
  };
