# Classroom.vue White Background Fix — TODO

## Problem (final)
The user's real design is `src/views/Classroom.vue` (Biology 101). Its `.app` root had no background, so the global white `#app` background in `App.vue` showed through the gaps → white page.

## Fix applied
- Added a dark background to `.app` in `src/views/Classroom.vue` using the existing `--bg` token (design unchanged).
- Reverted the `/classroom` route back to `src/views/Classroom.vue`.

## Steps
- [x] Revert router to `src/views/Classroom.vue`
- [x] Add dark background to `.app` in `src/views/Classroom.vue`
- [x] Verified Vite HMR applies the change
