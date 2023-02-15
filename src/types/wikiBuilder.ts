import {
  Author,
  BaseCategory,
  BaseTag,
  Image,
  LanguagesISOEnum,
  LinkedWikis,
  MData,
  Media,
  User,
  Wiki,
} from './wiki';

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type WikiTypeBuilderExtender = DeepPartial<{
  categories: BaseCategory[];
  tags: BaseTag[];
  images: Image[];
  media: Media[];
  user: User;
  metadata: MData[];
  linkedWikis?: LinkedWikis;
  language: LanguagesISOEnum;
  author: Author;
}>;

export type WikiTypeBuilder<
  C extends WikiTypeBuilderExtender,
  L extends keyof Wiki
> = C & Pick<Wiki, Exclude<L, keyof C>>;
