export type Person = {
  id: number;
  gender: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  raw_data: Record<string, unknown>;
};

export type PaginatedPeopleResponse = {
  items: Person[];
  total: number;
  limit: number;
  offset: number;
};

export type LoadPeopleResponse = {
  loaded: number;
};