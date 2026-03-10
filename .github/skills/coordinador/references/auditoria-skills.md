# Auditoría de Skills del Sistema

Usá esta guía cuando el usuario pida revisar todos los skills, o cuando el coordinador
detecte degradación sistémica de calidad.

## Cuándo hacer una auditoría

- El usuario pide explícitamente "revisá todos los skills"
- Se detectaron inconsistencias entre varios agentes
- Pasó mucho tiempo sin actualizar los skills (más de 10 tareas)
- Se cambió algo fundamental del stack o arquitectura del proyecto

## Checklist por skill

Para cada SKILL.md del sistema, verificar:

### Vigencia del contenido
- [ ] El stack mencionado está actualizado (versiones, librerías)
- [ ] Las convenciones de código reflejan las actuales del proyecto
- [ ] Los ejemplos de código siguen los patrones actuales
- [ ] No hay referencias a features descartadas o renombradas

### Cobertura
- [ ] Cubre los casos de uso más frecuentes del dominio
- [ ] Tiene checklist de calidad
- [ ] Tiene sección de errores frecuentes
- [ ] El trigger en el frontmatter es claro y específico

### Integración
- [ ] El agente sabe cuándo escalar a otro agente
- [ ] No duplica responsabilidades de otro agente
- [ ] Está correctamente referenciado en el coordinador

## Proceso de auditoría

1. Listar todos los skills disponibles
2. Para cada skill, leer su SKILL.md y verificar el checklist
3. Documentar los gaps encontrados
4. Priorizar cambios por impacto
5. Aplicar cambios empezando por los más críticos
6. Registrar en AGENT.md la auditoría completada

## Output esperado
```markdown
## Resultado de Auditoría — [fecha]

| Skill | Estado | Cambios aplicados |
|-------|--------|------------------|
| backend | ✅ OK | Ninguno |
| frontend | ⚠️ Desactualizado | Actualizada versión React |
...

**Skills nuevos detectados:** [lista si hay]
**Skills a deprecar:** [lista si hay]
```