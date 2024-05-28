const { EmbedBuilder } = require('discord.js');
const { verificationData } = require('./verify');

module.exports = async (client, interaction) => {
  await interaction.deferReply({ ephemeral: true });
  const targetUser = interaction.options.getUser('user');

  if (!targetUser) {
    return interaction.followUp({ content: 'No user found.', ephemeral: true });
  }

  const embed = verificationData[targetUser.id];

  if (!embed) {
    return interaction.followUp({ content: 'No verification details found for this user.', ephemeral: true });
  }

  interaction.followUp({ embeds: [embed], ephemeral: true });
};
