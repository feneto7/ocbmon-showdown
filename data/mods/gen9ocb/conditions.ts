import type { ModdedConditionData } from '../../../sim/dex-conditions';

export const Conditions: { [id: string]: ModdedConditionData } = {
	slifer: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (pokemon.activeTurns) {
				this.boost({ spe: 1 });
			}
		},
	},
	floralyx: {
		onSwitchIn(pokemon) {
			if (!this.field.isTerrain('psychicterrain')) {
				this.field.setTerrain('psychicterrain');
			}
		},
	},

	koraidon:{
		onSwitchIn(pokemon) {
			if (this.field.setWeather('sunnyday')) {
				this.add('-activate', pokemon, 'Orichalcum Pulse', '[source]');
			} else if (this.field.isWeather('sunnyday')) {
				this.add('-activate', pokemon, 'ability: Orichalcum Pulse');
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				this.debug('Orichalcum boost');
				return this.chainModify([5461, 4096]);
			}
		},
	},
	
	miraidon:{
		onSwitchIn(pokemon) {
			if (!this.field.setTerrain('electricterrain') && this.field.isTerrain('electricterrain')) {
				this.add('-activate', pokemon, 'ability: Hadron Engine');
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (this.field.isTerrain('electricterrain')) {
				this.debug('Hadron Engine boost');
				return this.chainModify([5461, 4096]);
			}
		},
	},

	yveltalmega:{
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp >= target.maxhp) {
				this.debug('Shadow Shield weaken');
				return this.chainModify(0.5);
			}
		},
	},

	lucariomegaz:{
		onSourceModifyDamage(damage, source, target, move) {
			this.debug('Deflect reduce');
			return this.chainModify(0.8);
		},
		onDamagingHit(damage, target, source, move) {
			if (!damage || !target.hp || !source?.hp) return;
			const counterMove = this.dex.getActiveMove('vacuumwave');
			counterMove.basePower = 20;
			this.actions.useMove(counterMove, target, { target: source });
		},
	},

	


	
};
