const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify a user by removing the non-verified role')
    .addUserOption(option => option.setName('user').setDescription('The user to verify').setRequired(true))
    .addStringOption(option => option.setName('foreign').setDescription('Assign foreign role?').addChoice('Add', 'add'))
    .addStringOption(option => option.setName('english').setDescription('Assign English role?').addChoice('Add', 'add'))
    .addStringOption(option => option.setName('learning_english').setDescription('Assign Learning English role?').addChoice('Add', 'add'))
    .addStringOption(option => option.setName('french').setDescription('Assign French role?').addChoice('Add', 'add'))
    .addStringOption(option => option.setName('learning_french').setDescription('Assign Learning French role?').addChoice('Add', 'add'))
    .addStringOption(option => option.setName('spanish').setDescription('Assign Spanish role?').addChoice('Add', 'add'))
    .addStringOption(option => option.setName('learning_spanish').setDescription('Assign Learning Spanish role?').addChoice('Add', 'add'))
    .addStringOption(option => option.setName('tamazight').setDescription('Assign Tamazight role?').addChoice('Add', 'add'))
    .addStringOption(option => option.setName('learning_tamazight').setDescription('Assign Learning Tamazight role?').addChoice('Add', 'add'))
    .addStringOption(option => option.setName('female').setDescription('Assign Female role?').addChoice('Add', 'add'))
    .addStringOption(option => option.setName('male').setDescription('Assign Male role?').addChoice('Add', 'add')),
  async execute(interaction) {
    let targetMember;
    let author;
    let reply;
    let options = {};

    try {
      await interaction.deferReply({ ephemeral: true });
    } catch (error) {
      console.error('Error deferring reply:', error);
      return;
    }

    targetMember = interaction.options.getMember('user');
    author = interaction.user;
    reply = async (content) => {
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content, ephemeral: true });
        } else {
          await interaction.reply({ content, ephemeral: true });
        }
      } catch (error) {
        console.error('Error sending reply:', error);
      }
    };

    options = {
      foreign: interaction.options.getString('foreign') === 'add',
      english: interaction.options.getString('english') === 'add',
      learning_english: interaction.options.getString('learning_english') === 'add',
      french: interaction.options.getString('french') === 'add',
      learning_french: interaction.options.getString('learning_french') === 'add',
      spanish: interaction.options.getString('spanish') === 'add',
      learning_spanish: interaction.options.getString('learning_spanish') === 'add',
      tamazight: interaction.options.getString('tamazight') === 'add',
      learning_tamazight: interaction.options.getString('learning_tamazight') === 'add',
      female: interaction.options.getString('female') === 'add',
      male: interaction.options.getString('male') === 'add'
    };

    if (!targetMember) {
      return reply(`No user found matching ${interaction.options.getUser('user').tag}`);
    }

    if (!targetMember.roles.cache.has(config.nonVerifiedRoleId)) {
      return reply('This user is already verified.');
    }

    const hasPermission = interaction.member.roles.cache.some(role => config.allowedRoles.includes(role.id));
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

    await sendVerificationReport(interaction, targetMember, embed);
    return reply(`Successfully verified ${targetMember.user.username}`);
  },
};

async function sendVerificationReport(source, targetMember, embed) {
  const reportChannel = await source.client.channels.fetch(config.reportChannelId);
  if (!reportChannel) return console.error('Report channel not found');

  await reportChannel.send({ embeds: [embed] });
}

module.exports.verificationData = verificationData; // Export verification data
