// Machine a etats serveur : definit les transitions autorisees par statut et par role
const TRANSITIONS = {
  enrole: { en_production: ['super_admin', 'production'] },
  en_production: {
    produit: ['super_admin', 'production'],
    quarantaine: ['super_admin', 'production']
  },
  produit: { pret_a_livrer: ['super_admin', 'production'] },
  quarantaine: { en_production: ['super_admin', 'production'] },
  pret_a_livrer: { livre: ['super_admin', 'reception_plaintes'] },
  livre: { plainte_ouverte: ['super_admin', 'reception_plaintes'] },
  plainte_ouverte: { plainte_resolue: ['super_admin', 'reception_plaintes'] },
  plainte_resolue: {}
};

function canTransition(statutActuel, statutCible, role) {
  if (role === 'super_admin') {
    return !!(TRANSITIONS[statutActuel] && Object.prototype.hasOwnProperty.call(TRANSITIONS[statutActuel], statutCible));
  }
  const cible = TRANSITIONS[statutActuel] && TRANSITIONS[statutActuel][statutCible];
  return !!(cible && cible.includes(role));
}

module.exports = { canTransition, TRANSITIONS };
