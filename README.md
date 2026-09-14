# Autofill forms in iframe

Static test pages for browser autofill behavior inside same-origin iframes.

- `index.html` — landing page with links to every test
- `profile.html` — profile/address autofill
- `password.html` — saved-password login and new-password sign-up flows
- `card.html` — payment-card autofill

The password and card pages do not store entered values. Card submission is a real POST intercepted locally by a same-origin service worker, so the browser can observe a genuine form submission without card data leaving the device.

Published site: <https://natalilis.github.io/autofill-form-test/>
