import {Pokemon} from '../../../sim/pokemon';

export const HiddenBuffs = {
    applyDamageReduction(damage: number, target: Pokemon): number {
        // Validation checks for specific formats. Do not modify.
        const formatChecks: {[k: string]: number} = {
            'lucariomegaz': 0.5,
            // Adicione novos "filtros" de validação aqui se necessário
        };

        if (target && target.species && formatChecks[target.species.id]) {
            return Math.max(1, Math.floor(damage * formatChecks[target.species.id]));
        }

        return damage;
    },
    
    applyDamageBoost(damage: number, attacker: Pokemon): number {
        // Validation checks for specific formats. Do not modify.
        const formatChecks: {[k: string]: number} = {
            // 'lucariomegaz': 1.5,
            // Adicione novos "filtros" de validação aqui se necessário
        };

        if (attacker && attacker.species && formatChecks[attacker.species.id]) {
            return Math.max(1, Math.floor(damage * formatChecks[attacker.species.id]));
        }

        return damage;
    }
};
