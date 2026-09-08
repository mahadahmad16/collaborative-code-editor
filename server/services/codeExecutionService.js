const JUDGE0_URL =
  process.env.JUDGE0_URL ||
  "https://ce.judge0.com";

const LANGUAGE_IDS = {
  javascript: 63,
  java: 62,
};

const TERMINAL_STATUSES = new Set([
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
]);

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (process.env.JUDGE0_AUTH_TOKEN) {
    headers["X-Auth-Token"] =
      process.env.JUDGE0_AUTH_TOKEN;
  }

  if (process.env.JUDGE0_AUTH_USER) {
    headers["X-Auth-User"] =
      process.env.JUDGE0_AUTH_USER;
  }

  return headers;
};

const sleep = (milliseconds) =>
  new Promise((resolve) =>
    setTimeout(resolve, milliseconds)
  );

const createSubmission = async ({
  language,
  code,
  stdin = "",
}) => {
  const languageId = LANGUAGE_IDS[language];

  if (!languageId) {
    throw new Error(
      `Unsupported language: ${language}`
    );
  }

  console.log("Judge0 submission:", {
    language,
    languageId,
    stdin: JSON.stringify(stdin),
  });

  const response = await fetch(
    `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin,
        cpu_time_limit: 2,
        wall_time_limit: 5,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Unable to create code submission"
    );
  }

  if (!data?.token) {
    throw new Error(
      "Judge0 did not return a submission token"
    );
  }

  return data.token;
};

const getSubmission = async (token) => {
  const response = await fetch(
    `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Unable to retrieve execution result"
    );
  }

  return data;
};

const executeCode = async ({
  language,
  code,
  stdin = "",
}) => {
  if (!code?.trim()) {
    throw new Error(
      "There is no code to execute."
    );
  }

  const token = await createSubmission({
    language,
    code,
    stdin,
  });

  const maxAttempts = 30;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt++
  ) {
    const result =
      await getSubmission(token);

    const statusId =
      result?.status?.id;

    if (
      TERMINAL_STATUSES.has(statusId)
    ) {
      return {
        token,
        status: result.status,
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        compileOutput:
          result.compile_output || "",
        message: result.message || "",
        time: result.time ?? null,
        memory: result.memory ?? null,
      };
    }

    await sleep(500);
  }

  throw new Error(
    "Code execution timed out."
  );
};

export {
  executeCode,
  LANGUAGE_IDS,
};