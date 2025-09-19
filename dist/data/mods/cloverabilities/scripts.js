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
  inherit: "clover",
  field: {
    suppressingWeather() {
      for (const pokemon of this.battle.getAllActive()) {
        if (pokemon && !pokemon.fainted && !pokemon.ignoringAbility() && (pokemon.getAbility().suppressWeather || pokemon.m.innates?.some((k) => this.battle.dex.abilities.get(k).suppressWeather))) {
          return true;
        }
      }
      return false;
    }
  },
  pokemon: {
    inherit: true,
    ignoringAbility() {
      let neutralizinggas = false;
      for (const pokemon of this.battle.getAllActive()) {
        if ((pokemon.ability === "neutralizinggas" || pokemon.m.innates?.some((k) => k === "neutralizinggas")) && !pokemon.volatiles["gastroacid"] && !pokemon.abilityState.ending) {
          neutralizinggas = true;
          break;
        }
      }
      return !!(this.battle.gen >= 5 && !this.isActive || (this.volatiles["gastroacid"] || this.volatiles["sterilized"] || this.volatiles["shatteredampoule"] || neutralizinggas && (this.ability !== "neutralizinggas" || this.m.innates?.some((k) => k === "neutralizinggas"))) && !this.getAbility().isPermanent);
    },
    hasAbility(ability) {
      if (this.ignoringAbility())
        return false;
      if (Array.isArray(ability))
        return ability.some((abil) => this.hasAbility(abil));
      ability = this.battle.toID(ability);
      return this.ability === ability || !!this.volatiles["ability:" + ability];
    },
    transformInto(pokemon, effect) {
      const species = pokemon.species;
      if (pokemon.fainted || pokemon.illusion || pokemon.volatiles["substitute"] && this.battle.gen >= 5 || pokemon.transformed && this.battle.gen >= 2 || this.transformed && this.battle.gen >= 5 || species.name === "Eternatus-Eternamax") {
        return false;
      }
      if (!this.setSpecies(species, effect, true))
        return false;
      this.transformed = true;
      this.weighthg = pokemon.weighthg;
      const types = pokemon.getTypes(true);
      this.setType(pokemon.volatiles["roost"] ? pokemon.volatiles["roost"].typeWas : types, true);
      this.addedType = pokemon.addedType;
      this.knownType = this.isAlly(pokemon) && pokemon.knownType;
      this.apparentType = pokemon.apparentType;
      let statName;
      for (statName in this.storedStats) {
        this.storedStats[statName] = pokemon.storedStats[statName];
      }
      this.moveSlots = [];
      this.set.ivs = this.battle.gen >= 5 ? this.set.ivs : pokemon.set.ivs;
      this.hpType = this.battle.gen >= 5 ? this.hpType : pokemon.hpType;
      this.hpPower = this.battle.gen >= 5 ? this.hpPower : pokemon.hpPower;
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
      if (this.battle.gen > 2) {
        this.setAbility(pokemon.ability, this, true);
        if (this.m.innates) {
          for (const innate of this.m.innates) {
            this.removeVolatile("ability:" + innate);
          }
        }
        if (pokemon.m.innates) {
          for (const innate of pokemon.m.innates) {
            this.addVolatile("ability:" + innate, this);
          }
        }
      }
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
      return true;
    }
  }
};
//# sourceMappingURL=scripts.js.map
