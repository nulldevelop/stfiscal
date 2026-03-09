// src/utils/hash.ts
export const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = (hash >>> 0).toString(16);
  return hex.padStart(12, "0").slice(-12);
};
