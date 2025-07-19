import { useTranslations } from "next-intl";

export function useTranslation() {
  const t = useTranslations();

  const customT = (key: string, options?: any) => {
    
    let result = t(key, { ...options, returnObjects: true });
    
    if(result == key){
      result = t(key.concat('.default'));
      if(result == key.concat('.default')){
        console.warn(`Translation for key "${key}" not found.`);
        return key; // Fallback to the original key if no translation is found
      }
    }

    return result;
  };

  return customT;
}
