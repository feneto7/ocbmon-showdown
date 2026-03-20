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

	articunoex:{
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug("Permafrost neutralize");
				return this.chainModify(0.65);
			}
		},
	}, 
	zapdosex:{
		onModifyMovePriority: -5,
		onModifyMove(move) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity["Electric"] = true;
			}
			const baseEffectiveness = move.onEffectiveness;
			move.onEffectiveness = (effectiveness, target, type, usedMove) => {
				if (usedMove.type === 'Electric' && type === 'Ground') return -1;
				return baseEffectiveness?.apply(this, [effectiveness, target, type, usedMove]);
			};
		},
	},
	moltresex:{
		onModifyMovePriority: -2,
		onModifyMove(move) {
			if (move.secondaries) {
				this.debug("quintupling burn chance");
				for (const secondary of move.secondaries) {
					if (secondary.status?.includes("brn") && secondary.chance && !secondary.ability) { secondary.chance *= 5; }
				}
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

	
	
};
