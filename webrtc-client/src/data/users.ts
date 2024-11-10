export const users = Array.from({ length: 5 }, (_, index) => ({
  id: `user-${index + 1}`,
  name: `用户-${index + 1}`,
  avatar: `https://picsum.photos/id/1${index + 1}/48/48`,
}));
