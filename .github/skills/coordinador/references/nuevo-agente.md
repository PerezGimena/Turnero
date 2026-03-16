# Cómo crear un agente nuevo

Usá esta guía cuando el Protocolo de Aprendizaje Continuo detecte que se necesita un agente nuevo.

## Cuándo crear un agente nuevo

- Surgió un dominio de trabajo que ningún agente actual cubre bien
- Una combinación de dos agentes se usa siempre junta y merece ser su propio especialista
- La complejidad de un área creció tanto que necesita su propio SKILL.md dedicado

## Estructura mínima
```
.github/skills/[nombre-agente]/
└── SKILL.md
```

## Template de SKILL.md para un agente nuevo
```markdown
---
name: [nombre-agente]
description: >
  [Descripción de cuándo activar este skill. Incluir ejemplos de frases o contextos
  que deben activarlo. Ser específico y directo.]
---

# Senior [Nombre] — TurnoSalud

## Contexto del proyecto
[Stack relevante para este agente, restricciones, convenciones]

## Responsabilidades de este agente
[Lista de lo que hace y NO hace este agente]

## Protocolo de trabajo
1. [Paso 1]
2. [Paso 2]

## Patrones y convenciones
[Código de ejemplo, estructuras de archivos, convenciones de naming]

## Checklist de calidad
- [ ] [Item 1]
- [ ] [Item 2]

## Errores frecuentes a evitar
- [Error 1 y cómo evitarlo]
```

## Pasos para crear el agente

1. Crear el directorio y SKILL.md con el template de arriba
2. Llenar cada sección con contenido específico del dominio
3. Agregar el agente al mapa de agentes en `coordinador/SKILL.md`
4. Agregar al árbol de decisión si corresponde
5. Registrar en el Log de Aprendizaje al final de la tarea

## Log de aprendizaje esperado
```
🧠 Aprendizaje registrado:
- Agente nuevo creado: [nombre]
- Dominio: [descripción breve]
- Motivo: [qué situación lo disparó]
```