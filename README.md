# Clases de piano

Curso interactivo de iniciación al piano, en español. Publicado en <https://piano.cheru.org>.

- **31 lecciones** en 6 bloques: el teclado, el pentagrama y las claves (sol, fa y el sistema de piano), el ritmo, primeras melodías, alteraciones/escalas/acordes y lectura completa de partituras.
- **Figuras animadas e interactivas** en cada explicación y **ejercicios** que se tocan: encontrar teclas, leer notas, marcar ritmos, completar compases, tocar melodías y preguntas.
- **15 canciones** con tres modos (escuchar, paso a paso, a tempo), manos separadas, velocidad ajustable y cascada de notas.
- **Práctica libre**: lectura de notas, ritmo y piano libre con metrónomo.
- **Glosario** visual de símbolos de la partitura.
- **Cuentas de alumno**: lecciones superadas, estrellas, canciones, tiempo y racha de práctica. Sin cuenta, el progreso se guarda en el navegador y se fusiona al registrarse.
- Se toca con **teclado MIDI** (Web MIDI), con el teclado del ordenador o con ratón/dedo.

## Arquitectura

Sin dependencias ni paso de compilación.

| Parte | Dónde | Notas |
|---|---|---|
| Servidor | `server/server.js` | Node ≥ 24: `node:http` + `node:sqlite`. Estáticos, API JSON, sesiones por cookie `HttpOnly`, contraseñas con scrypt. |
| Datos | `DATA_DIR/piano.db` | SQLite: `users`, `sessions`, `progress`, `activity`. |
| Interfaz | `public/` | Módulos ES nativos. |
| Partituras | `public/js/staff.js` | Grabador propio en SVG con la tipografía Bravura (SMuFL). |
| Sonido | `public/js/audio.js` | Piano sintetizado con Web Audio; metrónomo y secuenciador. |
| Entrada | `public/js/input.js` | Bus común para teclado en pantalla, teclado del ordenador y MIDI. |
| Intérprete | `public/js/player.js` | Modos de escucha, espera y a tempo; cascada de notas. |
| Contenido | `public/js/content/` | Temario (`curriculum1.js`, `curriculum2.js`), canciones (`songs.js`), glosario (`symbols.js`). |

### Añadir contenido

Las melodías se escriben con una notación compacta (`public/js/content/dsl.js`):

```js
n('E4q@3 E4 F4 G4 | E4q. D4e D4h')   // altura + duración (w h q e s, "." puntillo) + @dedo
```

- **Canción nueva**: añade un objeto a `SONGS` en `songs.js` (`rh`, `lh`, `time`, `key`, `pickup`, `bpm`).
- **Lección nueva**: añade un objeto con `steps` a un bloque del temario. Cada paso puede llevar `html`, una figura (`fig: ['nombre', opciones]`, ver `figures.js`) y un ejercicio (`ex: ['quiz' | 'keys' | 'read' | 'rhythm' | 'measure' | 'play', opciones]`, ver `widgets.js`).

Los identificadores de lecciones y canciones son la clave del progreso guardado: no los cambies una vez publicados.

## Desarrollo

```sh
npm run dev          # http://localhost:8080, datos en ./data
```

## Despliegue

```sh
./deploy.sh          # construye la imagen y actualiza el stack «piano» (Swarm + Traefik)
```

Los datos viven en `/home/dietpi/data/containers/piano`. Para hacer copia de seguridad basta con copiar `piano.db` (con el servicio parado, o con `sqlite3 piano.db ".backup copia.db"`).

### Restablecer la contraseña de un alumno

No se pide correo, así que no hay recuperación automática:

```sh
docker exec -it $(docker ps -qf name=piano_piano) node server/reset-password.js <usuario> <contraseña-nueva>
```

## Licencias

- Bravura: SIL Open Font License. Bodoni Moda y Atkinson Hyperlegible Next: SIL Open Font License.
- Las melodías son tradicionales o de dominio público.
