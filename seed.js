import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/models/user.model.js";
import Gallery from "./src/models/gallery.model.js";
import Image from "./src/models/image.model.js";

dotenv.config();

const users = [
  { nameUser: "artista_foto", email: "artista@test.com", password: "Artista123", userInfo: "Fotógrafo profesional especializado en paisajes naturales." },
  { nameUser: "maria_arte", email: "maria@test.com", password: "Maria2024", userInfo: "Artista visual y diseñadora gráfica." },
  { nameUser: "carlos_dev", email: "carlos@test.com", password: "Carlos456", userInfo: "Desarrollador web y amante de la fotografía urbana." },
  { nameUser: "laura_viajes", email: "laura@test.com", password: "Laura789", userInfo: "Viajera apasionada, compartiendo momentos del mundo." },
  { nameUser: "pablo_foto", email: "pablo@test.com", password: "Pablo321", userInfo: "Fotógrafo de naturaleza y vida salvaje." },
  { nameUser: "ana_retratos", email: "ana@test.com", password: "Ana654", userInfo: "Especialista en retratos y fotografía de estudio." },
  { nameUser: "juan_urban", email: "juan@test.com", password: "Juan987", userInfo: "Fotografía urbana y arquitectónica." },
  { nameUser: "sofia_color", email: "sofia@test.com", password: "Sofia456", userInfo: "Artista del color y la abstracción visual." },
  { nameUser: "david_macro", email: "david@test.com", password: "David789", userInfo: "Fotógrafo macro y de detalles diminutos." },
  { nameUser: "elena_luz", email: "elena@test.com", password: "Elena123", userInfo: "Exploradora de la luz en sus diversas formas." },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado a MongoDB");

    await Image.deleteMany({});
    await Gallery.deleteMany({});
    await User.deleteMany({});
    console.log("Colecciones limpiadas");

    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        nameUser: userData.nameUser,
        email: userData.email,
        password: hashedPassword,
        userInfo: { es: userData.userInfo },
        status: true,
      });
      createdUsers.push(user);
      console.log(`Usuario creado: ${userData.nameUser}`);
    }

    for (const user of createdUsers) {
      const numGalleries = Math.floor(Math.random() * 3) + 1;
      const userGalleries = [];

      for (let i = 0; i < numGalleries; i++) {
        const gallery = await Gallery.create({
          name: `Galería ${i + 1} de ${user.nameUser}`,
          description: `Una colección de imágenes de ${user.nameUser}`,
          public: Math.random() > 0.3,
          user: user._id,
        });
        userGalleries.push(gallery);
        console.log(`  Galería creada: ${gallery.name}`);
      }

      user.galleries = userGalleries.map(g => g._id);
      await user.save();
    }

    console.log("\n✅ Seed completado exitosamente!");
    console.log(`   - ${createdUsers.length} usuarios creados`);
    console.log("\nCredenciales de prueba:");
    console.log("------------------------");
    users.forEach(u => {
      console.log(`Usuario: ${u.email} | Contraseña: ${u.password}`);
    });
    console.log("------------------------");

  } catch (error) {
    console.error("Error en el seed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado de MongoDB");
  }
}

seed();
