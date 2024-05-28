const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testboost')
    .setDescription('Send a test boost embed'),

  async execute(interaction) {
    const user = interaction.user;
    const embed = new EmbedBuilder()
      .setTitle('NEW Server Boost!')
      .setDescription(`A big thanks to ${user} for helping out with the Flow server upgrade! The community will really appreciate it`)
      .setImage('https://media.discordapp.net/attachments/470983675157151755/1229087659977085078/mf8Uagt.png?ex=66569dd5&is=66554c55&hm=bbbbf8319f421641ce5a9762eaddd701a03e50479d377fdeb545e16d359973c6&format=webp&quality=lossless&width=889&height=554&')
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'FLOW | BOOSTING SYSTEM' })
      .setColor('#FFC0CB');

    const button = new ButtonBuilder()
      .setCustomId('boost_advantages')
      .setLabel('Boosting Advantages')
      .setEmoji('<a:FLOW_nitro_Boost:1229089677630505032>')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ content: `${user}`, embeds: [embed], components: [row] });
  }
};
