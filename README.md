I mostly based webhook communication and models on how Stripe is handling things

After instaling dependencies you will need to run
`npm run db:run`
to setup docker database

`npm run db:migrate`
to push migrations into the database
`npm run start:dev`
to run the application

all requests to the webooks needs to have
'payment-signature' header
for the mocked version it just need to match WEBHOOK_SECRET env variable
and the request body needs to be encoded json with

```js
{
  customerId: string;
}
```

preferably the data should be bigger based on which webhook the payment service is hitting, for example on inactivation period there should be data when the subscription should be cancelled
