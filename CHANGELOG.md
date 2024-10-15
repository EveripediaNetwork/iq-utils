## 0.2.8

## 2.0.2

### Patch Changes

- 2da17b7: fixes graphql endpoint incorrect

## 2.0.1

### Patch Changes

- 502eda3: Updates the wiki schema to match publish schema rather than fetch from graphql

## 2.0.0

### Major Changes

- 589e5ea: Simplifies the file structure and variable and method function names from exports

## 1.0.1

### Patch Changes

- 6f776ed: Exports wiki schema

## 1.0.0

### Major Changes

- cd21c32: Update wiki to use zod

## 0.4.4

### Patch Changes

- bd3b671: Added function export
- 3903b43: fixes
- 3903b43: fixes lock file
- 109a4d9: adds export for constants
- 275d12e: Adds export to wiki check functions

## 0.4.3

### Patch Changes

- 7ba3d57: Update BaseEvents with location field

## 0.4.2

### Patch Changes

- 82b2cb8: Add is Update event action types

## 0.4.1

### Patch Changes

- 1b7060e: Add action to base event type

## 0.4.0

### Minor Changes

- fa54b6f: Adds is base event id for the metadata structure

## 0.3.1

### Patch Changes

- 3add847: Add export for wiki validation

## 0.3.0

### Minor Changes

- a38f82b: Adds is deep equal refactor
- 7c28dbb: Adds is valid wiki checks

## 0.2.11

### Patch Changes

- 81ee461: Adds blockchainWikis and founderWikis type

## 0.2.10

### Patch Changes

- 88843ea: added a new explorer

## 0.2.9

### Patch Changes

- 55e5cd8: Update CommonMetaIds types for Explorers links

### Patch Changes

- 9236647: Updating explorer commonMetaIds types

## 0.2.7

### Patch Changes

- 75ea28e: Resolve issue with import error

## 0.2.6

### Patch Changes

- 2516a5c: Create lib for deep comparison

## 0.2.4

### Patch Changes

- 716a8b5: Update events with support for dates running consecutively

## 0.2.3

### Patch Changes

- 4fdee73: Patches common meta id to include tiktok

## 0.2.2

### Patch Changes

- 35a0985: Update LinkedWikiKey enum

## 0.2.1

### Patch Changes

- 621d2eb: Add events location metadata id

## 0.2.0

### Minor Changes

- badb57a: Adds basescan and ftmscan chain explorers

## 0.1.5

### Patch Changes

- 33c7f68: Add mirror social link enum

## 0.1.4

### Patch Changes

- 84f8b57: adds events to validator code

## 0.1.3

### Patch Changes

- 0810860: Adds Event type to wiki

## 0.1.2

### Patch Changes

- 81787e9: # Changes

  - Adds RecordTypePicker which works for any type

  # Example

  ```ts
  // The NewWikiType will only have user, title, content, summary and user only has id, profile with username and avatar.
  type NewWikiType = RecordTypePicker<
    Wiki,
    {
      user: {
        id;
        profile: {
          username;
          avatar;
        };
      };
    },
    "title" | "content" | "summary"
  >;
  ```

## 0.1.1

### Patch Changes

- 77bca5e: Adds WikiTypeBuilder to constuct custom wiki types

## 0.1.0

### Minor Changes

- 5aa29d7: Update CommonMetaIds
