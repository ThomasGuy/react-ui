export const capitalize = (name: string | undefined) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
};
