## 1. Default width/height

- [x] 1.1 In `src/NewMosaicForm.tsx`, default `width`/`height` to 20 when no `width`/`height` prop is supplied, and verify the width and height text fields render pre-filled with 20 when the form is opened with no props.
- [x] 1.2 Verify editing the width or height field before submitting still updates form state normally and the submitted chart uses the edited value, not the default.

## 2. Tests

- [x] 2.1 Add a component test (alongside the existing `*.test.tsx` files, e.g. `src/NewMosaicForm.test.tsx`) covering: form opens with width/height pre-filled to 20; submitting unedited creates a 20x20 chart; editing a field before submit creates a chart with the edited value; run `npm run lint` and the test suite and verify both pass.
