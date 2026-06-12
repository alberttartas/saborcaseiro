export default async function handler(req, res) {

  const token = process.env.FOOTBALL_TOKEN;

  const response = await fetch('/api/copa'),
    {
      headers: {
        'X-Auth-Token': token
      }
    }
  );

  const data = await response.json();

  res.status(200).json(data);
}
