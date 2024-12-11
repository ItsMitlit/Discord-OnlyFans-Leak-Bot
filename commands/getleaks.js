const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'getleaks',
    description: 'Fetch a random image from a specific creator.',
    async execute(interaction) {
        const cmdSender = interaction.user.id;
        const platform = interaction.options.getString('platform');
        const creator = interaction.options.getString('creator');

        try {
            const response = await axios.get(`https://coomer.su/api/v1/${platform}/user/${creator}`);

            if (response.data.error) {
                await interaction.editReply({ content: response.data.error });
                return;
            }

            const data = response.data;
            if (data.length === 0) {
                await interaction.editReply({ content: 'No leaks found for this creator.' });
                return;
            }

            const randomItem = data[Math.floor(Math.random() * data.length)];
            const attachments = randomItem.attachments;

            if (attachments.length === 0) {
                await interaction.editReply({ content: 'Whoops! A bad leak was found. Please try again.' });
                return;
            }

            const embeds = attachments.slice(0, 9).map(att => {
                return new EmbedBuilder()
                    .setTitle(`${randomItem.user} - ${randomItem.service}`)
                    .setImage(`https://img.coomer.su/thumbnail/data${att.path}`);
            });

            embeds.push(new EmbedBuilder()
                .setTitle(randomItem.title || 'No title available')
                .setDescription(randomItem.content || 'No content available')
                .setFooter({ text: `${randomItem.user}` || `No user available`}));

            await interaction.editReply({ embeds: embeds });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'An error occurred while fetching the leaks.' });
        }
    }
};