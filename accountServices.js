require("dotenv").config();

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

async function removeAccountByUserAndChannel({ channelId, userId }) {
  const response = await fetch(
    `${SUPABASE_URL}/Account?userId=eq.${userId}&leaderboardChannelId=eq.${channelId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        apikey: `${SUPABASE_KEY}`,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  return response;
}

async function removeAccountByPlayerAndChannel({ channelId, playerId }) {
  const response = await fetch(
    `${SUPABASE_URL}/Account?playerId=eq.${playerId}&leaderboardChannelId=eq.${channelId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        apikey: `${SUPABASE_KEY}`,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  return response;
}

async function createAccount({ account }) {
  const response = await fetch(`${SUPABASE_URL}/Account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: `${SUPABASE_KEY}`,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({
      ...account,
    }),
  });

  return response;
}

module.exports = {
  removeAccountByUserAndChannel,
  removeAccountByPlayerAndChannel,
  createAccount,
};
