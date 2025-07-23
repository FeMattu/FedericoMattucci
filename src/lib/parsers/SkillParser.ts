import Skill from "../interfaces/Skill";
import { cleanValue } from "../utils";
import { TFunction } from "../../hooks/useTranslation";

export default function ParseSkills(rawSkill: any, t: TFunction, scope: string = "skills"): Skill {
    // Se il campo level non è presente ed è presente list allora è una superSkill (supercategoria)
    // altrimenti è una Skill vera e propria (foglia dell'albero)
    
    const result: Skill = {
        name: cleanValue(t, rawSkill.name, scope)
    };

    // Se ha level ed è una foglia
    if (rawSkill.level && !rawSkill.list) {
        result.level = cleanValue(t, rawSkill.level, "skills.level");
    }
    
    // Se ha una lista, è una supercategoria che contiene altre skill
    if (rawSkill.list && Array.isArray(rawSkill.list)) {
        // Per le sottocategorie, costruisco lo scope gerarchico
        const childScope = `${scope}.${rawSkill.name}`;
        result.list = rawSkill.list.map((subSkill: any) => ParseSkills(subSkill, t, childScope));
    }

    return result;
}