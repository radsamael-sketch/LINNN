# Lingo Studio

# LINGO STUDIO — FULL REDESIGN AND FUNCTIONALITY

Use the uploaded file `Lingo_Studio_Bolt_ready.html` as the source of truth for the existing application.

Your task is to redesign the ENTIRE Lingo Studio website and improve its functionality while preserving the existing learning content, data and working logic.

## 1. IMPORTANT WORK RULES

- Inspect the existing code only as much as necessary to understand its structure and functionality.
- Do not spend credits on lengthy audits, planning documents or explanations.
- Start implementation as soon as you understand the essential code.
- Do not create backup copies. I already keep the original file safely on my computer.
- Do not replace the existing application with a generic demo.
- Preserve existing lessons, exercises, vocabulary, user data and working features.
- Do not invent content, statistics, achievements or user data.
- Do not change lesson completion or unlocking rules unless fixing a confirmed bug.
- Avoid unnecessary dependencies and overengineering.
- Do not ask for approval after every small step. Complete the requested work and show the result.

## 2. APPLICATION STRUCTURE

Keep EXACTLY these six main navigation sections:

1. Dashboard
2. Learning Program
3. Vocabulary
4. Tests
5. Progress
6. Settings & Profile

Do not add independent sidebar sections.

Keep related features integrated into their appropriate sections.

Vocabulary must include interactive Quizlet-style flashcards.

Do not split existing integrated features into separate pages or navigation items.

## 3. DESIGN DIRECTION

Create a fresh, cohesive redesign across the ENTIRE website.

Style: Modern Editorial + Cozy Digital Studio.

Visual direction:
- Warm, light neutral background.
- Muted peach, orange, sage, sky blue, pink and lavender accents.
- Expressive but readable typography.
- Elegant editorial layouts with varied card sizes.
- Moderate rounded corners and subtle shadows.
- Good spacing and clear visual hierarchy.
- Consistent icons and polished interactions.
- Subtle transitions and hover states.

The result should feel like a beautiful personal learning studio, not a generic school portal or admin dashboard.

IMPORTANT:
- Keep the design balanced and functional.
- Avoid excessive decoration, oversized banners, huge empty spaces and repetitive card grids.
- Do not overcomplicate the interface.
- Prioritize desktop usability. Mobile optimization can be done later.

Apply the same design system consistently to all six sections.

## 4. DASHBOARD

Create a useful, attractive and personalized Dashboard.

Include:

- Welcome greeting with the user's editable name.
- Continue Learning action linked to the last opened lesson.
- Real learning progress.
- Today's Plan using actual application data only.
- A large motivational phrase that can change periodically.
- Three compact widgets, all visible simultaneously:

1. Pomodoro timer: 25-minute default, start, pause and reset.
2. Live local clock using the device's time.
3. Word of the Day: use an existing vocabulary entry, with translation, pronunciation and example when available. Clicking it should open Vocabulary.

If no real vocabulary entry is available, show a clean empty state. Never generate fake vocabulary.

Do not add a photo collage or a new photo gallery.

The Dashboard must ALWAYS open first when the application launches, when the root URL is opened and after refreshing the page. Never restore the last visited section as the initial page.

## 5. FUNCTIONALITY

Preserve and verify the existing functionality throughout the application.

Learning Program:
- Existing lessons and modules.
- Lesson content and navigation.
- Exercises and answer checking.
- Lesson completion and progress tracking.
- Existing unlocking logic.

Vocabulary:
- Existing vocabulary data.
- Interactive flashcards with reveal/flip functionality.
- Navigation between cards.
- Available review or learning interactions.

Tests:
- Existing tests and questions.
- Answer checking and results.
- Correct progress recording.

Progress:
- Accurate statistics based on real user activity.
- Existing progress history and indicators.
- No fabricated data.

Settings & Profile:
- Preserve existing profile and settings functionality.
- Keep language switching and user preferences working.

Importer:
- Preserve the existing lesson importer and its TXT format.
- Do not break its supported blocks, exercise types or answer keys.

Fix confirmed bugs where possible, without rewriting unrelated working code.

## 6. LANGUAGE

- Russian must be the default language for new users.
- English must remain available through the language switcher.
- All redesigned interface elements must support both languages.
- Language switching should work without a page reload when possible.

## 7. TECHNICAL REQUIREMENTS

- Preserve the existing application logic and data.
- Prefer minimal, targeted changes over unnecessary rewrites.
- If migration to a different frontend structure is technically necessary, preserve all existing functionality and data.
- Do not introduce Supabase or another external database in this phase.
- Do not create fake database tables or demo records.
- Do not add Google authentication or role-management systems.
- Keep temporary importer drafts and Pomodoro state local.
- Avoid duplicate scripts, CSS patches and conflicting event handlers.

Supabase authentication, database and cross-device synchronization will be implemented in a separate phase after the redesigned application is verified.

## 8. FINAL VERIFICATION

Before finishing, verify:

- All six navigation sections work.
- Dashboard opens first on every launch and refresh.
- All pages share a consistent new design.
- Russian and English switching works.
- Lessons, exercises and tests work.
- Vocabulary and flashcards work.
- Progress uses real data.
- Importer remains compatible with its existing TXT format.
- Dashboard widgets work.
- No existing user data or working functionality has been unnecessarily removed.

Implement the redesign directly. Keep explanations and progress reports short. Do not spend credits on unnecessary planning.

Show the completed application in Preview and report only any remaining issues that genuinely need attention.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4c6ec0a5-cfb1-4f3a-bbf7-dee83b93e51a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Lingo Studio PWA + Supabase setup

1. In `public/lingo.html`, replace `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_ANON_KEY` in `window.LINGO_SUPABASE_CONFIG`. Use only the public anon/publishable key. Never expose `service_role`.
2. Run `supabase-schema.sql` in the Supabase SQL Editor. It creates a private per-user JSON state row with row-level security.
3. In Supabase Authentication, enable Email + Password and restrict sign-ups if this is a single-person app. Configure the production Site URL and redirect URLs.
4. Deploy the site over HTTPS. The web manifest and service worker enable installation and cache the application shell. The first visit still requires a connection.
5. Sign in under Settings & Profile, then use **Sync now** to upload or restore the personal app state. Pomodoro and importer draft state are intentionally excluded from cloud sync.

The PWA cache is a shell/offline fallback, not a guarantee that every remote font/CDN resource or every lesson attachment is available offline.

## Дополнительные материалы (Reading / Extra Practice / Checkpoints)

В приложении есть отдельный общий импортёр для дополнительных материалов. Он не заменяет и не меняет старый импортёр уроков: существующий TXT-формат уроков остаётся совместимым.

Поддерживаемые TXT-теги:

```text
[READING]
[TITLE: A Day at the Zoo]
[LEVEL: A1+]
[DESCRIPTION: Read and answer the questions.]
[TEXT]
It is a sunny day. Tom goes to the zoo.
[END_TEXT]
[EXERCISE: multiple_choice]
[QUESTION: Where does Tom go?]
[OPTION: To the zoo]
[OPTION: To school]
[ANSWER: To the zoo]
[EXPLANATION: Tom visits the zoo.]
[END_EXERCISE]
[END_READING]
```

For Extra Practice use `[PRACTICE] ... [END_PRACTICE]`, and for assessments use `[TEST]` or `[CHECKPOINT] ... [END_TEST]` / `[END_CHECKPOINT]`, with one or more `[EXERCISE: multiple_choice]` blocks. Each question block supports `[QUESTION:]`, repeated `[OPTION:]`, `[ANSWER:]`, and `[EXPLANATION:]`. Open-response items without a fixed `[ANSWER:]` are not automatically graded.

Use the Importer section, select the material type, upload the TXT, review validation and preview, then confirm. A Reading image can be attached separately (up to 1 MB). Imported content and attempts are stored locally in the browser until Supabase is configured and sync is run.
