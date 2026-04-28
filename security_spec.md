# Security Specification - Image Repository

## Data Invariants
1. An image entry cannot exist without a `url` and a `userId`.
2. The `userId` must match the authenticated user's UID.
3. The `url` must be a valid string with a maximum size of 2048 characters.
4. Images can only be read or modified by their owners.

## The "Dirty Dozen" Payloads (Deny Cases)
1. **Unauthenticated Create**: Try to create an image without being logged in.
2. **Identity Spoofing**: Create an image document with a `userId` different from the authenticated user's UID.
3. **Ghost Field Injection**: Add a `verified: true` field to an image document.
4. **Foreign Update**: User A attempts to delete or update an image belonging to User B.
5. **Path Poisoning**: Create a document ID that is 1MB in size.
6. **Timestamp Spoofing**: Provide a `createdAt` value from the future.
7. **Size Overflow**: Set the `size` field to a string that is 1MB.
8. **Invalid URL**: Provide an empty string or non-string for `url`.
9. **Blanket Read Request**: Attempt to list all images in the collection without a user filter.
10. **Immutable Field Change**: Attempt to update the `createdAt` or `userId` after creation.
11. **Shadow Resource Creation**: Attempt to create a document in a subcollection that shouldn't exist.
12. **Malicious Document ID**: Use `../..` or special characters in the document ID.

## Test Runner Logic
The following rules will be implemented and verified:
- `isSignedIn()` check.
- `isValidImage()` helper for schema validation.
- `isOwner()` check for all operations.
- `affectedKeys().hasOnly()` for updates (though most edits might be restricted to name).
