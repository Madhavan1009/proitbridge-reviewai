import Link from "next/link";
import { ArrowRight, BookOpen, Github, Workflow } from "lucide-react";
import { MarketingNav } from "@/components/shell/MarketingNav";
import { MarketingFooter } from "@/components/shell/MarketingFooter";
import { Section, SectionHero } from "@/components/ui/Section";
import { WorkflowFlow } from "@/components/workflow/WorkflowFlow";

export default function HowItWorksPage() {
  return (
    <div className="animate-fade-in">
      <MarketingNav />

      {/* HERO */}
      <Section tone="dark" className="!pt-16 lg:!pt-24">
        <SectionHero
          align="center"
          eyebrow={
            <>
              <Workflow className="h-3 w-3" />
              The full pipeline
            </>
          }
          title={
            <>
              From <span className="text-gradient">webhook</span> to inline
              review, in detail.
            </>
          }
          description="No black boxes. Every step of the pipeline is open source and explained below — fork it, modify it, host your own variant."
        />
        <WorkflowFlow />
      </Section>

      {/* DEEP DIVE STAGES */}
      <Section tone="light">
        <SectionHero
          tone="light"
          eyebrow={<>Stage 1</>}
          title={
            <>
              GitHub fires a webhook, n8n{" "}
              <span className="text-gradient">verifies the signature.</span>
            </>
          }
          description="When a PR opens, GitHub POSTs to /webhook/pr-review on your n8n instance. The first node verifies the X-Hub-Signature-256 header against your shared secret — without this, anyone could trigger reviews on your behalf."
        />
        <CodeBlock
          tone="light"
          title="n8n Code node — HMAC verify"
          code={`const crypto = require('crypto');
const signature = $input.first().headers['x-hub-signature-256'];
const payload = JSON.stringify($input.first().body);
const expected = 'sha256=' + crypto
  .createHmac('sha256', $env.GITHUB_WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');
if (signature !== expected) {
  throw new Error('Invalid HMAC — request rejected');
}
return $input.first();`}
        />
      </Section>

      <Section tone="dark">
        <SectionHero
          eyebrow={<>Stage 2</>}
          title={
            <>
              Fetch changed files, filter the noise,{" "}
              <span className="text-gradient">loop one at a time.</span>
            </>
          }
          description="n8n calls the GitHub API to get the list of changed files in the PR, then a Code node filters out package-lock.json, dist/*, *.min.js, and anything with > 500 lines changed. The rest go through a Split In Batches node — one file at a time."
        />
        <CodeBlock
          tone="dark"
          title="Filter logic"
          code={`const skipPatterns = [
  /package-lock\\.json$/,
  /yarn\\.lock$/,
  /\\.min\\.js$/,
  /^dist\\//,
  /^build\\//,
  /generated/i,
];
const files = $input.first().json.files
  .filter(f => !skipPatterns.some(p => p.test(f.filename)))
  .filter(f => f.changes < 500);
return files.map(f => ({ json: f }));`}
        />
      </Section>

      <Section tone="light">
        <SectionHero
          tone="light"
          eyebrow={<>Stage 3</>}
          title={
            <>
              Claude reads the diff{" "}
              <span className="text-gradient">in the context of the full file.</span>
            </>
          }
          description="For each file, we fetch the full content from the GitHub Contents API and send it alongside the diff. This gives Claude enough context to spot issues like 'this function is called from auth.py, so the missing null-check is a bigger deal than it looks.'"
        />
        <CodeBlock
          tone="light"
          title="Anthropic API call"
          code={`POST https://api.anthropic.com/v1/messages
Authorization: Bearer $ANTHROPIC_API_KEY
anthropic-version: 2023-06-01
content-type: application/json

{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 4096,
  "system": "<reviewer prompt — see prompts/reviewer.txt>",
  "messages": [{
    "role": "user",
    "content": "File: src/auth.py\\n\\nFull content:\\n<...>\\n\\nDiff:\\n<...>"
  }]
}

// Returns a JSON array of findings.`}
        />
      </Section>

      <Section tone="dark">
        <SectionHero
          eyebrow={<>Stage 4</>}
          title={
            <>
              Each finding becomes a GitHub{" "}
              <span className="text-gradient">inline review comment.</span>
            </>
          }
          description="The bot posts a review comment on the exact line in the diff, with a suggestion block the developer can commit with one click. Findings are also stored in Postgres so we can track accept rate and surface analytics."
        />
        <CodeBlock
          tone="dark"
          title="POST review comment"
          code={`POST /repos/{owner}/{repo}/pulls/{pr}/comments
Authorization: token $GITHUB_TOKEN

{
  "body": "🔒 **Critical · Security**\\n\\nSQL injection via f-string.\\n\\n\`\`\`suggestion\\ncursor.execute(\\"SELECT * FROM users WHERE id = %s\\", (user_id,))\\n\`\`\`\\n\\nUse parameterized queries.",
  "commit_id": "<head_sha>",
  "path": "src/auth.py",
  "line": 47,
  "side": "RIGHT"
}`}
        />
      </Section>

      <Section tone="light">
        <SectionHero
          tone="light"
          eyebrow={<>Stage 5</>}
          title={
            <>
              On re-push, only{" "}
              <span className="text-gradient">re-review what changed.</span>
            </>
          }
          description="When the developer pushes a fix, GitHub fires pull_request.synchronize. We compare the new diff against existing findings in Postgres. For each finding, if the line was touched AND Claude says it's fine now, we reply '✅ Resolved in <sha>' and mark it resolved."
        />
        <CodeBlock
          tone="light"
          title="Resolution detection"
          code={`for (const finding of existingFindings) {
  const wasTouched = diff.touchedLines.includes(finding.line_number);
  if (!wasTouched) continue;

  const stillAnIssue = await askClaude(
    \`Was this finding addressed? \${finding.message}\\n\\nNew code:\\n\${diff.afterContext}\`
  );

  if (!stillAnIssue) {
    await replyToComment(
      finding.github_comment_id,
      \`✅ Resolved in \${headSha.slice(0, 7)}\`
    );
    await markResolved(finding.id);
  }
}`}
        />
      </Section>

      {/* CTA */}
      <Section tone="dark">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 lg:p-10 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Ready to deploy?
          </h3>
          <p className="mt-3 text-sm lg:text-base text-slate-300/90 leading-relaxed">
            The full setup takes about 30 minutes — Railway for n8n + Postgres,
            Vercel for the frontend, GitHub webhook to glue it together.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/docs" className="btn-primary">
              <BookOpen className="h-4 w-4" />
              Read the deployment guide
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="https://github.com/Madhavan1009"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              <Github className="h-4 w-4" />
              View source
            </a>
          </div>
        </div>
      </Section>

      <MarketingFooter />
    </div>
  );
}

function CodeBlock({
  title,
  code,
  tone,
}: {
  title: string;
  code: string;
  tone: "dark" | "light";
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={
        "rounded-2xl overflow-hidden border " +
        (isDark
          ? "border-white/[0.08] bg-navy-950/80"
          : "border-slate-200 bg-white")
      }
    >
      <div
        className={
          "px-4 py-2 flex items-center gap-2 border-b text-xs font-mono " +
          (isDark
            ? "border-white/[0.06] text-slate-400 bg-white/[0.02]"
            : "border-slate-200 text-slate-500 bg-slate-50")
        }
      >
        <span className="h-2 w-2 rounded-full bg-rose-400/70" />
        <span className="h-2 w-2 rounded-full bg-amber-300/70" />
        <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
        <span className="ml-2">{title}</span>
      </div>
      <pre
        className={
          "p-4 text-[12.5px] leading-6 overflow-x-auto whitespace-pre mono " +
          (isDark ? "text-slate-200" : "text-slate-800")
        }
      >
        {code}
      </pre>
    </div>
  );
}
