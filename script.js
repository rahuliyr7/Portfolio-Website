const GITHUB_USERNAME = "rahuliyr7";

// Hand-picked, "actually worth showing" repos — not every repo in the account
// (class assignments and forks are excluded on purpose).
const FEATURED_REPOS = ["prompt-injection-scanner", "Security-Log-Analyzer"];

// Fallback descriptions for repos whose GitHub description field is empty.
const DESCRIPTION_OVERRIDES = {
    "Security-Log-Analyzer":
        "Python analyzer for Cowrie honeypot JSON logs — surfaces credential patterns, attacker IPs, and attack timing.",
};

document.addEventListener("DOMContentLoaded", loadGitHubProjects);

async function loadGitHubProjects() {
    const grid = document.getElementById("github-grid");
    const status = document.getElementById("github-status");

    try {
        const repos = await Promise.all(
            FEATURED_REPOS.map(async (name) => {
                const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${name}`);
                if (!res.ok) throw new Error(`GitHub API responded ${res.status} for ${name}`);
                return res.json();
            })
        );

        grid.innerHTML = repos.map(repoCard).join("");
        status.innerHTML = `<span class="pulse-dot" style="display:inline-block;margin-right:0.4rem;"></span>Hand-picked projects · live stats from GitHub`;
    } catch (err) {
        status.textContent = "Live feed unavailable right now — see the project write-ups below.";
    }
}

function repoCard(repo) {
    const override = DESCRIPTION_OVERRIDES[repo.name];
    const desc = escapeHTML(override || repo.description || "No description provided.");
    return `
        <a class="repo-card" href="${repo.html_url}" target="_blank" rel="noopener">
            <div class="repo-card-top">
                <span class="repo-name">${escapeHTML(repo.name)}</span>
                <span class="pulse-dot" title="Recently active"></span>
            </div>
            <p class="repo-desc">${desc}</p>
            <div class="repo-meta">
                ${repo.language ? `<span class="repo-lang"><span class="lang-dot"></span>${escapeHTML(repo.language)}</span>` : ""}
                <span>★ ${repo.stargazers_count}</span>
                <span>Updated ${timeAgo(repo.pushed_at)}</span>
            </div>
        </a>`;
}

function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
    const units = [
        ["year", 31536000],
        ["month", 2592000],
        ["week", 604800],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
    ];
    for (const [name, secs] of units) {
        const val = Math.floor(seconds / secs);
        if (val >= 1) return `${val} ${name}${val > 1 ? "s" : ""} ago`;
    }
    return "just now";
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
