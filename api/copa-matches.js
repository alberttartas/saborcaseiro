// /api/copa-matches.js
export default async function handler(req, res) {
  const token = process.env.FOOTBALL_TOKEN;

  try {
    const response = await fetch(
      'https://api.football-data.org/v4/teams/759/matches?competitions=WC&season=2026&limit=10',
      {
        headers: {
          'X-Auth-Token': token
        }
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar partidas:', error);
    res.status(500).json({ error: 'Erro ao carregar dados' });
  }
}
