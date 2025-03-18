
/**
 * Formate une date au format "jj/mm/aaaa".
 * @param {string} dateStr - La date à formater (au format ISO ou autre).
 * @returns {string} La date formatée.
 */
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Formate un montant en devise USD.
 * @param {number} amount - Le montant à formater.
 * @returns {string} Le montant formaté.
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};