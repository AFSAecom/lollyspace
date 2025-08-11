export function validatePromotionForm(v) {
    if (!v.name)
        throw new Error('name');
    if (!['discount', 'two_plus_one', 'pack'].includes(v.type))
        throw new Error('type');
    if (!v.startsAt || !v.endsAt)
        throw new Error('period');
}
function csv(str) {
    const arr = str.split(',').map((s) => s.trim()).filter(Boolean);
    return arr.length ? arr : undefined;
}
function csvNum(str) {
    const arr = str
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !Number.isNaN(n));
    return arr.length ? arr : undefined;
}
export function mapFormToPayload(v) {
    validatePromotionForm(v);
    return {
        id: v.id,
        name: v.name,
        type: v.type,
        combinable: v.combinable,
        priority: Number(v.priority || 0),
        starts_at: new Date(v.startsAt).toISOString(),
        ends_at: new Date(v.endsAt).toISOString(),
        active: v.active,
        scope: {
            genders: csv(v.scopeGender),
            families: csv(v.scopeFamily),
            products: csvNum(v.scopeProducts),
            variants: csvNum(v.scopeVariants),
        },
        items: v.params ? [{ params: JSON.parse(v.params) }] : [],
    };
}
