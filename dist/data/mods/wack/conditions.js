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
var conditions_exports = {};
__export(conditions_exports, {
  Conditions: () => Conditions
});
module.exports = __toCommonJS(conditions_exports);
const Conditions = {
  slp: {
    inherit: true,
    onStart(target, source, sourceEffect) {
      if (sourceEffect && sourceEffect.effectType === "Ability") {
        this.add("-status", target, "slp", "[from] ability: " + sourceEffect.name, "[of] " + source);
      } else if (sourceEffect && sourceEffect.effectType === "Move") {
        this.add("-status", target, "slp", "[from] move: " + sourceEffect.name);
      } else {
        this.add("-status", target, "slp");
      }
      this.effectState.startTime = this.random(2, 5);
      if (target.hasItem("comfypillow")) {
        this.effectState.time = this.effectState.startTime + 2;
      } else {
        this.effectState.time = this.effectState.startTime;
      }
      if (target.removeVolatile("nightmare")) {
        this.add("-end", target, "Nightmare", "[silent]");
      }
    }
  },
  par: {
    inherit: true,
    onModifySpe(spe, pokemon) {
      spe = this.finalModify(spe);
      if (!pokemon.hasAbility(["quickfeet", "paralysisheal"]) && !pokemon.hasItem("limbershoes")) {
        spe = Math.floor(spe * 50 / 100);
      }
      return spe;
    }
  },
  raindance: {
    inherit: true,
    onFieldStart(field, source, effect) {
      if (effect?.effectType === "Ability") {
        this.effectState.duration = 0;
        this.add("-weather", "RainDance", "[from] ability: " + effect.name, "[of] " + source);
      } else if (effect?.effectType === "Item") {
        this.effectState.duration = 4;
        this.add("-weather", "RainDance", "[from] item: " + effect.name, "[of] " + source);
      } else {
        this.add("-weather", "RainDance");
      }
    }
  },
  hail: {
    inherit: true,
    onFieldStart(field, source, effect) {
      if (effect?.effectType === "Ability") {
        this.effectState.duration = 0;
        this.add("-weather", "Hail", "[from] ability: " + effect.name, "[of] " + source);
      } else if (effect?.effectType === "Item") {
        this.effectState.duration = 4;
        this.add("-weather", "Hail", "[from] item: " + effect.name, "[of] " + source);
      } else {
        this.add("-weather", "Hail");
      }
    },
    onModifyDefPriority: 10,
    onModifyDef(def, pokemon) {
      if (pokemon.hasType("Ice") && this.field.isWeather("hail")) {
        return this.modify(def, 1.5);
      }
    }
  },
  sunnyday: {
    inherit: true,
    onFieldStart(battle, source, effect) {
      if (effect?.effectType === "Ability") {
        this.effectState.duration = 0;
        this.add("-weather", "SunnyDay", "[from] ability: " + effect.name, "[of] " + source);
      } else if (effect?.effectType === "Item") {
        this.effectState.duration = 4;
        this.add("-weather", "SunnyDay", "[from] item: " + effect.name, "[of] " + source);
      } else {
        this.add("-weather", "SunnyDay");
      }
    },
    onWeatherModifyDamage(damage, attacker, defender, move) {
      if (defender.hasItem("utilityumbrella"))
        return;
      if (move.type === "Fire" || move.type === "Light") {
        this.debug("Sunny Day fire boost");
        return this.chainModify(1.5);
      }
      if (move.type === "Water") {
        this.debug("Sunny Day water suppress");
        return this.chainModify(0.5);
      }
    }
  },
  sandstorm: {
    inherit: true,
    onFieldStart(field, source, effect) {
      if (effect?.effectType === "Ability") {
        this.effectState.duration = 0;
        this.add("-weather", "Sandstorm", "[from] ability: " + effect.name, "[of] " + source);
      } else if (effect?.effectType === "Item") {
        this.effectState.duration = 4;
        this.add("-weather", "Sandstorm", "[from] item: " + effect.name, "[of] " + source);
      } else {
        this.add("-weather", "Sandstorm");
      }
    }
  },
  snow: {
    inherit: true,
    onFieldStart(field, source, effect) {
      if (effect?.effectType === "Ability") {
        this.effectState.duration = 0;
        this.add("-weather", "Snow", "[from] ability: " + effect.name, "[of] " + source);
      } else if (effect?.effectType === "Item") {
        this.effectState.duration = 4;
        this.add("-weather", "Snow", "[from] item: " + effect.name, "[of] " + source);
      } else {
        this.add("-weather", "Snow");
      }
    }
  },
  midnight: {
    inherit: true,
    onFieldStart(field, source, effect) {
      if (effect?.effectType === "Ability") {
        this.effectState.duration = 0;
        this.add("-weather", "Midnight", "[from] ability: " + effect.name, "[of] " + source);
      } else if (effect?.effectType === "Item") {
        this.effectState.duration = 4;
        this.add("-weather", "Midnight", "[from] item: " + effect.name, "[of] " + source);
      } else {
        this.add("-weather", "Midnight");
      }
    }
  },
  acidrain: {
    inherit: true,
    onFieldStart(field, source, effect) {
      if (effect?.effectType === "Ability") {
        this.effectState.duration = 0;
        this.add("-weather", "AcidRain", "[from] ability: " + effect.name, "[of] " + source);
      } else if (effect?.effectType === "Item") {
        this.effectState.duration = 4;
        this.add("-weather", "AcidRain", "[from] item: " + effect.name, "[of] " + source);
      } else {
        this.add("-weather", "AcidRain");
      }
    }
  },
  bladerain: {
    inherit: true,
    onFieldStart(field, source, effect) {
      if (effect?.effectType === "Ability") {
        this.effectState.duration = 0;
        this.add("-weather", "BladeRain", "[from] ability: " + effect.name, "[of] " + source);
      } else if (effect?.effectType === "Item") {
        this.effectState.duration = 4;
        this.add("-weather", "BladeRain", "[from] item: " + effect.name, "[of] " + source);
      } else {
        this.add("-weather", "BladeRain");
      }
    }
  },
  lockdown: {
    duration: 4,
    // Duração fixa de 3 turnos
    onStart(target, source) {
      this.add("-message", "O campo foi envolto por uma energia de estase! Os Pok\xE9mon advers\xE1rios n\xE3o podem agir!");
    },
    onBeforeMove(pokemon) {
      if (pokemon.side !== this.effectState.source.side) {
        this.add("-message", `${pokemon.name} est\xE1 paralisado pela Zona de Estase e n\xE3o pode agir!`);
        return false;
      }
    },
    onSwitchIn(pokemon) {
      if (pokemon.side !== this.effectState.source.side) {
        this.add("-message", `${pokemon.name} entrou no campo, mas est\xE1 preso na Zona de Estase!`);
        return false;
      }
    },
    onResidual() {
      this.add("-message", `A Zona de Estase enfraquece... (${this.effectState.duration} turnos restantes)`);
    },
    onEnd() {
      this.add("-message", "A Zona de Estase desapareceu! Os Pok\xE9mon advers\xE1rios podem agir novamente.");
    }
  },
  // Pokemon innate ability
  // Destiny Bond and Perish Song immunities are handled in data/mod/wack/moves.ts
  tapukoko: {
    onSwitchIn(pokemon) {
      if (!this.field.isTerrain("electricterrain")) {
        this.field.setTerrain("electricterrain");
      }
    }
  },
  pincurchin: {
    onSwitchIn(pokemon) {
      if (!this.field.isTerrain("electricterrain")) {
        this.field.setTerrain("electricterrain");
      }
    }
  },
  tapulele: {
    onSwitchIn(pokemon) {
      if (!this.field.isTerrain("psychicterrain")) {
        this.field.setTerrain("psychicterrain");
      }
    }
  },
  indeedee: {
    onSwitchIn(pokemon) {
      if (!this.field.isTerrain("psychicterrain")) {
        this.field.setTerrain("psychicterrain");
      }
    }
  },
  audino: {
    onSwitchIn(pokemon) {
      if (!this.field.isTerrain("mistyterrain") && pokemon.ability === "healer") {
        this.field.setTerrain("mistyterrain");
      }
    }
  },
  audinette: {
    onSwitchIn(pokemon) {
      if (!this.field.isTerrain("mistyterrain") && pokemon.ability === "healer") {
        this.field.setTerrain("mistyterrain");
      }
    }
  },
  torterra: {
    onSwitchIn(pokemon) {
      if (!("gravity" in this.field.pseudoWeather) && pokemon.ability === "filter") {
        this.field.addPseudoWeather("gravity");
      }
    }
  },
  himg: {
    // TODO: Add Pollen Season interaction
    onSwitchIn(pokemon) {
      if (!this.field.isTerrain("grassyterrain")) {
        this.field.setTerrain("grassyterrain");
      }
    }
  },
  tapubulu: {
    onSwitchIn(pokemon) {
      if (!this.field.isTerrain("grassyterrain")) {
        this.field.setTerrain("grassyterrain");
      }
    }
  },
  rillaboom: {
    onSwitchIn(pokemon) {
      if (!this.field.isTerrain("grassyterrain") && pokemon.ability === "moldbreaker") {
        this.field.setTerrain("grassyterrain");
      }
    }
  },
  tapufini: {
    onSwitchIn(pokemon) {
      if (!this.field.isTerrain("mistyterrain") && pokemon.ability === "raindish") {
        this.field.setTerrain("mistyterrain");
      }
    }
  },
  truehim: {
    onTryHit(target, source, move) {
      if (move.ohko) {
        this.add("-immune", target);
        return null;
      }
    },
    onAllyTryHitSide(target, source, move) {
      if (move.ohko) {
        this.add("-immune", target);
      }
    }
  },
  himless: {
    onTryHit(target, source, move) {
      if (move.ohko) {
        this.add("-immune", target);
        return null;
      }
    },
    onAllyTryHitSide(target, source, move) {
      if (move.ohko) {
        this.add("-immune", target);
      }
    }
  },
  himwall: {
    onTryHit(target, source, move) {
      if (move.ohko) {
        this.add("-immune", target);
        return null;
      }
    },
    onAllyTryHitSide(target, source, move) {
      if (move.ohko) {
        this.add("-immune", target);
      }
    }
  },
  himdivine: {
    onTryHit(target, source, move) {
      if (move.ohko) {
        this.add("-immune", target);
        return null;
      }
    },
    onAllyTryHitSide(target, source, move) {
      if (move.ohko) {
        this.add("-immune", target);
      }
    }
  },
  himchaos: {
    onTryHit(target, source, move) {
      if (move.ohko) {
        this.add("-immune", target);
        return null;
      }
    },
    onAllyTryHitSide(target, source, move) {
      if (move.ohko) {
        this.add("-immune", target);
      }
    }
  },
  msteamboatle: {
    onResidualOrder: 28,
    onResidualSubOrder: 2,
    onResidual(pokemon) {
      if (pokemon.activeTurns && pokemon.ability === "wacky") {
        this.boost({ spe: 1 });
      }
    }
  },
  azathoth: {
    onResidualOrder: 28,
    onResidualSubOrder: 2,
    onResidual(pokemon) {
      pokemon.trySetStatus("slp");
    }
  },
  tardida: {
    onUpdate(pokemon) {
      if (pokemon.transformed)
        return;
      if (pokemon.baseSpecies.baseSpecies === "Tardida") {
        let forme = null;
        switch (pokemon.effectiveWeather()) {
          case "raindance":
          case "primordialsea":
            if (pokemon.species.id !== "tardidarain")
              forme = "Tardida-Rain";
            break;
          default:
            if (pokemon.species.id !== "tardida")
              forme = "Tardida";
            break;
        }
        if (pokemon.isActive && forme) {
          pokemon.formeChange(forme, this.effect, false, "[msg]");
        }
      }
    },
    onModifyAtkPriority: 1,
    onModifyAtk(atk, source, target, move) {
      if (["raindance", "primordialsea"].includes(source.effectiveWeather()) && source.ability === "filter") {
        return this.chainModify(1.5);
      }
    },
    onModifySpAPriority: 1,
    onModifySpA(atk, source, target, move) {
      if (["raindance", "primordialsea"].includes(source.effectiveWeather()) && source.ability === "filter") {
        return this.chainModify(1.5);
      }
    },
    onAllyModifyAtkPriority: 3,
    onAllyModifyAtk(atk, pokemon) {
      if (["raindance", "primordialsea"].includes(pokemon.effectiveWeather()) && pokemon.ability === "filter") {
        return this.chainModify(1.5);
      }
    },
    onAllyModifySpAPriority: 4,
    onAllyModifySpA(spa, pokemon) {
      if (["raindance", "primordialsea"].includes(pokemon.effectiveWeather()) && pokemon.ability === "filter") {
        return this.chainModify(1.5);
      }
    }
  },
  tanktopmastah: {
    onSwitchIn(pokemon) {
      pokemon.side.addSideCondition("safeguard");
    }
  },
  metaknight: {
    onSourceDamagingHit(damage, target, source, move) {
      if (source && source !== target && move && move.category !== "Status" && !source.forceSwitchFlag) {
        this.damage(target.baseMaxhp / 16, target, source);
      }
    }
  },
  achillesder: {
    onDamagingHit(damage, target) {
      if (target.ability === "wonderguard") {
        this.boost({ spe: -6 });
      }
    }
  },
  sandaconda: {
    onSourceDamagingHit(damage, target, source, move) {
      if (source && source !== target && move && move.category !== "Status" && !source.forceSwitchFlag && !this.field.isWeather("sandstorm")) {
        this.field.setWeather("sandstorm");
      }
    }
  },
  tikcofagrigus: {
    onSourceDamagingHit(damage, target, source, move) {
      if (source && source !== target && move && move.category !== "Status" && !source.forceSwitchFlag && !("invertedroom" in this.field.pseudoWeather)) {
        this.field.addPseudoWeather("invertedroom");
      }
    }
  },
  manvaccine: {
    onSourceDamagingHit(damage, target, source, move) {
      if (source && source !== target && move && move.category !== "Status" && !source.forceSwitchFlag) {
        source.addVolatile("stockpile");
      }
    }
  },
  borosu: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.species.forme === "Zen") {
        this.heal(pokemon.baseMaxhp / 3);
      }
      if (pokemon.baseSpecies.baseSpecies !== "Borosu" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Zen") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp === pokemon.maxhp && pokemon.species.forme === "Zen") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Borosu" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  eiscue: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Eiscue" || pokemon.ability !== "multiscale" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Noice") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === "Noice") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Eiscue" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  feiscue: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Feiscue" || pokemon.ability !== "multiscale" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Noice") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === "Noice") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Eiscue" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  neapolitaneeiscue: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Neapolitaneeiscue" || pokemon.ability !== "multiscale" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Noice") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === "Noice") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Eiscue" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  jekhyde: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Jekhyde" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Zen") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === "Zen") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Jekhyde" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  dqdragonlord: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Dqdragonlord" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Zen") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === "Zen") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Dqdragonlord" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  sephiroth: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Sephiroth" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 3 && pokemon.species.forme !== "Zen") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 3 && pokemon.species.forme === "Zen") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Sephiroth" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  scpee096: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Scpee096" || pokemon.ability !== "angerpoint" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Zen") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === "Zen") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Scpee096" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  angrymanjew: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Angrymanjew" || pokemon.ability !== "roughskin" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 3 && pokemon.species.forme !== "Zen") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 3 && pokemon.species.forme === "Zen") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Angrymanjew" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  f00: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "F00" || pokemon.ability !== "voltabsorb" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Zen") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === "Zen") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "F00" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  emptyanne: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Emptyanne" || pokemon.ability !== "clearbody" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Zen") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === "Zen") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Emptyanne" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  kawainnocent: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Kawainnocent" || pokemon.ability !== "cutecharm" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Zen") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === "Zen") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Kawainnocent" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  mestwi: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Mestwi" || pokemon.ability !== "filter" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Zen") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === "Zen") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Mestwi" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  wishiwashi: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Wishiwashi" || pokemon.ability !== "waterveil" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 4 && pokemon.species.forme !== "Solo") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 4 && pokemon.species.forme === "Solo") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Wishiwashi" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  cclefairy: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Cclefairy" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Zen") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === "Zen") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Cclefairy" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  cclefable: {
    onResidualOrder: 29,
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Cclefable" || pokemon.transformed) {
        return;
      }
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Zen") {
        pokemon.addVolatile("zenmode");
      } else if (pokemon.hp > pokemon.maxhp / 2 && pokemon.species.forme === "Zen") {
        pokemon.addVolatile("zenmode");
        pokemon.removeVolatile("zenmode");
      }
    },
    onEnd(pokemon) {
      if (!pokemon.volatiles["zenmode"] || !pokemon.hp)
        return;
      pokemon.transformed = false;
      delete pokemon.volatiles["zenmode"];
      if (pokemon.species.baseSpecies === "Cclefable" && pokemon.species.battleOnly) {
        pokemon.formeChange(pokemon.species.battleOnly, this.effect, false, "[silent]");
      }
    }
  },
  aegislash: {
    onModifyMovePriority: 1,
    onModifyMove(move, attacker) {
      if (attacker.species.baseSpecies !== "Aegislash" || attacker.ability !== "hypercutter" || attacker.transformed)
        return;
      if (move.category === "Status" && move.id !== "kingsshield")
        return;
      const targetForme = move.id === "kingsshield" ? "Aegislash" : "Aegislash-Blade";
      if (attacker.species.name !== targetForme)
        attacker.formeChange(targetForme);
    }
  },
  himpaper: {
    onModifyMovePriority: 1,
    onModifyMove(move, attacker) {
      if (attacker.species.baseSpecies !== "Himpaper" || attacker.ability !== "competitive" || attacker.transformed)
        return;
      if (move.category === "Status" && move.id !== "closebook")
        return;
      const targetForme = move.id === "closebook" ? "Himpaper" : "Himpaper-Open";
      if (attacker.species.name !== targetForme)
        attacker.formeChange(targetForme);
    }
  },
  maidcoresh: {
    onModifyMovePriority: 1,
    onModifyMove(move, attacker) {
      if (attacker.species.baseSpecies !== "Maidcoresh" || attacker.ability !== "roughskin" || attacker.transformed)
        return;
      if (move.category === "Status" && move.id !== "protect")
        return;
      const targetForme = move.id === "protect" ? "Maidcoresh" : "Maidcoresh-Blade";
      if (attacker.species.name !== targetForme)
        attacker.formeChange(targetForme);
    }
  },
  skeleton: {
    onModifyAccuracyPriority: -2,
    onModifyAccuracy(accuracy) {
      if (typeof accuracy !== "number")
        return;
      this.debug("skeleton - decreasing accuracy");
      return this.chainModify(0.4);
    }
  },
  dragurve: {
    onBasePowerPriority: 15,
    onBasePower(basePower, user, target, move) {
      if (move && move.type === "Dragon") {
        return this.chainModify(1.5);
      }
    }
  },
  mlavagun: {
    onModifyMove(move, pokemon) {
      if (move.secondaries && pokemon.ability === "wacky") {
        delete move.secondaries;
        delete move.self;
        if (move.id === "clangoroussoulblaze")
          delete move.selfBoost;
        move.hasSheerForce = true;
      }
    },
    onBasePowerPriority: 21,
    onBasePower(basePower, pokemon, target, move) {
      if (move.hasSheerForce && pokemon.ability === "wacky") {
        return this.chainModify([5325, 4096]);
      }
    }
  },
  bersecules: {
    onModifyAtkPriority: 3,
    onModifyAtk(basePower, pokemon, target, move) {
      if (pokemon.activeMoveActions === 0) {
        return this.chainModify(0.5);
      }
    }
  },
  crabblante: {
    onModifyDef(def, pokemon, source, move) {
      if (move?.effectType === "Move" && !source.getMoveHitData(move).crit) {
        return this.chainModify(1.2);
      }
    },
    onModifySpD(spd, pokemon, source, move) {
      if (move?.effectType === "Move" && !source.getMoveHitData(move).crit) {
        return this.chainModify(1.2);
      }
    }
  },
  watchdoggoman: {
    onModifyDef(def, pokemon, source, move) {
      if (move?.effectType === "Move" && move.type !== "Normal") {
        return this.chainModify(1.3);
      }
    },
    onModifySpD(spd, pokemon, source, move) {
      if (move?.effectType === "Move" && move.type !== "Normal") {
        return this.chainModify(1.3);
      }
    },
    onModifyDamage(damage, source, target, move) {
      if (move && !target.hasType("Normal")) {
        return this.chainModify(1.3);
      }
    }
  },
  // Novos//
  megax: {
    onModifyAccuracyPriority: -2,
    onModifyAccuracy(accuracy) {
      if (typeof accuracy !== "number")
        return;
      this.debug("megax - decreasing accuracy");
      return this.chainModify(0.3);
    }
  },
  dialzan: {
    onModifyMovePriority: -1,
    onModifyMove(move, source) {
      if (move.basePower) {
        this.debug("Dialzan - aumentando poder do golpe em 50%");
        move.basePower = this.modify(move.basePower, 1.5);
      }
      if (typeof move.accuracy === "number") {
        this.debug("Dialzan - aumentando precis\xE3o do golpe em 50%");
        move.accuracy = Math.min(move.accuracy * 1.5, 100);
      }
    }
  },
  veltran: {
    onSourceModifyDamage(damage, source, target, move) {
      if (move.category === "Special") {
        this.debug("Veltran - reduzindo dano de golpes especiais para 20%");
        return this.chainModify(0.2);
      }
    }
  },
  blazer: {
    onBeforeMove(source, target, move) {
      if (move.category === "Status")
        return;
      const sunMoves = ["solarbeam", "solarblade"];
      const rainMoves = ["thunder", "hurricane"];
      const isInRain = ["raindance", "primordialsea"].includes(target.effectiveWeather());
      const isInSun = ["sunnyday", "desolateland"].includes(target.effectiveWeather());
      const isInHail = ["hail"].includes(target.effectiveWeather());
      if (!isInSun && (sunMoves.includes(move.id) || move.type === "Fire")) {
        this.field.setWeather("sunnyday");
      } else if (!isInRain && (rainMoves.includes(move.id) || move.type === "Water")) {
        this.field.setWeather("raindance");
      } else if (!isInHail && move.type === "Ice") {
        this.field.setWeather("hail");
      } else if (move.type === "Normal" && move.id !== "weatherball") {
        this.field.clearWeather();
      }
    },
    onStart(pokemon) {
      const sideConditions = [
        "spikes",
        "toxicspikes",
        "stealthrock",
        "stickyweb",
        "gmaxsteelsurge",
        "sleazyspores",
        "shattershard"
      ];
      for (const condition of sideConditions) {
        if (pokemon.hp && pokemon.side.removeSideCondition(condition)) {
          this.add("-sideend", pokemon.side, this.dex.conditions.get(condition).name, "[from] move: Rapid Spin", "[of] " + pokemon);
        }
      }
    }
  },
  gengold: {
    onSourceModifyDamage(damage, source, target, move) {
      if (target.hp >= target.maxhp) {
        this.debug("Multiscale weaken");
        return this.chainModify(0.1);
      }
    }
  },
  maltina: {
    onFoeTryMove(target, source, move) {
      const targetAllExceptions = ["perishsong", "flowershield", "rototiller"];
      if (move.target === "foeSide" || move.target === "all" && !targetAllExceptions.includes(move.id)) {
        return;
      }
      const dazzlingHolder = this.effectState.target;
      if ((source.isAlly(dazzlingHolder) || move.target === "all") && move.priority > 0.1) {
        this.attrLastMove("[still]");
        this.add("cant", dazzlingHolder, "ability: Dazzling", move, "[of] " + target);
        return false;
      }
    }
  },
  maledeto: {
    onDamagingHit(damage, target, source, move) {
      if (move.flags["contact"]) {
        source.addVolatile("confusion");
      }
    },
    onModifyPriority(priority, pokemon, target, move) {
      if (move?.category === "Status") {
        move.pranksterBoosted = true;
        return priority + 1;
      }
    }
  },
  mentum: {
    onAnyModifyBoost(boosts, pokemon) {
      const unawareUser = this.effectState.target;
      if (unawareUser === pokemon)
        return;
      if (unawareUser === this.activePokemon && pokemon === this.activeTarget) {
        boosts["def"] = 0;
        boosts["spd"] = 0;
        boosts["evasion"] = 0;
      }
      if (pokemon === this.activePokemon && unawareUser === this.activeTarget) {
        boosts["atk"] = 0;
        boosts["def"] = 0;
        boosts["spa"] = 0;
        boosts["accuracy"] = 0;
      }
    }
  },
  // unaware
  maldade: {
    onModifyMove(move) {
      if (move.flags["mirror"])
        delete move.flags["protect"];
    }
  },
  galequake: {
    onBasePowerPriority: 21,
    onBasePower(basePower, attacker, defender, move) {
      if (move.flags["contact"]) {
        return this.chainModify([5325, 4096]);
      }
    }
    // toughclaws
  },
  floraciel: {
    onTryHitPriority: 1,
    onTryHit(target, source, move) {
      if (target === source || move.hasBounced || !move.flags["reflectable"]) {
        return;
      }
      const newMove = this.dex.getActiveMove(move.id);
      newMove.hasBounced = true;
      newMove.pranksterBoosted = false;
      this.actions.useMove(newMove, target, source);
      return null;
    },
    onAllyTryHitSide(target, source, move) {
      if (target.isAlly(source) || move.hasBounced || !move.flags["reflectable"]) {
        return;
      }
      const newMove = this.dex.getActiveMove(move.id);
      newMove.hasBounced = true;
      newMove.pranksterBoosted = false;
      this.actions.useMove(newMove, this.effectState.target, source);
      return null;
    }
  },
  arcano: {
    onBasePowerPriority: 23,
    onBasePower(basePower, attacker, defender, move) {
      if (move.flags["punch"]) {
        this.debug("Iron Fist boost");
        return this.chainModify([4915, 4096]);
      }
    }
  },
  lovedeath: {
    onModifyAtk(atk, attacker, defender, move) {
      if (attacker.side !== this.effectState.target.side) {
        this.debug("Innate halves foe Attack");
        return this.chainModify(0.5);
      }
    }
  },
  savage: {
    onResidual(pokemon) {
      if (pokemon.baseSpecies.baseSpecies !== "Savage" || pokemon.transformed)
        return;
      if (pokemon.hp <= pokemon.maxhp / 2 && pokemon.species.forme !== "Supreme") {
        pokemon.formeChange("Savage-Supreme", this.effect, true);
        pokemon.heal(pokemon.maxhp);
        pokemon.cureStatus();
        this.add("-activate", pokemon, "ability: Savage to Supreme");
      }
    }
  },
  savagesupreme: {
    onBasePowerPriority: 23,
    onBasePower(basePower, attacker, defender, move) {
      if (move.flags["sound"]) {
        this.debug("Mozart boost");
        return this.chainModify([4915, 4096]);
      }
    },
    onSourceModifyDamage(damage, source, target, move) {
      if ([
        "Fighting",
        "Bug",
        "Grass",
        "Paper",
        "Sound",
        "Cosmic",
        "Steel",
        "Fire",
        "Ice",
        "Rubber",
        "Food",
        "Paper",
        "Flying",
        "Electric",
        "Wood",
        "Tech",
        "Nuclear",
        "Water",
        "Dragon",
        "Plastic",
        "Rock"
      ].includes(move.type)) {
        this.debug("Mozart weaken");
        return this.chainModify(0.4);
      }
    }
  },
  berserker: {
    onTryHitPriority: 1,
    onTryHit(target, source, move) {
      if (target === source || move.hasBounced || !move.flags["reflectable"]) {
        return;
      }
      const newMove = this.dex.getActiveMove(move.id);
      newMove.hasBounced = true;
      newMove.pranksterBoosted = false;
      this.actions.useMove(newMove, target, source);
      return null;
    },
    onAllyTryHitSide(target, source, move) {
      if (target.isAlly(source) || move.hasBounced || !move.flags["reflectable"]) {
        return;
      }
      const newMove = this.dex.getActiveMove(move.id);
      newMove.hasBounced = true;
      newMove.pranksterBoosted = false;
      this.actions.useMove(newMove, this.effectState.target, source);
      return null;
    }
  },
  galactus: {
    onTryAddVolatile(status, pokemon) {
      if (status.id === "flinch")
        return null;
    },
    onTryBoost(boost, target, source, effect) {
      if (effect.name === "Intimidate" && boost.atk) {
        delete boost.atk;
        this.add("-fail", target, "unboost", "Attack", "[from] ability: Inner Focus", "[of] " + target);
      }
    }
  },
  ilusionist: {
    onFoeTrapPokemon(pokemon) {
      if (!pokemon.isAdjacent(this.effectState.target))
        return;
      if (pokemon.isGrounded()) {
        pokemon.tryTrap(true);
      }
    },
    onFoeMaybeTrapPokemon(pokemon, source) {
      if (!source)
        source = this.effectState.target;
      if (!source || !pokemon.isAdjacent(source))
        return;
      if (pokemon.isGrounded(!pokemon.knownType)) {
        pokemon.maybeTrapped = true;
      }
    }
  },
  kirin: {
    onModifyAtk(atk, attacker, defender, move) {
      if (attacker.side !== this.effectState.target.side) {
        this.debug("Innate halves foe Attack");
        return this.chainModify(0.5);
      }
    }
  },
  overheaven: {
    onTrapPokemonPriority: -10,
    onTrapPokemon(pokemon) {
      pokemon.trapped = pokemon.maybeTrapped = false;
    }
  },
  aethernox: {
    onTrapPokemon(pokemon) {
      pokemon.trapped = false;
    },
    onFlinch(target) {
      return false;
    },
    onUpdate(pokemon) {
      if (pokemon.volatiles["confusion"]) {
        pokemon.removeVolatile("confusion");
        this.add("-end", pokemon, "confusion", "[from] ability: Autoridade Suprema");
      }
    },
    onFoeModifyMove(move, target) {
      if (move.priority > 0) {
        move.accuracy = 50;
      }
    }
  },
  drakorion: {
    onTrapPokemon(pokemon) {
      pokemon.trapped = false;
    },
    onFlinch(target) {
      return false;
    },
    onUpdate(pokemon) {
      if (pokemon.volatiles["confusion"]) {
        pokemon.removeVolatile("confusion");
        this.add("-end", pokemon, "confusion", "[from] ability: Autoridade Suprema");
      }
    },
    onFoeModifyMove(move, target) {
      if (move.priority > 0) {
        move.accuracy = 50;
      }
    }
  },
  omnirath: {
    onTrapPokemon(pokemon) {
      pokemon.trapped = false;
    },
    onFlinch(target) {
      return false;
    },
    onUpdate(pokemon) {
      if (pokemon.volatiles["confusion"]) {
        pokemon.removeVolatile("confusion");
        this.add("-end", pokemon, "confusion", "[from] ability: Autoridade Suprema");
      }
    },
    onFoeModifyMove(move, target) {
      if (move.priority > 0) {
        move.accuracy = 50;
      }
    }
  },
  ragnarith: {
    onTrapPokemon(pokemon) {
      pokemon.trapped = false;
    },
    onFlinch(target) {
      return false;
    },
    onUpdate(pokemon) {
      if (pokemon.volatiles["confusion"]) {
        pokemon.removeVolatile("confusion");
        this.add("-end", pokemon, "confusion", "[from] ability: Autoridade Suprema");
      }
    },
    onFoeModifyMove(move, target) {
      if (move.priority > 0) {
        move.accuracy = 50;
      }
    }
  },
  zephandor: {
    onTrapPokemon(pokemon) {
      pokemon.trapped = false;
    },
    onFlinch(target) {
      return false;
    },
    onUpdate(pokemon) {
      if (pokemon.volatiles["confusion"]) {
        pokemon.removeVolatile("confusion");
        this.add("-end", pokemon, "confusion", "[from] ability: Autoridade Suprema");
      }
    },
    onFoeModifyMove(move, target) {
      if (move.priority > 0) {
        move.accuracy = 50;
      }
    }
  }
};
//# sourceMappingURL=conditions.js.map
