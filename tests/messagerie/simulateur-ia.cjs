// Tests uniquement : remplace le service d'IA par des réponses fixes, et note ce qui lui serait transmis (fichier MOCK_IA_LOG).
const fs = require('node:fs');
const reel = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  const u = String(url && url.url ? url.url : url);
  if (!u.startsWith('https://api.anthropic.com/')) return reel(url, init);
  const corps = JSON.parse(typeof init?.body === 'string' ? init.body : await new Response(init?.body ?? url.body).text());
  const systeme = (corps.system || []).map((s) => s.text).join('\n');
  const contenu = corps.messages.map((m) => (typeof m.content === 'string' ? m.content : m.content.map((c) => c.text).join('\n'))).join('\n');
  fs.appendFileSync(process.env.MOCK_IA_LOG, JSON.stringify({ model: corps.model, fallbacks: corps.fallbacks, effort: corps.output_config?.effort, outils: corps.tools ?? null, systeme, contenu }) + '\n');
  if (process.env.MOCK_IA_PANNE && fs.existsSync(process.env.MOCK_IA_PANNE)) return new Response(JSON.stringify({ type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }), { status: 529, headers: { 'content-type': 'application/json' } });
  const courriel = (contenu.match(/<courriel>[\s\S]*<\/courriel>/) || [''])[0].toLowerCase();
  let sortie;
  if (systeme.startsWith('Tu tries')) {
    const cat = /désabonner|newsletter|promo/.test(courriel) ? 'newsletter' : /ignore (tes|les) (consignes|instructions)/.test(courriel) ? 'spam' : /devis/.test(courriel) ? 'demande_devis' : /facture/.test(courriel) ? 'facturation' : /bloqué|inadmissible|réclamation/.test(courriel) ? 'reclamation' : /remise|prix trop/.test(courriel) ? 'negociation' : 'demande_infos';
    sortie = { categorie: cat, priorite: cat === 'reclamation' ? 'urgent' : cat === 'demande_devis' || cat === 'negociation' ? 'eleve' : cat === 'newsletter' || cat === 'spam' ? 'faible' : 'normal', besoin_reponse: !['newsletter', 'spam'].includes(cat), intention: 'Obtenir une réponse (test).', resume: 'Résumé de test : ' + cat + '.', langue: /hello|quote for/.test(courriel) ? 'en' : 'fr', infos: { societe: '', telephone: '', projet: /terrasse/.test(courriel) ? 'terrasse' : '', montant: '', echeance: '', action_suggeree: 'Répondre au client.' } };
  } else if (systeme.startsWith('Tu résumes')) {
    sortie = { resume: 'Conversation de test résumée.', points: ['Point 1'], prochaine_etape: 'Rappeler le client.' };
  } else {
    const action = contenu.split('\n').filter(Boolean).slice(-2).join(' ');
    sortie = { texte: /Raccourcis/.test(action) ? 'Bonjour,\n\nVersion courte.' : /Traduis/.test(action) ? 'Hello,\n\nTranslated draft.' : 'Bonjour,\n\nMerci pour votre message. Je reviens vers vous sous [délai à confirmer] avec les éléments demandés.\n\nBien cordialement,', manquants: /Raccourcis|Traduis/.test(action) ? [] : ['Délai de réponse à confirmer'] };
  }
  return new Response(JSON.stringify({ id: 'msg_test', type: 'message', role: 'assistant', model: corps.model, content: [{ type: 'text', text: JSON.stringify(sortie) }], stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 10, output_tokens: 10 } }), { status: 200, headers: { 'content-type': 'application/json', 'request-id': 'req_test' } });
};
