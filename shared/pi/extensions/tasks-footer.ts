import * as fs from "node:fs";
import * as path from "node:path";
import type { AssistantMessage } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

function formatCwd(cwd: string): string {
	const home = process.env.HOME || process.env.USERPROFILE;
	if (home && (cwd === home || cwd.startsWith(home + path.sep))) {
		return `~${cwd.slice(home.length)}`;
	}
	return cwd;
}

function currentCwd(ctx: { sessionManager: { getCwd(): string } }): string {
	try {
		return formatCwd(ctx.sessionManager.getCwd());
	} catch {
		return formatCwd(process.cwd());
	}
}

function sessionNameOf(ctx: { sessionManager: { getSessionName(): string | undefined } }): string | undefined {
	try {
		return ctx.sessionManager.getSessionName();
	} catch {
		return undefined;
	}
}

interface Tasks {
	current: string;
	next: string | null;
}

function loadTasks(): Tasks {
	try {
		const lines = fs
			.readFileSync(path.join(process.cwd(), "TASKS.md"), "utf-8")
			.split("\n")
			.map((l) => l.trim())
			.filter((l) => l.length > 0 && !l.startsWith("#") && !l.startsWith("<!--"));
		return {
			current: lines[0] ?? "TASKS.md が空",
			next: lines[1] ?? null,
		};
	} catch {
		return { current: "TASKS.md なし", next: null };
	}
}

export default function (pi: ExtensionAPI) {
	let tasks = loadTasks();

	pi.on("turn_start", async () => {
		tasks = loadTasks();
	});

	pi.on("session_start", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		tasks = loadTasks();
		ctx.ui.setFooter((tui, theme, footerData) => {
			const unsub = footerData.onBranchChange(() => tui.requestRender());
			return {
				dispose: unsub,
				invalidate() {},
				render(width: number): string[] {
					let input = 0,
						output = 0,
						cost = 0;
					for (const e of ctx.sessionManager.getBranch()) {
						if (e.type === "message" && e.message.role === "assistant") {
							const m = e.message as AssistantMessage;
							input += m.usage?.input ?? 0;
							output += m.usage?.output ?? 0;
							cost += m.usage?.cost?.total ?? 0;
						}
					}
					const fmt = (n: number) => (n < 1000 ? `${n}` : `${(n / 1000).toFixed(1)}k`);
					const taskText = tasks.next ? `今: ${tasks.current} → 次: ${tasks.next}` : `今: ${tasks.current}`;
					const taskLine = truncateToWidth(theme.fg("accent", taskText), width, theme.fg("dim", "..."));
					const mid = theme.fg("dim", `↑${fmt(input)} ↓${fmt(output)} $${cost.toFixed(3)}`);
					const right = theme.fg("dim", ctx.model?.id ?? "no-model");
					const pad = " ".repeat(Math.max(1, width - visibleWidth(mid) - visibleWidth(right) - 1));
					const statsLine = truncateToWidth(`${mid}${pad}${right}`, width);
					let pwd = currentCwd(ctx);
					const branch = footerData.getGitBranch();
					if (branch) pwd += ` (${branch})`;
					const name = sessionNameOf(ctx);
					if (name) pwd += ` • ${name}`;
					const pwdLine = truncateToWidth(theme.fg("dim", pwd), width, theme.fg("dim", "..."));
					return [pwdLine, taskLine, statsLine];
				},
			};
		});
	});
}
