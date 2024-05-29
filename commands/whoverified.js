const { SlashCommandBuilder } = require('@discordjs/builders');
const { verificationData } = require('./verify');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whoverified')
    .setDescription('Check who verified a user')
    .addUserOption(option => option.setName('user').setDescription('The user to check').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');

    if (verificationData[user.id]) {
      await interaction.reply({ embeds: [verificationData[user.id]], ephemeral: true });
    } else {
      await interaction.reply({ content: 'No verification details found for this user.', ephemeral: true });
    }
  },
};
