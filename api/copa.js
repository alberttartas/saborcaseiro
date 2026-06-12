// /api/copa.js
export default async function handler(req, res) {
  // Habilita CORS para desenvolvimento
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.FOOTBALL_TOKEN;
  
  if (!token) {
    console.error('FOOTBALL_TOKEN não configurado');
    return res.status(500).json({ error: 'Token da API não configurado' });
  }

  try {
    const response = await fetch(
      'https://api.football-data.org/v4/competitions/WC/standings?season=2026',
      {
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Football-Data retornou ${response.status}: ${errorText}`);
      return res.status(response.status).json({ 
        error: `API retornou erro ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro no proxy /api/copa:', error);
    res.status(500).json({ 
      error: 'Erro interno no proxy',
      message: error.message 
    });
  }
}
