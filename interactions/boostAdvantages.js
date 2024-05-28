module.exports = async (interaction) => {
    if (interaction.customId === 'boost_advantages') {
      await interaction.reply({ content: 'Check the boosting advantages from here: <#1201478443532029974>', ephemeral: true });
    }
  };
  