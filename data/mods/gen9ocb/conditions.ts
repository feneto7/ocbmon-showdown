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
	
};
