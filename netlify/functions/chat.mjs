// Chat bot function is disabled.
export const handler = async () => {
  return {
    statusCode: 404,
    body: JSON.stringify({ error: "Chat bot has been disabled." }),
  };
};
