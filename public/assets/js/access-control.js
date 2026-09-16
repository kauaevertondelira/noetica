// Remote data permissions are enforced by firestore.rules, never by CSS.
export function isOwner(user, record) {
  return Boolean(user?.uid && record?.userId === user.uid);
}
