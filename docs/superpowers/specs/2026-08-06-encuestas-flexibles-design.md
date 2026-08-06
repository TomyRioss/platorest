# Encuestas flexibles — design

## Contexto

Hoy `SurveyConfig` tiene 2 slots fijos por negocio (`INTERNAL`: 3 preguntas de estrellas hardcodeadas; `EXTERNAL`: link a Google Maps + botón manual de "reclamar puntos"). Se reemplaza por un sistema tipo Google Forms: lista libre de encuestas configurables por negocio, con preguntas de distinto tipo combinables, más un tipo especial de "acción-link" que se completa con un solo click.

El modelo `Survey` (rating/nps/comment) es independiente y no se usa en ningún código de `app/` — queda fuera de este cambio.

## Decisiones

- N encuestas libres por negocio, no slots fijos.
- Encuesta tipo **Formulario**: preguntas combinables de tipo Estrella (1-5) o Texto corto, en el orden que el negocio defina (drag & drop con `@dnd-kit`, ya instalado).
- Encuesta tipo **Acción-link**: URL + label de botón, ícono genérico de link externo. Click en el botón abre el link Y marca completado + suma puntos en el mismo paso (sin botón de "reclamar" separado).
- Puntos: uno por encuesta completa (no por pregunta).
- Sin migración de datos: se dropean `Survey`/`SurveyType`/`SurveyConfig`/`SurveyCompletion` viejos y se arranca de cero. Cada negocio recrea sus encuestas desde el dashboard.

## Modelo de datos (Prisma)

```prisma
enum QuestionType {
  STAR
  TEXT
}

enum SurveyKind {
  FORM
  LINK_ACTION
}

model SurveyDefinition {
  id          String     @id @default(cuid())
  businessId  String
  business    Business   @relation(fields: [businessId], references: [id], onDelete: Cascade)
  title       String
  kind        SurveyKind
  points      Int
  active      Boolean    @default(false)
  order       Int        @default(0)
  // solo LINK_ACTION
  externalUrl String?
  buttonLabel String?
  questions   SurveyQuestion[]
  completions SurveyCompletion[]
  createdAt   DateTime   @default(now())

  @@index([businessId, order])
}

model SurveyQuestion {
  id       String           @id @default(cuid())
  surveyId String
  survey   SurveyDefinition @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  type     QuestionType
  label    String
  order    Int
  answers  SurveyAnswer[]

  @@index([surveyId, order])
}

model SurveyCompletion {
  id            String           @id @default(cuid())
  surveyId      String
  survey        SurveyDefinition @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  customerId    String
  customer      Customer         @relation(fields: [customerId], references: [id], onDelete: Cascade)
  pointsAwarded Int
  createdAt     DateTime         @default(now())
  answers       SurveyAnswer[]

  @@unique([surveyId, customerId])
}

model SurveyAnswer {
  id           String           @id @default(cuid())
  completionId String
  completion   SurveyCompletion @relation(fields: [completionId], references: [id], onDelete: Cascade)
  questionId   String
  question     SurveyQuestion   @relation(fields: [questionId], references: [id], onDelete: Cascade)
  ratingValue  Int?
  textValue    String?
}
```

Se eliminan del schema: `model Survey`, `enum SurveyType`, `model SurveyConfig` (viejo), `model SurveyCompletion` (viejo, se reemplaza por el nuevo de arriba). Se ajustan las relaciones inversas en `Business` y `Customer`.

## Dashboard (`/dashboard/fidelizacion/encuestas`)

- Lista de encuestas del negocio (cards: título, tipo, puntos, activa/inactiva, editar/borrar).
- Botón "+ Nueva encuesta" abre un formulario: título, tipo (Formulario / Acción-link), puntos, activa.
  - **Formulario**: builder de preguntas — agregar (tipo Estrella o Texto + label), reordenar (drag & drop), borrar pregunta.
  - **Acción-link**: input URL + input label de botón (default "Ir").
- Acciones server: `createSurvey`, `updateSurvey`, `deleteSurvey`, `reorderQuestions`.

## Cliente (`/menu/[slug]/tienda-puntos/encuestas`)

- Lista todas las encuestas activas del negocio, separando completadas (con check + puntos ganados) de pendientes.
- **Formulario**: renderiza cada pregunta según su tipo (estrellas clickeables / input texto), botón "Enviar" habilitado solo cuando todas las preguntas tienen respuesta → crea `SurveyCompletion` + `SurveyAnswer[]` + suma puntos vía `PointsTransaction`.
- **Acción-link**: un botón único (ícono link externo + label configurado). Al click: abre la URL en nueva pestaña y en el mismo click dispara la server action que marca completado y suma puntos.
- Acciones server: `submitFormSurvey`, `completeLinkAction`.

## Fuera de alcance

- Puntos por pregunta individual.
- Selección de ícono por acción-link (queda genérico).
- Migración de encuestas/completions existentes.
- Cambios al modelo `Survey` (rating/nps/comment) no relacionado.
