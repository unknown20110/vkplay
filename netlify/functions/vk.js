exports.handler = async function(event) {
  const VER = '5.131';
  const { method, token, ...params } = event.queryStringParameters || {};

  if (!method) return { statusCode: 400, body: 'missing method' };
  if (!token)  return { statusCode: 401, body: JSON.stringify({ error: { error_code: 401, error_msg: 'No token' } }) };

  const qs  = new URLSearchParams({ ...params, access_token: token, v: VER });
  const url = `https://api.vk.com/method/${method}?${qs}`;

  // Forward the real client IP so VK doesn't reject the token
  const clientIP = event.headers['x-forwarded-for'] || event.headers['client-ip'] || '';

  try {
    const res = await fetch(url, {
      headers: {
        'X-Forwarded-For': clientIP,
        'User-Agent': event.headers['user-agent'] || 'Mozilla/5.0'
      }
    });
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch(e) {
    return { statusCode: 500, body: e.message };
  }
};
