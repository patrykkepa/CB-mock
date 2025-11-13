import { createI18n } from 'vue-i18n';
import pl from './pl.json';
import en from './en.json';

const userLang = localStorage.getItem('lang') || 'en';

const i18n = createI18n({
    legacy: false, // ✅ dla Composition API
    locale: userLang,
    fallbackLocale: 'en',
    messages: { pl, en },
});

export default i18n;
