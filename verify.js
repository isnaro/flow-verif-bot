const { EmbedBuilder } = require('discord.js');
const config = require('./config.json');

const roleMapping = {
  foreign: '1231018578174545970',
  english: '1200592956831305799',
  learning_english: '1201137840134824027',
  french: '1200485716220723220',
  learning_french: '1201137925216272424',
  spanish: '1201137119335292948',
  learning_spanish: '1201137753295962112',
  tamazight: '1200592759438987374',
  learning_tamazight: '1201138020569600000',
};

module.exports = async (client, source, args = []) => {
  try {
    let targetMember;
    let author;
    let reply;
    let options = {};
    let sourceMember;

    if (source.isCommand && source.isCommand()) { // Slash command
      await source.deferReply({ ephemeral: true });
      targetMember = source.options.getMember('user');
      author = source.user;
      sourceMember = source.member;
      reply = (content) => source.followUp({ content, ephemeral: true });
      options = {
        foreign: source.options.getBoolean('foreign'),
        english: source.options.getBoolean('english'),
        learning_english: source.options.getBoolean('learning_english'),
        french: source.options.getBoolean('french'),
        learning_french: source.options.getBoolean('learning_french'),
        spanish: source.options.getBoolean('spanish'),
        learning_spanish: source.options.getBoolean('learning_spanish'),
        tamazight: source.options.getBoolean('tamazight'),
        learning_tamazight: source.options.getBoolean('learning_tamazight'),
      };
    } else { // Prefix command
      if (source.channel.id !== config.allowedChannelId) return;
      const userIdOrMention = args[0];
      targetMember = await resolveMember(source, userIdOrMention);
      author = source.author;
      sourceMember = source.member;
      reply = (content) => source.reply(content);
    }

    if (!targetMember) {
      return reply(`No user found matching ${args[0]}`);
    }

    if (!targetMember.roles.cache.has(config.nonVerifiedRoleId)) {
      return reply('This user is already verified.');
    }

    const hasPermission = sourceMember.roles.cache.some(role => config.allowedRoles.includes(role.id));
    if (!hasPermission) {
      return reply('You do not have permission to use this command.');
    }

    await targetMember.roles.remove(config.nonVerifiedRoleId);

    const assignedRoles = [];
    for (const [roleName, roleId] of Object.entries(roleMapping)) {
      if (options[roleName]) {
        await targetMember.roles.add(roleId);
        assignedRoles.push(roleName.replace('_', ' '));
      }
    }

    await sendVerificationReport(source, targetMember, author, assignedRoles);
    return reply(`Successfully verified ${targetMember.user.username}`);
  } catch (error) {
    console.error('Error verifying user:', error);
    if (source.isCommand && source.isCommand()) {
      return source.followUp({
        content: 'An error has occurred. Please check the console for details.',
        ephemeral: true,
      });
    }
  }
};

async function resolveMember(message, userIdOrMention) {
  let targetMember;

  if (message.mentions.members.size) {
    targetMember = message.mentions.members.first();
  } else {
    targetMember = await message.guild.members.fetch(userIdOrMention).catch(() => null);
  }

  return targetMember;
}

async function sendVerificationReport(source, targetMember, author, assignedRoles) {
  const reportChannel = await source.client.channels.fetch(config.reportChannelId);
  if (!reportChannel) return console.error('Report channel not found');

  const embed = new EmbedBuilder()
    .setTitle('User Verified')
    .setDescription(`A user has been verified.`)
    .addFields(
      { name: 'User', value: `${targetMember.user.tag} (${targetMember.user.id})`, inline: true },
      { name: 'Verified By', value: `${author.tag} (${author.id})`, inline: true },
      { name: 'Date', value: new Date().toLocaleString(), inline: true },
      { name: 'Assigned Roles', value: assignedRoles.length > 0 ? assignedRoles.join(', ') : 'None', inline: false }
    )
    .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp()
    .setColor('#00FF00');

  await reportChannel.send({ embeds: [embed] });
}
