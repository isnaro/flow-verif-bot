const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  registerSlashCommands();
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'verify') {
    require('./verify')(client, message, args);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'verify') {
    require('./verify')(client, interaction);
  }
});

client.login(config.token);

async function registerSlashCommands() {
  const commands = [
    {
      name: 'verify',
      description: 'Verify a user by removing the non-verified role',
      options: [
        {
          name: 'user',
          description: 'The user to verify',
          type: 6, // USER type
          required: true,
        },
        {
          name: 'foreign',
          description: 'Assign foreign role?',
          type: 5, // BOOLEAN type
          required: false,
        },
        {
          name: 'english',
          description: 'Assign English role?',
          type: 5, // BOOLEAN type
          required: false,
        },
        {
          name: 'learning_english',
          description: 'Assign Learning English role?',
          type: 5, // BOOLEAN type
          required: false,
        },
        {
          name: 'french',
          description: 'Assign French role?',
          type: 5, // BOOLEAN type
          required: false,
        },
        {
          name: 'learning_french',
          description: 'Assign Learning French role?',
          type: 5, // BOOLEAN type
          required: false,
        },
        {
          name: 'spanish',
          description: 'Assign Spanish role?',
          type: 5, // BOOLEAN type
          required: false,
        },
        {
          name: 'learning_spanish',
          description: 'Assign Learning Spanish role?',
          type: 5, // BOOLEAN type
          required: false,
        },
        {
          name: 'tamazight',
          description: 'Assign Tamazight role?',
          type: 5, // BOOLEAN type
          required: false,
        },
        {
          name: 'learning_tamazight',
          description: 'Assign Learning Tamazight role?',
          type: 5, // BOOLEAN type
          required: false,
        }
      ],
    },
  ];

  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationGuildCommands(client.user.id, config.guildId), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}
