# 🤝 Guía de contribución

## 🔀 Flujo de ramas
- `main`: código listo para producción
- `develop`: integración de features
- `feature/*`: ramas de desarrollo
- `hotfix/*`: correcciones urgentes en producción

## ✅ Estándares de commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: descripción` → nueva funcionalidad
- `fix: descripción` → bugfix
- `chore: descripción` → tareas menores, config
- `docs: descripción` → cambios en documentación
- `test: descripción` → cambios en tests

## 🧪 Tests
- Ejecutar `bun test` antes de abrir PR.
- Los PRs deben incluir tests nuevos o actualizados.

## 📋 PRs
- Usar la plantilla de PR.
- Asignar reviewers según CODEOWNERS.
- QA valida en staging antes de mergear a `main`.
