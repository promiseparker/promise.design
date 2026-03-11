export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const clientId     = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Missing Spotify credentials' });
  }

  try {
    // 1 — Client Credentials token
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token } = await tokenRes.json();

    // 2 — Fetch first track from playlist
    const playlistRes = await fetch(
      'https://api.spotify.com/v1/playlists/2FlirRZI9o6GsB0PJ81Fb2/tracks?limit=1&fields=items(track(name,artists(name),album(images),external_urls))',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const data  = await playlistRes.json();
    const track = data.items?.[0]?.track;

    if (!track) return res.status(404).json({ error: 'No tracks found' });

    // Cache for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.json({
      name:   track.name,
      artist: track.artists.map(a => a.name).join(', '),
      image:  track.album.images[1]?.url ?? track.album.images[0]?.url,
      url:    track.external_urls.spotify,
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch track data' });
  }
}
