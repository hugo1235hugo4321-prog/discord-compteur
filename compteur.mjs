// Met à jour les salons « 👥│Membres : N » et « 🟢│En ligne : N » du serveur Discord.
// Lancé par GitHub Actions toutes les 10 min (voir .github/workflows/compteur.yml).
// Jeton et identifiants : secrets du dépôt (DISCORD_TOKEN, GUILD_ID, MEMBRES_ID, EN_LIGNE_ID), jamais dans le code.
const { DISCORD_TOKEN, GUILD_ID, MEMBRES_ID, EN_LIGNE_ID } = process.env;
if (!DISCORD_TOKEN || !GUILD_ID) throw new Error('secrets manquants');
const api = async (method, path, body) => {
  const r = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers: { Authorization: `Bot ${DISCORD_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${method} ${path.split('/')[1]} : ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
};
const g = await api('GET', `/guilds/${GUILD_ID}?with_counts=true`);
const cibles = [
  [MEMBRES_ID, `👥│Membres : ${g.approximate_member_count}`],
  [EN_LIGNE_ID, `🟢│En ligne : ${g.approximate_presence_count}`],
];
for (const [id, name] of cibles) {
  if (!id) continue;
  const c = await api('GET', `/channels/${id}`);
  if (c.name === name) { console.log('inchangé :', name); continue; }
  await api('PATCH', `/channels/${id}`, { name });
  console.log('mis à jour :', name);
}
