import { LangCode } from '../enums/lang-code.enum';
import { ILangConfig } from '../interfaces/lang-config.interface';

export const LangOptionsMap = new Map<LangCode, ILangConfig>()
  .set(LangCode.EN, { code: LangCode.EN, name: 'English', flag: '🇬🇧' })
  .set(LangCode.UA, { code: LangCode.UA, name: 'Українська', flag: '🇺🇦' });
