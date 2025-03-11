export async function КурсыВалютAPI() {
  const response = await fetch("https://www.cbr-xml-daily.ru/daily_json.js");
  const data = await response.json();
  console.log(data);
  const { USD, EUR } = data.Valute;
  console.log("Курс доллара:", USD.Value);
  console.log("Курс евро:", EUR.Value);
}

export async function КурсыАкцийAPI() {
  const response = await fetch(
    "https://iss.moex.com/iss/engines/stock/markets/shares/securities.json?iss.meta=off"
  );
  const data = await response.json();
  console.log(data);
}
