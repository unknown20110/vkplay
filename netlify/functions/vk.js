// Service token for public group data (no IP restriction)
const SERVICE_TOKEN = '3fd38cb83fd38cb83fd38cb8553c92056333fd33fd38cb855f6a38e711430f7767a595c';

exports.handler = async function(event) {
  const VER = '5.131';
  const { method, token, ...params } = event.queryStringParameters || {};

  if (!method) return { statusCode: 400, body: 'missing method' };

  // For video.get and wall.get — use user token if provided, else service token
  // For user info — skip (not critical)
  const useToken = token || SERVICE_TOKEN;

  const qs = new URLSearchParams({ ...params, access_token: useToken, v: VER });
  const url = `https://api.vk.com/method/${method}?${qs}`;

  try {
    const res  = await fetch(url);
    const data = await res.json();

    // If user token failed with IP error, retry with service token
    if (data.error && data.error.error_code === 5 && token) {
      const qs2 = new URLSearchParams({ ...params, access_token: SERVICE_TOKEN, v: VER });
      const res2 = await fetch(`https://api.vk.com/method/${method}?${qs2}`);
      const data2 = await res2.json();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(data2)
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch(e) {
    return { statusCode: 500, body: e.message };
  }
};
