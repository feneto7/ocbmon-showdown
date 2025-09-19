"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var scripts_exports = {};
__export(scripts_exports, {
  Scripts: () => Scripts
});
module.exports = __toCommonJS(scripts_exports);
const Scripts = {
  gen: 9,
  inherit: "gen8",
  boost(boost, target, source, effect, isSecondary, isSelf) {
    if (this.event) {
      if (!target)
        target = this.event.target;
      if (!source)
        source = this.event.source;
      if (!effect)
        effect = this.effect;
    }
    if (typeof effect === "string")
      effect = this.dex.conditions.get(effect);
    if (!target?.hp)
      return 0;
    if (!target.isActive)
      return false;
    if (this.gen > 5 && !target.side.foePokemonLeft())
      return false;
    boost = this.runEvent("ChangeBoost", target, source, effect, { ...boost });
    boost = target.getCappedBoost(boost);
    boost = this.runEvent("TryBoost", target, source, effect, { ...boost });
    let success = null;
    let boosted = isSecondary;
    let boostName;
    for (boostName in boost) {
      const currentBoost = {
        [boostName]: boost[boostName]
      };
      let boostBy = target.boostBy(currentBoost);
      let msg = "-boost";
      if (boost[boostName] < 0 || target.boosts[boostName] === -6) {
        msg = "-unboost";
        boostBy = -boostBy;
      }
      if (boostBy) {
        success = true;
        switch (effect?.id) {
          case "bellydrum":
          case "angerpoint":
            this.add("-setboost", target, "atk", target.boosts["atk"], "[from] " + effect.fullname);
            break;
          case "bellydrum2":
            this.add(msg, target, boostName, boostBy, "[silent]");
            this.hint("In Gen 2, Belly Drum boosts by 2 when it fails.");
            break;
          case "zpower":
            this.add(msg, target, boostName, boostBy, "[zeffect]");
            break;
          case "artificial":
            this.addSplit(target.side.id, [msg, target, boostName, boostBy]);
            break;
          default:
            if (!effect)
              break;
            if (effect.effectType === "Move") {
              this.add(msg, target, boostName, boostBy);
            } else if (effect.effectType === "Item") {
              this.add(msg, target, boostName, boostBy, "[from] item: " + effect.name);
            } else {
              if (effect.effectType === "Ability" && !boosted) {
                this.add("-ability", target, effect.name, "boost");
                boosted = true;
              }
              this.add(msg, target, boostName, boostBy);
            }
            break;
        }
        this.runEvent("AfterEachBoost", target, source, effect, currentBoost);
      } else if (effect?.effectType === "Ability") {
        if (isSecondary || isSelf)
          this.add(msg, target, boostName, boostBy);
      } else if (!isSecondary && !isSelf) {
        this.add(msg, target, boostName, boostBy);
      }
    }
    this.runEvent("AfterBoost", target, source, effect, boost);
    if (success) {
      if (Object.values(boost).some((x) => x > 0))
        target.statsRaisedThisTurn = true;
      if (Object.values(boost).some((x) => x < 0))
        target.statsLoweredThisTurn = true;
    }
    return success;
  },
  actions: {
    inherit: true,
    modifyDamage(baseDamage, pokemon, target, move, suppressMessages = false) {
      const tr = this.battle.trunc;
      if (!move.type)
        move.type = "???";
      const type = move.type;
      baseDamage += 2;
      if (move.spreadHit) {
        const spreadModifier = move.spreadModifier || (this.battle.gameType === "freeforall" ? 0.5 : 0.75);
        this.battle.debug("Spread modifier: " + spreadModifier);
        baseDamage = this.battle.modify(baseDamage, spreadModifier);
      } else if (move.multihitType === "parentalbond" && move.hit > 1) {
        const bondModifier = this.battle.gen > 6 ? 0.25 : 0.5;
        this.battle.debug(`Parental Bond modifier: ${bondModifier}`);
        baseDamage = this.battle.modify(baseDamage, bondModifier);
      }
      baseDamage = this.battle.runEvent("WeatherModifyDamage", pokemon, target, move, baseDamage);
      const isCrit = target.getMoveHitData(move).crit;
      if (isCrit) {
        baseDamage = tr(baseDamage * (move.critModifier || (this.battle.gen >= 6 ? 1.5 : 2)));
      }
      baseDamage = this.battle.randomizer(baseDamage);
      const matchingTypeCount = pokemon.types.filter((pokemonType) => pokemonType === type).length;
      if (move.forceSTAB || pokemon.hasType(type)) {
        baseDamage = this.battle.modify(baseDamage, move.stab || Math.pow(1.5, Math.max(matchingTypeCount, 1)));
      }
      let typeMod = target.runEffectiveness(move);
      typeMod = this.battle.clampIntRange(typeMod, -6, 6);
      target.getMoveHitData(move).typeMod = typeMod;
      if (typeMod > 0) {
        if (!suppressMessages)
          this.battle.add("-supereffective", target);
        for (let i = 0; i < typeMod; i++) {
          baseDamage *= 2;
        }
      }
      if (typeMod < 0) {
        if (!suppressMessages)
          this.battle.add("-resisted", target);
        for (let i = 0; i > typeMod; i--) {
          baseDamage = tr(baseDamage / 2);
        }
      }
      if (isCrit && !suppressMessages)
        this.battle.add("-crit", target);
      if (pokemon.status === "brn" && move.category === "Physical" && !pokemon.hasAbility("guts")) {
        if (this.battle.gen < 6 || move.id !== "facade") {
          baseDamage = this.battle.modify(baseDamage, 0.5);
        }
      }
      if (this.battle.gen === 5 && !baseDamage)
        baseDamage = 1;
      baseDamage = this.battle.runEvent("ModifyDamage", pokemon, target, move, baseDamage);
      if (move.isZOrMaxPowered && target.getMoveHitData(move).zBrokeProtect) {
        baseDamage = this.battle.modify(baseDamage, 0.25);
        this.battle.add("-zbroken", target);
      }
      if (this.battle.gen !== 5 && !baseDamage)
        return 1;
      return tr(baseDamage, 16);
    },
    canUltraBurst(pokemon) {
      if (["Necrozma-Dawn-Wings", "Necrozma-Dusk-Mane"].includes(pokemon.baseSpecies.name) && pokemon.getItem().id === "ultranecroziumz") {
        return "Necrozma-Ultra";
      }
      if (pokemon.baseSpecies.name === "Blobbos" && pokemon.getItem().id === "ultrablobbosiumz") {
        return "Blobbos-Ultra";
      }
      if (pokemon.baseSpecies.name === "Fucker" && pokemon.getItem().id === "ultrafuckiumz") {
        return "Fucker-Ultra";
      }
      return null;
    },
    canMegaEvo(pokemon) {
      const species = pokemon.baseSpecies;
      const altForme = species.otherFormes && this.dex.species.get(species.otherFormes[0]);
      const item = pokemon.getItem();
      if (altForme?.isMega && altForme?.requiredMove && pokemon.baseMoves.includes(this.dex.toID(altForme.requiredMove)) && !item.zMove) {
        return altForme.name;
      }
      if (item.megaEvolves === species.baseSpecies && item.megaStone !== species.name) {
        return item.megaStone;
      }
      return null;
    },
    hitStepTryImmunity(targets, pokemon, move) {
      const hitResults = [];
      for (const [i, target] of targets.entries()) {
        if (this.battle.gen >= 6 && move.flags["powder"] && target !== pokemon && !this.dex.getImmunity("powder", target)) {
          this.battle.debug("natural powder immunity");
          this.battle.add("-immune", target);
          hitResults[i] = move.canContinue || false;
        } else if (!this.battle.singleEvent("TryImmunity", move, {}, target, pokemon, move)) {
          this.battle.add("-immune", target);
          hitResults[i] = move.canContinue || false;
        } else if (this.battle.gen >= 7 && move.pranksterBoosted && pokemon.hasAbility("prankster") && !targets[i].isAlly(pokemon) && !this.dex.getImmunity("prankster", target)) {
          this.battle.debug("natural prankster immunity");
          if (!target.illusion)
            this.battle.hint("Since gen 7, Dark is immune to Prankster moves.");
          this.battle.add("-immune", target);
          hitResults[i] = move.canContinue || false;
        } else if (move.pranksterBoosted && pokemon.hasAbility("prankster") && !targets[i].isAlly(pokemon) && target.hasAbility("boardpowers4s")) {
          this.battle.debug("s4s prankster immunity");
          this.battle.add("-immune", target);
          hitResults[i] = move.canContinue || false;
        } else {
          hitResults[i] = true;
        }
      }
      return hitResults;
    }
  },
  pokemon: {
    inherit: true,
    ignoringAbility() {
      let neutralizinggas = false;
      const genwunRoom = this.battle.field.pseudoWeather["genwunroom"];
      for (const pokemon of this.battle.getAllActive()) {
        if (pokemon.ability === "neutralizinggas" && !pokemon.volatiles["gastroacid"] && !pokemon.volatiles["retro"] && !pokemon.transformed && !pokemon.abilityState.ending) {
          neutralizinggas = true;
          break;
        }
      }
      const retroSuppression = this.volatiles["retro"] && this.ability !== "comatose" && !this.ability.startsWith("boardpower");
      return !!(this.battle.gen >= 5 && !this.isActive || (this.volatiles["gastroacid"] || this.volatiles["sterilized"] || this.volatiles["shatteredampoule"] || neutralizinggas && this.ability !== "neutralizinggas" || genwunRoom || retroSuppression) && !this.getAbility().isPermanent);
    },
    formeChange(speciesId, source, isPermanent, message) {
      source = source || this.battle.effect;
      const rawSpecies = this.battle.dex.species.get(speciesId);
      const species = this.setSpecies(rawSpecies, source);
      if (!species)
        return false;
      if (this.battle.gen <= 2)
        return true;
      const apparentSpecies = this.illusion ? this.illusion.species.name : species.baseSpecies;
      if (isPermanent) {
        this.baseSpecies = rawSpecies;
        this.details = species.name + (this.level === 100 ? "" : ", L" + this.level) + (this.gender === "" ? "" : ", " + this.gender) + (this.set.shiny ? ", shiny" : "");
        this.battle.add("detailschange", this, (this.illusion || this).details);
        if (source.effectType === "Item") {
          if (source.zMove) {
            this.battle.add("-burst", this, apparentSpecies, species.requiredItem);
            this.moveThisTurnResult = true;
          } else if (source.onPrimal) {
            if (this.illusion) {
              this.ability = "";
              this.battle.add("-primal", this.illusion);
            } else {
              this.battle.add("-primal", this);
            }
          } else {
            this.battle.add("-mega", this, apparentSpecies, species.requiredItem);
            this.moveThisTurnResult = true;
          }
        } else if (source.effectType === "Status") {
          this.battle.add("-formechange", this, species.name, message);
        }
      } else {
        if (source.effectType === "Ability") {
          this.battle.add("-formechange", this, species.name, message, `[from] ability: ${source.name}`);
        } else {
          this.battle.add("-formechange", this, this.illusion ? this.illusion.species.name : species.name, message);
        }
      }
      if (isPermanent && !["disguise", "iceface", "niceface"].includes(source.id)) {
        if (this.illusion) {
          this.ability = "";
        }
        this.setAbility(species.abilities["0"], null, true);
        this.baseAbility = this.ability;
      }
      return true;
    },
    transformInto(pokemon, effect) {
      const species = pokemon.species;
      if (pokemon.fainted || this.illusion || pokemon.illusion || pokemon.volatiles["substitute"] && this.battle.gen >= 5 || pokemon.transformed && this.battle.gen >= 2 || this.transformed && this.battle.gen >= 5 || species.name === "Eternatus-Eternamax" || species.baseSpecies === "Ogerpon" && (this.terastallized || pokemon.terastallized) || pokemon.hasAbility("Artificial")) {
        return false;
      }
      if (this.battle.dex.currentMod === "gen1stadium" && (species.name === "Ditto" || this.species.name === "Ditto" && pokemon.moves.includes("transform"))) {
        return false;
      }
      if (!this.setSpecies(species, effect, true))
        return false;
      this.transformed = true;
      this.weighthg = pokemon.weighthg;
      const types = pokemon.getTypes(true, true);
      this.setType(pokemon.volatiles["roost"] ? pokemon.volatiles["roost"].typeWas : types, true);
      this.addedType = pokemon.addedType;
      this.knownType = this.isAlly(pokemon) && pokemon.knownType;
      this.apparentType = pokemon.apparentType;
      let statName;
      for (statName in this.storedStats) {
        this.storedStats[statName] = pokemon.storedStats[statName];
        if (this.modifiedStats)
          this.modifiedStats[statName] = pokemon.modifiedStats[statName];
      }
      this.moveSlots = [];
      this.hpType = this.battle.gen >= 5 ? this.hpType : pokemon.hpType;
      this.hpPower = this.battle.gen >= 5 ? this.hpPower : pokemon.hpPower;
      this.timesAttacked = pokemon.timesAttacked;
      for (const moveSlot of pokemon.moveSlots) {
        let moveName = moveSlot.move;
        if (moveSlot.id === "hiddenpower") {
          moveName = "Hidden Power " + this.hpType;
        }
        this.moveSlots.push({
          move: moveName,
          id: moveSlot.id,
          pp: moveSlot.maxpp === 1 ? 1 : 5,
          maxpp: this.battle.gen >= 5 ? moveSlot.maxpp === 1 ? 1 : 5 : moveSlot.maxpp,
          target: moveSlot.target,
          disabled: false,
          used: false,
          virtual: true
        });
      }
      let boostName;
      for (boostName in pokemon.boosts) {
        this.boosts[boostName] = pokemon.boosts[boostName];
      }
      if (this.battle.gen >= 6) {
        const volatilesToCopy = ["focusenergy", "gmaxchistrike", "laserfocus"];
        for (const volatile of volatilesToCopy) {
          if (pokemon.volatiles[volatile]) {
            this.addVolatile(volatile);
            if (volatile === "gmaxchistrike")
              this.volatiles[volatile].layers = pokemon.volatiles[volatile].layers;
          } else {
            this.removeVolatile(volatile);
          }
        }
      }
      if (effect) {
        this.battle.add("-transform", this, pokemon, "[from] " + effect.fullname);
      } else {
        this.battle.add("-transform", this, pokemon);
      }
      if (this.terastallized) {
        this.knownType = true;
        this.apparentType = this.terastallized;
      }
      if (this.battle.gen > 2)
        this.setAbility(pokemon.ability, this, true, true);
      if (this.battle.gen === 4) {
        if (this.species.num === 487) {
          if (this.species.name === "Giratina" && this.item === "griseousorb") {
            this.formeChange("Giratina-Origin");
          } else if (this.species.name === "Giratina-Origin" && this.item !== "griseousorb") {
            this.formeChange("Giratina");
          }
        }
        if (this.species.num === 493) {
          const item = this.getItem();
          const targetForme = item?.onPlate ? "Arceus-" + item.onPlate : "Arceus";
          if (this.species.name !== targetForme) {
            this.formeChange(targetForme);
          }
        }
      }
      if (this.species.baseSpecies === "Ogerpon" && this.canTerastallize)
        this.canTerastallize = false;
      return true;
    },
    isGrounded(negateImmunity = false) {
      if ("gravity" in this.battle.field.pseudoWeather)
        return true;
      if ("ingrain" in this.volatiles && this.battle.gen >= 4)
        return true;
      if ("smackdown" in this.volatiles)
        return true;
      if ("buried" in this.volatiles)
        return true;
      const item = this.ignoringItem() ? "" : this.item;
      if (item === "ironball")
        return true;
      if (!negateImmunity && this.hasType("Flying") && !("roost" in this.volatiles))
        return false;
      if (this.hasAbility(["levitate", "metagaming", "noweaknesses", "acapability"]) && !this.battle.suppressingAbility()) {
        return null;
      }
      if ("magnetrise" in this.volatiles)
        return false;
      if ("telekinesis" in this.volatiles)
        return false;
      return item !== "airballoon";
    }
  }
};
//# sourceMappingURL=scripts.js.map
