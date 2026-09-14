# Autofill forms in iframe

Static test pages for browser autofill behavior inside same-origin iframes.

- `index.html` — profile/address autofill
- `password.html` — saved-password login and new-password sign-up flows
- `card.html` — payment-card autofill

The password and card pages do not transmit or store entered values. Their submit handlers only navigate the iframe to `destination.html` so browser submit/save heuristics can be tested on static hosting.

Published site: <https://natalilis.github.io/autofill-form-test/>
