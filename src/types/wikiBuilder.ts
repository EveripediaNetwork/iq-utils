import type { Wiki } from "../schema/wiki.schema";

type DeepPartial<T> = {
	[P in keyof T]?: DeepPartial<T[P]>;
};

type PrimitiveType = number | string | boolean | symbol | null | undefined;

export type RecordTypeNonPrimitive<T> = DeepPartial<{
	[K in keyof T]: [T[K]] extends [PrimitiveType] ? never : T[K];
}>;

export type RecordTypePicker<
	T extends object,
	NonPrimitiveOverrides extends RecordTypeNonPrimitive<T>,
	Keys extends keyof T,
> = NonPrimitiveOverrides & Pick<T, Exclude<Keys, keyof NonPrimitiveOverrides>>;

export type WikiBuilder<
	NonPrimitiveOverrides extends RecordTypeNonPrimitive<Wiki>,
	Keys extends keyof Wiki,
> = RecordTypePicker<Wiki, NonPrimitiveOverrides, Keys>;
