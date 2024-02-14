# @everipedia/iq-utils

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
