# Breadcrumb — Design

**Status:** Complete · ready for `design-done`.

**Why this file exists.** This tracker is my tool. It should look like *my* tool, not a generic Kanban with default Tailwind blue.

**Who owns this.** Solo project: one person owns design, PRD and build.

\---

## 1\. Mood / vibe

A quiet late-night workshop: warm paper, deep indigo ink and one amber lamp that tells you what needs attention next.

References:

* Linear's calm density and restraint (linear.app)
* Things 3's soft cards and generous spacing (culturedcode.com/things)
* Notion's paper-warm backgrounds and quiet type

Anti-references:

* Default Tailwind blue Kanban boards (Trello-clone look)
* Neon "hacker terminal" dashboards with glowing gradients

## 2\. Color palette

Pasted into `tailwind.config.js` as utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

|Token|Hex|Where it shows up|
|-|-|-|
|`brand-primary`|`#3D3A8C`|Header, "+" button, focus rings|
|`brand-accent`|`#F2A93B`|Highlights, hover states, links|
|`surface-page`|`#F6F4EF`|Page background|
|`surface-card`|`#FFFFFF`|Card background|
|`text-primary`|`#1C1B29`|Body text|
| `text-muted` | `#55516B` | Captions, dates, counts |

### Task type (M6 `tag-style`)

|Token|Hex|When used|
|-|-|-|
|`type-feature`|`#0E9F7E`|Cards tagged `feature` (accent stripe + icon)|
|`type-bug`|`#D9455F`|Cards tagged `bug` (accent stripe + icon)|
| `type-feature-text` | `#0A7A61` | Feature badge text and other feature text (4.5:1 or better on white) |
| `type-bug-text` | `#BE2F4A` | Bug badge text, error messages, delete button (4.5:1 or better on white) |

### Due-date states (M8 `due-tint`)

|Token|Hex|When used|
|-|-|-|
|`due-safe`|`#DCE8F7`|More than 2 days out|
|`due-warning`|`#FCE3A8`|Less than 24 hours|
|`due-overdue`|`#F9C5CB`|Past due|
|`due-neutral`|`#E7E5E4`|Done (overrides date)|

All four due tints keep `text-primary` readable (contrast above 7:1) and are distinguishable from each other in grayscale: blue is lightest, amber mid, rose slightly darker, gray flat.

## 3\. Typography

|Role|Font|Why|
|-|-|-|
|Heading|Space Grotesk|Slightly quirky geometric shapes give personality without being loud.|
|Body|Inter|Highly legible at 14 px, which is where most of the UI lives.|
|Monospace (tags, badges, code)|JetBrains Mono|Reads as "developer tool" for the context block and badges.|

Sizes:

* Page title: 24 px / semibold
* Section header: 16 px / semibold uppercase
* Card title: 14 px / medium
* Body: 14 px / regular
* Caption: 12 px / regular muted

## 4\. Component principles

* **Cards:** Light and almost weightless: a 1px border, a 4px type-colored left stripe, and a soft shadow only on hover.
* **Buttons:** Solid fill, no gradients, generous padding, `rounded-md`; the primary button is indigo, destructive actions are rose.
* **Modal:** Centered, `max-w-lg`, indigo-tinted dark backdrop at 50% opacity, closes on Esc and backdrop click.
* **Empty states:** Dashed border, muted text, never sad.
- **Drag affordance:** Cards can be dragged between columns. The target column glows amber while hovering, and a soft chime plays when a task lands in Done (the Sound button mutes it). The status dropdown in the modal is the keyboard alternative.

## 5\. Voice / microcopy

|Where|Text|
|-|-|
|"+" button label|+ Task|
|Empty column placeholder|Nothing here yet. Drop a crumb.|
|Toast after "Copy as Prompt Context"|Copied. Now paste it into the AI.|
|Confirm-delete message|Delete this task? You can't undo.|
|Handoff toast (M7 `task-owner`)|Handed off to {name}. They've got it.|

## 6\. Logo / wordmark

* **Product name:** Breadcrumb
* **Wordmark style:** The name in Space Grotesk semibold, `brand-primary` color, followed by a small amber dot in `brand-accent`. No icon.

## 7\. Out of scope (this hackathon)

* A dark mode toggle. One mode, shipped.
* Multiple themes.
* Animations beyond a 200 ms fade on toast notifications.
* A custom icon set. Use [Lucide icons](https://lucide.dev) if needed.

\---

*DESIGN.md version: hackathon-starter v1 · filled in for Breadcrumb*

