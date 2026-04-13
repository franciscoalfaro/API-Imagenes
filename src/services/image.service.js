import fs from "fs";
import path from "path";
import Image from "../models/image.model.js";
import User from "../models/user.model.js";
import Gallery from "../models/gallery.model.js";
import { IMAGES_DIR } from "../config.js";

const imagesDir = IMAGES_DIR;

export async function createImage(outputPath, userId, imageData) {
  try {
    const galleries = [];
    // Validar las galerías si se proporcionan galleryIds
    if (imageData.galleryIds && Array.isArray(imageData.galleryIds)) {
      const validGalleries = await Gallery.find({
        _id: { $in: imageData.galleryIds },
        user: userId,
      });

      if (validGalleries.length !== imageData.galleryIds.length) {
        throw new Error(
          "Algunas galerías no existen o no pertenecen al usuario."
        );
      }

      // Agregar las galerías válidas al arreglo
      galleries.push(...validGalleries.map((gallery) => gallery._id));
    }

    const newImage = new Image({
      name: imageData.name,
      path: outputPath,
      public: imageData.public || true,
      user: userId,
      galleries,
    });

    const savedImage = await newImage.save();

    // Actualiza el usuario para incluir la nueva imagen en el arreglo de imágenes
    await User.findByIdAndUpdate(userId, { $push: { images: savedImage._id } });

    // Actualiza cada galería para incluir la imagen en su arreglo
    if (galleries.length > 0) {
      await Promise.all(
        galleries.map((galleryId) =>
          Gallery.findByIdAndUpdate(galleryId, {
            $push: { images: savedImage._id },
          })
        )
      );
    }

    return savedImage;
  } catch (error) {
    throw new Error(`Error al subir la imagen: ${error.message}`);
  }
}

export async function deleteUncompressedImages() {
  try {
    // Lee todos los archivos en la carpeta de imágenes
    const files = await fs.promises.readdir(imagesDir);

    // Itera sobre los archivos y elimina los que no contienen 'compressed' en su nombre
    const deletePromises = files.map(async (file) => {
      if (!file.startsWith("compressed")) {
        const filePath = path.join(imagesDir, file);
        await fs.promises.unlink(filePath); // Elimina el archivo
      }
    });

    // Espera a que todas las eliminaciones se completen
    await Promise.all(deletePromises);
  } catch (error) {
    throw new Error(
      `Error al eliminar imágenes no comprimidas: ${error.message}`
    );
  }
}

export async function updateImage(imageId, userId, imageData) {
  try {
    const existingImage = await Image.findById(imageId);
    if (!existingImage) {
      throw new Error("Imagen no encontrada.");
    }

    if (existingImage.user.toString() !== userId.toString()) {
      throw new Error("No tienes permisos para modificar esta imagen.");
    }

    let galleries = existingImage.galleries;

    if (imageData.galleryIds !== undefined) {
      if (Array.isArray(imageData.galleryIds) && imageData.galleryIds.length > 0) {
        const validGalleries = await Gallery.find({
          _id: { $in: imageData.galleryIds },
          user: userId,
        });

        if (validGalleries.length !== imageData.galleryIds.length) {
          throw new Error("Algunas galerías no existen o no pertenecen al usuario.");
        }

        galleries = validGalleries.map((gallery) => gallery._id);
      } else {
        galleries = [];
      }
    }

    if (imageData.name !== undefined) {
      existingImage.name = imageData.name;
    }
    
    if (imageData.public !== undefined) {
      console.log("updateImage - public value:", imageData.public, typeof imageData.public);
      existingImage.public = imageData.public === true || imageData.public === "true";
      console.log("updateImage - saved public value:", existingImage.public);
    }
    
    existingImage.galleries = galleries;

    const updatedImage = await existingImage.save();

    await Gallery.updateMany(
      { images: imageId },
      { $pull: { images: imageId } }
    );

    if (galleries.length > 0) {
      await Promise.all(
        galleries.map((galleryId) =>
          Gallery.findByIdAndUpdate(galleryId, {
            $addToSet: { images: imageId },
          })
        )
      );
    }

    return updatedImage;
  } catch (error) {
    throw new Error(`Error al actualizar la imagen: ${error.message}`);
  }
}

export async function deleteImage(imageId, userId) {
  try {
    const image = await Image.findById(imageId);
    if (!image) {
      throw new Error("Imagen no encontrada.");
    }

    // Verificar que el usuario sea propietario de la imagen
    if (image.user.toString() !== userId.toString()) {
      throw new Error("No tienes permisos para eliminar esta imagen.");
    }

    // Eliminar asociaciones con galerías
    if (image.galleries && image.galleries.length > 0) {
      await Gallery.updateMany(
        { _id: { $in: image.galleries } },
        { $pull: { images: imageId } }
      );
    }

    // Eliminar asociación con el usuario
    await User.findByIdAndUpdate(userId, {
      $pull: { images: imageId },
    });

    // Eliminar físicamente la imagen
    try {
      await deleteImageFile(imageId);
    } catch (error) {
      throw new Error("No se pudo eliminar la imagen físicamente.");
    }

    const deletedImage = await Image.findByIdAndDelete(imageId);

    return deletedImage;
  } catch (error) {
    throw new Error(`Error al eliminar la imagen: ${error.message}`);
  }
}

export async function deleteImageFile(imageId) {
  try {
    const image = await Image.findById(imageId);
    if (!image) {
      throw new Error("Imagen no encontrada.");
    }

    const relativePath = image.path;

    if (!relativePath) {
      throw new Error("Ruta de imagen no encontrada en la base de datos.");
    }

    // Construir la ruta absoluta usando IMAGES_DIR
    const absolutePath = path.join(imagesDir, relativePath);

    // Verificar si el archivo existe
    if (!fs.existsSync(absolutePath)) {
      throw new Error("El archivo de la imagen no existe en el sistema.");
    }

    // Eliminar el archivo físicamente
    await fs.promises.unlink(absolutePath);
    console.log(`Archivo eliminado correctamente: ${absolutePath}`);
  } catch (error) {
    throw new Error(
      `Error al eliminar físicamente la imagen: ${error.message}`
    );
  }
}
