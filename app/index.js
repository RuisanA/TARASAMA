const http = require("http");
const {
  Client,
  Intents,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Permissions,
} = require("discord.js");
const moment = require("moment");
const express = require("express");
const app = express();
const fs = require("fs");
const axios = require("axios");
const util = require("util");
const path = require("path");
const cron = require("node-cron");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require("dotenv").config();
const client = new Client({
  partials: ["CHANNEL"],
  intents: new Intents(32767),
});
const {
  Modal,
  TextInputComponent,
  SelectMenuComponent,
  showModal,
} = require("discord-modals");
const discordModals = require("discord-modals");
discordModals(client);
const newbutton = (buttondata) => {
  return {
    components: buttondata.map((data) => {
      return {
        custom_id: data.id,
        label: data.label,
        style: data.style || 1,
        url: data.url,
        emoji: data.emoji,
        disabled: data.disabled,
        type: 2,
      };
    }),
    type: 1,
  };
};
process.env.TZ = "Asia/Tokyo";
("use strict");
let guildId;

http
  .createServer(function (request, response) {
    try {
      response.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
      response.end(
        `ログイン`
      );
    } catch (e) {
      console.log(e);
    }
  })
  .listen(3000);

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.error("tokenが設定されていません！");
  process.exit(0);
}

client.on("ready", (client) => {
  console.log(`ログイン: ${client.user.tag}`);
  client.user.setActivity({
    type: "PLAYING",
    name: `Develop by @rui06060`,
  });
  client.guilds.cache.size;
  client.user.setStatus("online");
});

const mentionCounter = new Map();

client.on('messageCreate', async (message) => {
    
    if (message.author.bot || !message.guild) return;

    const isSenderAdmin = message.member.permissions.has('ADMINISTRATOR') || message.guild.ownerId === message.author.id;
    if (isSenderAdmin) return;

    const hasAdminMention = message.mentions.members.some(m => 
        m.permissions.has('ADMINISTRATOR') || m.guild.ownerId === m.id
    );

    if (hasAdminMention) {
        const userId = message.author.id;
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        let userData = mentionCounter.get(userId);

        if (!userData || (now - userData.lastReset) > oneDay) {
            userData = { count: 0, lastReset: now };
        }

        userData.count++;

        if (userData.count >= 2) {
            
            try {
                await message.member.timeout(oneDay, '管理者への過度なメンション');

                const embed = new MessageEmbed()
                .setTitle("タイムアウト")
                .setDescription(`管理者への2回以上のメンションを行ったため24時間のタイムアウトを実行しました`)
                .setColor("RANDOM")
                .setTimestamp();

                await message.reply({ embeds: [embed] }).then(sentMessage => {
                    setTimeout(() => {
                        sentMessage.delete().catch(err => console.error("メッセージ削除失敗:", err));
                    }, 10000);
                });
                
                mentionCounter.delete(userId);
            } catch (error) {
                console.error('タイムアウト付与に失敗しました:', error);
            }
        } else {
            mentionCounter.set(userId, userData);
        }
    }
});

client.on('guildMemberRemove', async (member) => {
    if (member.id === member.guild.ownerId || member.id === client.user.id) return;

    try {
        await member.ban({ 
            reason: 'サーバー脱退',
        });

        console.log(`${member.user.tag} (${member.id}) を自動BANしました。`);

    } catch (error) {
        console.error('自動BANの実行に失敗しました:', error);
    }
});

process.on('uncaughtException', (error) => {
    console.error('未処理の例外:', error);
    fs.appendFileSync('error.log', `未処理の例外: ${error.stack}\n`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未処理の拒否:', reason);
    fs.appendFileSync('error.log', `未処理の拒否: ${reason}\n`);
});

client.login(process.env.DISCORD_BOT_TOKEN);