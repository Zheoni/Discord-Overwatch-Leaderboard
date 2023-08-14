require("dotenv").config();

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

async function getLeaderboardWithAccounts({ channelId }) {
  const response = await fetch(
    `${SUPABASE_URL}/Leaderboard?channelId=eq.${channelId}&select=*,Account(*)`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: `${SUPABASE_KEY}`,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    console.error(response.statusText);
    return interaction.reply({
      content: "Bot error",
      ephemeral: true,
    });
  }

  const body = await response.json();

  return body[0];
}

async function getAllLeaderboardWithAccounts() {
  const response = await fetch(
    `${SUPABASE_URL}/Leaderboard?select=*,Account(*)`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: `${SUPABASE_KEY}`,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    console.error(response.statusText);
    return interaction.reply({
      content: "Bot error",
      ephemeral: true,
    });
  }

  return await response.json();
}

async function createNewLeaderboard({ leaderboard }) {
  const response = await fetch(`${SUPABASE_URL}/Leaderboard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: `${SUPABASE_KEY}`,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ ...leaderboard }),
    // body: JSON.stringify({
    //   guildId: interaction.guildId, // gpt-3.5-turbo / text-davinci-003
    //   channelId: interaction.channelId,
    //   messageId: msg.id,
    //   title,
    //   splitRoles,
    // }),
  });

  return response;
}

async function updateLeaderboard({ partialLeaderboard, channelId }) {
  const response = await fetch(
    `${SUPABASE_URL}/Leaderboard?channelId=eq.${channelId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: `${SUPABASE_KEY}`,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        ...partialLeaderboard,
      }),
      //   body: JSON.stringify({
      //     title: newTitle ?? undefined,
      //     splitRoles: splitRoles ?? undefined,
      //   }),
    }
  );

  return response;
}

async function removeLeaderboard({ channelId }) {
  const response = await fetch(
    `${SUPABASE_URL}/Leaderboard?channelId=eq.${channelId}`,
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

async function removeLeaderboardByGuildId({ guildId }) {
  const response = await fetch(
    `${SUPABASE_URL}/Leaderboard?guildId=eq.${guildId}`,
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

module.exports = {
  getLeaderboardWithAccounts,
  getAllLeaderboardWithAccounts,
  createNewLeaderboard,
  updateLeaderboard,
  removeLeaderboard,
  removeLeaderboardByGuildId,
};
