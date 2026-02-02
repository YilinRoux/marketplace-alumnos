import express, { Request, Response, NextFunction } from "express";

const app = express();
app.use(express.json());

app.get("/", (_: Request, res: Response) => {
  res.send("Backend OK");
});

// Ruta no encontrada (404)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// Manejador de errores del servidor (500)
app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
  console.error("Error interno:", err.stack);
  res.status(500).json({
    error: "Error interno del servidor",
  });
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend corriendo en el puerto ${PORT}`);
});
