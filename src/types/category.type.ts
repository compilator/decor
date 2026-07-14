export type CategoryType = {
  id: string,
  name: string,
  url: string
};

export type TypeType = {
  id: string,
  name: string,
  url: string,
  category: CategoryType
};
