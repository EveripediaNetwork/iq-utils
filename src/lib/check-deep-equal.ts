type ComparableType = string | number | boolean | null | undefined | object;

function isDeepEqual(
	baseObject: ComparableType,
	comparisonObject: ComparableType,
): boolean {
	return compareValues(baseObject, comparisonObject);
}

function compareValues(
	base: ComparableType,
	comparison: ComparableType,
): boolean {
	if (base === comparison) {
		return true;
	}

	if (base == null || comparison == null) {
		return false;
	}

	if (typeof base !== typeof comparison) {
		return false;
	}

	if (typeof base === "string") {
		return compareStrings(base, comparison as string);
	}

	if (base instanceof Date && comparison instanceof Date) {
		return base.getTime() === comparison.getTime();
	}

	if (base instanceof RegExp && comparison instanceof RegExp) {
		return base.toString() === comparison.toString();
	}

	if (typeof base === "object") {
		return compareObjects(base, comparison as object);
	}

	return false;
}

function compareStrings(base: string, comparison: string): boolean {
	return base.replace(/\s+/g, "") === comparison.replace(/\s+/g, "");
}

function compareObjects(base: object, comparison: object): boolean {
	const baseKeys = Object.keys(base);
	const comparisonKeys = Object.keys(comparison);

	if (baseKeys.length !== comparisonKeys.length) {
		return false;
	}

	return baseKeys.every((key) => {
		if (!Object.prototype.hasOwnProperty.call(comparison, key)) {
			return false;
		}

		const baseValue = (base as Record<string, ComparableType>)[key];
		const comparisonValue = (comparison as Record<string, ComparableType>)[key];

		if (
			typeof baseValue === "function" &&
			typeof comparisonValue === "function"
		) {
			return baseValue.toString() === comparisonValue.toString();
		}

		return compareValues(baseValue, comparisonValue);
	});
}

export default isDeepEqual;
