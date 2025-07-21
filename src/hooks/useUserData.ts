// src/hooks/useUserData.ts
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import ParseUserData from "@/lib/parsers/UserDataParser";
import type UserData from "@/lib/interfaces/UserData";

export function useUserData(locale: string) {
  const [data, setData] = useState<UserData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const t = useTranslation();

  useEffect(() => {
    let active = true;

    fetch(`/data/profile/${locale}.json`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch user data");
        return r.json();
      })
      .then(raw => active && setData(ParseUserData(raw, t)))
      .catch(err => active && setError(err));

    return () => {
      active = false;
    };
  }, [locale, t]);

  return { data, error, loading: !data && !error };
}
