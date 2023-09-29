const fastify = require("fastify")({ logger: true });
const { Keystore, AccountTools, VulcanHebe } = require("vulcan-api-js");
const fs = require("fs");

fastify.get("*", async (request, reply) => {
  try {
    const keystore = new Keystore();
    const keystoreJsonString = fs.readFileSync("keystore.json", "utf8");
    keystore.loadFromJsonString(keystoreJsonString);

    const accountJsonString = fs.readFileSync("account.json", "utf8");
    const account = AccountTools.loadFromJsonString(accountJsonString);

    const client = new VulcanHebe(keystore, account);

    await client.selectStudent();
    const luckNumber = (await client.getLuckyNumber()).number;
    reply.send({ success: true, luckNumber });
  } catch (error) {
    console.log(error);
    reply.status(500).send({ error: error.message });
  }
});

fastify.listen({ port: 2023 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on ${address}`);
});
