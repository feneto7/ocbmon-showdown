import type { ModdedConditionData } from '../../../sim/dex-conditions';

// Mesma regra do abilities.ts (Parental Bond / multihit custom) para não forçar 2 hits em moves inválidos
function isParentalBondBanned(move: ActiveMove, _source: Pokemon): boolean {
	return move.category === 'Status' || !!move.multihit || !!move.flags['noparentalbond'] ||
		!!move.flags['charge'] || !!move.flags['futuremove'] || !!move.spreadHit || !!move.isZ || !!move.isMax;
}

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

	koraidon: {
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

	yveltalmega: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp >= target.maxhp) {
				this.debug('Shadow Shield weaken');
				return this.chainModify(0.5);
			}
		},
	},

	lucariomegaz: {
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

	zygardecompletemega: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug("Primal Armor neutralize");
				return this.chainModify(0.5);
			}
		},
	},

	rayquazamega:{
		onSwitchIn(source) {
			this.field.setWeather('deltastream');
		},
		onAnySetWeather(target, source, weather) {
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			if (this.field.getWeather().id === 'deltastream' && !strongWeathers.includes(weather.id)) return false;
		},
		onEnd(pokemon) {
			if (this.field.weatherState.source !== pokemon) return;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (target.hasAbility('deltastream')) {
					this.field.weatherState.source = target;
					return;
				}
			}
			this.field.clearWeather();
		},
	},

	moltresexmega:{
		onModifySpA(atk, attacker, defender, move) {
			return this.chainModify(1.5);
		},
	},

	ampharosmega:{
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Electric') {
				this.debug('Transistor boost');
				return this.chainModify([5325, 4096]);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Electric') {
				this.debug('Transistor boost');
				return this.chainModify([5325, 4096]);
			}
		},
	},
	slakingmegaapeshift:{
		onSwitchIn(pokemon) {
			this.add('-ability', pokemon, 'Mold Breaker');
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
	},

	slakingmega:{
		onSwitchIn(pokemon) {
			this.add('-ability', pokemon, 'Mold Breaker');
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
	},

	chienpaomega: {
		onPrepareHit(source, target, move) {
			if (move.category === 'Status' || !move.flags['bite'] || move.multihit || 
				move.flags['noparentalbond'] || move.flags['charge'] ||
				move.flags['futuremove'] || move.spreadHit || move.isZ || move.isMax) return;

			move.multihit = 2;
			move.multihitType = 'parentalbond';
		},
		onBasePowerPriority: 7,
		onBasePower(basePower, pokemon, target, move) {
			if (move.multihitType === 'parentalbond' && move.hit === 2) {
				return this.chainModify(0.25); 
			}
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			if (move.multihitType === 'parentalbond' && move.hit > 1) {
				return secondaries.filter(effect => effect.volatileStatus !== 'flinch');
			}
		},
	},


	mimikyurayquaza:{
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (effect?.effectType === 'Move' && target.species.id === 'mimikyurayquaza' && !this.effectState.busted) {
				this.add('-activate', target, 'ability: Patchwork');
				this.effectState.busted = true;
				this.effectState.bustSource = source;
				return 0;
			}
		},
		onCriticalHit(target, source, move) {
			if (!target) return;
			if (target.species.id !== 'mimikyurayquaza') return;
			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;
			if (!target.runImmunity(move)) return;
			return false;
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target || move.category === 'Status') return;
			if (target.species.id !== 'mimikyurayquaza') return;
			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;
			if (!target.runImmunity(move)) return;
			return 0;
		},
		onUpdate(pokemon) {
			if (pokemon.species.id === 'mimikyurayquaza' && this.effectState.busted) {
				pokemon.formeChange('Mimikyu-Primal', this.effect, true);
				this.damage(pokemon.baseMaxhp / 8, pokemon, pokemon, this.dex.species.get('mimikyurayquazabusted'));
				const foe = this.effectState.bustSource as Pokemon | undefined;
				if (foe?.hp && foe.side !== pokemon.side) {
					foe.addVolatile('curse', pokemon, this.dex.abilities.get('patchwork'));
				}
			}
		},
	},

	dragapultmega:{
		onPrepareHit(source, target, move) {
			if (move.category === 'Status' || move.multihit || move.flags['noparentalbond'] || move.flags['charge'] ||
				move.flags['futuremove'] || move.spreadHit || move.isZ || move.isMax) return;
			move.multihit = 2;
			move.multihitType = 'parentalbond';
		},
		// Damage modifier implemented in BattleActions#modifyDamage()
		onSourceModifySecondaries(secondaries, target, source, move) {
			if (move.multihitType === 'parentalbond' && move.id === 'secretpower' && move.hit < 2) {
				// hack to prevent accidentally suppressing King's Rock/Razor Fang
				return secondaries.filter(effect => effect.volatileStatus === 'flinch');
			}
		},
	},

	snorlaxprimal:{
		onSwitchIn(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Dream Whimsy');
			for (const target of pokemon.adjacentFoes()) {
				this.actions.useMove('yawn', pokemon, { target, sourceEffect: pokemon.getAbility() });
			}
		},
	},

	mewtwomegax: {
		onModifyMove(move, pokemon) {
			if (move.category === 'Status' || !move.flags['punch'] || move.multihit || 
				move.flags['noparentalbond'] || move.flags['charge'] ||
				move.flags['futuremove'] || move.spreadHit || move.isZ || move.isMax) return;
			
			move.multihit = 2;
			(move as any).multihitType = 'ironfistbond';
		},
		onBasePowerPriority: 7,
		onBasePower(basePower, pokemon, target, move) {
			if ((move as any).multihitType === 'ironfistbond' && move.hit === 2) {
				return this.chainModify(0.4);
			}
		},
	},

	shedinjamega: {
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
	},

	articunoexmega: {
		name: 'Articuno Ex Mega',
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (!pokemon.hp) return;
			for (const target of pokemon.foes()) {
				if (!target.hp) continue;
				
				if (target.hasType('Ice')) {
					this.add('-immune', target);
				} else {
					this.damage(target.baseMaxhp / 8, target, pokemon);
				}
			}
			this.heal(pokemon.baseMaxhp / 8, pokemon, pokemon);
		},
	},

	greninjamega: {
		onModifyMove(move, pokemon) {
			if (move.id === 'watershuriken') {
				delete move.multihit;
				move.basePower = 100;
				move.critRatio = (move.critRatio || 1) + 1;
			}
		},
	},

};
