(() => {
  "use strict";

  const networks = {
    visa: { label: "Visa", prefixes: ["4"], length: 16, cvvLength: 3 },
    mastercard: { label: "Mastercard", prefixes: ["51", "52", "53", "54", "55"], length: 16, cvvLength: 3 },
    amex: { label: "American Express", prefixes: ["34", "37"], length: 15, cvvLength: 4 },
    discover: { label: "Discover", prefixes: ["6011", "65"], length: 16, cvvLength: 3 },
    jcb: { label: "JCB", prefixes: ["35"], length: 16, cvvLength: 3 },
    unionpay: { label: "UnionPay", prefixes: ["62"], length: 16, cvvLength: 3 }
  };
  const testNames = ["TEST USER", "QA PERSON", "DEMO HOLDER", "SANDBOX USER", "AUTOFILL TEST"];

  const form = document.getElementById("card-generator-form");
  const networkSelect = document.getElementById("card-network");
  const countSelect = document.getElementById("card-count");
  const formatSelect = document.getElementById("output-format");
  const output = document.querySelector(".generator-output");
  const cardsContainer = document.getElementById("card-results");
  const formattedOutput = document.getElementById("formatted-results");
  const copyAllButton = document.getElementById("copy-results");
  const status = document.getElementById("generator-status");
  let generatedCards = [];

  function randomInt(max) {
    const maxUint = 0x100000000;
    const limit = maxUint - (maxUint % max);
    const values = new Uint32Array(1);
    do crypto.getRandomValues(values); while (values[0] >= limit);
    return values[0] % max;
  }

  function randomDigits(length) {
    let result = "";
    for (let i = 0; i < length; i += 1) result += randomInt(10);
    return result;
  }

  function luhnCheckDigit(partial) {
    let sum = 0;
    const reversed = [...partial].reverse();
    reversed.forEach((character, index) => {
      let digit = Number(character);
      if (index % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    });
    return String((10 - (sum % 10)) % 10);
  }

  function generatePan(network) {
    const prefix = network.prefixes[randomInt(network.prefixes.length)];
    const partial = prefix + randomDigits(network.length - prefix.length - 1);
    return partial + luhnCheckDigit(partial);
  }

  function generateExpiry() {
    const today = new Date();
    const month = String(randomInt(12) + 1).padStart(2, "0");
    const year = String((today.getFullYear() + randomInt(5) + 1) % 100).padStart(2, "0");
    return `${month}/${year}`;
  }

  function generateCard(networkKey) {
    const network = networks[networkKey];
    return {
      network: network.label,
      number: generatePan(network),
      cardholder: testNames[randomInt(testNames.length)],
      expiry: generateExpiry(),
      cvv: randomDigits(network.cvvLength)
    };
  }

  function formatNumber(number) {
    if (number.length === 15) return number.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
    return number.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function asText(cards) {
    return cards.map(card => `${card.network} | ${card.number} | ${card.cardholder} | ${card.expiry} | ${card.cvv}`).join("\n");
  }

  function asCsv(cards) {
    const rows = cards.map(card => [card.network, card.number, card.cardholder, card.expiry, card.cvv].map(value => `"${value}"`).join(","));
    return ["network,number,cardholder,expiry,cvv", ...rows].join("\n");
  }

  function serializedCards() {
    if (formatSelect.value === "json") return JSON.stringify(generatedCards, null, 2);
    if (formatSelect.value === "csv") return asCsv(generatedCards);
    return asText(generatedCards);
  }

  function renderCards() {
    const useTiles = formatSelect.value === "cards";
    cardsContainer.hidden = !useTiles;
    formattedOutput.hidden = useTiles;
    cardsContainer.replaceChildren();

    if (!useTiles) {
      formattedOutput.textContent = serializedCards();
      return;
    }

    generatedCards.forEach((card, index) => {
      const article = document.createElement("article");
      article.className = "generated-card";
      article.innerHTML = `
        <dl>
          <dt>Сеть</dt><dd>${card.network}</dd>
          <dt>Номер</dt><dd>${formatNumber(card.number)}</dd>
          <dt>Владелец</dt><dd>${card.cardholder}</dd>
          <dt>Срок</dt><dd>${card.expiry}</dd>
          <dt>CVV</dt><dd>${card.cvv}</dd>
        </dl>
        <button class="copy-card" type="button" data-index="${index}">Копировать</button>
      `;
      cardsContainer.appendChild(article);
    });
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = successMessage;
    } catch {
      status.textContent = "Не удалось скопировать автоматически.";
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const count = Number(countSelect.value);
    generatedCards = Array.from({ length: count }, () => generateCard(networkSelect.value));
    renderCards();
    output.hidden = false;
    status.textContent = `Создано тестовых записей: ${count}.`;
  });

  form.addEventListener("reset", () => {
    requestAnimationFrame(() => {
      generatedCards = [];
      cardsContainer.replaceChildren();
      formattedOutput.textContent = "";
      output.hidden = true;
      status.textContent = "";
    });
  });

  formatSelect.addEventListener("change", () => {
    if (generatedCards.length) renderCards();
  });

  cardsContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".copy-card");
    if (!button) return;
    const card = generatedCards[Number(button.dataset.index)];
    copyText(asText([card]), "Тестовая запись скопирована.");
  });

  copyAllButton.addEventListener("click", () => {
    copyText(formatSelect.value === "cards" ? asText(generatedCards) : serializedCards(), "Все тестовые записи скопированы.");
  });
})();
