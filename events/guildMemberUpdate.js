const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = async (oldMember, newMember) => {
  const channel = await newMember.guild.channels.fetch('1201162198647590952');
  if (!channel) return;

  const oldBoosting = oldMember.premiumSince;
  const newBoosting = newMember.premiumSince;

  if (!oldBoosting && newBoosting) {
    const embed = new EmbedBuilder()
      .setTitle('NEW Server Boost!')
      .setDescription(`A big thanks to ${newMember} for helping out with the Flow server upgrade! The community will really appreciate it`)
      .setImage('https://media.discordapp.net/attachments/470983675157151755/1229087659977085078/mf8Uagt.png?ex=66569dd5&is=66554c55&hm=bbbbf8319f421641ce5a9762eaddd701a03e50479d377fdeb545e16d359973c6&format=webp&quality=lossless&width=889&height=554&')
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'FLOW | BOOSTING SYSTEM' })
      .setColor('#FFC0CB');

    const button = new ButtonBuilder()
      .setCustomId('boost_advantages')
      .setLabel('Boosting Advantages')
      .setEmoji('<a:FLOW_nitro_Boost:1229089677630505032>')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({ content: `${newMember}`, embeds: [embed], components: [row] });
  }
};
