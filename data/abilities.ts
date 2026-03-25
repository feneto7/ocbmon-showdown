/*

Ratings and how they work:

-1: Detrimental
	  An ability that severely harms the user.
	ex. Defeatist, Slow Start

 0: Useless
	  An ability with no overall benefit in a singles battle.
	ex. Color Change, Plus

 1: Ineffective
	  An ability that has minimal effect or is only useful in niche situations.
	ex. Light Metal, Suction Cups

 2: Useful
	  An ability that can be generally useful.
	ex. Flame Body, Overcoat

 3: Effective
	  An ability with a strong effect on the user or foe.
	ex. Chlorophyll, Sturdy

 4: Very useful
	  One of the more popular abilities. It requires minimal support to be effective.
	ex. Adaptability, Magic Bounce

 5: Essential
	  The sort of ability that defines metagames.
	ex. Imposter, Shadow Tag

*/

// Helper usado por habilidades estilo Parental Bond (ragingboxer, etc.) para não aplicar multihit em moves incompatíveis
function isParentalBondBanned(move: ActiveMove, _source: Pokemon): boolean {
	return move.category === 'Status' || !!move.multihit || !!move.flags['noparentalbond'] ||
		!!move.flags['charge'] || !!move.flags['futuremove'] || !!move.spreadHit || !!move.isZ || !!move.isMax;
}

export const Abilities = {
	noability: {
		isNonstandard: "Past",
		flags: {},
		name: "No Ability",
		rating: 0.1,
		num: 0,
	},
	adaptability: {
		onModifySTAB(stab, source, target, move) {
			if (move.forceSTAB || source.hasType(move.type)) {
				if (stab === 2) {
					return 2.25;
				}
				return 2;
			}
		},
		flags: {},
		name: "Adaptability",
		rating: 4,
		num: 91,
	},
	aerilate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Flying';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		flags: {},
		name: "Aerilate",
		rating: 4,
		num: 184,
	},
	aftermath: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (!target.hp && this.checkMoveMakesContact(move, source, target, true)) {
				this.damage(source.baseMaxhp / 4, source, target);
			}
		},
		flags: {},
		name: "Aftermath",
		rating: 2,
		num: 106,
	},
	airlock: {
		onSwitchIn(pokemon) {
			// Air Lock does not activate when Skill Swapped or when Neutralizing Gas leaves the field
			this.add('-ability', pokemon, 'Air Lock');
			((this.effect as any).onStart as (p: Pokemon) => void).call(this, pokemon);
		},
		onStart(pokemon) {
			pokemon.abilityState.ending = false; // Clear the ending flag
			this.eachEvent('WeatherChange', this.effect);
		},
		onEnd(pokemon) {
			pokemon.abilityState.ending = true;
			this.eachEvent('WeatherChange', this.effect);
		},
		suppressWeather: true,
		flags: {},
		name: "Air Lock",
		rating: 1.5,
		num: 76,
	},
	analytic: {
		onBasePowerPriority: 21,
		onBasePower(basePower, pokemon) {
			let boosted = true;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (this.queue.willMove(target)) {
					boosted = false;
					break;
				}
			}
			if (boosted) {
				this.debug('Analytic boost');
				return this.chainModify([5325, 4096]);
			}
		},
		flags: {},
		name: "Analytic",
		rating: 2.5,
		num: 148,
	},
	angerpoint: {
		onHit(target, source, move) {
			if (!target.hp) return;
			if (move?.effectType === 'Move' && target.getMoveHitData(move).crit) {
				this.boost({ atk: 12 }, target, target);
			}
		},
		flags: {},
		name: "Anger Point",
		rating: 1,
		num: 83,
	},
	angershell: {
		onDamage(damage, target, source, effect) {
			if (
				effect.effectType === "Move" &&
				!effect.multihit &&
				!(effect.hasSheerForce && source.hasAbility('sheerforce'))
			) {
				this.effectState.checkedAngerShell = false;
			} else {
				this.effectState.checkedAngerShell = true;
			}
		},
		onTryEatItem(item) {
			const healingItems = [
				'aguavberry', 'enigmaberry', 'figyberry', 'iapapaberry', 'magoberry', 'sitrusberry', 'wikiberry', 'oranberry', 'berryjuice',
			];
			if (healingItems.includes(item.id)) {
				return this.effectState.checkedAngerShell;
			}
			return true;
		},
		onAfterMoveSecondary(target, source, move) {
			this.effectState.checkedAngerShell = true;
			if (!source || source === target || !target.hp || !move.totalDamage) return;
			const lastAttackedBy = target.getLastAttackedBy();
			if (!lastAttackedBy) return;
			const damage = move.multihit ? move.totalDamage : lastAttackedBy.damage;
			if (target.hp <= target.maxhp / 2 && target.hp + damage > target.maxhp / 2) {
				this.boost({ atk: 1, spa: 1, spe: 1, def: -1, spd: -1 }, target, target);
			}
		},
		flags: {},
		name: "Anger Shell",
		rating: 3,
		num: 271,
	},
	anticipation: {
		onStart(pokemon) {
			for (const target of pokemon.foes()) {
				for (const moveSlot of target.moveSlots) {
					const move = this.dex.moves.get(moveSlot.move);
					if (move.category === 'Status') continue;
					const moveType = move.id === 'hiddenpower' ? target.hpType : move.type;
					if (
						this.dex.getImmunity(moveType, pokemon) && this.dex.getEffectiveness(moveType, pokemon) > 0 ||
						move.ohko
					) {
						this.add('-ability', pokemon, 'Anticipation');
						return;
					}
				}
			}
		},
		flags: {},
		name: "Anticipation",
		rating: 0.5,
		num: 107,
	},
	arenatrap: {
		onFoeTrapPokemon(pokemon) {
			if (!pokemon.isAdjacent(this.effectState.target)) return;
			if (pokemon.isGrounded()) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			if (!source) source = this.effectState.target;
			if (!source || !pokemon.isAdjacent(source)) return;
			if (pokemon.isGrounded(!pokemon.knownType)) { // Negate immunity if the type is unknown
				pokemon.maybeTrapped = true;
			}
		},
		flags: {},
		name: "Arena Trap",
		rating: 5,
		num: 71,
	},
	armortail: {
		onFoeTryMove(target, source, move) {
			const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
				return;
			}

			const armorTailHolder = this.effectState.target;
			if ((source.isAlly(armorTailHolder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', armorTailHolder, 'ability: Armor Tail', move, `[of] ${target}`);
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Armor Tail",
		rating: 2.5,
		num: 296,
	},
	aromaveil: {
		onAllyTryAddVolatile(status, target, source, effect) {
			if (['attract', 'disable', 'encore', 'healblock', 'taunt', 'torment'].includes(status.id)) {
				if (effect.effectType === 'Move') {
					const effectHolder = this.effectState.target;
					this.add('-block', target, 'ability: Aroma Veil', `[of] ${effectHolder}`);
				}
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Aroma Veil",
		rating: 2,
		num: 165,
	},
	asoneglastrier: {
		onSwitchInPriority: 1,
		onStart(pokemon) {
			if (this.effectState.unnerved) return;
			this.add('-ability', pokemon, 'As One');
			this.add('-ability', pokemon, 'Unnerve');
			this.effectState.unnerved = true;
		},
		onEnd() {
			this.effectState.unnerved = false;
		},
		onFoeTryEatItem() {
			return !this.effectState.unnerved;
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ atk: length }, source, source, this.dex.abilities.get('chillingneigh'));
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "As One (Glastrier)",
		rating: 3.5,
		num: 266,
	},
	asonespectrier: {
		onSwitchInPriority: 1,
		onStart(pokemon) {
			if (this.effectState.unnerved) return;
			this.add('-ability', pokemon, 'As One');
			this.add('-ability', pokemon, 'Unnerve');
			this.effectState.unnerved = true;
		},
		onEnd() {
			this.effectState.unnerved = false;
		},
		onFoeTryEatItem() {
			return !this.effectState.unnerved;
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ spa: length }, source, source, this.dex.abilities.get('grimneigh'));
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "As One (Spectrier)",
		rating: 3.5,
		num: 267,
	},
	aurabreak: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Aura Break');
		},
		onAnyTryPrimaryHit(target, source, move) {
			if (target === source || move.category === 'Status') return;
			move.hasAuraBreak = true;
		},
		flags: { breakable: 1 },
		name: "Aura Break",
		rating: 1,
		num: 188,
	},
	baddreams: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (!pokemon.hp) return;
			for (const target of pokemon.foes()) {
				if (target.status === 'slp' || target.hasAbility('comatose')) {
					this.damage(target.baseMaxhp / 8, target, pokemon);
				}
			}
		},
		flags: {},
		name: "Bad Dreams",
		rating: 1.5,
		num: 123,
	},
	ballfetch: {
		flags: {},
		name: "Ball Fetch",
		rating: 0,
		num: 237,
	},
	battery: {
		onAllyBasePowerPriority: 22,
		onAllyBasePower(basePower, attacker, defender, move) {
			if (attacker !== this.effectState.target && move.category === 'Special') {
				this.debug('Battery boost');
				return this.chainModify([5325, 4096]);
			}
		},
		flags: {},
		name: "Battery",
		rating: 0,
		num: 217,
	},
	battlearmor: {
		onCriticalHit: false,
		flags: { breakable: 1 },
		name: "Battle Armor",
		rating: 1,
		num: 4,
	},
	battlebond: {
		onSourceAfterFaint(length, target, source, effect) {
			if (source.bondTriggered) return;
			if (effect?.effectType !== 'Move') return;
			if (source.species.id === 'greninjabond' && source.hp && !source.transformed && source.side.foePokemonLeft()) {
				this.boost({ atk: 1, spa: 1, spe: 1 }, source, source, this.effect);
				this.add('-activate', source, 'ability: Battle Bond');
				source.bondTriggered = true;
			}
		},
		onModifyMovePriority: -1,
		onModifyMove(move, attacker) {
			if (move.id === 'watershuriken' && attacker.species.name === 'Greninja-Ash' &&
				!attacker.transformed) {
				move.multihit = 3;
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Battle Bond",
		rating: 3.5,
		num: 210,
	},
	beadsofruin: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Beads of Ruin');
		},
		onAnyModifySpD(spd, target, source, move) {
			const abilityHolder = this.effectState.target;
			if (target.hasAbility('Beads of Ruin')) return;
			if (!move.ruinedSpD?.hasAbility('Beads of Ruin')) move.ruinedSpD = abilityHolder;
			if (move.ruinedSpD !== abilityHolder) return;
			this.debug('Beads of Ruin SpD drop');
			return this.chainModify(0.75);
		},
		flags: {},
		name: "Beads of Ruin",
		rating: 4.5,
		num: 284,
	},
	beastboost: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				const bestStat = source.getBestStat(true, true);
				this.boost({ [bestStat]: length }, source);
			}
		},
		flags: {},
		name: "Beast Boost",
		rating: 3.5,
		num: 224,
	},
	berserk: {
		onDamage(damage, target, source, effect) {
			if (
				effect.effectType === "Move" &&
				!effect.multihit &&
				!(effect.hasSheerForce && source.hasAbility('sheerforce'))
			) {
				this.effectState.checkedBerserk = false;
			} else {
				this.effectState.checkedBerserk = true;
			}
		},
		onTryEatItem(item) {
			const healingItems = [
				'aguavberry', 'enigmaberry', 'figyberry', 'iapapaberry', 'magoberry', 'sitrusberry', 'wikiberry', 'oranberry', 'berryjuice',
			];
			if (healingItems.includes(item.id)) {
				return this.effectState.checkedBerserk;
			}
			return true;
		},
		onAfterMoveSecondary(target, source, move) {
			this.effectState.checkedBerserk = true;
			if (!source || source === target || !target.hp || !move.totalDamage) return;
			const lastAttackedBy = target.getLastAttackedBy();
			if (!lastAttackedBy) return;
			const damage = move.multihit && !move.smartTarget ? move.totalDamage : lastAttackedBy.damage;
			if (target.hp <= target.maxhp / 2 && target.hp + damage > target.maxhp / 2) {
				this.boost({ spa: 1 }, target, target);
			}
		},
		flags: {},
		name: "Berserk",
		rating: 2,
		num: 201,
	},
	bigpecks: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.def && boost.def < 0) {
				delete boost.def;
				if (!(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
					this.add("-fail", target, "unboost", "Defense", "[from] ability: Big Pecks", `[of] ${target}`);
				}
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['bigpecksboost']) {
				this.debug('Big Pecks move boost');
				return this.chainModify([4915, 4096]);
			}
		},
		flags: { breakable: 1 },
		name: "Big Pecks",
		rating: 0.5,
		num: 145,
	},
	blaze: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Fire' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Blaze boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Fire' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Blaze boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Blaze",
		rating: 2,
		num: 66,
	},
	bulletproof: {
		onTryHit(pokemon, target, move) {
			if (move.flags['bullet']) {
				this.add('-immune', pokemon, '[from] ability: Bulletproof');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Bulletproof",
		rating: 3,
		num: 171,
	},
	cheekpouch: {
		onEatItem(item, pokemon) {
			this.heal(pokemon.baseMaxhp / 3);
		},
		flags: {},
		name: "Cheek Pouch",
		rating: 2,
		num: 167,
	},
	chillingneigh: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ atk: length }, source);
			}
		},
		flags: {},
		name: "Chilling Neigh",
		rating: 3,
		num: 264,
	},
	chlorophyll: {
		onModifySpe(spe, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Chlorophyll",
		rating: 3,
		num: 34,
	},
	clearbody: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add("-fail", target, "unboost", "[from] ability: Clear Body", `[of] ${target}`);
			}
		},
		flags: { breakable: 1 },
		name: "Clear Body",
		rating: 2,
		num: 29,
	},
	cloudnine: {
		onSwitchIn(pokemon) {
			// Cloud Nine does not activate when Skill Swapped or when Neutralizing Gas leaves the field
			this.add('-ability', pokemon, 'Cloud Nine');
			((this.effect as any).onStart as (p: Pokemon) => void).call(this, pokemon);
		},
		onStart(pokemon) {
			pokemon.abilityState.ending = false; // Clear the ending flag
			this.eachEvent('WeatherChange', this.effect);
		},
		onEnd(pokemon) {
			pokemon.abilityState.ending = true;
			this.eachEvent('WeatherChange', this.effect);
		},
		suppressWeather: true,
		flags: {},
		name: "Cloud Nine",
		rating: 1.5,
		num: 13,
	},
	colorchange: {
		onAfterMoveSecondary(target, source, move) {
			if (!target.hp) return;
			const type = move.type;
			if (
				target.isActive && move.effectType === 'Move' && move.category !== 'Status' &&
				type !== '???' && !target.hasType(type)
			) {
				if (!target.setType(type)) return false;
				this.add('-start', target, 'typechange', type, '[from] ability: Color Change');

				if (target.side.active.length === 2 && target.position === 1) {
					// Curse Glitch
					const action = this.queue.willMove(target);
					if (action && action.move.id === 'curse') {
						action.targetLoc = -1;
					}
				}
			}
		},
		flags: {},
		name: "Color Change",
		rating: 0,
		num: 16,
	},
	comatose: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Comatose');
		},
		onSetStatus(status, target, source, effect) {
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Comatose');
			}
			return false;
		},
		// Permanent sleep "status" implemented in the relevant sleep-checking effects
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Comatose",
		rating: 4,
		num: 213,
	},
	commander: {
		onAnySwitchInPriority: -2,
		onAnySwitchIn() {
			((this.effect as any).onUpdate as (p: Pokemon) => void).call(this, this.effectState.target);
		},
		onStart(pokemon) {
			((this.effect as any).onUpdate as (p: Pokemon) => void).call(this, pokemon);
		},
		onUpdate(pokemon) {
			if (this.gameType !== 'doubles') return;
			// don't run between when a Pokemon switches in and the resulting onSwitchIn event
			if (this.queue.peek()?.choice === 'runSwitch') return;

			const ally = pokemon.allies()[0];
			if (pokemon.switchFlag || ally?.switchFlag) return;
			if (!ally || pokemon.baseSpecies.baseSpecies !== 'Tatsugiri' || ally.baseSpecies.baseSpecies !== 'Dondozo') {
				// Handle any edge cases
				if (pokemon.getVolatile('commanding')) pokemon.removeVolatile('commanding');
				return;
			}

			if (!pokemon.getVolatile('commanding')) {
				// If Dondozo already was commanded this fails
				if (ally.getVolatile('commanded')) return;
				// Cancel all actions this turn for pokemon if applicable
				this.queue.cancelAction(pokemon);
				// Add volatiles to both pokemon
				this.add('-activate', pokemon, 'ability: Commander', `[of] ${ally}`);
				pokemon.addVolatile('commanding');
				ally.addVolatile('commanded', pokemon);
				// Continued in conditions.ts in the volatiles
			} else {
				if (!ally.fainted) return;
				pokemon.removeVolatile('commanding');
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1 },
		name: "Commander",
		rating: 0,
		num: 279,
	},
	competitive: {
		onAfterEachBoost(boost, target, source, effect) {
			if (!source || target.isAlly(source)) {
				return;
			}
			let statsLowered = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					statsLowered = true;
				}
			}
			if (statsLowered) {
				this.boost({ spa: 2 }, target, target, null, false, true);
			}
		},
		flags: {},
		name: "Competitive",
		rating: 2.5,
		num: 172,
	},
	compoundeyes: {
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			this.debug('compoundeyes - enhancing accuracy');
			return this.chainModify([5325, 4096]);
		},
		flags: {},
		name: "Compound Eyes",
		rating: 3,
		num: 14,
	},
	contrary: {
		onChangeBoost(boost, target, source, effect) {
			if (effect && effect.id === 'zpower') return;
			let i: BoostID;
			for (i in boost) {
				boost[i]! *= -1;
			}
		},
		flags: { breakable: 1 },
		name: "Contrary",
		rating: 4.5,
		num: 126,
	},
	corrosion: {
		// Implemented in sim/pokemon.js:Pokemon#setStatus
		flags: {},
		name: "Corrosion",
		rating: 2.5,
		num: 212,
	},
	costar: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			const ally = pokemon.allies()[0];
			if (!ally) return;

			let i: BoostID;
			for (i in ally.boosts) {
				pokemon.boosts[i] = ally.boosts[i];
			}
			const volatilesToCopy = ['dragoncheer', 'focusenergy', 'gmaxchistrike', 'laserfocus'];
			// we need to be sure to remove all the overlapping crit volatiles before trying to add any
			for (const volatile of volatilesToCopy) pokemon.removeVolatile(volatile);
			for (const volatile of volatilesToCopy) {
				if (ally.volatiles[volatile]) {
					pokemon.addVolatile(volatile);
					if (volatile === 'gmaxchistrike') pokemon.volatiles[volatile].layers = ally.volatiles[volatile].layers;
					if (volatile === 'dragoncheer') pokemon.volatiles[volatile].hasDragonType = ally.volatiles[volatile].hasDragonType;
				}
			}
			this.add('-copyboost', pokemon, ally, '[from] ability: Costar');
		},
		flags: {},
		name: "Costar",
		rating: 0,
		num: 294,
	},
	cottondown: {
		onDamagingHit(damage, target, source, move) {
			let activated = false;
			for (const pokemon of this.getAllActive()) {
				if (pokemon === target || pokemon.fainted) continue;
				if (!activated) {
					this.add('-ability', target, 'Cotton Down');
					activated = true;
				}
				this.boost({ spe: -1 }, pokemon, target, null, true);
			}
		},
		flags: {},
		name: "Cotton Down",
		rating: 2,
		num: 238,
	},
	cudchew: {
		onEatItem(item, pokemon, source, effect) {
			if (item.isBerry && (!effect || !['bugbite', 'pluck'].includes(effect.id))) {
				this.effectState.berry = item;
				this.effectState.counter = 2;
				// This is needed in case the berry was eaten during residuals, preventing the timer from decreasing this turn
				if (!this.queue.peek()) this.effectState.counter--;
			}
		},
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (!this.effectState.berry || !pokemon.hp) return;
			if (--this.effectState.counter <= 0) {
				const item = this.effectState.berry;
				this.add('-activate', pokemon, 'ability: Cud Chew');
				this.add('-enditem', pokemon, item.name, '[eat]');
				if (this.singleEvent('Eat', item, null, pokemon, null, null)) {
					this.runEvent('EatItem', pokemon, null, null, item);
				}
				if (item.onEat) pokemon.ateBerry = true;
				delete this.effectState.berry;
				delete this.effectState.counter;
			}
		},
		flags: {},
		name: "Cud Chew",
		rating: 2,
		num: 291,
	},
	curiousmedicine: {
		onStart(pokemon) {
			for (const ally of pokemon.adjacentAllies()) {
				ally.clearBoosts();
				this.add('-clearboost', ally, '[from] ability: Curious Medicine', `[of] ${pokemon}`);
			}
		},
		flags: {},
		name: "Curious Medicine",
		rating: 0,
		num: 261,
	},
	cursedbody: {
		onDamagingHit(damage, target, source, move) {
			if (source.volatiles['disable']) return;
			if (!move.isMax && !move.flags['futuremove'] && move.id !== 'struggle') {
				if (this.randomChance(3, 10)) {
					source.addVolatile('disable', this.effectState.target);
				}
			}
		},
		flags: {},
		name: "Cursed Body",
		rating: 2,
		num: 130,
	},
	cutecharm: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.addVolatile('attract', this.effectState.target);
				}
			}
		},
		flags: {},
		name: "Cute Charm",
		rating: 0.5,
		num: 56,
	},
	damp: {
		onAnyTryMove(target, source, effect) {
			if (['explosion', 'mindblown', 'mistyexplosion', 'selfdestruct'].includes(effect.id)) {
				this.attrLastMove('[still]');
				this.add('cant', this.effectState.target, 'ability: Damp', effect, `[of] ${target}`);
				return false;
			}
		},
		onAnyDamage(damage, target, source, effect) {
			if (effect && effect.name === 'Aftermath') {
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Damp",
		rating: 0.5,
		num: 6,
	},
	dancer: {
		flags: {},
		name: "Dancer",
		// implemented in runMove in scripts.js
		rating: 1.5,
		num: 216,
	},
	darkaura: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Dark Aura');
		},
		onAnyBasePowerPriority: 20,
		onAnyBasePower(basePower, source, target, move) {
			if (target === source || move.category === 'Status' || move.type !== 'Dark') return;
			if (!move.auraBooster?.hasAbility('Dark Aura')) move.auraBooster = this.effectState.target;
			if (move.auraBooster !== this.effectState.target) return;
			return this.chainModify([move.hasAuraBreak ? 3072 : 5448, 4096]);
		},
		flags: {},
		name: "Dark Aura",
		rating: 3,
		num: 186,
	},
	dauntlessshield: {
		onStart(pokemon) {
			if (pokemon.shieldBoost) return;
			pokemon.shieldBoost = true;
			this.boost({ def: 1 }, pokemon);
		},
		flags: {},
		name: "Dauntless Shield",
		rating: 3.5,
		num: 235,
	},
	dazzling: {
		onFoeTryMove(target, source, move) {
			const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
				return;
			}

			const dazzlingHolder = this.effectState.target;
			if ((source.isAlly(dazzlingHolder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', dazzlingHolder, 'ability: Dazzling', move, `[of] ${target}`);
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Dazzling",
		rating: 2.5,
		num: 219,
	},
	defeatist: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				return this.chainModify(0.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				return this.chainModify(0.5);
			}
		},
		flags: {},
		name: "Defeatist",
		rating: -1,
		num: 129,
	},
	defiant: {
		onAfterEachBoost(boost, target, source, effect) {
			if (!source || target.isAlly(source)) {
				return;
			}
			let statsLowered = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					statsLowered = true;
				}
			}
			if (statsLowered) {
				this.boost({ atk: 2 }, target, target, null, false, true);
			}
		},
		flags: {},
		name: "Defiant",
		rating: 3,
		num: 128,
	},
	deltastream: {
		onStart(source) {
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
		flags: {},
		name: "Delta Stream",
		rating: 4,
		num: 191,
	},
	desolateland: {
		onStart(source) {
			this.field.setWeather('desolateland');
		},
		onAnySetWeather(target, source, weather) {
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			if (this.field.getWeather().id === 'desolateland' && !strongWeathers.includes(weather.id)) return false;
		},
		onEnd(pokemon) {
			if (this.field.weatherState.source !== pokemon) return;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (target.hasAbility('desolateland') || target.hasAbility('blisteringsun')) {
					this.field.weatherState.source = target;
					return;
				}
			}
			this.field.clearWeather();
		},
		flags: {},
		name: "Desolate Land",
		rating: 4.5,
		num: 190,
	},
	disguise: {
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (effect?.effectType === 'Move' && ['mimikyu', 'mimikyutotem'].includes(target.species.id)) {
				this.add('-activate', target, 'ability: Disguise');
				this.effectState.busted = true;
				return 0;
			}
		},
		onCriticalHit(target, source, move) {
			if (!target) return;
			if (!['mimikyu', 'mimikyutotem'].includes(target.species.id)) {
				return;
			}
			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;

			if (!target.runImmunity(move)) return;
			return false;
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target || move.category === 'Status') return;
			if (!['mimikyu', 'mimikyutotem'].includes(target.species.id)) {
				return;
			}

			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;

			if (!target.runImmunity(move)) return;
			return 0;
		},
		onUpdate(pokemon) {
			if (['mimikyu', 'mimikyutotem'].includes(pokemon.species.id) && this.effectState.busted) {
				const speciesid = pokemon.species.id === 'mimikyutotem' ? 'Mimikyu-Busted-Totem' : 'Mimikyu-Busted';
				pokemon.formeChange(speciesid, this.effect, true);
				this.damage(pokemon.baseMaxhp / 8, pokemon, pokemon, this.dex.species.get(speciesid));
			}
		},
		flags: {
			failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1,
			breakable: 1, notransform: 1,
		},
		name: "Disguise",
		rating: 3.5,
		num: 209,
	},
	download: {
		onStart(pokemon) {
			let totaldef = 0;
			let totalspd = 0;
			for (const target of pokemon.foes()) {
				totaldef += target.getStat('def', false, true);
				totalspd += target.getStat('spd', false, true);
			}
			if (totaldef && totaldef >= totalspd) {
				this.boost({ spa: 1 });
			} else if (totalspd) {
				this.boost({ atk: 1 });
			}
		},
		flags: {},
		name: "Download",
		rating: 3.5,
		num: 88,
	},
	dragonsmaw: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Dragon') {
				this.debug('Dragon\'s Maw boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Dragon') {
				this.debug('Dragon\'s Maw boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Dragon's Maw",
		rating: 3.5,
		num: 263,
	},
	drizzle: {
		onStart(source) {
			if (source.species.id === 'kyogre' && source.item === 'blueorb') return;
			this.field.setWeather('raindance');
		},
		flags: {},
		name: "Drizzle",
		rating: 4,
		num: 2,
	},
	drought: {
		onStart(source) {
			if (source.species.id === 'groudon' && source.item === 'redorb') return;
			this.field.setWeather('sunnyday');
		},
		flags: {},
		name: "Drought",
		rating: 4,
		num: 70,
	},
	dryskin: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Water') {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Dry Skin');
				}
				return null;
			}
		},
		onSourceBasePowerPriority: 17,
		onSourceBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Fire') {
				return this.chainModify(1.25);
			}
		},
		onWeather(target, source, effect) {
			if (target.hasItem('utilityumbrella')) return;
			if (effect.id === 'raindance' || effect.id === 'primordialsea') {
				this.heal(target.baseMaxhp / 8);
			} else if (effect.id === 'sunnyday' || effect.id === 'desolateland') {
				this.damage(target.baseMaxhp / 8, target, target);
			}
		},
		flags: { breakable: 1 },
		name: "Dry Skin",
		rating: 3,
		num: 87,
	},
	earlybird: {
		flags: {},
		name: "Early Bird",
		// Implemented in statuses.js
		rating: 1.5,
		num: 48,
	},
	eartheater: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Ground') {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Earth Eater');
				}
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Earth Eater",
		rating: 3.5,
		num: 297,
	},
	effectspore: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target) && !source.status && source.runStatusImmunity('powder')) {
				const r = this.random(100);
				if (r < 11) {
					source.setStatus('slp', target);
				} else if (r < 21) {
					source.setStatus('par', target);
				} else if (r < 30) {
					source.setStatus('psn', target);
				}
			}
		},
		flags: {},
		name: "Effect Spore",
		rating: 2,
		num: 27,
	},
	electricsurge: {
		onStart(source) {
			this.field.setTerrain('electricterrain');
		},
		flags: {},
		name: "Electric Surge",
		rating: 4,
		num: 226,
	},
	electromorphosis: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			target.addVolatile('charge');
		},
		flags: {},
		name: "Electromorphosis",
		rating: 3,
		num: 280,
	},
	embodyaspectcornerstone: {
		onStart(pokemon) {
			if (pokemon.baseSpecies.name === 'Ogerpon-Cornerstone-Tera' && pokemon.terastallized &&
				!this.effectState.embodied) {
				this.effectState.embodied = true;
				this.boost({ def: 1 }, pokemon);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Embody Aspect (Cornerstone)",
		rating: 3.5,
		num: 304,
	},
	embodyaspecthearthflame: {
		onStart(pokemon) {
			if (pokemon.baseSpecies.name === 'Ogerpon-Hearthflame-Tera' && pokemon.terastallized &&
				!this.effectState.embodied) {
				this.effectState.embodied = true;
				this.boost({ atk: 1 }, pokemon);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Embody Aspect (Hearthflame)",
		rating: 3.5,
		num: 303,
	},
	embodyaspectteal: {
		onStart(pokemon) {
			if (pokemon.baseSpecies.name === 'Ogerpon-Teal-Tera' && pokemon.terastallized &&
				!this.effectState.embodied) {
				this.effectState.embodied = true;
				this.boost({ spe: 1 }, pokemon);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Embody Aspect (Teal)",
		rating: 3.5,
		num: 301,
	},
	embodyaspectwellspring: {
		onStart(pokemon) {
			if (pokemon.baseSpecies.name === 'Ogerpon-Wellspring-Tera' && pokemon.terastallized &&
				!this.effectState.embodied) {
				this.effectState.embodied = true;
				this.boost({ spd: 1 }, pokemon);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Embody Aspect (Wellspring)",
		rating: 3.5,
		num: 302,
	},
	emergencyexit: {
		onEmergencyExit(target) {
			if (!this.canSwitch(target.side) || target.forceSwitchFlag || target.switchFlag) return;
			for (const side of this.sides) {
				for (const active of side.active) {
					active.switchFlag = false;
				}
			}
			target.switchFlag = true;
			this.add('-activate', target, 'ability: Emergency Exit');
		},
		flags: {},
		name: "Emergency Exit",
		rating: 1,
		num: 194,
	},
	fairyaura: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Fairy Aura');
		},
		onAnyBasePowerPriority: 20,
		onAnyBasePower(basePower, source, target, move) {
			if (target === source || move.category === 'Status' || move.type !== 'Fairy') return;
			if (!move.auraBooster?.hasAbility('Fairy Aura')) move.auraBooster = this.effectState.target;
			if (move.auraBooster !== this.effectState.target) return;
			return this.chainModify([move.hasAuraBreak ? 3072 : 5448, 4096]);
		},
		flags: {},
		name: "Fairy Aura",
		rating: 3,
		num: 187,
	},
	filter: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug('Filter neutralize');
				return this.chainModify(0.75);
			}
		},
		flags: { breakable: 1 },
		name: "Filter",
		rating: 3,
		num: 111,
	},
	flamebody: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.trySetStatus('brn', target);
				}
			}
		},
		flags: {},
		name: "Flame Body",
		rating: 2,
		num: 49,
	},
	flareboost: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (attacker.status === 'brn' && move.category === 'Special') {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Flare Boost",
		rating: 2,
		num: 138,
	},
	flashfire: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Fire') {
				move.accuracy = true;
				if (!target.addVolatile('flashfire')) {
					this.add('-immune', target, '[from] ability: Flash Fire');
				}
				return null;
			}
		},
		onEnd(pokemon) {
			pokemon.removeVolatile('flashfire');
		},
		condition: {
			noCopy: true, // doesn't get copied by Baton Pass
			onStart(target) {
				this.add('-start', target, 'ability: Flash Fire');
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, attacker, defender, move) {
				if (move.type === 'Fire' && attacker.hasAbility('flashfire')) {
					this.debug('Flash Fire boost');
					return this.chainModify(1.5);
				}
			},
			onModifySpAPriority: 5,
			onModifySpA(atk, attacker, defender, move) {
				if (move.type === 'Fire' && attacker.hasAbility('flashfire')) {
					this.debug('Flash Fire boost');
					return this.chainModify(1.5);
				}
			},
			onEnd(target) {
				this.add('-end', target, 'ability: Flash Fire', '[silent]');
			},
		},
		flags: { breakable: 1 },
		name: "Flash Fire",
		rating: 3.5,
		num: 18,
	},
	flowergift: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			if (!pokemon.isActive || pokemon.baseSpecies.baseSpecies !== 'Cherrim' || pokemon.transformed) return;
			if (!pokemon.hp) return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				if (pokemon.species.id !== 'cherrimsunshine') {
					pokemon.formeChange('Cherrim-Sunshine', this.effect, false, '0', '[msg]');
				}
			} else {
				if (pokemon.species.id === 'cherrimsunshine') {
					pokemon.formeChange('Cherrim', this.effect, false, '0', '[msg]');
				}
			}
		},
		onAllyModifyAtkPriority: 3,
		onAllyModifyAtk(atk, pokemon) {
			if (this.effectState.target.baseSpecies.baseSpecies !== 'Cherrim') return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		onAllyModifySpDPriority: 4,
		onAllyModifySpD(spd, pokemon) {
			if (this.effectState.target.baseSpecies.baseSpecies !== 'Cherrim') return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, breakable: 1 },
		name: "Flower Gift",
		rating: 1,
		num: 122,
	},
	flowerveil: {
		onAllyTryBoost(boost, target, source, effect) {
			if ((source && target === source) || !target.hasType('Grass')) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries) {
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Flower Veil', `[of] ${effectHolder}`);
			}
		},
		onAllySetStatus(status, target, source, effect) {
			if (target.hasType('Grass') && source && target !== source && effect && effect.id !== 'yawn') {
				this.debug('interrupting setStatus with Flower Veil');
				if (effect.name === 'Synchronize' || (effect.effectType === 'Move' && !effect.secondaries)) {
					const effectHolder = this.effectState.target;
					this.add('-block', target, 'ability: Flower Veil', `[of] ${effectHolder}`);
				}
				return null;
			}
		},
		onAllyTryAddVolatile(status, target) {
			if (target.hasType('Grass') && status.id === 'yawn') {
				this.debug('Flower Veil blocking yawn');
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Flower Veil', `[of] ${effectHolder}`);
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Flower Veil",
		rating: 0,
		num: 166,
	},
	fluffy: {
		onSourceModifyDamage(damage, source, target, move) {
			let mod = 1;
			if (move.type === 'Fire') mod *= 2;
			if (move.flags['contact']) mod /= 2;
			return this.chainModify(mod);
		},
		flags: { breakable: 1 },
		name: "Fluffy",
		rating: 3.5,
		num: 218,
	},
	forecast: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Castform' || pokemon.transformed) return;
			let forme = null;
			switch (pokemon.effectiveWeather()) {
			case 'sunnyday':
			case 'desolateland':
				if (pokemon.species.id !== 'castformsunny') forme = 'Castform-Sunny';
				break;
			case 'raindance':
			case 'primordialsea':
				if (pokemon.species.id !== 'castformrainy') forme = 'Castform-Rainy';
				break;
			case 'hail':
			case 'snowscape':
				if (pokemon.species.id !== 'castformsnowy') forme = 'Castform-Snowy';
				break;
			default:
				if (pokemon.species.id !== 'castform') forme = 'Castform';
				break;
			}
			if (pokemon.isActive && forme) {
				pokemon.formeChange(forme, this.effect, false, '0', '[msg]');
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Forecast",
		rating: 2,
		num: 59,
	},
	forewarn: {
		onStart(pokemon) {
			let warnMoves: (Move | Pokemon)[][] = [];
			let warnBp = 1;
			for (const target of pokemon.foes()) {
				for (const moveSlot of target.moveSlots) {
					const move = this.dex.moves.get(moveSlot.move);
					let bp = move.basePower;
					if (move.ohko) bp = 150;
					if (move.id === 'counter' || move.id === 'metalburst' || move.id === 'mirrorcoat') bp = 120;
					if (bp === 1) bp = 80;
					if (!bp && move.category !== 'Status') bp = 80;
					if (bp > warnBp) {
						warnMoves = [[move, target]];
						warnBp = bp;
					} else if (bp === warnBp) {
						warnMoves.push([move, target]);
					}
				}
			}
			if (!warnMoves.length) return;
			const [warnMoveName, warnTarget] = this.sample(warnMoves);
			this.add('-activate', pokemon, 'ability: Forewarn', warnMoveName, `[of] ${warnTarget}`);
		},
		flags: {},
		name: "Forewarn",
		rating: 0.5,
		num: 108,
	},
	friendguard: {
		onAnyModifyDamage(damage, source, target, move) {
			if (target !== this.effectState.target && target.isAlly(this.effectState.target)) {
				this.debug('Friend Guard weaken');
				return this.chainModify(0.75);
			}
		},
		flags: { breakable: 1 },
		name: "Friend Guard",
		rating: 0,
		num: 132,
	},
	frisk: {
		onStart(pokemon) {
			for (const target of pokemon.foes()) {
				if (target.item) {
					this.add('-item', target, target.getItem().name, '[from] ability: Frisk', `[of] ${pokemon}`);
				}
			}
		},
		flags: {},
		name: "Frisk",
		rating: 1.5,
		num: 119,
	},
	fullmetalbody: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add("-fail", target, "unboost", "[from] ability: Full Metal Body", `[of] ${target}`);
			}
		},
		flags: {},
		name: "Full Metal Body",
		rating: 2,
		num: 230,
	},
	furcoat: {
		onModifyDefPriority: 6,
		onModifyDef(def) {
			return this.chainModify(2);
		},
		flags: { breakable: 1 },
		name: "Fur Coat",
		rating: 4,
		num: 169,
	},
	galewings: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.type === 'Flying' && pokemon.hp === pokemon.maxhp) return priority + 1;
		},
		flags: {},
		name: "Gale Wings",
		rating: 1.5,
		num: 177,
	},
	galvanize: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Electric';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		flags: {},
		name: "Galvanize",
		rating: 4,
		num: 206,
	},
	gluttony: {
		onStart(pokemon) {
			pokemon.abilityState.gluttony = true;
		},
		onDamage(item, pokemon) {
			pokemon.abilityState.gluttony = true;
		},
		flags: {},
		name: "Gluttony",
		rating: 1.5,
		num: 82,
	},
	goodasgold: {
		onTryHit(target, source, move) {
			if (move.category === 'Status' && target !== source) {
				this.add('-immune', target, '[from] ability: Good as Gold');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Good as Gold",
		rating: 5,
		num: 283,
	},
	gooey: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.add('-ability', target, 'Gooey');
				this.boost({ spe: -1 }, source, target, null, true);
			}
		},
		flags: {},
		name: "Gooey",
		rating: 2,
		num: 183,
	},
	gorillatactics: {
		onStart(pokemon) {
			pokemon.abilityState.choiceLock = "";
		},
		onBeforeMove(pokemon, target, move) {
			if (move.isZOrMaxPowered || move.id === 'struggle') return;
			if (pokemon.abilityState.choiceLock && pokemon.abilityState.choiceLock !== move.id) {
				// Fails unless ability is being ignored (these events will not run), no PP lost.
				this.addMove('move', pokemon, move.name);
				this.attrLastMove('[still]');
				this.debug("Disabled by Gorilla Tactics");
				this.add('-fail', pokemon);
				return false;
			}
		},
		onModifyMove(move, pokemon) {
			if (pokemon.abilityState.choiceLock || move.isZOrMaxPowered || move.id === 'struggle') return;
			pokemon.abilityState.choiceLock = move.id;
		},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, pokemon) {
			if (pokemon.volatiles['dynamax']) return;
			// PLACEHOLDER
			this.debug('Gorilla Tactics Atk Boost');
			return this.chainModify(1.5);
		},
		onDisableMove(pokemon) {
			if (!pokemon.abilityState.choiceLock) return;
			if (pokemon.volatiles['dynamax']) return;
			for (const moveSlot of pokemon.moveSlots) {
				if (moveSlot.id !== pokemon.abilityState.choiceLock) {
					pokemon.disableMove(moveSlot.id, false, this.effectState.sourceEffect);
				}
			}
		},
		onEnd(pokemon) {
			pokemon.abilityState.choiceLock = "";
		},
		flags: {},
		name: "Gorilla Tactics",
		rating: 4.5,
		num: 255,
	},
	grasspelt: {
		onModifyDefPriority: 6,
		onModifyDef(pokemon) {
			if (this.field.isTerrain('grassyterrain')) return this.chainModify(1.5);
		},
		flags: { breakable: 1 },
		name: "Grass Pelt",
		rating: 0.5,
		num: 179,
	},
	grassysurge: {
		onStart(source) {
			this.field.setTerrain('grassyterrain');
		},
		flags: {},
		name: "Grassy Surge",
		rating: 4,
		num: 229,
	},
	grimneigh: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ spa: length }, source);
			}
		},
		flags: {},
		name: "Grim Neigh",
		rating: 3,
		num: 265,
	},
	guarddog: {
		onDragOutPriority: 1,
		onDragOut(pokemon) {
			this.add('-activate', pokemon, 'ability: Guard Dog');
			return null;
		},
		onTryBoostPriority: 2,
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.boost({ atk: 1 }, target, target, null, false, true);
			}
		},
		flags: { breakable: 1 },
		name: "Guard Dog",
		rating: 2,
		num: 275,
	},
	gulpmissile: {
		onDamagingHit(damage, target, source, move) {
			if (!source.hp || !source.isActive || target.isSemiInvulnerable()) return;
			if (['cramorantgulping', 'cramorantgorging'].includes(target.species.id)) {
				this.damage(source.baseMaxhp / 4, source, target);
				if (target.species.id === 'cramorantgulping') {
					this.boost({ def: -1 }, source, target, null, true);
				} else {
					source.trySetStatus('par', target, move);
				}
				target.formeChange('cramorant', move);
			}
		},
		// The Dive part of this mechanic is implemented in Dive's `onTryMove` in moves.ts
		onSourceTryPrimaryHit(target, source, effect) {
			if (effect?.id === 'surf' && source.hasAbility('gulpmissile') && source.species.name === 'Cramorant') {
				const forme = source.hp <= source.maxhp / 2 ? 'cramorantgorging' : 'cramorantgulping';
				source.formeChange(forme, effect);
			}
		},
		flags: { cantsuppress: 1, notransform: 1 },
		name: "Gulp Missile",
		rating: 2.5,
		num: 241,
	},
	guts: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Guts",
		rating: 3.5,
		num: 62,
	},
	hadronengine: {
		onStart(pokemon) {
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
		flags: {},
		name: "Hadron Engine",
		rating: 4.5,
		num: 289,
	},
	harvest: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (this.field.isWeather(['sunnyday', 'desolateland']) || this.randomChance(1, 2)) {
				if (pokemon.hp && !pokemon.item && this.dex.items.get(pokemon.lastItem).isBerry) {
					pokemon.setItem(pokemon.lastItem);
					pokemon.lastItem = '';
					this.add('-item', pokemon, pokemon.getItem(), '[from] ability: Harvest');
				}
			}
		},
		flags: {},
		name: "Harvest",
		rating: 2.5,
		num: 139,
	},
	healer: {
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			for (const allyActive of pokemon.adjacentAllies()) {
				if (allyActive.status && this.randomChance(3, 10)) {
					this.add('-activate', pokemon, 'ability: Healer');
					allyActive.cureStatus();
				}
			}
		},
		flags: {},
		name: "Healer",
		rating: 0,
		num: 131,
	},
	heatproof: {
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('Heatproof Atk weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('Heatproof SpA weaken');
				return this.chainModify(0.5);
			}
		},
		onDamage(damage, target, source, effect) {
			if (effect && effect.id === 'brn') {
				return damage / 2;
			}
		},
		flags: { breakable: 1 },
		name: "Heatproof",
		rating: 2,
		num: 85,
	},
	heavymetal: {
		onModifyWeightPriority: 1,
		onModifyWeight(weighthg) {
			return weighthg * 2;
		},
		flags: { breakable: 1 },
		name: "Heavy Metal",
		rating: 0,
		num: 134,
	},
	honeygather: {
		flags: {},
		name: "Honey Gather",
		rating: 0,
		num: 118,
	},
	hospitality: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			for (const ally of pokemon.adjacentAllies()) {
				this.heal(ally.baseMaxhp / 4, ally, pokemon);
			}
		},
		flags: {},
		name: "Hospitality",
		rating: 0,
		num: 299,
	},
	hugepower: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk) {
			return this.chainModify(2);
		},
		flags: {},
		name: "Huge Power",
		rating: 5,
		num: 37,
	},
	hungerswitch: {
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.species.baseSpecies !== 'Morpeko' || pokemon.terastallized) return;
			const targetForme = pokemon.species.name === 'Morpeko' ? 'Morpeko-Hangry' : 'Morpeko';
			pokemon.formeChange(targetForme);
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Hunger Switch",
		rating: 1,
		num: 258,
	},
	hustle: {
		// This should be applied directly to the stat as opposed to chaining with the others
		onModifyAtkPriority: 5,
		onModifyAtk(atk) {
			return this.modify(atk, 1.5);
		},
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy, target, source, move) {
			if (move.category === 'Physical' && typeof accuracy === 'number') {
				return this.chainModify([3277, 4096]);
			}
		},
		flags: {},
		name: "Hustle",
		rating: 3.5,
		num: 55,
	},
	hydration: {
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			if (pokemon.status && ['raindance', 'primordialsea'].includes(pokemon.effectiveWeather())) {
				this.debug('hydration');
				this.add('-activate', pokemon, 'ability: Hydration');
				pokemon.cureStatus();
			}
		},
		flags: {},
		name: "Hydration",
		rating: 1.5,
		num: 93,
	},
	hypercutter: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.atk && boost.atk < 0) {
				delete boost.atk;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "Attack", "[from] ability: Hyper Cutter", `[of] ${target}`);
				}
			}
		},
		flags: { breakable: 1 },
		name: "Hyper Cutter",
		rating: 1.5,
		num: 52,
	},
	icebody: {
		onWeather(target, source, effect) {
			if (effect.id === 'hail' || effect.id === 'snowscape') {
				this.heal(target.baseMaxhp / 16);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'hail') return false;
		},
		flags: {},
		name: "Ice Body",
		rating: 1,
		num: 115,
	},
	iceface: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			if (this.field.isWeather(['hail', 'snowscape']) && pokemon.species.id === 'eiscuenoice') {
				this.add('-activate', pokemon, 'ability: Ice Face');
				this.effectState.busted = false;
				pokemon.formeChange('Eiscue', this.effect, true);
			}
		},
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (effect?.effectType === 'Move' && effect.category === 'Physical' && target.species.id === 'eiscue') {
				this.add('-activate', target, 'ability: Ice Face');
				this.effectState.busted = true;
				return 0;
			}
		},
		onCriticalHit(target, type, move) {
			if (!target) return;
			if (move.category !== 'Physical' || target.species.id !== 'eiscue') return;
			if (target.volatiles['substitute'] && !(move.flags['bypasssub'] || move.infiltrates)) return;
			if (!target.runImmunity(move)) return;
			return false;
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target) return;
			if (move.category !== 'Physical' || target.species.id !== 'eiscue') return;

			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;

			if (!target.runImmunity(move)) return;
			return 0;
		},
		onUpdate(pokemon) {
			if (pokemon.species.id === 'eiscue' && this.effectState.busted) {
				pokemon.formeChange('Eiscue-Noice', this.effect, true);
			}
		},
		onWeatherChange(pokemon, source, sourceEffect) {
			// snow/hail resuming because Cloud Nine/Air Lock ended does not trigger Ice Face
			if ((sourceEffect as Ability)?.suppressWeather) return;
			if (!pokemon.hp) return;
			if (this.field.isWeather(['hail', 'snowscape']) && pokemon.species.id === 'eiscuenoice') {
				this.add('-activate', pokemon, 'ability: Ice Face');
				this.effectState.busted = false;
				pokemon.formeChange('Eiscue', this.effect, true);
			}
		},
		flags: {
			failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1,
			breakable: 1, notransform: 1,
		},
		name: "Ice Face",
		rating: 3,
		num: 248,
	},
	icescales: {
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category === 'Special') {
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Ice Scales",
		rating: 4,
		num: 246,
	},
	illuminate: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.accuracy && boost.accuracy < 0) {
				delete boost.accuracy;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "accuracy", "[from] ability: Illuminate", `[of] ${target}`);
				}
			}
		},
		onModifyMove(move) {
			move.ignoreEvasion = true;
		},
		flags: { breakable: 1 },
		name: "Illuminate",
		rating: 0.5,
		num: 35,
	},
	illusion: {
		onBeforeSwitchIn(pokemon) {
			pokemon.illusion = null;
			// yes, you can Illusion an active pokemon but only if it's to your right
			for (let i = pokemon.side.pokemon.length - 1; i > pokemon.position; i--) {
				const possibleTarget = pokemon.side.pokemon[i];
				if (!possibleTarget.fainted) {
					// If Ogerpon is in the last slot while the Illusion Pokemon is Terastallized
					// Illusion will not disguise as anything
					if (!pokemon.terastallized || !['Ogerpon', 'Terapagos'].includes(possibleTarget.species.baseSpecies)) {
						pokemon.illusion = possibleTarget;
					}
					break;
				}
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (target.illusion) {
				this.singleEvent('End', this.dex.abilities.get('Illusion'), target.abilityState, target, source, move);
			}
		},
		onEnd(pokemon) {
			if (pokemon.illusion && !pokemon.beingCalledBack) {
				this.debug('illusion cleared');
				pokemon.illusion = null;
				const details = pokemon.getUpdatedDetails();
				this.add('replace', pokemon, details);
				this.add('-end', pokemon, 'Illusion');
				if (this.ruleTable.has('illusionlevelmod')) {
					this.hint("Illusion Level Mod is active, so this Pok\u00e9mon's true level was hidden.", true);
				}
			}
		},
		onFaint(pokemon) {
			pokemon.illusion = null;
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1 },
		name: "Illusion",
		rating: 4.5,
		num: 149,
	},
	immunity: {
		onUpdate(pokemon) {
			if (pokemon.status === 'psn' || pokemon.status === 'tox') {
				this.add('-activate', pokemon, 'ability: Immunity');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'psn' && status.id !== 'tox') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Immunity');
			}
			return false;
		},
		flags: { breakable: 1 },
		name: "Immunity",
		rating: 2,
		num: 17,
	},
	imposter: {
		onSwitchIn(pokemon) {
			// Imposter does not activate when Skill Swapped or when Neutralizing Gas leaves the field
			// Imposter copies across in doubles/triples
			// (also copies across in multibattle and diagonally in free-for-all,
			// but side.foe already takes care of those)
			const target = pokemon.side.foe.active[pokemon.side.foe.active.length - 1 - pokemon.position];
			if (target) {
				pokemon.transformInto(target, this.dex.abilities.get('imposter'));
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Imposter",
		rating: 5,
		num: 150,
	},
	infiltrator: {
		onModifyMove(move) {
			move.infiltrates = true;
		},
		flags: {},
		name: "Infiltrator",
		rating: 2.5,
		num: 151,
	},
	innardsout: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (!target.hp) {
				this.damage(target.getUndynamaxedHP(damage), source, target);
			}
		},
		flags: {},
		name: "Innards Out",
		rating: 4,
		num: 215,
	},
	innerfocus: {
		onTryAddVolatile(status, pokemon) {
			if (status.id === 'flinch') return null;
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Inner Focus', `[of] ${target}`);
			}
		},
		flags: { breakable: 1 },
		name: "Inner Focus",
		rating: 1,
		num: 39,
	},
	insomnia: {
		onUpdate(pokemon) {
			if (pokemon.status === 'slp') {
				this.add('-activate', pokemon, 'ability: Insomnia');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'slp') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Insomnia');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.add('-immune', target, '[from] ability: Insomnia');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Insomnia",
		rating: 1.5,
		num: 15,
	},
	intimidate: {
		onStart(pokemon) {
			let activated = false;
			for (const target of pokemon.adjacentFoes()) {
				if (!activated) {
					this.add('-ability', pokemon, 'Intimidate', 'boost');
					activated = true;
				}
				if (target.volatiles['substitute']) {
					this.add('-immune', target);
				} else {
					this.boost({ atk: -1 }, target, pokemon, null, true);
				}
			}
		},
		flags: {},
		name: "Intimidate",
		rating: 3.5,
		num: 22,
	},
	intrepidsword: {
		onStart(pokemon) {
			if (pokemon.swordBoost) return;
			pokemon.swordBoost = true;
			this.boost({ atk: 1 }, pokemon);
		},
		flags: {},
		name: "Intrepid Sword",
		rating: 4,
		num: 234,
	},
	ironbarbs: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.damage(source.baseMaxhp / 8, source, target);
			}
		},
		flags: {},
		name: "Iron Barbs",
		rating: 2.5,
		num: 160,
	},
	ironfist: {
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Steel') {
				this.debug('Iron Fist boost');
				return this.chainModify([5325, 4096]);
			}
		},
		flags: {},
		name: "Iron Fist",
		rating: 3,
		num: 89,
	},
	justified: {
		onDamagingHit(damage, target, source, move) {
			if (move.type === 'Dark') {
				this.boost({ atk: 1 });
			}
		},
		flags: {},
		name: "Justified",
		rating: 2.5,
		num: 154,
	},
	keeneye: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.accuracy && boost.accuracy < 0) {
				delete boost.accuracy;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "accuracy", "[from] ability: Keen Eye", `[of] ${target}`);
				}
			}
		},
		onModifyMove(move) {
			move.ignoreEvasion = true;
		},
		flags: { breakable: 1 },
		name: "Keen Eye",
		rating: 0.5,
		num: 51,
	},
	klutz: {
		// Klutz isn't technically active immediately in-game, but it activates early enough to beat all items
		// we should keep an eye out in future gens for items that activate on switch-in before Unnerve
		onSwitchInPriority: 1,
		// Item suppression implemented in Pokemon.ignoringItem() within sim/pokemon.js
		onStart(pokemon) {
			this.singleEvent('End', pokemon.getItem(), pokemon.itemState, pokemon);
		},
		flags: {},
		name: "Klutz",
		rating: -1,
		num: 103,
	},
	knowyourplace: {
		// Contact from this Pokemon inflicts a short "move last" effect (same fractional priority as Stall)
		onSourceDamagingHit(damage, target, source, move) {
			if (target.hasAbility('shielddust') || target.hasItem('covertcloak')) return;
			if (this.checkMoveMakesContact(move, target, source)) {
				target.addVolatile('knowyourplace', source, this.effect);
			}
		},
		flags: {},
		name: "Know Your Place",
		rating: 3,
		num: 461,
		gen: 9,
	},
	leafguard: {
		onSetStatus(status, target, source, effect) {
			if (['sunnyday', 'desolateland'].includes(target.effectiveWeather())) {
				if ((effect as Move)?.status) {
					this.add('-immune', target, '[from] ability: Leaf Guard');
				}
				return false;
			}
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn' && ['sunnyday', 'desolateland'].includes(target.effectiveWeather())) {
				this.add('-immune', target, '[from] ability: Leaf Guard');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Leaf Guard",
		rating: 0.5,
		num: 102,
	},
	levitate: {
		// airborneness implemented in sim/pokemon.js:Pokemon#isGrounded
		flags: { breakable: 1 },
		name: "Levitate",
		rating: 3.5,
		num: 26,
	},
	libero: {
		onPrepareHit(source, target, move) {
			if (this.effectState.libero) return;
			if (move.hasBounced || move.flags['futuremove'] || move.sourceEffect === 'snatch' || move.callsMove) return;
			const type = move.type;
			if (type && type !== '???' && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.effectState.libero = true;
				this.add('-start', source, 'typechange', type, '[from] ability: Libero');
			}
		},
		flags: {},
		name: "Libero",
		rating: 4,
		num: 236,
	},
	lightmetal: {
		onModifyWeight(weighthg) {
			return this.trunc(weighthg / 2);
		},
		flags: { breakable: 1 },
		name: "Light Metal",
		rating: 1,
		num: 135,
	},
	lightningrod: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Electric') {
				if (!this.boost({ spa: 1 })) {
					this.add('-immune', target, '[from] ability: Lightning Rod');
				}
				return null;
			}
		},
		onAnyRedirectTarget(target, source, source2, move) {
			if (move.type !== 'Electric' || move.flags['pledgecombo']) return;
			const redirectTarget = ['randomNormal', 'adjacentFoe'].includes(move.target) ? 'normal' : move.target;
			if (this.validTarget(this.effectState.target, source, redirectTarget)) {
				if (move.smartTarget) move.smartTarget = false;
				if (this.effectState.target !== target) {
					this.add('-activate', this.effectState.target, 'ability: Lightning Rod');
				}
				return this.effectState.target;
			}
		},
		flags: { breakable: 1 },
		name: "Lightning Rod",
		rating: 3,
		num: 31,
	},
	limber: {
		onUpdate(pokemon) {
			if (pokemon.status === 'par') {
				this.add('-activate', pokemon, 'ability: Limber');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'par') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Limber');
			}
			return false;
		},
		flags: { breakable: 1 },
		name: "Limber",
		rating: 2,
		num: 7,
	},
	lingeringaroma: {
		onDamagingHit(damage, target, source, move) {
			const sourceAbility = source.getAbility();
			if (sourceAbility.flags['cantsuppress'] || sourceAbility.id === 'lingeringaroma') {
				return;
			}
			if (this.checkMoveMakesContact(move, source, target, !source.isAlly(target))) {
				source.setAbility('lingeringaroma', target);
			}
		},
		flags: {},
		name: "Lingering Aroma",
		rating: 2,
		num: 268,
	},
	liquidooze: {
		onSourceTryHeal(damage, target, source, effect) {
			this.debug(`Heal is occurring: ${target} <- ${source} :: ${effect.id}`);
			const canOoze = ['drain', 'leechseed', 'strengthsap'];
			if (canOoze.includes(effect.id)) {
				this.damage(damage);
				return 0;
			}
		},
		flags: {},
		name: "Liquid Ooze",
		rating: 2.5,
		num: 64,
	},
	liquidvoice: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			if (move.flags['sound'] && !pokemon.volatiles['dynamax']) { // hardcode
				move.type = 'Water';
			}
		},
		flags: {},
		name: "Liquid Voice",
		rating: 1.5,
		num: 204,
	},
	longreach: {
		onModifyMove(move) {
			delete move.flags['contact'];
		},
		flags: {},
		name: "Long Reach",
		rating: 1,
		num: 203,
	},
	magicbounce: {
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (target === source || move.hasBounced || !move.flags['reflectable'] || target.isSemiInvulnerable()) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, target, { target: source });
			return null;
		},
		onAllyTryHitSide(target, source, move) {
			if (target.isAlly(source) || move.hasBounced || !move.flags['reflectable'] || target.isSemiInvulnerable()) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, this.effectState.target, { target: source });
			move.hasBounced = true; // only bounce once in free-for-all battles
			return null;
		},
		flags: { breakable: 1 },
		name: "Magic Bounce",
		rating: 4,
		num: 156,
	},
	magicguard: {
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
		flags: {},
		name: "Magic Guard",
		rating: 4,
		num: 98,
	},
	magician: {
		onAfterMoveSecondarySelf(source, target, move) {
			if (!move || source.switchFlag === true || !move.hitTargets || source.item || source.volatiles['gem'] ||
				move.id === 'fling' || move.category === 'Status') return;
			const hitTargets = move.hitTargets;
			this.speedSort(hitTargets);
			for (const pokemon of hitTargets) {
				if (pokemon !== source) {
					const yourItem = pokemon.takeItem(source);
					if (!yourItem) continue;
					if (!source.setItem(yourItem)) {
						pokemon.item = yourItem.id; // bypass setItem so we don't break choicelock or anything
						continue;
					}
					this.add('-item', source, yourItem, '[from] ability: Magician', `[of] ${pokemon}`);
					return;
				}
			}
		},
		flags: {},
		name: "Magician",
		rating: 1,
		num: 170,
	},
	magmaarmor: {
		onUpdate(pokemon) {
			if (pokemon.status === 'frz') {
				this.add('-activate', pokemon, 'ability: Magma Armor');
				pokemon.cureStatus();
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'frz') return false;
		},
		flags: { breakable: 1 },
		name: "Magma Armor",
		rating: 0.5,
		num: 40,
	},
	magnetpull: {
		onFoeTrapPokemon(pokemon) {
			if (pokemon.hasType('Steel') && pokemon.isAdjacent(this.effectState.target)) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			if (!source) source = this.effectState.target;
			if (!source || !pokemon.isAdjacent(source)) return;
			if (!pokemon.knownType || pokemon.hasType('Steel')) {
				pokemon.maybeTrapped = true;
			}
		},
		flags: {},
		name: "Magnet Pull",
		rating: 4,
		num: 42,
	},
	marvelscale: {
		onModifyDefPriority: 6,
		onModifyDef(def, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		flags: { breakable: 1 },
		name: "Marvel Scale",
		rating: 2.5,
		num: 63,
	},
	megalauncher: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['pulse']) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Mega Launcher",
		rating: 3,
		num: 178,
	},
	merciless: {
		onModifyCritRatio(critRatio, source, target) {
			if (target && ['psn', 'tox'].includes(target.status)) return 5;
		},
		flags: {},
		name: "Merciless",
		rating: 1.5,
		num: 196,
	},
	mimicry: {
		onSwitchInPriority: -1,
		onStart(pokemon) {
			this.singleEvent('TerrainChange', this.effect, this.effectState, pokemon);
		},
		onTerrainChange(pokemon) {
			let types;
			switch (this.field.terrain) {
			case 'electricterrain':
				types = ['Electric'];
				break;
			case 'grassyterrain':
				types = ['Grass'];
				break;
			case 'mistyterrain':
				types = ['Fairy'];
				break;
			case 'psychicterrain':
				types = ['Psychic'];
				break;
			case 'toxicterrain':
				types = ['Poison'];
				break;
			default:
				types = pokemon.baseSpecies.types;
			}
			const oldTypes = pokemon.getTypes();
			if (oldTypes.join() === types.join() || !pokemon.setType(types)) return;
			if (this.field.terrain || pokemon.transformed) {
				this.add('-start', pokemon, 'typechange', types.join('/'), '[from] ability: Mimicry');
				if (!this.field.terrain) this.hint("Transform Mimicry changes you to your original un-transformed types.");
			} else {
				this.add('-activate', pokemon, 'ability: Mimicry');
				this.add('-end', pokemon, 'typechange', '[silent]');
			}
		},
		flags: {},
		name: "Mimicry",
		rating: 0,
		num: 250,
	},
	mindseye: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.accuracy && boost.accuracy < 0) {
				delete boost.accuracy;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "accuracy", "[from] ability: Mind's Eye", `[of] ${target}`);
				}
			}
		},
		onModifyMovePriority: -5,
		onModifyMove(move) {
			move.ignoreEvasion = true;
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Fighting'] = true;
				move.ignoreImmunity['Normal'] = true;
			}
		},
		flags: { breakable: 1 },
		name: "Mind's Eye",
		rating: 0,
		num: 300,
	},
	minus: {
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			for (const allyActive of pokemon.allies()) {
				if (allyActive.hasAbility(['minus', 'plus'])) {
					return this.chainModify(1.5);
				}
			}
		},
		flags: {},
		name: "Minus",
		rating: 0,
		num: 58,
	},
	mirrorarmor: {
		onTryBoost(boost, target, source, effect) {
			// Don't bounce self stat changes, or boosts that have already bounced
			if (!source || target === source || !boost || effect.name === 'Mirror Armor') return;
			let b: BoostID;
			for (b in boost) {
				if (boost[b]! < 0) {
					if (target.boosts[b] === -6) continue;
					const negativeBoost: SparseBoostsTable = {};
					negativeBoost[b] = boost[b];
					delete boost[b];
					if (source.hp) {
						this.add('-ability', target, 'Mirror Armor');
						this.boost(negativeBoost, source, target, null, true);
					}
				}
			}
		},
		flags: { breakable: 1 },
		name: "Mirror Armor",
		rating: 2,
		num: 240,
	},
	mistysurge: {
		onStart(source) {
			this.field.setTerrain('mistyterrain');
		},
		flags: {},
		name: "Misty Surge",
		rating: 3.5,
		num: 228,
	},
	moldbreaker: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Mold Breaker');
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		flags: {},
		name: "Mold Breaker",
		rating: 3,
		num: 104,
	},
	moody: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			let stats: BoostID[] = [];
			const boost: SparseBoostsTable = {};
			let statPlus: BoostID;
			for (statPlus in pokemon.boosts) {
				if (statPlus === 'accuracy' || statPlus === 'evasion') continue;
				if (pokemon.boosts[statPlus] < 6) {
					stats.push(statPlus);
				}
			}
			let randomStat: BoostID | undefined = stats.length ? this.sample(stats) : undefined;
			if (randomStat) boost[randomStat] = 2;

			stats = [];
			let statMinus: BoostID;
			for (statMinus in pokemon.boosts) {
				if (statMinus === 'accuracy' || statMinus === 'evasion') continue;
				if (pokemon.boosts[statMinus] > -6 && statMinus !== randomStat) {
					stats.push(statMinus);
				}
			}
			randomStat = stats.length ? this.sample(stats) : undefined;
			if (randomStat) boost[randomStat] = -1;

			this.boost(boost, pokemon, pokemon);
		},
		flags: {},
		name: "Moody",
		rating: 5,
		num: 141,
	},
	motordrive: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Electric') {
				if (!this.boost({ spe: 1 })) {
					this.add('-immune', target, '[from] ability: Motor Drive');
				}
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Motor Drive",
		rating: 3,
		num: 78,
	},
	moxie: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ atk: length }, source);
			}
		},
		flags: {},
		name: "Moxie",
		rating: 3,
		num: 153,
	},
	multiscale: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp >= target.maxhp) {
				this.debug('Multiscale weaken');
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Multiscale",
		rating: 3.5,
		num: 136,
	},
	multitype: {
		// Multitype's type-changing itself is implemented in statuses.js
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Multitype",
		rating: 4,
		num: 121,
	},
	mummy: {
		onDamagingHit(damage, target, source, move) {
			const sourceAbility = source.getAbility();
			if (sourceAbility.flags['cantsuppress'] || sourceAbility.id === 'mummy') {
				return;
			}
			if (this.checkMoveMakesContact(move, source, target, !source.isAlly(target))) {
				source.setAbility('mummy', target);
			}
		},
		flags: {},
		name: "Mummy",
		rating: 2,
		num: 152,
	},
	myceliummight: {
		onFractionalPriorityPriority: -1,
		onFractionalPriority(priority, pokemon, target, move) {
			if (move.category === 'Status') {
				return -0.1;
			}
		},
		onModifyMove(move) {
			if (move.category === 'Status') {
				move.ignoreAbility = true;
			}
		},
		flags: {},
		name: "Mycelium Might",
		rating: 2,
		num: 298,
	},
	naturalcure: {
		onCheckShow(pokemon) {
			// This is complicated
			// For the most part, in-game, it's obvious whether or not Natural Cure activated,
			// since you can see how many of your opponent's pokemon are statused.
			// The only ambiguous situation happens in Doubles/Triples, where multiple pokemon
			// that could have Natural Cure switch out, but only some of them get cured.
			if (pokemon.side.active.length === 1) return;
			if (pokemon.showCure === true || pokemon.showCure === false) return;

			const cureList = [];
			let noCureCount = 0;
			for (const curPoke of pokemon.side.active) {
				// pokemon not statused
				if (!curPoke?.status) {
					// this.add('-message', "" + curPoke + " skipped: not statused or doesn't exist");
					continue;
				}
				if (curPoke.showCure) {
					// this.add('-message', "" + curPoke + " skipped: Natural Cure already known");
					continue;
				}
				const species = curPoke.species;
				// pokemon can't get Natural Cure
				if (!Object.values(species.abilities).includes('Natural Cure')) {
					// this.add('-message', "" + curPoke + " skipped: no Natural Cure");
					continue;
				}
				// pokemon's ability is known to be Natural Cure
				if (!species.abilities['1'] && !species.abilities['H']) {
					// this.add('-message', "" + curPoke + " skipped: only one ability");
					continue;
				}
				// pokemon isn't switching this turn
				if (curPoke !== pokemon && !this.queue.willSwitch(curPoke)) {
					// this.add('-message', "" + curPoke + " skipped: not switching");
					continue;
				}

				if (curPoke.hasAbility('naturalcure')) {
					// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (and is)");
					cureList.push(curPoke);
				} else {
					// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (but isn't)");
					noCureCount++;
				}
			}

			if (!cureList.length || !noCureCount) {
				// It's possible to know what pokemon were cured
				for (const pkmn of cureList) {
					pkmn.showCure = true;
				}
			} else {
				// It's not possible to know what pokemon were cured

				// Unlike a -hint, this is real information that battlers need, so we use a -message
				this.add('-message', `(${cureList.length} of ${pokemon.side.name}'s pokemon ${cureList.length === 1 ? "was" : "were"} cured by Natural Cure.)`);

				for (const pkmn of cureList) {
					pkmn.showCure = false;
				}
			}
		},
		onSwitchOut(pokemon) {
			if (!pokemon.status) return;

			// if pokemon.showCure is undefined, it was skipped because its ability
			// is known
			if (pokemon.showCure === undefined) pokemon.showCure = true;

			if (pokemon.showCure) this.add('-curestatus', pokemon, pokemon.status, '[from] ability: Natural Cure');
			pokemon.clearStatus();

			// only reset .showCure if it's false
			// (once you know a Pokemon has Natural Cure, its cures are always known)
			if (!pokemon.showCure) pokemon.showCure = undefined;
		},
		flags: {},
		name: "Natural Cure",
		rating: 2.5,
		num: 30,
	},
	neuroforce: {
		onModifyDamage(damage, source, target, move) {
			if (move && target.getMoveHitData(move).typeMod > 0) {
				return this.chainModify([5120, 4096]);
			}
		},
		flags: {},
		name: "Neuroforce",
		rating: 2.5,
		num: 233,
	},
	neutralizinggas: {
		// Ability suppression implemented in sim/pokemon.ts:Pokemon#ignoringAbility
		onSwitchInPriority: 2,
		onSwitchIn(pokemon) {
			this.add('-ability', pokemon, 'Neutralizing Gas');
			pokemon.abilityState.ending = false;
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			for (const target of this.getAllActive()) {
				if (target.hasItem('Ability Shield')) {
					this.add('-block', target, 'item: Ability Shield');
					continue;
				}
				// Can't suppress a Tatsugiri inside of Dondozo already
				if (target.volatiles['commanding']) {
					continue;
				}
				if (target.illusion) {
					this.singleEvent('End', this.dex.abilities.get('Illusion'), target.abilityState, target, pokemon, 'neutralizinggas');
				}
				if (target.volatiles['slowstart']) {
					delete target.volatiles['slowstart'];
					this.add('-end', target, 'Slow Start', '[silent]');
				}
				if (strongWeathers.includes(target.getAbility().id)) {
					this.singleEvent('End', this.dex.abilities.get(target.getAbility().id), target.abilityState, target, pokemon, 'neutralizinggas');
				}
			}
		},
		onEnd(source) {
			if (source.transformed) return;
			for (const pokemon of this.getAllActive()) {
				if (pokemon !== source && pokemon.hasAbility('Neutralizing Gas')) {
					return;
				}
			}
			this.add('-end', source, 'ability: Neutralizing Gas');

			// FIXME this happens before the pokemon switches out, should be the opposite order.
			// Not an easy fix since we cant use a supported event. Would need some kind of special event that
			// gathers events to run after the switch and then runs them when the ability is no longer accessible.
			// (If you're tackling this, do note extreme weathers have the same issue)

			// Mark this pokemon's ability as ending so Pokemon#ignoringAbility skips it
			if (source.abilityState.ending) return;
			source.abilityState.ending = true;
			const sortedActive = this.getAllActive();
			this.speedSort(sortedActive);
			for (const pokemon of sortedActive) {
				if (pokemon !== source) {
					if (pokemon.getAbility().flags['cantsuppress']) continue; // does not interact with e.g Ice Face, Zen Mode
					if (pokemon.hasItem('abilityshield')) continue; // don't restart abilities that weren't suppressed

					// Will be suppressed by Pokemon#ignoringAbility if needed
					this.singleEvent('Start', pokemon.getAbility(), pokemon.abilityState, pokemon);
					if (pokemon.ability === "gluttony") {
						pokemon.abilityState.gluttony = false;
					}
				}
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Neutralizing Gas",
		rating: 3.5,
		num: 256,
	},
	// Habilidade OCB: junta Aura Break + Mega Launcher (Zygarde-Mega e similares).
	nihilblaster: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Nihil Blaster');
		},
		onAnyTryPrimaryHit(target, source, move) {
			if (target === source || move.category === 'Status') return;
			move.hasAuraBreak = true;
		},
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['pulse']) {
				return this.chainModify(1.5);
			}
		},
		flags: { breakable: 1 },
		name: "Nihil Blaster",
		shortDesc: "Inverte os efeitos de habilidades de Aura. Potencializa movimentos de pulso.",
		rating: 4,
		num: 1000,
	},
	noguard: {
		onAnyInvulnerabilityPriority: 1,
		onAnyInvulnerability(target, source, move) {
			if (move && (source === this.effectState.target || target === this.effectState.target)) return 0;
		},
		onAnyAccuracy(accuracy, target, source, move) {
			if (move && (source === this.effectState.target || target === this.effectState.target)) {
				return true;
			}
			return accuracy;
		},
		flags: {},
		name: "No Guard",
		rating: 4,
		num: 99,
	},
	normalize: {
		onModifyTypePriority: 1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'hiddenpower', 'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'struggle', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (!(move.isZ && move.category !== 'Status') &&
				// TODO: Figure out actual interaction
				(!noModifyType.includes(move.id) || this.activeMove?.isMax) && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Normal';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		flags: {},
		name: "Normalize",
		rating: 0,
		num: 96,
	},
	oblivious: {
		onUpdate(pokemon) {
			if (pokemon.volatiles['attract']) {
				this.add('-activate', pokemon, 'ability: Oblivious');
				pokemon.removeVolatile('attract');
				this.add('-end', pokemon, 'move: Attract', '[from] ability: Oblivious');
			}
			if (pokemon.volatiles['taunt']) {
				this.add('-activate', pokemon, 'ability: Oblivious');
				pokemon.removeVolatile('taunt');
				// Taunt's volatile already sends the -end message when removed
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'attract') return false;
		},
		onTryHit(pokemon, target, move) {
			if (move.id === 'attract' || move.id === 'captivate' || move.id === 'taunt') {
				this.add('-immune', pokemon, '[from] ability: Oblivious');
				return null;
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Oblivious', `[of] ${target}`);
			}
		},
		flags: { breakable: 1 },
		name: "Oblivious",
		rating: 1.5,
		num: 12,
	},
	opportunist: {
		onFoeAfterBoost(boost, target, source, effect) {
			if (effect?.name === 'Opportunist' || effect?.name === 'Mirror Herb') return;
			if (!this.effectState.boosts) this.effectState.boosts = {} as SparseBoostsTable;
			const boostPlus = this.effectState.boosts;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! > 0) {
					boostPlus[i] = (boostPlus[i] || 0) + boost[i]!;
				}
			}
		},
		onAnySwitchInPriority: -3,
		onAnySwitchIn() {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onAnyAfterMega() {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onAnyAfterTerastallization() {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onAnyAfterMove() {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onEnd() {
			delete this.effectState.boosts;
		},
		flags: {},
		name: "Opportunist",
		rating: 3,
		num: 290,
	},
	// Custom: +1 prioridade vs oponentes com HP abaixo da metade (usa originalTarget da fila de ações).
	opportunistpriority: {
		onModifyPriority(priority, pokemon, target, move) {
			const action = this.queue.willMove(pokemon);
			const foe = action?.originalTarget;
			if (!foe || foe.fainted) return;
			if (foe.side === pokemon.side) return;
			if (foe.hp < foe.maxhp / 2) return priority + 1;
		},
		flags: {},
		name: "Opportunist",
		rating: 3.5,
		num: 383,
		gen: 9,
	},
	orichalcumpulse: {
		onStart(pokemon) {
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
		flags: {},
		name: "Orichalcum Pulse",
		rating: 4.5,
		num: 288,
	},
	overcoat: {
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail' || type === 'powder') return false;
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (move.flags['powder'] && target !== source && this.dex.getImmunity('powder', target)) {
				this.add('-immune', target, '[from] ability: Overcoat');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Overcoat",
		rating: 2,
		num: 142,
	},
	overgrow: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Grass' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Overgrow boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Grass' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Overgrow boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Overgrow",
		rating: 2,
		num: 65,
	},
	owntempo: {
		onUpdate(pokemon) {
			if (pokemon.volatiles['confusion']) {
				this.add('-activate', pokemon, 'ability: Own Tempo');
				pokemon.removeVolatile('confusion');
			}
		},
		onTryAddVolatile(status, pokemon) {
			if (status.id === 'confusion') return null;
		},
		onHit(target, source, move) {
			if (move?.volatileStatus === 'confusion') {
				this.add('-immune', target, 'confusion', '[from] ability: Own Tempo');
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Own Tempo', `[of] ${target}`);
			}
		},
		flags: { breakable: 1 },
		name: "Own Tempo",
		rating: 1.5,
		num: 20,
	},
	parentalbond: {
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
		flags: {},
		name: "Parental Bond",
		rating: 4.5,
		num: 185,
	},
	pastelveil: {
		onStart(pokemon) {
			for (const ally of pokemon.alliesAndSelf()) {
				if (['psn', 'tox'].includes(ally.status)) {
					this.add('-activate', pokemon, 'ability: Pastel Veil');
					ally.cureStatus();
				}
			}
		},
		onUpdate(pokemon) {
			if (['psn', 'tox'].includes(pokemon.status)) {
				this.add('-activate', pokemon, 'ability: Pastel Veil');
				pokemon.cureStatus();
			}
		},
		onAnySwitchIn() {
			((this.effect as any).onStart as (p: Pokemon) => void).call(this, this.effectState.target);
		},
		onSetStatus(status, target, source, effect) {
			if (!['psn', 'tox'].includes(status.id)) return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Pastel Veil');
			}
			return false;
		},
		onAllySetStatus(status, target, source, effect) {
			if (!['psn', 'tox'].includes(status.id)) return;
			if ((effect as Move)?.status) {
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Pastel Veil', `[of] ${effectHolder}`);
			}
			return false;
		},
		flags: { breakable: 1 },
		name: "Pastel Veil",
		rating: 2,
		num: 257,
	},
	// Mimikyu-Rayquaza: disfarce como Disguise; ao revelar, aplica Curse no oponente que quebrou o disfarce.
	patchwork: {
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
		flags: {
			failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1,
			breakable: 1, notransform: 1,
		},
		name: "Patchwork",
		rating: 4,
		num: 385,
		gen: 9,
	},
	perishbody: {
		onDamagingHit(damage, target, source, move) {
			if (!this.checkMoveMakesContact(move, source, target) || source.volatiles['perishsong']) return;
			this.add('-ability', target, 'Perish Body');
			source.addVolatile('perishsong');
			target.addVolatile('perishsong');
		},
		flags: {},
		name: "Perish Body",
		rating: 1,
		num: 253,
	},
	pickpocket: {
		onAfterMoveSecondary(target, source, move) {
			if (source && source !== target && move?.flags['contact']) {
				if (target.item || target.switchFlag || target.forceSwitchFlag || source.switchFlag === true) {
					return;
				}
				const yourItem = source.takeItem(target);
				if (!yourItem) {
					return;
				}
				if (!target.setItem(yourItem)) {
					source.item = yourItem.id;
					return;
				}
				this.add('-enditem', source, yourItem, '[silent]', '[from] ability: Pickpocket', `[of] ${source}`);
				this.add('-item', target, yourItem, '[from] ability: Pickpocket', `[of] ${source}`);
			}
		},
		flags: {},
		name: "Pickpocket",
		rating: 1,
		num: 124,
	},
	pickup: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (pokemon.item) return;
			const pickupTargets = this.getAllActive().filter(target => (
				target.lastItem && target.usedItemThisTurn && pokemon.isAdjacent(target)
			));
			if (!pickupTargets.length) return;
			const randomTarget = this.sample(pickupTargets);
			const item = randomTarget.lastItem;
			randomTarget.lastItem = '';
			this.add('-item', pokemon, this.dex.items.get(item), '[from] ability: Pickup');
			pokemon.setItem(item);
		},
		flags: {},
		name: "Pickup",
		rating: 0.5,
		num: 53,
	},
	pixilate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Fairy';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		flags: {},
		name: "Pixilate",
		rating: 4,
		num: 182,
	},
	plus: {
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			for (const allyActive of pokemon.allies()) {
				if (allyActive.hasAbility(['minus', 'plus'])) {
					return this.chainModify(1.5);
				}
			}
		},
		flags: {},
		name: "Plus",
		rating: 0,
		num: 57,
	},
	poisonheal: {
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (effect.id === 'psn' || effect.id === 'tox') {
				this.heal(target.baseMaxhp / 8);
				return false;
			}
		},
		flags: {},
		name: "Poison Heal",
		rating: 4,
		num: 90,
	},
	poisonpoint: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.trySetStatus('psn', target);
				}
			}
		},
		flags: {},
		name: "Poison Point",
		rating: 1.5,
		num: 38,
	},
	poisonpuppeteer: {
		onAnyAfterSetStatus(status, target, source, effect) {
			if (source.baseSpecies.name !== "Pecharunt") return;
			if (source !== this.effectState.target || target === source || effect.effectType !== 'Move') return;
			if (status.id === 'psn' || status.id === 'tox') {
				target.addVolatile('confusion');
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1 },
		name: "Poison Puppeteer",
		rating: 3,
		num: 310,
	},
	poisontouch: {
		onSourceDamagingHit(damage, target, source, move) {
			// Despite not being a secondary, Shield Dust / Covert Cloak block Poison Touch's effect
			if (target.hasAbility('shielddust') || target.hasItem('covertcloak')) return;
			if (this.checkMoveMakesContact(move, target, source)) {
				if (this.randomChance(3, 10)) {
					target.trySetStatus('psn', source);
				}
			}
		},
		flags: {},
		name: "Poison Touch",
		rating: 2,
		num: 143,
	},
	powerconstruct: {
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Zygarde' || pokemon.transformed || !pokemon.hp) return;
			if (pokemon.species.id === 'zygardecomplete' || pokemon.hp > pokemon.maxhp / 2) return;
			this.add('-activate', pokemon, 'ability: Power Construct');
			pokemon.formeChange('Zygarde-Complete', this.effect, true);
			pokemon.canMegaEvo = pokemon.canMegaEvo === false ? false : this.actions.canMegaEvo(pokemon);
			pokemon.formeRegression = true;
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Power Construct",
		rating: 5,
		num: 211,
	},
	powerofalchemy: {
		onAllyFaint(target) {
			if (!this.effectState.target.hp) return;
			const ability = target.getAbility();
			if (ability.flags['noreceiver'] || ability.id === 'noability') return;
			this.effectState.target.setAbility(ability, target);
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Power of Alchemy",
		rating: 0,
		num: 223,
	},
	powerspot: {
		onAllyBasePowerPriority: 22,
		onAllyBasePower(basePower, attacker, defender, move) {
			if (attacker !== this.effectState.target) {
				this.debug('Power Spot boost');
				return this.chainModify([5325, 4096]);
			}
		},
		flags: {},
		name: "Power Spot",
		rating: 0,
		num: 249,
	},
	prankster: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') {
				move.pranksterBoosted = true;
				return priority + 1;
			}
		},
		flags: {},
		name: "Prankster",
		rating: 4,
		num: 158,
	},
	pressure: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Pressure');
		},
		onDeductPP(target, source) {
			if (target.isAlly(source)) return;
			return 1;
		},
		flags: {},
		name: "Pressure",
		rating: 2.5,
		num: 46,
	},
	primordialsea: {
		onStart(source) {
			this.field.setWeather('primordialsea');
		},
		onAnySetWeather(target, source, weather) {
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			if (this.field.getWeather().id === 'primordialsea' && !strongWeathers.includes(weather.id)) return false;
		},
		onEnd(pokemon) {
			if (this.field.weatherState.source !== pokemon) return;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (target.hasAbility('primordialsea')) {
					this.field.weatherState.source = target;
					return;
				}
			}
			this.field.clearWeather();
		},
		flags: {},
		name: "Primordial Sea",
		rating: 4.5,
		num: 189,
	},
	prismarmor: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug('Prism Armor neutralize');
				return this.chainModify(0.75);
			}
		},
		flags: {},
		name: "Prism Armor",
		rating: 3,
		num: 232,
	},
	propellertail: {
		onModifyMovePriority: 1,
		onModifyMove(move) {
			// most of the implementation is in Battle#getTarget
			move.tracksTarget = move.target !== 'scripted';
		},
		flags: {},
		name: "Propeller Tail",
		rating: 0,
		num: 239,
	},
	protean: {
		onPrepareHit(source, target, move) {
			if (this.effectState.protean) return;
			if (move.hasBounced || move.flags['futuremove'] || move.sourceEffect === 'snatch' || move.callsMove) return;
			const type = move.type;
			if (type && type !== '???' && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.effectState.protean = true;
				this.add('-start', source, 'typechange', type, '[from] ability: Protean');
			}
		},
		flags: {},
		name: "Protean",
		rating: 4,
		num: 168,
	},
	protosynthesis: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			// Protosynthesis is not affected by Utility Umbrella
			if (this.field.isWeather('sunnyday')) {
				pokemon.addVolatile('protosynthesis');
			} else if (!pokemon.volatiles['protosynthesis']?.fromBooster && !this.field.isWeather('sunnyday')) {
				pokemon.removeVolatile('protosynthesis');
			}
		},
		onEnd(pokemon) {
			delete pokemon.volatiles['protosynthesis'];
			this.add('-end', pokemon, 'Protosynthesis', '[silent]');
		},
		condition: {
			noCopy: true,
			onStart(pokemon, source, effect) {
				if (effect?.name === 'Booster Energy') {
					this.effectState.fromBooster = true;
					this.add('-activate', pokemon, 'ability: Protosynthesis', '[fromitem]');
				} else {
					this.add('-activate', pokemon, 'ability: Protosynthesis');
				}
				this.effectState.bestStat = pokemon.getBestStat(false, true);
				this.add('-start', pokemon, 'protosynthesis' + this.effectState.bestStat);
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, pokemon) {
				if (this.effectState.bestStat !== 'atk' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis atk boost');
				return this.chainModify([5325, 4096]);
			},
			onModifyDefPriority: 6,
			onModifyDef(def, pokemon) {
				if (this.effectState.bestStat !== 'def' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis def boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpAPriority: 5,
			onModifySpA(spa, pokemon) {
				if (this.effectState.bestStat !== 'spa' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis spa boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpDPriority: 6,
			onModifySpD(spd, pokemon) {
				if (this.effectState.bestStat !== 'spd' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis spd boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpe(spe, pokemon) {
				if (this.effectState.bestStat !== 'spe' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis spe boost');
				return this.chainModify(1.5);
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Protosynthesis');
			},
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Protosynthesis",
		rating: 3,
		num: 281,
	},
	psychicsurge: {
		onStart(source) {
			this.field.setTerrain('psychicterrain');
		},
		flags: {},
		name: "Psychic Surge",
		rating: 4,
		num: 227,
	},
	punkrock: {
		onBasePowerPriority: 7,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['sound']) {
				this.debug('Punk Rock boost');
				return this.chainModify([5325, 4096]);
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.flags['sound']) {
				this.debug('Punk Rock weaken');
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Punk Rock",
		rating: 3.5,
		num: 244,
	},
	purepower: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk) {
			return this.chainModify(2);
		},
		flags: {},
		name: "Pure Power",
		rating: 5,
		num: 74,
	},
	purifyingsalt: {
		onSetStatus(status, target, source, effect) {
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Purifying Salt');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.add('-immune', target, '[from] ability: Purifying Salt');
				return null;
			}
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Ghost') {
				this.debug('Purifying Salt weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) {
			if (move.type === 'Ghost') {
				this.debug('Purifying Salt weaken');
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Purifying Salt",
		rating: 4,
		num: 272,
	},
	quarkdrive: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			this.singleEvent('TerrainChange', this.effect, this.effectState, pokemon);
		},
		onTerrainChange(pokemon) {
			if (this.field.isTerrain('electricterrain')) {
				pokemon.addVolatile('quarkdrive');
			} else if (!pokemon.volatiles['quarkdrive']?.fromBooster) {
				pokemon.removeVolatile('quarkdrive');
			}
		},
		onEnd(pokemon) {
			delete pokemon.volatiles['quarkdrive'];
			this.add('-end', pokemon, 'Quark Drive', '[silent]');
		},
		condition: {
			noCopy: true,
			onStart(pokemon, source, effect) {
				if (effect?.name === 'Booster Energy') {
					this.effectState.fromBooster = true;
					this.add('-activate', pokemon, 'ability: Quark Drive', '[fromitem]');
				} else {
					this.add('-activate', pokemon, 'ability: Quark Drive');
				}
				this.effectState.bestStat = pokemon.getBestStat(false, true);
				this.add('-start', pokemon, 'quarkdrive' + this.effectState.bestStat);
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, pokemon) {
				if (this.effectState.bestStat !== 'atk' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive atk boost');
				return this.chainModify([5325, 4096]);
			},
			onModifyDefPriority: 6,
			onModifyDef(def, pokemon) {
				if (this.effectState.bestStat !== 'def' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive def boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpAPriority: 5,
			onModifySpA(spa, pokemon) {
				if (this.effectState.bestStat !== 'spa' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive spa boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpDPriority: 6,
			onModifySpD(spd, pokemon) {
				if (this.effectState.bestStat !== 'spd' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive spd boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpe(spe, pokemon) {
				if (this.effectState.bestStat !== 'spe' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive spe boost');
				return this.chainModify(1.5);
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Quark Drive');
			},
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Quark Drive",
		rating: 3,
		num: 282,
	},
	queenlymajesty: {
		onFoeTryMove(target, source, move) {
			const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
				return;
			}

			const dazzlingHolder = this.effectState.target;
			if ((source.isAlly(dazzlingHolder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', dazzlingHolder, 'ability: Queenly Majesty', move, `[of] ${target}`);
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Queenly Majesty",
		rating: 2.5,
		num: 214,
	},
	quickdraw: {
		onFractionalPriorityPriority: -1,
		onFractionalPriority(priority, pokemon, target, move) {
			if (move.category !== "Status" && this.randomChance(3, 10)) {
				this.add('-activate', pokemon, 'ability: Quick Draw');
				return 0.1;
			}
		},
		flags: {},
		name: "Quick Draw",
		rating: 2.5,
		num: 259,
	},
	quickfeet: {
		onModifySpe(spe, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Quick Feet",
		rating: 2.5,
		num: 95,
	},
	raindish: {
		onWeather(target, source, effect) {
			if (target.hasItem('utilityumbrella')) return;
			if (effect.id === 'raindance' || effect.id === 'primordialsea') {
				this.heal(target.baseMaxhp / 16);
			}
		},
		flags: {},
		name: "Rain Dish",
		rating: 1.5,
		num: 44,
	},
	rattled: {
		onDamagingHit(damage, target, source, move) {
			if (['Dark', 'Bug', 'Ghost'].includes(move.type)) {
				this.boost({ spe: 1 });
			}
		},
		onAfterBoost(boost, target, source, effect) {
			if (effect?.name === 'Intimidate' && boost.atk) {
				this.boost({ spe: 1 });
			}
		},
		flags: {},
		name: "Rattled",
		rating: 1,
		num: 155,
	},
	receiver: {
		onAllyFaint(target) {
			if (!this.effectState.target.hp) return;
			const ability = target.getAbility();
			if (ability.flags['noreceiver'] || ability.id === 'noability') return;
			this.effectState.target.setAbility(ability, target);
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Receiver",
		rating: 0,
		num: 222,
	},
	reckless: {
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.recoil || move.hasCrashDamage) {
				this.debug('Reckless boost');
				return this.chainModify([4915, 4096]);
			}
		},
		flags: {},
		name: "Reckless",
		rating: 3,
		num: 120,
	},
	refrigerate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Ice';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		flags: {},
		name: "Refrigerate",
		rating: 4,
		num: 174,
	},
	regenerator: {
		onSwitchOut(pokemon) {
			pokemon.heal(pokemon.baseMaxhp / 3);
		},
		flags: {},
		name: "Regenerator",
		rating: 4.5,
		num: 144,
	},
	ripen: {
		onTryHeal(damage, target, source, effect) {
			if (!effect) return;
			if (effect.name === 'Berry Juice' || effect.name === 'Leftovers') {
				this.add('-activate', target, 'ability: Ripen');
			}
			if ((effect as Item).isBerry) return this.chainModify(2);
		},
		onChangeBoost(boost, target, source, effect) {
			if (effect && (effect as Item).isBerry) {
				let b: BoostID;
				for (b in boost) {
					boost[b]! *= 2;
				}
			}
		},
		onSourceModifyDamagePriority: -1,
		onSourceModifyDamage(damage, source, target, move) {
			if (target.abilityState.berryWeaken) {
				target.abilityState.berryWeaken = false;
				return this.chainModify(0.5);
			}
		},
		onTryEatItemPriority: -1,
		onTryEatItem(item, pokemon) {
			this.add('-activate', pokemon, 'ability: Ripen');
		},
		onEatItem(item, pokemon) {
			const weakenBerries = [
				'Babiri Berry', 'Charti Berry', 'Chilan Berry', 'Chople Berry', 'Coba Berry', 'Colbur Berry', 'Haban Berry', 'Kasib Berry', 'Kebia Berry', 'Occa Berry', 'Passho Berry', 'Payapa Berry', 'Rindo Berry', 'Roseli Berry', 'Shuca Berry', 'Tanga Berry', 'Wacan Berry', 'Yache Berry',
			];
			// Record if the pokemon ate a berry to resist the attack
			pokemon.abilityState.berryWeaken = weakenBerries.includes(item.name);
		},
		flags: {},
		name: "Ripen",
		rating: 2,
		num: 247,
	},
	rivalry: {
		onBasePowerPriority: 24,
		onBasePower(basePower, attacker, defender, move) {
			if (attacker.gender && defender.gender) {
				if (attacker.gender === defender.gender) {
					this.debug('Rivalry boost');
					return this.chainModify(1.25);
				} else {
					this.debug('Rivalry weaken');
					return this.chainModify(0.75);
				}
			}
		},
		flags: {},
		name: "Rivalry",
		rating: 0,
		num: 79,
	},
	rkssystem: {
		// RKS System's type-changing itself is implemented in statuses.js
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "RKS System",
		rating: 4,
		num: 225,
	},
	rockhead: {
		onDamage(damage, target, source, effect) {
			if (effect.id === 'recoil') {
				if (!this.activeMove) throw new Error("Battle.activeMove is null");
				if (this.activeMove.id !== 'struggle') return null;
			}
		},
		flags: {},
		name: "Rock Head",
		rating: 3,
		num: 69,
	},
	rockypayload: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Rock') {
				this.debug('Rocky Payload boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Rock') {
				this.debug('Rocky Payload boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Rocky Payload",
		rating: 3.5,
		num: 276,
	},
	roughskin: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.damage(source.baseMaxhp / 8, source, target);
			}
		},
		flags: {},
		name: "Rough Skin",
		rating: 2.5,
		num: 24,
	},
	runaway: {
		flags: {},
		name: "Run Away",
		rating: 0,
		num: 50,
	},
	sandforce: {
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			if (this.field.isWeather('sandstorm')) {
				if (move.type === 'Rock' || move.type === 'Ground' || move.type === 'Steel') {
					this.debug('Sand Force boost');
					return this.chainModify([5325, 4096]);
				}
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm') return false;
		},
		flags: {},
		name: "Sand Force",
		rating: 2,
		num: 159,
	},
	sandrush: {
		onModifySpe(spe, pokemon) {
			if (this.field.isWeather('sandstorm')) {
				return this.chainModify(2);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm') return false;
		},
		flags: {},
		name: "Sand Rush",
		rating: 3,
		num: 146,
	},
	sandspit: {
		onDamagingHit(damage, target, source, move) {
			this.field.setWeather('sandstorm');
		},
		flags: {},
		name: "Sand Spit",
		rating: 1,
		num: 245,
	},
	sandstream: {
		onStart(source) {
			this.field.setWeather('sandstorm');
		},
		flags: {},
		name: "Sand Stream",
		rating: 4,
		num: 45,
	},
	sandveil: {
		onImmunity(type, pokemon) {
			if (type === 'sandstorm') return false;
		},
		onModifyAccuracyPriority: -1,
		onModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			if (this.field.isWeather('sandstorm')) {
				this.debug('Sand Veil - decreasing accuracy');
				return this.chainModify([3277, 4096]);
			}
		},
		flags: { breakable: 1 },
		name: "Sand Veil",
		rating: 1.5,
		num: 8,
	},
	sapsipper: {
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Grass') {
				if (!this.boost({ atk: 1 })) {
					this.add('-immune', target, '[from] ability: Sap Sipper');
				}
				return null;
			}
		},
		onAllyTryHitSide(target, source, move) {
			if (source === this.effectState.target || !target.isAlly(source)) return;
			if (move.type === 'Grass') {
				this.boost({ atk: 1 }, this.effectState.target);
			}
		},
		flags: { breakable: 1 },
		name: "Sap Sipper",
		rating: 3,
		num: 157,
	},
	schooling: {
		onSwitchInPriority: -1,
		onStart(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Wishiwashi' || pokemon.level < 20 || pokemon.transformed) return;
			if (pokemon.hp > pokemon.maxhp / 4) {
				if (pokemon.species.id === 'wishiwashi') {
					pokemon.formeChange('Wishiwashi-School');
				}
			} else {
				if (pokemon.species.id === 'wishiwashischool') {
					pokemon.formeChange('Wishiwashi');
				}
			}
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (
				pokemon.baseSpecies.baseSpecies !== 'Wishiwashi' || pokemon.level < 20 ||
				pokemon.transformed || !pokemon.hp
			) return;
			if (pokemon.hp > pokemon.maxhp / 4) {
				if (pokemon.species.id === 'wishiwashi') {
					pokemon.formeChange('Wishiwashi-School');
				}
			} else {
				if (pokemon.species.id === 'wishiwashischool') {
					pokemon.formeChange('Wishiwashi');
				}
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Schooling",
		rating: 3,
		num: 208,
	},
	scrappy: {
		onModifyMovePriority: -5,
		onModifyMove(move) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Fighting'] = true;
				move.ignoreImmunity['Normal'] = true;
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Scrappy', `[of] ${target}`);
			}
		},
		flags: {},
		name: "Scrappy",
		rating: 3,
		num: 113,
	},
	blindrage: {
		// Blind Rage combina os efeitos do Scrappy (Normal/Luta ignoram imunidade a Fantasma)
		// com o Mold Breaker (ignora a Ability do alvo).
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Blind Rage');
		},
		onModifyMovePriority: -5,
		onModifyMove(move) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Fighting'] = true;
				move.ignoreImmunity['Normal'] = true;
			}
			move.ignoreAbility = true;
		},
		flags: {},
		name: "Blind Rage",
		shortDesc: "Normal e Ataque Lutador ignoram imunidade a Fantasma. Também ignora a Ability do alvo.",
		rating: 4,
		num: 902,
		gen: 8,
	},
	// Habilidade OCB: Desolate Land + Air Blower (clima extremo de sol + Tailwind ao entrar).
	blisteringsun: {
		onStart(source) {
			this.field.setWeather('desolateland');
			const tailwind = source.side.sideConditions['tailwind'];
			if (!tailwind) {
				this.add('-activate', source, 'ability: Blistering Sun');
				source.side.addSideCondition('tailwind', source, source.getAbility());
			}
		},
		onAnySetWeather(target, source, weather) {
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			if (this.field.getWeather().id === 'desolateland' && !strongWeathers.includes(weather.id)) return false;
		},
		onEnd(pokemon) {
			if (this.field.weatherState.source !== pokemon) return;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (target.hasAbility('desolateland') || target.hasAbility('blisteringsun')) {
					this.field.weatherState.source = target;
					return;
				}
			}
			this.field.clearWeather();
		},
		flags: {},
		name: "Blistering Sun",
		shortDesc: "Ao entrar, ativa sol extremo e Tailwind no seu lado. Igual Desolate Land para bloquear climas fracos.",
		rating: 5,
		num: 1001,
	},
	// Habilidade OCB: Furnace + absorve movimentos Rock (cura) e dano de Stealth Rock.
	moltencore: {
		onTryHit(target, source, move) {
			if (target === source || move.type !== 'Rock') return;
			if (!this.heal(target.baseMaxhp / 4)) {
				this.add('-immune', target, '[from] ability: Molten Core');
			}
			return null;
		},
		onDamage(damage, target, source, effect) {
			if (effect?.id === 'stealthrock') {
				return false;
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (!damage || move.type !== 'Rock') return;
			this.boost({ spe: 2 }, target, target, this.dex.abilities.get('moltencore'));
		},
		flags: { breakable: 1 },
		name: "Molten Core",
		shortDesc: "Furnace + absorve movimentos Rock (cura 1/4 do HP) e não sofre dano de Stealth Rock; +2 Speed se um Rock causar dano.",
		rating: 4,
		num: 1002,
	},
	// Habilidade OCB: redução fixa de dano recebido.
	auraarmor: {
		onSourceModifyDamage(damage, source, target, move) {
			this.debug('Aura Armor reduce');
			return this.chainModify(0.65);
		},
		flags: { breakable: 1 },
		name: "Aura Armor",
		shortDesc: "Recebe 35% menos dano.",
		rating: 4,
		num: 1003,
	},
	// Habilidade OCB: redução de dano + contra-ataque com Vacuum Wave enfraquecido.
	deflect: {
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
		flags: { breakable: 1 },
		name: "Deflect",
		shortDesc: "Recebe 20% menos dano e contra-ataca com Vacuum Wave de 20 BP ao ser atingido.",
		rating: 4,
		num: 1004,
	},
	// Habilidade OCB: ativa chuva e terreno elétrico ao entrar.
	supercell: {
		onStart(source) {
			this.field.setWeather('raindance');
			this.field.setTerrain('electricterrain');
		},
		flags: {},
		name: "Supercell",
		shortDesc: "Ao entrar, ativa Drizzle + Electric Surge (chuva e terreno elétrico).",
		rating: 5,
		num: 1005,
	},
	screencleaner: {
		onStart(pokemon) {
			let activated = false;
			for (const sideCondition of ['reflect', 'lightscreen', 'auroraveil']) {
				for (const side of [pokemon.side, ...pokemon.side.foeSidesWithConditions()]) {
					if (side.getSideCondition(sideCondition)) {
						if (!activated) {
							this.add('-activate', pokemon, 'ability: Screen Cleaner');
							activated = true;
						}
						side.removeSideCondition(sideCondition);
					}
				}
			}
		},
		flags: {},
		name: "Screen Cleaner",
		rating: 2,
		num: 251,
	},
	seedsower: {
		onDamagingHit(damage, target, source, move) {
			this.field.setTerrain('grassyterrain');
		},
		flags: {},
		name: "Seed Sower",
		rating: 2.5,
		num: 269,
	},
	serenegrace: {
		onModifyMovePriority: -2,
		onModifyMove(move) {
			if (move.secondaries) {
				this.debug('doubling secondary chance');
				for (const secondary of move.secondaries) {
					if (secondary.chance) secondary.chance *= 2;
				}
			}
			if (move.self?.chance) move.self.chance *= 2;
		},
		flags: {},
		name: "Serene Grace",
		rating: 3.5,
		num: 32,
	},
	shadowshield: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp >= target.maxhp) {
				this.debug('Shadow Shield weaken');
				return this.chainModify(0.5);
			}
		},
		flags: {},
		name: "Shadow Shield",
		rating: 3.5,
		num: 231,
	},
	shadowtag: {
		onFoeTrapPokemon(pokemon) {
			if (!pokemon.hasAbility('shadowtag') && pokemon.isAdjacent(this.effectState.target)) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			if (!source) source = this.effectState.target;
			if (!source || !pokemon.isAdjacent(source)) return;
			if (!pokemon.hasAbility('shadowtag')) {
				pokemon.maybeTrapped = true;
			}
		},
		flags: {},
		name: "Shadow Tag",
		rating: 5,
		num: 23,
	},
	sharpness: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['slicing']) {
				this.debug('Sharpness boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Sharpness",
		rating: 3.5,
		num: 292,
	},
	shedskin: {
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			if (pokemon.hp && pokemon.status && this.randomChance(33, 100)) {
				this.debug('shed skin');
				this.add('-activate', pokemon, 'ability: Shed Skin');
				pokemon.cureStatus();
			}
		},
		flags: {},
		name: "Shed Skin",
		rating: 3,
		num: 61,
	},
	sheerforce: {
		onModifyMove(move, pokemon) {
			if (move.secondaries) {
				delete move.secondaries;
				// Technically not a secondary effect, but it is negated
				delete move.self;
				if (move.id === 'clangoroussoulblaze') delete move.selfBoost;
				// Actual negation of `AfterMoveSecondary` effects implemented in scripts.js
				move.hasSheerForce = true;
			}
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, pokemon, target, move) {
			if (move.hasSheerForce) return this.chainModify([5325, 4096]);
		},
		flags: {},
		name: "Sheer Force",
		rating: 3.5,
		num: 125,
	},
	shellarmor: {
		onCriticalHit: false,
		flags: { breakable: 1 },
		name: "Shell Armor",
		rating: 1,
		num: 75,
	},
	shielddust: {
		onModifySecondaries(secondaries) {
			this.debug('Shield Dust prevent secondary');
			return secondaries.filter(effect => !!effect.self);
		},
		flags: { breakable: 1 },
		name: "Shield Dust",
		rating: 2,
		num: 19,
	},
	shieldsdown: {
		onSwitchInPriority: -1,
		onStart(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Minior' || pokemon.transformed) return;
			if (pokemon.hp > pokemon.maxhp / 2) {
				if (pokemon.species.forme !== 'Meteor') {
					pokemon.formeChange('Minior-Meteor');
				}
			} else {
				if (pokemon.species.forme === 'Meteor') {
					pokemon.formeChange(pokemon.set.species);
				}
			}
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Minior' || pokemon.transformed || !pokemon.hp) return;
			if (pokemon.hp > pokemon.maxhp / 2) {
				if (pokemon.species.forme !== 'Meteor') {
					pokemon.formeChange('Minior-Meteor');
				}
			} else {
				if (pokemon.species.forme === 'Meteor') {
					pokemon.formeChange(pokemon.set.species);
				}
			}
		},
		onSetStatus(status, target, source, effect) {
			if (target.species.id !== 'miniormeteor' || target.transformed) return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Shields Down');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (target.species.id !== 'miniormeteor' || target.transformed) return;
			if (status.id !== 'yawn') return;
			this.add('-immune', target, '[from] ability: Shields Down');
			return null;
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Shields Down",
		rating: 3,
		num: 197,
	},
	simple: {
		onChangeBoost(boost, target, source, effect) {
			if (effect && effect.id === 'zpower') return;
			let i: BoostID;
			for (i in boost) {
				boost[i]! *= 2;
			}
		},
		flags: { breakable: 1 },
		name: "Simple",
		rating: 4,
		num: 86,
	},
	skilllink: {
		onModifyMove(move) {
			if (move.multihit && Array.isArray(move.multihit) && move.multihit.length) {
				move.multihit = move.multihit[1];
			}
			if (move.multiaccuracy) {
				delete move.multiaccuracy;
			}
		},
		flags: {},
		name: "Skill Link",
		rating: 3,
		num: 92,
	},
	slowstart: {
		onStart(pokemon) {
			this.add('-start', pokemon, 'ability: Slow Start');
			this.effectState.counter = 5;
		},
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (pokemon.activeTurns && this.effectState.counter) {
				this.effectState.counter--;
				if (!this.effectState.counter) {
					this.add('-end', pokemon, 'Slow Start');
					delete this.effectState.counter;
				}
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (this.effectState.counter) {
				return this.chainModify(0.5);
			}
		},
		onModifySpe(spe, pokemon) {
			if (this.effectState.counter) {
				return this.chainModify(0.5);
			}
		},
		onEnd(pokemon) {
			if (pokemon.beingCalledBack) return;
			this.add('-end', pokemon, 'Slow Start', '[silent]');
		},
		flags: {},
		name: "Slow Start",
		rating: -1,
		num: 112,
	},
	slushrush: {
		onModifySpe(spe, pokemon) {
			if (this.field.isWeather(['hail', 'snowscape'])) {
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Slush Rush",
		rating: 3,
		num: 202,
	},
	sniper: {
		onModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).crit) {
				this.debug('Sniper boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Sniper",
		rating: 2,
		num: 97,
	},
	snowcloak: {
		onImmunity(type, pokemon) {
			if (type === 'hail') return false;
		},
		onModifyAccuracyPriority: -1,
		onModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			if (this.field.isWeather(['hail', 'snowscape'])) {
				this.debug('Snow Cloak - decreasing accuracy');
				return this.chainModify([3277, 4096]);
			}
		},
		flags: { breakable: 1 },
		name: "Snow Cloak",
		rating: 1.5,
		num: 81,
	},
	snowwarning: {
		onStart(source) {
			this.field.setWeather('snowscape');
		},
		flags: {},
		name: "Snow Warning",
		rating: 4,
		num: 117,
	},
	solarpower: {
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		onWeather(target, source, effect) {
			if (target.hasItem('utilityumbrella')) return;
			if (effect.id === 'sunnyday' || effect.id === 'desolateland') {
				this.damage(target.baseMaxhp / 8, target, target);
			}
		},
		flags: {},
		name: "Solar Power",
		rating: 2,
		num: 94,
	},
	solidrock: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug('Solid Rock neutralize');
				return this.chainModify(0.75);
			}
		},
		flags: { breakable: 1 },
		name: "Solid Rock",
		rating: 3,
		num: 116,
	},
	soulheart: {
		onAnyFaintPriority: 1,
		onAnyFaint() {
			this.boost({ spa: 1 }, this.effectState.target);
		},
		flags: {},
		name: "Soul-Heart",
		rating: 3.5,
		num: 220,
	},
	soundproof: {
		onTryHit(target, source, move) {
			if (target !== source && move.flags['sound']) {
				this.add('-immune', target, '[from] ability: Soundproof');
				return null;
			}
		},
		onAllyTryHitSide(target, source, move) {
			if (move.flags['sound']) {
				this.add('-immune', this.effectState.target, '[from] ability: Soundproof');
			}
		},
		flags: { breakable: 1 },
		name: "Soundproof",
		rating: 2,
		num: 43,
	},
	speedboost: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (pokemon.activeTurns) {
				this.boost({ spe: 1 });
			}
		},
		flags: {},
		name: "Speed Boost",
		rating: 4.5,
		num: 3,
	},
	stakeout: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender) {
			if (!defender.activeTurns) {
				this.debug('Stakeout boost');
				return this.chainModify(2);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender) {
			if (!defender.activeTurns) {
				this.debug('Stakeout boost');
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Stakeout",
		rating: 4.5,
		num: 198,
	},
	stall: {
		onFractionalPriority: -0.1,
		flags: {},
		name: "Stall",
		rating: -1,
		num: 100,
	},
	stalwart: {
		onModifyMovePriority: 1,
		onModifyMove(move) {
			// most of the implementation is in Battle#getTarget
			move.tracksTarget = move.target !== 'scripted';
		},
		flags: {},
		name: "Stalwart",
		rating: 0,
		num: 242,
	},
	stamina: {
		onDamagingHit(damage, target, source, effect) {
			this.boost({ def: 1 });
		},
		flags: {},
		name: "Stamina",
		rating: 4,
		num: 192,
	},
	stancechange: {
		onModifyMovePriority: 1,
		onModifyMove(move, attacker, defender) {
			if (attacker.species.baseSpecies !== 'Aegislash' || attacker.transformed) return;
			if (move.category === 'Status' && move.id !== 'kingsshield') return;
			const targetForme = (move.id === 'kingsshield' ? 'Aegislash' : 'Aegislash-Blade');
			if (attacker.species.name !== targetForme) attacker.formeChange(targetForme);
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Stance Change",
		rating: 4,
		num: 176,
	},
	static: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.trySetStatus('par', target);
				}
			}
		},
		flags: {},
		name: "Static",
		rating: 2,
		num: 9,
	},
	steadfast: {
		onFlinch(pokemon) {
			this.boost({ spe: 1 });
		},
		flags: {},
		name: "Steadfast",
		rating: 1,
		num: 80,
	},
	steamengine: {
		onDamagingHit(damage, target, source, move) {
			if (['Water', 'Fire'].includes(move.type)) {
				this.boost({ spe: 6 });
			}
		},
		flags: {},
		name: "Steam Engine",
		rating: 2,
		num: 243,
	},
	steelworker: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Steel') {
				this.debug('Steelworker boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Steel') {
				this.debug('Steelworker boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Steelworker",
		rating: 3.5,
		num: 200,
	},
	steelyspirit: {
		onAllyBasePowerPriority: 22,
		onAllyBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Steel') {
				this.debug('Steely Spirit boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Steely Spirit",
		rating: 3.5,
		num: 252,
	},
	stench: {
		onModifyMovePriority: -1,
		onModifyMove(move) {
			if (move.category !== "Status") {
				this.debug('Adding Stench flinch');
				if (!move.secondaries) move.secondaries = [];
				for (const secondary of move.secondaries) {
					if (secondary.volatileStatus === 'flinch') return;
				}
				move.secondaries.push({
					chance: 10,
					volatileStatus: 'flinch',
				});
			}
		},
		flags: {},
		name: "Stench",
		rating: 0.5,
		num: 1,
	},
	stickyhold: {
		onTakeItem(item, pokemon, source) {
			if (!this.activeMove) throw new Error("Battle.activeMove is null");
			if (!pokemon.hp || pokemon.item === 'stickybarb') return;
			if ((source && source !== pokemon) || this.activeMove.id === 'knockoff') {
				this.add('-activate', pokemon, 'ability: Sticky Hold');
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Sticky Hold",
		rating: 1.5,
		num: 60,
	},
	stormdrain: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Water') {
				if (!this.boost({ spa: 1 })) {
					this.add('-immune', target, '[from] ability: Storm Drain');
				}
				return null;
			}
		},
		onAnyRedirectTarget(target, source, source2, move) {
			if (move.type !== 'Water' || move.flags['pledgecombo']) return;
			const redirectTarget = ['randomNormal', 'adjacentFoe'].includes(move.target) ? 'normal' : move.target;
			if (this.validTarget(this.effectState.target, source, redirectTarget)) {
				if (move.smartTarget) move.smartTarget = false;
				if (this.effectState.target !== target) {
					this.add('-activate', this.effectState.target, 'ability: Storm Drain');
				}
				return this.effectState.target;
			}
		},
		flags: { breakable: 1 },
		name: "Storm Drain",
		rating: 3,
		num: 114,
	},
	strongjaw: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['bite']) {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Strong Jaw",
		rating: 3.5,
		num: 173,
	},
	sturdy: {
		onTryHit(pokemon, target, move) {
			if (move.ohko) {
				this.add('-immune', pokemon, '[from] ability: Sturdy');
				return null;
			}
		},
		onDamagePriority: -30,
		onDamage(damage, target, source, effect) {
			if (target.hp === target.maxhp && damage >= target.hp && effect && effect.effectType === 'Move') {
				this.add('-ability', target, 'Sturdy');
				return target.hp - 1;
			}
		},
		flags: { breakable: 1 },
		name: "Sturdy",
		rating: 3,
		num: 5,
	},
	suctioncups: {
		onDragOutPriority: 1,
		onDragOut(pokemon) {
			this.add('-activate', pokemon, 'ability: Suction Cups');
			return null;
		},
		flags: { breakable: 1 },
		name: "Suction Cups",
		rating: 1,
		num: 21,
	},
	superluck: {
		onModifyCritRatio(critRatio) {
			return critRatio + 1;
		},
		flags: {},
		name: "Super Luck",
		rating: 1.5,
		num: 105,
	},
	supersweetsyrup: {
		onStart(pokemon) {
			if (pokemon.syrupTriggered) return;
			pokemon.syrupTriggered = true;
			this.add('-ability', pokemon, 'Supersweet Syrup');
			for (const target of pokemon.adjacentFoes()) {
				if (target.volatiles['substitute']) {
					this.add('-immune', target);
				} else {
					this.boost({ evasion: -1 }, target, pokemon, null, true);
				}
			}
		},
		flags: {},
		name: "Supersweet Syrup",
		rating: 1.5,
		num: 306,
	},
	supremeoverlord: {
		onStart(pokemon) {
			if (pokemon.side.totalFainted) {
				this.add('-activate', pokemon, 'ability: Supreme Overlord');
				const fallen = Math.min(pokemon.side.totalFainted, 5);
				this.add('-start', pokemon, `fallen${fallen}`, '[silent]');
				this.effectState.fallen = fallen;
			}
		},
		onEnd(pokemon) {
			this.add('-end', pokemon, `fallen${this.effectState.fallen}`, '[silent]');
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			if (this.effectState.fallen) {
				const powMod = [4096, 4506, 4915, 5325, 5734, 6144];
				this.debug(`Supreme Overlord boost: ${powMod[this.effectState.fallen]}/4096`);
				return this.chainModify([powMod[this.effectState.fallen], 4096]);
			}
		},
		flags: {},
		name: "Supreme Overlord",
		rating: 4,
		num: 293,
	},
	surgesurfer: {
		onModifySpe(spe) {
			if (this.field.isTerrain('electricterrain')) {
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Surge Surfer",
		rating: 3,
		num: 207,
	},
	swarm: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Bug' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Swarm boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Bug' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Swarm boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Swarm",
		rating: 2,
		num: 68,
	},
	sweetveil: {
		onAllySetStatus(status, target, source, effect) {
			if (status.id === 'slp') {
				this.debug('Sweet Veil interrupts sleep');
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Sweet Veil', `[of] ${effectHolder}`);
				return null;
			}
		},
		onAllyTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.debug('Sweet Veil blocking yawn');
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Sweet Veil', `[of] ${effectHolder}`);
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Sweet Veil",
		rating: 2,
		num: 175,
	},
	swiftswim: {
		onModifySpe(spe, pokemon) {
			if (['raindance', 'primordialsea'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Swift Swim",
		rating: 3,
		num: 33,
	},
	swordofruin: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Sword of Ruin');
		},
		onAnyModifyDef(def, target, source, move) {
			const abilityHolder = this.effectState.target;
			if (target.hasAbility('Sword of Ruin')) return;
			if (!move.ruinedDef?.hasAbility('Sword of Ruin')) move.ruinedDef = abilityHolder;
			if (move.ruinedDef !== abilityHolder) return;
			this.debug('Sword of Ruin Def drop');
			return this.chainModify(0.75);
		},
		flags: {},
		name: "Sword of Ruin",
		rating: 4.5,
		num: 285,
	},
	// Unaware + Sword of Ruin (custom)
	swordofdamnation: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Sword of Damnation');
		},
		onAnyModifyBoost(boosts, pokemon) {
			const unawareUser = this.effectState.target;
			if (unawareUser === pokemon) return;
			if (unawareUser === this.activePokemon && pokemon === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (pokemon === this.activePokemon && unawareUser === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['def'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		onAnyModifyDef(def, target, source, move) {
			const abilityHolder = this.effectState.target;
			if (target.hasAbility('Sword of Damnation')) return;
			if (!move.ruinedDef?.hasAbility('Sword of Damnation')) move.ruinedDef = abilityHolder;
			if (move.ruinedDef !== abilityHolder) return;
			this.debug('Sword of Damnation Def drop');
			return this.chainModify(0.75);
		},
		flags: { breakable: 1 },
		name: "Sword of Damnation",
		rating: 5,
		num: 465,
		gen: 9,
	},
	symbiosis: {
		onAllyAfterUseItem(item, pokemon) {
			if (pokemon.switchFlag) return;
			const source = this.effectState.target;
			const myItem = source.takeItem();
			if (!myItem) return;
			if (
				!this.singleEvent('TakeItem', myItem, source.itemState, pokemon, source, this.effect, myItem) ||
				!pokemon.setItem(myItem)
			) {
				source.item = myItem.id;
				return;
			}
			this.add('-activate', source, 'ability: Symbiosis', myItem, `[of] ${pokemon}`);
		},
		flags: {},
		name: "Symbiosis",
		rating: 0,
		num: 180,
	},
	synchronize: {
		onAfterSetStatus(status, target, source, effect) {
			if (!source || source === target) return;
			if (effect && effect.id === 'toxicspikes') return;
			if (status.id === 'slp' || status.id === 'frz') return;
			this.add('-activate', target, 'ability: Synchronize');
			// Hack to make status-prevention abilities think Synchronize is a status move
			// and show messages when activating against it.
			source.trySetStatus(status, target, { status: status.id, id: 'synchronize' } as Effect);
		},
		flags: {},
		name: "Synchronize",
		rating: 2,
		num: 28,
	},
	tabletsofruin: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Tablets of Ruin');
		},
		onAnyModifyAtk(atk, source, target, move) {
			const abilityHolder = this.effectState.target;
			if (source.hasAbility('Tablets of Ruin')) return;
			if (!move.ruinedAtk) move.ruinedAtk = abilityHolder;
			if (move.ruinedAtk !== abilityHolder) return;
			this.debug('Tablets of Ruin Atk drop');
			return this.chainModify(0.75);
		},
		flags: {},
		name: "Tablets of Ruin",
		rating: 4.5,
		num: 284,
	},
	tangledfeet: {
		onModifyAccuracyPriority: -1,
		onModifyAccuracy(accuracy, target) {
			if (typeof accuracy !== 'number') return;
			if (target?.volatiles['confusion']) {
				this.debug('Tangled Feet - decreasing accuracy');
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Tangled Feet",
		rating: 1,
		num: 77,
	},
	tanglinghair: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.add('-ability', target, 'Tangling Hair');
				this.boost({ spe: -1 }, source, target, null, true);
			}
		},
		flags: {},
		name: "Tangling Hair",
		rating: 2,
		num: 221,
	},
	technician: {
		onBasePowerPriority: 30,
		onBasePower(basePower, attacker, defender, move) {
			const basePowerAfterMultiplier = this.modify(basePower, this.event.modifier);
			this.debug(`Base Power: ${basePowerAfterMultiplier}`);
			if (basePowerAfterMultiplier <= 60) {
				this.debug('Technician boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Technician",
		rating: 3.5,
		num: 101,
	},
	telepathy: {
		onTryHit(target, source, move) {
			if (target !== source && target.isAlly(source) && move.category !== 'Status') {
				this.add('-activate', target, 'ability: Telepathy');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Telepathy",
		rating: 0,
		num: 140,
	},
	teraformzero: {
		onAfterTerastallization(pokemon) {
			if (pokemon.baseSpecies.name !== 'Terapagos-Stellar') return;
			if (this.field.weather || this.field.terrain) {
				this.add('-ability', pokemon, 'Teraform Zero');
				this.field.clearWeather();
				this.field.clearTerrain();
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1 },
		name: "Teraform Zero",
		rating: 3,
		num: 309,
	},
	terashell: {
		// effectiveness implemented in sim/pokemon.ts:Pokemon#runEffectiveness
		// needs two checks to reset between regular moves and future attacks
		onAnyBeforeMove() {
			delete this.effectState.resisted;
		},
		onAnyAfterMove() {
			delete this.effectState.resisted;
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, breakable: 1 },
		name: "Tera Shell",
		rating: 3.5,
		num: 308,
	},
	terashift: {
		onSwitchInPriority: 2,
		onSwitchIn(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Terapagos') return;
			if (pokemon.species.forme !== 'Terastal') {
				this.add('-activate', pokemon, 'ability: Tera Shift');
				pokemon.formeChange('Terapagos-Terastal', this.effect, true);
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1, notransform: 1 },
		name: "Tera Shift",
		rating: 3,
		num: 307,
	},
	teravolt: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Teravolt');
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		flags: {},
		name: "Teravolt",
		rating: 3,
		num: 164,
	},
	thermalexchange: {
		onDamagingHit(damage, target, source, move) {
			if (move.type === 'Fire') {
				this.boost({ atk: 1 });
			}
		},
		onUpdate(pokemon) {
			if (pokemon.status === 'brn') {
				this.add('-activate', pokemon, 'ability: Thermal Exchange');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'brn') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Thermal Exchange');
			}
			return false;
		},
		flags: { breakable: 1 },
		name: "Thermal Exchange",
		rating: 2.5,
		num: 270,
	},
	thickfat: {
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Ice' || move.type === 'Fire') {
				this.debug('Thick Fat weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Ice' || move.type === 'Fire') {
				this.debug('Thick Fat weaken');
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Thick Fat",
		rating: 3.5,
		num: 47,
	},
	tintedlens: {
		onModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod < 0) {
				this.debug('Tinted Lens boost');
				return this.chainModify(2);
			}
		},
		flags: {},
		name: "Tinted Lens",
		rating: 4,
		num: 110,
	},
	torrent: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Water' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Torrent boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Water' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Torrent boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Torrent",
		rating: 2,
		num: 67,
	},
	toughclaws: {
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['contact']) {
				return this.chainModify([5325, 4096]);
			}
		},
		flags: {},
		name: "Tough Claws",
		rating: 3.5,
		num: 181,
	},
	toxicboost: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if ((attacker.status === 'psn' || attacker.status === 'tox') && move.category === 'Physical') {
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Toxic Boost",
		rating: 3,
		num: 137,
	},
	toxicchain: {
		onSourceDamagingHit(damage, target, source, move) {
			// Despite not being a secondary, Shield Dust / Covert Cloak block Toxic Chain's effect
			if (target.hasAbility('shielddust') || target.hasItem('covertcloak')) return;

			if (this.randomChance(3, 10)) {
				target.trySetStatus('tox', source);
			}
		},
		flags: {},
		name: "Toxic Chain",
		rating: 4.5,
		num: 305,
	},
	toxicdebris: {
		onDamagingHit(damage, target, source, move) {
			const side = source.isAlly(target) ? source.side.foe : source.side;
			const toxicSpikes = side.sideConditions['toxicspikes'];
			if (move.category === 'Physical' && (!toxicSpikes || toxicSpikes.layers < 2)) {
				this.add('-activate', target, 'ability: Toxic Debris');
				side.addSideCondition('toxicspikes', target);
			}
		},
		flags: {},
		name: "Toxic Debris",
		rating: 3.5,
		num: 295,
	},
	trace: {
		onStart(pokemon) {
			this.effectState.seek = true;
			// n.b. only affects Hackmons
			// interaction with No Ability is complicated: https://www.smogon.com/forums/threads/pokemon-sun-moon-battle-mechanics-research.3586701/page-76#post-7790209
			if (pokemon.adjacentFoes().some(foeActive => foeActive.ability === 'noability')) {
				this.effectState.seek = false;
			}
			// interaction with Ability Shield is similar to No Ability
			if (pokemon.hasItem('Ability Shield')) {
				this.add('-block', pokemon, 'item: Ability Shield');
				this.effectState.seek = false;
			}
			if (this.effectState.seek) {
				this.singleEvent('Update', this.effect, this.effectState, pokemon);
			}
		},
		onUpdate(pokemon) {
			if (!this.effectState.seek) return;

			const possibleTargets = pokemon.adjacentFoes().filter(
				target => !target.getAbility().flags['notrace'] && target.ability !== 'noability'
			);
			if (!possibleTargets.length) return;

			const target = this.sample(possibleTargets);
			const ability = target.getAbility();
			pokemon.setAbility(ability, target);
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Trace",
		rating: 2.5,
		num: 36,
	},
	transistor: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Electric') {
				this.debug('Transistor boost');
				return this.chainModify([6144, 4096]);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Electric') {
				this.debug('Transistor boost');
				return this.chainModify([6144, 4096]);
			}
		},
		flags: {},
		name: "Transistor",
		rating: 3.5,
		num: 262,
	},
	triage: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.flags['heal']) return priority + 3;
		},
		flags: {},
		name: "Triage",
		rating: 3.5,
		num: 205,
	},
	truant: {
		onStart(pokemon) {
			pokemon.removeVolatile('truant');
			if (pokemon.activeTurns && (pokemon.moveThisTurnResult !== undefined || !this.queue.willMove(pokemon))) {
				pokemon.addVolatile('truant');
			}
		},
		onBeforeMovePriority: 9,
		onBeforeMove(pokemon) {
			if (pokemon.removeVolatile('truant')) {
				this.add('cant', pokemon, 'ability: Truant');
				return false;
			}
			pokemon.addVolatile('truant');
		},
		condition: {},
		flags: {},
		name: "Truant",
		rating: -1,
		num: 54,
	},
	turboblaze: {
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Turboblaze');
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		flags: {},
		name: "Turboblaze",
		rating: 3,
		num: 163,
	},
	unaware: {
		onAnyModifyBoost(boosts, pokemon) {
			const unawareUser = this.effectState.target;
			if (unawareUser === pokemon) return;
			if (unawareUser === this.activePokemon && pokemon === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (pokemon === this.activePokemon && unawareUser === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['def'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		flags: { breakable: 1 },
		name: "Unaware",
		rating: 4,
		num: 109,
	},
	unburden: {
		onAfterUseItem(item, pokemon) {
			if (pokemon !== this.effectState.target) return;
			pokemon.addVolatile('unburden');
		},
		onTakeItem(item, pokemon) {
			pokemon.addVolatile('unburden');
		},
		onEnd(pokemon) {
			pokemon.removeVolatile('unburden');
		},
		condition: {
			onModifySpe(spe, pokemon) {
				if (!pokemon.item && !pokemon.ignoringAbility()) {
					return this.chainModify(2);
				}
			},
		},
		flags: {},
		name: "Unburden",
		rating: 3.5,
		num: 84,
	},
	unnerve: {
		onSwitchInPriority: 1,
		onStart(pokemon) {
			if (this.effectState.unnerved) return;
			this.add('-ability', pokemon, 'Unnerve');
			this.effectState.unnerved = true;
		},
		onEnd() {
			this.effectState.unnerved = false;
		},
		onFoeTryEatItem() {
			return !this.effectState.unnerved;
		},
		flags: {},
		name: "Unnerve",
		rating: 1,
		num: 127,
	},
	unseenfist: {
		onModifyMove(move) {
			if (move.flags['contact']) delete move.flags['protect'];
		},
		flags: {},
		name: "Unseen Fist",
		rating: 2,
		num: 260,
	},
	vesselofruin: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Vessel of Ruin');
		},
		onAnyModifySpA(spa, source, target, move) {
			const abilityHolder = this.effectState.target;
			if (source.hasAbility('Vessel of Ruin')) return;
			if (!move.ruinedSpA) move.ruinedSpA = abilityHolder;
			if (move.ruinedSpA !== abilityHolder) return;
			this.debug('Vessel of Ruin SpA drop');
			return this.chainModify(0.75);
		},
		flags: {},
		name: "Vessel of Ruin",
		rating: 4.5,
		num: 284,
	},
	victorystar: {
		onAnyModifyAccuracyPriority: -1,
		onAnyModifyAccuracy(accuracy, target, source) {
			if (source.isAlly(this.effectState.target) && typeof accuracy === 'number') {
				return this.chainModify([4506, 4096]);
			}
		},
		flags: {},
		name: "Victory Star",
		rating: 2,
		num: 162,
	},
	vitalspirit: {
		onUpdate(pokemon) {
			if (pokemon.status === 'slp') {
				this.add('-activate', pokemon, 'ability: Vital Spirit');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'slp') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Vital Spirit');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.add('-immune', target, '[from] ability: Vital Spirit');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Vital Spirit",
		rating: 1.5,
		num: 72,
	},
	voltabsorb: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Electric') {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Volt Absorb');
				}
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Volt Absorb",
		rating: 3.5,
		num: 10,
	},
	wanderingspirit: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) this.skillSwap(source, target);
		},
		flags: {},
		name: "Wandering Spirit",
		rating: 2.5,
		num: 254,
	},
	waterabsorb: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Water') {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Water Absorb');
				}
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Water Absorb",
		rating: 3.5,
		num: 11,
	},
	waterbubble: {
		onSourceModifyAtkPriority: 5,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				return this.chainModify(0.5);
			}
		},
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Water') {
				return this.chainModify(2);
			}
		},
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Water') {
				return this.chainModify(2);
			}
		},
		onUpdate(pokemon) {
			if (pokemon.status === 'brn') {
				this.add('-activate', pokemon, 'ability: Water Bubble');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'brn') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Water Bubble');
			}
			return false;
		},
		flags: { breakable: 1 },
		name: "Water Bubble",
		rating: 4.5,
		num: 199,
	},
	watercompaction: {
		onDamagingHit(damage, target, source, move) {
			if (move.type === 'Water') {
				this.boost({ def: 2 });
			}
		},
		flags: {},
		name: "Water Compaction",
		rating: 1.5,
		num: 195,
	},
	waterveil: {
		onUpdate(pokemon) {
			if (pokemon.status === 'brn') {
				this.add('-activate', pokemon, 'ability: Water Veil');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'brn') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Water Veil');
			}
			return false;
		},
		flags: { breakable: 1 },
		name: "Water Veil",
		rating: 2,
		num: 41,
	},
	weakarmor: {
		onDamagingHit(damage, target, source, move) {
			if (move.category === 'Physical') {
				this.boost({ def: -1, spe: 2 }, target, target);
			}
		},
		flags: {},
		name: "Weak Armor",
		rating: 1,
		num: 133,
	},
	wellbakedbody: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Fire') {
				if (!this.boost({ def: 2 })) {
					this.add('-immune', target, '[from] ability: Well-Baked Body');
				}
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Well-Baked Body",
		rating: 3.5,
		num: 273,
	},
	whitesmoke: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add("-fail", target, "unboost", "[from] ability: White Smoke", `[of] ${target}`);
			}
		},
		flags: { breakable: 1 },
		name: "White Smoke",
		rating: 2,
		num: 73,
	},
	wimpout: {
		onEmergencyExit(target) {
			if (!this.canSwitch(target.side) || target.forceSwitchFlag || target.switchFlag) return;
			for (const side of this.sides) {
				for (const active of side.active) {
					active.switchFlag = false;
				}
			}
			target.switchFlag = true;
			this.add('-activate', target, 'ability: Wimp Out');
		},
		flags: {},
		name: "Wimp Out",
		rating: 1,
		num: 193,
	},
	windpower: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (move.flags['wind']) {
				target.addVolatile('charge');
			}
		},
		onSideConditionStart(side, source, sideCondition) {
			const pokemon = this.effectState.target;
			if (sideCondition.id === 'tailwind') {
				pokemon.addVolatile('charge');
			}
		},
		flags: {},
		name: "Wind Power",
		rating: 1,
		num: 277,
	},
	windrider: {
		onStart(pokemon) {
			if (pokemon.side.sideConditions['tailwind']) {
				this.boost({ atk: 1 }, pokemon, pokemon);
			}
		},
		onTryHit(target, source, move) {
			if (target !== source && move.flags['wind']) {
				if (!this.boost({ atk: 1 }, target, target)) {
					this.add('-immune', target, '[from] ability: Wind Rider');
				}
				return null;
			}
		},
		onSideConditionStart(side, source, sideCondition) {
			const pokemon = this.effectState.target;
			if (sideCondition.id === 'tailwind') {
				this.boost({ atk: 1 }, pokemon, pokemon);
			}
		},
		flags: { breakable: 1 },
		name: "Wind Rider",
		rating: 3.5,
		// We do not want Brambleghast to get Infiltrator in Randbats
		num: 274,
	},
	wonderguard: {
		onTryHit(target, source, move) {
			if (target === source || move.category === 'Status' || move.id === 'struggle') return;
			if (move.id === 'skydrop' && !source.volatiles['skydrop']) return;
			this.debug('Wonder Guard immunity: ' + move.id);
			if (target.runEffectiveness(move) <= 0 || !target.runImmunity(move)) {
				if (move.smartTarget) {
					move.smartTarget = false;
				} else {
					this.add('-immune', target, '[from] ability: Wonder Guard');
				}
				return null;
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, failskillswap: 1, breakable: 1 },
		name: "Wonder Guard",
		rating: 5,
		num: 25,
	},
	wonderskin: {
		onModifyAccuracyPriority: 10,
		onModifyAccuracy(accuracy, target, source, move) {
			if (move.category === 'Status' && typeof accuracy === 'number') {
				this.debug('Wonder Skin - setting accuracy to 50');
				return 50;
			}
		},
		flags: { breakable: 1 },
		name: "Wonder Skin",
		rating: 2,
		num: 147,
	},
	zenmode: {
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Darmanitan' || pokemon.transformed) {
				return;
			}
			if (pokemon.hp <= pokemon.maxhp / 2 && !['Zen', 'Galar-Zen'].includes(pokemon.species.forme)) {
				pokemon.addVolatile('zenmode');
			} else if (pokemon.hp > pokemon.maxhp / 2 && ['Zen', 'Galar-Zen'].includes(pokemon.species.forme)) {
				pokemon.addVolatile('zenmode'); // in case of base Darmanitan-Zen
				pokemon.removeVolatile('zenmode');
			}
		},
		onEnd(pokemon) {
			if (!pokemon.volatiles['zenmode'] || !pokemon.hp) return;
			pokemon.transformed = false;
			delete pokemon.volatiles['zenmode'];
			if (pokemon.species.baseSpecies === 'Darmanitan' && pokemon.species.battleOnly) {
				pokemon.formeChange(pokemon.species.battleOnly as string, this.effect, false, '0', '[silent]');
			}
		},
		condition: {
			onStart(pokemon) {
				if (!pokemon.species.name.includes('Galar')) {
					if (pokemon.species.id !== 'darmanitanzen') pokemon.formeChange('Darmanitan-Zen');
				} else {
					if (pokemon.species.id !== 'darmanitangalarzen') pokemon.formeChange('Darmanitan-Galar-Zen');
				}
			},
			onEnd(pokemon) {
				if (['Zen', 'Galar-Zen'].includes(pokemon.species.forme)) {
					pokemon.formeChange(pokemon.species.battleOnly as string);
				}
			},
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Zen Mode",
		rating: 0,
		num: 161,
	},
	zerotohero: {
		onSwitchOut(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Palafin') return;
			if (pokemon.species.forme !== 'Hero') {
				pokemon.formeChange('Palafin-Hero', this.effect, true);
				pokemon.heroMessageDisplayed = false;
			}
		},
		onSwitchIn(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Palafin') return;
			if (!pokemon.heroMessageDisplayed && pokemon.species.forme === 'Hero') {
				this.add('-activate', pokemon, 'ability: Zero to Hero');
				pokemon.heroMessageDisplayed = true;
			}
		},
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1, notransform: 1 },
		name: "Zero to Hero",
		rating: 5,
		num: 278,
	},

	// CAP
	mountaineer: {
		onDamage(damage, target, source, effect) {
			if (effect && effect.id === 'stealthrock') {
				return false;
			}
		},
		onTryHit(target, source, move) {
			if (move.type === 'Rock' && !target.activeTurns) {
				this.add('-immune', target, '[from] ability: Mountaineer');
				return null;
			}
		},
		isNonstandard: "CAP",
		flags: { breakable: 1 },
		name: "Mountaineer",
		rating: 3,
		num: -1,
	},
	rebound: {
		isNonstandard: "CAP",
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (this.effectState.target.activeTurns) return;

			if (target === source || move.hasBounced || !move.flags['reflectable'] || target.isSemiInvulnerable()) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, target, { target: source });
			return null;
		},
		onAllyTryHitSide(target, source, move) {
			if (this.effectState.target.activeTurns) return;

			if (target.isAlly(source) || move.hasBounced || !move.flags['reflectable'] || target.isSemiInvulnerable()) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, this.effectState.target, { target: source });
			move.hasBounced = true; // only bounce once in free-for-all battles
			return null;
		},
		flags: { breakable: 1 },
		name: "Rebound",
		rating: 3,
		num: -2,
	},
	persistent: {
		isNonstandard: "CAP",
		// implemented in the corresponding move
		flags: {},
		name: "Persistent",
		rating: 3,
		num: -3,
	},

	// abilidades migradas--------------------------------------------------------------------------------------------------------------------

	whiteout: {
		onModifyDamage(spa, pokemon, target, move) {
			if (
				["hail", "snow"].includes(pokemon.effectiveWeather()) &&
				move.type === "Ice"
			) {
				return this.chainModify(1.5);
			}
		},
		name: "Whiteout",
		rating: 3,
		num: 299,
		gen: 8,
	},
	pyromancy: {
		onModifyMovePriority: -2,
		onModifyMove(move) {
			if (move.secondaries) {
				this.debug("quintupling burn chance");
				for (const secondary of move.secondaries) {
					if (secondary.status?.includes("brn") && secondary.chance && !secondary.ability) { secondary.chance *= 5; }
				}
			}
		},
		name: "Pyromancy",
		rating: 3.5,
		num: 300,
		gen: 8,
	},
	keenedge: {
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["slicing"]) {
				return this.chainModify([5325, 4096]);
			}
		},
		name: "Keen Edge",
		rating: 3.5,
		num: 301,
		gen: 8,
	},
	prismscales: {
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category === "Special") {
				return this.chainModify(0.7);
			}
		},
		name: "Prism Scales",
		rating: 4,
		num: 302,
		gen: 8,
	},
	powerfists: {
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["punch"]) {
				this.debug("Powerfists power boost");
				return this.chainModify([5325, 4096]);
			}
		},
		onModifyMove(move) {
			if (move.flags["punch"]) {
				move.overrideDefensiveStat = "spd";
			}
		},
		name: "Power Fists",
		rating: 3.5,
		num: 303,
		gen: 8,
	},
	sandsong: {
		onModifyTypePriority: -2,
		onModifyType(move, pokemon) {
			if (move.flags["sound"] && move.type === "Normal" && !pokemon.volatiles["dynamax"]) {
				// hardcode
				move.type = "Ground";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["sound"] && move.typeChangerBoosted) {
				return this.chainModify(1.2);
			}
		},
		name: "Sand Song",
		rating: 1.5,
		num: 306,
		gen: 8,
	},
	rampage: {
		onAfterMove(source, target, move) {
			if (target && target.hp <= 0) {
				if (source.volatiles["mustrecharge"]) {
					source.removeVolatile("mustrecharge");
				}
			}
		},
		name: "Rampage",
		rating: 2,
		num: 307,
		gen: 8,
	},
	vengeance: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move && move.type === "Ghost") {
				if (attacker.hp <= attacker.maxhp / 3) {
					this.debug("Full Vengeance boost");
					return this.chainModify(1.5);
				} else {
					this.debug("Lite Vengeance boost");
					return this.chainModify(1.2);
				}
			}
		},
		name: "Vengeance",
		rating: 2,
		num: 308,
		gen: 8,
	},
	blitzboxer: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move.flags["punch"] && pokemon.hp === pokemon.maxhp) { return priority + 1; }
		},
		name: "Blitz Boxer",
		rating: 4,
		num: 309,
		gen: 8,
	},

	// Elite Redux Abilities
	antarcticbird: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Ice" || move.type === "Flying") {
				this.debug("Antarctic Bird boost");
				return this.chainModify([5325, 4096]);
			}
		},
		name: "Antarctic Bird",
		rating: 3,
		num: 310,
		gen: 8,
	},
	immolate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Fire";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		name: "Immolate",
		rating: 4,
		num: 311,
		gen: 8,
	},
	crystallize: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Rock" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Ice";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		name: "Crystallize",
		rating: 4,
		num: 312,
		gen: 8,
	},
	electrocytes: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Electric") {
				this.debug("Electrocytes boost");
				return this.chainModify(1.25);
			}
		},
		name: "Electrocytes",
		rating: 3,
		num: 313,
		gen: 8,
	},
	aerodynamics: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === "Flying") {
				if (!this.boost({spe: 1})) {
					this.add("-immune", target, "[from] ability: Aerodynamics");
				}
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Aerodynamics",
		rating: 3,
		num: 312,
		gen: 8,
	},
	christmasspirit: {
		onSourceModifyDamage(spa, pokemon) {
			if (["hail", "snow"].includes(pokemon.effectiveWeather())) {
				return this.chainModify(2);
			}
		},
		flags: { breakable: 1 },
		name: "Christmas Spirit",
		rating: 4,
		num: 314,
		gen: 8,
	},
	exploitweakness: {
		onModifyDamage(basePower, attacker, defender, move) {
			if (defender.status) {
				return this.chainModify(1.25);
			}
		},
		name: "Exploit Weakness",
		rating: 2,
		num: 315,
		gen: 8,
	},
	groundshock: {
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
		name: "Ground Shock",
		rating: 3,
		num: 315,
		gen: 8,
	},
	ancientidol: {
		onModifyMove(move) {
			if (move.category === "Physical") {
				move.overrideOffensiveStat = "def";
			}
			if (move.category === "Special") {
				move.overrideOffensiveStat = "spd";
			}
		},
		name: "Ancient Idol",
		rating: 3,
		num: 316,
		gen: 8,
	},
	mysticpower: {
		onModifyMove(move) {
			move.forceSTAB = true;
		},
		name: "Mystic Power",
		rating: 4.5,
		num: 317,
		gen: 8,
	},
	perfectionist: {
		onModifyMovePriority: -5,
		onModifyCritRatio(critRatio, source, target, move) {
			if (move.category === "Status") return;
			if (move.basePower <= 50) return critRatio + 1;
		},
		onModifyPriority(priority, pokemon, target, move) {
			if (move.category === "Status") return;
			if (move.basePower <= 25) return priority + 1;
		},
		name: "Perfectionist",
		rating: 3.5,
		num: 318,
		gen: 8,
	},
	growingtooth: {
		onAfterMove(attacker, defender, move) {
			if (move.flags["bite"]) {
				this.boost({atk: 1}, attacker);
			}
		},
		name: "Growing Tooth",
		rating: 4,
		num: 319,
		gen: 8,
	},
	inflatable: {
		onTryHit(target, source, move) {
			if (
				target !== source &&
				(move.type === "Flying" || move.type === "Fire")
			) {
				if (!this.boost({def: 1, spd: 1})) {
					this.add("-immune", target, "[from] ability: Inflatable");
					return null;
				}
			}
		},
		flags: { breakable: 1 },
		name: "Inflatable",
		rating: 3,
		num: 320,
		gen: 8,
	},
	auroraborealis: {
		onModifyMove(move) {
			if (move.type === "Ice") {
				move.forceSTAB = true;
			}
		},
		name: "Aurora Borealis",
		rating: 3,
		num: 321,
		gen: 8,
	},
	avenger: {
		onModifyDamage(atk, attacker, defender, move) {
			if (attacker.side.faintedLastTurn) {
				this.debug("Avenger boost");
				return this.chainModify(1.5);
			}
		},
		name: "Avenger",
		rating: 3,
		num: 322,
		gen: 8,
	},
	/**
	 * Looks correct according to elite redux dex.
	 */
	letsroll: {
		onStart(pokemon) {
			this.boost({def: 1}, pokemon);
		},
		name: "Lets Roll",
		rating: 3.5,
		num: 323,
		gen: 8,
	},
	aquatic: {
		onStart(pokemon) {
			if (!pokemon.types.includes("Water")) {
				if (!pokemon.addType("Water")) return;
				this.add(
					"-start",
					pokemon,
					"typeadd",
					"Water",
					"[from] ability: Aquatic"
				);
			}
		},
		name: "Aquatic",
		rating: 3.5,
		num: 324,
		gen: 8,
	},
	loudbang: {
		onModifyMove(move, attacker, defender) {
			if (move.category !== "Status" && move.flags["sound"]) {
				if (!move.secondaries) move.secondaries = [];
				move.secondaries.push({
					chance: 50,
					volatileStatus: "confusion",
					ability: this.dex.abilities.get("loudbang"),
				});
			}
		},
		name: "Loud Bang",
		rating: 2,
		num: 325,
		gen: 8,
	},
	leadcoat: {
		onModifySpe(def, pokemon) {
			this.chainModify(0.9);
		},
		onSourceModifyDamage(spe, pokemon, target, move) {
			if (move.category === 'Physical') this.chainModify(0.6);
		},
		flags: { breakable: 1 },
		name: "Lead Coat",
		rating: 3.5,
		num: 326,
		gen: 8,
	},
	coilup: {
		onStart(pokemon) {
			pokemon.addVolatile('coilup');
		},
		condition: {
			onStart(pokemon) {
				this.add("-activate", pokemon, "Coil Up");
			},
			onModifyPriority(priority, source, target, move) {
				if (move.flags["bite"]) {
					return priority + 1;
				}
			},
			onAfterMove(attacker, defender, move) {
				if ((attacker as any).usedExtraMove) return;
				if (move.flags["bite"]) {
					attacker.removeVolatile('coilup');
				}
			},
		},
		name: "Coil Up",
		rating: 3.5,
		num: 327,
		gen: 8,
	},
	amphibious: {
		onModifyMove(move) {
			if (move.type === "Water") {
				move.forceSTAB = true;
			}
		},
		name: "Amphibious",
		rating: 3,
		num: 328,
		gen: 8,
	},
	grounded: {
		onStart(pokemon) {
			if (!pokemon.types.includes("Ground")) {
				if (!pokemon.addType("Ground")) return;
				this.add(
					"-start",
					pokemon,
					"typeadd",
					"Ground",
					"[from] ability: Grounded"
				);
			}
		},
		name: "Grounded",
		rating: 3.5,
		num: 329,
		gen: 8,
	},
	earthbound: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Ground") {
				this.debug("Earthbound boost");
				return this.chainModify(1.25);
			}
		},
		name: "Earthbound",
		rating: 3,
		num: 330,
		gen: 8,
	},
	fightingspirit: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Fighting";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		name: "Fighting Spirit",
		rating: 4,
		num: 331,
		gen: 8,
	},
	felineprowess: {
		onModifySpAPriority: 5,
		onModifySpA(spa) {
			return this.chainModify(2);
		},
		name: "Feline Prowess",
		rating: 5,
		num: 332,
		gen: 8,
	},
	fossilized: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Rock") {
				this.debug("Fossilized boost");
				return this.chainModify(1.2);
			}
		},
		onSourceModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Rock") {
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Fossilized",
		rating: 3,
		num: 333,
		gen: 8,
	},
	magicaldust: {
		onDamagingHit(damage, target, source, move) {
			if (!source.types.includes("Psychic")) {
				if (!source.addType("Psychic")) return;
				this.add(
					"-start",
					source,
					"typeadd",
					"Psychic",
					"[from] ability: Magical Dust"
				);
			}
		},
		name: "Magical Dust",
		rating: 3,
		num: 334,
		gen: 8,
	},
	dreamcatcher: {
		onModifyDamage(bp, source, target, move) {
			for (const foe of source.foes()) {
				if (foe.status === "slp") {
					return this.chainModify(2);
				}
			}
			for (const ally of source.alliesAndSelf()) {
				if (ally.status === "slp") {
					return this.chainModify(2);
				}
			}
		},
		name: "Dreamcatcher",
		rating: 3,
		num: 335,
	},
	nocturnal: {
		onSourceModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Dark" || move.type === "Fairy") {
				return this.chainModify(0.75);
			}
		},
		onModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Dark") {
				return this.chainModify(1.25);
			}
		},
		flags: { breakable: 1 },
		name: "Nocturnal",
		rating: 4,
		num: 336,
		gen: 8,
	},
	selfsufficient: {
		onResidualOrder: 29,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			this.heal(pokemon.baseMaxhp / 16);
		},
		name: "Self Sufficient",
		rating: 4,
		num: 337,
		gen: 8,
	},
	tectonize: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Ground";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		name: "Tectonize",
		rating: 4,
		num: 338,
		gen: 8,
	},
	iceage: {
		onStart(pokemon) {
			if (!pokemon.types.includes("Ice")) {
				if (!pokemon.addType("Ice")) return;
				this.add(
					"-start",
					pokemon,
					"typeadd",
					"Ice",
					"[from] ability: Ice Age"
				);
			}
		},
		name: "Ice Age",
		rating: 3.5,
		num: 339,
		gen: 8,
	},
	halfdrake: {
		onStart(pokemon) {
			if (!pokemon.types.includes("Dragon")) {
				if (!pokemon.addType("Dragon")) return;
				this.add(
					"-start",
					pokemon,
					"typeadd",
					"Dragon",
					"[from] ability: Half Drake"
				);
			}
		},
		name: "Half Drake",
		rating: 3.5,
		num: 340,
		gen: 8,
	},
	liquified: {
		onSourceModifyDamage(damage, source, target, move) {
			let mod = 1;
			if (move.type === "Water") mod *= 2;
			if (move.flags["contact"]) mod /= 2;
			return this.chainModify(mod);
		},
		flags: { breakable: 1 },
		name: "Liquified",
		rating: 3.5,
		num: 341,
		gen: 8,
	},
	dragonfly: {
		// airborneness implemented in sim/pokemon.js:Pokemon#isGrounded
		onStart(pokemon) {
			if (!pokemon.types.includes("Dragon")) {
				if (!pokemon.addType("Dragon")) return;
				this.add(
					"-start",
					pokemon,
					"typeadd",
					"Dragon",
					"[from] ability: Dragonfly"
				);
			}
		},
		flags: { breakable: 1 },
		name: "Dragonfly",
		rating: 3.5,
		num: 342,
		gen: 8,
	},
	dragonslayer: {
		onModifyDamage(damage, source, target, move) {
			if (target.getTypes().includes("Dragon")) {
				return this.chainModify(1.5);
			}
		},
		name: "Dragonslayer",
		rating: 2.5,
		num: 343,
		gen: 8,
	},
	hydrate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Water";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		name: "Hydrate",
		rating: 4,
		num: 344,
		gen: 8,
	},
	metallic: {
		onStart(pokemon) {
			if (!pokemon.types.includes("Steel")) {
				if (!pokemon.addType("Steel")) return;
				this.add(
					"-start",
					pokemon,
					"typeadd",
					"Steel",
					"[from] ability: Metallic"
				);
			}
		},
		name: "Metallic",
		rating: 3.5,
		num: 345,
		gen: 8,
	},
	permafrost: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug("Permafrost neutralize");
				return this.chainModify(0.65);
			}
		},
		flags: { breakable: 1 },
		name: "Permafrost",
		rating: 3,
		num: 346,
		gen: 8,
	},
	primalarmor: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug("Primal Armor neutralize");
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Primal Armor",
		rating: 4,
		num: 347,
		gen: 8,
	},
	ragingboxer: {
		// Uses parentalBond as base.
		onPrepareHit(source, target, move) {
			if (isParentalBondBanned(move, source)) { return; }
			if ((move.flags as Record<string, number | undefined>)["punch"]) {
				move.multihit = 2;
				(move as { multihitType?: string }).multihitType = "boxer";
			}
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			console.log(move.hit, move.secondaries);
			if ((move as { multihitType?: string }).multihitType !== "boxer") return;
			if (!secondaries) return;
			if (move.hit <= 1) return;
			secondaries = secondaries.filter((effect) => effect.volatileStatus !== "flinch" || effect.ability || effect.kingsrock);
			return secondaries;
		},
		name: "Raging Boxer",
		rating: 4.5,
		num: 348,
		gen: 8,
	},
	airblower: {
		onStart(source) {
			// duration handled in data/moves.js:tailind
			const tailwind = source.side.sideConditions["tailwind"];
			if (!tailwind) {
				this.add("-activate", source, "ability: Air Blower");
				source.side.addSideCondition(
					"tailwind",
					source,
					source.getAbility()
				);
			}
		},
		name: "Air Blower",
		rating: 5,
		num: 349,
		gen: 8,
	},
	juggernaut: {
		onModifyAtkPriority: 11,
		onModifyMove(move) {
			if (move.flags["contact"]) (move as { secondaryOffensiveStats?: [string, number][] }).secondaryOffensiveStats = [["def", 0.2]];
		},
		onUpdate(pokemon) {
			if (pokemon.status === "par") {
				this.add("-activate", pokemon, "ability: Juggernaut");
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== "par") return;
			if ((effect as Move)?.status) {
				this.add("-immune", target, "[from] ability: Juggernaut");
			}
			return false;
		},
		flags: { breakable: 1 },
		name: "Juggernaut",
		rating: 3.5,
		num: 350,
		gen: 8,
	},
	// Heatproof + Juggernaut (custom)
	irongiant: {
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('Iron Giant Heatproof Atk weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('Iron Giant Heatproof SpA weaken');
				return this.chainModify(0.5);
			}
		},
		onDamage(damage, target, source, effect) {
			if (effect && effect.id === 'brn') {
				return damage / 2;
			}
		},
		onModifyAtkPriority: 11,
		onModifyMove(move) {
			if (move.flags['contact']) (move as { secondaryOffensiveStats?: [string, number][] }).secondaryOffensiveStats = [['def', 0.2]];
		},
		onUpdate(pokemon) {
			if (pokemon.status === 'par') {
				this.add('-activate', pokemon, 'ability: Iron Giant');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'par') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Iron Giant');
			}
			return false;
		},
		flags: { breakable: 1 },
		name: "Iron Giant",
		rating: 4,
		num: 462,
		gen: 9,
	},
	// +15% da Velocidade somada à Defesa/SpD no cálculo de dano recebido
	sleekscales: {
		onModifyDefPriority: 6,
		onModifyDef(def, pokemon) {
			const spe = pokemon.getStat('spe', false, false);
			const bonus = Math.floor(spe * 15 / 100);
			return def + bonus;
		},
		onModifySpDPriority: 6,
		onModifySpD(spd, pokemon) {
			const spe = pokemon.getStat('spe', false, false);
			const bonus = Math.floor(spe * 15 / 100);
			return spd + bonus;
		},
		flags: { breakable: 1 },
		name: "Sleek Scales",
		rating: 3.5,
		num: 463,
		gen: 9,
	},
	// Fim do turno: 1/8 do max HP em dano a quem não é Ice; 1/8 de cura em tipos Ice (estilo Toxic Spill + Ice Body)
	winterthrone: {
		onResidualOrder: 28,
		onResidual(pokemon) {
			if (!pokemon.hp) return;
			for (const target of [...pokemon.foes(), ...pokemon.alliesAndSelf()]) {
				if (!target?.hp) continue;
				if (target.hasType('Ice')) {
					this.heal(target.baseMaxhp / 8, target, pokemon, pokemon.getAbility());
				} else {
					this.damage(target.baseMaxhp / 8, target, pokemon);
				}
			}
		},
		flags: {},
		name: "Winter Throne",
		rating: 4,
		num: 464,
		gen: 9,
	},
	// Speed no divisor do dano: Elude = sem contacto; Blur = com contacto (via onFoeModifyMove do defensor)
	elude: {
		onFoeModifyMovePriority: 100,
		onFoeModifyMove(move, attacker, defender) {
			if (move.category === 'Status') return;
			if (!defender) return;
			if (!this.checkMoveMakesContact(move, attacker, defender)) {
				move.overrideDefensiveStat = 'spe';
			}
		},
		flags: { breakable: 1 },
		name: "Elude",
		rating: 3.5,
		num: 466,
		gen: 9,
	},
	blur: {
		onFoeModifyMovePriority: 100,
		onFoeModifyMove(move, attacker, defender) {
			if (move.category === 'Status') return;
			if (!defender) return;
			if (this.checkMoveMakesContact(move, attacker, defender)) {
				move.overrideDefensiveStat = 'spe';
			}
		},
		flags: { breakable: 1 },
		name: "Blur",
		rating: 3.5,
		num: 467,
		gen: 9,
	},
	// Mesmo clima do move Eerie Fog (fichas custom)
	lowvisibility: {
		onStart(source) {
			if (this.suppressingAbility(source)) return;
			this.add('-activate', source, 'ability: Low Visibility');
			this.field.setWeather('eeriefog', source, source.getAbility());
		},
		flags: {},
		name: "Low Visibility",
		rating: 3.5,
		num: 468,
		gen: 9,
	},
	// Ao entrar, aplica Yawn nos oponentes adjacentes (como o move)
	dreamwhimsy: {
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Dream Whimsy');
			for (const target of pokemon.adjacentFoes()) {
				this.actions.useMove('yawn', pokemon, { target, sourceEffect: pokemon.getAbility() });
			}
		},
		flags: {},
		name: "Dream Whimsy",
		rating: 3.5,
		num: 469,
		gen: 9,
	},
	shortcircuit: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move && move.type === "Electric") {
				if (attacker.hp <= attacker.maxhp / 3) {
					this.debug("Full Short Circuit boost");
					return this.chainModify(1.5);
				} else {
					this.debug("Full Short Circuit boost");
					return this.chainModify(1.2);
				}
			}
		},
		name: "Short Circuit",
		rating: 3,
		num: 351,
		gen: 8,
	},
	majesticbird: {
		onModifySpA(atk, attacker, defender, move) {
			return this.chainModify(1.5);
		},
		name: "Majestic Bird",
		rating: 4.5,
		num: 352,
		gen: 8,
	},
	phantom: {
		onStart(pokemon) {
			if (!pokemon.types.includes("Ghost")) {
				if (!pokemon.addType("Ghost")) return;
				this.add(
					"-start",
					pokemon,
					"typeadd",
					"Ghost",
					"[from] ability: Phantom"
				);
			}
		},
		name: "Phantom",
		rating: 3.5,
		num: 353,
		gen: 8,
	},
	intoxicate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Poison";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		name: "Intoxicate",
		rating: 4,
		num: 354,
		gen: 8,
	},
	impenetrable: {
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== "Move") {
				if (effect.effectType === "Ability") { this.add("-activate", source, "ability: " + effect.name); }
				return false;
			}
		},
		name: "Impenetrable",
		rating: 4,
		num: 355,
		gen: 8,
	},
	hypnotist: {
		onModifyMovePriority: -10,
		onModifyMove(move, pokemon, target) {
			if (move.id === "hypnosis") {
				move.accuracy = 90;
			}
		},
		name: "Hypnotist",
		rating: 4,
		num: 356,
		gen: 8,
	},
	overwhelm: {
		onModifyMovePriority: -5,
		onModifyMove(move, attacker, defender) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity["Dragon"] = true;
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === "Intimidate" && boost.atk) {
				delete boost.atk;
				this.add(
					"-fail",
					target,
					"unboost",
					"Attack",
					"[from] ability: Overwhelm",
					"[of] " + target
				);
			}
			if (effect.name === "Scare" && boost.spa) {
				delete boost.spa;
				this.add(
					"-fail",
					target,
					"unboost",
					"Special Attack",
					"[from] ability: Overwhelm",
					"[of] " + target
				);
			}
		},
		name: "Overwhelm",
		rating: 4,
		num: 357,
		gen: 8,
	},
	scare: {
		onStart(pokemon) {
			let activated = false;
			for (const target of pokemon.adjacentFoes()) {
				if (!activated) {
					this.add("-ability", pokemon, "Scare", "boost");
					activated = true;
				}
				if (target.volatiles["substitute"]) {
					this.add("-immune", target);
				} else {
					this.boost({spa: -1}, target, pokemon, null, true);
				}
			}
		},
		name: "Scare",
		rating: 3.5,
		num: 358,
		gen: 8,
	},
	majesticmoth: {
		onStart(pokemon) {
			const bestStat = pokemon.getBestStat(true, true);
			this.boost({[bestStat]: 1}, pokemon);
		},
		name: "Majestic Moth",
		rating: 4.5,
		num: 359,
		gen: 8,
	},
	souleater: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === "Move") {
				this.add("-activate", source, "Soul Eater");
				source.heal(source.baseMaxhp / 4);
				this.add("-heal", source, source.getHealth, "[silent]");
			}
		},
		name: "Soul Eater",
		rating: 3,
		num: 360,
		gen: 8,
	},
	soullinker: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (target.hp > 0) this.damage(damage, source, target);
		},
		onFoeDamagingHit(damage, target, source, move) {
			if (target.hp > 0) this.damage(damage, source, target);
		},
		name: "Soul Linker",
		rating: 4,
		num: 360,
		gen: 8,
	},
	sweetdreams: {
		onResidualOrder: 30,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.status === "slp" || pokemon.hasAbility("comatose")) {
				this.heal(pokemon.baseMaxhp / 16);
			}
		},
		name: "Sweet Dreams",
		rating: 2,
		num: 361,
		gen: 8,
	},
	badluck: {
		onModifyAccuracy(accuracy, target, source, move) {
			if (typeof accuracy === "number") {
				return this.chainModify(0.95);
			}
		},
		onCriticalHit: false,
		// Low damage roll implementation is in battle-actions.ts
		flags: { breakable: 1 },
		name: "Bad Luck",
		rating: 2,
		num: 362,
		gen: 8,
	},
	hauntedspirit: {
		onDamagingHitOrder: 2,
		onDamagingHit(damage, target, source, move) {
			if (!target.hp && !source.getVolatile("curse")) {
				this.add("-activate", target, "Haunted Spirit");
				source.addVolatile("curse");
			}
		},
		name: "Haunted Spirit",
		rating: 3,
		num: 363,
		gen: 8,
	},
	electricburst: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Electric") {
				this.debug("Electric Burst boost");
				return this.chainModify([5529, 4096]); // ~35% boost
			}
		},

		onAfterMoveSecondaryPriority: -1,
		onAfterMoveSecondarySelf(source, target, move) {
			if (
				source &&
				source !== target &&
				move &&
				move.type === "Electric" &&
				!source.forceSwitchFlag &&
				move.totalDamage
			) {
				const ebRecoilDamage = this.clampIntRange(
					Math.round(move.totalDamage * 0.1),
					1
				);
				this.add("-activate", source, "Electric Burst");
				this.damage(ebRecoilDamage, source, source, "recoil");
			}
		},
		name: "Electric Burst",
		rating: 3,
		num: 364,
		gen: 8,
	},
	rawwood: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Grass") {
				this.debug("Raw Wood boost");
				return this.chainModify(1.2);
			}
		},
		onSourceModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Grass") {
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Raw Wood",
		rating: 3,
		num: 365,
		gen: 8,
	},
	solenoglyphs: {
		onModifyMove(move, attacker, defender) {
			if (move.category !== "Status" && move.flags["bite"]) {
				if (!move.secondaries) move.secondaries = [];
				move.secondaries.push({
					chance: 50,
					status: "tox",
					ability: this.dex.abilities.get("solenoglyphs"),
				});
			}
		},
		name: "Solenoglyphs",
		rating: 3.5,
		num: 366,
		gen: 8,
	},
	spiderlair: {
		onStart(source) {
			// duration handled in data/moves.js:stickyweb
			const hasWebs = source.side.foe.sideConditions["stickyweb"];
			if (!hasWebs) {
				// I don't think Spider Lair checks for Magic Bounce, so I get away with addSideCondition here (maybe???)
				this.add("-activate", source, "ability: Spider Lair");
				source.side.foe.addSideCondition(
					"stickyweb",
					source,
					source.getAbility()
				);
			}
		},
		name: "Spider Lair",
		rating: 4.5,
		num: 900,
		gen: 8,
	},
	fatalprecision: {
		onBeforeMove(source, target, move) {
			// uses onBeforeMove to account for switch-ins
			if (target) {
				if (target.runEffectiveness(move) > 0) {
					this.debug("Fatal Precision accuracy boost");
					move.accuracy = true;
				}
			}
		},
		onModifyDamage(damage, source, target, move) {
			if (target.runEffectiveness(move) > 0) {
				this.debug("Fatal Precision damage boost");
				return this.chainModify(1.2);
			}
		},
		name: "Fatal Precision",
		rating: 3,
		num: 368,
		gen: 8,
	},
	fortknox: {
		onAfterEachBoost(boost, target, source, effect) {
			if (!source || target.isAlly(source)) {
				if (effect.id === "stickyweb") {
					this.hint(
						"Court Change Sticky Web counts as lowering your own Speed, and Fort Knox only affects stats lowered by foes.",
						true,
						source.side
					);
				}
				return;
			}
			let statsLowered = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					statsLowered = true;
				}
			}
			if (statsLowered) {
				this.boost({def: 3}, target, target, null, false, true);
			}
		},
		name: "Fort Knox",
		rating: 3,
		num: 369,
		gen: 8,
	},
	seaweed: {
		onModifyDamage(damage, source, target, move) {
			if (move.type === "Grass" && target.hasType("Fire")) {
				this.debug("Seaweed boost");
				return this.chainModify(2);
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.type === "Fire" && source.hasType("Grass")) {
				this.debug("Seaweed neutralize");
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
		name: "Seaweed",
		rating: 3,
		num: 370,
		gen: 8,
	},
	psychicmind: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move && move.type === "Psychic") {
				if (attacker.hp <= attacker.maxhp / 3) {
					this.debug("Psychic Mind boost");
					return this.chainModify(1.5);
				} else {
					this.debug("Psychic Mind boost");
					return this.chainModify(1.2);
				}
			}
		},
		name: "Psychic Mind",
		rating: 3.5,
		num: 371,
		gen: 8,
	},
	poisonabsorb: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === "Poison") {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add("-immune", target, "[from] ability: Poison Absorb");
				}
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Poison Absorb",
		rating: 3.5,
		num: 372,
		gen: 8,
	},
	scavenger: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === "Move") {
				this.add("-activate", source, "Scavenger");
				source.heal(source.baseMaxhp / 4);
				this.add("-heal", source, source.getHealth, "[silent]");
			}
		},
		name: "Scavenger",
		rating: 3,
		num: 360,
		gen: 8,
	},
	/**
	 * Trick room needs to only last 3 turns from this ability.
	 */
	twistdimension: {
		onStart(source) {
			if (this.field.getPseudoWeather("trickroom")) return;
			this.add("-activate", source, "ability: Twist. Dimension");
			// / Only activate trick room if it doesn't already exist, to prevent reverting an active one.
			this.field.addPseudoWeather("trickroom", source, source.getAbility());
		},
		name: "Twist. Dimension",
		rating: 5,
		num: 361,
		gen: 8,
	},
	multiheaded: {
		onPrepareHit(source, target, move) {
			if (isParentalBondBanned(move, source)) { return; }
			const twoHeaded = [
				"doduo",
				"weezing",
				"girafarig",
				"mawile",
				"zweilous",
				"doublade",
				"binacle",
				"vanilluxe",
				"zweilous",
				"scovillain",
				"mawileredux",
				"zweilousredux",
				"doduoredux",
				"weezinggalar",
				"klink",
				"doubladeredux",
			];
			const threeHeaded = [
				"dugtrio",
				"dugtrioalola",
				"magneton",
				"dodrio",
				"exeggute",
				"exeggutor",
				"exeggutoralola",
				"mawilemega",
				"combee",
				"magnezone",
				"barbaracle",
				"hydreigon",
				"wugtrio",
				"dodrioredux",
				"hydreigonredux",
				"ironjugulis",
				"sandyshocks",
				"mawilemegaredux",
				"shucklemega",
				"magnezonemega",
				"barbaracle",
				"klinklang",
				"probopass",
				"klang",
				"hydrapple",
			];
			if (twoHeaded.includes(source.species.id)) {
				move.multihit = 2;
				move.multihitType = "parentalbond";
			}
			if (threeHeaded.includes(source.species.id)) {
				move.multihit = 3;
				(move as { multihitType?: string }).multihitType = "headed";
			}
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			console.log(move.hit, move.secondaries);
			const mht = (move as { multihitType?: string }).multihitType;
			if (mht !== "headed" && mht !== "parentalbond") return;
			if (!secondaries) return;
			if (move.hit <= 1) return;
			secondaries = secondaries.filter((effect) => effect.volatileStatus !== "flinch" || effect.ability || effect.kingsrock);
			return secondaries;
		},
		name: "Multi Headed",
		rating: 4.5,
		num: 362,
		gen: 8,
	},
	northwind: {
		onStart(source) {
			// duration handled in data/moves.js:tailind
			const veil = source.side.sideConditions["auroraveil"];
			if (!veil) {
				this.add("-activate", source, "ability: North Wind");
				source.side.addSideCondition(
					"auroraveil",
					source,
					this.dex.abilities.get("northwind")
				);
			}
		},
		name: "North Wind",
		rating: 5,
		num: 363,
		gen: 8,
	},
	overcharge: {
		onModifyMove(move) {
			const baseEffectiveness = move.onEffectiveness;
			move.onEffectiveness = (effectiveness, target, type, usedMove) => {
				if (usedMove.type === 'Electric' && type === 'Electric') return 1;
				return baseEffectiveness?.apply(this, [effectiveness, target, type, usedMove]);
			};
		},
		// Electric type paralysis implemented in sim/pokemon.js:setStatus
		name: "Overcharge",
		rating: 3,
		num: 364,
		gen: 8,
	},
	violentrush: {
		onStart(pkmn) {
			pkmn.addVolatile("violentrush");
		},
		condition: {
			duration: 1,
			onModifyAtk(atk, source, target, move) {
				return this.chainModify(1.2);
			},
			onModifySpe(spe, source) {
				return this.chainModify(1.5);
			},
		},
		name: "Violent Rush",
		rating: 3.5,
		num: 365,
		gen: 8,
	},
	flamingsoul: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.type === "Fire" && pokemon.hp === pokemon.maxhp) { return priority + 1; }
		},
		name: "Flaming Soul",
		rating: 1.5,
		num: 366,
		gen: 8,
	},
	sagepower: {
		onStart(pokemon) {
			pokemon.abilityState.choiceLock = "";
		},
		onBeforeMove(pokemon, target, move) {
			if (move.isZOrMaxPowered || move.id === "struggle") return;
			if (
				pokemon.abilityState.choiceLock &&
				pokemon.abilityState.choiceLock !== move.id
			) {
				// Fails unless ability is being ignored (these events will not run), no PP lost.
				this.addMove("move", pokemon, move.name);
				this.attrLastMove("[still]");
				this.debug("Disabled by Sage Power");
				this.add("-fail", pokemon);
				return false;
			}
		},
		onModifyMove(move, pokemon) {
			if (
				pokemon.abilityState.choiceLock ||
				move.isZOrMaxPowered ||
				move.id === "struggle"
			) { return; }
			pokemon.abilityState.choiceLock = move.id;
		},
		onModifyDamage(spa, pokemon, target, move) {
			if (pokemon.volatiles["dynamax"]) return;
			// PLACEHOLDER
			if (move.category !== 'Special') return;
			this.debug("Sage Power Atk Boost");
			return this.chainModify(1.5);
		},
		onDisableMove(pokemon) {
			if (!pokemon.abilityState.choiceLock) return;
			if (pokemon.volatiles["dynamax"]) return;
			for (const moveSlot of pokemon.moveSlots) {
				if (moveSlot.id !== pokemon.abilityState.choiceLock) {
					pokemon.disableMove(
						moveSlot.id,
						false,
						this.effectState.sourceEffect
					);
				}
			}
		},
		onEnd(pokemon) {
			pokemon.abilityState.choiceLock = "";
		},
		name: "Sage Power",
		rating: 4.5,
		num: 368,
		gen: 8,
	},
	bonezone: {
		onModifyMove(move) {
			if ((move.flags as any)["bone"]) {
				move.ignoreImmunity = true;
				(move as any).onNegateImmunity = () => "levitate";
			}
		},
		onModifyDamage(damage, source, target, move) {
			if ((move.flags as any)["bone"] && target.getMoveHitData(move).typeMod < 0) {
				this.debug("Bone Zone boost");
				return this.chainModify(2);
			}
		},
		name: "Bone Zone",
		rating: 4,
		num: 368,
		gen: 8,
	},
	weathercontrol: {
		onTryHit(target, source, move) {
			if (target !== source && (move.flags as any)["weather"]) {
				this.add("-immune", target, "[from] ability: Weather Control");
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Weather Control",
		rating: 3,
		num: 369,
		gen: 8,
	},
	speedforce: {
		onModifyMove(move) {
			if (move.flags["contact"]) (move as any).secondaryOffensiveStats = [["spe", 0.2]];
		},
		name: "Speed Force",
		rating: 4,
		num: 370,
		gen: 8,
	},
	seaguardian: {
		onStart(pokemon) {
			if (
				["raindance", "primordialsea"].includes(pokemon.effectiveWeather())
			) {
				const bestStat = pokemon.getBestStat(true, true);
				this.boost({[bestStat]: 1}, pokemon);
			}
		},
		name: "Sea Guardian",
		rating: 3.5,
		num: 371,
		gen: 8,
	},
	moltendown: {
		onFoeEffectiveness(typeMod, target, type, move) {
			if (type === "Rock" && move.type === "Fire") {
				return 1;
			}
		},
		name: "Molten Down",
		rating: 3,
		num: 372,
		gen: 8,
	},
	hyperaggressive: {
		onPrepareHit(source, target, move) {
			if (isParentalBondBanned(move, source)) { return; }
			move.multihit = 2;
			move.multihitType = "parentalbond";
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			console.log(move.hit, move.secondaries);
			if (move.multihitType !== "parentalbond") return;
			if (!secondaries) return;
			if (move.hit <= 1) return;
			secondaries = secondaries.filter((effect) => effect.volatileStatus !== "flinch" || effect.ability || effect.kingsrock);
			return secondaries;
		},
		name: "Hyper Aggressive",
		rating: 4.5,
		num: 373,
		gen: 8,
	},
	flock: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move && move.type === "Flying") {
				if (attacker.hp <= attacker.maxhp / 3) {
					this.debug("Flock Circuit boost");
					return this.chainModify(1.5);
				} else {
					this.debug("Flock Circuit boost");
					return this.chainModify(1.2);
				}
			}
		},
		name: "Flock",
		rating: 3,
		num: 374,
		gen: 8,
	},
	fieldexplorer: {
		onModifyDamage(basePower, attacker, defender, move) {
			if ((move.flags as any)["field"]) {
				this.debug("Field Explorer boost");
				return this.chainModify(1.5);
			}
		},
		name: "Field Explorer",
		rating: 3,
		num: 375,
		gen: 8,
	},
	striker: {
		onModifyDamage(basePower, attacker, defender, move) {
			if ((move.flags as any)["kick"]) {
				this.debug("Striker boost");
				return this.chainModify(1.3);
			}
		},
		name: "Striker",
		rating: 3,
		num: 376,
		gen: 8,
	},
	frozensoul: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.type === "Ice" && pokemon.hp === pokemon.maxhp) { return priority + 1; }
		},
		name: "Frozen Soul",
		rating: 1.5,
		num: 377,
		gen: 8,
	},
	predator: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === "Move") {
				this.add("-activate", source, "Predator");
				source.heal(source.baseMaxhp / 4);
				this.add("-heal", source, source.getHealth, "[silent]");
			}
		},
		name: "Predator",
		rating: 3,
		num: 378,
		gen: 8,
	},
	looter: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === "Move") {
				this.add("-activate", source, "Looter");
				source.heal(source.baseMaxhp / 4);
				this.add("-heal", source, source.getHealth, "[silent]");
			}
		},
		name: "Looter",
		rating: 3,
		num: 379,
		gen: 8,
	},
	powercore: {
		onModifyMove(move) {
			if (move.category === 'Physical') (move as any).secondaryOffensiveStats = [['def', 0.2]];
			else if (move.category === 'Special') (move as any).secondaryOffensiveStats = [['spd', 0.2]];
		},
		name: "Power Core",
		rating: 3.5,
		num: 380,
		gen: 8,
	},
	sightingsystem: {
		onModifyMove(move) {
			move.accuracy = true;
		},
		onModifyPriority(priority, source, target, move) {
			if (typeof move.accuracy !== "boolean" && move.accuracy <= 80) {
				return priority - 3;
			}
		},
		name: "Sighting System",
		rating: 3,
		num: 381,
		gen: 8,
	},
	// badcompany: {
	//
	// },
	giantwings: {
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["wind"]) {
				this.debug("Giant Wings boost");
				return this.chainModify(1.25);
			}
		},
		name: "Giant Wings",
		rating: 3,
		num: 384,
		gen: 8,
	},

	grippincer: {
		onAfterMoveSecondarySelf(source, target, move) {
			if (!move || !target || source.switchFlag === true) return;
			if (
				target !== source &&
				move.flags["contact"] &&
				this.randomChance(5, 10)
			) {
				target.addVolatile(
					"partiallytrapped",
					source,
					this.dex.abilities.getByID("grippincer" as ID)
				);
			}
		},
		onModifyMove(move, pokemon, target) {
			if (target?.volatiles["partiallytrapped"]) {
				move.ignoreEvasion = true;
				move.ignoreDefensive = true;
			}
		},
		name: "Grip Pincer",
		rating: 4,
		num: 386,
		gen: 8,
	},
	bigleaves: {
		// Chlorophyll
		onModifySpe(spe, pokemon) {
			if (
				["sunnyday", "desolateland"].includes(pokemon.effectiveWeather())
			) {
				return this.chainModify(1.5);
			}
		},
		// Harvest
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (
				this.field.isWeather(["sunnyday", "desolateland"]) ||
				this.randomChance(1, 2)
			) {
				if (
					pokemon.hp &&
					!pokemon.item &&
					this.dex.items.get(pokemon.lastItem).isBerry
				) {
					pokemon.setItem(pokemon.lastItem);
					pokemon.lastItem = "";
					this.add(
						"-item",
						pokemon,
						pokemon.getItem(),
						"[from] ability: Big Leaves"
					);
				}
			}
		},
		// Solar Power
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			if (
				["sunnyday", "desolateland"].includes(pokemon.effectiveWeather()) &&
					pokemon.getStat("spa", false, true) > pokemon.getStat("atk", false, true)
			) {
				return this.chainModify(1.5);
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk(spa, pokemon) {
			if (
				["sunnyday", "desolateland"].includes(pokemon.effectiveWeather()) &&
					pokemon.getStat("atk", false, true) >= pokemon.getStat("spa", false, true)
			) {
				return this.chainModify(1.5);
			}
		},
		// Leaf Guard
		onSetStatus(status, target, source, effect) {
			if (["sunnyday", "desolateland"].includes(target.effectiveWeather())) {
				if ((effect as Move)?.status) {
					this.add("-immune", target, "[from] ability: Big Leaves");
				}
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Big Leaves",
		rating: 4,
		num: 387,
		gen: 8,
	},
	precisefist: {
		onModifyMove(move) {
			if (move.flags["punch"]) {
				if (move.secondaries) {
					this.debug("doubling secondary chance");
					for (const secondary of move.secondaries) {
						if (secondary.chance) secondary.chance *= 2;
					}
				}
				if (move.secondary) {
					this.debug("doubling secondary chance");
					// TODO: Fixed an invalid reference bug here.
					// if (secondary.chance) secondary.chance *= 2;
					if (move.secondary.chance) move.secondary.chance *= 2;
				}
				if (move.self?.chance) move.self.chance *= 2;
			}
		},
		onModifyCritRatio(critRatio, source, target, move) {
			if (move.flags["punch"]) return critRatio + 1;
		},
		name: "Precise Fist",
		rating: 2.5,
		num: 388,
		gen: 8,
	},
	deadeye: {
		onModifyMove(move, pokemon, target) {
			if (!target) return;
			if (pokemon === target) return;

			move.accuracy = true;
			if ((move.flags as any)['arrow'] && move.category !== 'Status') {
				if (target.getStat('def') > target.getStat('spd')) move.category = 'Special';
				else move.category = 'Physical';
			}
		},
		name: "Deadeye",
		rating: 3.5,
		num: 389,
		gen: 8,
	},
	artillery: {
		onModifyMove(move) {
			if (move.flags["pulse"]) {
				move.accuracy = true;
				if (move.target === "normal" || move.target === "any") { move.target = "allAdjacentFoes"; }
			}
		},
		name: "Artillery",
		rating: 1.5,
		num: 390,
		gen: 8,
	},
	amplifier: {
		onModifyMove(move) {
			if (
				move.flags["sound"] &&
				(move.target === "normal" || move.target === "any")
			) {
				move.target = "allAdjacentFoes";
			}
		},
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["sound"]) {
				this.debug("Amplifier boost");
				return this.chainModify(1.3);
			}
		},
		name: "Amplifier",
		rating: 3.5,
		num: 391,
		gen: 8,
	},
	icedew: {
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (target !== source && move.type === "Ice") {
				if (target.getStat("atk") > target.getStat("spa")) {
					if (!this.boost({atk: 1})) {
						this.add("-immune", target, "[from] ability: Ice Dew");
					}
				} else {
					if (!this.boost({spa: 1})) {
						this.add("-immune", target, "[from] ability: Ice Dew");
					}
				}
				return null;
			}
		},
		onAllyTryHitSide(target, source, move) {
			if (source === this.effectState.target || !target.isAlly(source)) { return; }
			if (move.type === "Ice") {
				if (target.getStat("atk") > target.getStat("spa")) {
					this.boost({atk: 1}, this.effectState.target);
				} else {
					this.boost({spa: 1}, this.effectState.target);
				}
			}
		},
		flags: { breakable: 1 },
		name: "Ice Dew",
		rating: 3,
		num: 392,
		gen: 8,
	},
	sunworship: {
		onStart(pokemon) {
			if (
				["sunnyday", "desolateland"].includes(pokemon.effectiveWeather())
			) {
				const bestStat = pokemon.getBestStat(true, true);
				this.boost({[bestStat]: 1}, pokemon);
			}
		},
		name: "Sun Worship",
		rating: 3,
		num: 393,
		gen: 8,
	},
	pollinate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Bug";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		name: "Pollinate",
		rating: 4,
		num: 394,
		gen: 8,
	},
	solarflare: {
		onModifyMove(move) {
			if (move.type === "Fire") {
				move.forceSTAB = true;
			}
		},
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Fire";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		name: "Solar Flare",
		rating: 4,
		num: 395,
		gen: 8,
	},
	lunareclipse: {
		onModifyMove(move) {
			if (move.type === "Dark" || move.type === "Fairy") {
				move.forceSTAB = true;
			}
			if (move.id === "hypnosis" && typeof move.accuracy === "number") {
				move.accuracy += 50;
			}
		},
		name: "Lunar Eclipse",
		rating: 4,
		num: 395,
		gen: 8,
	},
	// Elite Redux's Opportunist renamed to 'Expert Hunter' to avoid name confict with gen 9's Opportunist
	experthunter: {
		onModifyPriority(priority, pokemon, target, move) {
			const action = this.queue.willMove(pokemon);
			const foe = action?.originalTarget;
			if (!foe || foe.fainted) return;
			if (foe.side === pokemon.side) return;
			if (foe.hp < foe.maxhp / 2) return priority + 1;
		},
		name: "Expert Hunter",
		rating: 4.5,
		num: 396,
		gen: 8,
	},
	mightyhorn: {
		onModifyDamage(basePower, attacker, defender, move) {
			if ((move.flags as any)["horn"]) {
				this.debug("Mighty Horn boost");
				return this.chainModify([5325, 4096]);
			}
		},
		name: "Mighty Horn",
		rating: 3,
		num: 397,
		gen: 8,
	},
	hardenedsheath: {
		onModifyMove(move) {
			if (!(move?.flags as any)["horn"]) return;
			if (!move.secondaries) {
				move.secondaries = [];
			}
			move.secondaries.push({
				chance: 100,
				self: {
					boosts: {atk: 1},
				},
				ability: this.dex.abilities.get("hardenedsheath"),
			});
		},
		name: "Hardened Sheath",
		rating: 3,
		num: 398,
		gen: 8,
	},
	arcticfur: {
		onSourceModifyDamage(atk, attacker, defender, move) {
			return this.chainModify(0.65);
		},
		flags: { breakable: 1 },
		name: "Arctic Fur",
		rating: 3,
		num: 399,
		gen: 8,
	},
	coldrebound: {
		onDamagingHit(damage, target, source, move) {
			if (
				!(target.hp > 0) ||
				!move.flags["contact"] ||
				(move.flags as any)["counter"]
			) { return; }
			const counterMove = Dex.moves.get("icywind");
			this.add("-activate", target, "Cold Rebound");
			this.effectState.counter = true;
			(this.actions as any).runAdditionalMove(counterMove, target, source);
		},
		onModifyMove(move) {
			if (this.effectState.counter) {
				(move.flags as any)["counter"] = 1;
				this.effectState.counter = false;
			}
		},
		flags: { breakable: 1 },
		name: "Cold Rebound",
		rating: 3,
		num: 400,
		gen: 8,
	},
	ironbarrage: {
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["pulse"]) {
				return this.chainModify(1.5);
			}
		},
		onModifyMove(move) {
			move.accuracy = true;
		},
		onModifyPriority(priority, source, target, move) {
			if (typeof move.accuracy !== "boolean" && move.accuracy <= 75) {
				return priority - 3;
			}
		},
		name: "Iron Barrage",
		rating: 3,
		num: 401,
		gen: 8,
	},
	steelbarrel: {
		onDamage(damage, target, source, effect) {
			// Steel beam/Mind blown modifiers in respective moves
			if (effect.id === "recoil") {
				if (!this.activeMove) throw new Error("Battle.activeMove is null");
				if (this.activeMove.id !== "struggle") return null;
			}
		},
		name: "Steel Barrel",
		rating: 3,
		num: 402,
		gen: 8,
	},
	pyroshells: {
		onAfterMove(source, target, move) {
			if (!move.flags["pulse"]) return;
			if (!(move as any).succeeded) return;
			const moveMutations = {
				basePower: 50,
				selfdestruct: undefined,
			};
			(this.actions as any).runAdditionalMove(
				Dex.moves.get("outburst"),
				source,
				target,
				moveMutations
			);
		},

		name: "Pyro Shells",
		rating: 3,
		num: 403,
		gen: 8,
	},
	volcanorage: {
		onAfterMove(source, target, move) {
			if (!(move.type === "Fire")) { return; }
			if (!(move as any).succeeded) return;
			const moveMutations = {
				basePower: 50,
			};
			(this.actions as any).runAdditionalMove(
				Dex.moves.get("eruption"),
				source,
				target,
				moveMutations
			);
		},
		name: "Volcano Rage",
		rating: 3,
		num: 404,
		gen: 8,
	},
	thundercall: {
		onAfterMove(source, target, move) {
			if (move.type !== "Electric") { return; }
			if (!(move as any).succeeded) return;

			const moveMutations = {
				basePower: 120 * 0.2,
			};
			(this.actions as any).runAdditionalMove(
				Dex.moves.get("smite"),
				source,
				target,
				moveMutations
			);
		},
		name: "Thunder Call",
		rating: 3,
		num: 405,
		gen: 8,
	},
	marineapex: {
		onModifyMove(move) {
			move.infiltrates = true;
		},
		onModifyDamage(damage, source, target, move) {
			if (target.hasType("Water")) {
				this.debug("Marine Apex boost");
				return this.chainModify(1.5);
			}
		},

		name: "Marine Apex",
		rating: 3,
		num: 406,
		gen: 8,
	},
	discipline: {
		onAfterMove(source, target, move) {
			if (source.volatiles["lockedmove"]) {
				source.removeVolatile("lockedmove");
			}
		},
		onUpdate(pokemon) {
			if (pokemon.volatiles["confusion"]) {
				this.add("-activate", pokemon, "ability: Discipline");
				pokemon.removeVolatile("confusion");
			}
		},
		onTryAddVolatile(status, pokemon) {
			if (status.id === "confusion") return null;
		},
		onHit(target, source, move) {
			if (move?.volatileStatus === "confusion") {
				this.add(
					"-immune",
					target,
					"confusion",
					"[from] ability: Discipline"
				);
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === "Intimidate" && boost.atk) {
				delete boost.atk;
				this.add(
					"-fail",
					target,
					"unboost",
					"Attack",
					"[from] ability: Discipline",
					"[of] " + target
				);
			}
		},

		name: "Discipline",
		rating: 3,
		num: 407,
		gen: 8,
	},
	lowblow: {
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(
				Dex.moves.get("feintattack"),
				pokemon,
				target,
				{
					onDamagePriority: -20,
					onDamage: (damage: number, moveTarget: Pokemon) => {
						if (damage >= moveTarget.hp) return moveTarget.hp - 1;
					},
				},
			);
		},
		name: "Low Blow",
		rating: 3,
		num: 408,
		gen: 8,
	},
	nosferatu: {
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["contact"]) {
				return this.chainModify([4915, 4096]);
			}
		},
		onModifyMove(move) {
			if (move.flags["contact"]) {
				move.drain = [1, 3];
			}
		},
		name: "Nosferatu",
		rating: 3,
		num: 409,
		gen: 8,
	},
	spectralize: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Ghost";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		name: "Spectralize",
		rating: 3,
		num: 410,
		gen: 8,
	},
	spectralshroud: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Ghost";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		onModifyMove(move) {
			if (move.target === "self" || move.category === "Status") return;
			if (!move.secondaries) {
				move.secondaries = [];
			}
			move.secondaries.push({
				chance: 30,
				status: "tox",
				ability: this.dex.abilities.get("spectralshroud"),
			});
		},
		name: "Spectral Shroud",
		rating: 3,
		num: 411,
		gen: 8,
	},
	lethargy: {
		onStart(pokemon) {
			pokemon.addVolatile("lethargy");
		},
		onEnd(pokemon) {
			delete pokemon.volatiles["lethargy"];
			this.add("-end", pokemon, "Lethargy", "[silent]");
		},
		condition: {
			onResidualOrder: 28,
			onResidualSubOrder: 2,
			onStart(target) {
				this.add("-start", target, "ability: Lethargy");
			},
			onModifyDamage(atk, pokemon) {
				const modifier = -0.2 * pokemon.activeTurns - 1 + 1;
				console.log(`attack modifier: ${modifier}`);
				return this.chainModify(modifier >= 0.2 ? modifier : 0.2);
			},
			onEnd(target) {
				this.add("-end", target, "Lethargy");
			},
		},
		name: "Lethargy",
		rating: -1,
		num: 412,
		gen: 8,
	},
	fungalinfection: {
		onAfterMove(source, target, move) {
			if (target.hasType('Grass')) return;
			if (target.hp > 0 && target !== source && move.category !== "Status") {
				if (!target.volatiles["leechseed"]) {
					this.add("-activate", source, "ability: Fungal Infection");
					target.addVolatile("leechseed", this.effectState.target);
				}
			}
		},
		name: "Fungal Infection",
		rating: 3,
		num: 413,
		gen: 8,
	},
	parry: {
		onDamagingHit(damage, defender, attacker, move) {
			if (attacker.hp <= 0) { return; }
			if (!move.flags["contact"]) { return; }

			const moveMutations = {
				flags: {...Dex.moves.get("machpunch").flags, counter: 1},
			};
			(this.actions as any).runAdditionalMove(
				Dex.moves.get("machpunch"),
				defender,
				attacker,
				moveMutations
			);
		},
		onSourceModifyDamage(damage, source, target, move) {
			return this.chainModify(0.8);
		},
		flags: { breakable: 1 },
		name: "Parry",
		rating: 3,
		num: 414,
		gen: 8,
	},
	roundhouse: {
		onModifyMove(move, pokemon, target) {
			if (!(move.flags as any)["kick"]) return;

			move.accuracy = true;

			if (!target) return;

			const def = target.calculateStat("def", target.boosts["def"], 1, target);
			const spd = target.calculateStat("spd", target.boosts["spd"], 1, target);

			if (def > spd) {
				move.overrideDefensiveStat = "spd";
			} else {
				move.overrideDefensiveStat = "def";
			}
		},
		name: "Roundhouse",
		rating: 3,
		num: 414,
		gen: 8,
	},
	mineralize: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Rock";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		name: "Mineralize",
		rating: 4,
		num: 415,
		gen: 8,
	},
	scrapyard: {
		onDamagingHit(damage, target, source, move) {
			const side = target.side.foe;
			const spikes = side.sideConditions["spikes"];
			if (!move.flags["contact"]) return;
			if (spikes && spikes.layers >= 3) return;
			this.add("-activate", target, "ability: Scrapyard");
			side.addSideCondition("spikes", target);
		},
		name: "Scrapyard",
		rating: 3.5,
		num: 416,
		gen: 8,
	},
	loosequills: {
		onDamagingHit(damage, target, source, move) {
			const side = target.side.foe;
			const spikes = side.sideConditions["spikes"];
			if (!move.flags["contact"]) return;
			if (spikes && spikes.layers >= 3) return;
			this.add("-activate", target, "ability: Loose Quills");
			side.addSideCondition("spikes", target);
		},
		name: "Loose Quills",
		rating: 3.5,
		num: 417,
		gen: 8,
	},
	looserocks: {
		onDamagingHit(damage, target, source, move) {
			const side = target.side.foe;
			if (!move.flags["contact"]) return;
			const stealthrock = side.sideConditions["stealthrock"];
			if (stealthrock) return;
			this.add("-activate", target, "ability: Loose Rocks");
			side.addSideCondition("stealthrock", target);
		},
		name: "Loose Rocks",
		rating: 3.5,
		num: 418,
		gen: 8,
	},
	spinningtop: {
		onFoeDamagingHit(damage, target, pokemon, move) {
			if (!move.hasSheerForce && move.hit > 0 && move.type === "Fighting") {
				this.boost({spe: 1}, pokemon);
				if (pokemon.hp && pokemon.removeVolatile("leechseed")) {
					this.add(
						"-end",
						pokemon,
						"Leech Seed",
						"[from] ability: Spinning Top",
						"[of] " + pokemon
					);
				}
				const sideConditions = [
					"spikes",
					"toxicspikes",
					"stealthrock",
					"stickyweb",
					"gmaxsteelsurge",
				];
				for (const condition of sideConditions) {
					if (pokemon.hp && pokemon.side.removeSideCondition(condition)) {
						this.add(
							"-sideend",
							pokemon.side,
							this.dex.conditions.get(condition).name,
							"[from] ability: Spinning Top",
							"[of] " + pokemon
						);
					}
				}
				if (pokemon.hp && pokemon.volatiles["partiallytrapped"]) {
					pokemon.removeVolatile("partiallytrapped");
				}
			}
		},
		onAfterSubDamage(damage, target, pokemon, move) {
			if (!move.hasSheerForce && move.type === "Fighting") {
				this.add("-activate", target, "ability: Spinning Top");
				this.boost({spe: 1}, pokemon);
				if (pokemon.hp && pokemon.removeVolatile("leechseed")) {
					this.add(
						"-end",
						pokemon,
						"Leech Seed",
						"[from] move: Rapid Spin",
						"[of] " + pokemon
					);
				}
				const sideConditions = [
					"spikes",
					"toxicspikes",
					"stealthrock",
					"stickyweb",
					"gmaxsteelsurge",
				];
				for (const condition of sideConditions) {
					if (pokemon.hp && pokemon.side.removeSideCondition(condition)) {
						this.add(
							"-sideend",
							pokemon.side,
							this.dex.conditions.get(condition).name,
							"[from] ability: Spinning Top",
							"[of] " + pokemon
						);
					}
				}
				if (pokemon.hp && pokemon.volatiles["partiallytrapped"]) {
					pokemon.removeVolatile("partiallytrapped");
				}
			}
		},
		name: "Spinning Top",
		rating: 3.5,
		num: 419,
		gen: 8,
	},
	atomicburst: {
		onDamagingHit(damage, pokemon, attacker, attackerMove) {
			if (attacker.hp <= 0) { return; }
			if (pokemon.getMoveHitData(attackerMove).typeMod <= 0) return;

			const move = Dex.moves.get("hyperbeam");
			const flags = move.flags;
			delete flags.recharge;

			(this.actions as any).runAdditionalMove(
				move,
				pokemon,
				attacker,
				{basePower: 50, self: {}, flags: flags}
			);
		},
		name: "Atomic Burst",
		rating: 3.5,
		num: 420,
		gen: 8,
	},
	retributionblow: {
		onFoeAfterBoost(boost, target, source, effect) {
			if (source && source !== target) return;
			let willBurst = false;
			const pokemon = this.effectState.target;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! > 0) {
					willBurst = true;
				}
			}

			if (!willBurst) return;

			const move = Dex.moves.get("hyperbeam");
			const flags = move.flags;
			delete flags.recharge;

			(this.actions as any).runAdditionalMove(
				move,
				pokemon,
				target,
				{self: {}, flags: flags}
			);
		},
		name: "Retribution Blow",
		rating: 3.5,
		num: 421,
		gen: 8,
	},
	draconize: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Dragon";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		name: "Draconize",
		rating: 4,
		num: 422,
		gen: 8,
	},
	fearmonger: {
		onStart(pokemon) {
			let activated = false;
			for (const target of pokemon.adjacentFoes()) {
				if (!activated) {
					this.add("-ability", pokemon, "Fearmonger", "boost");
					activated = true;
				}
				if (target.volatiles["substitute"]) {
					this.add("-immune", target);
				} else {
					this.boost({spa: -1, atk: -1}, target, pokemon, null, true);
				}
			}
		},
		onModifyMove(move) {
			if (!move?.flags["contact"] || move.target === "self") return;
			if (!move.secondaries) {
				move.secondaries = [];
			}
			move.secondaries.push({
				chance: 10,
				status: "par",
				ability: this.dex.abilities.get("fearmonger"),
			});
		},
		name: "Fearmonger",
		rating: 4,
		num: 423,
		gen: 8,
	},
	// / Seems correctly implemented per v2.1 elite redux.
	kingswrath: {
		onAllyAfterEachBoost(boost, target, source) {
			let statsLowered = false;
			for (const i in boost) {
				if (boost[i as BoostID]! < 0) statsLowered = true;
			}
			const abilityHolder = this.effectState?.target;
			if (statsLowered && abilityHolder) {
				this.boost({atk: 1, def: 1}, abilityHolder, abilityHolder);
			}
		},
		name: "King's Wrath",
		rating: 4,
		num: 424,
		gen: 8,
	},
	// / Seems correctly implemented per v2.1 elite redux.
	queensmourning: {
		onAllyAfterEachBoost(boost, target, source) {
			let statsLowered = false;
			for (const i in boost) {
				if (boost[i as BoostID]! < 0) statsLowered = true;
			}
			const abilityHolder = this.effectState?.target;
			if (statsLowered && abilityHolder) {
				this.boost({spa: 1, spd: 1}, abilityHolder, abilityHolder);
			}
		},
		name: "Queens's Mourning",
		rating: 4,
		num: 425,
		gen: 8,
	},
	toxicspill: {
		onResidual(pokemon) {
			if (!pokemon.hp) return;
			for (const target of [...pokemon.foes(), ...pokemon.alliesAndSelf()]) {
				if (!target.hasType("Poison")) {
					this.damage(target.baseMaxhp / 8, target, pokemon);
				}
			}
		},
		name: "Toxic Spill",
		rating: 3,
		num: 426,
		gen: 8,
	},
	desertcloak: {
		onAllySetStatus(status, target, source, effect) {
			if (["sandstorm"].includes(target.effectiveWeather())) {
				if ((effect as Move)?.status) {
					this.add("-immune", target, "[from] ability: Desert Cloak");
				}
				return false;
			}
		},
		onAllyTryAddVolatile(status, target) {
			if (
				status.id === "yawn" &&
				["sunnyday", "desolateland"].includes(target.effectiveWeather())
			) {
				this.add("-immune", target, "[from] ability: Desert Cloak");
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Desert Cloak",
		rating: 3,
		num: 427,
		gen: 8,
	},
	prettyprincess: {
		onModifyDamage(damage, source, target) {
			let willBoost = false;
			let i: BoostID;
			for (i in target.boosts) {
				if (target.boosts[i] && target.boosts[i] < 0) {
					willBoost = true;
				}
			}
			if (willBoost) {
				return this.chainModify(1.5);
			}
		},
		name: "Pretty Princess",
		rating: 3,
		num: 428,
		gen: 8,
	},
	selfrepair: {
		onResidualOrder: 29,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			this.heal(pokemon.baseMaxhp / 16);
		},
		onCheckShow(pokemon) {
			// This is complicated
			// For the most part, in-game, it's obvious whether or not Natural Cure activated,
			// since you can see how many of your opponent's pokemon are statused.
			// The only ambiguous situation happens in Doubles/Triples, where multiple pokemon
			// that could have Natural Cure switch out, but only some of them get cured.
			if (pokemon.side.active.length === 1) return;
			if (pokemon.showCure === true || pokemon.showCure === false) return;

			const cureList = [];
			let noCureCount = 0;
			for (const curPoke of pokemon.side.active) {
				// pokemon not statused
				if (!curPoke?.status) {
					// this.add('-message', "" + curPoke + " skipped: not statused or doesn't exist");
					continue;
				}
				if (curPoke.showCure) {
					// this.add('-message', "" + curPoke + " skipped: Natural Cure already known");
					continue;
				}
				const species = curPoke.species;
				// pokemon can't get Natural Cure
				if (!Object.values(species.abilities).includes("Self Repair")) {
					// this.add('-message', "" + curPoke + " skipped: no Natural Cure");
					continue;
				}
				// TODO: Currently, this and Natural Cure do not check for innates
				// pokemon's ability is known to be Natural Cure
				if (!species.abilities["1"] && !species.abilities["H"]) {
					// this.add('-message', "" + curPoke + " skipped: only one ability");
					continue;
				}
				// pokemon isn't switching this turn
				if (curPoke !== pokemon && !this.queue.willSwitch(curPoke)) {
					// this.add('-message', "" + curPoke + " skipped: not switching");
					continue;
				}

				if (curPoke.hasAbility("Self Repair")) {
					// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (and is)");
					cureList.push(curPoke);
				} else {
					// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (but isn't)");
					noCureCount++;
				}
			}

			if (!cureList.length || !noCureCount) {
				// It's possible to know what pokemon were cured
				for (const pkmn of cureList) {
					pkmn.showCure = true;
				}
			} else {
				// It's not possible to know what pokemon were cured

				// Unlike a -hint, this is real information that battlers need, so we use a -message
				this.add(
					"-message",
					"(" +
						cureList.length +
						" of " +
						pokemon.side.name +
						"'s pokemon " +
						(cureList.length === 1 ? "was" : "were") +
						" cured by Self Repair.)"
				);

				for (const pkmn of cureList) {
					pkmn.showCure = false;
				}
			}
		},
		onSwitchOut(pokemon) {
			if (!pokemon.status) return;

			// if pokemon.showCure is undefined, it was skipped because its ability
			// is known
			if (pokemon.showCure === undefined) pokemon.showCure = true;

			if (pokemon.showCure) {
				this.add(
					"-curestatus",
					pokemon,
					pokemon.status,
					"[from] ability: Natural Cure"
				);
			}
			pokemon.clearStatus();

			// only reset .showCure if it's false
			// (once you know a Pokemon has Natural Cure, its cures are always known)
			if (!pokemon.showCure) pokemon.showCure = undefined;
		},
		name: "Self Repair",
		rating: 4,
		num: 429,
		gen: 8,
	},
	hellblaze: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move && move.type === "Fire") {
				if (attacker.hp <= attacker.maxhp / 3) {
					this.debug("Full Blaze boost");
					return this.chainModify(1.8);
				} else {
					this.debug("Lite Blaze boost");
					return this.chainModify(1.3);
				}
			}
		},
		name: "Hellblaze",
		rating: 4,
		num: 430,
		gen: 8,
	},
	riptide: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move && move.type === "Water") {
				if (attacker.hp <= attacker.maxhp / 3) {
					this.debug("Full Riptide boost");
					return this.chainModify(1.8);
				} else {
					this.debug("Lite Riptide boost");
					return this.chainModify(1.3);
				}
			}
		},
		name: "Riptide",
		rating: 4,
		num: 431,
		gen: 8,
	},
	forestrage: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move && move.type === "Grass") {
				if (attacker.hp <= attacker.maxhp / 3) {
					this.debug("Full Forest Rage boost");
					return this.chainModify(1.8);
				} else {
					this.debug("Lite Riptide boost");
					return this.chainModify(1.3);
				}
			}
		},
		name: "Forest Rage",
		rating: 4,
		num: 432,
		gen: 8,
	},
	primalmaw: {
		// Uses parentalBond as base.
		onPrepareHit(source, target, move) {
			if (isParentalBondBanned(move, source)) { return; }
			if (move.flags["bite"]) {
				move.multihit = 2;
				(move as { multihitType?: string }).multihitType = "maw";
			}
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			console.log(move.hit, move.secondaries);
			if ((move as { multihitType?: string }).multihitType !== "maw") return;
			if (!secondaries) return;
			if (move.hit <= 1) return;
			secondaries = secondaries.filter((effect) => effect.volatileStatus !== "flinch" || effect.ability || effect.kingsrock);
			return secondaries;
		},
		name: "Primal Maw",
		rating: 3,
		num: 433,
		gen: 8,
	},
	sweepingedge: {
		onModifyMove(move) {
			if (move.flags["slicing"]) {
				move.accuracy = true;
				if (move.target === "normal" || move.target === "any") { move.target = "allAdjacentFoes"; }
			}
		},
		name: "Sweeping Edge",
		rating: 3,
		num: 434,
		gen: 8,
	},
	// TODO: Test Clueless
	clueless: {
		onStart(pokemon) {
			this.add("-ability", pokemon, "Clueless");
			this.eachEvent("WeatherChange", this.effect);
		},
		onEnd(pokemon) {
			this.eachEvent("WeatherChange", this.effect);
		},

		// Room suppressions implemented in getActionSpeed(), getDefenseStat(), ignoringItem(),
		suppressWeather: true,
		name: "Clueless",
		rating: 3,
		num: 435,
		gen: 8,
	},
	hydrocircuit: {
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.type === "Electric") {
				return this.chainModify(1.5);
			}
		},
		onModifyMove(move) {
			if (move.type === "Water") {
				move.drain = [1, 4];
			}
		},
		name: "Hydro Circuit",
		rating: 3,
		num: 436,
		gen: 8,
	},
	giftedmind: {
		onTryHit(target, source, move) {
			const psychicWeaknesses = ["Dark", "Ghost", "Bug"];
			if (target !== source && psychicWeaknesses.includes(move.type)) {
				this.add("-immune", target, "[from] ability: Gifted Mind");
				return null;
			}
		},
		onModifyMove(move) {
			if (move.category === "Status") {
				move.accuracy = true;
			}
		},
		name: "Gifted Mind",
		flags: { breakable: 1 },
		rating: 3,
		num: 437,
		gen: 8,
	},
	equinox: {
		onModifyMove(move, attacker, defender) {
			if (!defender) return;

			const spa = attacker.calculateStat("spa", attacker.boosts["spa"], 1, attacker);
			const atk = attacker.calculateStat("atk", attacker.boosts["atk"], 1, attacker);
			if (spa > atk) move.overrideOffensiveStat = "spa";
			else if (atk > spa) move.overrideOffensiveStat = "atk";
		},
		name: "Equinox",
		rating: 3,
		num: 438,
		gen: 8,
	},
	absorbant: {
		onAfterMove(source, target, move) {
			if (target.hp > 0 && target !== source && move.drain) {
				if (target.hasType('Grass')) return;
				if (!target.volatiles["leechseed"]) {
					this.add("-activate", source, "ability: Absorbant");
					target.addVolatile("leechseed", this.effectState.target);
				}
			}
		},
		onModifyMove(move, target, source) {
			if (move.drain) {
				const numerator = move.drain[0] * 1.5;
				const denominator = move.drain[1];
				move.drain = [numerator, denominator];
			}
		},
		name: "Absorbant",
		rating: 3,
		num: 439,
		gen: 8,
	},
	cheatingdeath: {
		onStart(pokemon) {
			if (pokemon.activeTurns === 0 && !this.effectState.beginCD) {
				this.effectState.beginCD = true;
				this.effectState.hitsLeft = 2;
			}
		},
		onDamage(damage, mon, source, effect) {
			if (mon === source) return;
			if (damage <= 0) return;
			if (effect.effectType !== "Move") return;
			const pas = ((mon as any).permanentAbilityState ??= {});
			pas["cheatingdeath"] = pas["cheatingdeath"] || 0;
			if (pas["cheatingdeath"] >= 2) return;
			pas["cheatingdeath"]++;
			this.add("-activate", mon, "ability: Cheating Death");
			return 0;
		},
		name: "Cheating Death",
		rating: 3,
		num: 440,
		gen: 8,
	},
	cheaptactics: {
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(
				Dex.moves.get("scratch"),
				pokemon,
				target,
				{
					onDamagePriority: -20,
					onDamage: (damage: number, moveTarget: Pokemon) => {
						if (damage >= moveTarget.hp) return moveTarget.hp - 1;
					},
				},
			);
		},
		name: "Cheap Tactics",
		rating: 3,
		num: 441,
		gen: 8,
	},
	coward: {
		onStart(pokemon) {
			if ((pokemon as any).coward) return;
			(pokemon as any).coward = true;
			(this.actions as any).runAdditionalMove(Dex.moves.get("protect"),	pokemon, pokemon);
		},
		name: "Coward",
		rating: 3,
		num: 442,
		gen: 8,
	},
	voltrush: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.type === "Electric" && pokemon.hp === pokemon.maxhp) { return priority + 1; }
		},
		name: "Volt Rush",
		rating: 3,
		num: 443,
		gen: 8,
	},
	duneterror: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.effectiveWeather() === "sandstorm") {
				this.chainModify(0.65);
			}
		},
		onModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Ground") {
				this.debug("Dune Terror boost");
				return this.chainModify(1.2);
			}
		},
		flags: { breakable: 1 },
		name: "Dune Terror",
		rating: 3,
		num: 444,
		gen: 8,
	},
	infernalrage: {
		onModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Fire") {
				this.debug("Infernal Rage boost");
				return this.chainModify([5529, 4096]); // ~35% boost
			}
		},
		onAfterMoveSecondaryPriority: -1,
		onAfterMoveSecondarySelf(source, target, move) {
			if (
				source &&
				source !== target &&
				move &&
				move.type === "Fire" &&
				!source.forceSwitchFlag &&
				move.totalDamage
			) {
				const ebRecoilDamage = this.clampIntRange(
					Math.round(move.totalDamage * 0.05),
					1
				);
				this.add("-activate", source, "Infernal Rage");
				this.damage(ebRecoilDamage, source, source, "recoil");
			}
		},
		name: "Infernal Rage",
		rating: 3,
		num: 445,
		gen: 8,
	},
	radiance: {
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy) {
			if (typeof accuracy !== "number") return;
			this.debug("radiance - enhancing accuracy");
			return this.chainModify(1.2);
		},
		onAnyTryMove(source, target, move) {
			if (move.type === "Dark") {
				this.attrLastMove("[still]");
				this.add(
					"cant",
					this.effectState.target,
					"ability: Radiance",
					move,
					"[of] " + target
				);
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Radiance",
		rating: 3,
		num: 446,
		gen: 8,
	},
	atlas: {
		onStart(source) {
			if (!this.field.getPseudoWeather("gravity")) {
				this.add("-activate", source, "ability: Atlas");
				this.field.addPseudoWeather("gravity", source, source.getAbility());
			}
		},
		onFractionalPriority: -0.1,
		name: "Atlas",
		rating: 3,
		num: 447,
		gen: 8,
	},
	elementalcharge: {
		onModifyMove(move) {
			if (move.category === 'Status' || move.target === 'self') return;
			let status;
			switch (move.type) {
			case "Fire":
				status = "brn";
				break;
			case "Electric":
				status = "par";
				break;
			case "Ice":
				status = "frz";
				break;
			default:
			}
			if (status) {
				if (!move.secondaries) {
					move.secondaries = [];
				}
				move.secondaries.push({
					chance: 20,
					status: status,
					ability: this.dex.abilities.get("elementalcharge"),
				});
			}
		},
		name: "Elemental Charge",
		rating: 3,
		num: 448,
		gen: 8,
	},
	dualwield: {
		// Uses parentalBond as base.
		onPrepareHit(source, target, move) {
			if (isParentalBondBanned(move, source)) { return; }
			if (move.flags["pulse"] || move.flags['slicing']) {
				move.multihit = 2;
				(move as { multihitType?: string }).multihitType = "dual";
			}
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			console.log(move.hit, move.secondaries);
			if ((move as { multihitType?: string }).multihitType !== "dual") return;
			if (!secondaries) return;
			if (move.hit <= 1) return;
			secondaries = secondaries.filter((effect) => effect.volatileStatus !== "flinch" || effect.ability || effect.kingsrock);
			return secondaries;
		},
		name: "Dual Wield",
		rating: 3,
		num: 449,
		gen: 8,
	},
	ambush: {
		onStart(pkmn) {
			pkmn.addVolatile("ambush");
		},
		condition: {
			duration: 1,
			onModifyMove(move, attacker, defender) {
				move.willCrit = true;
			},
		},
		name: "Ambush",
		rating: 3,
		num: 450,
		gen: 8,
	},
	jawsofcarnage: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === "Move") {
				this.add("-activate", source, "Jaws of Carnage");
				source.heal(source.baseMaxhp / 2);
				this.add("-heal", source, source.getHealth, "[silent]");
			}
		},
		name: "Jaws of Carnage",
		rating: 3,
		num: 451,
		gen: 8,
	},
	// Not updated since 1.6 -- looks complete
	angelswrath: {
		// oh boy, here we go
		onModifyMove(modifyMove, modifyPokemon, modifyTarget) {
			if (!modifyMove.secondaries) {
				modifyMove.secondaries = [];
			}
			switch (modifyMove.name) {
			case "Tackle":
				modifyMove.basePower = 100;
				modifyMove.secondaries.push({
					chance: 100,
					volatileStatus: "disable",
					onHit(target, source, move) {
						if (source.isActive) {
							target.addVolatile("encore", source, move);
							target.addVolatile("disable", source, move);
						}
					},
					ability: this.dex.abilities.get("angelswrath"),
				});
				break;

			case "Electroweb":
				modifyMove.basePower = 155;
				modifyMove.accuracy = true;
				modifyMove.secondaries.push({
					chance: 100,
					onHit(target, source, move) {
						if (source.isActive) {
							target.addVolatile(
								"trapped",
								target,
								this.dex.abilities.get("angelswrath"),
								"trapper"
							);
							this.boost({spe: -12}, target);
						}
					},
					ability: this.dex.abilities.get("angelswrath"),
				});
				break;

			case "Bug Bite":
				modifyMove.basePower = 140;
				modifyMove.drain = [1, 1];
				modifyMove.onAfterHit = (target, source) => {
					if (source.hp) {
						const item = target.takeItem();
						if (item) {
							this.add(
								"-enditem",
								target,
								item.name,
								"[from] ability: Angel's Wrath",
								"[of] " + source
							);
						}
					}
				};
				break;

			case "Poison Sting":
				modifyMove.basePower = 120;
				modifyMove.secondaries.push({
					chance: 100,
					status: "tox",
					ability: this.dex.abilities.get("angelswrath"),
				});
				modifyMove.onEffectiveness = (typeMod, target, type) => {
					if (type === "Steel") return 1;
				};
				if (!modifyMove.ignoreImmunity) modifyMove.ignoreImmunity = {};
				if (modifyMove.ignoreImmunity !== true) {
					modifyMove.ignoreImmunity["Poison"] = true;
				}
				break;

			case "String Shot":
				modifyMove.onAfterMove = (source, target, move) => {
					if (move.hit >= 1) {
						const sideConditions = [
							"spikes",
							"toxicspikes",
							"stealthrock",
							"stickyweb",
							"gmaxsteelsurge",
						];
						this.add("-activate", source, "ability: Angel's Wrath");
						for (const condition of sideConditions) {
							source.side.foe.addSideCondition(condition);
						}
					}
				};
				break;
			case "Harden":
				modifyMove.onAfterMove = (source, target, move) => {
					this.add("-activate", source, "ability: Angel's Wrath");
					this.boost(
						{
							atk: 1,
							spa: 1,
							spd: 1,
							def: 1,
							spe: 1,
							accuracy: 1,
							evasion: 1,
						},
						source
					);
				};
				break;
			case "Iron Defense":
				modifyMove.priority = 4;
				modifyMove.onAfterMove = (source, target, move) => {
					// Executes special Angel's Shield
					this.add("-activate", target, "ability: Angel's Wrath");
					this.actions.useMove(Dex.moves.get("angelsshield"), source);
				};
			}
		},
		onModifyPriority(priority, source, target, move) {
			// Special Case to ensure Iron Defense has Protect Priority
			if (move.name === "Iron Defense") {
				return priority + 4;
			}
		},
		name: "Angel's Wrath",
		rating: 3,
		num: 452,
		gen: 8,
	},

	prismaticfur: {
		onModifyDefPriority: 6,
		onSourceModifyDamage(damage, source, target, move) {
			return this.chainModify(0.5);
		},
		// Protean
		onPrepareHit(source, target, move) {
			if (
				move.hasBounced ||
				move.flags["futuremove"] ||
				move.sourceEffect === "snatch"
			) { return; }
			const type = move.type;
			if (type && type !== "???" && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.add(
					"-start",
					source,
					"typechange",
					type,
					"[from] ability: Prismatic Fur"
				);
			}
		},
		// Color Change
		onFoePrepareHit(source, target, move) {
			let bestType;
			let bestTypeMod = 0;
			let typeMod;
			for (const type of this.dex.types.all()) {
				if (!this.dex.getImmunity(move.type, type.id)) {
					// breaks, as immunity is strongest resistance possible
					bestType = type.name;
					break;
				}
				typeMod = this.dex.getEffectiveness(move.type, type.name);
				if (typeMod < bestTypeMod) {
					bestType = type.name;
					bestTypeMod = typeMod;
				}
			}
			if (
				source !== target &&
				bestType &&
				!target.getTypes().includes(bestType)
			) {
				if (!target.setType(bestType)) return;
				this.add(
					"-start",
					target,
					"typechange",
					bestType,
					"[from] ability: Prismatic Fur"
				);
			}
		},
		name: "Prismatic Fur",
		rating: 5,
		num: 453,
		gen: 8,
	},
	faehunter: {
		onModifyDamage(damage, source, target, move) {
			if (target.hasType("Fairy")) {
				this.debug("Fae Hunter boost");
				return this.chainModify(1.5);
			}
		},
		name: "Fae Hunter",
		rating: 3,
		num: 454,
		gen: 8,
	},
	gravitywell: {
		onStart(source) {
			if (!this.field.getPseudoWeather("gravity")) {
				this.add("-activate", source, "ability: Gravity Well");
				this.field.addPseudoWeather("gravity", source, source.getAbility());
			}
		},
		name: "Gravity Well",
		rating: 3,
		num: 454,
		gen: 8,
	},
	shockingjaws: {
		name: "Shocking Jaws",
		rating: 3,
		num: 455,
		gen: 8,
		onModifyMove(move, mon, target) {
			if (!move?.flags["bite"]) return;
			if (move.secondaries) move.secondaries = [];
			move.secondaries?.push({
				chance: 50,
				status: "par",
				ability: this.dex.abilities.get("shockingjaws"),
			});
		},
	},
	cryomancy: {
		name: "Cryomancy",
		rating: 3,
		num: 456,
		gen: 8,
		onModifyMovePriority: -2,
		onModifyMove(move) {
			if (!move.secondaries) return;
			for (const secondary of move.secondaries) {
				if (secondary.status?.includes("frz") && secondary.chance && !secondary.ability) { secondary.chance *= 5; }
			}
		},
	},
	phantompain: {
		name: "Phantom Pain",
		rating: 3,
		num: 457,
		gen: 8,
		onModifyMovePriority: -5,
		onModifyMove(move) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (
				move.ignoreImmunity !== true &&
				!Object.keys(move.ignoreImmunity).includes("Ghost")
			) {
				move.ignoreImmunity["Ghost"] = true;
			}
		},
	},
	purgatory: {
		name: "Purgatory",
		rating: 3,
		num: 458,
		gen: 8,
		onModifyDamage(atk, attacker, defender, move) {
			if (move && move.type === "Ghost") {
				if (attacker.hp <= attacker.maxhp / 3) {
					return this.chainModify(1.8);
				} else {
					return this.chainModify(1.3);
				}
			}
		},
	},
	emanate: {
		name: "Emanate",
		rating: 3,
		num: 459,
		gen: 8,
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Psychic";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
	},
	monkeybusiness: {
		name: "Monkey Business",
		rating: 3,
		num: 460,
		gen: 8,
		onStart(pokemon) {
			const opponent = (pokemon as any).oppositeFoe();
			if (!opponent) return;

			this.boost({atk: -1, def: -1}, opponent, pokemon, null, true);
			this.add("-ability", pokemon, "Monkey Business", "boost");
		},
	},

	evaporate: {
		onTryHit(target, source, move) {
			if (!move.type.toLowerCase().includes("water")) return;
			this.add("-immune", target, "[from] ability: Evaporate");
			this.add("-activate", target, "move: Mist");
			target.side.addSideCondition("mist");
			return null;
		},
		flags: { breakable: 1 },
		name: "Evaporate",
		shortDesc: "Takes no damage and sets Mist if hit by water.",
	},
	// Usada em fichas custom: anula quedas de stat por efeitos próprios e aguenta um golpe fatal uma vez por entrada.
	luckyhalo: {
		onStart(pokemon) {
			pokemon.abilityState.luckyhaloEndured = false;
		},
		onTryBoost(boost, target, source, effect) {
			if (!source || target !== source) return;
			let blocked = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					blocked = true;
				}
			}
			if (blocked && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add('-fail', target, 'unboost', '[from] ability: Lucky Halo', `[of] ${target}`);
			}
		},
		onTryHit(pokemon, target, move) {
			if (move.ohko) {
				this.add('-immune', pokemon, '[from] ability: Lucky Halo');
				return null;
			}
		},
		onDamagePriority: -30,
		onDamage(damage, target, source, effect) {
			if (target.abilityState.luckyhaloEndured) return;
			if (damage >= target.hp && effect && effect.effectType === 'Move') {
				target.abilityState.luckyhaloEndured = true;
				this.add('-activate', target, 'ability: Lucky Halo');
				return target.hp - 1;
			}
		},
		flags: { breakable: 1 },
		name: "Lucky Halo",
		rating: 3.5,
		num: 382,
		gen: 9,
	},
	lumberjack: {
		name: "Lumberjack",
		shortDesc: "1.5x damage to Grass types.",
		onModifyDamage(atk, attacker, defender, move) {
			if (!defender.types.find((type) => type.toLowerCase().includes("grass"))) { return; }
			this.debug("lumberjack boost");
			return this.chainModify(1.5);
		},
	},
	furnace: {
		name: "Furnace",
		shortDesc: "User gains +2 speed when hit by rocks",
		onDamagingHit(damage, target, source, move) {
			if (!damage || !move.type.toLowerCase().includes("rock")) return;
			this.boost(
				{spe: 2},
				target,
				target,
				this.dex.abilities.get("furnace")
			);
		},
	},
	ragingmoth: {
		name: "Raging Moth",
		shortDesc: "Fire moves hit twice, both hits at 75% power.",
		onPrepareHit(source, target, move) {
			if (isParentalBondBanned(move, source)) { return; }
			move.multihit = 2;
			(move as { multihitType?: string }).multihitType = "ragingmoth";
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			console.log(move.hit, move.secondaries);
			if ((move as { multihitType?: string }).multihitType !== "ragingmoth") return;
			if (!secondaries) return;
			if (move.hit <= 1) return;
			secondaries = secondaries.filter((effect) => effect.volatileStatus !== "flinch" || effect.ability || effect.kingsrock);
			return secondaries;
		},
	},
	adrenalinerush: {
		name: "Adrenaline Rush",
		shortDesc: "KOs raise speed by +1.",
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === "Move") {
				this.boost(
					{spe: 1},
					source,
					source,
					this.dex.abilities.get("adrenalinerush")
				);
			}
		},
	},
	cryoproficiency: {
		name: "Cryo Proficiency",
		shortDesc: "Triggers hail when hit. 30% chance to frostbite on contact.",
		onDamagingHit(damage, target, source, move) {
			if (this.randomChance(3, 10)) {
				source.trySetStatus("frz", target, target.getAbility());
			}

			this.field.setWeather("hail");
		},
	},
	/**
	 * New voodoo power ability which sets the bleed condition with a 30% chance on hit by special attack.
	 */
	voodoopower: {
		name: "Voodoo Power",
		shortDesc: "30% chance to bleed when hit by special attacks.",
		/**
		 * This is called right after the pokemon with this ability is hit by a damaging move.
		 * In this case, the target is the pokemon with the ability, and the source is the user that damaged us.
		 * Hence, we add the bleed status to the source if the conditions are right.
		 * Here, we check the logic for applying bleed with the right input conditions.
		 */
		onDamagingHit(damage, target, source, move) {
			/**
			 * Handle type immunities to bleed (rock and ghost as of v2.1).
			 * Weirdly, this function call returns true if the type is NOT immune, despite it's name.
			 */
			if (!this.dex.getImmunity("bld", source)) return;
			if (move.category !== "Special") return;
			/**
			 * This check prevents additional ability activation messages and failure messages
			 * from trying to activate bleed on a pokemon who is already bleeding.
			 */
			if (source.status === "bld") return;
			/**
			 * This ability has a 30% chance to activate, here we short circuit if that random chance fails.
			 */
			if (!this.randomChance(3, 10)) return;
			/**
			 * Popup an ability activation message before we bleed the move's source,
			 * which indicates why the user bleed.
			 */
			this.add("-activate", target, "ability: Voodoo Power");
			/**
			 * Add the actual status to the target. In theory even though we're using "try" setStatus,
			 * our checks should guarantee success.
			 * There are several other variations of adding statuses to pokemon from abilities,
			 * but this was the only one that gave good success with not random poorly formatted status messages
			 * popping up in the battle log as a result.
			 */
			source.trySetStatus(
				"bleed",
				target,
				this.dex.abilities.get("voodoopower")
			);
		},
	},
	spikearmor: {
		name: "Spike Armor",
		shortDesc: "30% chance to bleed on contact.",
		onDamagingHit(damage, target, source, move) {
			if (!this.dex.getImmunity("bld", source)) return;
			if (!move.flags["contact"]) return;
			if (!this.randomChance(3, 10)) return;
			if (source.status === "bld") return;
			this.add("-activate", target, "ability: Spike Armor");
			source.trySetStatus(
				"bld",
				target,
				this.dex.abilities.get("spikearmor")
			);
		},
	},
	fairytale: {
		name: "Fairy Tale",
		shortDesc: "Adds Fairy type to itself.",
		onStart(pokemon) {
			if (!pokemon.types.includes("Fairy")) {
				if (!pokemon.addType("Fairy")) return;
				this.add(
					"-start",
					pokemon,
					"typeadd",
					"Fairy",
					"[from] ability: Fairy Tale"
				);
			}
		},
	},
	kunoichisblade: {
		name: "Kunoichi's Blade",
		shortDesc:
			"Boost weaker moves and increases the frequency of multi-hit moves.",
		// / Technician
		onModifyDamage(basePower, attacker, defender, move) {
			const basePowerAfterMultiplier = this.modify(
				basePower,
				this.event.modifier
			);
			this.debug("Base Power: " + basePowerAfterMultiplier);
			if (basePowerAfterMultiplier <= 60) {
				this.debug("Technician boost");
				return this.chainModify(1.5);
			}
		},
		// / Skill Link
		onModifyMove(move) {
			if (
				move.multihit &&
				Array.isArray(move.multihit) &&
				move.multihit.length
			) {
				move.multihit = move.multihit[1];
			}
			if (move.multiaccuracy) {
				delete move.multiaccuracy;
			}
		},
	},
	combatspecialist: {
		name: "Combat Specialist",
		shortDesc: "Boost the power of punching and kicking moves by 1.3x.",
		// / Iron Fist
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["punch"]) {
				this.debug("Iron Fist boost");
				return this.chainModify(1.3);
			}
			if ((move.flags as any)["kick"]) {
				this.debug("Striker boost");
				return this.chainModify(1.3);
			}
		},
	},
	// / This is just copied from flower veil which seemed to behave the same.
	junglesguard: {
		name: "Jungle's Guard",
		shortDesc:
			"Grass-types on user side: immune to status/stat drops from enemy.",
		onAllyTryBoost(boost, target, source, effect) {
			if ((source && target === source) || !target.hasType("Grass")) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries) {
				const effectHolder = this.effectState.target;
				this.add(
					"-block",
					target,
					"ability: Jungle's Guard",
					"[of] " + effectHolder
				);
			}
		},
		onAllySetStatus(status, target, source, effect) {
			if (
				target.hasType("Grass") &&
				source &&
				target !== source &&
				effect &&
				effect.id !== "yawn"
			) {
				this.debug("interrupting setStatus with Jungle Guard");
				if (
					effect.name === "Synchronize" ||
					(effect.effectType === "Move" && !effect.secondaries)
				) {
					const effectHolder = this.effectState.target;
					this.add(
						"-block",
						target,
						"ability: Jungle's Guard",
						"[of] " + effectHolder
					);
				}
				return null;
			}
		},
		onAllyTryAddVolatile(status, target) {
			if (target.hasType("Grass") && status.id === "yawn") {
				this.debug("Jungles Guard blocking yawn");
				const effectHolder = this.effectState.target;
				this.add(
					"-block",
					target,
					"ability: Jungle's Guard",
					"[of] " + effectHolder
				);
				return null;
			}
		},
		flags: { breakable: 1 },
	},
	huntershorn: {
		name: "Hunter's Horn",
		shortDesc: "Boost horn moves and heals 1/4 hp when defeating an enemy.",
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === "Move") {
				this.add("-activate", source, "Hunter's Horn");
				source.heal(source.baseMaxhp / 4);
				this.add("-heal", source, source.getHealth, "[silent]");
			}
		},
		// / TODO: What should the modifier for hunter's horn be?
		onModifyDamage(basePower, attacker, defender, move) {
			if ((move.flags as any)["horn"]) {
				this.debug("Hunter's horn boost");
				return this.chainModify(1.3);
			}
		},
	},
	pixiepower: {
		name: "Pixie Power",
		shortDesc: "Boosts Fairy moves by 33% and 1.2x accuracy.",
		// / Display pixie power activation message.
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add("-ability", pokemon, "Pixie Power");
		},
		// / Fairy Aura boost.
		onAnyModifyDamage(basePower, source, target, move) {
			if (
				target === source ||
				move.category === "Status" ||
				move.type !== "Fairy"
			) { return; }
			if (!move.auraBooster?.hasAbility("Pixie Power")) { move.auraBooster = this.effectState.target; }
			if (move.auraBooster !== this.effectState.target) return;
			// / TODO: Should aura break cancel this?
			return this.chainModify([move.hasAuraBreak ? 3072 : 5448, 4096]);
		},
		// / Modified Compound Eyes boost.
		onAnyModifyAccuracyPriority: -1,
		onAnyModifyAccuracy(accuracy, target, source, move) {
			if (typeof accuracy !== "number") return;
			// / TODO: Does the accuracy boost only apply to fairy type moves?
			if (move.type !== "Fairy") return;
			this.debug("pixiepower - enhancing accuracy");
			return this.chainModify(1.2);
		},
	},
	plasmalamp: {
		name: "Plasma Lamp",
		shortDesc:
			"Boost accuracy & power of Fire and Electric type moves by 1.2x.",
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add("-ability", pokemon, "Plasma Lamp");
		},
		// / Plasma Lamp boost.
		onSourceModifyDamage(atk, attacker, defender, move) {
			if (move.type === "Electric" || move.type === "Fire") {
				this.debug("Plasma Lamp boost");
				return this.chainModify(1.2);
			}
		},
		// / Modified Compound Eyes boost.
		onSourceModifyAccuracy(accuracy, target, source, move) {
			if (typeof accuracy !== "number") return;
			if (move.type !== "Fire" && move.type !== "Electric") return;
			this.debug("plasma lamp - enhancing accuracy");
			return this.chainModify(1.2);
		},
	},
	magmaeater: {
		name: "Magma Eater",
		shortDesc: "Combines Predator & Molten Down.",
		// / Molten Down
		onFoeEffectiveness(typeMod, target, type, move) {
			if (type === "Rock" && move.type === "Fire") {
				return 1;
			}
		},
		// / Predator
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === "Move") {
				this.add("-activate", source, "Predator");
				source.heal(source.baseMaxhp / 4);
				this.add("-heal", source, source.getHealth, "[silent]");
			}
		},
	},
	superhotgoo: {
		name: "Super Hot Goo",
		shortDesc: "Inflicts burn and lower the speed on contact.",
		// / Gooey.
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.add("-ability", target, "Gooey");
				this.boost({spe: -1}, source, target, null, true);
			}

			if (this.checkMoveMakesContact(move, source, target)) {
				// TODO: Is this a random chance like flame body or guaranteed?
				// if (this.randomChance(3, 10)) {
				source.trySetStatus("brn", target);
				// }
			}
		},
	},
	nika: {
		name: "Nika",
		shortDesc: "Iron fist + Water moves function normally under sun.",
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["punch"]) {
				this.debug("Iron Fist boost");
				this.chainModify(1.3);
			}

			if (move.type === "Water" && this.field.weather === "sunnyday") {
				this.debug("water sun boost offset");
				this.chainModify(1.5);
			}
		},
	},
	mindcrush: {
		name: "Mind Crush",
		shortDesc: "Biting moves use SpAtk and deal 50% more damage.",
		onModifyMove(move) {
			if (move.flags["bite"]) {
				move.overrideOffensiveStat = "spa";
			}
		},
		onModifyDamage(bp, source, target, move) {
			if (move.flags["bite"]) {
				this.chainModify(1.5);
			}
		},
	},
	vengefulspirit: {
		name: "Vengeful Spirit",
		shortDesc: "Haunted Spirit + Vengeance.",
		// Haunted Spirit
		onDamagingHitOrder: 2,
		onDamagingHit(damage, target, source, move) {
			if (!target.hp && !source.getVolatile("curse")) {
				this.add("-activate", target, "Haunted Spirit");
				source.addVolatile("curse");
			}
		},
		// Vengeance
		onModifyDamage(atk, attacker, defender, move) {
			if (move && move.type === "Ghost") {
				if (attacker.hp <= attacker.maxhp / 3) {
					this.debug("Full Vengeance boost");
					return this.chainModify(1.5);
				} else {
					this.debug("Lite Vengeance boost");
					return this.chainModify(1.2);
				}
			}
		},
	},
	// TODO: test this shit because it definitely doesn't work
	tacticalretreat: {
		name: "Tactical Retreat",
		shortDesc: "Flees when stats are lowered.",
		onAfterEachBoost(boost, target, source, effect) {
			if ((target as any).permanentAbilityState?.['tacticalretreat']) return;
			let statsLowered = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					statsLowered = true;
				}
			}
			if (statsLowered) {
				if (
					!this.canSwitch(target.side) ||
					target.forceSwitchFlag ||
					target.switchFlag
				) { return; }
				for (const side of this.sides) {
					for (const active of side.active) {
						active.switchFlag = false;
					}
				}
				((target as any).permanentAbilityState ??= {})['tacticalretreat'] = true;
				target.switchFlag = true;
				this.add("-activate", target, "ability: Tactical Retreat");
			}
		},
	},
	tidalrush: {
		name: "Tidal Rush",
		shortDesc: "Water moves get +1 priority. Requires full HP.",
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.type === "Water" && pokemon.hp === pokemon.maxhp) { return priority + 1; }
		},
	},
	guilttrip: {
		name: "Guilt Trip",
		shortDesc: "Sharply lowers attacker's Attack and SpAtk when fainting.",
		onDamagingHitOrder: 2,
		onDamagingHit(damage, target, source, move) {
			if (!target.hp) {
				this.add("-ability", target, "Guilt Trip");
				this.boost({spa: -2}, source, target, null, true);
				this.boost({atk: -2}, source, target, null, true);
			}
		},
	},
	stygianrush: {
		name: "Stygian Rush",
		shortDesc: "Dark moves get +1 priority. Requires full HP.",
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.type === "Dark" && pokemon.hp === pokemon.maxhp) { return priority + 1; }
		},
	},
	readiedaction: {
		name: "Readied Action",
		shortDesc: "Doubles attack on first turn.",
		onStart(pkmn) {
			pkmn.addVolatile("readiedaction");
		},
		condition: {
			duration: 1,
			onModifyAtk(atk, source, target, move) {
				return this.chainModify(2.0);
			},
		},
	},
	subdue: {
		name: "Subdue",
		shortDesc: "Doubles the power of stat dropping moves.",
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.secondaries) {
				for (const secondary of move.secondaries) {
					if (secondary.boosts) {
						let i: BoostID;
						for (i in secondary.boosts) {
							if (secondary.boosts[i] && secondary.boosts[i]! < 0) {
								return this.chainModify(2.0);
							}
						}
					}
				}
			}
			if (move.secondary) {
				if (move.secondary.boosts) {
					let i: BoostID;
					for (i in move.secondary.boosts) {
						if (
							move.secondary.boosts[i] &&
							move.secondary.boosts[i]! < 0
						) {
							return this.chainModify(2.0);
						}
					}
				}
			}
		},
	},
	crownedsword: {
		name: "Crowned Sword",
		shortDesc: "Combines Intrepid Sword & Anger Point",
		onStart(pokemon) {
			if (this.effectState.swordBoost) return;
			this.effectState.swordBoost = true;
			this.boost({atk: 1}, pokemon);
		},
		onDamagingHit(damage, target, source, move) {
			if (!target.hp) return;
			if (target === source) return;
			if (move?.effectType === "Move" && target.getMoveHitData(move).crit) {
				this.boost({atk: 12}, target, target);
			} else if (move?.effectType === "Move") {
				this.boost({atk: 1}, target, target);
			}
		},
	},
	crownedshield: {
		name: "Crowned Shield",
		shortDesc: "Combines Dauntless Shield & Stamina",
		onStart(pokemon) {
			if (this.effectState.shieldBoost) return;
			this.effectState.shieldBoost = true;
			this.boost({def: 1}, pokemon);
		},
		onDamagingHit(damage, target, source, move) {
			if (!target.hp) return;
			if (target === source) return;
			if (move?.effectType === "Move" && target.getMoveHitData(move).crit) {
				this.boost({def: 12}, target, target);
			} else if (move?.effectType === "Move") {
				this.boost({def: 1}, target, target);
			}
		},
	},
	crownedking: {
		name: "Crowned King",
		shortDesc: "Combines Unnerve & Grim Neigh & Chilling Neigh",
		onStart(this: Battle, pokemon: Pokemon) {
			this.add("-ability", pokemon, "Unnerve");
			this.effectState.unnerved = true;
		},
		onEnd() {
			this.effectState.unnerved = false;
		},
		onFoeTryEatItem() {
			return !this.effectState.unnerved;
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === "Move") {
				this.boost({spa: length}, source);
				this.boost({atk: length}, source);
			}
		},
	},

	berserkDNA: {
		name: "Berserk DNA",
		shortDesc: "Sharply ups highest attacking stat but confuses on entry.",
		onStart(this: Battle, pokemon: Pokemon) {
			if (pokemon.getStat("atk") > pokemon.getStat("spa")) {
				this.boost({atk: 2}, pokemon);
			} else {
				this.boost({spa: 2}, pokemon);
			}
			pokemon.trySetStatus("confusion");
		},
	},

	claptrap: {
		name: "Clap Trap",
		shortDesc: "Counters contact with 50BP Snap Trap.",
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				(this.actions as any).runAdditionalMove(Dex.moves.get("snaptrap"), target, source, {basePower: 50});
			}
		},
	},
	permanence: {
		name: "Permanence",
		shortDesc: "Foes can't heal in any way.",
		onStart(source) {
			for (const foe of source.foes()) {
				foe.addVolatile(
					"healingblocked",
					this.effectState.target,
					Dex.abilities.get("permanence")
				);
			}
		},
		onFoeSwitchIn(foe) {
			foe.addVolatile(
				"healingblocked",
				this.effectState.target,
				Dex.abilities.get("permanence")
			);
		},
		onEnd(source) {
			for (const foe of source.foes()) {
				foe.removeVolatile("healingblocked");
			}
		},
	},
	hubris: {
		name: "Hubris",
		shortDesc: "KOs raise SpA by +1.",
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === "Move") {
				this.boost({spa: length}, source);
			}
		},
	},
	cosmicdaze: {
		name: "Cosmic Daze",
		shortDesc: "2x damage vs confused. Enemies take 2x confusion damage.",
		onFoeModifyDamage(damage, source, target, move) {
			if (move.name === "confused") {
				return this.chainModify(2);
			}
		},
		onModifyDamage(damage, source, target, move) {
			if (target.status === "confusion") {
				return this.chainModify(2);
			}
		},
	},

	bloodprice: {
		name: "Blood Price",
		shortDesc: "Does 30% more damage but lose 10% HP when attacking.",
		onModifyDamage(damage, source, target, move) {
			return this.chainModify(1.3);
		},
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				this.damage(source.baseMaxhp / 10, source, source);
			}
		},
	},
	egoist: {
		name: "Egoist",
		shortDesc: "Raises its own stats when foes raise theirs.",
		onFoeAfterBoost(boost, target, source, effect) {
			const positiveBoosts: Partial<BoostsTable> = {};
			let any = false;
			for (const [stat, change] of Object.entries(boost)) {
				if (change <= 0) continue;
				positiveBoosts[stat as keyof BoostsTable] = change;
				any = true;
			}
			if (!any) return;
			const pokemon = this.effectState.target as Pokemon;
			this.boost(positiveBoosts, pokemon, pokemon, effect, false, false);
		},
	},
	terminalvelocity: {
		name: "Terminal Velocity",
		shortDesc: "Special moves use 20% of its Speed stat additionally.",
		onModifyMove(move) {
			if (!move.flags["contact"]) (move as any).secondaryOffensiveStats = [["spe", 0.2]];
		},
	},
	monsterhunter: {
		name: "Monster Hunter",
		shortDesc: "Deals 1.5x damage to Dark-types.",
		onModifyDamage(damage, source, target, move) {
			if (target.hasType("Dark")) {
				return this.chainModify(1.5);
			}
		},
	},
	flamingjaws: {
		name: "Flaming Jaws",
		shortDesc: "Biting moves have 50% chance to burn the target.",
		onModifyMove(move, mon, target) {
			if (!move?.flags["bite"]) return;
			if (move.secondaries) move.secondaries = [];
			move.secondaries?.push({
				chance: 50,
				status: "brn",
			});
		},
	},
	bassboosted: {
		name: "Bass Boosted",
		shortDesc: "Combines Amplifier & Punk Rock.",
		onModifyMove(move) {
			if (
				move.flags["sound"] &&
				(move.target === "normal" || move.target === "any")
			) {
				move.target = "allAdjacentFoes";
			}
		},
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["sound"]) {
				this.debug("Amplifier boost");
				this.chainModify(1.3);
				this.debug("Punk Rock boost");
				return this.chainModify([5325, 4096]);
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.flags["sound"]) {
				this.debug("Punk Rock weaken");
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
	},
	earlygrave: {
		name: "Early Grave",
		shortDesc:
			"At full HP, gives +1 priority to this Pokémon's Ghost-type moves.",
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.type === "Ghost" && pokemon.hp === pokemon.maxhp) { return priority + 1; }
		},
	},
	phantomthief: {
		name: "Phantom Thief",
		shortDesc: "Uses 40BP Spectral Thief on switch-in.",
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(
				Dex.moves.get("spectralthief"),
				pokemon,
				target,
				{
					basePower: 40,
					onDamagePriority: -20,
					onDamage: (damage: number, moveTarget: Pokemon) => {
						if (damage >= moveTarget.hp) return moveTarget.hp - 1;
					},
				},
			);
		},
	},
	devourer: {
		name: "Devourer",
		shortDesc: "Combines Strong Jaw & Primal Maw.",
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["bite"]) {
				return this.chainModify(1.5);
			}
		},
		onPrepareHit(source, target, move) {
			if (isParentalBondBanned(move, source)) { return; }
			if (move.flags["bite"]) {
				move.multihit = 2;
				(move as { multihitType?: string }).multihitType = "maw";
			}
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			console.log(move.hit, move.secondaries);
			if ((move as { multihitType?: string }).multihitType !== "maw") return;
			if (!secondaries) return;
			if (move.hit <= 1) return;
			secondaries = secondaries.filter((effect) => effect.volatileStatus !== "flinch" || effect.ability || effect.kingsrock);
			return secondaries;
		},
	},
	fortitude: {
		name: "Fortitude",
		shortDesc: "Boosts SpDef +1 when hit. Maxes SpDef on crit.",
		onDamagingHit(damage, target, source, move) {
			if (!target.hp) return;
			if (move?.effectType === "Move" && target.getMoveHitData(move).crit) {
				this.boost({spd: 12}, target, target);
			} else if (move?.effectType === "Move") {
				this.boost({spd: 1}, target, target);
			}
		},
	},
	spiteful: {
		name: "Spiteful",
		shortDesc: "Reduces attacker's PP on contact.",
		onDamagingHit(damage, target, source, move) {
			if (move.flags["contact"]) {
				if (source.lastMove) {
					if (source.lastMove.pp > 0) {
						source.lastMove.pp = Math.max(source.lastMove.pp - 5, 0);
					}
				}
			}
		},
	},
	twostep: {
		name: "Two Step",
		shortDesc: "Triggers 50BP Revelation Dance after using a Dance move.",
		onAfterMove(source, target, move) {
			if (!move.flags["dance"]) return;
			if (!(move as any).succeeded) return;
			const moveMutations = {
				basePower: 50,
			};
			if (target === source) {
				const foe = source.side.randomFoe();
				if (!foe) return;
				target = foe;
			}
			(this.actions as any).runAdditionalMove(
				Dex.moves.get("revelationdance"),
				source,
				target,
				moveMutations
			);
		},
	},
	impulse: {
		name: "Impulse",
		shortDesc: "Non-contact moves use the Speed stat for damage.",
		onModifyMove(move) {
			if (!move.flags["contact"]) {
				move.overrideOffensiveStat = "spe";
			}
		},
	},
	saltcircle: {
		name: "Salt Circle",
		shortDesc: "Prevents opposing pokemon from fleeing on entry.",
		onStart(pokemon) {
			for (const target of pokemon.side.foe.active) {
				target.addVolatile('trapped', pokemon, this.dex.abilities.get('saltcircle'), 'trapper');
			}
		},
	},
	airborne: {
		name: "Airborne",
		shortDesc: "Boosts own & ally's Flying-type moves by 1.3x.",
		onAllyModifyDamage(basePower, attacker, defender, move) {
			if (move.type === "Flying") {
				this.debug("Airborne boost");
				return this.chainModify(1.3);
			}
		},
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.type === "Flying") {
				this.debug("Airborne boost");
				return this.chainModify(1.3);
			}
		},
	},
	showdownmode: {
		name: "Showdown Mode",
		shortDesc: "Combines Ambush & Violent Rush.",
		onStart(pkmn) {
			pkmn.addVolatile("showdownmode");
		},
		condition: {
			duration: 1,
			onModifyMove(move, attacker, defender) {
				move.willCrit = true;
			},
			onModifyAtk(atk, source, target, move) {
				return this.chainModify(1.2);
			},
			onModifySpe(spe, source) {
				return this.chainModify(1.5);
			},
		},
	},
	webspinner: {
		name: "Web Spinner",
		shortDesc: "Uses String Shot on switch-in.",
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(Dex.moves.get("stringshot"), pokemon, target);
		},
	},
	banshee: {
		name: "Banshee",
		shortDesc: "Normal-type sound moves become Ghost- type moves and get a 1.2x boost.",
		onModifyType(move, pokemon) {
			if (move.flags["sound"] && move.type === "Normal" && !pokemon.volatiles["dynamax"]) {
				// hardcode
				move.type = "Ghost";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["sound"] && move.typeChangerBoosted) {
				return this.chainModify(1.2);
			}
		},
	},
	chromecoat: {
		name: "Chrome Coat",
		shortDesc:
			"Reduces special damage taken by 40%, but decreases Speed by 10%.",
		onModifyDamage(damage, source, target, move) {
			if (move.category === "Special") {
				return this.chainModify(0.6);
			}
		},
		onModifySpe(spe, pokemon) {
			return this.chainModify(0.9);
		},
		flags: { breakable: 1 },
	},
	monstermash: {
		name: "Monster Mash",
		shortDesc: "Casts Trick-or-Treat on entry.",
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(Dex.moves.get("trickortreat"), pokemon, target);
		},
	},
	powderburst: {
		name: "Powder Burst",
		shortDesc: "Casts Powder on entry.",
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(Dex.moves.get("powder"), pokemon, target);
		},
	},
	ponypower: {
		name: "Pony Power",
		shortDesc: "Combines Keen Edge & Mystic Blades.",
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["slicing"]) {
				return this.chainModify(1.3 * 1.3);
			}
		},
		onModifyMove(move) {
			if (move.flags["slicing"]) {
				move.overrideDefensiveStat = 'spd';
				move.overrideOffensiveStat = 'spa';
			}
		},
	},
	combustion: {
		name: "Combustion",
		shortDesc: "Boosts the power of Fire-type moves by 1.5x.",
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.type === "Fire") {
				this.debug("Combustion boost");
				return this.chainModify(1.5);
			}
		},
	},
	telekinetic: {
		name: "Telekinetic",
		shortDesc: "Casts Telekinesis on entry.",
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(Dex.moves.get("telekinesis"), pokemon, target);
		},
	},
	fighter: {
		name: "Fighter",
		shortDesc: "Boosts Fight.-type moves by 1.2x, or 1.5x when below 1/3 HP.",
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.type === "Fighting") {
				if (attacker.hp <= attacker.maxhp / 3) {
					this.debug("Fighter boost");
					return this.chainModify(1.5);
				} else {
					this.debug("Fighter boost");
					return this.chainModify(1.2);
				}
			}
		},
	},
	purelove: {
		name: "Pure Love",
		shortDesc: "Infatuates on contact. Heal 25% damage vs infatuated.",
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				source.addVolatile("attract", target);
			}
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (source.status === "attract") {
				this.heal(source.baseMaxhp / 4, source, source);
			}
		},
	},
	fertilize: {
		name: "Fertilize",
		shortDesc:
			"Normal-type moves become Grass- type moves and get a 1.1x boost.",
		onModifyMove(move) {
			if (move.type === "Normal") {
				move.type = "Grass";
			}
		},
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.type === "Grass") {
				this.debug("Fertilize boost");
				return this.chainModify(1.1);
			}
		},
	},
	determination: {
		name: "Determination",
		shortDesc: "Ups Special Attack by 50% if suffering.",
		onModifyDamage(atk, pokemon, target, move) {
			if (pokemon.status && move.category === 'Special') {
				return this.chainModify(1.5);
			}
		},
	},
	mysticblades: {
		name: "Mystic Blades",
		shortDesc: "Keen edge moves become special and deal 30% more damage.",
		onModifyMove(move) {
			if (move.flags["slicing"]) {
				move.overrideDefensiveStat = "spd";
				move.overrideOffensiveStat = "spa";
			}
		},
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["slicing"]) {
				this.debug("Mystic Blades boost");
				return this.chainModify(1.3);
			}
		},
	},
	changeofheart: {
		name: "Change of Heart",
		shortDesc: "Uses Heart Swap on switch-in.",
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(Dex.moves.get("heartswap"), pokemon, target);
		},
	},
	hightide: {
		name: "High Tide",
		shortDesc: "Triggers 50 BP Surf after using a Water-type move.",
		onAfterMove(source, target, move) {
			if (move.type !== "Water") { return; }
			if (!(move as any).succeeded) return;
			const moveMutations = {
				basePower: 50,
			};
			(this.actions as any).runAdditionalMove(
				Dex.moves.get("surf"),
				source,
				target,
				moveMutations
			);
		},
	},
	seaborne: {
		name: "Seaborne",
		shortDesc: "Combines Drizzle & Swift Swim.",
		onStart(source) {
			for (const action of this.queue) {
				if (
					(action as { choice?: string }).choice === "runPrimal" &&
					action.pokemon === source &&
					source.species.id === "kyogre"
				) { return; }
				if ((action as { choice?: string }).choice !== "runSwitch" && (action as { choice?: string }).choice !== "runPrimal") { break; }
			}
			this.field.setWeather("raindance");
		},
		onModifySpe(spe, pokemon) {
			if (
				["raindance", "primordialsea"].includes(pokemon.effectiveWeather())
			) {
				return this.chainModify(1.5);
			}
		},
	},
	purifyingwaters: {
		name: "Purifying Waters",
		shortDesc: "Combines Hydration & Water Veil.",
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			if (
				pokemon.status &&
				["raindance", "primordialsea"].includes(pokemon.effectiveWeather())
			) {
				this.debug("hydration");
				this.add("-activate", pokemon, "ability: Hydration");
				pokemon.cureStatus();
			}
		},
		onUpdate(pokemon) {
			if (pokemon.status === "brn") {
				this.add("-activate", pokemon, "ability: Water Veil");
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== "brn") return;
			if ((effect as Move)?.status) {
				this.add("-immune", target, "[from] ability: Water Veil");
			}
			return false;
		},
		flags: { breakable: 1 },
	},
	heavenasunder: {
		name: "Heaven Asunder",
		shortDesc: "Spacial Rend always crits. Ups crit level by +1.",
		onModifyCritRatio(critRatio, source, target, move) {
			if (move?.name === "spacialrend") {
				return critRatio + 12;
			} else {
				return critRatio + 1;
			}
		},
	},
	refridgerate: {
		name: "Refridgerate",
		shortDesc:
			"Normal-type moves become Ice- type moves and get a 1.1x boost.",
		onModifyMove(move) {
			if (move.type === "Normal") {
				move.type = "Ice";
			}
		},
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.type === "Ice") {
				this.debug("Refridgerate boost");
				return this.chainModify(1.1);
			}
		},
	},
	refridgerator: {
		name: "Refridgerator",
		shortDesc: "Combines Refrigerate & Illuminate.",
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy) {
			if (typeof accuracy !== "number") return;
			this.debug("compoundeyes - enhancing accuracy");
			return this.chainModify(1.2);
		},
		onModifyMove(move) {
			if (move.type === "Normal") {
				move.type = "Ice";
			}
		},
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.type === "Ice") {
				this.debug("Refridgerate boost");
				return this.chainModify(1.1);
			}
		},
	},
	suppress: {
		name: "Suppress",
		shortDesc: "Casts Torment on entry",
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(Dex.moves.get("torment"), pokemon, target);
		},
	},
	yukionna: {
		name: "Yuki Onna",
		shortDesc: "Scare + Intimidate. 10% chance to infatuate on hit.",
		onStart(pokemon) {
			let activated = false;
			for (const target of pokemon.adjacentFoes()) {
				if (!activated) {
					this.add("-ability", pokemon, "Yuki Onna", "boost");
					activated = true;
				}
				if (target.volatiles["substitute"]) {
					this.add("-immune", target);
				} else {
					this.boost({spa: -1, atk: -1}, target, pokemon, null, true);
				}
			}
		},
		onModifyMove(move) {
			if (!move?.flags["contact"] || move.target === "self") return;
			if (!move.secondaries) {
				move.secondaries = [];
			}
			move.secondaries.push({
				chance: 10,
				status: "attract",
				ability: this.dex.abilities.get("yukionna"),
			});
		},
	},
	doombringer: {
		name: "Doombringer",
		shortDesc: "Uses Doom Desire on switch-in.",
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(Dex.moves.get("doomdesire"), pokemon, target);
		},
	},
	arcaneforce: {
		name: "Arcane Force",
		shortDesc: "All moves gain STAB. Ups “supereffective” by 10%.",
		onModifyMove(move) {
			move.forceSTAB = true;
		},
		onModifyDamage(damage, source, target, move) {
			if (target.runEffectiveness(move) > 0) this.chainModify(1.1);
		},
	},
	freezingpoint: {
		name: "Freezing Point",
		shortDesc: "30% chance to get frostbitten on contact.",
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.trySetStatus("frz", target);
				}
			}
		},
		onModifyMove(move) {
			if (!move?.flags["contact"] || move.target === "self") return;
			if (!move.secondaries) {
				move.secondaries = [];
			}
			move.secondaries.push({
				chance: 30,
				status: "frz",
				ability: this.dex.abilities.get("freezinpoint"),
			});
		},
	},
	peacefulslumber: {
		name: "Peaceful Slumber",
		shortDesc: "Combines Sweet Dreams & Self Sufficient.",
		onResidualOrder: 30,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			if (pokemon.status === "slp" || pokemon.hasAbility("comatose")) {
				this.heal(pokemon.baseMaxhp / 16);
			}
			this.heal(pokemon.baseMaxhp / 16);
		},
	},
	enlightened: {
		name: "Enlightened",
		shortDesc: "Combines Emanate & Inner Focus.",
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				"judgment",
				"multiattack",
				"naturalgift",
				"revelationdance",
				"technoblast",
				"terrainpulse",
				"weatherball",
			];
			if (
				move.type === "Normal" &&
				!noModifyType.includes(move.id) &&
				!(move.isZ && move.category !== "Status") &&
				!(move.name === "Tera Blast" && pokemon.terastallized)
			) {
				move.type = "Psychic";
				move.typeChangerBoosted = this.effect;
			}
		},
		onModifyDamage(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) { return this.chainModify(1.1); }
		},
		onTryAddVolatile(status, pokemon) {
			if (status.id === "flinch") return null;
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === "Intimidate" && boost.atk) {
				delete boost.atk;
				this.add(
					"-fail",
					target,
					"unboost",
					"Attack",
					"[from] ability: Inner Focus",
					"[of] " + target
				);
			}
		},
		flags: { breakable: 1 },
	},
	tippingpoint: {
		name: "Tipping Point",
		shortDesc: "Getting hit raises Sp. Atk. Critical hits maximize Sp. Atk.",
		onDamagingHit(damage, target, source, move) {
			if (!target.hp) return;
			if (target === source) return;
			if (move?.effectType === "Move" && target.getMoveHitData(move).crit) {
				this.boost({spa: 12}, target, target);
			} else if (move?.effectType === "Move") {
				this.boost({spa: 1}, target, target);
			}
		},
	},
	superstrain: {
		name: "Super Strain",
		shortDesc: "KOs lower Attack by +1. Take 25% recoil damage.",
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === "Move") {
				this.boost({atk: -1}, source);
			}
		},
		onModifyDamage(damage, source, target, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				this.damage(source.baseMaxhp / 4, source, source);
			}
		},
	},
	primandproper: {
		name: "Prim and Proper",
		shortDesc: "Combines Wonder Skin & Cute Charm.",
		onModifyAccuracyPriority: 10,
		onModifyAccuracy(accuracy, target, source, move) {
			if (move.category === "Status" && typeof accuracy === "number") {
				this.debug("Wonder Skin - setting accuracy to 50");
				return 50;
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.addVolatile("attract", this.effectState.target);
				}
			}
		},
		flags: { breakable: 1 },
	},
	soothingaroma: {
		name: "Soothing Aroma",
		shortDesc: "Cures party status on entry.",
		onStart(pokemon) {
			for (const ally of pokemon.side.pokemon) {
				if (ally !== pokemon) {
					ally.cureStatus();
				}
			}
		},
	},
	naturalrecovery: {
		name: "Natural Recovery",
		shortDesc: "Combines Natural Cure & Regenerator.",
		onCheckShow(pokemon) {
			// This is complicated
			// For the most part, in-game, it's obvious whether or not Natural Cure activated,
			// since you can see how many of your opponent's pokemon are statused.
			// The only ambiguous situation happens in Doubles/Triples, where multiple pokemon
			// that could have Natural Cure switch out, but only some of them get cured.
			if (pokemon.side.active.length === 1) return;
			if (pokemon.showCure === true || pokemon.showCure === false) return;

			const cureList = [];
			let noCureCount = 0;
			for (const curPoke of pokemon.side.active) {
				// pokemon not statused
				if (!curPoke?.status) {
					// this.add('-message', "" + curPoke + " skipped: not statused or doesn't exist");
					continue;
				}
				if (curPoke.showCure) {
					// this.add('-message', "" + curPoke + " skipped: Natural Cure already known");
					continue;
				}
				const species = curPoke.species;
				// pokemon can't get Natural Cure
				if (!Object.values(species.abilities).includes("Natural Cure")) {
					// this.add('-message', "" + curPoke + " skipped: no Natural Cure");
					continue;
				}
				// pokemon's ability is known to be Natural Cure
				if (!species.abilities["1"] && !species.abilities["H"]) {
					// this.add('-message', "" + curPoke + " skipped: only one ability");
					continue;
				}
				// pokemon isn't switching this turn
				if (curPoke !== pokemon && !this.queue.willSwitch(curPoke)) {
					// this.add('-message', "" + curPoke + " skipped: not switching");
					continue;
				}

				if (curPoke.hasAbility("naturalcure")) {
					// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (and is)");
					cureList.push(curPoke);
				} else {
					// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (but isn't)");
					noCureCount++;
				}
			}

			if (!cureList.length || !noCureCount) {
				// It's possible to know what pokemon were cured
				for (const pkmn of cureList) {
					pkmn.showCure = true;
				}
			} else {
				// It's not possible to know what pokemon were cured

				// Unlike a -hint, this is real information that battlers need, so we use a -message
				this.add(
					"-message",
					"(" +
						cureList.length +
						" of " +
						pokemon.side.name +
						"'s pokemon " +
						(cureList.length === 1 ? "was" : "were") +
						" cured by Natural Cure.)"
				);

				for (const pkmn of cureList) {
					pkmn.showCure = false;
				}
			}
		},
		onSwitchOut(pokemon) {
			if (!pokemon.foes().some(it => it.hasAbility("permanence"))) {
				pokemon.heal(pokemon.baseMaxhp / 3);
			}
			if (!pokemon.status) return;

			// if pokemon.showCure is undefined, it was skipped because its ability
			// is known
			if (pokemon.showCure === undefined) pokemon.showCure = true;

			if (pokemon.showCure) {
				this.add(
					"-curestatus",
					pokemon,
					pokemon.status,
					"[from] ability: Natural Cure"
				);
			}
			pokemon.clearStatus();

			// only reset .showCure if it's false
			// (once you know a Pokemon has Natural Cure, its cures are always known)
			if (!pokemon.showCure) pokemon.showCure = undefined;
		},
	},
	sandguard: {
		name: "Sand Guard",
		shortDesc:
			"Blocks priority and reduces special damage taken by 1/2 in sand.",
		onFoeTryMove(target, source, move) {
			if (!this.field.isWeather("sandstorm")) return;
			const targetAllExceptions = [
				"perishsong",
				"flowershield",
				"rototiller",
			];
			if (
				move.target === "foeSide" ||
				(move.target === "all" && !targetAllExceptions.includes(move.id))
			) {
				return;
			}

			const dazzlingHolder = this.effectState.target;
			if (
				(source.isAlly(dazzlingHolder) || move.target === "all") &&
				move.priority > 0.1
			) {
				this.attrLastMove("[still]");
				this.add(
					"cant",
					dazzlingHolder,
					"ability: Sand Guard",
					move,
					"[of] " + target
				);
				return false;
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (this.field.isWeather("sandstorm") && move.category === "Special") {
				return this.chainModify(0.5);
			}
		},
		flags: { breakable: 1 },
	},
	trickster: {
		name: "Trickster",
		shortDesc: "Uses Disable on switch-in.",
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(Dex.moves.get("disable"), pokemon, target);
		},
	},
	berserkerrage: {
		name: "Berserker Rage",
		shortDesc: "Combines Berserk & Rampage.",
		onDamage(damage, target, source, effect) {
			if (
				effect.effectType === "Move" &&
				!effect.multihit &&
				!(effect as any).negateSecondary &&
				!(effect.hasSheerForce && source.hasAbility("sheerforce"))
			) {
				this.effectState.checkedBerserk = false;
			} else {
				this.effectState.checkedBerserk = true;
			}
		},
		onTryEatItem(item) {
			const healingItems = [
				"aguavberry",
				"enigmaberry",
				"figyberry",
				"iapapaberry",
				"magoberry",
				"sitrusberry",
				"wikiberry",
				"oranberry",
				"berryjuice",
			];
			if (healingItems.includes(item.id)) {
				return this.effectState.checkedBerserk;
			}
			return true;
		},
		onAfterMoveSecondary(target, source, move) {
			this.effectState.checkedBerserk = true;
			if (!source || source === target || !target.hp || !move.totalDamage) { return; }
			const lastAttackedBy = target.getLastAttackedBy();
			if (!lastAttackedBy) return;
			const damage = move.multihit ?
				move.totalDamage :
				lastAttackedBy.damage;
			if (
				target.hp <= target.maxhp / 2 &&
				target.hp + damage > target.maxhp / 2
			) {
				this.boost({spa: 1}, target, target);
			}
		},
		onAfterMove(source, target, move) {
			if (target && target.hp <= 0) {
				if (source.volatiles["mustrecharge"]) {
					source.removeVolatile("mustrecharge");
				}
			}
		},
	},
	dustcloud: {
		name: "Dust Cloud",
		shortDesc: "Attacks with Sand Attack on switch-in.",
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(Dex.moves.get("sandattack"), pokemon, target);
		},
	},
	moonspirit: {
		name: "Moon Spirit",
		shortDesc: "Fairy & Dark gains STAB. Moonlight recovers 75% HP.",
		onModifyMove(move) {
			if (move.type === "Fairy" || move.type === "Dark") {
				move.forceSTAB = true;
			}
		},
		// Moonlight effectiveness implemented in moves file
	},
	generator: {
		name: "Generator",
		shortDesc: "Charges up on entry.",
		onSwitchIn(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(Dex.moves.get("charge"), pokemon, target);
		},
	},
	itchydefense: {
		name: "Itchy Defense",
		shortDesc: "Causes infestation when hit by a contact move.",
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				source.addVolatile("infestation", target);
			}
		},
	},
	frostburn: {
		name: "Frost Burn",
		shortDesc: "Triggers 40BP Ice Beam after using a Fire-type move.",
		onAfterMove(source, target, move) {
			if (move.type !== "Fire") { return; }
			if (!(move as any).succeeded) return;
			const moveMutations = {
				basePower: 40,
			};
			(this.actions as any).runAdditionalMove(
				Dex.moves.get("icebeam"),
				source,
				target,
				moveMutations
			);
		},
	},
	accelerate: {
		name: "Accelerate",
		shortDesc: "Moves that need a charge turn are now used instantly.",
		onChargeMove(pokemon, target, move) {
			this.add("-activate", pokemon, "ability: Accelerate");
			return false;
		},
	},
	inverseroom: {
		name: "Inverse Room",
		shortDesc: "Sets up the Inverse field condition for 3 turns upon entry.",
		onStart(source) {
			this.add("-activate", source, "ability: Inverse Room");
			this.field.addPseudoWeather("inverseroom", source, source.getAbility());
		},
	},
	superslammer: {
		name: "Super Slammer",
		shortDesc: "Boosts the power of hammer and slamming moves by 1.3x.",
		onModifyDamage(basePower, attacker, defender, move) {
			if ((move.flags as any)["hammer"] || (move.flags as any)["slam"]) {
				this.debug("Super Slammer boost");
				return this.chainModify(1.3);
			}
		},
	},
	coldplasma: {
		name: "Cold Plasma",
		shortDesc: "Electric type moves now inflict burn instead of paralysis.",
		onModifyMove(move, source, target) {
			if (move.type !== "Electric") return;
			if (
				move.secondary &&
				move.secondary.status &&
				move.secondary.status === "par"
			) {
				// Replace individual paralyze effect chances with brn.
				move.secondary.status = "brn";
			}
			if (move.secondaries) {
				for (const secondary of move.secondaries) {
					// Ignore any secondaries that aren't paralysis chance.
					if (!secondary.status || secondary.status !== "par") return;
					// Replace the paralysis with burn.
					secondary.status = "brn";
				}
			}
		},
	},
	archer: {
		name: "Archer",
		shortDesc: "Boosts the power of arrow moves by 1.3x.",
		onModifyDamage(basePower, attacker, defender, move) {
			if ((move.flags as any)["arrow"]) {
				this.debug("Archer boost");
				return this.chainModify(1.3);
			}
		},
	},
	rockhardwill: {
		name: "Rockhard Will",
		shortDesc: "Boosts Rock-type moves by 1.2x, or 1.5x when under 1/3 HP.",
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.type === "Rock") {
				if (attacker.hp <= attacker.maxhp / 3) {
					this.debug("Rockhard Will boost");
					return this.chainModify(1.5);
				} else {
					this.debug("Rockhard Will boost");
					return this.chainModify(1.2);
				}
			}
		},
	},
	demolitionist: {
		name: "Demolitionist",
		shortDesc:
			"Doubles attack, ignores protect, and breaks screens on first attack.",
		onStart(pkmn) {
			pkmn.addVolatile("readiedaction");
		},
		onTryHit(target, source) {
			if (!source.getVolatile("readiedaction")) return;
			target.side.removeSideCondition('reflect');
			target.side.removeSideCondition('lightscreen');
			target.side.removeSideCondition('auroraveil');
		},
		onModifyMove(move, source) {
			if (!source.getVolatile("readiedaction")) return;
			if (move.flags["protect"]) delete move.flags["protect"];
		},
	},
	flamingmaw: {
		name: "Flaming Maw",
		shortDesc: "Strong Jaw + Flaming Jaws",
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["bite"]) {
				return this.chainModify(1.5);
			}
		},
		onModifyMove(move, mon, target) {
			if (!move?.flags["bite"]) return;
			if (move.secondaries) move.secondaries = [];
			move.secondaries?.push({
				chance: 50,
				status: "brn",
			});
		},
	},
	balloonbomb: {
		name: "Balloon Bomb",
		shortDesc: "Aftermath + Inflatable",
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (
				!target.hp &&
				this.checkMoveMakesContact(move, source, target, true)
			) {
				this.damage(source.baseMaxhp / 4, source, target);
			}
		},
		onTryHit(target, source, move) {
			if (
				target !== source &&
				(move.type === "Flying" || move.type === "Fire")
			) {
				if (!this.boost({def: 1, spd: 1})) {
					this.add("-immune", target, "[from] ability: Inflatable");
					return null;
				}
			}
		},
		flags: { breakable: 1 },
	},
	appleenlightenment: {
		name: "Apple Enlightenment",
		shortDesc: "Fur coat + Magic Guard.",
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category === "Physical") {
				return this.chainModify(0.5);
			}
		},
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== "Move") {
				if (effect.effectType === "Ability") { this.add("-activate", source, "ability: " + effect.name); }
				return false;
			}
		},
		flags: { breakable: 1 },
	},
	rejection: {
		name: "Rejection",
		shortDesc: "Applies Quash on switch-in.",
		onStart(pokemon) {
			const target = (pokemon as any).oppositeFoe();
			if (!target) return;
			(this.actions as any).runAdditionalMove(Dex.moves.get("quash"), pokemon, target);
		},
	},
	entrance: {
		name: "Entrance",
		shortDesc: "Confusion also inflicts infatuation.",
	},
	aftershock: {
		name: "Aftershock",
		shortDesc: "Triggers Magnitude 4-7 after using a damaging move.",
		onAfterMove(source, target, move) {
			if (!move || move.category === "Status") return;
			if (move.damage === 0) return;
			if (!(move as any).succeeded) return;
			this.add("-activate", source, "ability: Aftershock");
			const aftershock = Dex.moves.get("magnitude") as ActiveMove;

			// / Magnitude 4-7 is 0->65.
			// / Defined in moves.ts onModifyMove.
			const i = this.random(65);

			if (i < 5) {
				aftershock.magnitude = 4;
				aftershock.basePower = 10;
			} else if (i < 15) {
				aftershock.magnitude = 5;
				aftershock.basePower = 30;
			} else if (i < 35) {
				aftershock.magnitude = 6;
				aftershock.basePower = 50;
			} else if (i < 65) {
				aftershock.magnitude = 7;
				aftershock.basePower = 70;
			}

			(this.actions as any).runAdditionalMove(aftershock, source, target);
		},
	},
	retriever: {
		name: "Retriever",
		shortDesc: "Retrieves item on switch-out",

		onSwitchOut(pokemon) {
			// TODO: Should retriever support knocked off items?
			if (!pokemon.hasAbility("Retriever")) return;
			if (!pokemon.lastItem) return;
			pokemon.setItem(pokemon.lastItem);
			pokemon.lastItem = "";

			this.add(
				"-item",
				pokemon,
				pokemon.getItem(),
				"[from] ability: Retriever"
			);
		},
	},
	// / No business logic required here.
	// / Check the partiallytrapped condition in conditions.ts.
	grappler: {
		name: "Grappler",
		shortDesc: "Trapping moves last 6 turns. Trapping deals 1/6 HP.",
	},
	parroting: {
		name: "Parroting",
		shortDesc: "Copies sound moves used by others. Immune to sound.",
		onTryHit(target, source, move) {
			if (move.flags['sound']) {
				this.add('-immune', target, '[from] ability: Parroting');
				return null;
			}
		},
		onAnyAfterMove(source, target, move) {
			// / Don't activate on ourself.
			if (source === this.effectState.target) return;
			if (!move.flags.sound) return;
			this.add("-activate", this.effectState.target, "ability: Parroting");
			(this.actions as any).runAdditionalMove(Dex.moves.get(move.id), this.effectState.target, target);
			this.effectState.target.activeMoveActions--;
		},
		flags: { breakable: 1 },
	},
	aerialist: {
		flags: { breakable: 1 },
		name: "Aerialist",
		shortDesc: "Combines Levitate & Flock.",
		// Levitate defined in sim/pokemon.ts
		onModifyDamage(atk, attacker, defender, move) {
			if (move && move.type === "Flying") {
				if (attacker.hp <= attacker.maxhp / 3) {
					this.debug("Flock Circuit boost");
					return this.chainModify(1.5);
				} else {
					this.debug("Flock Circuit boost");
					return this.chainModify(1.2);
				}
			}
		},
	},
	contempt: {
		name: "Contempt",
		shortDesc:
			"Ignores opposing stat changes. Boosts Attack when stat lowered.",
		onAnyModifyBoost(boosts, pokemon) {
			const unawareUser = this.effectState.target;
			if (unawareUser === pokemon) return;
			if (
				unawareUser === this.activePokemon &&
				pokemon === this.activeTarget
			) {
				boosts["def"] = 0;
				boosts["spd"] = 0;
				boosts["evasion"] = 0;
			}
			if (
				pokemon === this.activePokemon &&
				unawareUser === this.activeTarget
			) {
				boosts["atk"] = 0;
				boosts["def"] = 0;
				boosts["spa"] = 0;
				boosts["accuracy"] = 0;
			}
		},
		onAfterEachBoost(boost, target, source, effect) {
			if (!source || target.isAlly(source)) {
				if (effect.id === "stickyweb") {
					this.hint(
						"Court Change Sticky Web counts as lowering your own Speed, and Contempt only affects stats lowered by foes.",
						true,
						source.side
					);
				}
				return;
			}
			let statsLowered = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					statsLowered = true;
				}
			}
			if (statsLowered) {
				this.boost({atk: 1}, target, target, null, false, true);
			}
		},
		flags: { breakable: 1 },
	},
	desertspirit: {
		name: "Desert Spirit",
		shortDesc: "Summons sand on entry. Ground moves hit airborne in sand.",
		onStart(source) {
			this.field.setWeather("sandstorm");
		},
		// This isn't in-line with things like magnetic rise and gravity yet, so prob should do that later.
		onModifyMove(move, source, target) {
			if (!target) return;
			if (!this.field.isWeather("sandstorm") || move.type !== "Ground") return;

			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity["Ground"] = true;
			}
			(move as any).onNegateImmunity = () => "levitate";
		},
	},
	flourish: {
		name: "Flourish",
		shortDesc: "Boosts Grass moves by 50% in grassy terrain.",
		onModifyDamage(basePower, attacker, defender, move) {
			if (this.field.isTerrain("grassyterrain") && move.type === "Grass") {
				this.debug("Flourish boost");
				return this.chainModify(1.5);
			}
		},
	},
	lawnmower: {
		name: "Lawnmower",
		shortDesc: "Removes terrain on switch-in. Stat up if terrain removed.",
		onStart(source) {
			if (this.field.terrain) {
				this.field.clearTerrain();
				this.boost({atk: 1, spa: 1, def: 1, spd: 1, spe: 1}, source);
			}
		},
	},
	mythicalarrows: {
		name: "Mythical Arrows",
		shortDesc: "Arrow moves become special and deal 30% more damage.",
		onModifyMove(move) {
			if ((move.flags as any)["arrow"]) {
				move.overrideOffensiveStat = 'spa';
				move.overrideDefensiveStat = 'spd';
			}
		},
		onModifyDamage(basePower, attacker, defender, move) {
			if ((move.flags as any)["arrow"]) {
				this.debug("Mythical Arrows boost");
				return this.chainModify(1.3);
			}
		},
	},
	brawlingwyvern: {
		name: "Brawling Wyvern",
		shortDesc: "Dragon type moves become punching moves.",
		onModifyMovePriority: 10,
		onModifyMove(move) {
			if (move.type === "Dragon") {
				move.flags["punch"] = 1;
			}
		},
	},
	deadpower: {
		name: "Dead Power",
		shortDesc: "1.5x Attack boost. 20% chance to curse on contact moves.",
		onModifyAtkPriority: 5,
		onModifyAtk(atk) {
			return this.chainModify(1.5);
		},
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(2, 10)) {
					source.trySetStatus("curse", target);
				}
			}
		},
	},
	malicious: {
		name: "Malicious",
		shortDesc: "Lowers the foe's highest Attack and Defense stat.",
		onStart(pokemon) {
			// grab all foes
			const foes = pokemon.side.foes();
			// grab the highest attack and defense stat
			for (const foe of foes) {
				if (foe.getStat("atk", false, true) > foe.getStat("spa", false, true)) {
					this.boost({atk: -1}, foe, pokemon);
				} else {
					this.boost({spa: -1}, foe, pokemon);
				}
				if (foe.getStat("def", false, true) > foe.getStat("spd", false, true)) {
					this.boost({def: -1}, foe, pokemon);
				} else {
					this.boost({spd: -1}, foe, pokemon);
				}
			}
		},
	},
	ole: {
		name: "Ole!",
		shortDesc: "20% chance to evade physical moves.",
		onTryHit(target, source, move) {
			if (move.category === "Physical") {
				if (this.randomChance(2, 10)) {
					this.add("-miss", target);
					return null;
				}
			}
		},
	},
	radiojam: {
		name: "Radio Jam",
		shortDesc: "Sound-based moves inflict disable.",
		onDamagingHit(damage, target, source, move) {
			if (move.flags["sound"]) {
				target.addVolatile("disable", source);
			}
		},
	},
	noisecancel: {
		name: "Noise Cancel",
		shortDesc: "Protects the party from sound-based moves.",
		onAllyTryHit(target, source, move) {
			if (target !== source && move.flags["sound"]) {
				this.add("-immune", target, "[from] ability: Noise Cancel");
				return null;
			}
		},
		onAllyTryHitSide(target, source, move) {
			if (move.flags["sound"]) {
				this.add(
					"-immune",
					this.effectState.target,
					"[from] ability: Noise Cancel"
				);
			}
		},
		flags: { breakable: 1 },
	},
	hauntingfrenzy: {
		name: "Haunting Frenzy",
		shortDesc: "20% chance to flinch the opponent. +1 speed on kill.",
		onModifyMove(move) {
			if (move.category === 'Status' || move.target === 'self') return;
			if (!move.secondaries) {
				move.secondaries = [];
			}
			move.secondaries.push({
				chance: 20,
				volatileStatus: "flinch",
				ability: this.dex.abilities.get("hauntingfrenzy"),
			});
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === "Move") {
				this.boost({spe: 1}, source);
			}
		},
	},
	moltenblades: {
		name: "Molten Blades",
		shortDesc: "Keen Edge + Keen Edge moves have a 20% chance to burn.",
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["slicing"]) {
				return this.chainModify([5325, 4096]);
			}
		},
		onModifyMove(move) {
			if (move.flags["slicing"]) {
				if (!move.secondaries) {
					move.secondaries = [];
				}
				move.secondaries.push({
					chance: 20,
					status: "brn",
					ability: this.dex.abilities.get("moltenblades"),
				});
			}
		},
	},
	minioncontrol: {
		name: "Minion Control",
		shortDesc: "Moves hit an extra time for each healthy party member.",
		onPrepareHit(source, target, move) {
			if (isParentalBondBanned(move, source)) { return; }

			let allyCount = 0;
			for (const ally of source.side.pokemon) {
				if (ally !== source) {
					if (ally.hp > 0) {
						allyCount++;
					}
				}
			}
			move.multihit = allyCount;
			(move as { multihitType?: string }).multihitType = "minion";
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			console.log(move.hit, move.secondaries);
			if ((move as { multihitType?: string }).multihitType !== "minion") return;
			if (!secondaries) return;
			if (move.hit <= 1) return;
			secondaries = secondaries.filter((effect) => effect.ability || effect.kingsrock);
			return secondaries;
		},
	},
	celestialblessing: {
		name: "Celestial Blessing",
		shortDesc: "Recovers 1/12 of its health each turn under Misty Terrain.",
		onResidualOrder: 5,
		onResidualSubOrder: 1,
		onResidual(pokemon) {
			if (this.field.isTerrain("mistyterrain")) {
				this.heal(pokemon.baseMaxhp / 12);
			}
		},
	},
	blademaster: {
		name: "Blade Master",
		shortDesc: "Combines Sweeping Edge & Keen Edge.",
		onModifyMove(move) {
			if (move.flags["slicing"]) {
				move.accuracy = true;
				if (move.target === "normal" || move.target === "any") { move.target = "allAdjacentFoes"; }
			}
		},
		onModifyDamage(basePower, attacker, defender, move) {
			if (move.flags["slicing"]) {
				return this.chainModify([5325, 4096]);
			}
		},
	},
	pinnacleblade: {
		name: "Pinnacle Blade",
		shortDesc: "Movimentos de corte sempre acertam, quebram Protect e ignoram barreiras de Substituto.",
		onModifyMove(move) {
			if (!move.flags["slicing"]) return;

			// Força acerto automático nos movimentos de corte
			move.accuracy = true;

			// Permite quebrar Protect (e similares) ao acertar
			move.breaksProtect = true;

			// Ignora Substituto/“barreira” no alvo
			(move.flags as any).bypasssub = 1;
		},
		rating: 4,
		num: 901,
		gen: 8,
	},
	catastrophe: {
		name: "Catastrophe",
		shortDesc: "Sun boosts Water. Rain boosts Fire.",
		onModifyDamage(basePower, attacker, defender, move) {
			if (this.field.isWeather("sunnyday") && move.type === "Water") {
				this.debug("Catastrophe boost");
				return this.chainModify(2);
			}
			if (this.field.isWeather("raindance") && move.type === "Fire") {
				this.debug("Catastrophe boost");
				return this.chainModify(2);
			}
		},
	},
	ironserpent: {
		name: "Iron Serpent",
		shortDesc: "Ups “supereffective” by 33%.",
		onModifyDamage(damage, source, target, move) {
			if (target.runEffectiveness(move) > 0) {
				return this.chainModify(1.33);
			}
		},
	},
	wingedking: {
		name: "Winged King",
		shortDesc: "Ups “supereffective” by 33%.",
		onModifyDamage(damage, source, target, move) {
			if (target.runEffectiveness(move) > 0) {
				return this.chainModify(1.33);
			}
		},
	},
	sunbasking: {
		onUpdate(pokemon) {
			// Cura o status se o sol estiver ativo
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather()) && pokemon.status) {
				this.add("-activate", pokemon, "ability: Sun Basking");
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			// Impede novos status se o sol estiver ativo
			if (!['sunnyday', 'desolateland'].includes(target.effectiveWeather())) return;
			if (!status) return;
			if ((effect as Move)?.status) {
				this.add("-immune", target, "[from] ability: Sun Basking");
			}
			return false;
		},
		onFoePrepareHit(source, target, move) {
			// Imunidade a prioridade (estilo Dazzling/Queenly Majesty)
			// Verifica se o sol está ativo E se o golpe tem prioridade maior que 0
			if (this.field.isWeather(['sunnyday', 'desolateland']) && move.priority > 0) {
				this.add('-activate', target, 'ability: Sun Basking');
				return false;
			}
		},
		flags: { breakable: 1 },
		name: "Sun Basking",
		shortDesc: "Sob o Sol, o usuário é imune a status e golpes de prioridade.",
	},
	gallantry: {
		name: "Gallantry",
		shortDesc: "Gets no damage for first hit",
		onDamage(damage, mon, source, effect) {
			if (mon === source) return;
			if (damage <= 0) return;
			if (effect.effectType !== "Move") return;
			const pasG = ((mon as any).permanentAbilityState ??= {});
			pasG["gallantry"] = pasG["gallantry"] || 0;
			if (pasG["gallantry"] >= 1) return;
			pasG["gallantry"]++;
			this.add("-activate", mon, "ability: Gallantry");
			return 0;
		},
		flags: { breakable: 1 },
	},
	thickskin: {
		name: "Thick Skin",
		shortDesc: "Takes 25% less damage from Super-effective moves.",
		onSourceModifyDamage(damage, source, target, move) {
			if (target.runEffectiveness(move) > 0) {
				return this.chainModify(0.75);
			}
		},
	},
	sharingiscaring: {
		name: "Sharing is Caring",
		shortDesc: "Stat changes are shared between all battlers.",
		onAnyAfterBoost(boost, target, source, effect) {
			const sharingiscaring = this.dex.abilities.get("sharingiscaring");

			if (effect.id === sharingiscaring.id) return;

			for (const pokemon of target.foes()) {
				if (pokemon === target) continue;
				this.boost(boost, pokemon, this.effectState.target, effect, false, false);
			}
			for (const pokemon of target.allies()) {
				if (pokemon === target) continue;
				this.boost(boost, pokemon, this.effectState.target, effect, false, false);
			}
		},
	},
	sharpedges: {
		name: "Sharp Edges",
		shortDesc: "1/6 HP damage when touched.",
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.damage(source.baseMaxhp / 6, source, target);
			}
		},
	},
	rapidresponse: {
		name: "Rapid Response",
		shortDesc: "Boosts Speed by 50% + SpAtk by 20% on first turn.",
		onStart(pkmn) {
			pkmn.addVolatile("rapidresponse");
		},
		condition: {
			duration: 1,
			onModifySpA(atk, source, target, move) {
				return this.chainModify(1.2);
			},
			onModifySpe(spe, source) {
				return this.chainModify(1.5);
			},
		},
	},
	watchyourstep: {
		name: "Watch Your Step",
		shortDesc: "Spreads two layers of Spikes on switch-in.",
		onStart(pokemon) {
			const side = pokemon.side.foe;
			const spikes = side.sideConditions["spikes"];
			if (!spikes || spikes.layers < 3) {
				this.add("-activate", pokemon, "ability: Watch your Step");
				side.addSideCondition("spikes", pokemon);
			}
			if (!spikes || spikes.layers < 3) {
				this.add("-activate", pokemon, "ability: Watch your Step");
				side.addSideCondition("spikes", pokemon);
			}
		},
	},
	firescales: {
		flags: { breakable: 1 },
		name: "Fire Scales",
		shortDesc:
			"Halves damage taken by Special moves. Does NOT double Sp.Def.",
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category === "Special") {
				return this.chainModify(0.5);
			}
		},
	},
	illwill: {
		name: "Ill Will",
		shortDesc: "Deletes the PP of the move that faints this Pokemon.",
		onFaint(target, source, effect) {
			if (effect.effectType === "Move") {
				this.add("-ability", target, "Ill Will");
				this.add(
					"-message",
					target.name + " deleted the PP of " + effect.name + "!"
				);
				target.side.foe.active[0].moveSlots.forEach((slot) => {
					if (slot.id === effect.id) {
						slot.pp = 0;
					}
				});
			}
		},
	},
	momentum: {
		name: "Momentum",
		shortDesc: "Contact moves use the Speed stat for damage calculation.",
		onModifyMove(move) {
			if (move.flags["contact"]) {
				move.overrideOffensiveStat = "spe";
			}
		},
	},
	quickstart: {
		shortDesc: "On switch-in, this Pokemon's Attack and Speed are doubled for 5 turns.",
		rating: 4,
			num: 1036, // Ajusta o número como quiser
			isNonstandard: "Future",
		onStart(pokemon) {
			pokemon.addVolatile('quickstart');
		},
		onEnd(pokemon) {
			delete pokemon.volatiles['quickstart'];
			this.add('-end', pokemon, 'Quickstart', '[silent]');
		},
		condition: {
			duration: 5,
			onStart(target) {
				this.add('-start', target, 'ability: Quickstart');
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, pokemon) {
				return this.chainModify(2);
			},
			onModifySpe(spe, pokemon) {
				return this.chainModify(2);
			},
			onEnd(target) {
				this.add('-end', target, 'Quickstart');
			},
		},
		name: "Quickstart",
    },

	possessiverage: {
		name: "Possessive Rage",
		shortDesc: "Foes become possessed: they use random moves, lose accuracy, gain power, and always crit.",
		rating: 5,
		num: 4001,
	
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Possessive Rage');
			this.add('-message', "A dark presence possesses the opposing Pokémon!");
		},
	
		// Força o inimigo a usar um move aleatório
		onFoeBeforeMovePriority: 10,
		onFoeBeforeMove(attacker, defender, move) {
			if (!attacker.moveSlots.length) return;
	
			const randomMove = this.sample(attacker.moveSlots).id;
			const newMove = this.dex.getActiveMove(randomMove);
	
			this.add('-message', `${attacker.name} is possessed and acts on its own!`);
			this.actions.useMove(newMove, attacker, { target: defender });
	
			return false; // Cancela o move escolhido pelo treinador
		},
	
		// Reduz precisão dos golpes do oponente
		onFoeModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			return this.chainModify(0.85);
		},
	
		// Aumenta o Base Power dos golpes do oponente
		onFoeBasePower(basePower) {
			return this.chainModify(1.15);
		},
	
		// Força golpes críticos do oponente
		onFoeModifyCritRatio(critRatio) {
			return 5; // Garante crítico
		},
	},

	genjutsudomain: {
		name: "Genjutsu Domain",
		shortDesc: "Confuses foes & drops Atk/SpA. KOs trigger Mangekyō (Double Atk/SpA, Max Crit).",
	
		onStart(pokemon) {
			// Initialize state
			if (pokemon.abilityState.mangekyo === undefined) {
				pokemon.abilityState.mangekyo = false;
			}
	
			// Apply confusion immediately upon entering
			for (const target of pokemon.side.foe.active) {
				if (!target || target.fainted) continue;
				if (!target.volatiles['confusion']) {
					target.addVolatile('confusion');
					this.add('-message', `${target.name} is caught in the Genjutsu Domain!`);
				}
			}
		},
	
		// Trigger when a foe switches in
		onFoeSwitchIn(target) {
			if (!target.volatiles['confusion']) {
				target.addVolatile('confusion');
				this.add('-message', `${target.name} enters the Genjutsu Domain!`);
			}
		},
	
		onResidual(pokemon) {
			// If Mangekyo is active, we stop the debuffs/confusion enforcement (optional based on interpretation, 
			// but usually "changing forms" stops the old passive. Removing this check makes it do BOTH).
			
			
			if (!pokemon.abilityState.mangekyo) {
				for (const target of pokemon.side.foe.active) {
					if (!target || target.fainted) continue;
	
					// 1. Re-apply confusion if missing
					if (!target.volatiles['confusion']) {
						target.addVolatile('confusion');
						this.add('-message', `${target.name} is lost in the illusion again!`);
					}
	
					// 2. Lower Atk and SpA by 1 stage
					this.boost({ atk: -1, spa: -1 }, target, pokemon);
				}
			}
		},
	
		// Reduce accuracy by 30% if the attacker is confused
		onModifyAccuracy(accuracy, target, source, move) {
			// 'target' is the Ability User (Defender), 'source' is the Foe (Attacker)
			if (target.hasAbility('genjutsudomain') && source.volatiles['confusion']) {
				return this.chainModify(0.7); // 0.7 = 30% reduction
			}
		},
	
		// Trigger Mangekyo on KO
		onSourceAfterFaint(length, target, source) {
			if (!source || source.fainted) return;
	
			// Check if ability is active and not yet in Mangekyo mode
			if (source.hasAbility('genjutsudomain') && !source.abilityState.mangekyo) {
				source.abilityState.mangekyo = true;
				
				this.add('-ability', source, 'Genjutsu Domain');
				this.add('-message', `${source.name} awakens the Mangekyō!`);
	
				//  Clears boosts (debuffs) and Status conditions
				source.clearBoosts();
				source.cureStatus();
				this.add('-clearboost', source);
			}
		},
	
		// Mangekyo Effect:
		onModifyAtk(atk, pokemon) {
			if (pokemon.abilityState.mangekyo) {
				return this.chainModify(2);
			}
		},
	
		// Mangekyo Effect: 
		onModifySpA(spa, pokemon) {
			if (pokemon.abilityState.mangekyo) {
				return this.chainModify(2);
			}
		},
	
		// Mangekyo Effect: 
		onModifyCritRatio(critRatio, source) {
			if (source.abilityState.mangekyo) {
				return 5; // Guaranteed crit
			}
		},
	},

	substitutionjutsu: {
		name: "Substitution Jutsu",
		shortDesc: "If hit by >50% HP dmg, creates reinforced Sub (max 2). Subzero Slammer transforms.",
	
		onDamage(damage, target, source, effect) {
			// 1. Basic Checks: Must be a move, target cannot already have a Substitute
			if (effect.effectType !== 'Move') return;
			if (target.volatiles['substitute']) return;
	
			// 2. Initialize and Check Usage Limit (Max 2 times per battle)
			if (!target.abilityState.substitutionActivations) target.abilityState.substitutionActivations = 0;
			if (target.abilityState.substitutionActivations >= 2) return;
	
			const maxHP = target.maxhp;
	
			// 3. Trigger Condition: Damage must be >= 50% of Max HP
			// REMOVED: && this.randomChance(1, 2) -> Now it is guaranteed.
			if (damage >= maxHP / 2) {
				target.abilityState.substitutionActivations++;
				
				this.add('-ability', target, 'Substitution Jutsu');
				this.add('-message', `${target.name} performs a Substitution Jutsu! (Uses left: ${2 - target.abilityState.substitutionActivations})`);
	
				// 4. Create the Substitute
				target.addVolatile('substitute');
				
				// 5. Reinforce the Substitute (50% HP instead of standard 25%)
				const sub = target.volatiles['substitute'];
				if (sub) {
					(sub as any).hp = Math.floor(maxHP / 2);
					this.add('-message', `A reinforced clone appears with ${Math.floor(maxHP / 2)} HP!`);
				}
	
				// 6. Reduce the incoming damage to 25%
				return Math.floor(maxHP / 4);
			}
		},
	
		onAfterMove(source, target, move) {
			// 1. Check for Subzero Slammer and prevent loop if already transformed
			if (move.id !== 'subzeroslammer') return;
			if (source.species.name === 'Frostsu-Cold') return;
	
			this.add('-ability', source, 'Substitution Jutsu');
			this.add('-message', `${source.name} is enveloped by absolute zero!`);
	
			// 2. Transformation Logic
			source.formeChange('Frostsu-Cold', this.effect, true);
	
			// 3. Reset Stats and Status
			source.clearStatus();
			source.clearBoosts();
			
			// 4. Clear Volatiles
			const volatilesToKeep = ['dynamax']; 
			for (const volatile of Object.keys(source.volatiles)) {
				if (!volatilesToKeep.includes(volatile)) {
					source.removeVolatile(volatile);
				}
			}
	
			// 5. Full Heal
			source.heal(source.maxhp);
			this.add('-heal', source, source.getHealth, '[silent]');
			this.add('-message', `${source.name} transformed into Frostsu-Cold!`);
		},
	},

	hyouton: {
		name: "Hyouton",
		shortDesc: "Summons Hail. Water moves become Ice. Fire moves fail. Opponents' Speed is reduced. Ice moves never miss.",
	
		// Summon Hail on entry
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Hyouton');
	
			if (this.field.weather !== 'hail') {
				this.field.setWeather('hail', pokemon);
			}
		},
	
		// Reapply Hail every turn if removed
		onResidual(pokemon) {
			if (this.field.weather !== 'hail') {
				this.field.setWeather('hail', pokemon);
			}
		},
	
		// Water → Ice + Ice moves never miss
		onModifyMove(move) {
			if (move.type === 'Water') {
				move.type = 'Ice';
			}
	
			if (move.type === 'Ice') {
				move.accuracy = true;
			}
		},
	
		
		onTryMove(pokemon, target, move) {
			if (move.type === 'Fire') {
				this.add('-immune', target, '[from] ability: Hyouton');
				return false;
			}
		},
	
		// Hidden Speed reduction
		onAnyModifySpe(spe, pokemon) {
			const source = this.effectState.target;
			if (!source || pokemon === source) return;
	
			return this.chainModify(0.2);
		},
	},


	crimsonbladeofshadows: {
		isNonstandard: "Future",
	
		shortDesc: "legacyofshadows + Sharpness + Mold Breaker + Normal-type moves become Steel-type and gain 1.5x power",
	
		onStart(pokemon) {
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Crimson Blade of Shadows');
		},
	
		onAnyModifyAtk(atk, source, target, move) {
			const holder = this.effectState.target;
			if (!source || source.hasAbility('Crimson Blade of Shadows') || move?.category !== 'Physical') return;
			if (!move.ruinedAtk) move.ruinedAtk = holder;
			if (move.ruinedAtk !== holder) return;
			return this.chainModify(0.6);
		},
	
		onAnyModifySpA(spa, source, target, move) {
			const holder = this.effectState.target;
			if (!source || source.hasAbility('Crimson Blade of Shadows') || move?.category !== 'Special') return;
			if (!move.ruinedSpA) move.ruinedSpA = holder;
			if (move.ruinedSpA !== holder) return;
			return this.chainModify(0.6);
		},
	
		onSetStatus(status) {
			if (['psn', 'tox', 'brn', 'par', 'slp'].includes(status.id)) return false;
		},
	
		onDeductPP(target, source) {
			if (!source || target.isAlly(source)) return;
			return 1;
		},
	
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (attacker !== this.effectState.target) return;
	
			if (move.flags?.slicing) {
				return this.chainModify(2);
			}
	
			if (move.type === 'Normal') {
				move.type = 'Steel';
				return this.chainModify(1.5);
			}
		},
	
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
	
		name: "Crimson Blade of Shadows",
	},

	// Usa Wish ao entrar em campo, limitado a 3 vezes por batalha
	wishmaker: {
		onStart(pokemon) {
			if (!pokemon.abilityState.wishCount) pokemon.abilityState.wishCount = 0;
			if (pokemon.abilityState.wishCount >= 3) return;
			pokemon.abilityState.wishCount++;
			this.add('-activate', pokemon, 'ability: Wishmaker');
			(this.actions as any).runAdditionalMove(Dex.moves.get("wish"), pokemon, pokemon);
		},
		flags: {},
		name: "Wishmaker",
		shortDesc: "Uses Wish on switch-in. Three uses per battle.",
		rating: 3.5,
	},

	// Ativa Inverse Room ao entrar, com duração reduzida de 3 turnos
	inversion: {
		onStart(source) {
			this.add('-activate', source, 'ability: Inversion');
			const effect = this.field.addPseudoWeather('inverseroom', source, source.getAbility());
			if (effect) {
				// força duração de 3 turnos ao invés do padrão (5)
				this.field.pseudoWeather['inverseroom'].duration = 3;
			}
		},
		flags: {},
		name: "Inversion",
		shortDesc: "Sets up Inverse Room on entry, lasts 3 turns.",
		rating: 4,
	},

	aurorasgale: {
		onModifySpA(atk, attacker, defender, move) {
			return this.chainModify(1.5);
		},

		onStart(source) {
		
			const veil = source.side.sideConditions["auroraveil"];
			if (!veil) {
				this.add("-activate", source, "ability: North Wind");
				source.side.addSideCondition(
					"auroraveil",
					source,
					this.dex.abilities.get("northwind")
				);
			}
		},
		name: "Aurora's Gale",
		rating: 4.5,
		num: 977,
		gen: 9,
	},



	
} as import('../sim/dex-abilities').ModdedAbilityDataTable;
