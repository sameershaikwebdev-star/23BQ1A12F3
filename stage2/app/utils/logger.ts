const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNTc0MzQ0LCJpYXQiOjE3NDM1NzQwNDQsImlzcyI6IkFmZm9yZGllZCIsImp0aSI6ImQ5Y2JiNjk5LTZhMjctNDRhNS04ZDU5LThi1MWJlZmE4MTZkYSIsInN1YiI6InJhbWltyaXNobmFAYWJjLmVkdSJ9LCJlbWFpbCI6InJhbWltyaXNobmFAYWJjLmVkdSIsInVzZXJJZCI6IjNvdmhPa0kyOUtySIsInJvbGVzIjpbImFhZG1pbiIsImlwIiwiWNjZXNzQ29kZSI6InhnQXNOQyIsImNsaWVudElEIjoiZDljYmI2OTktNmEyNy00NGE1LThkNTktOGIxYmVmYTgxNmRhIiwiY2xpZW50U2VjcmV0IjoiZFZFRhVkFJTZhTVZhVVFphlTSJ9.YApD98gq0IN_OWw7JMfmuUfK1m4hLTm7AIcLDcLAzVg";
export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string
) {
  try {
    await fetch(
      "http://4.224.186.213/evaluation-service/logs",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stack,
          level,
          package: pkg,
          message,
        }),
      }
    );
  } catch (err) {
    console.error("Logging failed:", err);
  }
}