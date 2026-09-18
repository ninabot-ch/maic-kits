import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
const root = process.cwd();
export const company = yaml.load(fs.readFileSync(path.join(root, 'company.yaml'), 'utf8'));
const all = yaml.load(fs.readFileSync(path.join(root, 'content.yaml'), 'utf8'));
export const site = `https://${company.slug}.myaicompany.ch`;
export const LANGS = (company.langs || [company.lang || 'fr']).filter(l => all[l]);
export const DEFAULT = LANGS.includes(company.lang) ? company.lang : LANGS[0];
export const content = (lang) => all[lang] || all[DEFAULT];
export const prefix = (lang) => lang === DEFAULT ? '' : `/${lang}`;
export const tagline = (lang) => typeof company.tagline === 'object' ? (company.tagline[lang] || company.tagline[DEFAULT] || '') : (company.tagline || '');
// chaînes de l'interface du kit (navigation, formulaire, pages légales)
export const UI = {
  fr: { nav_services: 'Ce qu\'on fait', nav_about: 'À propos', nav_contact: 'Contact', legal: 'Mentions légales', privacy: 'Confidentialité', contact: 'Contact',
        f_name: 'Votre nom', f_email: 'Votre e-mail', f_msg: 'Votre message', f_ph: 'Ce que vous imaginez, pour quand, pour où.', f_consent: 'J\'accepte que mes coordonnées servent à répondre à ma demande (et à rien d\'autre).', f_send: 'Envoyer', f_sending: 'Envoi…', f_ok: 'Merci, message reçu. Réponse sous 48 heures.', f_err: 'Envoi impossible, réessayez dans un instant.',
        write_us: 'Écrivez-nous', we_answer: 'On répond à tout le monde.', or_email: 'Ou par e-mail :',
        legal_title: 'Mentions légales', legal_owner: 'Responsable du site', legal_person: 'à titre personnel (activité non inscrite au registre du commerce)', legal_host: 'Hébergement', legal_host_text: 'MyAiCompany, un service de Ninabot Sàrl, Chemin de Riantbosson 19, 1217 Meyrin, Suisse.', legal_content: 'Contenu', legal_content_text: 'Les textes et images de ce site appartiennent à leur auteur. Toute reproduction demande son accord.',
        priv_title: 'Confidentialité', priv_sub: 'Ce que ce site fait de vos données, en clair.', priv_what: 'Ce qui est collecté', priv_what_text: 'Uniquement ce que vous écrivez dans le formulaire de contact : nom, e-mail, message. Aucun cookie de suivi, aucune publicité.', priv_why: 'Pourquoi', priv_why_text: 'Pour vous répondre. Vos coordonnées ne sont ni vendues ni transmises à des tiers, hors les prestataires techniques nécessaires au fonctionnement du site (hébergement en Suisse par MyAiCompany / Ninabot Sàrl, envoi d\'e-mails).', priv_how_long: 'Combien de temps', priv_how_long_text: 'Le temps de traiter votre demande, puis au plus 24 mois, sauf si vous devenez client.', priv_rights: 'Vos droits', priv_rights_text: 'Accès, rectification, effacement : écrivez à', priv_law: 'Base légale : loi fédérale suisse sur la protection des données (LPD).', lang_name: 'Français' },
  en: { nav_services: 'What we do', nav_about: 'About', nav_contact: 'Contact', legal: 'Legal notice', privacy: 'Privacy', contact: 'Contact',
        f_name: 'Your name', f_email: 'Your e-mail', f_msg: 'Your message', f_ph: 'What you have in mind, when, where.', f_consent: 'I agree that my details are used to answer my request (and nothing else).', f_send: 'Send', f_sending: 'Sending…', f_ok: 'Thank you, message received. We answer within 48 hours.', f_err: 'Could not send, please try again in a moment.',
        write_us: 'Write to us', we_answer: 'We answer everyone.', or_email: 'Or by e-mail:',
        legal_title: 'Legal notice', legal_owner: 'Site owner', legal_person: 'as a private individual (activity not registered in the commercial register)', legal_host: 'Hosting', legal_host_text: 'MyAiCompany, a service of Ninabot Sàrl, Chemin de Riantbosson 19, 1217 Meyrin, Switzerland.', legal_content: 'Content', legal_content_text: 'The texts and images on this site belong to their author. Any reproduction requires their consent.',
        priv_title: 'Privacy', priv_sub: 'What this site does with your data, in plain words.', priv_what: 'What is collected', priv_what_text: 'Only what you type in the contact form: name, e-mail, message. No tracking cookies, no advertising.', priv_why: 'Why', priv_why_text: 'To answer you. Your details are neither sold nor passed on to third parties, except the technical providers the site needs (hosting in Switzerland by MyAiCompany / Ninabot Sàrl, e-mail delivery).', priv_how_long: 'For how long', priv_how_long_text: 'As long as it takes to handle your request, then at most 24 months, unless you become a customer.', priv_rights: 'Your rights', priv_rights_text: 'Access, correction, deletion: write to', priv_law: 'Legal basis: Swiss Federal Act on Data Protection (FADP).', lang_name: 'English' },
};
