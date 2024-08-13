## 0.2.8

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
    'title' | 'content' | 'summary'
  >;
  ```

## 0.1.1

### Patch Changes

- 77bca5e: Adds WikiTypeBuilder to constuct custom wiki types

## 0.1.0

### Minor Changes

- 5aa29d7: Update CommonMetaIds
