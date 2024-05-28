const { EmbedBuilder } = require('discord.js');
const { verificationData } = require('./verify');

module.exports = async (client, interaction) => {
  const targetUser = interaction.options.getUser('user');

  if (!targetUser) {
    return interaction.reply({ content: 'No user found.', ephemeral: true });
  }

  const verificationDetails = verificationData[targetUser.id];

  if (!verificationDetails) {
    return interaction.reply({ content: 'No verification details found for this user.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setTitle('User Verification Details')
    .addFields(
      { name: 'User', value: `${verificationDetails.user} (${verificationDetails.userId})`, inline: true },
      { name: 'Verified By', value: `${verificationDetails.verifiedBy} (${verificationDetails.verifiedById})`, inline: true },
      { name: 'Date', value: verificationDetails.date, inline: true },
      { name: 'Assigned Roles', value: verificationDetails.assignedRoles.length > 0 ? verificationDetails.assignedRoles.join(', ') : 'None', inline: false }
    )
    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp()
    .setColor('#00FF00');

  interaction.reply({ embeds: [embed], ephemeral: true });
};
