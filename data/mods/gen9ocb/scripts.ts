import { HiddenBuffs } from './format-validation';

export const Scripts: ModdedBattleScriptsData = {
	inherit: 'gen9',
	actions: {
		modifyDamage(baseDamage: number, pokemon: any, target: any, move: any, suppressMessages = false) {
			// @ts-ignore
			let damage = this.super.modifyDamage(baseDamage, pokemon, target, move, suppressMessages);
			
			damage = HiddenBuffs.applyDamageReduction(damage, target);
			damage = HiddenBuffs.applyDamageBoost(damage, pokemon);

			return damage;
		}
	}
};