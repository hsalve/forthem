# ForThem Product Decisions

This document records product decisions so the app stays consistent as it grows.

## Brand and Positioning

ForThem is not a legal/court app. It is a calm, modern, premium co-parenting app for busy parents.

The emotional focus is the child, not parent conflict.

## Target User

The target user is a busy co-parent who may be:

- walking into daycare,
- checking a schedule quickly,
- adding an expense after paying a bill,
- uploading a medical document,
- requesting a swap,
- managing reminders while working full-time.

The app should support tasks that can be completed quickly, often one-handed.

## Core UX Questions

Each main screen should answer one primary question:

- Home: What do I need to know today?
- Calendar: Who has the child and what is happening?
- Swaps: What requests need my response?
- Expenses: Who owes what?
- Documents: Where is the file I need?
- Profile: How do I manage myself, my children, and my family setup?

## Shared vs Private

Not everything belongs in the shared co-parenting space.

Shared items:
- custody schedule,
- exchanges,
- child events,
- daycare/school/medical events,
- expenses,
- documents,
- swap requests.

Private items:
- personal reminders,
- private notes,
- parent-only tasks,
- personal calendar items.

Private items must only be visible to the creator.

## Design Direction

ForThem should feel like Apple Calendar + Airbnb + Revolut + Headspace.

Use:
- consistent soft indigo/lavender theme,
- large rounded cards,
- professional icon system,
- clear section headers,
- soft shadows,
- generous whitespace,
- plain-language labels.

Avoid:
- harsh black,
- random colors,
- enterprise-looking tables,
- legal/court-heavy language,
- placeholder text,
- cluttered screens.

## Build Strategy

Functionality is now more important than visual iteration.

The app is visually good enough for MVP direction. Future work should prioritize making each feature real, while preserving the current design system.

One feature at a time. No large rewrites unless necessary.
