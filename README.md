# Economia

App web sencilla para gestionar economía personal, ahorro e inversiones.

## Cómo funciona

- La app es un único archivo `index.html`.
- No necesita servidor, React, Vite ni npm.
- Se publica directamente con GitHub Pages.
- Los datos se guardan en IndexedDB del navegador.
- Mantiene exportación e importación de copias de seguridad en JSON.
- Los datos iniciales son ficticios y solo sirven para probar la app.

## Publicación en GitHub Pages

1. Entra en `Settings`.
2. Abre `Pages`.
3. En `Source`, elige `Deploy from a branch`.
4. En `Branch`, elige `main`.
5. En `Folder`, elige `/root`.
6. Guarda.
7. Espera unos minutos.
8. Abre `https://llopezmaroto-ai.github.io/Economia/`.

## Copias de seguridad

Para no perder datos:

1. Entra en `Importar / Exportar`.
2. Pulsa `Exportar JSON`.
3. Guarda el archivo en un lugar privado.
4. Para recuperar datos, usa `Importar copia de seguridad`.

## Aviso

Los datos se guardan en el navegador y dispositivo que uses. Si cambias de navegador, perfil o dispositivo, tendrás que importar tu copia JSON.
