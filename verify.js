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
  female: '1200592378671681666',
  male: '1200591829754712145'
};

const verificationData = {}; // In-memory storage for verification details

module.exports = async (client, source, args = []) => {
  let targetMember;
  let author;
  let reply;
  let options = {};

  if (source.isCommand && source.isCommand()) { // Slash command
    try {
      await source.deferReply({ ephemeral: true });
    } catch (error) {
      console.error('Error deferring reply:', error);
      return;
    }
    targetMember = source.options.getMember('user');
    author = source.user;
    reply = async (content) => {
      try {
        if (source.replied || source.deferred) {
          await source.followUp({ content, ephemeral: true });
        } else {
          await source.reply({ content, ephemeral: true });
        }
      } catch (error) {
        console.error('Error sending reply:', error);
      }
    };
    options = {
      foreign: source.options.getString('foreign') === 'add',
      english: source.options.getString('english') === 'add',
      learning_english: source.options.getString('learning_english') === 'add',
      french: source.options.getString('french') === 'add',
      learning_french: source.options.getString('learning_french') === 'add',
      spanish: source.options.getString('spanish') === 'add',
      learning_spanish: source.options.getString('learning_spanish') === 'add',
      tamazight: source.options.getString('tamazight') === 'add',
      learning_tamazight: source.options.getString('learning_tamazight') === 'add',
      female: source.options.getString('female') === 'add',
      male: source.options.getString('male') === 'add'
    };
  } else { // Prefix command
    if (source.channel.id !== config.allowedChannelId) return;
    const userIdOrMention = args[0];
    targetMember = await resolveMember(source, userIdOrMention);
    author = source.author;
    reply = async (content) => source.reply(content);
  }

  if (!targetMember) {
    return reply(`No user found matching ${args[0]}`);
  }

  if (!targetMember.roles.cache.has(config.nonVerifiedRoleId)) {
    return reply('This user is already verified.');
  }

  const hasPermission = source.member.roles.cache.some(role => config.allowedRoles.includes(role.id));
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

  const verificationDetails = {
    user: targetMember.user.tag,
    userId: targetMember.user.id,
    verifiedBy: author.tag,
    verifiedById: author.id,
    date: new Date().toLocaleString(),
    assignedRoles,
  };

  const embed = new EmbedBuilder()
    .setTitle('User Verified')
    .setDescription(`A user has been verified.`)
    .addFields(
      { name: 'User', value: `${verificationDetails.user} (${verificationDetails.userId})`, inline: true },
      { name: 'Verified By', value: `${verificationDetails.verifiedBy} (${verificationDetails.verifiedById})`, inline: true },
      { name: 'Date', value: verificationDetails.date, inline: true },
      { name: 'Assigned Roles', value: assignedRoles.length > 0 ? assignedRoles.join(', ') : 'None', inline: false }
    )
    .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp()
    .setColor('#00FF00');

  verificationData[targetMember.user.id] = embed; // Store the embed

  await sendVerificationReport(source, targetMember, embed);
  return reply(`Successfully verified ${targetMember.user.username}`);
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

async function sendVerificationReport(source, targetMember, embed) {
  const reportChannel = await source.client.channels.fetch(config.reportChannelId);
  if (!reportChannel) return console.error('Report channel not found');

  await reportChannel.send({ embeds: [embed] });
}

module.exports.verificationData = verificationData; // Export verification data
