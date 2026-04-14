interface QuestionForEmail {
  subjectArea: string;
  questionText: string;
  difficulty: number;
}

interface DailyDigestOptions {
  userName: string;
  questions: QuestionForEmail[];
  batchId: string;
  appUrl: string;
}

export function buildDailyDigestHtml({
  userName,
  questions,
  batchId,
  appUrl,
}: DailyDigestOptions): string {
  const difficultyLabel = (d: number) =>
    ["Easy", "Medium", "Hard"][d - 1] ?? "Medium";

  const difficultyColor = (d: number) =>
    ({ 1: "#22c55e", 2: "#eab308", 3: "#ef4444" })[d] ?? "#eab308";

  const questionRows = questions
    .map(
      (q, i) => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 12px; color: #6b7280;">Q${i + 1}</span>
          <span style="font-size: 12px; background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 12px;">${q.subjectArea}</span>
          <span style="font-size: 12px; color: ${difficultyColor(q.difficulty)};">${difficultyLabel(q.difficulty)}</span>
        </div>
        <p style="margin: 0; color: #111827; font-size: 15px;">${escapeHtml(q.questionText)}</p>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <tr>
      <td style="padding: 32px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
        <h1 style="margin: 0; font-size: 24px; color: #111827;">Daily Knowledge Quiz</h1>
        <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Good morning, ${escapeHtml(userName)}! Here are your questions for today.</p>
      </td>
    </tr>
    ${questionRows}
    <tr>
      <td style="padding: 24px; text-align: center;">
        <a href="${appUrl}/questions/${batchId}" style="display: inline-block; background: #111827; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
          Answer on the web
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          You received this because you signed up for Daily Knowledge Quiz.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
