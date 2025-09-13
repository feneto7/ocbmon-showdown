export const AbilitiesText: {[k: string]: ModdedAbilityText} = {
	plus: {
		name: "Plus",
		desc: "If an active ally has this Ability or the Minus Ability, this Pokemon's Special Attack is multiplied by 1.5. After an Electric-type move hits, has a 25% chance to boost a random stat (not acc/eva).",
		shortDesc: "If an active ally has this Ability or the Minus Ability, this Pokemon's Sp. Atk is 1.5x. After an Electric-type move hits, has a 25% chance to boost a random stat (not acc/eva).",
	},
	regenerator: {
		name: "Regenerator",
		desc: "When the holder of this ability is switched out, 20% of their current max hp is recovered.",
		shortDesc: "This Pokemon restores 1/5 of its maximum HP when its switched out.",
	},
	minus: {
		name: "Minus",
		desc: "If an active ally has this Ability or the Plus Ability, this Pokemon's Special Attack is multiplied by 1.5. Prevents this Pokemon's stats from being lowered.",
		shortDesc: "If an active ally has this Ability or the Plus Ability, this Pokemon's Sp. Atk is 1.5x. Prevents this Pokemon's stats from being lowered.",
	},
};
