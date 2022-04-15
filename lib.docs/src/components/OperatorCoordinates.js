/* eslint-env browser */

import BrowserOnly from "@docusaurus/BrowserOnly";
import React from "react";

let promisedS3OperatorInfo = null;

async function getS3Operator() {
  if (!promisedS3OperatorInfo) {
    promisedS3OperatorInfo = fetch(
      "https://eu2.contabostorage.com/963797152a304f4bb7f75cc0af884bd7:buidler-labs/projects/hedera-strato-js/docs-operator.json"
    )
      .then((docsOperatorResponse) =>
        docsOperatorResponse.body.getReader().read()
      )
      .then(({ value }) => new TextDecoder().decode(value))
      .then((rawDocsOperator) => JSON.parse(rawDocsOperator));
  }
  return promisedS3OperatorInfo;
}

export const OperatorId = () => {
  const [operator, setOperator] = React.useState({
    accountId: "unknown",
    network: "unknown",
  });

  React.useEffect(() => {
    getS3Operator().then((docsOperator) => setOperator(docsOperator));
  }, []);

  return (
    <BrowserOnly fallback={<code>unknown</code>}>
      {() =>
        operator.network === "testnet" ? (
          <a
            href={
              "https://testnet.dragonglass.me/hedera/accounts/" +
              operator.accountId
            }
          >
            <code>{operator.accountId}</code>
          </a>
        ) : (
          <code>{operator.accountId}</code>
        )
      }
    </BrowserOnly>
  );
};

export const OperatorNetwork = () => {
  const [operator, setOperator] = React.useState({
    accountId: "unknown",
    network: "unknown",
  });

  React.useEffect(() => {
    getS3Operator().then((docsOperator) => setOperator(docsOperator));
  }, []);

  return (
    <BrowserOnly fallback={<code>unknown</code>}>
      {() => <code>{operator.network}</code>}
    </BrowserOnly>
  );
};
