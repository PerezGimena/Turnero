# TurnoSalud — Instrucciones del Agente IA
# Claude Sonnet 4.6 via GitHub Copilot

---

## INSTRUCCIÓN ÚNICA DE INICIO

Antes de responder CUALQUIER tarea, ejecutá este protocolo completo sin excepción:

```
1. Leer #file:.github/skills/coordinador/SKILL.md
2. Leer #file:AGENT.md
3. Decidir qué skill(s) usar según el árbol de decisión del coordinador
4. Leer el SKILL.md del agente elegido
5. Ejecutar la tarea
6. Aplicar Protocolo de Aprendizaje Continuo (mejorar skills si hace falta)
7. Actualizar AGENT.md con el registro del trabajo realizado
```

**El agente NO necesita que el usuario le diga qué skill usar.**
**El agente decide solo leyendo el coordinador.**
**El agente nunca termina una tarea sin actualizar AGENT.md.**

---

## CÓMO INVOCAR AL AGENTE

### Forma estándar — el agente decide todo:
```
[DESCRIBIR LA TAREA]
```

### Para bugs:
```
Error: [PEGAR EL ERROR COMPLETO]
```

### Para forzar un agente específico:
```
Usando el skill de [nombre], [TAREA]
```

---

## STACK (referencia rápida)

```
Frontend: React 19 + Vite | Sin TypeScript — todo .jsx y .js
Backend:  Express + Sequelize | Sin TypeScript — todo .js
Base de datos: MySQL 8 — base: turnosalud
UI: Tailwind v3.4 — NO usar sintaxis v4
Auth: JWT
Idioma UI: español rioplatense (vos, tu)
Puerto backend: 3001 | Puerto frontend: 5173
Skills: .github/skills/[agente]/SKILL.md
Estado: AGENT.md (fuente de verdad del proyecto)
```

---

## MÓDULOS DEL SISTEMA

```
Paciente     → acceso público, sin autenticación
Profesional  → autenticado con JWT
Admin SaaS   → administración de la plataforma
```

---

## REGLAS ABSOLUTAS

```
❌ NO TypeScript — solo .jsx y .js
❌ NO Tailwind v4 — usar solo v3.4
❌ NO historia clínica, facturación AFIP, inventario
❌ NO hardcodear datos mock en producción
✅ Español rioplatense en toda la UI (vos, tu)
✅ Mobile-first — probar en 375px / 768px / 1280px
✅ Toda query con filtro de tenant correspondiente
```