# Política de Versionado — DataDaphne

DataDaphne sigue el estándar **Semantic Versioning 2.0.0** ([semver.org](https://semver.org)).

---

## Formato

```
MAJOR.MINOR.PATCH
```

| Segmento | Cuándo incrementa |
|---|---|
| `MAJOR` | Cambios que rompen compatibilidad con versiones anteriores |
| `MINOR` | Nueva funcionalidad que no rompe compatibilidad |
| `PATCH` | Correcciones de bugs sin nuevas funcionalidades |

---

## Ejemplos prácticos

| Versión | Qué ocurrió |
|---|---|
| `0.1.0` | Primera versión funcional pública (MVP) |
| `0.1.1` | Corrección de bug en la detección de Docker |
| `0.2.0` | Soporte para un nuevo motor de base de datos |
| `1.0.0` | Primera versión estable y lista para producción |
| `2.0.0` | Cambio de arquitectura o ruptura de API interna |

---

## Reglas del proyecto

### Rama `0.x.y` — Desarrollo inicial
- Mientras el proyecto esté en `0.x.y`, se considera en desarrollo activo.
- Los cambios de `MINOR` pueden incluir modificaciones que rompan la versión anterior.
- No hay garantía de estabilidad hasta `1.0.0`.

### Versión `1.0.0` — Primera estable
Se alcanza cuando:
- El flujo completo de instalación y gestión de Docker funciona de forma confiable.
- Al menos 4 motores de bases de datos están soportados (PostgreSQL, MySQL, MongoDB, Redis).
- La UI es navegable sin errores bloqueantes.

### Pre-releases
Para versiones en prueba antes de un release oficial, se usa el sufijo:

```
1.0.0-alpha.1
1.0.0-beta.2
1.0.0-rc.1
```

| Sufijo | Significado |
|---|---|
| `alpha` | Funcionalidad incompleta, solo para pruebas internas |
| `beta` | Funcionalidad completa pero no verificada, pruebas externas |
| `rc` (Release Candidate) | Lista para producción salvo bugs críticos encontrados |

---

## Dónde vive la versión

La versión oficial del proyecto está declarada en `package.json`:

```json
{
  "name": "datadaphne",
  "version": "0.1.0"
}
```

Cada release debe tener su correspondiente **Git tag**:

```bash
git tag v0.1.0
git push origin v0.1.0
```

---

## Historial de versiones

| Versión | Fecha | Descripción |
|---|---|---|
| `0.1.0` | (pendiente) | MVP — primera versión funcional |
