---
'@everipedia/iq-utils': patch
---

# Changes

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
