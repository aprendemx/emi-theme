# Divergencias intencionales respecto a tutor-indigo

Archivos donde EMI se aparta de upstream a proposito. Al evaluar un salto
de version, estos NO requieren merge: se revisa que la divergencia siga
teniendo sentido y se cierra.

## lms/templates/static_templates/{about,blog,contact,donate,help,privacy,tos}.html
Base: indigo v18.0.0
EMI reescribio las siete paginas por completo; no usan `static.url()` ni el
bloque `graphic-img` de Indigo.
Cambio de upstream v18->v20: anadir `<img class="dark" src=".../X-dark.svg">`
para el modo oscuro. NO APLICA: no existe el bloque donde insertarlo.
Nota: los SVG heredados (about.svg, blog.svg, ...) parecen huerfanos.
