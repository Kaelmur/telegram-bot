import TelegramBot from "node-telegram-bot-api";

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function sumToOneDigit(number) {
  let sum = number
    .toString()
    .split("")
    .map(Number)
    .reduce((a, b) => a + b, 0);

  while (sum > 9) {
    sum = sum
      .toString()
      .split("")
      .map(Number)
      .reduce((a, b) => a + b, 0);
  }

  return sum;
}

function calculateNumerology(birthDate) {
  const today = new Date();

  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  // ОБЩИЙ ДЕНЬ
  const commonDay = sumToOneDigit(
    `${day}${month}${year}`
      .split("")
      .map(Number)
      .reduce((a, b) => a + b, 0)
  );

  // ЛИЧНЫЙ ГОД
  const [bd, bm, by] = birthDate.split(".").map(Number);
  const personalYear = sumToOneDigit(
    bd +
      bm +
      year
        .toString()
        .split("")
        .map(Number)
        .reduce((a, b) => a + b, 0)
  );

  // ЛИЧНЫЙ МЕСЯЦ
  const personalMonth = sumToOneDigit(personalYear + sumToOneDigit(month));

  // ЛИЧНЫЙ ДЕНЬ
  const personalDay = sumToOneDigit(personalMonth + day);

  return {
    commonDay,
    personalYear,
    personalMonth,
    personalDay,
    dayOfMonth: day,
  };
}

function getInterpretation(commonDay, dayOfMonth) {
  if ([10, 20, 30].includes(dayOfMonth)) {
    return "⚠️ Сегодня нежелательно начинать новые проекты и события. Есть высокая вероятность обнуления всех результатов ваших действий. Рекомендуется отложить на другой день крупные покупки, договоры, кредиты и т.д.";
  }

  if (commonDay === 3) {
    return "✅ Благоприятный день через анализ, успех. Хороший день для принятия серьёзных решений, подписания договоров и совершения покупок.";
  }

  if (commonDay === 6) {
    return "✅ Благоприятный день через любовь, успех. Хороший день для принятия решений, для подписания договоров. Делайте покупки, начинайте большие проекты.";
  }

  return null;
}

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(text)) {
    bot.sendMessage(
      chatId,
      "Введите дату рождения в формате ДД.ММ.ГГГГ\nНапример: 05.03.1994"
    );
    return;
  }

  const result = calculateNumerology(text);
  const interpretation = getInterpretation(result.commonDay, result.dayOfMonth);

  let response = `📅 *Нумерологический календарь*\n\n`;
  response += `Общий день: *${result.commonDay}*\n`;
  response += `Личный год: *${result.personalYear}*\n`;
  response += `Личный месяц: *${result.personalMonth}*\n`;
  response += `Личный день: *${result.personalDay}*\n`;

  if (interpretation) {
    response += `\n📝 *Трактовка:*\n${interpretation}`;
  }

  bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
});

console.log("Bot is running...");
