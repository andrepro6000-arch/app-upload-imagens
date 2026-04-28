export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { image } = req.body;

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: new URLSearchParams({
          image: image
        })
      }
    );

    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ error: 'Erro no ImgBB' });
    }

    return res.status(200).json({
      success: true,
      data: {
        url: data.data.url
      }
    });

  } catch (error) {
    return res.status(500).json({ error: 'Erro no upload' });
  }
}